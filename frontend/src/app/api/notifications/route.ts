import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/auth/jwt";

interface NotificationItem {
  id: string;
  title: string;
  detail: string;
  time: string;
  category: "lead" | "agent" | "project" | "billing" | "system";
  unread: boolean;
  href: string;
}

// In-memory / session store for notification acknowledgement in current runtime
let runtimeNotifications: NotificationItem[] = [];

export async function GET(req: NextRequest) {
  const auth = await requireApiAuth(req);
  if (auth.error) return auth.error;

  const unreadCount = runtimeNotifications.filter((n) => n.unread).length;
  return NextResponse.json({
    notifications: runtimeNotifications,
    unreadCount,
  });
}

export async function POST(request: NextRequest) {
  const auth = await requireApiAuth(request);
  if (auth.error) return auth.error;

  try {
    const body = await request.json();
    if (body.action === "mark-all-read") {
      runtimeNotifications = runtimeNotifications.map((n) => ({ ...n, unread: false }));
      return NextResponse.json({ success: true, unreadCount: 0 });
    }
    if (body.action === "mark-read" && body.id) {
      runtimeNotifications = runtimeNotifications.map((n) =>
        n.id === body.id ? { ...n, unread: false } : n
      );
      const unreadCount = runtimeNotifications.filter((n) => n.unread).length;
      return NextResponse.json({ success: true, unreadCount });
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false }, { status: 400 });
  }
}
