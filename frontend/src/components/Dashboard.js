import { jsx, jsxs } from "react/jsx-runtime";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  AreaChart,
  Area,
  Legend
} from "recharts";
import { STUDENTS } from "../constants";
import { formatRawLKR } from "../utils";
import { Users, Globe, Briefcase, MapPin, Banknote } from "lucide-react";
const funnelData = [
  { name: "Total Inquiries", value: STUDENTS.length, fill: "#94A3B8" },
  { name: "Counseling", value: STUDENTS.filter((s) => s.status === "Counseling" || s.status === "New Inquiry").length, fill: "#64748B" },
  { name: "Uni Apps", value: STUDENTS.filter((s) => ["Uni Application", "Offer Received", "Visa Pilot"].includes(s.status)).length, fill: "#6366F1" },
  { name: "Visas Granted", value: STUDENTS.filter((s) => s.status === "Visa Pilot").length, fill: "#10B981" }
];
const countryData = [
  { name: "UK", value: STUDENTS.filter((s) => s.country === "UK").length },
  { name: "Canada", value: STUDENTS.filter((s) => s.country === "Canada").length },
  { name: "Australia", value: STUDENTS.filter((s) => s.country === "Australia").length },
  { name: "New Zealand", value: STUDENTS.filter((s) => s.country === "New Zealand").length },
  { name: "Other", value: STUDENTS.filter((s) => s.country === "USA").length }
];
const revenueData = [
  { month: "Jan", revenue: 12e6 },
  { month: "Feb", revenue: 15e6 },
  { month: "Mar", revenue: 18e6 },
  { month: "Apr", revenue: 22e6 },
  { month: "May", revenue: 25e6 },
  { month: "Jun", revenue: 3e7 }
];
const PIE_COLORS = ["#3B82F6", "#EF4444", "#10B981", "#F59E0B", "#6366F1"];
const Dashboard = () => {
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6 animate-in fade-in duration-500", children: [
    /* @__PURE__ */ jsx("h1", { className: "text-2xl font-semibold tracking-tight text-[#0F172A]", children: "Executive Overview" }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [
      /* @__PURE__ */ jsx(KpiCard, { title: "Total Students", value: STUDENTS.length.toString(), trend: "+12%", icon: /* @__PURE__ */ jsx(Users, { size: 20 }) }),
      /* @__PURE__ */ jsx(KpiCard, { title: "Active Applications", value: "18", trend: "+5%", icon: /* @__PURE__ */ jsx(Briefcase, { size: 20 }) }),
      /* @__PURE__ */ jsx(KpiCard, { title: "Visa Success Rate", value: "94%", trend: "+2%", icon: /* @__PURE__ */ jsx(Globe, { size: 20 }), positive: true }),
      /* @__PURE__ */ jsx(KpiCard, { title: "Est. Revenue (Q3)", value: formatRawLKR(45e6), trend: "+8%", icon: /* @__PURE__ */ jsx(Banknote, { size: 20 }), positive: true })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "lg:col-span-2 bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-[350px] flex flex-col", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold text-slate-900 mb-4", children: "Conversion Funnel Report" }),
        /* @__PURE__ */ jsx("div", { className: "flex-1 w-full", children: /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxs(BarChart, { data: funnelData, layout: "vertical", margin: { top: 5, right: 30, left: 40, bottom: 5 }, children: [
          /* @__PURE__ */ jsx(CartesianGrid, { strokeDasharray: "3 3", horizontal: false, stroke: "#E2E8F0" }),
          /* @__PURE__ */ jsx(XAxis, { type: "number", hide: true }),
          /* @__PURE__ */ jsx(YAxis, { dataKey: "name", type: "category", width: 100, tick: { fontSize: 12, fill: "#64748B" }, axisLine: false, tickLine: false }),
          /* @__PURE__ */ jsx(
            Tooltip,
            {
              contentStyle: { borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" },
              cursor: { fill: "#F1F5F9" }
            }
          ),
          /* @__PURE__ */ jsx(Bar, { dataKey: "value", radius: [0, 4, 4, 0], barSize: 32, children: funnelData.map((entry, index) => /* @__PURE__ */ jsx(Cell, { fill: entry.fill }, `cell-${index}`)) })
        ] }) }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-[350px] flex flex-col", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold text-slate-900 mb-2", children: "Market Distribution" }),
        /* @__PURE__ */ jsxs("div", { className: "flex-1 relative", children: [
          /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxs(PieChart, { children: [
            /* @__PURE__ */ jsx(
              Pie,
              {
                data: countryData,
                cx: "50%",
                cy: "50%",
                innerRadius: 60,
                outerRadius: 80,
                paddingAngle: 5,
                dataKey: "value",
                children: countryData.map((entry, index) => /* @__PURE__ */ jsx(Cell, { fill: PIE_COLORS[index % PIE_COLORS.length] }, `cell-${index}`))
              }
            ),
            /* @__PURE__ */ jsx(Tooltip, {}),
            /* @__PURE__ */ jsx(Legend, { verticalAlign: "bottom", height: 36, iconType: "circle", wrapperStyle: { fontSize: "10px" } })
          ] }) }),
          /* @__PURE__ */ jsx("div", { className: "absolute inset-0 flex items-center justify-center pointer-events-none pb-8", children: /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
            /* @__PURE__ */ jsx("div", { className: "text-2xl font-bold text-slate-900", children: STUDENTS.length }),
            /* @__PURE__ */ jsx("div", { className: "text-xs text-slate-500 uppercase", children: "Active" })
          ] }) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-[300px]", children: [
        /* @__PURE__ */ jsxs("h3", { className: "text-sm font-semibold text-slate-900 mb-4 flex justify-between", children: [
          /* @__PURE__ */ jsx("span", { children: "Revenue Forecast" }),
          /* @__PURE__ */ jsx("span", { className: "text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded text-xs font-bold", children: "+15% vs Last Year" })
        ] }),
        /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: "80%", children: /* @__PURE__ */ jsxs(AreaChart, { data: revenueData, children: [
          /* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsxs("linearGradient", { id: "colorRev", x1: "0", y1: "0", x2: "0", y2: "1", children: [
            /* @__PURE__ */ jsx("stop", { offset: "5%", stopColor: "#0F172A", stopOpacity: 0.1 }),
            /* @__PURE__ */ jsx("stop", { offset: "95%", stopColor: "#0F172A", stopOpacity: 0 })
          ] }) }),
          /* @__PURE__ */ jsx(XAxis, { dataKey: "month", axisLine: false, tickLine: false, tick: { fontSize: 12 } }),
          /* @__PURE__ */ jsx(YAxis, { hide: true }),
          /* @__PURE__ */ jsx(
            Tooltip,
            {
              formatter: (value) => [formatRawLKR(value), "Revenue"],
              contentStyle: { borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }
            }
          ),
          /* @__PURE__ */ jsx(Area, { type: "monotone", dataKey: "revenue", stroke: "#0F172A", strokeWidth: 2, fillOpacity: 1, fill: "url(#colorRev)" })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-[300px] overflow-hidden", children: [
        /* @__PURE__ */ jsxs("h3", { className: "text-sm font-semibold text-slate-900 mb-4 flex items-center", children: [
          /* @__PURE__ */ jsx(MapPin, { size: 16, className: "mr-2" }),
          " Branch Performance Snapshot"
        ] }),
        /* @__PURE__ */ jsx("div", { className: "space-y-4", children: [
          { name: "Colombo HQ", conversion: 78, students: 44, color: "bg-indigo-600" },
          { name: "Jaffna", conversion: 54, students: 35, color: "bg-slate-400" },
          { name: "Galle", conversion: 42, students: 22, color: "bg-slate-400" },
          { name: "Kandy", conversion: 31, students: 26, color: "bg-rose-500" }
        ].map((branch) => {
          return /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-xs mb-1", children: [
              /* @__PURE__ */ jsx("span", { className: "font-medium text-slate-700", children: branch.name }),
              /* @__PURE__ */ jsxs("span", { className: "text-slate-500", children: [
                branch.conversion,
                "% Conversion (",
                branch.students,
                " Students)"
              ] })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "w-full bg-gray-100 rounded-full h-2", children: /* @__PURE__ */ jsx(
              "div",
              {
                className: `h-2 rounded-full ${branch.color}`,
                style: { width: `${branch.conversion}%` }
              }
            ) })
          ] }, branch.name);
        }) }),
        /* @__PURE__ */ jsx("div", { className: "mt-6 pt-4 border-t border-gray-100 text-center", children: /* @__PURE__ */ jsx("button", { className: "text-xs font-semibold text-indigo-600 hover:text-indigo-800", children: "View Full Branch Analytics \u2192" }) })
      ] })
    ] })
  ] });
};
const KpiCard = ({ title, value, trend, icon, positive }) => /* @__PURE__ */ jsxs("div", { className: "bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between", children: [
  /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-start", children: [
    /* @__PURE__ */ jsx("div", { className: "text-slate-500 bg-slate-50 p-2 rounded-lg", children: icon }),
    /* @__PURE__ */ jsx("span", { className: `text-xs font-medium px-2 py-1 rounded-full ${positive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`, children: trend })
  ] }),
  /* @__PURE__ */ jsxs("div", { className: "mt-4", children: [
    /* @__PURE__ */ jsx("h4", { className: "text-slate-500 text-xs font-medium uppercase tracking-wider", children: title }),
    /* @__PURE__ */ jsx("div", { className: "text-2xl font-bold text-slate-900 mt-1 tracking-tight", children: value })
  ] })
] });
export {
  Dashboard
};
