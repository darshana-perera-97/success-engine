import { jsx, jsxs } from "react/jsx-runtime";
import { STUDENTS } from "../constants";
import { formatLKR, RATE_UPDATED_AT } from "../utils";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { MapPin, TrendingUp, Download, Banknote, Clock } from "lucide-react";
import { Button } from "./Button";
const BRANCHES = ["Colombo HQ", "Kandy", "Galle", "Jaffna"];
const BranchAnalytics = () => {
  const branchData = BRANCHES.map((branch) => {
    const branchStudents = STUDENTS.filter((s) => s.branch === branch);
    const revenue = branchStudents.reduce((acc, s) => acc + parseFloat(s.budget || "0") * 0.1, 0);
    const conversions = branchStudents.filter((s) => ["Visa Pilot", "Offer Received"].includes(s.status)).length;
    return {
      name: branch,
      students: branchStudents.length,
      revenue,
      conversions,
      conversionRate: branchStudents.length ? Math.round(conversions / branchStudents.length * 100) : 0
    };
  });
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6 animate-in fade-in duration-500 pb-10", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-end", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-semibold tracking-tight text-[#0F172A]", children: "Detailed Branch Analytics" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-500 mt-1", children: "Deep dive into regional performance metrics." }),
        /* @__PURE__ */ jsxs("p", { className: "text-[10px] text-slate-400 flex items-center gap-1 mt-1", children: [
          /* @__PURE__ */ jsx(Clock, { size: 10 }),
          " Rates updated: ",
          RATE_UPDATED_AT
        ] })
      ] }),
      /* @__PURE__ */ jsxs(Button, { variant: "secondary", children: [
        /* @__PURE__ */ jsx(Download, { size: 16, className: "mr-2" }),
        " Export Report"
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: branchData.map((data, idx) => /* @__PURE__ */ jsxs("div", { className: "bg-white p-5 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden group hover:border-indigo-300 transition-colors", children: [
      /* @__PURE__ */ jsx("div", { className: `absolute top-0 left-0 w-1 h-full ${idx === 0 ? "bg-indigo-600" : "bg-gray-200"}` }),
      /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-start mb-2", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(MapPin, { size: 16, className: "text-slate-400" }),
          /* @__PURE__ */ jsx("span", { className: "font-semibold text-slate-700", children: data.name })
        ] }),
        idx === 0 && /* @__PURE__ */ jsx("span", { className: "bg-indigo-50 text-indigo-700 text-[10px] px-2 py-0.5 rounded-full font-bold", children: "TOP PERFORMER" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4 mt-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-400 uppercase", children: "Revenue" }),
          /* @__PURE__ */ jsx("p", { className: "text-lg font-bold text-slate-900", children: formatLKR(data.revenue) })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-400 uppercase", children: "Conv. Rate" }),
          /* @__PURE__ */ jsxs("p", { className: "text-lg font-bold text-emerald-600", children: [
            data.conversionRate,
            "%"
          ] })
        ] })
      ] })
    ] }, data.name)) }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "lg:col-span-2 bg-white p-6 rounded-xl border border-gray-200 shadow-sm min-h-[400px]", children: [
        /* @__PURE__ */ jsxs("h3", { className: "text-sm font-bold text-slate-900 mb-6 flex items-center", children: [
          /* @__PURE__ */ jsx(TrendingUp, { size: 16, className: "mr-2 text-slate-400" }),
          "Regional Conversion Performance"
        ] }),
        /* @__PURE__ */ jsx("div", { className: "h-[300px] w-full", children: /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxs(BarChart, { data: branchData, barSize: 40, children: [
          /* @__PURE__ */ jsx(XAxis, { dataKey: "name", axisLine: false, tickLine: false, tick: { fill: "#64748B", fontSize: 12 }, dy: 10 }),
          /* @__PURE__ */ jsx(YAxis, { axisLine: false, tickLine: false, tick: { fill: "#64748B", fontSize: 12 } }),
          /* @__PURE__ */ jsx(Tooltip, { cursor: { fill: "#F8FAFC" }, contentStyle: { borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" } }),
          /* @__PURE__ */ jsx(Bar, { dataKey: "students", name: "Total Inquiries", fill: "#E2E8F0", radius: [4, 4, 0, 0] }),
          /* @__PURE__ */ jsx(Bar, { dataKey: "conversions", name: "Successes", fill: "#0F172A", radius: [4, 4, 0, 0] })
        ] }) }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-white p-6 rounded-xl border border-gray-200 shadow-sm", children: [
        /* @__PURE__ */ jsxs("h3", { className: "text-sm font-bold text-slate-900 mb-4 flex items-center", children: [
          /* @__PURE__ */ jsx(Banknote, { size: 16, className: "mr-2 text-slate-400" }),
          "Revenue Efficiency"
        ] }),
        /* @__PURE__ */ jsx("div", { className: "space-y-4", children: branchData.sort((a, b) => b.revenue - a.revenue).map((data, idx) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
          /* @__PURE__ */ jsx("div", { className: "text-xs font-mono text-slate-400 w-4", children: idx + 1 }),
          /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between mb-1", children: [
              /* @__PURE__ */ jsx("span", { className: "text-sm font-medium text-slate-700", children: data.name }),
              /* @__PURE__ */ jsx("span", { className: "text-sm font-bold text-slate-900", children: formatLKR(data.revenue) })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "w-full bg-gray-100 rounded-full h-1.5", children: /* @__PURE__ */ jsx(
              "div",
              {
                className: "bg-emerald-500 h-1.5 rounded-full",
                style: { width: `${data.revenue / 2e5 * 100}%` }
              }
            ) })
          ] })
        ] }, data.name)) }),
        /* @__PURE__ */ jsxs("div", { className: "mt-8 pt-6 border-t border-gray-100", children: [
          /* @__PURE__ */ jsx("h4", { className: "text-xs font-bold text-slate-400 uppercase mb-3", children: "Branch Managers" }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
              /* @__PURE__ */ jsx("div", { className: "w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold", children: "J" }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-slate-900", children: "John Doe" }),
                /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-500", children: "Colombo HQ" })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
              /* @__PURE__ */ jsx("div", { className: "w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold", children: "D" }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-slate-900", children: "Devinda K." }),
                /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-500", children: "Kandy" })
              ] })
            ] })
          ] })
        ] })
      ] })
    ] })
  ] });
};
export {
  BranchAnalytics
};
