"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { Search, Loader2, ArrowRight } from "lucide-react";

interface HeroProps {
  onSearch: (username: string) => void;
  sidebarToggle?: React.ReactNode;
}

export function Hero({ onSearch, sidebarToggle }: HeroProps) {
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const trimmed = username.trim();
    if (!trimmed) {
      setError("Please enter a valid LeetCode username.");
      return;
    }

    setIsLoading(true);

    // Simulate search and analysis delay
    setTimeout(() => {
      setIsLoading(false);
      onSearch(trimmed);
    }, 1000);
  };


  return (
    <div className="relative flex w-full flex-1 flex-col items-center justify-center font-sans transition-colors duration-300 px-4">

      {/* Sidebar toggle — fixed top-right corner */}
      {sidebarToggle && (
        <div className="fixed top-4 right-4 z-40">
          {sidebarToggle}
        </div>
      )}

      {/* Main Hero Content */}
      <div className="flex flex-col items-center justify-center text-center max-w-xl mx-auto w-full">

        {/* Centered Logo */}
        <div className="relative mb-3 group cursor-pointer select-none">
          <Image
            src="/logo.png"
            alt="Leetalysis Logo"
            width={120}
            height={34}
            className="object-contain transition-transform duration-300 group-hover:scale-[1.02]"
            priority
          />
        </div>

        {/* Heading */}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-2 leading-tight font-heading">
          Leetalysis
        </h1>
        <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-md mb-6 leading-relaxed font-medium">
          Instant LeetCode Profile Analytics &amp; Submission Progress Tracker
        </p>

        {/* Search Form */}
        <form onSubmit={handleSubmit} aria-label="LeetCode profile search" className="w-full space-y-2">
          <div className="relative flex flex-col sm:flex-row items-stretch gap-2.5 p-2 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 shadow-md focus-within:ring-2 focus-within:ring-orange-500/20 focus-within:border-orange-500/40 dark:focus-within:border-orange-500/50 transition-all duration-300">
            <div className="relative flex-1 flex items-center">
              <Search className="absolute left-3.5 h-4.5 w-4.5 text-zinc-400 dark:text-zinc-500 pointer-events-none" />
              <Input
                type="text"
                placeholder="Enter LeetCode username..."
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (error) setError("");
                }}
                disabled={isLoading}
                className="w-full pl-10 pr-4 h-11 bg-transparent border-0 ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-zinc-800 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 outline-none text-base md:text-sm shadow-none"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="h-11 px-6 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-medium shadow-sm transition-all duration-300 flex items-center justify-center gap-2 group cursor-pointer active:scale-98 border-0"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4.5 w-4.5 animate-spin" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <span>Search</span>
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </>
              )}
            </Button>
          </div>

          {/* Validation/Error Message with smooth entry */}
          <div className="h-4">
            {error && (
              <p className="text-xs text-red-500 font-medium text-left px-2 animate-fade-in">
                {error}
              </p>
            )}
          </div>
        </form>

      </div>

    </div>
  );
}
