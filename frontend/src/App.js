import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Layout } from "./components/Layout";
import { AdminDashboard } from "./components/AdminDashboard";
import { ManagerDashboard } from "./components/ManagerDashboard";
import { StudentList } from "./components/StudentList";
import { StudentProfile } from "./components/StudentProfile";
import { TaskManager } from "./components/TaskManager";
import { BranchAnalytics } from "./components/BranchAnalytics";
import { CounselorDashboard } from "./components/CounselorDashboard";
import { StudentDashboard } from "./components/StudentDashboard";
import { ChatInterface } from "./components/ChatInterface";
import { UniversityKnowledgeBase } from "./components/UniversityKnowledgeBase";
import { FinanceModule } from "./components/FinanceModule";
import { CalendarScheduler } from "./components/CalendarScheduler";
import { CounselorManagement } from "./components/CounselorManagement";
import { AIResumeBuilder } from "./components/AIResumeBuilder";
import { CreateTaskModal } from "./components/CreateTaskModal";
import { Bell, X } from "lucide-react";
import { STUDENTS, TASKS, INITIAL_ACTIVITIES, MOCK_MESSAGES, EMPLOYEES, INVOICES, APPOINTMENTS } from "./constants";
const generateId = (prefix) => `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1e4)}`;
function App({ initialView = "dashboard" }) {
  const [students, setStudents] = useState(STUDENTS);
  const [employees, setEmployees] = useState(EMPLOYEES);
  const [tasks, setTasks] = useState(TASKS);
  const [activities, setActivities] = useState(INITIAL_ACTIVITIES);
  const [messages, setMessages] = useState(MOCK_MESSAGES);
  const [invoices, setInvoices] = useState(INVOICES);
  const [appointments, setAppointments] = useState(APPOINTMENTS);
  const [currentView, setCurrentView] = useState(initialView);
  const [currentRole, setCurrentRole] = useState("Admin");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [isCreateTaskModalOpen, setCreateTaskModalOpen] = useState(false);
  const [taskModalStudent, setTaskModalStudent] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const addNotification = (title, message, type = "info") => {
    const id = generateId("notif");
    setNotifications((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 5e3);
  };
  const getCurrentUserObject = () => {
    if (currentRole === "Student") {
      return students.find((s) => s.id === "STU1001") || students[0];
    } else if (currentRole === "Counselor") {
      return employees.find((e) => e.id === "EMP002") || employees[1];
    } else if (currentRole === "Manager") {
      return employees.find((e) => e.id === "EMP004") || employees[3];
    } else {
      return employees[0];
    }
  };
  const currentUser = getCurrentUserObject();
  const handleNavigate = (view) => {
    setCurrentView(view);
    if (view !== "student-detail") {
      setSelectedStudent(null);
    }
    if (view !== "tasks") {
      setSelectedTaskId(null);
    }
  };
  const handleSelectStudent = (student) => {
    const latestStudent = students.find((s) => s.id === student.id) || student;
    setSelectedStudent(latestStudent);
    setCurrentView("student-detail");
  };
  const handleSelectTask = (taskId) => {
    setSelectedTaskId(taskId);
    setCurrentView("tasks");
  };
  const handleAddActivity = (act) => {
    const newActivity = {
      ...act,
      id: generateId("act"),
      timestamp: "Just now"
    };
    setActivities([newActivity, ...activities]);
  };
  const handleUpdateStudent = (updatedStudent) => {
    const newTasks = generateTasks(updatedStudent);
    if (newTasks.length > 0) {
      handleAddTasks(newTasks);
      addNotification("Auto Task Generation", `${newTasks.length} new tasks generated for ${updatedStudent.name}`, "info");
    }
    setStudents((prev) => prev.map((s) => s.id === updatedStudent.id ? updatedStudent : s));
    if (selectedStudent?.id === updatedStudent.id) {
      setSelectedStudent(updatedStudent);
    }
  };
  const handleTransferStudents = (fromCounselorId, toCounselorId) => {
    setStudents((prev) => prev.map((s) => s.counselor === fromCounselorId ? { ...s, counselor: toCounselorId } : s));
    setTasks((prev) => prev.map((t) => {
      if (t.assigned_to.includes(fromCounselorId)) {
        return {
          ...t,
          assigned_to: t.assigned_to.map((id) => id === fromCounselorId ? toCounselorId : id)
        };
      }
      return t;
    }));
    const fromName = employees.find((e) => e.id === fromCounselorId)?.name || fromCounselorId;
    const toName = employees.find((e) => e.id === toCounselorId)?.name || toCounselorId;
    handleAddActivity({
      user: currentUser?.name || "System",
      role: currentRole,
      action: "transferred students",
      target: `from ${fromName} to ${toName}`,
      type: "system"
    });
  };
  const handleAddTask = (newTask) => {
    setTasks([newTask, ...tasks]);
    handleAddActivity({
      user: currentRole,
      role: currentRole,
      action: "created task",
      target: newTask.task,
      type: "task"
    });
  };
  const handleAddTasks = (newTasks) => {
    setTasks([...newTasks, ...tasks]);
    if (newTasks.length > 0) {
      handleAddActivity({
        user: "System",
        role: "Admin",
        action: `dispatched ${newTasks.length} automated tasks`,
        target: "Intelligent Engine",
        type: "system"
      });
    }
  };
  const handleUpdateTasks = (updatedTasks) => {
    setTasks((prev) => {
      const newTasks = [...prev];
      updatedTasks.forEach((updated) => {
        const index = newTasks.findIndex((t) => t.id === updated.id);
        if (index !== -1) {
          if (newTasks[index].status !== updated.status) {
            handleAddActivity({
              user: currentRole,
              role: currentRole,
              action: `moved task to ${updated.status}`,
              target: updated.task,
              type: "task"
            });
          }
          newTasks[index] = updated;
        }
      });
      return newTasks;
    });
  };
  const handleSendMessage = (text, receiverId) => {
    const newMessage = {
      id: generateId("msg"),
      senderId: currentUser.id,
      receiverId,
      content: text,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      read: false,
      platform: "portal"
    };
    setMessages([...messages, newMessage]);
  };
  const handleCreateInvoice = (newInv) => {
    setInvoices([newInv, ...invoices]);
    handleAddActivity({ user: currentRole, role: currentRole, action: "generated invoice", target: `${newInv.currency} ${newInv.amount} for ${newInv.studentId}`, type: "finance" });
  };
  const handleUpdateInvoice = (updatedInv) => {
    setInvoices((prev) => prev.map((inv) => inv.id === updatedInv.id ? updatedInv : inv));
    let action = "updated invoice";
    if (updatedInv.status === "Paid") action = "confirmed payment";
    if (updatedInv.status === "Verifying") action = "uploaded payment proof";
    handleAddActivity({ user: currentRole, role: currentRole, action, target: `${updatedInv.id}`, type: "finance" });
  };
  const handleBookAppointment = (newApt) => {
    setAppointments([...appointments, newApt]);
    const studentName = students.find((s) => s.id === newApt.studentId)?.name || "Unknown Student";
    const counselorName = EMPLOYEES.find((e) => e.id === newApt.counselorId)?.name || "Unknown Counselor";
    const preSessionTask = {
      id: generateId("T-PREP"),
      task: `Prep for ${newApt.type} with ${studentName}`,
      assigned_to: [newApt.counselorId],
      student_id: newApt.studentId,
      priority: "High",
      status: "Pending",
      dueDate: newApt.date,
      // Due by the session time
      tier: "Global",
      // Generic tier
      phase: 1,
      isBlocking: false
    };
    handleAddTask(preSessionTask);
    handleAddActivity({
      user: "System",
      role: "Admin",
      // System action
      action: "orchestrated session",
      target: `${studentName} scheduled a ${newApt.type} session with ${counselorName}`,
      type: "calendar"
    });
  };
  const generateTasks = (student) => {
    const newTasks = [];
    const existingTaskTypes = tasks.filter((t) => t.student_id === student.id).map((t) => t.documentType);
    if (student.status === "Documentation") {
      const requiredDocs = ["Passport", "Identity", "Transcript", "EnglishProficiency"];
      requiredDocs.forEach((docType) => {
        if (!existingTaskTypes.includes(docType)) {
          newTasks.push({
            id: generateId("T-AUTO"),
            task: `Upload ${docType}`,
            assigned_to: [student.counselor],
            student_id: student.id,
            priority: "High",
            status: "Pending",
            tier: "Global",
            phase: 1,
            isBlocking: true,
            documentType: docType
          });
        }
      });
    }
    if (student.targetUniversity) {
      const universityDocs = ["Portfolio", "ReferenceLetter"];
      universityDocs.forEach((docType) => {
        if (!existingTaskTypes.includes(docType)) {
          newTasks.push({
            id: generateId("T-AUTO"),
            task: `Upload ${docType} for ${student.targetUniversity}`,
            assigned_to: [student.counselor],
            student_id: student.id,
            priority: "Medium",
            status: "Pending",
            tier: "University",
            phase: 3,
            isBlocking: false,
            documentType: docType
          });
        }
      });
    }
    if (student.status === "Uni Application") {
      let countryDocs = [];
      switch (student.country) {
        case "Australia":
          countryDocs = ["GTE", "OSHC", "Financials"];
          break;
        case "New Zealand":
          countryDocs = ["Financials", "PoliceClearance", "UpfrontMedicals"];
          break;
        case "UK":
          countryDocs = ["TBTest", "Financials"];
          break;
        case "Canada":
          countryDocs = ["SOP", "UpfrontMedicals"];
          break;
      }
      countryDocs.forEach((docType) => {
        if (!existingTaskTypes.includes(docType)) {
          newTasks.push({
            id: generateId("T-AUTO"),
            task: `Upload ${docType}`,
            assigned_to: [student.counselor],
            student_id: student.id,
            priority: "High",
            status: "Pending",
            tier: "Country",
            phase: 2,
            isBlocking: true,
            documentType: docType
          });
        }
      });
    }
    return newTasks;
  };
  const handleUpdateAppointment = (updatedApt) => {
    setAppointments((prev) => prev.map((a) => a.id === updatedApt.id ? updatedApt : a));
    if (updatedApt.status !== "Scheduled") {
      handleAddActivity({ user: currentRole, role: currentRole, action: `marked session as ${updatedApt.status}`, target: `${updatedApt.title} (${updatedApt.studentId})`, type: "calendar" });
    }
  };
  const handleUpdateEmployee = (updatedEmployee) => {
    setEmployees((prev) => prev.map((e) => e.id === updatedEmployee.id ? updatedEmployee : e));
  };
  const handleSaveCV = (cvData) => {
    if (currentRole === "Student") {
      const studentUser = currentUser;
      handleUpdateStudent({
        ...studentUser,
        generatedCV: cvData
      });
    } else if (selectedStudent) {
      handleUpdateStudent({
        ...selectedStudent,
        generatedCV: cvData
      });
    }
  };
  const handleOpenCreateTaskModal = (student) => {
    setTaskModalStudent(student);
    setCreateTaskModalOpen(true);
  };
  const handleCloseCreateTaskModal = () => {
    setTaskModalStudent(null);
    setCreateTaskModalOpen(false);
  };
  const renderContent = () => {
    if (currentView === "messages") {
      return /* @__PURE__ */ jsx(ChatInterface, { currentRole, currentUser, messages, onSendMessage: handleSendMessage });
    }
    if (currentView === "resume") {
      return /* @__PURE__ */ jsx(AIResumeBuilder, { onNavigate: handleNavigate, onSaveCV: handleSaveCV });
    }
    if (currentView === "university") {
      return /* @__PURE__ */ jsx(UniversityKnowledgeBase, { onNavigate: handleNavigate });
    }
    if (currentView === "calendar") {
      return /* @__PURE__ */ jsx(CalendarScheduler, { appointments, onBookAppointment: handleBookAppointment, onUpdateAppointment: handleUpdateAppointment, currentRole, currentUser, employees, onUpdateEmployee: handleUpdateEmployee });
    }
    const studentProfileProps = {
      onBack: () => handleNavigate("students"),
      onNavigate: handleNavigate,
      onUpdateStudent: handleUpdateStudent,
      onAddActivity: handleAddActivity,
      onOpenCreateTaskModal: handleOpenCreateTaskModal,
      invoices,
      onCreateInvoice: handleCreateInvoice,
      onUpdateInvoice: handleUpdateInvoice,
      tasks,
      onAddTasks: handleAddTasks,
      onUpdateTasks: handleUpdateTasks,
      activities
    };
    if (currentRole === "Student") {
      const studentUser = currentUser;
      if (currentView === "dashboard") return /* @__PURE__ */ jsx(StudentDashboard, { student: studentUser, onNavigate: handleNavigate, tasks, onUpdateTasks: handleUpdateTasks });
      if (currentView === "tasks") return /* @__PURE__ */ jsx(TaskManager, { userRole: "Student", tasks, student: studentUser, onUpdateStudent: handleUpdateStudent, onAddActivity: handleAddActivity, currentUser, selectedTaskId, onUpdateTasks: handleUpdateTasks, onAddTask: handleAddTask });
      if (currentView === "finance") return /* @__PURE__ */ jsx(FinanceModule, { student: studentUser, invoices, userRole: "Student", onUpdateInvoice: handleUpdateInvoice });
      return /* @__PURE__ */ jsx(StudentDashboard, { student: studentUser, onNavigate: handleNavigate, tasks, onUpdateTasks: handleUpdateTasks });
    }
    if (currentRole === "Counselor") {
      if (currentView === "dashboard") return /* @__PURE__ */ jsx(CounselorDashboard, { onNavigate: handleNavigate, tasks, currentUser, students, onSelectStudent: handleSelectStudent, onSelectTask: handleSelectTask });
      if (currentView === "students") return /* @__PURE__ */ jsx(StudentList, { onSelectStudent: handleSelectStudent, students, onUpdateStudent: handleUpdateStudent, onNavigate: handleNavigate, onAddActivity: handleAddActivity, userRole: currentRole });
      if (currentView === "tasks") return /* @__PURE__ */ jsx(TaskManager, { userRole: "Counselor", tasks, currentUser, selectedTaskId, onUpdateTasks: handleUpdateTasks, onAddTask: handleAddTask });
      if (currentView === "student-detail") return selectedStudent ? /* @__PURE__ */ jsx(StudentProfile, { ...studentProfileProps, student: selectedStudent, userRole: "Counselor" }) : /* @__PURE__ */ jsx(StudentList, { onSelectStudent: handleSelectStudent, students, onUpdateStudent: handleUpdateStudent, onNavigate: handleNavigate, onAddActivity: handleAddActivity, userRole: currentRole });
      return /* @__PURE__ */ jsx(CounselorDashboard, { onNavigate: handleNavigate, tasks, currentUser, students, onSelectStudent: handleSelectStudent, onSelectTask: handleSelectTask });
    }
    if (currentRole === "Manager") {
      if (currentView === "dashboard") return /* @__PURE__ */ jsx(ManagerDashboard, { activities, tasks, onNavigate: handleNavigate });
      if (currentView === "counselors") return /* @__PURE__ */ jsx(CounselorManagement, { onNavigate: handleNavigate, students, employees, tasks, onTransferStudents: handleTransferStudents, onAddActivity: handleAddActivity });
      if (currentView === "branch") return /* @__PURE__ */ jsx(BranchAnalytics, {});
      if (currentView === "students") return /* @__PURE__ */ jsx(StudentList, { onSelectStudent: handleSelectStudent, students, onUpdateStudent: handleUpdateStudent, onNavigate: handleNavigate, onAddActivity: handleAddActivity, userRole: currentRole });
      if (currentView === "tasks") return /* @__PURE__ */ jsx(TaskManager, { userRole: "Manager", tasks, currentUser, selectedTaskId, onUpdateTasks: handleUpdateTasks, onAddTask: handleAddTask });
      if (currentView === "student-detail") return selectedStudent ? /* @__PURE__ */ jsx(StudentProfile, { ...studentProfileProps, student: selectedStudent, userRole: "Manager" }) : /* @__PURE__ */ jsx(StudentList, { onSelectStudent: handleSelectStudent, students, onUpdateStudent: handleUpdateStudent, onNavigate: handleNavigate, onAddActivity: handleAddActivity, userRole: currentRole });
      return /* @__PURE__ */ jsx(ManagerDashboard, { activities, tasks, onNavigate: handleNavigate });
    }
    switch (currentView) {
      case "dashboard":
        return /* @__PURE__ */ jsx(AdminDashboard, { activities, tasks, students });
      case "counselors":
        return /* @__PURE__ */ jsx(CounselorManagement, { onNavigate: handleNavigate, students, employees, tasks, onTransferStudents: handleTransferStudents });
      case "branch":
        return /* @__PURE__ */ jsx(BranchAnalytics, {});
      case "students":
        return /* @__PURE__ */ jsx(StudentList, { onSelectStudent: handleSelectStudent, students, onUpdateStudent: handleUpdateStudent, onNavigate: handleNavigate, onAddActivity: handleAddActivity, userRole: currentRole });
      case "student-detail":
        return selectedStudent ? /* @__PURE__ */ jsx(StudentProfile, { ...studentProfileProps, student: selectedStudent, userRole: "Admin" }) : /* @__PURE__ */ jsx(StudentList, { onSelectStudent: handleSelectStudent, students, onUpdateStudent: handleUpdateStudent, onNavigate: handleNavigate, onAddActivity: handleAddActivity, userRole: currentRole });
      case "tasks":
        return /* @__PURE__ */ jsx(TaskManager, { userRole: "Admin", tasks, currentUser, selectedTaskId, onUpdateTasks: handleUpdateTasks, onAddTask: handleAddTask });
      default:
        return /* @__PURE__ */ jsx("div", { className: "text-center mt-20 text-slate-400", children: "Under Construction" });
    }
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(
      Layout,
      {
        activeView: currentView,
        onNavigate: handleNavigate,
        currentRole,
        onRoleChange: setCurrentRole,
        children: renderContent()
      }
    ),
    isCreateTaskModalOpen && /* @__PURE__ */ jsx(
      CreateTaskModal,
      {
        isOpen: isCreateTaskModalOpen,
        onClose: handleCloseCreateTaskModal,
        onSubmit: handleAddTask,
        student: taskModalStudent,
        currentUser,
        userRole: currentRole
      }
    ),
    /* @__PURE__ */ jsx("div", { className: "fixed top-4 right-4 z-[100] flex flex-col gap-3 pointer-events-none", children: notifications.map((n) => /* @__PURE__ */ jsxs(
      "div",
      {
        className: "bg-white border border-gray-200 rounded-xl shadow-xl p-4 flex items-start gap-4 animate-in slide-in-from-right duration-300 pointer-events-auto max-w-sm",
        children: [
          /* @__PURE__ */ jsx("div", { className: `w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${n.type === "success" ? "bg-emerald-100 text-emerald-600" : n.type === "warning" ? "bg-amber-100 text-amber-600" : "bg-indigo-100 text-indigo-600"}`, children: /* @__PURE__ */ jsx(Bell, { size: 20 }) }),
          /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsx("p", { className: "text-sm font-bold text-slate-900 truncate", children: n.title }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-500 mt-0.5 leading-relaxed", children: n.message })
          ] }),
          /* @__PURE__ */ jsx("button", { onClick: () => setNotifications((prev) => prev.filter((notif) => notif.id !== n.id)), className: "text-slate-400 hover:text-slate-600", children: /* @__PURE__ */ jsx(X, { size: 14 }) })
        ]
      },
      n.id
    )) })
  ] });
}
var App_default = App;
export {
  App_default as default
};
