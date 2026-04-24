import React, { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { STUDENTS, EMPLOYEES } from '../constants';
import { Task, Priority, Student } from '../types';
import { Button } from './Button';
import { MultiSelect } from './MultiSelect';
import { DatePicker } from './DatePicker';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (task: Task) => void;
  student?: Student | null;
  currentUser?: Student | Employee;
  userRole?: UserRole;
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({ isOpen, onClose, onSubmit, student, currentUser, userRole }) => {
  const [description, setDescription] = useState('');
  const [studentId, setStudentId] = useState(student?.id || '');
  const [assignedTo, setAssignedTo] = useState<string[]>([]);
  const [priority, setPriority] = useState<Priority>('Medium');
  const [dueDate, setDueDate] = useState('');
  const [isPrivate, setIsPrivate] = useState(true);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Logic: 
    // Counselor: Auto-assigned to self (no assignedTo check needed if self)
    // Manager/Admin: Must select assignedTo OR be private
    
    let finalAssignedTo = assignedTo;
    if (userRole === 'Counselor' && currentUser) {
        finalAssignedTo = [currentUser.id];
    }

    if (!description || !studentId || (finalAssignedTo.length === 0 && !isPrivate) || !dueDate) return;

    const newTask: Task = {
      id: `T${Math.floor(Math.random() * 10000)}`,
      task: description,
      student_id: studentId,
      assigned_to: isPrivate ? (userRole === 'Counselor' && currentUser ? [currentUser.id] : assignedTo) : finalAssignedTo,
      priority,
      status: 'Pending',
      dueDate,
      isPrivate
    };

    onSubmit(newTask);
    
    // Reset form
    setDescription('');
    if (!student) setStudentId(''); // Only reset if not pre-filled
    setAssignedTo([]);
    setPriority('Medium');
    setDueDate('');
    setIsPrivate(true);
    onClose();
  };

  const employeeOptions = EMPLOYEES.map(e => ({
      value: e.id,
      label: e.name,
      subLabel: `${e.role} • ${e.branch}`
  }));

  const showAssignTo = userRole === 'Manager' || userRole === 'Admin';
  const showRelatedStudent = !student; // Hide if student context is provided

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl border border-gray-100 scale-100 animate-in zoom-in-95 duration-200 mx-4 relative">
        <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50/50 rounded-t-xl">
            <div>
                <h3 className="font-semibold text-lg text-[#0F172A]">Create New Task</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                    {userRole === 'Counselor' ? 'Add a task to your list.' : 'Assign an action item to a team member.'}
                </p>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors p-1 hover:bg-slate-100 rounded-md">
                <X size={20} />
            </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Task Description</label>
                <textarea 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the task clearly..."
                    rows={2}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400 resize-none"
                    required
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {showRelatedStudent && (
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Related Student</label>
                        <div className="relative">
                            <select 
                                value={studentId}
                                onChange={(e) => setStudentId(e.target.value)}
                                className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-700 appearance-none"
                                required
                            >
                                <option value="" disabled>Select Student</option>
                                {STUDENTS.map(s => (
                                    <option key={s.id} value={s.id}>{s.name} ({s.country})</option>
                                ))}
                            </select>
                            <div className="absolute right-3 top-3 pointer-events-none text-slate-400">
                                 <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            </div>
                        </div>
                    </div>
                )}

                {showAssignTo && (
                    <div>
                       <MultiSelect 
                          label="Assign To"
                          options={employeeOptions}
                          value={assignedTo}
                          onChange={setAssignedTo}
                          placeholder="Search employees..."
                       />
                    </div>
                )}
            </div>

            <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 grid grid-cols-2 gap-5">
                <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide flex items-center">
                        <AlertCircle size={12} className="mr-1.5" /> Priority Level
                    </label>
                    <div className="flex gap-2">
                        {['Low', 'Medium', 'High'].map((p) => (
                            <button
                                key={p}
                                type="button"
                                onClick={() => setPriority(p as Priority)}
                                className={`flex-1 py-1.5 text-xs font-medium rounded-md border transition-all ${
                                    priority === p 
                                    ? p === 'High' ? 'bg-rose-50 border-rose-200 text-rose-700' : p === 'Medium' ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-slate-200 border-slate-300 text-slate-800'
                                    : 'bg-white border-gray-200 text-slate-500 hover:bg-gray-50'
                                }`}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                </div>

                <DatePicker 
                    label="Due Date"
                    value={dueDate}
                    onChange={setDueDate}
                    required
                />
            </div>

            <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-100">
                <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-md ${isPrivate ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-200 text-slate-500'}`}>
                        <AlertCircle size={16} /> {/* Using AlertCircle as placeholder for Shield if not available, or just use Shield */}
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-900">Private Task</p>
                        <p className="text-xs text-slate-500">Visible only to you and Admins.</p>
                    </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={isPrivate} onChange={(e) => setIsPrivate(e.target.checked)} />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
            </div>

            <div className="pt-2 flex gap-3 justify-end">
                <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                <Button type="submit" className="px-6">Create Task</Button>
            </div>
        </form>
      </div>
    </div>
  );
};