import { jsx, jsxs } from "react/jsx-runtime";
import { Clock, Users, CheckCircle, ArrowRight, CheckSquare } from "lucide-react";
import { Button } from "./Button";
import { BarChart, Bar, ResponsiveContainer, XAxis } from "recharts";
import { LeaderboardWidget } from "./LeaderboardWidget";
const CounselorDashboard = ({ onNavigate, tasks, currentUser, students, allStudents = students, employees = [], onSelectStudent, onSelectTask }) => {
  const counselorId = currentUser?.id || "EMP002";
  const myStudents = students;
  const myTasks = tasks.filter((t) => t.assigned_to.includes(counselorId));
  const overdueTasksCount = myTasks.filter((t) => t.status === "Overdue").length;
  const totalUnresolvedViolations = myStudents.reduce((acc, s) => {
    return acc + (s.slaViolations?.filter((v) => !v.resolved).length || 0);
  }, 0);
  const slaScore = Math.max(0, 100 - overdueTasksCount * 5 - totalUnresolvedViolations * 2);
  const overdueTasks = myTasks.filter((t) => t.status === "Overdue");
  const pendingTasks = myTasks.filter((t) => t.status === "Pending" || t.status === "In Progress" || t.status === "In Review");
  const completedTasks = myTasks.filter((t) => t.status === "Completed");
  const pendingReviewTasks = myTasks.filter((t) => t.status === "In Review");
  const activityData = [
    { name: "Mon", calls: 4 },
    { name: "Tue", calls: 8 },
    { name: "Wed", calls: 3 },
    { name: "Thu", calls: 12 },
    { name: "Fri", calls: 9 }
  ];
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6 animate-in fade-in duration-500", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("h1", { className: "text-2xl font-semibold tracking-tight text-[#0F172A]", children: [
          "Welcome back, ",
          currentUser?.name || "Sarah"
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-500 mt-1", children: "Here's what's on your plate today." })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "text-left sm:text-right", children: [
        /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold text-slate-400 uppercase tracking-wider", children: "Your Performance" }),
        /* @__PURE__ */ jsx("div", { className: "flex items-center gap-2 mt-1", children: /* @__PURE__ */ jsxs("div", { className: `flex items-center text-sm font-bold px-2 py-0.5 rounded-full ${slaScore >= 90 ? "bg-emerald-50 text-emerald-600" : slaScore >= 70 ? "bg-amber-50 text-amber-600" : "bg-rose-50 text-rose-600"}`, children: [
          /* @__PURE__ */ jsx(CheckCircle, { size: 14, className: "mr-1" }),
          " ",
          slaScore,
          "% SLA Met"
        ] }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white border border-gray-200 rounded-xl p-6 shadow-sm", children: [
      /* @__PURE__ */ jsxs("h3", { className: "font-bold text-slate-900 mb-4 flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(CheckSquare, { size: 18, className: "text-indigo-600" }),
        "Task Tower Overview"
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "p-4 bg-slate-50 rounded-lg border border-slate-100 text-center", children: [
          /* @__PURE__ */ jsx("div", { className: "text-2xl font-bold text-slate-900", children: completedTasks.length }),
          /* @__PURE__ */ jsx("div", { className: "text-xs text-slate-500 uppercase font-semibold mt-1", children: "Completed" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "p-4 bg-rose-50 rounded-lg border border-rose-100 text-center", children: [
          /* @__PURE__ */ jsx("div", { className: "text-2xl font-bold text-rose-700", children: overdueTasks.length }),
          /* @__PURE__ */ jsx("div", { className: "text-xs text-rose-600 uppercase font-semibold mt-1", children: "Overdue" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "p-4 bg-indigo-50 rounded-lg border border-indigo-100 text-center", children: [
          /* @__PURE__ */ jsx("div", { className: "text-2xl font-bold text-indigo-700", children: pendingReviewTasks.length }),
          /* @__PURE__ */ jsx("div", { className: "text-xs text-indigo-600 uppercase font-semibold mt-1", children: "Pending Review" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "lg:col-span-2 space-y-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-white p-6 rounded-xl border border-gray-200 shadow-sm", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center mb-4", children: [
            /* @__PURE__ */ jsxs("h3", { className: "font-semibold text-slate-900 flex items-center", children: [
              /* @__PURE__ */ jsx(Clock, { size: 18, className: "mr-2 text-indigo-600" }),
              "Priority Action Items"
            ] }),
            /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "sm", onClick: () => onNavigate("tasks"), children: "View All" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
            overdueTasks.length > 0 && /* @__PURE__ */ jsxs("div", { className: "p-3 bg-rose-50 border border-rose-100 rounded-lg flex justify-between items-center", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
                /* @__PURE__ */ jsx("div", { className: "w-2 h-2 rounded-full bg-rose-500 animate-pulse" }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsxs("p", { className: "text-sm font-medium text-rose-900", children: [
                    "You have ",
                    overdueTasks.length,
                    " overdue tasks!"
                  ] }),
                  /* @__PURE__ */ jsx("p", { className: "text-xs text-rose-700", children: "Immediate action required." })
                ] })
              ] }),
              /* @__PURE__ */ jsx(Button, { size: "sm", variant: "danger", onClick: () => onNavigate("tasks"), children: "Fix Now" })
            ] }),
            pendingTasks.slice(0, 3).map((task) => /* @__PURE__ */ jsxs(
              "div",
              {
                className: "flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg border border-transparent hover:border-gray-100 transition-all group cursor-pointer",
                onClick: () => onSelectTask && onSelectTask(task.id),
                children: [
                  /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
                    /* @__PURE__ */ jsx("div", { className: "w-5 h-5 mt-0.5 rounded border-2 border-slate-300 group-hover:border-indigo-500 transition-colors" }),
                    /* @__PURE__ */ jsxs("div", { children: [
                      /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-slate-700 group-hover:text-indigo-900", children: task.task }),
                      /* @__PURE__ */ jsxs("p", { className: "text-xs text-slate-400", children: [
                        "Due: ",
                        task.dueDate
                      ] })
                    ] })
                  ] }),
                  /* @__PURE__ */ jsx("span", { className: `text-[10px] font-bold px-2 py-0.5 rounded-full ${task.priority === "High" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"}`, children: task.priority })
                ]
              },
              task.id
            ))
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-white p-6 rounded-xl border border-gray-200 shadow-sm", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center mb-4", children: [
            /* @__PURE__ */ jsxs("h3", { className: "font-semibold text-slate-900 flex items-center", children: [
              /* @__PURE__ */ jsx(Users, { size: 18, className: "mr-2 text-indigo-600" }),
              "My Students"
            ] }),
            /* @__PURE__ */ jsxs(Button, { variant: "ghost", size: "sm", onClick: () => onNavigate("students"), children: [
              "View All (",
              myStudents.length,
              ")"
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-sm", children: [
            /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "text-left text-xs text-slate-400 uppercase border-b border-gray-100", children: [
              /* @__PURE__ */ jsx("th", { className: "pb-2 font-medium", children: "Name" }),
              /* @__PURE__ */ jsx("th", { className: "pb-2 font-medium", children: "Stage" }),
              /* @__PURE__ */ jsx("th", { className: "pb-2 font-medium text-right", children: "Action" })
            ] }) }),
            /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-gray-50", children: myStudents.slice(0, 5).map((student) => /* @__PURE__ */ jsxs("tr", { className: "group", children: [
              /* @__PURE__ */ jsx("td", { className: "py-3 font-medium text-slate-700", children: student.name }),
              /* @__PURE__ */ jsx("td", { className: "py-3", children: /* @__PURE__ */ jsx("span", { className: "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200", children: student.status }) }),
              /* @__PURE__ */ jsx("td", { className: "py-3 text-right", children: /* @__PURE__ */ jsxs(
                "button",
                {
                  className: "text-indigo-600 hover:text-indigo-800 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-end gap-1 ml-auto",
                  onClick: () => onSelectStudent && onSelectStudent(student),
                  children: [
                    "Open ",
                    /* @__PURE__ */ jsx(ArrowRight, { size: 12 })
                  ]
                }
              ) })
            ] }, student.id)) })
          ] }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
        /* @__PURE__ */ jsx(LeaderboardWidget, { students: allStudents, employees, currentUserId: currentUser?.id || "", currentUserEmail: currentUser?.email || "" }),
        /* @__PURE__ */ jsxs("div", { className: "bg-[#0F172A] p-6 rounded-xl shadow-lg text-white", children: [
          /* @__PURE__ */ jsx("h4", { className: "text-slate-400 text-xs font-bold uppercase tracking-wider mb-4", children: "Pipeline Health" }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-sm mb-1", children: [
                /* @__PURE__ */ jsx("span", { className: "text-slate-300", children: "New Inquiries" }),
                /* @__PURE__ */ jsx("span", { className: "font-bold", children: "12" })
              ] }),
              /* @__PURE__ */ jsx("div", { className: "w-full bg-slate-700 rounded-full h-1.5", children: /* @__PURE__ */ jsx("div", { className: "bg-indigo-500 h-1.5 rounded-full", style: { width: "60%" } }) })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-sm mb-1", children: [
                /* @__PURE__ */ jsx("span", { className: "text-slate-300", children: "Docs Pending" }),
                /* @__PURE__ */ jsx("span", { className: "font-bold", children: "5" })
              ] }),
              /* @__PURE__ */ jsx("div", { className: "w-full bg-slate-700 rounded-full h-1.5", children: /* @__PURE__ */ jsx("div", { className: "bg-amber-500 h-1.5 rounded-full", style: { width: "30%" } }) })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-sm mb-1", children: [
                /* @__PURE__ */ jsx("span", { className: "text-slate-300", children: "Visa Pilot" }),
                /* @__PURE__ */ jsx("span", { className: "font-bold", children: "3" })
              ] }),
              /* @__PURE__ */ jsx("div", { className: "w-full bg-slate-700 rounded-full h-1.5", children: /* @__PURE__ */ jsx("div", { className: "bg-emerald-500 h-1.5 rounded-full", style: { width: "20%" } }) })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-white p-6 rounded-xl border border-gray-200 shadow-sm", children: [
          /* @__PURE__ */ jsx("h4", { className: "text-slate-900 text-sm font-bold mb-4", children: "Weekly Activity" }),
          /* @__PURE__ */ jsx("div", { className: "h-32", children: /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxs(BarChart, { data: activityData, children: [
            /* @__PURE__ */ jsx(XAxis, { dataKey: "name", axisLine: false, tickLine: false, tick: { fontSize: 10 } }),
            /* @__PURE__ */ jsx(Bar, { dataKey: "calls", fill: "#6366F1", radius: [4, 4, 0, 0] })
          ] }) }) })
        ] })
      ] })
    ] })
  ] });
};
export {
  CounselorDashboard
};
