"use client";

import { Suspense, useState, useEffect } from "react";
import { useQueryState } from "nuqs";
import { Users, Star } from "lucide-react";
import { GithubIcon } from "@dev.icons/react";
import { Hero } from "@/components/hero";
import { SubmissionsList } from "@/components/submissions-list";
import { StudentsSidebar } from "@/components/students-sidebar";
import { cn } from "@/lib/utils";

/** Minimal pill-style GitHub button with star count */
function GithubStarButton() {
  const [stars, setStars] = useState<number | null>(null);

  useEffect(() => {
    fetch("https://api.github.com/repos/theajthakur/Leetalysis")
      .then((res) => res.json())
      .then((data) => {
        if (typeof data.stargazers_count === "number") {
          setStars(data.stargazers_count);
        }
      })
      .catch(() => {
        // Silently fail if offline or API rate-limited
      });
  }, []);

  return (
    <a
      href="https://github.com/theajthakur/Leetalysis"
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-700 hover:text-zinc-900 dark:hover:text-white transition-all duration-200 shadow-2xs group"
    >
      <GithubIcon className="h-3.5 w-3.5 text-zinc-800 dark:text-zinc-200" />
      <span>Star on GitHub</span>
      <span className="flex items-center gap-1 text-zinc-500 dark:text-zinc-400 pl-1.5 border-l border-zinc-200 dark:border-zinc-800 ml-0.5 font-medium">
        <Star className="h-3 w-3 fill-amber-400 text-amber-400 group-hover:scale-110 transition-transform duration-200" />
        <span>{stars !== null ? stars : "—"}</span>
      </span>
    </a>
  );
}

/** Minimal pill-style toggle switch (no extra shadcn dep needed) */
function SidebarToggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      title={checked ? "Close class roster" : "Open class roster"}
      className={cn(
        "group flex items-center gap-2 px-3 h-9 rounded-xl border text-xs font-medium transition-all duration-200 cursor-pointer select-none",
        checked
          ? "bg-orange-500 border-orange-500 text-white shadow-sm shadow-orange-500/30"
          : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700"
      )}
    >
      <Users className="h-3.5 w-3.5" />
      <span>Class Roster</span>
      {/* pill indicator */}
      <span
        className={cn(
          "relative inline-flex h-4 w-7 shrink-0 rounded-full border-2 transition-colors duration-200",
          checked
            ? "bg-white/30 border-white/50"
            : "bg-zinc-200 dark:bg-zinc-700 border-transparent"
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-2.5 w-2.5 rounded-full transition-all duration-200",
            checked
              ? "translate-x-2.5 bg-white"
              : "translate-x-0.5 bg-zinc-400 dark:bg-zinc-500"
          )}
        />
      </span>
    </button>
  );
}

function HomeContent() {
  const [searchedUsername, setSearchedUsername] = useQueryState("username");
  const [localData, setLocalData] = useQueryState("localdata");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isLocalData = localData === "true";

  const handleSelectStudent = (handle: string) => {
    setSearchedUsername(handle);
    setLocalData("true");
    // Close sidebar on mobile after selection
    if (window.innerWidth < 768) setSidebarOpen(false);
  };

  const handleBack = () => {
    setSearchedUsername(null);
    setLocalData(null);
  };

  return (
    <div
      className={cn(
        "flex flex-col bg-zinc-50 dark:bg-zinc-955 text-zinc-900 dark:text-zinc-50 font-sans transition-colors duration-300",
        searchedUsername ? "min-h-screen" : "h-screen max-h-screen overflow-hidden justify-between"
      )}
    >
      {/* Sidebar */}
      <StudentsSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onSelectStudent={handleSelectStudent}
      />

      {/* Main area — shifts right on md+ when sidebar is open */}
      <div
        className={cn(
          "flex flex-col flex-1 transition-all duration-300",
          searchedUsername ? "min-h-screen" : "h-full overflow-hidden justify-between",
          sidebarOpen ? "md:pl-72" : ""
        )}
      >
        <main
          className={cn(
            "flex-1 flex flex-col w-full",
            searchedUsername ? "justify-start" : "justify-center items-center overflow-hidden"
          )}
        >
          {searchedUsername ? (
            <SubmissionsList
              username={searchedUsername}
              onBack={handleBack}
              isSidebarOpen={sidebarOpen}
              rollNumber={
                isLocalData
                  ? (
                    // Look up roll number from localStorage if localdata=true
                    (() => {
                      if (typeof window === "undefined") return undefined;
                      try {
                        const stored = localStorage.getItem("leetalysis_students");
                        if (!stored) return undefined;
                        const students = JSON.parse(stored) as Array<{ handle: string; rollNumber: string }>;
                        return students.find((s) => s.handle === searchedUsername)?.rollNumber;
                      } catch { return undefined; }
                    })()
                  )
                  : undefined
              }
            />
          ) : (
            <Hero
              onSearch={(username) => {
                setLocalData(null);
                setSearchedUsername(username);
              }}
              sidebarToggle={
                <SidebarToggle
                  checked={sidebarOpen}
                  onChange={setSidebarOpen}
                />
              }
            />
          )}
        </main>

        {/* Footer */}
        <footer className="shrink-0 w-full border-t border-zinc-200/50 dark:border-zinc-800/50 bg-white/40 dark:bg-zinc-955/40 backdrop-blur-xs py-3 text-xs text-zinc-500 dark:text-zinc-400">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2.5">
            <span>© {new Date().getFullYear()} Leetalysis. All rights reserved.</span>
            <GithubStarButton />
          </div>
        </footer>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-955 text-zinc-500 font-sans">
        <div className="animate-pulse">Loading Leetalysis...</div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
