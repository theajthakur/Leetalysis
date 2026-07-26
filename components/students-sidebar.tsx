"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import { Upload, X, Users, AlertCircle, CheckCircle2, Trash2, Plus, UserPlus, Search } from "lucide-react";
import { getStudents, saveStudents, clearStudents, parseCSV, type Student } from "@/lib/local-students";
import { cn } from "@/lib/utils";

interface StudentsSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectStudent: (handle: string) => void;
}

export function StudentsSidebar({ isOpen, onClose, onSelectStudent }: StudentsSidebarProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [uploadStatus, setUploadStatus] = useState<{ ok: boolean; message: string } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Form state for adding a single row manually
  const [isAddingRow, setIsAddingRow] = useState(false);
  const [newName, setNewName] = useState("");
  const [newRoll, setNewRoll] = useState("");
  const [newHandle, setNewHandle] = useState("");
  const [addError, setAddError] = useState("");

  // Search state across all three columns (name, roll, handle)
  const [searchQuery, setSearchQuery] = useState("");

  // Load from localStorage on mount
  useEffect(() => {
    setStudents(getStudents());
  }, []);

  const filteredStudents = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return students;
    return students.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.rollNumber.toLowerCase().includes(q) ||
        s.handle.toLowerCase().includes(q)
    );
  }, [students, searchQuery]);

  const handleFile = (file: File) => {
    setUploadStatus(null);

    if (!file.name.toLowerCase().endsWith(".csv")) {
      setUploadStatus({ ok: false, message: "Only .csv files are accepted." });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const result = parseCSV(text);
      if (!result.ok) {
        setUploadStatus({ ok: false, message: result.error! });
        return;
      }
      saveStudents(result.students!);
      setStudents(result.students!);
      setUploadStatus({
        ok: true,
        message: `Loaded ${result.students!.length} student${result.students!.length !== 1 ? "s" : ""} successfully.`,
      });
    };
    reader.readAsText(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = ""; // allow re-uploading same file
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleClear = () => {
    clearStudents();
    setStudents([]);
    setUploadStatus(null);
    setIsAddingRow(false);
    setSearchQuery("");
  };

  const handleAddRow = (e: React.FormEvent) => {
    e.preventDefault();
    setAddError("");

    const name = newName.trim();
    const rollNumber = newRoll.trim();
    const handle = newHandle.trim();

    if (!name || !rollNumber || !handle) {
      setAddError("Please fill in all 3 fields: Name, Roll Number, and Handle.");
      return;
    }

    const updated = [...students, { name, rollNumber, handle }];
    saveStudents(updated);
    setStudents(updated);

    // Reset form
    setNewName("");
    setNewRoll("");
    setNewHandle("");
    setIsAddingRow(false);
    setUploadStatus({
      ok: true,
      message: `Added "${name}" to roster.`,
    });
  };

  const handleRemoveRow = (studentToRemove: Student) => {
    const updated = students.filter(
      (s) => !(s.rollNumber === studentToRemove.rollNumber && s.handle === studentToRemove.handle)
    );
    saveStudents(updated);
    setStudents(updated);
  };

  return (
    <>
      {/* Backdrop for mobile / overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-[2px] md:hidden"
          onClick={onClose}
          aria-hidden
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full z-40 flex flex-col",
          "w-full sm:w-72 bg-white dark:bg-zinc-955 border-r border-zinc-200 dark:border-zinc-800/70",
          "shadow-xl transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-3.5 py-3 border-b border-zinc-100 dark:border-zinc-800/60 shrink-0">

          <div className="flex items-center gap-1">
            {/* Add row button */}
            <button
              type="button"
              onClick={() => {
                setIsAddingRow(!isAddingRow);
                setAddError("");
              }}
              title="Add a student row"
              className={cn(
                "h-7 px-2 rounded-lg flex items-center gap-1 text-xs font-medium border transition-colors",
                isAddingRow
                  ? "bg-orange-500 text-white border-orange-500"
                  : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 border-zinc-200 dark:border-zinc-800"
              )}
            >
              <Plus className="h-3 w-3" />
              <span>Add</span>
            </button>

            {/* Upload CSV button */}
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              title="Upload CSV"
              className="h-7 px-2 rounded-lg flex items-center gap-1 text-xs font-medium text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-500/10 border border-orange-200/60 dark:border-orange-500/20 transition-colors"
            >
              <Upload className="h-3 w-3" />
              <span>CSV</span>
            </button>
            <input
              ref={fileRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleInputChange}
            />

            {/* Clear button */}
            {students.length > 0 && (
              <button
                type="button"
                onClick={handleClear}
                title="Clear all students"
                className="h-7 w-7 rounded-lg flex items-center justify-center text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}

            {/* Close sidebar button */}
            <button
              type="button"
              onClick={onClose}
              title="Close sidebar"
              className="h-7 w-7 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors ml-0.5"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* ── Add Row Form ── */}
        {isAddingRow && (
          <form
            onSubmit={handleAddRow}
            className="m-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800 flex flex-col gap-2.5 shrink-0 animate-in fade-in slide-in-from-top-2 duration-200"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                <UserPlus className="h-3.5 w-3.5 text-orange-500" />
                Add Student
              </span>
              <button
                type="button"
                onClick={() => setIsAddingRow(false)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            {addError && (
              <p className="text-[11px] text-red-500 font-medium leading-tight">
                {addError}
              </p>
            )}

            <div className="space-y-1.5">
              <input
                type="text"
                placeholder="Name (e.g. Aarav Sharma)"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full h-8 px-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-955 text-xs text-zinc-800 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 outline-none focus:border-orange-500"
              />
              <input
                type="text"
                placeholder="Roll Number (e.g. 24BCS001)"
                value={newRoll}
                onChange={(e) => setNewRoll(e.target.value)}
                className="w-full h-8 px-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-955 text-xs text-zinc-800 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 outline-none focus:border-orange-500 font-mono"
              />
              <input
                type="text"
                placeholder="LeetCode Handle (e.g. aaravcodes)"
                value={newHandle}
                onChange={(e) => setNewHandle(e.target.value)}
                className="w-full h-8 px-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-955 text-xs text-zinc-800 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 outline-none focus:border-orange-500 font-mono"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="submit"
                className="flex-1 h-7 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                Save Row
              </button>
              <button
                type="button"
                onClick={() => setIsAddingRow(false)}
                className="h-7 px-3 rounded-lg border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* ── Search Bar across 3 columns ── */}
        {students.length > 0 && (
          <div className="px-3 pt-2.5 pb-1 shrink-0">
            <div className="relative flex items-center">
              <Search className="absolute left-2.5 h-3.5 w-3.5 text-zinc-400 dark:text-zinc-500 pointer-events-none" />
              <input
                type="text"
                placeholder="Search name, roll, handle..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-7 h-7.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-xs text-zinc-800 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 outline-none focus:border-orange-500 transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── Status feedback ── */}
        {uploadStatus && !isAddingRow && (
          <div
            className={cn(
              "mx-3 mt-2 px-3 py-2 rounded-xl text-xs flex items-start gap-2 border shrink-0",
              uploadStatus.ok
                ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200/60 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400"
                : "bg-red-50 dark:bg-red-500/10 border-red-200/60 dark:border-red-500/20 text-red-600 dark:text-red-400"
            )}
          >
            {uploadStatus.ok ? (
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
            )}
            <span className="leading-snug">{uploadStatus.message}</span>
            <button
              type="button"
              onClick={() => setUploadStatus(null)}
              className="ml-auto shrink-0 opacity-60 hover:opacity-100"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        )}

        {/* ── Drop zone hint (only when empty and not adding row) ── */}
        {students.length === 0 && !isAddingRow && (
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={cn(
              "mx-3 mt-3 rounded-xl border-2 border-dashed py-8 flex flex-col items-center gap-2 transition-colors shrink-0 cursor-pointer",
              isDragging
                ? "border-orange-400 bg-orange-50 dark:bg-orange-500/10"
                : "border-zinc-200 dark:border-zinc-800 hover:border-orange-300 dark:hover:border-orange-500/40"
            )}
            onClick={() => fileRef.current?.click()}
          >
            <Upload className="h-6 w-6 text-zinc-300 dark:text-zinc-600" />
            <p className="text-xs text-zinc-400 dark:text-zinc-500 text-center px-4">
              Drop a CSV, upload, or click Add above<br />
              <span className="text-[10px]">Needs: Name, Roll Number, Handle</span>
            </p>
          </div>
        )}

        {/* ── Student table ── */}
        {students.length > 0 && (
          <div className="flex-1 overflow-y-auto mt-2 min-h-0">
            {filteredStudents.length === 0 ? (
              <p className="text-xs text-zinc-400 dark:text-zinc-500 text-center py-8">
                No matching students found.
              </p>
            ) : (
              <table className="w-full text-xs border-collapse">
                <thead className="sticky top-0 bg-white dark:bg-zinc-955 z-10">
                  <tr className="border-b border-zinc-100 dark:border-zinc-800/60 text-[10px] uppercase tracking-wider text-zinc-400 dark:text-zinc-600 font-semibold">
                    <th className="py-2.5 px-3 text-left">Name</th>
                    <th className="py-2.5 px-1.5 text-left whitespace-nowrap">Roll No</th>
                    <th className="py-2.5 px-1.5 text-left">Handle</th>
                    <th className="py-2.5 pr-2 pl-0 w-6"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((s, idx) => (
                    <tr
                      key={`${s.rollNumber}-${s.handle}-${idx}`}
                      onClick={() => onSelectStudent(s.handle)}
                      className="group cursor-pointer border-b border-zinc-50 dark:border-zinc-900 hover:bg-orange-50/60 dark:hover:bg-orange-500/[0.06] transition-colors"
                    >
                      <td className="py-2.5 px-3 font-medium text-zinc-800 dark:text-zinc-200 max-w-[75px] truncate">
                        {s.name}
                      </td>
                      <td className="py-2.5 px-1.5 text-zinc-500 dark:text-zinc-400 font-mono text-[11px]">
                        {s.rollNumber}
                      </td>
                      <td className="py-2.5 px-1.5 text-orange-600 dark:text-orange-400 font-mono truncate max-w-[65px]">
                        {s.handle}
                      </td>
                      <td className="py-2.5 pr-2 pl-0 text-right w-6">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveRow(s);
                          }}
                          title="Remove student"
                          className="opacity-0 group-hover:opacity-100 p-1 text-zinc-400 hover:text-red-500 dark:hover:text-red-400 transition-opacity rounded"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </aside>
    </>
  );
}
