
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Student, StudentStatus, UserRole, ActivityLog, Task, Invoice } from '../types';
import { Button } from './Button';

import { 
  ArrowLeft, CheckCircle, FileText, Plane, ShieldAlert, ChevronRight,
  MapPin, DollarSign, Mail, Phone, Banknote, MessageSquare, PlusCircle, Clock, Download
} from 'lucide-react';
import { DocumentManager } from './DocumentManager';
import { COUNTRY_CHECKLISTS } from '../constants';
import { FinancialCalculator } from './FinancialCalculator';
import { FinanceModule } from './FinanceModule';
import { VisaPilot } from './VisaPilot';

interface StudentProfileProps {
  student: Student;
  onBack: () => void;
  onNavigate: (view: string) => void;
  userRole?: UserRole;
  onUpdateStudent?: (student: Student) => void;
  onAddActivity?: (activity: Omit<ActivityLog, 'id' | 'timestamp'>) => void;
  onOpenCreateTaskModal: (student: Student) => void;
  invoices?: Invoice[];
  onUpdateInvoice?: (invoice: Invoice) => void;
  onCreateInvoice?: (invoice: Invoice) => void;
  tasks?: Task[];
  onAddTasks?: (tasks: Task[]) => void;
  onUpdateTasks?: (tasks: Task[]) => void;
  activities?: ActivityLog[];
}

const PIPELINE_STEPS: StudentStatus[] = [
  'New Inquiry', 'Counseling', 'Documentation', 'Uni Application', 'Offer Received', 'Visa Pilot'
];

