
import React, { useState } from 'react';
import { Layout } from './components/Layout';
 
import { AdminDashboard } from './components/AdminDashboard';
import { ManagerDashboard } from './components/ManagerDashboard';
import { StudentList } from './components/StudentList';
import { StudentProfile } from './components/StudentProfile';
import { TaskManager } from './components/TaskManager';
import { BranchAnalytics } from './components/BranchAnalytics';
import { CounselorDashboard } from './components/CounselorDashboard';
import { StudentDashboard } from './components/StudentDashboard';
import { ChatInterface } from './components/ChatInterface';
import { UniversityKnowledgeBase } from './components/UniversityKnowledgeBase';
import { FinanceModule } from './components/FinanceModule'; 
import { CalendarScheduler } from './components/CalendarScheduler'; 
import { CounselorManagement } from './components/CounselorManagement'; 
import { AIResumeBuilder } from './components/AIResumeBuilder';
import { CreateTaskModal } from './components/CreateTaskModal';
import { Student, UserRole, Task, ActivityLog, Message, Employee, Invoice, Appointment } from './types';
import { Bell, X } from 'lucide-react';
import { STUDENTS, TASKS, INITIAL_ACTIVITIES, MOCK_MESSAGES, EMPLOYEES, INVOICES, APPOINTMENTS } from './constants';

