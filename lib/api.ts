import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from "axios";

// Define custom interface to keep track of retries on request config
interface RetryConfig extends InternalAxiosRequestConfig {
  __retryCount?: number;
}

const MAX_RETRIES = 3;
const INITIAL_DELAY_MS = 1000;

/**
 * Helper to strip surrounding quotes and whitespace from environment variables
 */
const cleanString = (val: string): string => {
  if (!val) return "";
  return val.trim().replace(/^["']|["']$/g, "");
};

/**
 * Custom Axios instance configured for LeetCode GraphQL API
 */
export const api: AxiosInstance = axios.create({
  baseURL: "https://leetcode.com/graphql/",
  headers: {
    "Content-Type": "text/plain",
    "User-Agent": "PostmanRuntime/7.54.0",
    "Accept": "*/*",
    "Accept-Encoding": "gzip, deflate, br",
    "Connection": "keep-alive",
  },
});

// Response interceptor to handle automatic retries on failure
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as RetryConfig;

    // If config is missing, pass the error along
    if (!config) {
      return Promise.reject(error);
    }

    config.__retryCount = config.__retryCount || 0;

    // We retry on network-level failures or rate-limiting/server errors (status 429 or >= 500)
    const isNetworkError = !error.response;
    const isServerError =
      error.response && (error.response.status >= 500 || error.response.status === 429);

    if ((isNetworkError || isServerError) && config.__retryCount < MAX_RETRIES) {
      config.__retryCount += 1;

      // Calculate exponential backoff delay (1s, 2s, 4s...)
      const backoffDelay = INITIAL_DELAY_MS * Math.pow(2, config.__retryCount - 1);

      console.warn(
        `[API] Request failed. Retrying (${config.__retryCount}/${MAX_RETRIES}) in ${backoffDelay}ms... Error: ${error.message}`
      );

      // Wait for backoff duration
      await new Promise((resolve) => setTimeout(resolve, backoffDelay));

      // Retry the request using the same instance configuration
      return api(config);
    }

    return Promise.reject(error);
  }
);

/**
 * Flexible wrapper function to query the LeetCode GraphQL API with custom payload and dynamic Referer.
 * 
 * @param query The GraphQL query string
 * @param variables Object containing the query variables
 * @param username The LeetCode username (optional; if provided, dynamically generates Referer header)
 * @returns The GraphQL API JSON response
 */
function getCookieValue(cookieStr: string, name: string): string | null {
  const match = cookieStr.match(new RegExp("(^|;)\\s*" + name + "\\s*=\\s*([^;]+)"));
  return match ? match[2] : null;
}

/**
 * Flexible wrapper function to query the LeetCode GraphQL API with custom payload and dynamic Referer.
 * 
 * @param query The GraphQL query string
 * @param variables Object containing the query variables
 * @param username The LeetCode username (optional; if provided, dynamically generates Referer header)
 * @param cookie The LeetCode session cookies (optional; if provided, overrides default env config)
 * @returns The GraphQL API JSON response
 */
export async function queryLeetCode<T = any>(
  query: string,
  variables: Record<string, any> = {},
  username?: string,
  cookie?: string
): Promise<T> {
  const headers: Record<string, string> = {};
  
  if (variables.submissionId) {
    headers["Referer"] = `https://leetcode.com/submissions/detail/${variables.submissionId}/`;
  } else if (username) {
    headers["Referer"] = `https://leetcode.com/u/${username}/`;
  } else {
    headers["Referer"] = "https://leetcode.com/";
  }

  // Construct the Cookie header dynamically from environment variables or custom cookies
  let activeCookie = cookie || "";
  
  if (!activeCookie) {
    const rawSession = process.env.LEETCODE_COOKIE || process.env.LEETCODE_SESSION || "";
    const rawCsrf = process.env.CSRF_TOKEN || "";
    const rawCfuvid = process.env.LEETCODE_CFUVID || process.env.CFUVID || "";
    
    const sessionToken = cleanString(rawSession);
    const csrfToken = cleanString(rawCsrf);
    const cfuvid = cleanString(rawCfuvid);
    
    const cookieParts: string[] = [];
    if (sessionToken) {
      if (sessionToken.includes("LEETCODE_SESSION=")) {
        cookieParts.push(sessionToken);
      } else {
        cookieParts.push(`LEETCODE_SESSION=${sessionToken}`);
      }
    }

    if (cfuvid && !sessionToken.includes("_cfuvid=")) {
      if (cfuvid.includes("_cfuvid=")) {
        cookieParts.push(cfuvid);
      } else {
        cookieParts.push(`_cfuvid=${cfuvid}`);
      }
    }
    
    if (csrfToken && !sessionToken.includes("csrftoken=")) {
      cookieParts.push(`csrftoken=${csrfToken}`);
    }
    
    activeCookie = cookieParts.join("; ");
  }

  if (activeCookie) {
    headers["Cookie"] = activeCookie;
    
    // Dynamically sync X-Csrftoken if csrftoken cookie exists, or fallback to environment CSRF_TOKEN
    const rawCsrfToken = getCookieValue(activeCookie, "csrftoken") || process.env.CSRF_TOKEN || "";
    const csrfTokenVal = cleanString(rawCsrfToken);
    if (csrfTokenVal) {
      headers["X-Csrftoken"] = csrfTokenVal;
    }
  } else if (process.env.CSRF_TOKEN) {
    headers["X-Csrftoken"] = cleanString(process.env.CSRF_TOKEN);
  }

  // Parse the operation name dynamically from the query
  const match = query.match(/^\s*(?:query|mutation|subscription)\s+(\w+)/i);
  const operationName = match ? match[1] : undefined;

  const response = await api.post(
    "",
    JSON.stringify({
      query,
      variables,
      operationName,
    }),
    {
      headers,
    }
  );

  return response.data;
}
