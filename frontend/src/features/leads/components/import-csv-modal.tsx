"use client";

import { useState } from "react";
import { X, UploadCloud, FileText, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

interface ImportCSVModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: () => void;
}

export function ImportCSVModal({ isOpen, onClose, onImportComplete }: ImportCSVModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ imported: number; errors: string[] } | null>(null);

  if (!isOpen) return null;

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/leads/import", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Import failed");
      }

      setResult({ imported: data.imported, errors: data.errors || [] });
      if (data.imported > 0) {
        onImportComplete();
      }
    } catch (err: unknown) {
      setResult({
        imported: 0,
        errors: [err instanceof Error ? err.message : "Upload processing failed"],
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
    >
      <div className="relative w-full max-w-lg rounded-2xl bg-white border border-[#161f1b]/15 p-6 shadow-2xl text-[#101413]">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
          <h3 className="font-serif text-xl font-bold">Import Leads from CSV</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-black hover:bg-black/5"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleUpload} className="space-y-4 text-xs">
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-[#0da66c] transition-colors cursor-pointer relative bg-[#faf9f6]">
            <input
              type="file"
              accept=".csv"
              required
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <UploadCloud size={32} className="mx-auto text-gray-400 mb-2" />
            <div className="font-semibold text-gray-700">
              {file ? file.name : "Click or drag CSV file here"}
            </div>
            <p className="text-[11px] text-gray-500 mt-1">
              Supports columns: Business Name, Category, Location, Address, Phone, Email, Website, Rating
            </p>
          </div>

          {result && (
            <div className="p-3 rounded-lg bg-gray-50 border border-gray-200 space-y-2 text-xs">
              {result.imported > 0 && (
                <div className="flex items-center gap-1.5 text-green-700 font-bold">
                  <CheckCircle2 size={14} /> Successfully imported {result.imported} leads!
                </div>
              )}
              {result.errors.length > 0 && (
                <div className="text-red-600 space-y-1">
                  <div className="flex items-center gap-1 font-bold">
                    <AlertCircle size={14} /> {result.errors.length} row warning(s):
                  </div>
                  <ul className="list-disc pl-5 max-h-24 overflow-y-auto text-[11px]">
                    {result.errors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <span className="text-[11px] text-gray-500 flex items-center gap-1">
              <FileText size={12} /> Standard RFC CSV format
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-semibold"
              >
                Close
              </button>
              <button
                type="submit"
                disabled={!file || loading}
                className="px-5 py-2 rounded-lg bg-[#101513] text-white font-bold inline-flex items-center gap-1.5 disabled:opacity-50"
              >
                {loading ? <Loader2 size={14} className="animate-spin" /> : "Import File"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

