"use client";

import { useState } from "react";
import { MessageSquare, Phone, Mail, Calendar, FileText, Send, Loader2 } from "lucide-react";

interface NoteItem {
  _id: string;
  author: string;
  authorRole: string;
  content: string;
  type: "note" | "call" | "email" | "meeting" | "audit";
  createdAt: string;
}

interface NotesTabProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  lead: any;
  notes: NoteItem[];
  onNoteAdded: () => void;
}

export function NotesTab({ lead, notes, onNoteAdded }: NotesTabProps) {
  const [content, setContent] = useState("");
  const [type, setType] = useState<"note" | "call" | "email" | "meeting" | "audit">("note");
  const [loading, setLoading] = useState(false);

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/leads/${lead.slug || lead._id}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, type }),
      });

      if (res.ok) {
        setContent("");
        onNoteAdded();
      }
    } catch (err) {
      console.error("Failed to add note:", err);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (t: string) => {
    switch (t) {
      case "call":
        return <Phone size={13} className="text-blue-600" />;
      case "email":
        return <Mail size={13} className="text-purple-600" />;
      case "meeting":
        return <Calendar size={13} className="text-rose-600" />;
      case "audit":
        return <FileText size={13} className="text-[#0da66c]" />;
      default:
        return <MessageSquare size={13} className="text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Add note input card */}
      <div className="p-5 bg-white rounded-xl border border-gray-200/80 shadow-2xs space-y-3">
        <h3 className="text-sm font-bold text-[#101413]">Add Activity Note</h3>
        <form onSubmit={handleAddNote} className="space-y-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-gray-500 font-semibold">Activity Type:</span>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as typeof type)}
              className="px-2.5 py-1 border border-gray-300 rounded-lg bg-white font-semibold text-xs text-gray-700"
            >
              <option value="note">General Note</option>
              <option value="call">Phone / WhatsApp Call</option>
              <option value="meeting">Discovery Meeting</option>
              <option value="email">Email Outreach</option>
              <option value="audit">Website Audit</option>
            </select>
          </div>

          <textarea
            rows={3}
            required
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Log conversation notes, objections, client requests or proposal terms..."
            className="w-full p-3 rounded-lg border border-gray-300 bg-[#faf9f6] text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0d251f]"
          />

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading || !content.trim()}
              className="px-4 py-2 rounded-lg bg-[#101513] hover:bg-[#1a2c27] text-white font-bold inline-flex items-center gap-1.5 shadow disabled:opacity-50"
            >
              {loading ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
              <span>Save Note</span>
            </button>
          </div>
        </form>
      </div>

      {/* Chronological list of notes */}
      <div className="p-5 bg-white rounded-xl border border-gray-200/80 shadow-2xs space-y-3">
        <h4 className="text-xs font-bold text-gray-800">Activity History ({notes.length})</h4>

        {notes.length === 0 ? (
          <p className="text-xs text-gray-400 py-4 text-center">No activity notes recorded yet.</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {notes.map((note) => (
              <div key={note._id} className="py-3 flex items-start gap-3 text-xs">
                <span className="w-7 h-7 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center shrink-0 mt-0.5">
                  {getIcon(note.type)}
                </span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-[#101413]">{note.author}</span>
                    <span className="text-[10px] text-gray-400">({note.authorRole})</span>
                    <span className="text-gray-300">•</span>
                    <span className="text-[10px] text-gray-400">
                      {new Date(note.createdAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <p className="text-[#353b38] leading-relaxed whitespace-pre-wrap">{note.content}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

