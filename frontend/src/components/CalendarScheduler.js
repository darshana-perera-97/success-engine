import { jsx, jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { STUDENTS } from "../constants";
import { Button } from "./Button";
import { ChevronLeft, ChevronRight, Clock, User, CheckCircle, AlertTriangle, Video, Settings, X, Save } from "lucide-react";
const CalendarScheduler = ({ appointments, onBookAppointment, onUpdateAppointment, currentRole, currentUser, employees = [], onUpdateEmployee }) => {
  const [currentDate, setCurrentDate] = useState(/* @__PURE__ */ new Date());
  const [selectedDate, setSelectedDate] = useState(/* @__PURE__ */ new Date());
  const [selectedCounselorId, setSelectedCounselorId] = useState("");
  const [bookingTime, setBookingTime] = useState(null);
  const [bookingType, setBookingType] = useState("Counseling");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [tempAvailability, setTempAvailability] = useState({ days: [1, 2, 3, 4, 5], startHour: 9, endHour: 17 });
  const [outcomeModalOpen, setOutcomeModalOpen] = useState(false);
  const [selectedAptId, setSelectedAptId] = useState(null);
  const [outcomeStatus, setOutcomeStatus] = useState("Completed");
  const [outcomeNotes, setOutcomeNotes] = useState("");
  useEffect(() => {
    if (currentRole === "Student") {
      const s = currentUser;
      if (s.counselor && selectedCounselorId !== s.counselor) {
        setSelectedCounselorId(s.counselor);
      }
    } else if (currentRole === "Counselor") {
      if (currentUser.id && selectedCounselorId !== currentUser.id) {
        setSelectedCounselorId(currentUser.id);
      }
      const emp = employees.find((e) => e.id === currentUser.id);
      if (emp?.availability) {
        const isDifferent = JSON.stringify(emp.availability) !== JSON.stringify(tempAvailability);
        if (isDifferent) {
          setTempAvailability(emp.availability);
        }
      }
    }
  }, [currentRole, currentUser, employees]);
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };
  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };
  const changeMonth = (offset) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
    setSelectedDate(null);
  };
  const formatDate = (date) => {
    return date.toLocaleDateString("en-CA");
  };
  const getCounselor = (id) => employees.find((e) => e.id === id);
  const getStudent = (id) => STUDENTS.find((s) => s.id === id);
  const generateTimeSlots = (date, counselorId) => {
    const counselor = getCounselor(counselorId);
    if (!counselor?.availability) return [];
    const dayOfWeek = date.getDay();
    if (!counselor.availability.days.includes(dayOfWeek)) return [];
    const slots = [];
    const { startHour, endHour } = counselor.availability;
    const dateStr = formatDate(date);
    const dayAppointments = appointments.filter((a) => a.counselorId === counselorId && a.date === dateStr && a.status !== "Cancelled");
    const isBooked = (slotTime) => {
      return dayAppointments.some((a) => {
        return a.time === slotTime;
      });
    };
    for (let h = startHour; h < endHour; h++) {
      const timeString00 = `${h.toString().padStart(2, "0")}:00`;
      if (!isBooked(timeString00)) {
        slots.push(timeString00);
      }
      const timeString30 = `${h.toString().padStart(2, "0")}:30`;
      if (!isBooked(timeString30)) {
        slots.push(timeString30);
      }
    }
    return slots;
  };
  const handleBook = () => {
    if (!selectedDate || !bookingTime || !selectedCounselorId) return;
    const newApt = {
      id: `APT-${Date.now()}`,
      counselorId: selectedCounselorId,
      studentId: currentUser.id,
      title: `${bookingType} Session`,
      date: formatDate(selectedDate),
      time: bookingTime,
      duration: 30,
      // 30 mins default
      type: bookingType,
      status: "Scheduled",
      meetingLink: "https://meet.google.com/abc-defg-hij"
    };
    onBookAppointment(newApt);
    setBookingTime(null);
    alert(`Session booked for ${newApt.date} at ${newApt.time}! Notification sent.`);
  };
  const handleSaveAvailability = () => {
    if (currentRole === "Counselor" && onUpdateEmployee) {
      const updatedEmp = { ...currentUser, availability: tempAvailability };
      onUpdateEmployee(updatedEmp);
      setIsSettingsOpen(false);
      alert("Availability settings updated!");
    }
  };
  const toggleDay = (dayIndex) => {
    setTempAvailability((prev) => {
      const days = prev.days.includes(dayIndex) ? prev.days.filter((d) => d !== dayIndex) : [...prev.days, dayIndex].sort();
      return { ...prev, days };
    });
  };
  const handleLogOutcome = () => {
    if (!selectedAptId) return;
    const apt = appointments.find((a) => a.id === selectedAptId);
    if (apt) {
      onUpdateAppointment({
        ...apt,
        status: outcomeStatus,
        outcomeNotes
      });
      setOutcomeModalOpen(false);
      setOutcomeNotes("");
      setSelectedAptId(null);
    }
  };
  const renderCalendar = () => {
    const days = getDaysInMonth(currentDate);
    const startDay = getFirstDayOfMonth(currentDate);
    const slots = [];
    const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    for (let i = 0; i < startDay; i++) {
      slots.push(/* @__PURE__ */ jsx("div", { className: "h-10" }, `empty-${i}`));
    }
    for (let d = 1; d <= days; d++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), d);
      const dateStr = formatDate(date);
      const isToday = formatDate(/* @__PURE__ */ new Date()) === dateStr;
      const isSelected = selectedDate && formatDate(selectedDate) === dateStr;
      const myAppointmentsDay = appointments.filter((a) => {
        if (currentRole === "Manager" || currentRole === "Admin") return a.date === dateStr;
        if (currentRole === "Counselor") return a.date === dateStr && a.counselorId === currentUser.id;
        return a.date === dateStr && a.studentId === currentUser.id;
      });
      slots.push(
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => setSelectedDate(date),
            className: `h-10 w-10 mx-auto rounded-full flex flex-col items-center justify-center relative transition-all text-sm
                        ${isSelected ? "bg-[#0F172A] text-white shadow-md" : "hover:bg-slate-100 text-slate-700"}
                        ${isToday && !isSelected ? "text-indigo-600 font-bold bg-indigo-50" : ""}
                    `,
            children: [
              d,
              /* @__PURE__ */ jsx("div", { className: "flex gap-0.5 mt-0.5", children: myAppointmentsDay.map((_, i) => i < 3 && /* @__PURE__ */ jsx("div", { className: `w-1 h-1 rounded-full ${isSelected ? "bg-white/50" : "bg-indigo-400"}` }, i)) })
            ]
          },
          d
        )
      );
    }
    return /* @__PURE__ */ jsxs("div", { className: "w-full max-w-sm mx-auto", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center mb-4 px-2", children: [
        /* @__PURE__ */ jsx("button", { onClick: () => changeMonth(-1), className: "p-1 hover:bg-slate-100 rounded-full", children: /* @__PURE__ */ jsx(ChevronLeft, { size: 20 }) }),
        /* @__PURE__ */ jsx("h3", { className: "font-bold text-slate-800", children: currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" }) }),
        /* @__PURE__ */ jsx("button", { onClick: () => changeMonth(1), className: "p-1 hover:bg-slate-100 rounded-full", children: /* @__PURE__ */ jsx(ChevronRight, { size: 20 }) })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "grid grid-cols-7 text-center mb-2", children: weekDays.map((d) => /* @__PURE__ */ jsx("div", { className: "text-xs font-bold text-slate-400 uppercase", children: d }, d)) }),
      /* @__PURE__ */ jsx("div", { className: "grid grid-cols-7 gap-y-2", children: slots })
    ] });
  };
  const pendingReview = currentRole === "Counselor" ? appointments.filter((a) => a.counselorId === currentUser.id && a.status === "Scheduled" && /* @__PURE__ */ new Date(`${a.date}T${a.time}`) < /* @__PURE__ */ new Date()) : [];
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6 animate-in fade-in duration-500 h-full flex flex-col", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-end shrink-0", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-semibold tracking-tight text-[#0F172A]", children: "Calendar & Appointments" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-500 mt-1", children: currentRole === "Student" ? "Book sessions with your counselor." : "Manage your schedule and availability." })
      ] }),
      currentRole === "Counselor" && /* @__PURE__ */ jsxs(Button, { variant: "secondary", size: "sm", onClick: () => setIsSettingsOpen(true), children: [
        /* @__PURE__ */ jsx(Settings, { size: 14, className: "mr-2" }),
        " Availability Settings"
      ] })
    ] }),
    pendingReview.length > 0 && /* @__PURE__ */ jsxs("div", { className: "bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between animate-in slide-in-from-top-2", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx("div", { className: "p-2 bg-amber-100 text-amber-600 rounded-full", children: /* @__PURE__ */ jsx(AlertTriangle, { size: 20 }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h4", { className: "font-bold text-amber-800 text-sm", children: "Action Required" }),
          /* @__PURE__ */ jsxs("p", { className: "text-xs text-amber-700", children: [
            pendingReview.length,
            " past sessions need outcome logging."
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx(Button, { size: "sm", className: "bg-amber-600 hover:bg-amber-700 text-white border-none", onClick: () => {
        setSelectedAptId(pendingReview[0].id);
        setOutcomeModalOpen(true);
      }, children: "Review Now" })
    ] }),
    isSettingsOpen && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in", children: /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-xl shadow-xl w-full max-w-md scale-100 animate-in zoom-in-95 overflow-hidden", children: [
      /* @__PURE__ */ jsxs("div", { className: "p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50", children: [
        /* @__PURE__ */ jsxs("h3", { className: "font-bold text-slate-900 flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(Settings, { size: 18 }),
          " Availability Settings"
        ] }),
        /* @__PURE__ */ jsx("button", { onClick: () => setIsSettingsOpen(false), className: "text-slate-400 hover:text-slate-600", children: /* @__PURE__ */ jsx(X, { size: 20 }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "p-6 space-y-6", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "text-xs font-bold text-slate-500 uppercase block mb-3", children: "Available Days" }),
          /* @__PURE__ */ jsx("div", { className: "flex justify-between gap-1", children: ["S", "M", "T", "W", "T", "F", "S"].map((day, i) => {
            const isSelected = tempAvailability.days.includes(i);
            return /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => toggleDay(i),
                className: `w-10 h-10 rounded-full text-sm font-bold transition-all flex items-center justify-center
                                                    ${isSelected ? "bg-indigo-600 text-white shadow-md" : "bg-slate-100 text-slate-400 hover:bg-slate-200"}
                                                `,
                children: day
              },
              i
            );
          }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "text-xs font-bold text-slate-500 uppercase block mb-2", children: "Start Time" }),
            /* @__PURE__ */ jsx(
              "select",
              {
                className: "w-full p-2 border border-gray-200 rounded-lg text-sm",
                value: tempAvailability.startHour,
                onChange: (e) => setTempAvailability((prev) => ({ ...prev, startHour: parseInt(e.target.value) })),
                children: Array.from({ length: 24 }).map((_, i) => /* @__PURE__ */ jsxs("option", { value: i, children: [
                  i.toString().padStart(2, "0"),
                  ":00"
                ] }, i))
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "text-xs font-bold text-slate-500 uppercase block mb-2", children: "End Time" }),
            /* @__PURE__ */ jsx(
              "select",
              {
                className: "w-full p-2 border border-gray-200 rounded-lg text-sm",
                value: tempAvailability.endHour,
                onChange: (e) => setTempAvailability((prev) => ({ ...prev, endHour: parseInt(e.target.value) })),
                children: Array.from({ length: 24 }).map((_, i) => /* @__PURE__ */ jsxs("option", { value: i, children: [
                  i.toString().padStart(2, "0"),
                  ":00"
                ] }, i))
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-blue-50 p-3 rounded-lg flex gap-3 items-start", children: [
          /* @__PURE__ */ jsx(Clock, { size: 16, className: "text-blue-600 shrink-0 mt-0.5" }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-blue-800", children: "Students will be able to book 30-minute sessions within these hours." })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-2", children: [
        /* @__PURE__ */ jsx(Button, { variant: "ghost", onClick: () => setIsSettingsOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxs(Button, { onClick: handleSaveAvailability, children: [
          /* @__PURE__ */ jsx(Save, { size: 16, className: "mr-2" }),
          " Save Settings"
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1 min-h-0", children: [
      /* @__PURE__ */ jsxs("div", { className: "lg:col-span-4 bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-fit", children: [
        renderCalendar(),
        /* @__PURE__ */ jsx("div", { className: "mt-8 pt-6 border-t border-gray-100 space-y-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between text-sm", children: [
          /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-2 text-slate-600", children: [
            /* @__PURE__ */ jsx("div", { className: "w-2 h-2 rounded-full bg-indigo-500" }),
            " Upcoming"
          ] }),
          /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-2 text-slate-600", children: [
            /* @__PURE__ */ jsx("div", { className: "w-2 h-2 rounded-full bg-emerald-500" }),
            " Completed"
          ] })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "lg:col-span-8 space-y-6 flex flex-col", children: [
        selectedDate && currentRole !== "Manager" && currentRole !== "Admin" && /* @__PURE__ */ jsxs("div", { className: "bg-white p-6 rounded-xl border border-gray-200 shadow-sm animate-in slide-in-from-left-2", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center mb-4", children: [
            /* @__PURE__ */ jsxs("h3", { className: "font-bold text-slate-900 flex items-center gap-2", children: [
              /* @__PURE__ */ jsx(Clock, { size: 18, className: "text-slate-400" }),
              "Available Slots for ",
              selectedDate.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
            ] }),
            currentRole === "Student" && /* @__PURE__ */ jsxs(
              "select",
              {
                className: "text-xs border-gray-200 rounded-md p-1.5 bg-gray-50 outline-none focus:ring-1 focus:ring-indigo-500",
                value: bookingType,
                onChange: (e) => setBookingType(e.target.value),
                children: [
                  /* @__PURE__ */ jsx("option", { value: "Counseling", children: "Counseling" }),
                  /* @__PURE__ */ jsx("option", { value: "Visa Check", children: "Visa Check" }),
                  /* @__PURE__ */ jsx("option", { value: "Mock Interview", children: "Mock Interview" })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 mb-6", children: [
            selectedCounselorId ? generateTimeSlots(selectedDate, selectedCounselorId).map((time) => /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => setBookingTime(time),
                className: `py-2 px-1 rounded-md text-xs font-medium border transition-all
                                            ${bookingTime === time ? "bg-indigo-600 text-white border-indigo-600 shadow-md" : "bg-white border-gray-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-600"}
                                        `,
                children: time
              },
              time
            )) : /* @__PURE__ */ jsx("div", { className: "col-span-full text-center text-slate-400 text-sm py-4", children: "Select a counselor to view availability." }),
            selectedCounselorId && generateTimeSlots(selectedDate, selectedCounselorId).length === 0 && /* @__PURE__ */ jsx("div", { className: "col-span-full text-center text-slate-400 text-sm py-4 italic", children: "No slots available on this date." })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "flex justify-end pt-4 border-t border-gray-100", children: /* @__PURE__ */ jsxs(Button, { disabled: !bookingTime, onClick: handleBook, children: [
            "Book ",
            bookingType
          ] }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-white border border-gray-200 rounded-xl shadow-sm flex-1 overflow-hidden flex flex-col", children: [
          /* @__PURE__ */ jsx("div", { className: "p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center", children: /* @__PURE__ */ jsx("h3", { className: "font-bold text-slate-900 text-sm uppercase tracking-wide", children: "Scheduled Sessions" }) }),
          /* @__PURE__ */ jsxs("div", { className: "divide-y divide-gray-100 overflow-y-auto flex-1 p-0", children: [
            appointments.filter((a) => {
              if (currentRole === "Manager" || currentRole === "Admin") return true;
              if (currentRole === "Counselor") return a.counselorId === currentUser.id;
              return a.studentId === currentUser.id;
            }).sort((a, b) => {
              const dateA = /* @__PURE__ */ new Date(`${a.date}T${a.time}`);
              const dateB = /* @__PURE__ */ new Date(`${b.date}T${b.time}`);
              const now = /* @__PURE__ */ new Date();
              const isPastA = dateA < now;
              const isPastB = dateB < now;
              if (isPastA && !isPastB) return 1;
              if (!isPastA && isPastB) return -1;
              if (!isPastA && !isPastB) {
                return dateA.getTime() - dateB.getTime();
              } else {
                return dateB.getTime() - dateA.getTime();
              }
            }).map((apt) => {
              const isPast = /* @__PURE__ */ new Date(`${apt.date}T${apt.time}`) < /* @__PURE__ */ new Date();
              const student = getStudent(apt.studentId);
              const counselor = getCounselor(apt.counselorId);
              const otherName = currentRole === "Student" ? counselor?.name : student?.name;
              return /* @__PURE__ */ jsxs("div", { className: "p-4 hover:bg-slate-50 transition-colors flex items-center justify-between group", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
                  /* @__PURE__ */ jsxs("div", { className: `flex flex-col items-center justify-center w-12 h-12 rounded-lg border ${isPast ? "bg-slate-50 border-slate-200 text-slate-400" : "bg-indigo-50 border-indigo-100 text-indigo-700"}`, children: [
                    /* @__PURE__ */ jsx("span", { className: "text-xs font-bold uppercase", children: new Date(apt.date).toLocaleDateString("en-US", { month: "short" }) }),
                    /* @__PURE__ */ jsx("span", { className: "text-lg font-bold leading-none", children: new Date(apt.date).getDate() })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx("h4", { className: `font-semibold ${isPast ? "text-slate-500" : "text-slate-900"}`, children: apt.title }),
                    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 text-xs text-slate-500 mt-1", children: [
                      /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1", children: [
                        /* @__PURE__ */ jsx(Clock, { size: 12 }),
                        " ",
                        apt.time,
                        " (",
                        apt.duration,
                        "m)"
                      ] }),
                      /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1", children: [
                        /* @__PURE__ */ jsx(User, { size: 12 }),
                        " ",
                        otherName
                      ] }),
                      apt.status === "Completed" && /* @__PURE__ */ jsxs("span", { className: "text-emerald-600 flex items-center gap-1", children: [
                        /* @__PURE__ */ jsx(CheckCircle, { size: 12 }),
                        " Completed"
                      ] })
                    ] })
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                  !isPast && apt.status === "Scheduled" && /* @__PURE__ */ jsxs(Button, { size: "sm", variant: "secondary", className: "h-8", children: [
                    /* @__PURE__ */ jsx(Video, { size: 14, className: "mr-2" }),
                    " Join"
                  ] }),
                  isPast && apt.status === "Scheduled" && currentRole === "Counselor" && /* @__PURE__ */ jsx(Button, { size: "sm", className: "h-8 bg-amber-600 hover:bg-amber-700 border-none text-white", onClick: () => {
                    setSelectedAptId(apt.id);
                    setOutcomeModalOpen(true);
                  }, children: "Log Outcome" })
                ] })
              ] }, apt.id);
            }),
            appointments.length === 0 && /* @__PURE__ */ jsx("div", { className: "p-8 text-center text-slate-400 text-sm", children: "No appointments found." })
          ] })
        ] })
      ] })
    ] }),
    outcomeModalOpen && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in", children: /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-xl shadow-xl p-6 w-full max-w-md scale-100 animate-in zoom-in-95", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-lg text-slate-900 mb-4", children: "Log Session Outcome" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "text-xs font-bold text-slate-500 uppercase block mb-2", children: "Status" }),
          /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => setOutcomeStatus("Completed"),
                className: `flex-1 py-2 rounded-md text-sm font-medium border ${outcomeStatus === "Completed" ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "border-gray-200 text-slate-600"}`,
                children: "Completed"
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => setOutcomeStatus("No Show"),
                className: `flex-1 py-2 rounded-md text-sm font-medium border ${outcomeStatus === "No Show" ? "bg-rose-50 border-rose-200 text-rose-700" : "border-gray-200 text-slate-600"}`,
                children: "No Show"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "text-xs font-bold text-slate-500 uppercase block mb-2", children: "Session Notes" }),
          /* @__PURE__ */ jsx(
            "textarea",
            {
              className: "w-full p-3 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 outline-none resize-none",
              rows: 4,
              placeholder: "Key discussion points and next steps...",
              value: outcomeNotes,
              onChange: (e) => setOutcomeNotes(e.target.value)
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-2 pt-2", children: [
          /* @__PURE__ */ jsx(Button, { variant: "ghost", onClick: () => setOutcomeModalOpen(false), children: "Cancel" }),
          /* @__PURE__ */ jsx(Button, { onClick: handleLogOutcome, children: "Save Log" })
        ] })
      ] })
    ] }) })
  ] });
};
export {
  CalendarScheduler
};
