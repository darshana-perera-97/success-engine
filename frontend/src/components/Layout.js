import { jsx, jsxs } from "react/jsx-runtime";
import { useState } from "react";
import {
  Users,
  LayoutDashboard,
  CheckSquare,
  FileText,
  Settings,
  Bell,
  Search,
  Command,
  LogOut,
  BarChart3,
  UserCircle,
  Shield,
  Briefcase,
  MessageSquare,
  Globe,
  DollarSign,
  Calendar,
  UserCog,
  Menu,
  X
} from "lucide-react";
const Layout = ({ children, activeView, onNavigate, currentRole, onRoleChange }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const getNavItems = () => {
    switch (currentRole) {
      case "Student":
        return [
          { id: "dashboard", label: "My Application", icon: /* @__PURE__ */ jsx(LayoutDashboard, { size: 20 }) },
          { id: "resume", label: "AI Resume", icon: /* @__PURE__ */ jsx(FileText, { size: 20 }) },
          { id: "calendar", label: "Book Session", icon: /* @__PURE__ */ jsx(Calendar, { size: 20 }) },
          { id: "finance", label: "My Finances", icon: /* @__PURE__ */ jsx(DollarSign, { size: 20 }) },
          { id: "messages", label: "Messages", icon: /* @__PURE__ */ jsx(MessageSquare, { size: 20 }), badge: "1" },
          { id: "tasks", label: "My Checklist", icon: /* @__PURE__ */ jsx(CheckSquare, { size: 20 }), badge: "2" }
        ];
      case "Counselor":
        return [
          { id: "dashboard", label: "My Dashboard", icon: /* @__PURE__ */ jsx(LayoutDashboard, { size: 20 }) },
          { id: "calendar", label: "Calendar", icon: /* @__PURE__ */ jsx(Calendar, { size: 20 }) },
          { id: "students", label: "My Students", icon: /* @__PURE__ */ jsx(Users, { size: 20 }) },
          { id: "university", label: "Uni Finder", icon: /* @__PURE__ */ jsx(Globe, { size: 20 }) },
          { id: "messages", label: "Inbox", icon: /* @__PURE__ */ jsx(MessageSquare, { size: 20 }), badge: "3" },
          { id: "tasks", label: "My Tasks", icon: /* @__PURE__ */ jsx(CheckSquare, { size: 20 }), badge: "5" }
        ];
      case "Manager":
        return [
          { id: "dashboard", label: "Command Center", icon: /* @__PURE__ */ jsx(LayoutDashboard, { size: 20 }) },
          { id: "counselors", label: "Counselors", icon: /* @__PURE__ */ jsx(UserCog, { size: 20 }) },
          { id: "calendar", label: "Team Calendar", icon: /* @__PURE__ */ jsx(Calendar, { size: 20 }) },
          { id: "branch", label: "Branch Analytics", icon: /* @__PURE__ */ jsx(BarChart3, { size: 20 }) },
          { id: "students", label: "All Students", icon: /* @__PURE__ */ jsx(Users, { size: 20 }) },
          { id: "university", label: "Uni Database", icon: /* @__PURE__ */ jsx(Globe, { size: 20 }) },
          { id: "messages", label: "Live Ops (Ghost)", icon: /* @__PURE__ */ jsx(MessageSquare, { size: 20 }) },
          { id: "tasks", label: "Escalations", icon: /* @__PURE__ */ jsx(CheckSquare, { size: 20 }), badge: "3" }
        ];
      case "Admin":
      default:
        return [
          { id: "dashboard", label: "Global Overview", icon: /* @__PURE__ */ jsx(LayoutDashboard, { size: 20 }) },
          { id: "counselors", label: "Counselors", icon: /* @__PURE__ */ jsx(UserCog, { size: 20 }) },
          { id: "branch", label: "Branch Analytics", icon: /* @__PURE__ */ jsx(BarChart3, { size: 20 }) },
          { id: "students", label: "All Students", icon: /* @__PURE__ */ jsx(Users, { size: 20 }) },
          { id: "university", label: "Uni Database", icon: /* @__PURE__ */ jsx(Globe, { size: 20 }) },
          { id: "messages", label: "Omni-Channel", icon: /* @__PURE__ */ jsx(MessageSquare, { size: 20 }) }
        ];
    }
  };
  const navItems = getNavItems();
  return /* @__PURE__ */ jsxs("div", { className: "flex h-screen bg-[#F9FAFB] text-slate-900 font-sans overflow-hidden", children: [
    isMobileMenuOpen && /* @__PURE__ */ jsx(
      "div",
      {
        className: "fixed inset-0 bg-slate-900/50 z-[60] lg:hidden backdrop-blur-sm animate-in fade-in",
        onClick: () => setIsMobileMenuOpen(false)
      }
    ),
    /* @__PURE__ */ jsxs("aside", { className: `
        fixed inset-y-0 left-0 z-[70] w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:hidden flex flex-col justify-between
        ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
      `, children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("div", { className: "h-16 flex items-center px-6 border-b border-gray-100 justify-between", children: [
          /* @__PURE__ */ jsx("div", { className: "flex items-center w-[80%]", children: /* @__PURE__ */ jsx(
            "img",
            {
              src: "/MainLogo.png",
              alt: "ABEC Premier Logo",
              className: "w-full h-auto object-contain",
              referrerPolicy: "no-referrer"
            }
          ) }),
          /* @__PURE__ */ jsx("button", { onClick: () => setIsMobileMenuOpen(false), className: "text-slate-400 hover:text-slate-600", children: /* @__PURE__ */ jsx(X, { size: 20 }) })
        ] }),
        /* @__PURE__ */ jsxs("nav", { className: "mt-6 flex flex-col gap-1 px-4", children: [
          /* @__PURE__ */ jsx("div", { className: "px-2 pb-4 mb-2 border-b border-gray-50", children: /* @__PURE__ */ jsxs("p", { className: "text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2", children: [
            currentRole,
            " Interface"
          ] }) }),
          navItems.map((item) => /* @__PURE__ */ jsx(
            NavItem,
            {
              icon: item.icon,
              label: item.label,
              isActive: activeView === item.id || activeView === "student-detail" && item.id === "students",
              onClick: () => {
                onNavigate(item.id);
                setIsMobileMenuOpen(false);
              },
              badge: item.badge
            },
            item.id
          ))
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "p-4 border-t border-gray-100", children: [
        /* @__PURE__ */ jsx(
          NavItem,
          {
            icon: /* @__PURE__ */ jsx(Settings, { size: 20 }),
            label: "Settings",
            isActive: activeView === "settings",
            onClick: () => {
              onNavigate("settings");
              setIsMobileMenuOpen(false);
            }
          }
        ),
        /* @__PURE__ */ jsx(
          NavItem,
          {
            icon: /* @__PURE__ */ jsx(LogOut, { size: 20 }),
            label: "Logout",
            isActive: false,
            onClick: () => {
            },
            className: "text-rose-600 hover:bg-rose-50 hover:text-rose-700"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxs("aside", { className: "hidden lg:flex w-64 border-r border-gray-200 bg-white flex-col justify-between transition-all duration-300 z-30", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("div", { className: "h-16 flex items-center px-6 border-b border-gray-100", children: /* @__PURE__ */ jsx("div", { className: "w-[80%] flex items-center", children: /* @__PURE__ */ jsx(
          "img",
          {
            src: "/MainLogo.png",
            alt: "ABEC Premier Logo",
            className: "w-full h-auto object-contain",
            referrerPolicy: "no-referrer"
          }
        ) }) }),
        /* @__PURE__ */ jsxs("nav", { className: "mt-6 flex flex-col gap-1 px-4", children: [
          /* @__PURE__ */ jsx("div", { className: "px-2 pb-4 mb-2 border-b border-gray-50", children: /* @__PURE__ */ jsxs("p", { className: "text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2", children: [
            currentRole,
            " Interface"
          ] }) }),
          navItems.map((item) => /* @__PURE__ */ jsx(
            NavItem,
            {
              icon: item.icon,
              label: item.label,
              isActive: activeView === item.id || activeView === "student-detail" && item.id === "students",
              onClick: () => onNavigate(item.id),
              badge: item.badge
            },
            item.id
          ))
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "p-4 border-t border-gray-100", children: [
        /* @__PURE__ */ jsx(
          NavItem,
          {
            icon: /* @__PURE__ */ jsx(Settings, { size: 20 }),
            label: "Settings",
            isActive: activeView === "settings",
            onClick: () => onNavigate("settings")
          }
        ),
        /* @__PURE__ */ jsx(
          NavItem,
          {
            icon: /* @__PURE__ */ jsx(LogOut, { size: 20 }),
            label: "Logout",
            isActive: false,
            onClick: () => {
            },
            className: "text-rose-600 hover:bg-rose-50 hover:text-rose-700"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxs("main", { className: "flex-1 flex flex-col min-w-0", children: [
      /* @__PURE__ */ jsxs("header", { className: "h-16 bg-white/80 backdrop-blur-md border-b border-gray-200 flex items-center justify-between px-4 lg:px-8 z-[50] sticky top-0", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center text-sm text-slate-500 gap-3", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setIsMobileMenuOpen(true),
              className: "lg:hidden p-2 -ml-2 text-slate-500 hover:bg-gray-100 rounded-md",
              children: /* @__PURE__ */ jsx(Menu, { size: 20 })
            }
          ),
          /* @__PURE__ */ jsxs("span", { className: "hidden md:inline-flex items-center bg-gray-100 px-2 py-1 rounded text-xs border border-gray-200 text-gray-500 mr-4", children: [
            /* @__PURE__ */ jsx(Command, { size: 12, className: "mr-1" }),
            " K"
          ] }),
          /* @__PURE__ */ jsx("span", { className: "font-medium text-slate-900 capitalize", children: activeView.replace("-", " ") })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
          currentRole !== "Student" && /* @__PURE__ */ jsxs("div", { className: "relative hidden md:block", children: [
            /* @__PURE__ */ jsx(Search, { className: "absolute left-2.5 top-2.5 text-gray-400", size: 16 }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                placeholder: "Search anything...",
                className: "pl-9 pr-4 py-1.5 w-64 text-sm bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-400 focus:bg-white transition-all placeholder:text-gray-400"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("button", { className: "relative p-2 text-gray-500 hover:text-slate-900 hover:bg-gray-100 rounded-full transition-colors", children: [
            /* @__PURE__ */ jsx(Bell, { size: 20, strokeWidth: 1.5 }),
            /* @__PURE__ */ jsx("span", { className: "absolute top-2 right-2 h-2 w-2 bg-rose-500 rounded-full border border-white" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "relative group", children: [
            /* @__PURE__ */ jsxs("button", { className: "flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-all", children: [
              /* @__PURE__ */ jsx("div", { className: "h-8 w-8 rounded-full border-2 border-white shadow-sm ring-1 ring-gray-100 overflow-hidden flex items-center justify-center bg-white", children: /* @__PURE__ */ jsx(
                "img",
                {
                  src: "/canadian.png",
                  alt: "User Role",
                  className: "w-full h-full object-cover",
                  referrerPolicy: "no-referrer"
                }
              ) }),
              /* @__PURE__ */ jsxs("div", { className: "text-left hidden md:block", children: [
                /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold text-slate-900 leading-tight", children: currentRole }),
                /* @__PURE__ */ jsx("p", { className: "text-[10px] text-slate-500 leading-tight", children: "Switch View" })
              ] })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "absolute right-0 top-full pt-2 w-48 hidden group-hover:block animate-in fade-in zoom-in-95 duration-150 origin-top-right z-[100]", children: /* @__PURE__ */ jsxs("div", { className: "bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden p-1", children: [
              /* @__PURE__ */ jsx(RoleOption, { role: "Student", current: currentRole, onClick: onRoleChange, icon: /* @__PURE__ */ jsx(UserCircle, { size: 14 }) }),
              /* @__PURE__ */ jsx(RoleOption, { role: "Counselor", current: currentRole, onClick: onRoleChange, icon: /* @__PURE__ */ jsx(Briefcase, { size: 14 }) }),
              /* @__PURE__ */ jsx(RoleOption, { role: "Manager", current: currentRole, onClick: onRoleChange, icon: /* @__PURE__ */ jsx(BarChart3, { size: 14 }) }),
              /* @__PURE__ */ jsx(RoleOption, { role: "Admin", current: currentRole, onClick: onRoleChange, icon: /* @__PURE__ */ jsx(Shield, { size: 14 }) })
            ] }) })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "flex-1 overflow-auto p-4 lg:p-8", children: /* @__PURE__ */ jsx("div", { className: "max-w-7xl mx-auto h-full", children }) })
    ] })
  ] });
};
const RoleOption = ({ role, current, onClick, icon }) => /* @__PURE__ */ jsxs(
  "button",
  {
    onClick: () => onClick(role),
    className: `w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors
            ${current === role ? "bg-indigo-50 text-indigo-700 font-medium" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}
        `,
    children: [
      icon,
      role
    ]
  }
);
const NavItem = ({ icon, label, isActive, onClick, badge, className }) => {
  return /* @__PURE__ */ jsxs(
    "button",
    {
      onClick,
      className: `
        group flex items-center justify-center lg:justify-start w-full p-2.5 rounded-md text-sm font-medium transition-all duration-200
        ${isActive ? "bg-slate-100 text-[#0F172A]" : "text-slate-500 hover:bg-gray-50 hover:text-slate-900"}
        ${className}
      `,
      children: [
        /* @__PURE__ */ jsx("span", { className: `${isActive ? "text-[#0F172A]" : "text-slate-400 group-hover:text-slate-600"}`, children: icon }),
        /* @__PURE__ */ jsx("span", { className: "ml-3 block flex-1 text-left", children: label }),
        badge && /* @__PURE__ */ jsx("span", { className: `
            inline-flex items-center justify-center min-w-[20px] h-[20px] px-1.5 rounded-full text-[10px] font-bold shadow-sm
            ${isActive ? "bg-indigo-600 text-white" : "bg-indigo-50 text-indigo-600 border border-indigo-100"}
            transition-all duration-300 group-hover:scale-110
        `, children: badge })
      ]
    }
  );
};
export {
  Layout
};