// Helper for ID generation to avoid impure function calls during render (linter rule)
const generateId = (prefix: string) => `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

function App() {
  // --- Centralized State for "Interconnected" Workflow ---
  const [students, setStudents] = useState<Student[]>(STUDENTS);
  const [employees, setEmployees] = useState<Employee[]>(EMPLOYEES);
  const [tasks, setTasks] = useState<Task[]>(TASKS);
  const [activities, setActivities] = useState<ActivityLog[]>(INITIAL_ACTIVITIES);
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);
  const [invoices, setInvoices] = useState<Invoice[]>(INVOICES); 
  const [appointments, setAppointments] = useState<Appointment[]>(APPOINTMENTS); 
  
  const [currentView, setCurrentView] = useState('dashboard');
  const [currentRole, setCurrentRole] = useState<UserRole>('Admin');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  // Modal States
  const [isCreateTaskModalOpen, setCreateTaskModalOpen] = useState(false);
  const [taskModalStudent, setTaskModalStudent] = useState<Student | null>(null);

  // Notification State
  const [notifications, setNotifications] = useState<{id: string, title: string, message: string, type: 'success' | 'info' | 'warning'}[]>([]);

  const addNotification = (title: string, message: string, type: 'success' | 'info' | 'warning' = 'info') => {
      const id = generateId('notif');
      setNotifications(prev => [...prev, { id, title, message, type }]);
      setTimeout(() => {
          setNotifications(prev => prev.filter(n => n.id !== id));
      }, 5000);
  };

  // --- Auth Context Simulation ---
  const getCurrentUserObject = (): Student | Employee => {
      if (currentRole === 'Student') {
          return students.find(s => s.id === 'STU1001') || students[0];
      } else if (currentRole === 'Counselor') {
          return employees.find(e => e.id === 'EMP002') || employees[1]; // Sarah
      } else if (currentRole === 'Manager') {
          return employees.find(e => e.id === 'EMP004') || employees[3]; // Devinda
      } else {
          return employees[0]; // Admin
      }
  };
  const currentUser = getCurrentUserObject();


  // --- Handlers ---

  const handleNavigate = (view: string) => {
    setCurrentView(view);
    if (view !== 'student-detail') {
      setSelectedStudent(null);
    }
    if (view !== 'tasks') {
        setSelectedTaskId(null);
    }
  };

  const handleSelectStudent = (student: Student) => {
    const latestStudent = students.find(s => s.id === student.id) || student;
    setSelectedStudent(latestStudent);
    setCurrentView('student-detail');
  };

  const handleSelectTask = (taskId: string) => {
      setSelectedTaskId(taskId);
      setCurrentView('tasks');
  };

  const handleAddActivity = (act: Omit<ActivityLog, 'id' | 'timestamp'>) => {
      const newActivity: ActivityLog = {
          ...act,
          id: generateId('act'),
          timestamp: 'Just now'
      };
      setActivities([newActivity, ...activities]);
  };

  const handleUpdateStudent = (updatedStudent: Student) => {
        const newTasks = generateTasks(updatedStudent);
        if (newTasks.length > 0) {
            handleAddTasks(newTasks);
            addNotification('Auto Task Generation', `${newTasks.length} new tasks generated for ${updatedStudent.name}`, 'info');
        }
      setStudents(prev => prev.map(s => s.id === updatedStudent.id ? updatedStudent : s));
      if (selectedStudent?.id === updatedStudent.id) {
          setSelectedStudent(updatedStudent);
      }
  };

  const handleTransferStudents = (fromCounselorId: string, toCounselorId: string) => {
      setStudents(prev => prev.map(s => s.counselor === fromCounselorId ? { ...s, counselor: toCounselorId } : s));
      setTasks(prev => prev.map(t => {
          if (t.assigned_to.includes(fromCounselorId)) {
              return {
                  ...t,
                  assigned_to: t.assigned_to.map(id => id === fromCounselorId ? toCounselorId : id)
              };
          }
          return t;
      }));

      const fromName = employees.find(e => e.id === fromCounselorId)?.name || fromCounselorId;
      const toName = employees.find(e => e.id === toCounselorId)?.name || toCounselorId;

      handleAddActivity({
          user: currentUser?.name || 'System',
          role: currentRole,
          action: 'transferred students',
          target: `from ${fromName} to ${toName}`,
          type: 'system'
      });
  };

  const handleAddTask = (newTask: Task) => {
      setTasks([newTask, ...tasks]);
      handleAddActivity({
          user: currentRole,
          role: currentRole,
          action: 'created task',
          target: newTask.task,
          type: 'task'
      });
  };

  const handleAddTasks = (newTasks: Task[]) => {
      setTasks([...newTasks, ...tasks]);
      if(newTasks.length > 0) {
          handleAddActivity({
              user: 'System',
              role: 'Admin',
              action: `dispatched ${newTasks.length} automated tasks`,
              target: 'Intelligent Engine',
              type: 'system'
          });
      }
  };
  


  const handleUpdateTasks = (updatedTasks: Task[]) => {
      setTasks(prev => {
          const newTasks = [...prev];
          updatedTasks.forEach(updated => {
              const index = newTasks.findIndex(t => t.id === updated.id);
              if (index !== -1) {
                  // Log status change if it happened
                  if (newTasks[index].status !== updated.status) {
                      handleAddActivity({
                          user: currentRole,
                          role: currentRole,
                          action: `moved task to ${updated.status}`,
                          target: updated.task,
                          type: 'task'
                      });
                  }
                  newTasks[index] = updated;
              }
          });
          return newTasks;
      });
  };

  const handleSendMessage = (text: string, receiverId: string) => {
      const newMessage: Message = {
          id: generateId('msg'),
          senderId: currentUser.id,
          receiverId: receiverId,
          content: text,
          timestamp: new Date().toISOString(),
          read: false,
          platform: 'portal'
      };
      setMessages([...messages, newMessage]);
  };

  const handleCreateInvoice = (newInv: Invoice) => {
      setInvoices([newInv, ...invoices]);
      handleAddActivity({ user: currentRole, role: currentRole, action: 'generated invoice', target: `${newInv.currency} ${newInv.amount} for ${newInv.studentId}`, type: 'finance' });
  };

  const handleUpdateInvoice = (updatedInv: Invoice) => {
      setInvoices(prev => prev.map(inv => inv.id === updatedInv.id ? updatedInv : inv));
      let action = 'updated invoice';
      if(updatedInv.status === 'Paid') action = 'confirmed payment';
      if(updatedInv.status === 'Verifying') action = 'uploaded payment proof';
      handleAddActivity({ user: currentRole, role: currentRole, action: action, target: `${updatedInv.id}`, type: 'finance' });
  };

  const handleBookAppointment = (newApt: Appointment) => {
      setAppointments([...appointments, newApt]);
      
      // 1. Resolve Names for Activity Log
      const studentName = students.find(s => s.id === newApt.studentId)?.name || 'Unknown Student';
      const counselorName = EMPLOYEES.find(e => e.id === newApt.counselorId)?.name || 'Unknown Counselor';

      // 2. Automated Task Generation (The "Push" Logic)
      const preSessionTask: Task = {
          id: generateId('T-PREP'),
          task: `Prep for ${newApt.type} with ${studentName}`,
          assigned_to: [newApt.counselorId],
          student_id: newApt.studentId,
          priority: 'High',
          status: 'Pending',
          dueDate: newApt.date, // Due by the session time
          tier: 'Global', // Generic tier
          phase: 1,
          isBlocking: false
      };
      handleAddTask(preSessionTask);

      // 3. Real-Time Operational Oversight (Live Ops Feed)
      // Format: "John Doe scheduled a Career Counseling session with Sarah Smith."
      handleAddActivity({ 
          user: 'System', 
          role: 'Admin', // System action
          action: 'orchestrated session', 
          target: `${studentName} scheduled a ${newApt.type} session with ${counselorName}`, 
          type: 'calendar' 
      });
  };

  const generateTasks = (student: Student): Task[] => {
        const newTasks: Task[] = [];
        const existingTaskTypes = tasks.filter(t => t.student_id === student.id).map(t => t.documentType);

        // Phase 1: Global Core
        if (student.status === 'Documentation') {
            const requiredDocs = ['Passport', 'Identity', 'Transcript', 'EnglishProficiency'];
            requiredDocs.forEach(docType => {
                if (!existingTaskTypes.includes(docType as any)) {
                    newTasks.push({
                        id: generateId('T-AUTO'),
                        task: `Upload ${docType}`,
                        assigned_to: [student.counselor],
                        student_id: student.id,
                        priority: 'High',
                        status: 'Pending',
                        tier: 'Global',
                        phase: 1,
                        isBlocking: true,
                        documentType: docType as any,
                    });
                }
            });
        }

        // Phase 3: University-Specific
        if (student.targetUniversity) {
            const universityDocs = ['Portfolio', 'ReferenceLetter']; // Simplified for now
            universityDocs.forEach(docType => {
                if (!existingTaskTypes.includes(docType as any)) {
                    newTasks.push({
                        id: generateId('T-AUTO'),
                        task: `Upload ${docType} for ${student.targetUniversity}`,
                        assigned_to: [student.counselor],
                        student_id: student.id,
                        priority: 'Medium',
                        status: 'Pending',
                        tier: 'University',
                        phase: 3,
                        isBlocking: false,
                        documentType: docType as any,
                    });
                }
            });
        }

        // Phase 2: Destination-Specific
        if (student.status === 'Uni Application') {
            let countryDocs: string[] = [];
            switch (student.country) {
                case 'Australia': countryDocs = ['GTE', 'OSHC', 'Financials']; break;
                case 'New Zealand': countryDocs = ['Financials', 'PoliceClearance', 'UpfrontMedicals']; break;
                case 'UK': countryDocs = ['TBTest', 'Financials']; break;
                case 'Canada': countryDocs = ['SOP', 'UpfrontMedicals']; break;
            }
            countryDocs.forEach(docType => {
                if (!existingTaskTypes.includes(docType as any)) {
                    newTasks.push({
                        id: generateId('T-AUTO'),
                        task: `Upload ${docType}`,
                        assigned_to: [student.counselor],
                        student_id: student.id,
                        priority: 'High',
                        status: 'Pending',
                        tier: 'Country',
                        phase: 2,
                        isBlocking: true,
                        documentType: docType as any,
                    });
                }
            });
        }

        return newTasks;
    };

    const handleUpdateAppointment = (updatedApt: Appointment) => {
      setAppointments(prev => prev.map(a => a.id === updatedApt.id ? updatedApt : a));
      if (updatedApt.status !== 'Scheduled') {
          handleAddActivity({ user: currentRole, role: currentRole, action: `marked session as ${updatedApt.status}`, target: `${updatedApt.title} (${updatedApt.studentId})`, type: 'calendar' });
      }
  };

  const handleUpdateEmployee = (updatedEmployee: Employee) => {
      setEmployees(prev => prev.map(e => e.id === updatedEmployee.id ? updatedEmployee : e));
  };

  const handleSaveCV = (cvData: any) => {
    if (currentRole === 'Student') {
      const studentUser = currentUser as Student;
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

  // Modal Handlers
  const handleOpenCreateTaskModal = (student: Student) => {
      setTaskModalStudent(student);
      setCreateTaskModalOpen(true);
  }

  const handleCloseCreateTaskModal = () => {
      setTaskModalStudent(null);
      setCreateTaskModalOpen(false);
  }

  // --- Render Logic ---

  

  const renderContent = () => {
    if (currentView === 'messages') {
        return <ChatInterface currentRole={currentRole} currentUser={currentUser} messages={messages} onSendMessage={handleSendMessage} />;
    }
    if (currentView === 'resume') {
        return <AIResumeBuilder onNavigate={handleNavigate} onSaveCV={handleSaveCV} />;
    }
    if (currentView === 'university') {
        return <UniversityKnowledgeBase onNavigate={handleNavigate} />;
    }
    if (currentView === 'calendar') {
        return <CalendarScheduler appointments={appointments} onBookAppointment={handleBookAppointment} onUpdateAppointment={handleUpdateAppointment} currentRole={currentRole} currentUser={currentUser} employees={employees} onUpdateEmployee={handleUpdateEmployee} />;
    }

    const studentProfileProps = {
        onBack: () => handleNavigate('students'),
        onNavigate: handleNavigate,
        onUpdateStudent: handleUpdateStudent,
        onAddActivity: handleAddActivity,
        onOpenCreateTaskModal: handleOpenCreateTaskModal,
        invoices: invoices,
        onCreateInvoice: handleCreateInvoice,
        onUpdateInvoice: handleUpdateInvoice,
        tasks: tasks,
        onAddTasks: handleAddTasks,
        onUpdateTasks: handleUpdateTasks,
        activities: activities,
    };

    if (currentRole === 'Student') {
        const studentUser = currentUser as Student;
        if (currentView === 'dashboard') return <StudentDashboard student={studentUser} onNavigate={handleNavigate} tasks={tasks} onUpdateTasks={handleUpdateTasks} />;
        if (currentView === 'tasks') return <TaskManager userRole="Student" tasks={tasks} student={studentUser} onUpdateStudent={handleUpdateStudent} onAddActivity={handleAddActivity} currentUser={currentUser} selectedTaskId={selectedTaskId} onUpdateTasks={handleUpdateTasks} onAddTask={handleAddTask} />;
        if (currentView === 'finance') return <FinanceModule student={studentUser} invoices={invoices} userRole="Student" onUpdateInvoice={handleUpdateInvoice} />;
        return <StudentDashboard student={studentUser} onNavigate={handleNavigate} tasks={tasks} onUpdateTasks={handleUpdateTasks} />;
    }

    if (currentRole === 'Counselor') {
        if (currentView === 'dashboard') return <CounselorDashboard onNavigate={handleNavigate} tasks={tasks} currentUser={currentUser} students={students} onSelectStudent={handleSelectStudent} onSelectTask={handleSelectTask} />;
        if (currentView === 'students') return <StudentList onSelectStudent={handleSelectStudent} students={students} onUpdateStudent={handleUpdateStudent} onNavigate={handleNavigate} onAddActivity={handleAddActivity} userRole={currentRole} />;
        if (currentView === 'tasks') return <TaskManager userRole="Counselor" tasks={tasks} currentUser={currentUser} selectedTaskId={selectedTaskId} onUpdateTasks={handleUpdateTasks} onAddTask={handleAddTask} />;
        if (currentView === 'student-detail') return selectedStudent ? 
            <StudentProfile {...studentProfileProps} student={selectedStudent} userRole="Counselor" /> : <StudentList onSelectStudent={handleSelectStudent} students={students} onUpdateStudent={handleUpdateStudent} onNavigate={handleNavigate} onAddActivity={handleAddActivity} userRole={currentRole} />;
        return <CounselorDashboard onNavigate={handleNavigate} tasks={tasks} currentUser={currentUser} students={students} onSelectStudent={handleSelectStudent} onSelectTask={handleSelectTask} />;
    }

    if (currentRole === 'Manager') {
        if (currentView === 'dashboard') return <ManagerDashboard activities={activities} tasks={tasks} onNavigate={handleNavigate} />;
        if (currentView === 'counselors') return <CounselorManagement onNavigate={handleNavigate} students={students} employees={employees} tasks={tasks} onTransferStudents={handleTransferStudents} onAddActivity={handleAddActivity} />;
        if (currentView === 'branch') return <BranchAnalytics />;
        if (currentView === 'students') return <StudentList onSelectStudent={handleSelectStudent} students={students} onUpdateStudent={handleUpdateStudent} onNavigate={handleNavigate} onAddActivity={handleAddActivity} userRole={currentRole} />;
        if (currentView === 'tasks') return <TaskManager userRole="Manager" tasks={tasks} currentUser={currentUser} selectedTaskId={selectedTaskId} onUpdateTasks={handleUpdateTasks} onAddTask={handleAddTask} />;
        if (currentView === 'student-detail') return selectedStudent ? 
             <StudentProfile {...studentProfileProps} student={selectedStudent} userRole="Manager" /> : <StudentList onSelectStudent={handleSelectStudent} students={students} onUpdateStudent={handleUpdateStudent} onNavigate={handleNavigate} onAddActivity={handleAddActivity} userRole={currentRole} />;
        return <ManagerDashboard activities={activities} tasks={tasks} onNavigate={handleNavigate} />;
    }

    // Admin Logic
    switch (currentView) {
      case 'dashboard': return <AdminDashboard activities={activities} tasks={tasks} students={students} />;
      case 'counselors': return <CounselorManagement onNavigate={handleNavigate} students={students} employees={employees} tasks={tasks} onTransferStudents={handleTransferStudents} />;
      case 'branch': return <BranchAnalytics />;
      case 'students': return <StudentList onSelectStudent={handleSelectStudent} students={students} onUpdateStudent={handleUpdateStudent} onNavigate={handleNavigate} onAddActivity={handleAddActivity} userRole={currentRole} />;
      case 'student-detail':
        return selectedStudent ? (
          <StudentProfile {...studentProfileProps} student={selectedStudent} userRole="Admin" />
        ) : (
          <StudentList onSelectStudent={handleSelectStudent} students={students} onUpdateStudent={handleUpdateStudent} onNavigate={handleNavigate} onAddActivity={handleAddActivity} userRole={currentRole} />
        );
      case 'tasks': return <TaskManager userRole="Admin" tasks={tasks} currentUser={currentUser} selectedTaskId={selectedTaskId} onUpdateTasks={handleUpdateTasks} onAddTask={handleAddTask} />;
      default: return <div className="text-center mt-20 text-slate-400">Under Construction</div>;
    }
  };

  return (
    <>
      <Layout 
          activeView={currentView} 
          onNavigate={handleNavigate} 
          currentRole={currentRole}
          onRoleChange={setCurrentRole}
      >
        {renderContent()}
      </Layout>
      {isCreateTaskModalOpen && (
        <CreateTaskModal 
          isOpen={isCreateTaskModalOpen} 
          onClose={handleCloseCreateTaskModal} 
          onSubmit={handleAddTask} 
          student={taskModalStudent}
          currentUser={currentUser}
          userRole={currentRole}
        />
      )}
      
      {/* WhatsApp-style Notifications */}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-3 pointer-events-none">
          {notifications.map(n => (
              <div 
                  key={n.id} 
                  className="bg-white border border-gray-200 rounded-xl shadow-xl p-4 flex items-start gap-4 animate-in slide-in-from-right duration-300 pointer-events-auto max-w-sm"
              >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      n.type === 'success' ? 'bg-emerald-100 text-emerald-600' :
                      n.type === 'warning' ? 'bg-amber-100 text-amber-600' :
                      'bg-indigo-100 text-indigo-600'
                  }`}>
                      <Bell size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-900 truncate">{n.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{n.message}</p>
                  </div>
                  <button onClick={() => setNotifications(prev => prev.filter(notif => notif.id !== n.id))} className="text-slate-400 hover:text-slate-600">
                      <X size={14} />
                  </button>
              </div>
          ))}
      </div>
    </>
  );
}

export default App;
