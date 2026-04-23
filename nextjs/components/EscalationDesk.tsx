import React from 'react';
import { Task } from '../types';
import { AlertTriangle, Clock, User, ArrowRight, Check } from 'lucide-react';
import { Button } from './Button';

interface EscalationDeskProps {
    tasks: Task[];
    onReassign: (taskId: string) => void;
}

export const EscalationDesk: React.FC<EscalationDeskProps> = ({ tasks, onReassign }) => {
    // Filter for escalation logic: High Priority AND (Overdue OR Pending for long time)
    const escalatedTasks = tasks.filter(t => (t.status === 'Overdue' || t.priority === 'High') && t.status !== 'Completed');

    return (
        <div className="space-y-4">
            {escalatedTasks.length === 0 ? (
                <div className="text-center py-10 bg-emerald-50 rounded-xl border border-emerald-100">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-emerald-500 mx-auto mb-3 shadow-sm">
                        <Check size={24} />
                    </div>
                    <h4 className="text-emerald-900 font-medium">All Clear</h4>
                    <p className="text-emerald-700 text-sm">No critical escalations at the moment.</p>
                </div>
            ) : (
                escalatedTasks.map(task => (
                    <div key={task.id} className="bg-white p-4 rounded-xl border border-rose-100 shadow-sm flex flex-col md:flex-row justify-between gap-4 group hover:border-rose-300 transition-colors">
                        <div className="flex items-start gap-3">
                            <div className="mt-1">
                                <AlertTriangle size={18} className="text-rose-500" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-slate-900">{task.task}</h4>
                                <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                                    <span className="flex items-center gap-1">
                                        <User size={12} /> {task.student_id}
                                    </span>
                                    <span className="flex items-center gap-1 text-rose-600 font-medium">
                                        <Clock size={12} /> {task.dueDate} (Overdue)
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                             <div className="flex -space-x-2 mr-2">
                                {task.assigned_to.map(emp => (
                                    <div key={emp} className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-600" title={emp}>
                                        {emp.substring(0,2)}
                                    </div>
                                ))}
                            </div>
                            <Button size="sm" variant="secondary" onClick={() => onReassign(task.id || '')}>
                                Reassign <ArrowRight size={14} className="ml-2" />
                            </Button>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};