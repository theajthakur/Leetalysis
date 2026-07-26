"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Crown } from "lucide-react";
import { cn } from "@/lib/utils";

interface UserProfile {
  username: string;
  realName: string;
  avatar: string;
  isPremium: boolean;
  isSignedIn: boolean;
}

/**
 * Fetches the signed-in LeetCode account's profile from /api/leetcode?type=profile
 * and renders a compact avatar + name + username badge.
 * Silently hides itself if not signed in or on any error.
 */
export function UserProfileBadge() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchProfile() {
      try {
        // username param is required by the route guard but ignored for globalData
        const res = await fetch("/api/leetcode?username=_&type=profile");
        if (!res.ok) return;
        const data = await res.json();
        const status = data?.data?.userStatus;
        if (!cancelled && status?.isSignedIn) {
          setProfile(status);
        }
      } catch {
        // silently ignore — cookie may not be configured
      }
    }

    fetchProfile();
    return () => { cancelled = true; };
  }, []);

  if (!profile) return null;

  const initials = profile.realName
    ? profile.realName.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()
    : profile.username.slice(0, 2).toUpperCase();

  return (
    <div
      className={cn(
        "flex items-center gap-2.5 px-3 py-1.5 rounded-2xl border transition-all duration-300",
        "bg-white/70 dark:bg-zinc-900/70 backdrop-blur-sm",
        "border-zinc-200/70 dark:border-zinc-800/60",
        "shadow-sm hover:shadow-md hover:border-zinc-300/80 dark:hover:border-zinc-700/60"
      )}
    >
      {/* Avatar */}
      <div className="relative shrink-0">
        <div className="h-8 w-8 rounded-full overflow-hidden ring-2 ring-orange-400/40 bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-500 dark:text-zinc-400">
          {!imgError && profile.avatar ? (
            <Image
              src={profile.avatar}
              alt={profile.realName || profile.username}
              width={32}
              height={32}
              className="object-cover w-full h-full"
              onError={() => setImgError(true)}
              unoptimized
            />
          ) : (
            <span>{initials}</span>
          )}
        </div>

        {/* Premium crown badge */}
        {profile.isPremium && (
          <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-amber-400 flex items-center justify-center shadow-sm">
            <Crown className="h-2.5 w-2.5 text-amber-900" />
          </span>
        )}
      </div>

      {/* Text */}
      <div className="flex flex-col leading-tight min-w-0">
        <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-100 truncate max-w-[120px]">
          {profile.realName || profile.username}
        </span>
        <span className="text-[10px] text-zinc-400 dark:text-zinc-500 truncate max-w-[120px]">
          @{profile.username}
        </span>
      </div>
    </div>
  );
}
