"use client";

import { useState } from "react";
import { X, Loader2 } from "lucide-react";

interface AddLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLeadCreated: () => void;
}

export function AddLeadModal({ isOpen, onClose, onLeadCreated }: AddLeadModalProps) {
  const [businessName, setBusinessName] = useState("");
  const [category, setCategory] = useState("Restaurant");
  const [location, setLocation] = useState("New Delhi");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [opportunityScore, setOpportunityScore] = useState(85);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName,
          category,
          location,
          address,
          phone,
          email: email || undefined,
          website: website || undefined,
          opportunityScore,
          status: "New",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create lead");
      }

      onLeadCreated();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error creating lead");
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
          <h3 className="font-serif text-xl font-bold">Add New Lead</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-black hover:bg-black/5"
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-2.5 rounded-lg bg-red-50 text-red-700 text-xs">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold mb-1">Business Name *</label>
            <input
              type="text"
              required
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="e.g. Imperial Spice Bistro"
              className="w-full px-3 py-1.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#0d251f]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-gray-300 bg-white"
              >
                <option>Restaurant</option>
                <option>Retail</option>
                <option>Beauty</option>
                <option>Healthcare</option>
                <option>Fitness</option>
                <option>Hotel</option>
                <option>Automotive</option>
                <option>Cafe</option>
                <option>Other</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold mb-1">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-gray-300"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold mb-1">Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. Connaught Place, New Delhi"
              className="w-full px-3 py-1.5 rounded-lg border border-gray-300"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold mb-1">Phone</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 00000"
                className="w-full px-3 py-1.5 rounded-lg border border-gray-300"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="info@business.example"
                className="w-full px-3 py-1.5 rounded-lg border border-gray-300"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold mb-1">Website URL</label>
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-1.5 rounded-lg border border-gray-300"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">Opportunity Score (0-100)</label>
              <input
                type="number"
                min={0}
                max={100}
                value={opportunityScore}
                onChange={(e) => setOpportunityScore(Number(e.target.value))}
                className="w-full px-3 py-1.5 rounded-lg border border-gray-300"
              />
            </div>
          </div>

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-lg bg-[#101513] text-white font-bold inline-flex items-center gap-1.5"
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : "Save Lead"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