const KeyDetails: React.FC<{ student: Student }> = ({ student }) => {
    const details = [
        { icon: MapPin, label: 'Branch', value: student.branch },
        { icon: DollarSign, label: 'Annual Budget', value: `$${student.budget}` },
        { icon: Mail, label: 'Email', value: student.email },
        { icon: Phone, label: 'Contact', value: student.phone },
    ];

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900 mb-4">Key Details</h3>
            <div className="space-y-4">
                {details.map(item => (
                    <div key={item.label} className="flex items-start gap-3">
                        <item.icon className="text-slate-400 flex-shrink-0 mt-0.5" size={16} strokeWidth={1.5} />
                        <div>
                            <p className="text-xs text-slate-500">{item.label}</p>
                            <p className="text-sm font-medium text-slate-800">{item.value}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

const SpecializedNotes: React.FC<{ student: Student, onAddActivity?: (activity: Omit<ActivityLog, 'id' | 'timestamp'>) => void }> = ({ student, onAddActivity }) => {
    const [note, setNote] = useState('');
    const [notes, setNotes] = useState<{id: string, text: string, date: string, author: string}[]>([]);

    const handleAddNote = () => {
        if (!note.trim()) return;
        const newNote = {
            id: `N-${Date.now()}`,
            text: note,
            date: new Date().toLocaleDateString(),
            author: 'You' // In real app, current user
        };
        setNotes([newNote, ...notes]);
        setNote('');
        
        if (onAddActivity) {
            onAddActivity({
                user: 'Counselor', // Mock
                role: 'Counselor',
                action: 'added specialized note',
                target: student.name,
                type: 'system'
            });
        }
    };

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <ShieldAlert size={16} className="text-indigo-600" /> Specialized Notes
            </h3>
            <div className="space-y-3 mb-4 max-h-40 overflow-y-auto">
                {notes.length === 0 && <p className="text-xs text-slate-400 italic">No sensitive notes logged.</p>}
                {notes.map(n => (
                    <div key={n.id} className="bg-slate-50 p-2 rounded border border-slate-100 text-xs">
                        <p className="text-slate-700">{n.text}</p>
                        <div className="flex justify-between mt-1 text-[10px] text-slate-400">
                            <span>{n.author}</span>
                            <span>{n.date}</span>
                        </div>
                    </div>
                ))}
            </div>
            <div className="flex gap-2">
                <input 
                    type="text" 
                    className="flex-1 text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:border-indigo-500"
                    placeholder="Add sensitive note..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                />
                <Button size="sm" onClick={handleAddNote}>Add</Button>
            </div>
        </div>
    );
};

const StudentHistory: React.FC<{ activities: ActivityLog[], student: Student }> = ({ activities, student }) => {
    // Filter activities related to this student
    const studentActivities = activities.filter(a => 
        a.target.includes(student.name) || 
        a.user === student.name ||
        student.documents?.some(d => a.target.includes(d.name)) ||
        a.target.includes(student.id) ||
        (a.action === 'added specialized note' && a.target === student.name)
    );

    return (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Clock size={16} className="text-indigo-600" />
                    Student History
                </h3>
                <span className="bg-indigo-100 text-indigo-700 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide flex items-center gap-1">
                    {studentActivities.length} Events
                </span>
            </div>
            <div className="divide-y divide-gray-50 max-h-80 overflow-y-auto">
                {studentActivities.length > 0 ? studentActivities.map(activity => (
                    <div key={activity.id} className="p-4 hover:bg-slate-50 transition-colors group">
                        <div className="flex items-start gap-3">
                            <div className="mt-0.5 w-5 h-5 rounded-full border-2 border-indigo-200 flex items-center justify-center bg-indigo-50">
                                <div className="w-2.5 h-2.5 rounded-full bg-indigo-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start">
                                    <p className="text-sm font-medium text-slate-700 truncate capitalize">
                                        {activity.action === 'rejected document' ? 'Remove doc' : 
                                         activity.action === 'verified document' ? 'Verify doc' : 
                                         activity.action === 'added specialized note' ? 'Notes' : 
                                         activity.action}
                                    </p>
                                    <span className="text-[10px] text-slate-400 whitespace-nowrap ml-2">{activity.timestamp}</span>
                                </div>
                                <p className="text-xs text-slate-500 mt-1 truncate">{activity.target}</p>
                                <p className="text-[10px] text-slate-400 mt-1 font-medium">By {activity.user} ({activity.role})</p>
                            </div>
                        </div>
                    </div>
                )) : (
                    <div className="p-8 text-center">
                        <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Clock size={20} className="text-slate-300" />
                        </div>
                        <p className="text-sm font-medium text-slate-600">No history yet</p>
                        <p className="text-xs text-slate-400 mt-1">Events will appear here</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export const StudentProfile: React.FC<StudentProfileProps> = ({ 
    student, 
    onBack, 
    onNavigate,
    userRole = 'Admin',
    onUpdateStudent,
    onAddActivity,
    onOpenCreateTaskModal,
    tasks = [],
    onUpdateTasks,
    activities = [],
    invoices = [],
    onUpdateInvoice,
    onCreateInvoice
}) => {
  const [localStudent, setLocalStudent] = useState<Student>(student);
  const [activeTab, setActiveTab] = useState<'pipeline' | 'show-money' | 'visa-pilot' | 'ledger' | 'resume'>('pipeline');

  useEffect(() => {
    setLocalStudent(student);
  }, [student]);

  const currentStepIndex = PIPELINE_STEPS.indexOf(localStudent.status);
  const nextStep = PIPELINE_STEPS[currentStepIndex + 1];

  const handleUpdateStudentLocal = (updated: Student) => {
      // Check if country changed to archive visa progress
      if (updated.country !== localStudent.country) {
          const archivedVisa = {
              country: localStudent.country,
              milestones: localStudent.visa || {},
              archivedAt: new Date().toISOString()
          };
          updated.visaHistory = [...(localStudent.visaHistory || []), archivedVisa];
          updated.visa = {}; // Reset for new country
          
          onAddActivity?.({
              user: userRole,
              role: userRole,
              action: 'reconfigured Visa Pilot',
              target: `Destination changed from ${localStudent.country} to ${updated.country}. Old progress archived.`,
              type: 'system'
          });
      }
      
      setLocalStudent(updated);
      onUpdateStudent?.(updated);
  };

  const handleAdvancePipeline = () => {
    if (nextStep) {
      // BLOCKER LOGIC
      const countryChecklist = COUNTRY_CHECKLISTS[localStudent.country] || COUNTRY_CHECKLISTS['Default'];
      const studentDocs = localStudent.documents || [];

      const checkStageRequirements = (stageName: string) => {
          const stageReqs = countryChecklist.find(c => c.stage === stageName);
          if (!stageReqs) return []; // No requirements for this stage

          const missingDocs = stageReqs.items.filter(item => {
              const hasUploaded = studentDocs.some(d => 
                  (d.type === item.docType || d.type.includes(item.docType) || item.docType.includes(d.type)) && d.status !== 'Rejected'
              );
              return !hasUploaded;
          });

          return missingDocs.map(m => m.docType);
      };

      let allMissingItems: string[] = [];
      if (localStudent.status === 'Documentation') {
          allMissingItems = checkStageRequirements('Documentation');
      } else if (localStudent.status === 'Uni Application') {
          allMissingItems = checkStageRequirements('Uni Application');
      } else if (localStudent.status === 'Offer Received') {
          allMissingItems = checkStageRequirements('Offer Received');
      }

      const updatedViolations = [...(localStudent.slaViolations || [])];
      if (allMissingItems.length > 0) {
          updatedViolations.push({
              id: `SLA-${Date.now()}`,
              stage: localStudent.status,
              missingItems: allMissingItems,
              timestamp: new Date().toISOString(),
              resolved: false
          });
      }

      const updated = { 
          ...localStudent, 
          status: nextStep,
          slaViolations: updatedViolations
      };
      handleUpdateStudentLocal(updated);
      onAddActivity?.({
          user: userRole,
          role: userRole,
          action: allMissingItems.length > 0 ? 'advanced pipeline with SLA violation' : 'moved pipeline to',
          target: `${nextStep} (${localStudent.name})`,
          type: allMissingItems.length > 0 ? 'system' : 'approval'
      });
    }
  };

  const PriorityBadge: React.FC<{priority?: 'High' | 'Medium' | 'Low'}> = ({ priority }) => {
      if (!priority) return null;
      const styles = {
          High: 'bg-rose-100 text-rose-700',
          Medium: 'bg-amber-100 text-amber-700',
          Low: 'bg-slate-100 text-slate-700'
      }
      return <span className={`px-2 py-1 text-xs font-bold rounded ${styles[priority]}`}>{priority.toUpperCase()} PRIORITY</span>
  }

  const renderContent = () => {
      switch(activeTab) {
          case 'pipeline': return <DocumentManager student={localStudent} userRole={userRole} onUpdateDocument={(doc) => {
        const updatedDocs = localStudent.documents?.map(d => d.id === doc.id ? doc : d) || [];
        onUpdateStudent?.({ ...localStudent, documents: updatedDocs });
        if (doc.status === 'Rejected') {
            onAddActivity?.({
                user: userRole,
                role: userRole,
                action: 'rejected document',
                target: `${doc.name} (Reason: ${doc.rejectionReason})`,
                type: 'system'
            });
        } else if (doc.status === 'Verified') {
            onAddActivity?.({
                user: userRole,
                role: userRole,
                action: 'verified document',
                target: `${doc.name}`,
                type: 'approval'
            });
        }
    }} onAddDocument={(doc) => {
        const updatedDocs = [...(localStudent.documents || []), doc];
        onUpdateStudent?.({ ...localStudent, documents: updatedDocs });
    }} tasks={tasks} onUpdateTasks={onUpdateTasks} />;
          case 'show-money': return <FinancialCalculator student={localStudent} />;
          case 'visa-pilot': return <VisaPilot student={localStudent} onUpdateStudent={handleUpdateStudentLocal} />;
          case 'ledger': return <FinanceModule student={localStudent} invoices={invoices} userRole={userRole} onUpdateInvoice={onUpdateInvoice} onCreateInvoice={onCreateInvoice} />;
          case 'resume': return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-slate-900">AI-Optimized Resume</h3>
                    {localStudent.generatedCV && (
                        <Button size="sm" variant="outline" className="flex items-center gap-2">
                            <Download size={16} /> Download PDF
                        </Button>
                    )}
                </div>
                
                {localStudent.generatedCV ? (
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 max-w-2xl mx-auto shadow-inner">
                        <div className="bg-white p-8 shadow-lg border border-gray-100 min-h-[600px] flex flex-col gap-6 font-serif">
                            {/* CV Header */}
                            <div className="border-b-2 border-slate-900 pb-4 flex justify-between items-start">
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-900 uppercase tracking-tight">{localStudent.generatedCV.personalInfo.fullName}</h2>
                                    <div className="text-sm text-slate-600 mt-1 flex flex-wrap gap-x-4">
                                        <span>{localStudent.generatedCV.personalInfo.email}</span>
                                        <span>{localStudent.generatedCV.personalInfo.phone}</span>
                                        <span>{localStudent.generatedCV.personalInfo.location}</span>
                                    </div>
                                </div>
                                {localStudent.generatedCV.personalInfo.profilePicture && (
                                    <div className="w-20 h-20 rounded-lg overflow-hidden border border-slate-200">
                                        <img src={localStudent.generatedCV.personalInfo.profilePicture} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                    </div>
                                )}
                            </div>

                            {/* Summary */}
                            <div>
                                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-2 border-b border-slate-200 pb-1">Professional Summary</h4>
                                <p className="text-sm text-slate-700 leading-relaxed">{localStudent.generatedCV.summary}</p>
                            </div>

                            {/* Experience */}
                            <div>
                                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-3 border-b border-slate-200 pb-1">Experience</h4>
                                <div className="space-y-4">
                                    {localStudent.generatedCV.experience.map((exp, i) => (
                                        <div key={i}>
                                            <div className="flex justify-between items-baseline">
                                                <h5 className="text-sm font-bold text-slate-800">{exp.role}</h5>
                                                <span className="text-xs font-medium text-slate-500">{exp.period}</span>
                                            </div>
                                            <p className="text-xs font-semibold text-indigo-600 mb-1">{exp.company}</p>
                                            <p className="text-xs text-slate-600 leading-relaxed">{exp.description}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Custom Sections */}
                            {localStudent.generatedCV.customSections?.map((section, i) => (
                                <div key={i}>
                                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-2 border-b border-slate-200 pb-1">{section.title}</h4>
                                    <p className="text-sm text-slate-700 leading-relaxed">{section.content}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-20 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                            <FileText size={32} className="text-slate-300" />
                        </div>
                        <h4 className="text-slate-900 font-bold">No AI Resume Generated</h4>
                        <p className="text-slate-500 text-sm mt-1 max-w-xs mx-auto">
                            The student hasn't used the ABEC Premier AI Resume Builder yet. 
                            You can encourage them to generate one from their dashboard.
                        </p>
                    </div>
                )}
            </div>
          );
          default: return null;
      }
  }

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="h-full flex flex-col p-6 bg-slate-50/50 font-sans"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 flex-shrink-0 gap-4">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500 flex-shrink-0">
            <ArrowLeft size={20} />
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight truncate">{localStudent.name}</h1>
              <span className="text-sm font-mono text-slate-400 pt-1 hidden sm:inline">{localStudent.id}</span>
              <PriorityBadge priority={localStudent.priority} />
            </div>
            <div className="text-sm text-slate-500 font-medium flex items-center gap-x-3 mt-1 flex-wrap">
                <select 
                    value={localStudent.country}
                    onChange={(e) => handleUpdateStudentLocal({ ...localStudent, country: e.target.value as any })}
                    className="text-sm font-medium text-slate-500 bg-transparent border-none p-0 focus:ring-0 cursor-pointer hover:text-nexgenai-navy transition-colors"
                >
                    {['UK', 'Canada', 'Australia', 'New Zealand', 'USA', 'Japan', 'Singapore'].map(c => (
                        <option key={c} value={c}>{c}</option>
                    ))}
                </select>
                <span className="text-slate-300">•</span>
                <span>GPA: {localStudent.gpa}</span>
                <span className="text-slate-300">•</span>
                <span>IELTS: {localStudent.ielts}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 self-end md:self-auto">
            <Button variant="outline" onClick={() => onNavigate('messages')} size="sm"><MessageSquare size={16} strokeWidth={1.5} className="mr-2"/> Message</Button>
            <Button onClick={() => onOpenCreateTaskModal(localStudent)} size="sm"><PlusCircle size={16} strokeWidth={1.5} className="mr-2"/> Task</Button>
        </div>
      </div>

      {/* SLA NOTICE CARD */}
      {localStudent.slaViolations && localStudent.slaViolations.some(v => !v.resolved) && (
        <div className="mb-6 bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-start gap-4 shadow-sm animate-pulse">
          <div className="bg-rose-100 p-2 rounded-xl text-rose-600">
            <ShieldAlert size={24} />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-bold text-rose-900">SLA Requirement Notice</h4>
            <p className="text-xs text-rose-700 mt-1">
              This student was advanced through stages without completing all mandatory requirements. 
              This will impact the counselor's SLA score until resolved.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {localStudent.slaViolations.filter(v => !v.resolved).map(v => (
                <div key={v.id} className="bg-white/60 border border-rose-100 px-2 py-1 rounded-lg text-[10px] font-bold text-rose-800">
                  {v.stage}: Missing {v.missingItems.join(', ')}
                </div>
              ))}
            </div>
          </div>
          <Button size="sm" variant="outline" className="border-rose-200 text-rose-700 hover:bg-rose-100">
            Resolve Now
          </Button>
        </div>
      )}

      {/* Pipeline Stepper */}
      <div className="bg-white border border-gray-200 rounded-2xl p-1 mb-6 shadow-sm flex flex-col lg:flex-row items-stretch overflow-hidden">
        {/* Staging Steps */}
        <div className="w-full lg:w-3/4 p-4 overflow-x-auto hide-scrollbar border-b lg:border-b-0 lg:border-r border-gray-100">
            <div className="flex items-center justify-between mb-3 px-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Staging Progress</span>
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">{currentStepIndex + 1} / {PIPELINE_STEPS.length} Steps</span>
            </div>
            <nav className="flex items-center gap-2 min-w-max pb-1">
                {PIPELINE_STEPS.map((step, idx) => {
                    const isCompleted = idx < currentStepIndex;
                    const isCurrent = idx === currentStepIndex;
                    return (
                        <React.Fragment key={step}>
                            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold transition-all whitespace-nowrap ${isCurrent ? 'bg-nexgenai-navy text-white shadow-md shadow-slate-200 scale-105' : isCompleted ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-slate-50 text-slate-400 border border-transparent'}`}>
                                {isCompleted ? <CheckCircle size={12} className="text-emerald-500" /> : <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] ${isCurrent ? 'bg-white text-nexgenai-navy' : 'bg-slate-200 text-slate-500'}`}>{idx + 1}</span>}
                                <span>{step}</span>
                            </div>
                            {idx < PIPELINE_STEPS.length - 1 && <div className={`w-4 lg:w-6 h-0.5 flex-shrink-0 ${isCompleted ? 'bg-emerald-200' : 'bg-slate-100'}`} />} 
                        </React.Fragment>
                    )
                })}
            </nav>
        </div>
        
        {/* CTA Button - Static Modern Block */}
        <div className="w-full lg:w-1/4 bg-slate-50/80 p-4 flex flex-col justify-center items-center text-center">
            {nextStep && userRole !== 'Student' ? (
                <div className="w-full space-y-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Next Action Required</p>
                    <Button 
                        className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-lg shadow-indigo-100 border-none h-11 rounded-xl font-bold text-sm group" 
                        onClick={handleAdvancePipeline}
                    >
                        Advance to {nextStep} 
                        <ChevronRight size={18} className="ml-1 group-hover:translate-x-1 transition-transform" />
                    </Button>
                </div>
            ) : (
                <div className="w-full space-y-1">
                    <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-1">
                        <CheckCircle size={20} />
                    </div>
                    <p className="text-xs font-bold text-slate-800">
                        {userRole === 'Student' ? 'Current Stage' : 'Pipeline Completed'}
                    </p>
                    <p className="text-[10px] text-slate-500">{localStudent.status}</p>
                </div>
            )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
        <div className="col-span-12 lg:col-span-8 flex flex-col min-w-0">
            <div className="border-b border-gray-200 bg-white/50 rounded-t-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <div className="flex min-w-max">
                        <TabButton icon={FileText} label="Pipeline" activeTab={activeTab} tabName="pipeline" onClick={setActiveTab} />
                        <TabButton icon={FileText} label="Resume" activeTab={activeTab} tabName="resume" onClick={setActiveTab} />
                        <TabButton icon={DollarSign} label="Show Money" activeTab={activeTab} tabName="show-money" onClick={setActiveTab} />
                        <TabButton icon={Plane} label="Visa Pilot" activeTab={activeTab} tabName="visa-pilot" onClick={setActiveTab} />
                        <TabButton icon={Banknote} label="Ledger" activeTab={activeTab} tabName="ledger" onClick={setActiveTab} />
                    </div>
                </div>
            </div>
            <div className="p-6 bg-white border-l border-r border-b border-gray-200 rounded-b-xl flex-1 overflow-y-auto">
                {renderContent()}
            </div>
        </div>

        <div className="col-span-12 lg:col-span-4 space-y-6">
            <KeyDetails student={localStudent} />
            <StudentHistory activities={activities} student={localStudent} />
            <SpecializedNotes student={localStudent} onAddActivity={onAddActivity} />
        </div>
      </div>
    </motion.div>
  );
};

const TabButton = ({ icon: Icon, label, activeTab, tabName, onClick }: { icon: any, label: string, activeTab: string, tabName: string, onClick: (tab: any) => void }) => (
    <button 
        onClick={() => onClick(tabName)} 
        className={`flex-1 py-3 px-4 text-xs font-semibold flex items-center justify-center gap-2 border-b-2 transition-all outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-nexgenai-navy ${activeTab === tabName ? 'border-indigo-600 text-indigo-600 bg-white' : 'border-transparent text-slate-500 hover:bg-slate-50'}`}>
        <Icon size={16} strokeWidth={1.5} />
        {label}
    </button>
)