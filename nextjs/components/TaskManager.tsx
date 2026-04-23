
import React, { useState } from 'react';
import { TASKS, STUDENTS } from '../constants';
import { Task, UserRole, Student, ActivityLog, DocumentFile, TaskStatus } from '../types';
import { Clock, AlertCircle, Plus, Lock, Upload, CheckCircle, Hourglass } from 'lucide-react';
import { Button } from './Button';
import { CreateTaskModal } from './CreateTaskModal';

interface TaskManagerProps {
    userRole?: UserRole;
    tasks?: Task[];
    student?: Student;
    onUpdateStudent?: (student: Student) => void;
    onAddActivity?: (activity: Omit<ActivityLog, 'id' | 'timestamp'>) => void;
    currentUser?: any;
    selectedTaskId?: string | null;
    onUpdateTasks?: (tasks: Task[]) => void;
    onAddTask?: (task: Task) => void;
}

export const TaskManager: React.FC<TaskManagerProps> = ({ 
    userRole = 'Admin', 
    tasks = TASKS, 
    student, 
    onUpdateStudent, 
    onAddActivity, 
    currentUser, 
    selectedTaskId,
    onUpdateTasks,
    onAddTask
}) => {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const MOCK_COUNSELOR_ID = 'EMP002';

    const filteredTasks = tasks.filter(task => {
        if (userRole === 'Admin') return true;
        if (userRole === 'Manager') return task.priority === 'High' || task.status === 'Overdue' || task.status === 'In Review';
        if (userRole === 'Counselor') return task.assigned_to.includes(MOCK_COUNSELOR_ID) || task.isPrivate;
        if (userRole === 'Student') return task.student_id === student?.id && !task.isPrivate;
        return false;
    });

    const handleStatusChange = (task: Task, newStatus: TaskStatus) => {
        const updatedTask = { ...task, status: newStatus };
        
        if (onUpdateTasks) {
            onUpdateTasks([updatedTask]);
        }
        
        // Log Activity
        if (onAddActivity) {
            onAddActivity({
                user: userRole,
                role: userRole,
                action: `moved task to ${newStatus}`,
                target: task.task,
                type: 'task'
            });
        }
    };

    const handleStudentUpload = (task: Task) => {
        if (!task.documentType || !student || !onUpdateStudent || !onAddActivity) return;

        const newDoc: DocumentFile = {
            // id: `doc-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            name: `${task.documentType.replace(/([A-Z])/g, ' $1')}.pdf`,
            type: task.documentType,
            status: 'Pending',
            uploadedAt: 'Just now',
            phase: task.phase,
            tier: task.tier,
            url: '#'
        };
        
        const otherDocs = student.documents?.filter(d => d.type !== task.documentType) || [];
        const updatedStudent: Student = {
            ...student,
            documents: [...otherDocs, newDoc],
        };

        onUpdateStudent(updatedStudent);
        onAddActivity({
            user: student.name,
            role: 'Student',
            action: 'uploaded',
            target: newDoc.name,
            type: 'upload',
        });
        
        // Auto-update task status to In Review
        if (onUpdateTasks) {
             onUpdateTasks([{ ...task, status: 'In Review' }]);
        }
    };

    const handleCreateTask = (newTask: Task) => {
        if (onAddTask) {
            onAddTask(newTask);
        }
        setIsCreateModalOpen(false);
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'High': return 'bg-rose-50 text-rose-700 border-rose-200';
            case 'Medium': return 'bg-amber-50 text-amber-700 border-amber-200';
            default: return 'bg-slate-50 text-slate-700 border-slate-200';
        }
    };
    
    const studentTasks = userRole === 'Student' ? filteredTasks.sort((a, b) => (a.phase || 9) - (b.phase || 9)) : filteredTasks;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                   <h1 className="text-2xl font-semibold tracking-tight text-[#0F172A]">{userRole === 'Manager' ? 'Escalation Desk' : userRole === 'Student' ? 'My Action Plan' : 'Task Manager'}</h1>
                   <p className="text-sm text-slate-500 mt-1">{userRole === 'Manager' ? 'High priority items requiring attention.' : 'Track your to-do list and SLAs.'}</p>
                </div>
                {userRole !== 'Student' && <Button onClick={() => setIsCreateModalOpen(true)}><Plus size={16} className="mr-2" />New Task</Button>}
            </div>

            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 border-b border-gray-200 text-slate-500">
                            <tr>
                                <th className="px-6 py-3 whitespace-nowrap">Task</th>
                                {userRole !== 'Student' && <th className="px-6 py-3 whitespace-nowrap hidden md:table-cell">Student</th>}
                                {userRole !== 'Student' && <th className="px-6 py-3 whitespace-nowrap hidden lg:table-cell">Assigned</th>}
                                <th className="px-6 py-3 whitespace-nowrap hidden sm:table-cell">Priority</th>
                                <th className="px-6 py-3 whitespace-nowrap">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {studentTasks.map((task) => {
                                const studentContext = STUDENTS.find(s => s.id === task.student_id);
                                const isLocked = userRole === 'Student' && (task.phase || 1) > 1 && task.status === 'Pending';
                                const isTaskCompleted = task.status === 'Completed';

                                let docStatus: 'verified' | 'pending' | 'rejected' | 'none' = 'none';
                                let uploadedDoc: DocumentFile | undefined;
                                if (userRole === 'Student' && task.documentType && student?.documents) {
                                    uploadedDoc = student.documents.find(d => d.type === task.documentType);
                                    if (uploadedDoc) {
                                        if (uploadedDoc.status === 'Verified') docStatus = 'verified';
                                        else if (uploadedDoc.status === 'Rejected') docStatus = 'rejected';
                                        else docStatus = 'pending';
                                    }
                                }

                                return (
                                    <tr key={task.id} className={`transition-colors ${isLocked ? 'bg-gray-50 opacity-60' : 'hover:bg-slate-50'} ${selectedTaskId === task.id ? 'bg-indigo-50 ring-2 ring-inset ring-indigo-500' : ''}`}>
                                        <td className="px-6 py-4 min-w-[200px]">
                                            <div className="flex items-center gap-3">
                                                {isTaskCompleted ? <CheckCircle size={16} className="text-emerald-500 shrink-0" /> : isLocked ? <Lock size={16} className="text-slate-400 shrink-0" /> : <div className="w-4 h-4 rounded border-2 border-slate-300 shrink-0"></div>}
                                                <div>
                                                    <p className={`font-medium ${isTaskCompleted ? 'text-slate-500 line-through' : 'text-slate-900'}`}>{task.task}</p>
                                                    {task.isBlocking && !isTaskCompleted && <span className="text-[10px] text-rose-600 font-bold uppercase tracking-wide">Required</span>}
                                                </div>
                                            </div>
                                        </td>
                                        {userRole !== 'Student' && <td className="px-6 py-4 whitespace-nowrap"><span className="font-medium">{studentContext?.name}</span></td>}
                                        {userRole !== 'Student' && (
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex -space-x-2">
                                                    {task.assigned_to.map((assignee, i) => (
                                                        <div key={i} className="h-8 w-8 rounded-full bg-indigo-100 border-2 border-white flex items-center justify-center text-xs font-bold text-indigo-700 shadow-sm" title={assignee}>
                                                            {assignee.substring(0, 2)}
                                                        </div>
                                                    ))}
                                                </div>
                                            </td>
                                        )}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border ${getPriorityColor(task.priority)}`}>{task.priority}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {userRole === 'Student' ? (
                                                isTaskCompleted ? <span className="flex items-center text-xs font-bold text-emerald-600"><CheckCircle size={12} className="mr-1"/> Completed</span> :
                                                isLocked ? <span className="text-xs text-slate-400">Locked</span> :
                                                docStatus === 'verified' ? <span className="flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full"><CheckCircle size={12} className="mr-1"/>Verified</span> :
                                                docStatus === 'pending' ? <span className="flex items-center text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full"><Hourglass size={12} className="mr-1"/>In Review</span> :
                                                docStatus === 'rejected' ? (
                                                    <div className="relative group">
                                                        <Button size="sm" variant="danger" onClick={() => handleStudentUpload(task)}><Upload size={14} className="mr-1"/> Re-upload</Button>
                                                        {uploadedDoc?.rejectionReason && (
                                                            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 p-2 bg-slate-800 text-white text-xs rounded shadow-lg z-10 hidden group-hover:block">
                                                                <strong>Reason:</strong> {uploadedDoc.rejectionReason}
                                                            </div>
                                                        )}
                                                    </div>
                                                ) :
                                                task.documentType ? <Button size="sm" variant="secondary" onClick={() => handleStudentUpload(task)}><Upload size={14} className="mr-1" /> Upload</Button> : null
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    {task.status === 'Overdue' && <div className="flex items-center text-rose-600 text-xs font-bold animate-pulse mr-2"><AlertCircle size={14} className="mr-1" />OVERDUE</div>}
                                                    
                                                    <select 
                                                        className={`text-xs border rounded px-2 py-1 font-medium outline-none focus:ring-1 focus:ring-indigo-500
                                                            ${task.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                                                              task.status === 'In Review' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                                              task.status === 'In Progress' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                              'bg-white text-slate-600 border-gray-200'}`}
                                                        value={task.status}
                                                        onChange={(e) => handleStatusChange(task, e.target.value as TaskStatus)}
                                                    >
                                                        <option value="Pending">Pending</option>
                                                        <option value="In Progress">In Progress</option>
                                                        <option value="In Review">In Review</option>
                                                        <option value="Completed">Completed</option>
                                                    </select>
                                                    
                                                    {task.status !== 'Overdue' && task.status !== 'Completed' && (
                                                        <div className="flex items-center text-slate-400 text-xs ml-2"><Clock size={12} className="mr-1" />{task.dueDate}</div>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                {filteredTasks.length === 0 && <div className="p-8 text-center text-slate-500">No tasks found.</div>}
            </div>
            <CreateTaskModal 
                isOpen={isCreateModalOpen} 
                onClose={() => setIsCreateModalOpen(false)} 
                onSubmit={handleCreateTask} 
                userRole={userRole}
                currentUser={currentUser}
                student={student}
            />
        </div>
    );
};