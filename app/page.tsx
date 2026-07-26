"use client";

import { Suspense } from "react";
import Image from "next/image";
import { useQueryState } from "nuqs";
import { Hero } from "@/components/hero";
import { SubmissionsList } from "@/components/submissions-list";
import { UserProfileBadge } from "@/components/user-profile-badge";

function HomeContent() {
  const [searchedUsername, setSearchedUsername] = useQueryState("username");

  return (
    <div className="min-h-screen flex flex-col justify-between bg-zinc-50 dark:bg-zinc-955 text-zinc-900 font-sans transition-colors duration-300">

      <main className="flex-1 flex flex-col justify-start w-full">
        {searchedUsername ? (
          <SubmissionsList
            username={searchedUsername}
            onBack={() => setSearchedUsername(null)}
          />
        ) : (
          <Hero onSearch={(username) => setSearchedUsername(username)} />
        )}
      </main>

      {/* Global Footer */}
      <footer className="w-full text-center py-4 text-xs text-zinc-450 dark:text-zinc-600 border-t border-zinc-200/10 dark:border-zinc-800/35 bg-white/40 dark:bg-zinc-950/20 backdrop-blur-xs z-20">
        <span>© {new Date().getFullYear()} Leetalysis. All rights reserved.</span>
      </footer>
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




