import { jsx, jsxs } from "react/jsx-runtime";
import { useMemo, useState } from "react";
import { STUDENTS, EMPLOYEES } from "../constants";
import { MoreHorizontal, Filter, ChevronDown, UserPlus } from "lucide-react";
import { Button } from "./Button";
import { AddStudentModal } from "./AddStudentModal";
import { COUNTRY_CHECKLISTS } from "../constants";
const ALL_STATUSES = [
  "New Inquiry",
  "Counseling",
  "Documentation",
  "Uni Application",
  "Offer Received",
  "Visa Pilot"
];
const StudentList = ({ onSelectStudent, students = STUDENTS, onUpdateStudent, onNavigate }) => {
  const [filterText, setFilterText] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const filteredStudents = useMemo(() => {
    return students.filter(
      (s) => s.name.toLowerCase().includes(filterText.toLowerCase()) || s.id.toLowerCase().includes(filterText.toLowerCase()) || s.country.toLowerCase().includes(filterText.toLowerCase())
    );
  }, [filterText, students]);
  const handleStatusChange = (e, studentId, newStatus) => {
    e.stopPropagation();
    const student = students.find((s) => s.id === studentId);
    if (!student || !onUpdateStudent) return;
    const currentIndex = ALL_STATUSES.indexOf(student.status);
    const newIndex = ALL_STATUSES.indexOf(newStatus);
    if (newIndex > currentIndex) {
      const countryChecklist = COUNTRY_CHECKLISTS[student.country] || COUNTRY_CHECKLISTS["Default"];
      const studentDocs = student.documents || [];
      const checkStageRequirements = (stageName) => {
        const stageReqs = countryChecklist.find((c) => c.stage === stageName);
        if (!stageReqs) return true;
        const missingDocs = stageReqs.items.filter((item) => {
          const hasValidDoc = studentDocs.some(
            (d) => (d.type === item.docType || d.type.includes(item.docType) || item.docType.includes(d.type)) && d.status !== "Rejected"
          );
          return !hasValidDoc;
        });
        if (missingDocs.length > 0) {
          alert(`Cannot advance to ${newStatus}: Missing or rejected required documents for the ${stageName} stage.

Missing/Rejected: ${missingDocs.map((m) => m.docType).join(", ")}`);
          return false;
        }
        return true;
      };
      if (newIndex > ALL_STATUSES.indexOf("Documentation") && !checkStageRequirements("Documentation")) return;
      if (newIndex > ALL_STATUSES.indexOf("Uni Application") && !checkStageRequirements("Uni Application")) return;
      if (newIndex > ALL_STATUSES.indexOf("Offer Received") && !checkStageRequirements("Offer Received")) return;
    }
    onUpdateStudent({ ...student, status: newStatus });
  };
  const handleAddStudent = (newStudent) => {
    console.log("Adding student:", newStudent.name);
    console.warn("Add student not fully implemented with lifted state yet");
  };
  const getStatusColor = (status) => {
    switch (status) {
      case "New Inquiry":
        return "bg-slate-100 text-slate-700 border-gray-200";
      case "Counseling":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "Documentation":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "Uni Application":
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
      case "Offer Received":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "Visa Pilot":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };
  const getCounselor = (id) => {
    return EMPLOYEES.find((e) => e.id === id);
  };
  return /* @__PURE__ */ jsxs("div", { className: "space-y-4 animate-in fade-in duration-500", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-semibold tracking-tight text-[#0F172A]", children: "Students" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-500 mt-1", children: "Manage pipeline, documents, and visa applications." })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              placeholder: "Search...",
              value: filterText,
              onChange: (e) => setFilterText(e.target.value),
              className: "pl-3 pr-8 py-2 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-slate-100 focus:border-slate-300 w-64 transition-all"
            }
          ),
          /* @__PURE__ */ jsx(Filter, { size: 14, className: "absolute right-2.5 top-3 text-gray-400" })
        ] }),
        /* @__PURE__ */ jsxs(Button, { onClick: () => setIsAddModalOpen(true), className: "bg-[#0F172A] hover:bg-slate-800", children: [
          /* @__PURE__ */ jsx(UserPlus, { size: 16, className: "mr-2" }),
          "Add Student"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden", children: [
      /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-sm text-left", children: [
        /* @__PURE__ */ jsx("thead", { className: "bg-gray-50 text-slate-500 font-medium border-b border-gray-200", children: /* @__PURE__ */ jsxs("tr", { children: [
          /* @__PURE__ */ jsx("th", { className: "px-6 py-3 w-[120px]", children: "ID" }),
          /* @__PURE__ */ jsx("th", { className: "px-6 py-3", children: "Student Name" }),
          /* @__PURE__ */ jsx("th", { className: "px-6 py-3", children: "Country" }),
          /* @__PURE__ */ jsx("th", { className: "px-6 py-3", children: "Branch" }),
          /* @__PURE__ */ jsx("th", { className: "px-6 py-3", children: "Pipeline Stage" }),
          /* @__PURE__ */ jsx("th", { className: "px-6 py-3", children: "Counselor" }),
          /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-right", children: "Academic" }),
          /* @__PURE__ */ jsx("th", { className: "px-6 py-3 w-[50px]" })
        ] }) }),
        /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-gray-100", children: filteredStudents.map((student) => /* @__PURE__ */ jsxs(
          "tr",
          {
            onClick: () => onSelectStudent(student),
            className: "hover:bg-slate-50 cursor-pointer transition-colors group",
            children: [
              /* @__PURE__ */ jsx("td", { className: "px-6 py-3 font-mono text-xs text-slate-400", children: student.id }),
              /* @__PURE__ */ jsxs("td", { className: "px-6 py-3 font-medium text-slate-900", children: [
                student.name,
                student.priority === "High" && /* @__PURE__ */ jsx("span", { className: "ml-2 inline-block w-2 h-2 rounded-full bg-rose-500", title: "High Priority" })
              ] }),
              /* @__PURE__ */ jsx("td", { className: "px-6 py-3 text-slate-600", children: student.country }),
              /* @__PURE__ */ jsx("td", { className: "px-6 py-3 text-slate-500 text-xs", children: student.branch }),
              /* @__PURE__ */ jsx("td", { className: "px-6 py-3", onClick: (e) => e.stopPropagation(), children: /* @__PURE__ */ jsxs("div", { className: "relative inline-block", children: [
                /* @__PURE__ */ jsx(
                  "select",
                  {
                    value: student.status,
                    onChange: (e) => handleStatusChange(e, student.id, e.target.value),
                    className: `appearance-none cursor-pointer pl-3 pr-8 py-1 rounded-full text-xs font-medium border bg-transparent focus:ring-2 focus:ring-offset-1 focus:outline-none ${getStatusColor(student.status)}`,
                    children: ALL_STATUSES.map((s) => /* @__PURE__ */ jsx("option", { value: s, children: s }, s))
                  }
                ),
                /* @__PURE__ */ jsx(ChevronDown, { size: 12, className: "absolute right-2.5 top-1.5 pointer-events-none opacity-50" })
              ] }) }),
              /* @__PURE__ */ jsxs("td", { className: "px-6 py-3 text-slate-600 flex items-center gap-2", children: [
                getCounselor(student.counselor)?.avatar ? /* @__PURE__ */ jsx("img", { src: getCounselor(student.counselor)?.avatar, alt: getCounselor(student.counselor)?.name, className: "w-5 h-5 rounded-full object-cover", referrerPolicy: "no-referrer" }) : /* @__PURE__ */ jsx("div", { className: "w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-[10px] font-bold", children: (getCounselor(student.counselor)?.name || student.counselor).charAt(0) }),
                getCounselor(student.counselor)?.name || student.counselor
              ] }),
              /* @__PURE__ */ jsxs("td", { className: "px-6 py-3 text-right font-mono text-xs text-slate-500", children: [
                "GPA ",
                student.gpa,
                " | IELTS ",
                student.ielts
              ] }),
              /* @__PURE__ */ jsx("td", { className: "px-6 py-3 text-right", children: /* @__PURE__ */ jsx("button", { className: "text-slate-400 hover:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity", children: /* @__PURE__ */ jsx(MoreHorizontal, { size: 16 }) }) })
            ]
          },
          student.id
        )) })
      ] }) }),
      /* @__PURE__ */ jsxs("div", { className: "px-6 py-3 border-t border-gray-200 bg-gray-50 text-xs text-slate-500 flex justify-between items-center", children: [
        /* @__PURE__ */ jsxs("span", { children: [
          "Showing ",
          filteredStudents.length,
          " of ",
          students.length,
          " students"
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("button", { className: "disabled:opacity-50", disabled: true, children: "Previous" }),
          /* @__PURE__ */ jsx("button", { className: "disabled:opacity-50", children: "Next" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx(
      AddStudentModal,
      {
        isOpen: isAddModalOpen,
        onClose: () => setIsAddModalOpen(false),
        onSubmit: handleAddStudent,
        onNavigate
      }
    )
  ] });
};
export {
  StudentList
};
