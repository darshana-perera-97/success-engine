import React, { useState } from 'react';
import { Student, Task } from '../types';
import { EMPLOYEES } from '../constants';
import { CheckCircle, Upload, AlertTriangle, Calendar, Info, Mail, Phone, X, CheckSquare, FileText, Download, Eye } from 'lucide-react';
import { Button } from './Button';

export const StudentDashboard: React.FC<{ 
    student: Student, 
    onNavigate: (view: string) => void,
    tasks?: Task[]
}> = ({ student, onNavigate, tasks = [] }) => {
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

    const counselor = EMPLOYEES.find(e => e.id === student.counselor) || { 
        name: 'Sarah Jenkins', 
        role: 'Senior Counselor', 
        email: 'sarah@nexgenai.com', 
        avatar: '/CEO.png' 
    };

    // --- Progress Logic ---
    const allStatuses = ['New Inquiry', 'Counseling', 'Documentation', 'Uni Application', 'Offer Received', 'Visa Pilot'];
    const rawIndex = allStatuses.indexOf(student.status);
    
    // Map raw status index to 5 visual steps
    // 0: Inquiry, 1: Counseling, 2: Docs, 3: Offer, 4: Visa
    let visualIndex = 0;
    if (rawIndex <= 0) visualIndex = 0;      // New Inquiry
    else if (rawIndex === 1) visualIndex = 1; // Counseling
    else if (rawIndex === 2) visualIndex = 2; // Documentation
    else if (rawIndex === 3 || rawIndex === 4) visualIndex = 3; // Application/Offer
    else visualIndex = 4; // Visa Pilot

    const steps = [
        { label: 'Inquiry', icon: '1' },
        { label: 'Counseling', icon: '2' },
        { label: 'Docs', icon: '3' },
        { label: 'Offer', icon: '4' },
        { label: 'Visa', icon: '5' }
    ];

    const progressPercentage = (visualIndex / (steps.length - 1)) * 100;

    // --- Action Required Logic ---
    // Filter tasks for this student that are NOT completed
    const pendingTasks = tasks.filter(t => t.student_id === student.id && t.status !== 'Completed');
    
    // Sort: Blocking first, then High priority
    const sortedActions = pendingTasks.sort((a, b) => {
        if (a.isBlocking && !b.isBlocking) return -1;
        if (!a.isBlocking && b.isBlocking) return 1;
        if (a.priority === 'High' && b.priority !== 'High') return -1;
        if (a.priority !== 'High' && b.priority === 'High') return 1;
        return 0;
    });

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-10">
            {/* Hero Header */}
            <div className="bg-[#0F172A] rounded-2xl p-8 text-white shadow-xl relative overflow-hidden group">
                <div className="relative z-10">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Hello, {student.name.split(' ')[0]}!</h1>
                            <p className="text-slate-300 mt-2 max-w-xl">
                                Your application to <span className="text-white font-semibold">{student.country}</span> is currently in the 
                                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500 text-white shadow-sm border border-indigo-400/50">
                                    {student.status}
                                </span> stage.
                            </p>
                        </div>
                        <div className="hidden md:block text-right">
                             <div className="text-xs text-slate-400 uppercase tracking-wider font-bold mb-1">Student ID</div>
                             <div className="font-mono text-indigo-300">{student.id}</div>
                        </div>
                    </div>
                    
                    <div className="mt-8 flex flex-wrap gap-3">
                        <Button 
                            variant="secondary" 
                            className="bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm"
                            onClick={() => onNavigate('tasks')}
                        >
                            <CheckSquare size={16} className="mr-2" />
                            My Checklist
                        </Button>
                        <Button variant="ghost" className="text-white hover:bg-white/10 hover:text-white border border-white/20" onClick={() => setIsUploadModalOpen(true)}>
                            <Upload size={16} className="mr-2" />
                            Upload Documents
                        </Button>
                    </div>
                </div>
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500 rounded-full blur-[100px] opacity-20 -mr-20 -mt-20 group-hover:opacity-30 transition-opacity duration-1000"></div>
                <div className="absolute bottom-0 left-10 w-40 h-40 bg-rose-500 rounded-full blur-[80px] opacity-10"></div>
            </div>

            {/* Application Progress Tracker - REDESIGNED */}
            <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm relative overflow-hidden">
                <div className="flex flex-col md:flex-row justify-between md:items-center mb-12 gap-4">
                    <div>
                        <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                            Application Journey
                            <Info size={16} className="text-slate-400 cursor-help" />
                        </h3>
                        <p className="text-sm text-slate-500 mt-1">
                            Track your admission & visa milestones.
                        </p>
                    </div>
                     <div className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg border border-indigo-100 text-sm font-medium self-start md:self-auto shadow-sm">
                        <Calendar size={16} />
                        <span>Registered Date: {student.joinedDate || 'Feb 12, 2026'}</span>
                    </div>
                </div>
                
                <div className="overflow-x-auto pb-4 -mx-4 px-4 md:overflow-visible md:pb-0 md:px-0">
                    <div className="relative mx-4 md:mx-10 mb-4 min-w-[500px] md:min-w-0">
                        {/* Background Line */}
                        <div className="absolute top-1/2 left-0 w-full h-1.5 bg-gray-100 -translate-y-1/2 rounded-full z-0"></div>
                        
                        {/* Active Progress Line */}
                        <div 
                            className="absolute top-1/2 left-0 h-1.5 bg-indigo-600 -translate-y-1/2 rounded-full transition-all duration-1000 ease-out z-0 shadow-sm" 
                            style={{width: `${progressPercentage}%`}} 
                        ></div>
                        
                        <div className="relative flex justify-between w-full">
                            {steps.map((step, index) => {
                                const isCompleted = index < visualIndex;
                                const isActive = index === visualIndex;

                                return (
                                     <div key={step.label} className="flex flex-col items-center z-10 relative group">
                                        <div className={`
                                            w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center border-4 transition-all duration-500 bg-white
                                            ${isCompleted ? 'border-indigo-600 text-indigo-600' : 
                                              isActive ? 'border-indigo-600 text-indigo-600 scale-110 shadow-xl shadow-indigo-100 ring-4 ring-white' : 
                                              'border-gray-200 text-gray-300'}
                                        `}>
                                            {isCompleted ? (
                                                <div className="bg-indigo-600 w-full h-full rounded-full flex items-center justify-center text-white scale-105">
                                                    <CheckCircle size={18} strokeWidth={3} />
                                                </div>
                                            ) : isActive ? (
                                                 <div className="w-3 h-3 bg-indigo-600 rounded-full animate-pulse shadow-[0_0_10px_rgba(79,70,229,0.5)]" />
                                            ) : (
                                                <div className="w-2.5 h-2.5 bg-gray-200 rounded-full" />
                                            )}
                                        </div>
                                        <div className={`
                                            absolute top-14 left-1/2 -translate-x-1/2 text-xs font-bold whitespace-nowrap transition-all px-3 py-1.5 rounded-full border
                                            ${isActive ? 'bg-indigo-600 text-white border-indigo-600 shadow-md transform translate-y-1 scale-105' : 
                                              isCompleted ? 'bg-white text-indigo-900 border-indigo-100' : 
                                              'bg-white text-gray-400 border-transparent'}
                                        `}>
                                            {step.label}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
                <div className="mt-16 text-center md:hidden">
                    <p className="text-xs text-slate-400 italic">Scroll right to view full timeline</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Your CV Section */}
                    {student.generatedCV && (
                        <div className="bg-white border border-indigo-100 rounded-xl p-6 shadow-sm bg-gradient-to-br from-white to-indigo-50/30">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-slate-900 flex items-center">
                                    <FileText size={18} className="mr-2 text-indigo-600" />
                                    Your AI-Optimized CV
                                </h3>
                                <span className="text-[10px] font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full uppercase tracking-wide">
                                    Last Updated: {new Date(student.generatedCV.updatedAt).toLocaleDateString()}
                                </span>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-white border border-indigo-100 rounded-xl shadow-sm">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-md">
                                        <FileText size={24} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900">{student.generatedCV.name}_Resume.pdf</p>
                                        <p className="text-xs text-slate-500">AI-Enhanced • Professional Template</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button size="sm" variant="secondary" onClick={() => onNavigate('resume')}>
                                        <Eye size={14} className="mr-1" /> View
                                    </Button>
                                    <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                                        <Download size={14} className="mr-1" /> Download
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Pending Action Items - Dynamic from Tasks */}
                    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                        <h3 className="font-bold text-slate-900 mb-4 flex items-center">
                            <AlertTriangle size={18} className="mr-2 text-amber-500" />
                            Action Required
                        </h3>
                        <div className="space-y-3">
                            {sortedActions.length > 0 ? sortedActions.map(task => (
                                <div key={task.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-slate-50 border border-gray-100 rounded-xl hover:border-indigo-200 transition-colors gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className={`h-10 w-10 rounded-full flex items-center justify-center shadow-sm border border-gray-100 shrink-0 ${task.documentType ? 'bg-indigo-50 text-indigo-600' : 'bg-amber-50 text-amber-600'}`}>
                                            {task.documentType ? <Upload size={20} /> : <CheckSquare size={20} />}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-900 text-sm">{task.task}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                {task.isBlocking && (
                                                    <span className="text-[10px] font-bold bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full uppercase tracking-wide">Required</span>
                                                )}
                                                <span className="text-xs text-slate-500">Due: {task.dueDate || 'ASAP'}</span>
                                            </div>
                                        </div>
                                    </div>
                                    {task.documentType ? (
                                        <Button size="sm" className="w-full sm:w-auto" onClick={() => setIsUploadModalOpen(true)}>Upload Now</Button>
                                    ) : (
                                        <Button size="sm" variant="secondary" className="w-full sm:w-auto" onClick={() => onNavigate('tasks')}>View Task</Button>
                                    )}
                                </div>
                            )) : (
                                <div className="text-center py-8 text-slate-500 text-sm">
                                    <CheckCircle size={24} className="mx-auto mb-2 text-emerald-500" />
                                    No pending actions required at this stage.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Counselor Card */}
                <div className="space-y-6">
                    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Your Counselor</h3>
                            <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse" title="Online Now"></div>
                        </div>
                        <div className="flex items-center gap-4 mb-6">
                            <div className="h-14 w-14 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xl border-2 border-white shadow-md overflow-hidden">
                                {counselor.avatar ? (
                                    <img src={counselor.avatar} alt={counselor.name} className="w-full h-full object-cover" />
                                ) : (
                                    counselor.name.charAt(0)
                                )}
                            </div>
                            <div>
                                <p className="font-bold text-slate-900">{counselor.name}</p>
                                <p className="text-sm text-slate-500">{counselor.role} • {student.country}</p>
                            </div>
                        </div>
                        <div className="space-y-3 text-sm text-slate-600 mb-6">
                            <div className="flex items-center gap-3">
                                <Mail size={14} className="text-slate-400" /> {counselor.email}
                            </div>
                            <div className="flex items-center gap-3">
                                <Phone size={14} className="text-slate-400" /> +94 77 123 9999
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <Button className="w-full" variant="secondary" onClick={() => onNavigate('messages')}>Message</Button>
                            <Button className="w-full" variant="secondary" onClick={() => onNavigate('calendar')}>Book Call</Button>
                        </div>
                    </div>

                    <div className="bg-indigo-900 rounded-xl p-6 text-white relative overflow-hidden">
                         <div className="relative z-10">
                             <h3 className="font-bold mb-2 flex items-center gap-2">
                                <span className="bg-white/20 p-1 rounded">
                                    <Info size={14} />
                                </span>
                                Need Help?
                             </h3>
                             <p className="text-xs text-indigo-200 mb-4 leading-relaxed">
                                 Stuck on a document? Check our FAQ or contact support directly.
                             </p>
                             <p className="text-[10px] text-indigo-400 font-mono pt-2 border-t border-white/10">Ref ID: {student.id}</p>
                         </div>
                         <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-indigo-700 rounded-full blur-xl opacity-50"></div>
                    </div>
                </div>
            </div>

            {/* Upload Modal */}
            {isUploadModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md scale-100 animate-in zoom-in-95">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg text-slate-900">Upload Documents</h3>
                            <button onClick={() => setIsUploadModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-indigo-400 hover:bg-indigo-50 transition-colors cursor-pointer">
                            <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3">
                                <Upload size={24} />
                            </div>
                            <p className="text-sm font-semibold text-slate-900">Click to upload or drag and drop</p>
                            <p className="text-xs text-slate-500 mt-1">PDF, JPG or PNG (max. 5MB)</p>
                        </div>
                        <div className="mt-4 flex justify-end">
                            <Button variant="ghost" onClick={() => setIsUploadModalOpen(false)}>Cancel</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};