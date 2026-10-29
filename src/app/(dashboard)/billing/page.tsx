"use client";

import { useState } from "react";
import {
  CreditCard,
  CheckCircle2,
  Clock,
  TrendingUp,
  Plus,
  FileText,
  DollarSign,
  AlertCircle,
  MoreHorizontal,
  ChevronDown,
  Download,
  Calendar,
  Layers,
  ArrowRight,
  TrendingDown,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const REVENUE_OVER_TIME = [
  { month: "Jan", billed: 420000, paid: 350000, outstanding: 70000 },
  { month: "Feb", billed: 680000, paid: 520000, outstanding: 160000 },
  { month: "Mar", billed: 890000, paid: 710000, outstanding: 180000 },
  { month: "Apr", billed: 980000, paid: 820000, outstanding: 160000 },
  { month: "May", billed: 1100000, paid: 910000, outstanding: 190000 },
  { month: "Jun", billed: 1180000, paid: 960000, outstanding: 220000 },
  { month: "Jul", billed: 1250000, paid: 1020000, outstanding: 230000 },
  { month: "Aug", billed: 1320000, paid: 1080000, outstanding: 240000 },
  { month: "Sep", billed: 1380000, paid: 1120000, outstanding: 260000 },
  { month: "Oct", billed: 1450000, paid: 1190000, outstanding: 260000 },
  { month: "Nov", billed: 1520000, paid: 1250000, outstanding: 270000 },
  { month: "Dec", billed: 1620000, paid: 1320000, outstanding: 300000 },
];

const INVOICE_STATUS_DATA = [
  { name: "Paid", count: 16, pct: 57, color: "#10B981" },
  { name: "Pending", count: 6, pct: 21, color: "#F59E0B" },
  { name: "Overdue", count: 3, pct: 11, color: "#EF4444" },
  { name: "Draft", count: 2, pct: 7, color: "#8B5CF6" },
  { name: "Cancelled", count: 1, pct: 4, color: "#6B7280" },
];

const PAYMENT_METHODS_DATA = [
  { name: "Bank Transfer", pct: 42, color: "#3B82F6" },
  { name: "UPI", pct: 28, color: "#10B981" },
  { name: "Credit Card", pct: 16, color: "#F59E0B" },
  { name: "Razorpay", pct: 10, color: "#EC4899" },
  { name: "Other", pct: 4, color: "#9CA3AF" },
];

const RECENT_INVOICES = [
  { id: "INV-2024-028", client: "Spice Villa Restaurant", project: "Website Development", amount: "₹1,20,000", status: "Paid", issueDate: "Mar 15, 2024", dueDate: "Mar 30, 2024" },
  { id: "INV-2024-027", client: "Glow & Grace Salon", project: "Website + SEO", amount: "₹80,000", status: "Pending", issueDate: "Mar 12, 2024", dueDate: "Apr 12, 2024" },
  { id: "INV-2024-026", client: "CityCare Clinic", project: "Website Development", amount: "₹1,60,000", status: "Paid", issueDate: "Mar 10, 2024", dueDate: "Mar 25, 2024" },
  { id: "INV-2024-025", client: "FitZone Gym", project: "Website + Google Ads", amount: "₹1,20,000", status: "Overdue", issueDate: "Mar 05, 2024", dueDate: "Mar 20, 2024" },
  { id: "INV-2024-024", client: "Hotel Bliss Inn", project: "Website Development", amount: "₹1,00,000", status: "Paid", issueDate: "Mar 02, 2024", dueDate: "Mar 17, 2024" },
];

const UPCOMING_PAYMENTS = [
  { client: "Glow & Grace Salon", amount: "₹80,000", dueDate: "Apr 12, 2024", status: "Pending" },
  { client: "FitZone Gym", amount: "₹1,20,000", dueDate: "Mar 20, 2024", status: "Overdue" },
  { client: "Urban Taste Cafe", amount: "₹60,000", dueDate: "Mar 25, 2024", status: "Pending" },
  { client: "Elite Dental Care", amount: "₹90,000", dueDate: "Apr 05, 2024", status: "Pending" },
  { client: "The Fashion Hub", amount: "₹70,000", dueDate: "Apr 10, 2024", status: "Pending" },
];

const TOP_CLIENTS_REVENUE = [
  { client: "Spice Villa Restaurant", totalBilled: "₹2,40,000", paid: "₹2,40,000", outstanding: "₹0", invoices: 4 },
  { client: "Glow & Grace Salon", totalBilled: "₹1,80,000", paid: "₹1,20,000", outstanding: "₹60,000", invoices: 3 },
  { client: "CityCare Clinic", totalBilled: "₹1,60,000", paid: "₹1,60,000", outstanding: "₹0", invoices: 2 },
  { client: "FitZone Gym", totalBilled: "₹1,20,000", paid: "₹0", outstanding: "₹1,20,000", invoices: 1 },
  { client: "Hotel Bliss Inn", totalBilled: "₹1,00,000", paid: "₹1,00,000", outstanding: "₹0", invoices: 1 },
];

const SERVICE_REVENUE = [
  { name: "Website Development", pct: 42, color: "bg-blue-500" },
  { name: "SEO & Local SEO", pct: 18, color: "bg-emerald-500" },
  { name: "Social Media Management", pct: 14, color: "bg-amber-500" },
  { name: "Google Ads Setup", pct: 10, color: "bg-purple-500" },
  { name: "Maintenance & Support", pct: 8, color: "bg-pink-500" },
  { name: "Others", pct: 8, color: "bg-gray-400" },
];

export default function BillingPage() {
  const [timeframe, setTimeframe] = useState("Monthly");

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Paid":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Pending":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "Overdue":
        return "bg-rose-50 text-rose-700 border-rose-200";
      case "Draft":
        return "bg-purple-50 text-purple-700 border-purple-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="space-y-5">
      {/* Breadcrumb & Header */}
      <div>
        <div className="text-[11px] font-semibold text-gray-400 mb-1">
          Billing &gt; Overview
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#171918] tracking-tight">
              Billing Overview
            </h1>
            <p className="text-xs text-[#68717D] mt-0.5">
              Manage invoices, track payments, and monitor your revenue and expenses.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button className="h-8 px-3 rounded-lg border border-[#E7E7E2] bg-white hover:bg-gray-50 text-xs font-semibold text-gray-700 shadow-2xs">
              Generate Invoice
            </button>
            <button className="h-8 px-3.5 rounded-lg bg-[#171918] hover:bg-[#232B29] text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-xs transition-colors">
              <Plus size={14} />
              <span>Create Invoice</span>
            </button>
          </div>
        </div>
      </div>

      {/* 5 Top KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="p-4 rounded-xl bg-white border border-[#E7E7E2] shadow-2xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100 font-bold text-sm">
              ₹
            </span>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-bold text-[#171918]">₹12,80,000</span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded border border-emerald-200">
                  ↑ 52%
                </span>
              </div>
              <div className="text-[11px] text-[#68717D]">Total Billed</div>
            </div>
          </div>
          <div className="w-12 h-5 opacity-70 hidden xl:block">
            <svg viewBox="0 0 50 20" className="w-full h-full">
              <path d="M 0 16 Q 15 18 25 10 T 50 4" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#E7E7E2] shadow-2xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
              <FileText size={16} />
            </span>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-bold text-[#171918]">₹10,40,000</span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded border border-emerald-200">
                  ↑ 38%
                </span>
              </div>
              <div className="text-[11px] text-[#68717D]">Total Paid</div>
            </div>
          </div>
          <div className="w-12 h-5 opacity-70 hidden xl:block">
            <svg viewBox="0 0 50 20" className="w-full h-full">
              <path d="M 0 18 Q 15 20 25 12 T 50 3" fill="none" stroke="#3568E8" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#E7E7E2] shadow-2xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
              <Clock size={16} />
            </span>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-bold text-[#171918]">₹2,40,000</span>
                <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-1 py-0.2 rounded border border-rose-200">
                  ↓ 12%
                </span>
              </div>
              <div className="text-[11px] text-[#68717D]">Outstanding</div>
            </div>
          </div>
          <div className="w-12 h-5 opacity-70 hidden xl:block">
            <svg viewBox="0 0 50 20" className="w-full h-full">
              <path d="M 0 6 Q 25 10 35 15 T 50 18" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#E7E7E2] shadow-2xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100">
              <FileText size={16} />
            </span>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-bold text-[#171918]">28</span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded border border-emerald-200">
                  ↑ 27%
                </span>
              </div>
              <div className="text-[11px] text-[#68717D]">Total Invoices</div>
            </div>
          </div>
          <div className="w-12 h-5 opacity-70 hidden xl:block">
            <svg viewBox="0 0 50 20" className="w-full h-full">
              <path d="M 0 16 Q 20 18 30 8 T 50 2" fill="none" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#E7E7E2] shadow-2xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100">
              <CheckCircle2 size={16} />
            </span>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-bold text-[#171918]">24</span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded border border-emerald-200">
                  ↑ 33%
                </span>
              </div>
              <div className="text-[11px] text-[#68717D]">Active Clients</div>
            </div>
          </div>
          <div className="w-12 h-5 opacity-70 hidden xl:block">
            <svg viewBox="0 0 50 20" className="w-full h-full">
              <path d="M 0 18 Q 15 20 25 12 T 50 3" fill="none" stroke="#EC4899" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        </div>
      </div>

      {/* Row 1: Line Chart + 2 Donut Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Revenue & Payments Over Time (6 cols) */}
        <div className="lg:col-span-6 p-5 rounded-xl bg-white border border-[#E7E7E2] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#171918]">Revenue &amp; Payments Over Time</h3>
              <div className="flex items-center gap-3 text-[10px] text-gray-500 mt-1">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" /> Billed Amount</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Paid Amount</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" /> Outstanding Amount</span>
              </div>
            </div>
            <button className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-[#E7E7E2] bg-white text-xs font-medium text-gray-700">
              <span>{timeframe}</span>
              <ChevronDown size={11} className="text-gray-400" />
            </button>
          </div>

          <div className="h-48 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={REVENUE_OVER_TIME} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
                <XAxis dataKey="month" stroke="#A0A6A3" fontSize={10} tickLine={false} />
                <YAxis stroke="#A0A6A3" fontSize={10} tickLine={false} tickFormatter={(v) => `₹${v / 100000}L`} />
                <Tooltip contentStyle={{ backgroundColor: "#171918", borderRadius: "8px", color: "#fff", fontSize: "11px" }} />
                <Line type="monotone" dataKey="billed" stroke="#3B82F6" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="paid" stroke="#10B981" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="outstanding" stroke="#F59E0B" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Invoice Status Distribution (3 cols) */}
        <div className="lg:col-span-3 p-5 rounded-xl bg-white border border-[#E7E7E2] shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-[#171918]">Invoice Status Distribution</h3>
          <div className="w-32 h-32 relative mx-auto my-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={INVOICE_STATUS_DATA} innerRadius={42} outerRadius={60} paddingAngle={2} dataKey="pct">
                  {INVOICE_STATUS_DATA.map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-sm font-bold text-[#171918]">28</span>
              <span className="text-[9px] text-gray-400">Total Invoices</span>
            </div>
          </div>

          <div className="space-y-1.5 text-[11px] pt-1">
            {INVOICE_STATUS_DATA.map((s) => (
              <div key={s.name} className="flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                  <span className="text-gray-700">{s.name}</span>
                </span>
                <span className="font-semibold text-gray-600">{s.count} ({s.pct}%)</span>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Method Breakdown (3 cols) */}
        <div className="lg:col-span-3 p-5 rounded-xl bg-white border border-[#E7E7E2] shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-[#171918]">Payment Method Breakdown</h3>
          <div className="w-32 h-32 relative mx-auto my-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={PAYMENT_METHODS_DATA} innerRadius={42} outerRadius={60} paddingAngle={2} dataKey="pct">
                  {PAYMENT_METHODS_DATA.map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xs font-bold text-[#171918]">₹10.4L</span>
              <span className="text-[9px] text-gray-400">Total Payments</span>
            </div>
          </div>

          <div className="space-y-1.5 text-[11px] pt-1">
            {PAYMENT_METHODS_DATA.map((m) => (
              <div key={m.name} className="flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: m.color }} />
                  <span className="text-gray-700">{m.name}</span>
                </span>
                <span className="font-semibold text-gray-600">{m.pct}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 2: Recent Invoices Table (8 cols) + Upcoming Payments (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Recent Invoices Table */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-[#E7E7E2] shadow-xs overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#171918]">Recent Invoices</h3>
            <span className="text-xs text-gray-500 hover:text-black cursor-pointer font-medium">View All →</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF9F6] border-b border-[#E7E7E2] text-[#68717D] text-[11px]">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">#</th>
                  <th className="py-2.5 px-2.5 font-semibold">Client</th>
                  <th className="py-2.5 px-2 font-semibold">Project / Service</th>
                  <th className="py-2.5 px-2 font-semibold">Amount</th>
                  <th className="py-2.5 px-2 font-semibold">Status</th>
                  <th className="py-2.5 px-2 font-semibold">Issue Date</th>
                  <th className="py-2.5 px-2 font-semibold">Due Date</th>
                  <th className="py-2.5 px-2 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-[11px]">
                {RECENT_INVOICES.map((inv, idx) => (
                  <tr key={inv.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-2.5 px-3 text-gray-400 font-mono text-[10px]">{idx + 1}</td>
                    <td className="py-2.5 px-2.5">
                      <div className="font-bold text-[#171918]">{inv.client}</div>
                      <div className="text-[10px] text-gray-400 font-mono">{inv.id}</div>
                    </td>
                    <td className="py-2.5 px-2 text-gray-600">{inv.project}</td>
                    <td className="py-2.5 px-2 font-bold text-[#171918]">{inv.amount}</td>
                    <td className="py-2.5 px-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusBadge(inv.status)}`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-2 text-gray-500 whitespace-nowrap">{inv.issueDate}</td>
                    <td className="py-2.5 px-2 text-gray-500 whitespace-nowrap">{inv.dueDate}</td>
                    <td className="py-2.5 px-2 text-right">
                      <button className="p-1 rounded text-gray-400 hover:text-black">
                        <MoreHorizontal size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Upcoming Payments */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-[#E7E7E2] p-4 shadow-xs space-y-3 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <h3 className="text-sm font-bold text-[#171918]">Upcoming Payments</h3>
            <span className="text-xs text-gray-500 hover:text-black cursor-pointer font-medium">View All →</span>
          </div>

          <div className="space-y-2.5">
            {UPCOMING_PAYMENTS.map((up) => (
              <div key={up.client} className="p-2.5 rounded-lg bg-[#FAF9F6] border border-gray-100 flex items-center justify-between">
                <div>
                  <div className="font-bold text-[11px] text-[#171918]">{up.client}</div>
                  <div className="text-[10px] text-gray-400">Due: {up.dueDate}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-xs text-[#171918]">{up.amount}</div>
                  <span className={`inline-block px-1.5 py-0.2 rounded text-[9px] font-bold border ${getStatusBadge(up.status)}`}>
                    {up.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3: Top Clients by Revenue (5 cols) + Revenue by Service Type (4 cols) + Billing Insights (3 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Top Clients by Revenue (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-[#E7E7E2] p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <h3 className="text-sm font-bold text-[#171918]">Top Clients by Revenue</h3>
            <span className="text-xs text-gray-500 hover:text-black cursor-pointer font-medium">View All →</span>
          </div>

          <div className="space-y-2 text-xs">
            {TOP_CLIENTS_REVENUE.map((tc, idx) => (
              <div key={tc.client} className="flex items-center justify-between p-2 rounded-lg bg-[#FAF9F6] border border-gray-100 text-[11px]">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-400 w-3">{idx + 1}</span>
                  <div>
                    <div className="font-bold text-[#171918]">{tc.client}</div>
                    <div className="text-[10px] text-gray-400">Paid: {tc.paid} • Due: {tc.outstanding}</div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-bold text-xs text-[#171918] block">{tc.totalBilled}</span>
                  <span className="text-[9px] text-gray-400">{tc.invoices} invoices</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue by Service Type (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-[#E7E7E2] p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <h3 className="text-sm font-bold text-[#171918]">Revenue by Service Type</h3>
            <span className="text-[11px] text-gray-400 cursor-pointer">Revenue ⌄</span>
          </div>

          <div className="space-y-2.5 text-xs pt-1">
            {SERVICE_REVENUE.map((s) => (
              <div key={s.name} className="space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-medium text-gray-700">{s.name}</span>
                  <span className="font-bold text-[#171918]">{s.pct}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-gray-100 overflow-hidden">
                  <div className={`h-full rounded-full ${s.color}`} style={{ width: `${s.pct * 2}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Billing Insights (3 cols) */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-[#E7E7E2] p-4 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-[#171918]">Billing Insights</h3>

          <div className="space-y-3 text-xs">
            <div className="flex items-start gap-2.5">
              <span className="w-6 h-6 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <TrendingUp size={12} />
              </span>
              <div>
                <div className="font-bold text-[#171918] text-[11px]">Revenue grew by 52%</div>
                <div className="text-[10px] text-gray-500 leading-snug">
                  You generated ₹4,38,000 more revenue compared to last month.
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <span className="w-6 h-6 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <CheckCircle2 size={12} />
              </span>
              <div>
                <div className="font-bold text-[#171918] text-[11px]">78% payments received on time</div>
                <div className="text-[10px] text-gray-500 leading-snug">
                  Good job! 78% of your invoices are paid on time.
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <span className="w-6 h-6 rounded-md bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <Clock size={12} />
              </span>
              <div>
                <div className="font-bold text-[#171918] text-[11px]">3 invoices are overdue</div>
                <div className="text-[10px] text-gray-500 leading-snug">
                  Total overdue amount is ₹2,40,000.
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <span className="w-6 h-6 rounded-md bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <CheckCircle2 size={12} />
              </span>
              <div>
                <div className="font-bold text-[#171918] text-[11px]">Top client this month</div>
                <div className="text-[10px] text-gray-500 leading-snug">
                  Spice Villa Restaurant (₹2,40,000).
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
