import React, { useState } from 'react';
import { X, User, MapPin, DollarSign, Phone, Mail, Zap } from 'lucide-react';
import { EMPLOYEES } from '../constants';
import { Student, Country, Branch, Priority, StudentStatus } from '../types';
import { Button } from './Button';

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (student: Student) => void;
  onNavigate?: (view: string) => void;
}

export const AddStudentModal: React.FC<AddStudentModalProps> = ({ isOpen, onClose, onSubmit, onNavigate }) => {
  const [formData, setFormData] = useState({
      name: '',
      country: 'UK' as Country,
      branch: 'Colombo HQ' as Branch,
      email: '',
      phone: '',
      ielts: '',
      gpa: '',
      status: 'New Inquiry' as StudentStatus,
      budget: '',
      priority: 'Medium' as Priority,
      counselor: ''
  });

  if (!isOpen) return null;

  const handleChange = (field: string, value: string) => {
      setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newStudent: Student = {
        id: `STU${Math.floor(2000 + Math.random() * 1000)}`,
        name: formData.name,
        country: formData.country,
        branch: formData.branch,
        email: formData.email,
        phone: formData.phone,
        ielts: formData.ielts || 'Pending',
        gpa: formData.gpa,
        status: formData.status,
        budget: formData.budget,
        priority: formData.priority,
        counselor: formData.counselor || 'Unassigned',
        notes: 'Newly added via CRM.',
        lastEducationDate: new Date().toISOString().split('T')[0], // Default to today
        documents: []
    };

    onSubmit(newStudent);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-100 scale-100 animate-in zoom-in-95 duration-200 m-4 flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50/50">
            <div>
                <h3 className="font-semibold text-lg text-[#0F172A]">Onboard New Student</h3>
                <p className="text-xs text-slate-500 mt-0.5">Enter initial details to start the success engine.</p>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors p-1 hover:bg-slate-100 rounded-md">
                <X size={20} />
            </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto">
            
            {/* Personal Info */}
            <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-gray-100 pb-2 mb-3">Personal Details</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="col-span-1 sm:col-span-2">
                        <label className="text-xs font-semibold text-slate-700 mb-1 block">Full Name</label>
                        <div className="relative">
                            <User className="absolute left-3 top-2.5 text-slate-400" size={16} />
                            <input type="text" required className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-gray-200 rounded-md focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none" 
                                value={formData.name} onChange={e => handleChange('name', e.target.value)} placeholder="e.g. Jane Doe" />
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-slate-700 mb-1 block">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-2.5 text-slate-400" size={16} />
                            <input type="email" required className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-gray-200 rounded-md focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none" 
                                value={formData.email} onChange={e => handleChange('email', e.target.value)} placeholder="jane@example.com" />
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-slate-700 mb-1 block">Phone</label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-2.5 text-slate-400" size={16} />
                            <input type="tel" required className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-gray-200 rounded-md focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none" 
                                value={formData.phone} onChange={e => handleChange('phone', e.target.value)} placeholder="+94 77 ..." />
                        </div>
                    </div>
                </div>
            </div>

            {/* Academic & Preferences */}
            <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-gray-100 pb-2 mb-3">Academic & Preferences</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs font-semibold text-slate-700 mb-1 block">Target Country</label>
                        <select className="w-full px-3 py-2 text-sm bg-slate-50 border border-gray-200 rounded-md outline-none focus:border-indigo-500"
                             value={formData.country} onChange={e => handleChange('country', e.target.value)}>
                            {['UK', 'Canada', 'Australia', 'New Zealand', 'USA'].map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-slate-700 mb-1 block">Origin Branch</label>
                         <div className="relative">
                            <MapPin className="absolute left-3 top-2.5 text-slate-400" size={16} />
                            <select className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-gray-200 rounded-md outline-none focus:border-indigo-500"
                                value={formData.branch} onChange={e => handleChange('branch', e.target.value)}>
                                {['Colombo HQ', 'Kandy', 'Galle', 'Jaffna'].map(b => <option key={b} value={b}>{b}</option>)}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-slate-700 mb-1 block">IELTS Score</label>
                        <input type="text" className="w-full px-3 py-2 text-sm bg-slate-50 border border-gray-200 rounded-md outline-none focus:border-indigo-500" 
                             value={formData.ielts} onChange={e => handleChange('ielts', e.target.value)} placeholder="e.g. 7.0 or Pending" />
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-slate-700 mb-1 block">GPA</label>
                        <input type="text" required className="w-full px-3 py-2 text-sm bg-slate-50 border border-gray-200 rounded-md outline-none focus:border-indigo-500" 
                             value={formData.gpa} onChange={e => handleChange('gpa', e.target.value)} placeholder="e.g. 3.5" />
                    </div>
                </div>
            </div>

            {/* CRM Config */}
            <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-gray-100 pb-2 mb-3">CRM Configuration</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                         <label className="text-xs font-semibold text-slate-700 mb-1 block">Annual Budget (USD)</label>
                         <div className="relative">
                            <DollarSign className="absolute left-3 top-2.5 text-slate-400" size={14} />
                            <input type="number" className="w-full pl-8 pr-3 py-2 text-sm bg-slate-50 border border-gray-200 rounded-md outline-none focus:border-indigo-500" 
                                value={formData.budget} onChange={e => handleChange('budget', e.target.value)} placeholder="25000" />
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-slate-700 mb-1 block">Lead Priority</label>
                        <select className="w-full px-3 py-2 text-sm bg-slate-50 border border-gray-200 rounded-md outline-none focus:border-indigo-500"
                             value={formData.priority} onChange={e => handleChange('priority', e.target.value)}>
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-slate-700 mb-1 block">Assign Counselor</label>
                        <select className="w-full px-3 py-2 text-sm bg-slate-50 border border-gray-200 rounded-md outline-none focus:border-indigo-500"
                             value={formData.counselor} onChange={e => handleChange('counselor', e.target.value)}>
                            <option value="">Auto-Assign</option>
                            {EMPLOYEES.filter(e => e.role.includes('Counsel') || e.role.includes('Team Lead')).map(e => (
                                <option key={e.id} value={e.id}>{e.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div className="pt-4 flex flex-wrap gap-3 justify-between items-center border-t border-gray-100 mt-2">
                <div className="flex gap-3">
                    <button 
                        type="button" 
                        className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm"
                        onClick={() => {
                            onNavigate?.('resume');
                            onClose();
                        }}
                    >
                        <Zap size={14} fill="currentColor" />
                        Nex - AI Resume
                    </button>
                    <button 
                        type="button" 
                        className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg border-2 border-slate-200 text-slate-700 hover:bg-slate-50 transition-all hover:border-slate-300"
                        onClick={() => {
                            onNavigate?.('resume');
                            onClose();
                        }}
                    >
                        <User size={14} />
                        Upload CV
                    </button>
                </div>
                <div className="flex gap-3">
                    <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button type="submit" className="px-6 bg-[#0F172A]">Add Student</Button>
                </div>
            </div>
        </form>
      </div>
    </div>
  );
};