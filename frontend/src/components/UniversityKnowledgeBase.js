import { jsx, jsxs } from "react/jsx-runtime";
import { useState, useMemo } from "react";
import { UNIVERSITY_PROGRAMS, STUDENTS } from "../constants";
import { Search, BookOpen, MapPin, GraduationCap, CheckCircle, ArrowRight, Loader2, Sparkles } from "lucide-react";
import { Button } from "./Button";
const UniversityKnowledgeBase = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("All");
  const [maxBudget, setMaxBudget] = useState("");
  const [ieltsFilter, setIeltsFilter] = useState("");
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [applyStep, setApplyStep] = useState("select");
  const filteredPrograms = useMemo(() => {
    return UNIVERSITY_PROGRAMS.filter((prog) => {
      const matchesSearch = prog.programName.toLowerCase().includes(searchQuery.toLowerCase()) || prog.university.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCountry = selectedCountry === "All" || prog.country === selectedCountry;
      const matchesBudget = !maxBudget || prog.tuition <= parseFloat(maxBudget);
      const matchesIelts = !ieltsFilter || prog.minIELTS <= parseFloat(ieltsFilter);
      return matchesSearch && matchesCountry && matchesBudget && matchesIelts;
    });
  }, [searchQuery, selectedCountry, maxBudget, ieltsFilter]);
  const handleApplyClick = (program) => {
    setSelectedProgram(program);
    setApplyStep("select");
    setIsApplyModalOpen(true);
    setSelectedStudentId("");
  };
  const handleConfirmApply = () => {
    if (!selectedStudentId) return;
    setApplyStep("processing");
    setTimeout(() => {
      setApplyStep("success");
    }, 2e3);
  };
  const closeApplyModal = () => {
    setIsApplyModalOpen(false);
    setSelectedProgram(null);
  };
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6 animate-in fade-in duration-500 h-[calc(100vh-120px)] flex flex-col", children: [
    /* @__PURE__ */ jsx("div", { className: "flex justify-between items-end shrink-0", children: /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("h1", { className: "text-2xl font-semibold tracking-tight text-[#0F172A]", children: "University Knowledge Base" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-500 mt-1", children: "Search global partners and auto-fill applications." })
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-4 shrink-0", children: [
      /* @__PURE__ */ jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsx(Search, { className: "absolute left-3 top-3 text-gray-400", size: 18 }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            placeholder: "Search by university or program name (e.g. 'Data Science')...",
            className: "w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm",
            value: searchQuery,
            onChange: (e) => setSearchQuery(e.target.value)
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-4 items-end", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-[150px]", children: [
          /* @__PURE__ */ jsx("label", { className: "text-xs font-semibold text-slate-500 uppercase mb-1 block", children: "Destination" }),
          /* @__PURE__ */ jsxs(
            "select",
            {
              className: "w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-md outline-none focus:border-indigo-500",
              value: selectedCountry,
              onChange: (e) => setSelectedCountry(e.target.value),
              children: [
                /* @__PURE__ */ jsx("option", { value: "All", children: "Global (All)" }),
                /* @__PURE__ */ jsx("option", { value: "UK", children: "UK" }),
                /* @__PURE__ */ jsx("option", { value: "Canada", children: "Canada" }),
                /* @__PURE__ */ jsx("option", { value: "Australia", children: "Australia" }),
                /* @__PURE__ */ jsx("option", { value: "New Zealand", children: "New Zealand" }),
                /* @__PURE__ */ jsx("option", { value: "USA", children: "USA" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-[150px]", children: [
          /* @__PURE__ */ jsx("label", { className: "text-xs font-semibold text-slate-500 uppercase mb-1 block", children: "Max Budget" }),
          /* @__PURE__ */ jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsx("span", { className: "absolute left-3 top-2 text-slate-400 text-xs", children: "$" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "number",
                placeholder: "e.g. 20000",
                className: "w-full pl-6 pr-3 py-2 text-sm bg-white border border-gray-200 rounded-md outline-none focus:border-indigo-500",
                value: maxBudget,
                onChange: (e) => setMaxBudget(e.target.value)
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-[150px]", children: [
          /* @__PURE__ */ jsx("label", { className: "text-xs font-semibold text-slate-500 uppercase mb-1 block", children: "Student IELTS" }),
          /* @__PURE__ */ jsxs(
            "select",
            {
              className: "w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-md outline-none focus:border-indigo-500",
              value: ieltsFilter,
              onChange: (e) => setIeltsFilter(e.target.value),
              children: [
                /* @__PURE__ */ jsx("option", { value: "", children: "Any Score" }),
                /* @__PURE__ */ jsx("option", { value: "5.5", children: "5.5+" }),
                /* @__PURE__ */ jsx("option", { value: "6.0", children: "6.0+" }),
                /* @__PURE__ */ jsx("option", { value: "6.5", children: "6.5+" }),
                /* @__PURE__ */ jsx("option", { value: "7.0", children: "7.0+" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsx(Button, { variant: "secondary", onClick: () => {
          setSearchQuery("");
          setSelectedCountry("All");
          setMaxBudget("");
          setIeltsFilter("");
        }, children: "Reset Filters" })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "flex-1 overflow-y-auto min-h-0", children: /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-6", children: filteredPrograms.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "col-span-full text-center py-20 text-slate-400", children: [
      /* @__PURE__ */ jsx(BookOpen, { size: 48, className: "mx-auto mb-4 opacity-20" }),
      /* @__PURE__ */ jsx("p", { children: "No programs match your criteria." }),
      /* @__PURE__ */ jsx("p", { className: "text-sm", children: "Try adjusting the budget or country filters." })
    ] }) : filteredPrograms.map((prog) => /* @__PURE__ */ jsxs("div", { className: "bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow flex flex-col group", children: [
      /* @__PURE__ */ jsxs("div", { className: `h-24 ${prog.logoColor} p-6 flex items-center justify-center relative overflow-hidden`, children: [
        /* @__PURE__ */ jsx("div", { className: "absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" }),
        /* @__PURE__ */ jsx("h3", { className: "text-white font-bold text-xl tracking-tight relative z-10 text-center", children: prog.university })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "p-5 flex-1 flex flex-col", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-start mb-2", children: [
          /* @__PURE__ */ jsx("h4", { className: "font-bold text-slate-900 text-lg leading-tight", children: prog.programName }),
          /* @__PURE__ */ jsxs("span", { className: "text-xs font-bold px-2 py-1 bg-slate-100 text-slate-600 rounded flex items-center shrink-0 ml-2", children: [
            "#",
            prog.ranking,
            " Rank"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-sm text-slate-500 mb-4", children: [
          /* @__PURE__ */ jsx(MapPin, { size: 14 }),
          " ",
          prog.country
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3 text-sm mb-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "bg-gray-50 p-2 rounded border border-gray-100", children: [
            /* @__PURE__ */ jsx("span", { className: "text-xs text-slate-400 block uppercase", children: "Tuition" }),
            /* @__PURE__ */ jsxs("span", { className: "font-semibold text-slate-900", children: [
              prog.currency,
              " ",
              prog.tuition.toLocaleString()
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "bg-gray-50 p-2 rounded border border-gray-100", children: [
            /* @__PURE__ */ jsx("span", { className: "text-xs text-slate-400 block uppercase", children: "Intake" }),
            /* @__PURE__ */ jsx("span", { className: "font-semibold text-slate-900", children: prog.intake })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "bg-gray-50 p-2 rounded border border-gray-100", children: [
            /* @__PURE__ */ jsx("span", { className: "text-xs text-slate-400 block uppercase", children: "Req. IELTS" }),
            /* @__PURE__ */ jsx("span", { className: "font-semibold text-slate-900", children: prog.minIELTS })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "bg-gray-50 p-2 rounded border border-gray-100", children: [
            /* @__PURE__ */ jsx("span", { className: "text-xs text-slate-400 block uppercase", children: "Duration" }),
            /* @__PURE__ */ jsx("span", { className: "font-semibold text-slate-900", children: prog.duration })
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2 mb-6", children: prog.tags.map((tag) => /* @__PURE__ */ jsx("span", { className: "text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-100 font-medium", children: tag }, tag)) }),
        /* @__PURE__ */ jsx("div", { className: "mt-auto pt-4 border-t border-gray-100", children: /* @__PURE__ */ jsxs(Button, { className: "w-full group-hover:bg-indigo-600 group-hover:text-white transition-colors", onClick: () => handleApplyClick(prog), children: [
          "Apply Now ",
          /* @__PURE__ */ jsx(ArrowRight, { size: 16, className: "ml-2" })
        ] }) })
      ] })
    ] }, prog.id)) }) }),
    isApplyModalOpen && selectedProgram && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200", children: /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-xl shadow-2xl w-full max-w-lg border border-gray-100 overflow-hidden scale-100 animate-in zoom-in-95", children: [
      /* @__PURE__ */ jsxs("div", { className: `p-6 text-white ${applyStep === "success" ? "bg-emerald-600" : "bg-[#0F172A]"}`, children: [
        /* @__PURE__ */ jsxs("h3", { className: "font-bold text-lg flex items-center gap-2", children: [
          applyStep === "success" ? /* @__PURE__ */ jsx(CheckCircle, {}) : /* @__PURE__ */ jsx(GraduationCap, {}),
          applyStep === "success" ? "Application Drafted!" : `Apply to ${selectedProgram.university}`
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-white/80 text-xs mt-1", children: applyStep === "success" ? "The student data has been synced to the portal." : `Program: ${selectedProgram.programName} (${selectedProgram.intake})` })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "p-6", children: [
        applyStep === "select" && /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-600", children: "Select a student to auto-fill the application form from the CRM database." }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx("label", { className: "text-xs font-bold text-slate-500 uppercase", children: "Select Student" }),
            /* @__PURE__ */ jsxs(
              "select",
              {
                className: "w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500",
                value: selectedStudentId,
                onChange: (e) => setSelectedStudentId(e.target.value),
                children: [
                  /* @__PURE__ */ jsx("option", { value: "", disabled: true, children: "Choose a student..." }),
                  STUDENTS.filter((s) => s.country === selectedProgram.country).map((s) => /* @__PURE__ */ jsxs("option", { value: s.id, children: [
                    s.name,
                    " (ID: ",
                    s.id,
                    ")"
                  ] }, s.id)),
                  STUDENTS.filter((s) => s.country !== selectedProgram.country).map((s) => /* @__PURE__ */ jsxs("option", { value: s.id, disabled: true, children: [
                    s.name,
                    " (Different Country: ",
                    s.country,
                    ")"
                  ] }, s.id))
                ]
              }
            ),
            /* @__PURE__ */ jsxs("p", { className: "text-[10px] text-slate-400", children: [
              "* Only students targeting ",
              selectedProgram.country,
              " are selectable."
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "pt-4 flex justify-end gap-3", children: [
            /* @__PURE__ */ jsx(Button, { variant: "ghost", onClick: closeApplyModal, children: "Cancel" }),
            /* @__PURE__ */ jsx(Button, { disabled: !selectedStudentId, onClick: handleConfirmApply, children: "Start Auto-Fill" })
          ] })
        ] }),
        applyStep === "processing" && /* @__PURE__ */ jsxs("div", { className: "py-8 text-center space-y-4", children: [
          /* @__PURE__ */ jsx(Loader2, { size: 40, className: "mx-auto text-indigo-600 animate-spin" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h4", { className: "font-bold text-slate-900", children: "Syncing Student Data..." }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-500 mt-1", children: "Mapping Transcripts, SOP, and Passport details." })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "w-full bg-gray-100 rounded-full h-2 max-w-xs mx-auto overflow-hidden", children: /* @__PURE__ */ jsx("div", { className: "h-full bg-indigo-600 rounded-full animate-progress origin-left w-full" }) })
        ] }),
        applyStep === "success" && /* @__PURE__ */ jsxs("div", { className: "text-center space-y-4", children: [
          /* @__PURE__ */ jsx("div", { className: "bg-emerald-50 text-emerald-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-2", children: /* @__PURE__ */ jsx(Sparkles, { size: 32 }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h4", { className: "font-bold text-slate-900 text-lg", children: "Ready for Review" }),
            /* @__PURE__ */ jsxs("p", { className: "text-sm text-slate-500 max-w-xs mx-auto", children: [
              "Application ID ",
              /* @__PURE__ */ jsx("strong", { children: "#APP-8675" }),
              ` has been created. Please review the final draft in the student's "Uni Applications" tab.`
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "pt-4", children: /* @__PURE__ */ jsx(Button, { className: "w-full bg-emerald-600 hover:bg-emerald-700 border-none", onClick: closeApplyModal, children: "Done" }) })
        ] })
      ] })
    ] }) })
  ] });
};
export {
  UniversityKnowledgeBase
};
