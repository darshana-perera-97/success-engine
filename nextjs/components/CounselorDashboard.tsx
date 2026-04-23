import React from 'react';
import { Task, Student, Employee } from '../types';
import { Clock, Users, CheckCircle, ArrowRight, CheckSquare } from 'lucide-react';
import { Button } from './Button';
import { BarChart, Bar, ResponsiveContainer, XAxis } from 'recharts';
import { LeaderboardWidget } from './LeaderboardWidget';

interface CounselorDashboardProps {
    onNavigate: (view: string) => void;
    tasks: Task[];
    currentUser?: Employee | Student;
    students: Student[];
    onSelectStudent?: (student: Student) => void;
    onSelectTask?: (taskId: string) => void;
}

export const CounselorDashboard: React.FC<CounselorDashboardProps> = ({ onNavigate, tasks, currentUser, students, onSelectStudent, onSelectTask }) => {
    // Logic: Current Counselor ID from currentUser or fallback
    const counselorId = currentUser?.id || 'EMP002';
    
    const myStudents = students.filter(s => s.counselor === counselorId);
    
    // Filter tasks: Assigned to counselor
    const myTasks = tasks.filter(t => t.assigned_to.includes(counselorId));

    const overdueTasksCount = myTasks.filter(t => t.status === 'Overdue').length;
    const totalUnresolvedViolations = myStudents.reduce((acc, s) => {
        return acc + (s.slaViolations?.filter(v => !v.resolved).length || 0);
    }, 0);
    
    // SLA: 100 - (Overdue * 5) - (Violations * 2)
    const slaScore = Math.max(0, 100 - (overdueTasksCount * 5) - (totalUnresolvedViolations * 2));

    const overdueTasks = myTasks.filter(t => t.status === 'Overdue');
    const pendingTasks = myTasks.filter(t => t.status === 'Pending' || t.status === 'In Progress' || t.status === 'In Review');
    const completedTasks = myTasks.filter(t => t.status === 'Completed');
    const pendingReviewTasks = myTasks.filter(t => t.status === 'In Review');

    const activityData = [
        { name: 'Mon', calls: 4 },
        { name: 'Tue', calls: 8 },
        { name: 'Wed', calls: 3 },
        { name: 'Thu', calls: 12 },
        { name: 'Fri', calls: 9 },
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
                <div>
                   <h1 className="text-2xl font-semibold tracking-tight text-[#0F172A]">Welcome back, {currentUser?.name || 'Sarah'}</h1>
                   <p className="text-sm text-slate-500 mt-1">Here's what's on your plate today.</p>
                </div>
                <div className="text-left sm:text-right">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Your Performance</p>
                    <div className="flex items-center gap-2 mt-1">
                        <div className={`flex items-center text-sm font-bold px-2 py-0.5 rounded-full ${slaScore >= 90 ? 'bg-emerald-50 text-emerald-600' : slaScore >= 70 ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'}`}>
                            <CheckCircle size={14} className="mr-1" /> {slaScore}% SLA Met
                        </div>
                    </div>
                </div>
            </div>

            {/* Task Tower Overview (Counselor Version) */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <CheckSquare size={18} className="text-indigo-600" />
                    Task Tower Overview
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 text-center">
                        <div className="text-2xl font-bold text-slate-900">{completedTasks.length}</div>
                        <div className="text-xs text-slate-500 uppercase font-semibold mt-1">Completed</div>
                    </div>
                    <div className="p-4 bg-rose-50 rounded-lg border border-rose-100 text-center">
                        <div className="text-2xl font-bold text-rose-700">{overdueTasks.length}</div>
                        <div className="text-xs text-rose-600 uppercase font-semibold mt-1">Overdue</div>
                    </div>
                    <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-100 text-center">
                        <div className="text-2xl font-bold text-indigo-700">{pendingReviewTasks.length}</div>
                        <div className="text-xs text-indigo-600 uppercase font-semibold mt-1">Pending Review</div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Priority Tasks & Student List */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-semibold text-slate-900 flex items-center">
                                <Clock size={18} className="mr-2 text-indigo-600" />
                                Priority Action Items
                            </h3>
                            <Button variant="ghost" size="sm" onClick={() => onNavigate('tasks')}>View All</Button>
                        </div>
                        
                        <div className="space-y-3">
                            {overdueTasks.length > 0 && (
                                <div className="p-3 bg-rose-50 border border-rose-100 rounded-lg flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></div>
                                        <div>
                                            <p className="text-sm font-medium text-rose-900">You have {overdueTasks.length} overdue tasks!</p>
                                            <p className="text-xs text-rose-700">Immediate action required.</p>
                                        </div>
                                    </div>
                                    <Button size="sm" variant="danger" onClick={() => onNavigate('tasks')}>Fix Now</Button>
                                </div>
                            )}

                            {pendingTasks.slice(0, 3).map(task => (
                                <div 
                                    key={task.id} 
                                    className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg border border-transparent hover:border-gray-100 transition-all group cursor-pointer"
                                    onClick={() => onSelectTask && onSelectTask(task.id)}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="w-5 h-5 mt-0.5 rounded border-2 border-slate-300 group-hover:border-indigo-500 transition-colors"></div>
                                        <div>
                                            <p className="text-sm font-medium text-slate-700 group-hover:text-indigo-900">{task.task}</p>
                                            <p className="text-xs text-slate-400">Due: {task.dueDate}</p>
                                        </div>
                                    </div>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${task.priority === 'High' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
                                        {task.priority}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                
                    {/* Recent Student Activity */}
                     <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-semibold text-slate-900 flex items-center">
                                <Users size={18} className="mr-2 text-indigo-600" />
                                My Students
                            </h3>
                            <Button variant="ghost" size="sm" onClick={() => onNavigate('students')}>View All ({myStudents.length})</Button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-left text-xs text-slate-400 uppercase border-b border-gray-100">
                                        <th className="pb-2 font-medium">Name</th>
                                        <th className="pb-2 font-medium">Stage</th>
                                        <th className="pb-2 font-medium text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {myStudents.slice(0, 5).map(student => (
                                        <tr key={student.id} className="group">
                                            <td className="py-3 font-medium text-slate-700">{student.name}</td>
                                            <td className="py-3">
                                                 <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                                                    {student.status}
                                                </span>
                                            </td>
                                            <td className="py-3 text-right">
                                                <button 
                                                    className="text-indigo-600 hover:text-indigo-800 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-end gap-1 ml-auto"
                                                    onClick={() => onSelectStudent && onSelectStudent(student)}
                                                >
                                                    Open <ArrowRight size={12} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Sidebar Metrics & Gamification */}
                <div className="space-y-6">
                    {/* NEW: Gamification Widget */}
                    <LeaderboardWidget />

                    <div className="bg-[#0F172A] p-6 rounded-xl shadow-lg text-white">
                        <h4 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-4">Pipeline Health</h4>
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-slate-300">New Inquiries</span>
                                    <span className="font-bold">12</span>
                                </div>
                                <div className="w-full bg-slate-700 rounded-full h-1.5">
                                    <div className="bg-indigo-500 h-1.5 rounded-full" style={{width: '60%'}}></div>
                                </div>
                            </div>
                             <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-slate-300">Docs Pending</span>
                                    <span className="font-bold">5</span>
                                </div>
                                <div className="w-full bg-slate-700 rounded-full h-1.5">
                                    <div className="bg-amber-500 h-1.5 rounded-full" style={{width: '30%'}}></div>
                                </div>
                            </div>
                             <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-slate-300">Visa Pilot</span>
                                    <span className="font-bold">3</span>
                                </div>
                                <div className="w-full bg-slate-700 rounded-full h-1.5">
                                    <div className="bg-emerald-500 h-1.5 rounded-full" style={{width: '20%'}}></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <h4 className="text-slate-900 text-sm font-bold mb-4">Weekly Activity</h4>
                        <div className="h-32">
                             <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={activityData}>
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                                    <Bar dataKey="calls" fill="#6366F1" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};