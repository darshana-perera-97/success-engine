
import React, { useState, useMemo } from 'react';
import { Student, Employee, Task } from '../types';
import { formatLKR } from '../utils';

import { 
    Users, TrendingUp, AlertTriangle, CheckCircle, 
    Search, ArrowRight, ArrowLeft, Star, DollarSign,
    Briefcase, ThumbsUp, Activity,
    Target, AlertOctagon, X, Plus, Mail, MapPin, Phone
} from 'lucide-react';
import { Button } from './Button';
import { 
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    AreaChart, Area
} from 'recharts';

interface CounselorManagementProps {
    onNavigate: (view: string) => void;
    students: Student[];
    employees: Employee[];
    tasks: Task[];
    onTransferStudents: (fromCounselorId: string, toCounselorId: string) => void;
    onAddActivity?: (activity: any) => void;
}

export const CounselorManagement: React.FC<CounselorManagementProps> = ({ students, employees, tasks, onTransferStudents }) => {
    const [selectedCounselorId, setSelectedCounselorId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [targetCounselorId, setTargetCounselorId] = useState('');
    const [newCounselor, setNewCounselor] = useState({ name: '', email: '', branch: 'Colombo HQ', role: 'Senior Counselor', phone: '' });

    const handleAddCounselor = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCounselor.name || !newCounselor.email) return;
        
        // In a real app, this would be an API call
        console.log('Adding counselor:', newCounselor);
        
        // Add to activity feed
        if (onAddActivity) {
            onAddActivity({
                user: 'Manager',
                role: 'Manager',
                action: 'added new counselor',
                target: newCounselor.name,
                type: 'system'
            });
        }

        setIsAddModalOpen(false);
        setNewCounselor({ name: '', email: '', branch: 'Colombo HQ', role: 'Senior Counselor', phone: '' });
        // Show success state (mock)
        alert('Counselor added successfully!');
    };

    // --- Data Aggregation ---
    const counselors = useMemo(() => {
        return employees.filter(e => e.role.includes('Counsel') || e.role.includes('Team Lead')).map(emp => {
            const myStudents = students.filter(s => s.counselor === emp.id);
            const myTasks = tasks.filter(t => t.assigned_to.includes(emp.id));
            
            const activeStudents = myStudents.length;
            const visaGranted = myStudents.filter(s => s.status === 'Visa Pilot').length;
            const overdueTasks = myTasks.filter(t => t.status === 'Overdue').length;
            
            // Mock Calculations
            const maxCapacity = 35; 
            const capacityLoad = Math.round((activeStudents / maxCapacity) * 100);
            
            // Success Rate
            const successRate = activeStudents > 0 ? Math.round((visaGranted / activeStudents) * 100) : 0;
            
            // SLA: 100 - (Overdue * 5)
            const sla = Math.max(0, 100 - (overdueTasks * 5));

            // Revenue
            const revenue = myStudents.reduce((acc, s) => acc + (parseFloat(s.budget || "0") * 0.005), 0);

            // Conversion
            const converted = myStudents.filter(s => !['New Inquiry', 'Counseling'].includes(s.status)).length;
            const conversionRate = activeStudents > 0 ? Math.round((converted / activeStudents) * 100) : 0;

            // Mock NPS Score (random for demo)
            const npsScore = emp.npsScore || 85;

            return {
                ...emp,
                metrics: {
                    activeStudents,
                    visaGranted,
                    overdueTasks,
                    capacityLoad,
                    successRate,
                    sla,
                    revenue,
                    conversionRate,
                    npsScore,
                    avgTurnaround: '2.4h' 
                },
                students: myStudents,
                tasks: myTasks
            };
        });
    }, [students, employees, tasks]);

    const filteredCounselors = counselors.filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        c.branch.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleTransfer = () => {
        if (selectedCounselorId && targetCounselorId) {
            onTransferStudents(selectedCounselorId, targetCounselorId);
            setIsTransferModalOpen(false);
            setTargetCounselorId('');
        }
    };

    // --- Render: Detail View ---
    if (selectedCounselorId) {
        const counselor = counselors.find(c => c.id === selectedCounselorId);
        if (!counselor) return null;

        // Funnel Data Construction
        const funnelData = [
            { stage: 'Inquiries', count: counselor.students.length },
            { stage: 'Counseling', count: counselor.students.filter(s => s.status !== 'New Inquiry').length },
            { stage: 'Applied', count: counselor.students.filter(s => ['Uni Application', 'Offer Received', 'Visa Pilot'].includes(s.status)).length },
            { stage: 'Visas', count: counselor.students.filter(s => s.status === 'Visa Pilot').length },
        ];

        return (
            <div className="space-y-8 animate-in slide-in-from-right-8 duration-500 pb-10">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setSelectedCounselorId(null)} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
                            <ArrowLeft size={20} />
                        </button>
                        <div className="flex items-center gap-4">
                             <div className="w-16 h-16 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xl font-bold border-4 border-white shadow-sm">
                                {counselor.avatar ? (
                                    <img src={counselor.avatar} alt={counselor.name} className="w-full h-full object-cover rounded-full" referrerPolicy="no-referrer" />
                                ) : (
                                    counselor.name.charAt(0)
                                )}
                             </div>
                             <div>
                                 <h1 className="text-2xl font-bold text-slate-900">{counselor.name}</h1>
                                 <div className="flex items-center gap-3 text-sm text-slate-500">
                                     <span className="flex items-center gap-1"><Briefcase size={14}/> {counselor.role}</span>
                                     <span>•</span>
                                     <span className="flex items-center gap-1"><Users size={14}/> {counselor.branch}</span>
                                     <span>•</span>
                                     <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full text-xs font-bold border border-emerald-100">Active</span>
                                 </div>
                             </div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button onClick={() => setIsTransferModalOpen(true)}>Transfer</Button>
                    </div>
                </div>

                {/* Transfer Modal */}
                {isTransferModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md border border-gray-100 scale-100 animate-in zoom-in-95">
                            <div className="flex justify-between items-center p-5 border-b border-gray-100">
                                <div>
                                    <h3 className="font-semibold text-lg text-slate-900">Transfer Students</h3>
                                    <p className="text-xs text-slate-500 mt-1">Reassign all students from {counselor.name}</p>
                                </div>
                                <button onClick={() => setIsTransferModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="p-5 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Select New Counselor</label>
                                    <select 
                                        className="w-full p-2 text-sm border border-gray-200 rounded-md focus:ring-1 focus:ring-indigo-500 outline-none"
                                        value={targetCounselorId}
                                        onChange={(e) => setTargetCounselorId(e.target.value)}
                                    >
                                        <option value="">Select a counselor...</option>
                                        {counselors.filter(c => c.id !== counselor.id).map(c => (
                                            <option key={c.id} value={c.id}>{c.name} ({c.metrics.activeStudents} active students)</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="bg-amber-50 border border-amber-100 p-3 rounded-lg flex gap-3 items-start">
                                    <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                                    <p className="text-xs text-amber-800">
                                        This will transfer <strong>{counselor.metrics.activeStudents} students</strong> and all their associated tasks to the selected counselor. This action cannot be undone.
                                    </p>
                                </div>
                                <div className="flex justify-end gap-2 pt-2">
                                    <Button variant="ghost" onClick={() => setIsTransferModalOpen(false)}>Cancel</Button>
                                    <Button disabled={!targetCounselorId} onClick={handleTransfer}>Confirm Transfer</Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* KPI Cards - Business Intelligence Focus */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <MetricCard 
                        title="Revenue YTD" 
                        value={formatLKR(counselor.metrics.revenue)} 
                        icon={<DollarSign size={18}/>} 
                        subtext="Realized Commissions" 
                        highlight 
                    />
                    <MetricCard 
                        title="Student Satisfaction" 
                        value={`${counselor.metrics.npsScore}`} 
                        icon={<ThumbsUp size={18}/>} 
                        subtext="NPS Score"
                        color={counselor.metrics.npsScore > 80 ? 'text-emerald-600' : 'text-amber-600'}
                    />
                     <MetricCard 
                        title="Pipeline Conversion" 
                        value={`${counselor.metrics.conversionRate}%`} 
                        icon={<Target size={18}/>} 
                        subtext="Inquiry to App" 
                    />
                    <MetricCard 
                        title="Workload Capacity" 
                        value={`${counselor.metrics.capacityLoad}%`} 
                        icon={<Activity size={18}/>} 
                        subtext={counselor.metrics.capacityLoad > 90 ? "High Burnout Risk" : "Optimal Load"}
                        color={counselor.metrics.capacityLoad > 90 ? 'text-rose-600' : 'text-slate-600'} 
                    />
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Funnel Analytics */}
                    <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <TrendingUp size={18} className="text-slate-400" />
                            Conversion Funnel Analysis
                        </h3>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={funnelData}>
                                    <defs>
                                        <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.1}/>
                                            <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                    <XAxis dataKey="stage" axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 12}} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 12}} />
                                    <Tooltip cursor={{fill: '#F1F5F9'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                                    <Area type="monotone" dataKey="count" stroke="#4F46E5" strokeWidth={2} fillOpacity={1} fill="url(#colorCount)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    
                    {/* Burnout/Capacity Indicator */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col">
                        <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                             <AlertOctagon size={18} className="text-slate-400" />
                             Capacity & Risk
                        </h3>
                        
                        <div className="flex-1 flex flex-col justify-center space-y-8">
                            <div>
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-slate-600 font-medium">Active Students</span>
                                    <span className="font-bold text-slate-900">{counselor.metrics.activeStudents} / 35</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                                    <div 
                                        className={`h-full rounded-full transition-all duration-1000 ${
                                            counselor.metrics.capacityLoad > 90 ? 'bg-rose-500' : 'bg-emerald-500'
                                        }`} 
                                        style={{width: `${counselor.metrics.capacityLoad}%`}}
                                    />
                                </div>
                                {counselor.metrics.capacityLoad > 90 && (
                                    <p className="text-xs text-rose-600 mt-2 flex items-center gap-1 font-medium">
                                        <AlertTriangle size={12} /> Overloaded: Stop assigning new leads.
                                    </p>
                                )}
                            </div>

                            <div>
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-slate-600 font-medium">SLA Compliance</span>
                                    <span className="font-bold text-slate-900">{counselor.metrics.sla}%</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                                    <div 
                                        className={`h-full rounded-full transition-all duration-1000 ${
                                            counselor.metrics.sla < 90 ? 'bg-amber-500' : 'bg-indigo-500'
                                        }`} 
                                        style={{width: `${counselor.metrics.sla}%`}}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Feed */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-slate-900">Overdue / Priority Tasks</h3>
                            <span className="text-xs font-bold bg-rose-50 text-rose-600 px-2 py-1 rounded-full">{counselor.metrics.overdueTasks} Critical</span>
                        </div>
                        <div className="space-y-3">
                            {counselor.tasks.filter(t => t.priority === 'High' || t.status === 'Overdue').slice(0, 5).map(task => (
                                <div key={task.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                                    <div className="mt-1"><AlertTriangle size={14} className="text-rose-500" /></div>
                                    <div>
                                        <p className="text-sm font-medium text-slate-900">{task.task}</p>
                                        <p className="text-xs text-slate-500">Student: {task.student_id} • Due: {task.dueDate}</p>
                                    </div>
                                </div>
                            ))}
                             {counselor.tasks.filter(t => t.priority === 'High' || t.status === 'Overdue').length === 0 && (
                                <p className="text-sm text-slate-400 italic">No critical tasks pending.</p>
                             )}
                        </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                        <h3 className="font-bold text-slate-900 mb-4">Recent Student Activity</h3>
                        <div className="space-y-4">
                            {counselor.students.slice(0, 5).map(student => (
                                <div key={student.id} className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
                                        {student.name.charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-slate-900 truncate">
                                            {student.name} <span className="text-slate-400 font-normal">moved to</span> {student.status}
                                        </p>
                                    </div>
                                    <span className="text-xs text-slate-400">Today</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // --- Render: Directory View ---

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-[#0F172A]">Counselor Management</h1>
                    <p className="text-sm text-slate-500 mt-1">Monitor performance, workload capacity, and SLA compliance.</p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:flex-none">
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                        <input 
                            type="text" 
                            placeholder="Search counselors..." 
                            className="w-full sm:w-64 pl-9 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button onClick={() => setIsAddModalOpen(true)}>
                        <Plus size={16} className="mr-2" /> Add Counselor
                    </Button>
                </div>
            </div>

            {/* Add Counselor Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md border border-gray-100 scale-100 animate-in zoom-in-95 overflow-hidden">
                        <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-slate-50">
                            <div>
                                <h3 className="font-bold text-lg text-slate-900">Add New Counselor</h3>
                                <p className="text-xs text-slate-500 mt-1">Onboard a new member to the team.</p>
                            </div>
                            <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <form className="p-5 space-y-4" onSubmit={handleAddCounselor}>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Full Name</label>
                                    <div className="relative">
                                        <Users className="absolute left-3 top-2.5 text-slate-400" size={16} />
                                        <input 
                                            name="name" 
                                            required 
                                            type="text" 
                                            placeholder="e.g. Aruni Perera" 
                                            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 outline-none" 
                                            value={newCounselor.name}
                                            onChange={(e) => setNewCounselor({...newCounselor, name: e.target.value})}
                                        />
                                    </div>
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-2.5 text-slate-400" size={16} />
                                        <input 
                                            name="email" 
                                            required 
                                            type="email" 
                                            placeholder="aruni@abec.lk" 
                                            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 outline-none" 
                                            value={newCounselor.email}
                                            onChange={(e) => setNewCounselor({...newCounselor, email: e.target.value})}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Branch</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-2.5 text-slate-400" size={16} />
                                        <select 
                                            name="branch" 
                                            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 outline-none appearance-none bg-white"
                                            value={newCounselor.branch}
                                            onChange={(e) => setNewCounselor({...newCounselor, branch: e.target.value})}
                                        >
                                            <option>Colombo HQ</option>
                                            <option>Kandy</option>
                                            <option>Galle</option>
                                            <option>Jaffna</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Role</label>
                                    <div className="relative">
                                        <Briefcase className="absolute left-3 top-2.5 text-slate-400" size={16} />
                                        <select 
                                            name="role" 
                                            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 outline-none appearance-none bg-white"
                                            value={newCounselor.role}
                                            onChange={(e) => setNewCounselor({...newCounselor, role: e.target.value})}
                                        >
                                            <option>Senior Counselor</option>
                                            <option>Junior Counselor</option>
                                            <option>Team Lead</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Phone Number</label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-2.5 text-slate-400" size={16} />
                                        <input 
                                            name="phone" 
                                            required 
                                            type="tel" 
                                            placeholder="+94 77 123 4567" 
                                            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 outline-none" 
                                            value={newCounselor.phone}
                                            onChange={(e) => setNewCounselor({...newCounselor, phone: e.target.value})}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                                <Button variant="ghost" type="button" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white">Create Profile</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* High Level Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard title="Active Counselors" value={counselors.length.toString()} icon={<Briefcase size={18}/>} />
                <MetricCard title="Avg SLA Score" value={`${Math.round(counselors.reduce((acc, c) => acc + c.metrics.sla, 0) / counselors.length)}%`} icon={<CheckCircle size={18}/>} color="text-emerald-600" />
                <MetricCard title="Total Students" value={counselors.reduce((acc, c) => acc + c.metrics.activeStudents, 0).toString()} icon={<Users size={18}/>} />
                <div className="bg-gradient-to-br from-[#D32722] via-[#BF342F] to-[#883560] p-5 rounded-xl text-white shadow-lg relative overflow-hidden flex items-center gap-4">
                    <div className="w-16 h-16 bg-white rounded-xl flex-shrink-0 overflow-hidden shadow-sm border-2 border-white/20">
                        <img 
                            src="/8.jpg" 
                            alt="Nethmini Julanjala" 
                            className="w-full h-full object-cover" 
                            referrerPolicy="no-referrer"
                        />
                    </div>
                    <div className="relative z-10 flex-1">
                        <div className="flex items-center gap-2 text-white/80 text-xs font-bold uppercase tracking-wider mb-1">
                            <Star size={14} className="text-yellow-400" fill="currentColor" /> Top Performer
                        </div>
                        <div className="text-xl font-bold">Nethmini Julanjala</div>
                        <div className="text-sm text-white/90 font-medium mt-0.5">3 Visas Granted</div>
                    </div>
                    <div className="absolute -right-4 -bottom-4 text-white opacity-10">
                        <Users size={100} />
                    </div>
                </div>
            </div>

            {/* Directory Table */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 border-b border-gray-200 text-slate-500 font-medium">
                        <tr>
                            <th className="px-6 py-4">Counselor</th>
                            <th className="px-6 py-4 hidden md:table-cell">Branch</th>
                            <th className="px-6 py-4 hidden lg:table-cell">Capacity</th>
                            <th className="px-6 py-4 hidden lg:table-cell">SLA</th>
                            <th className="px-6 py-4 hidden sm:table-cell">Visa</th>
                            <th className="px-6 py-4"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredCounselors.map(c => (
                            <tr key={c.id} className="hover:bg-slate-50 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold border border-slate-200">
                                            {c.avatar ? (
                                                <img src={c.avatar} alt={c.name} className="w-full h-full object-cover rounded-full" referrerPolicy="no-referrer" />
                                            ) : (
                                                c.name.charAt(0)
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-900">{c.name}</p>
                                            <p className="text-xs text-slate-500">{c.role}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 hidden md:table-cell text-slate-600">{c.branch}</td>
                                <td className="px-6 py-4 hidden lg:table-cell">
                                    <div className="w-full max-w-[140px]">
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="font-medium text-slate-700">{c.metrics.activeStudents} Active</span>
                                            <span className={`font-bold ${c.metrics.capacityLoad > 90 ? 'text-rose-600' : 'text-slate-400'}`}>
                                                {c.metrics.capacityLoad}%
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                            <div 
                                                className={`h-full rounded-full ${
                                                    c.metrics.capacityLoad > 90 ? 'bg-rose-500' : 
                                                    c.metrics.capacityLoad > 75 ? 'bg-amber-500' : 'bg-indigo-500'
                                                }`} 
                                                style={{width: `${c.metrics.capacityLoad}%`}}
                                            />
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 hidden lg:table-cell">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                                        c.metrics.sla >= 90 ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                                        c.metrics.sla >= 70 ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-rose-50 text-rose-700 border-rose-100'
                                    }`}>
                                        {c.metrics.sla}%
                                    </span>
                                </td>
                                <td className="px-6 py-4 hidden sm:table-cell font-mono font-medium text-slate-700">
                                    {c.metrics.successRate}%
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <Button size="sm" variant="secondary" onClick={() => setSelectedCounselorId(c.id)}>
                                        View <ArrowRight size={14} className="ml-1" />
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const MetricCard: React.FC<{title: string; value: string; icon: React.ReactNode; subtext?: string; color?: string; highlight?: boolean}> = ({ title, value, icon, subtext, color, highlight }) => (
    <div className={`p-5 rounded-xl border shadow-sm flex flex-col justify-between ${highlight ? 'bg-indigo-50 border-indigo-100' : 'bg-white border-gray-200'}`}>
        <div className="flex justify-between items-start">
            <div className={`p-2 rounded-lg ${highlight ? 'bg-white text-indigo-600' : 'bg-slate-50 text-slate-500'}`}>{icon}</div>
        </div>
        <div className="mt-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">{title}</h4>
            <div className={`text-2xl font-bold mt-1 ${color || 'text-slate-900'}`}>{value}</div>
            {subtext && <p className="text-xs text-slate-400 mt-1">{subtext}</p>}
        </div>
    </div>
);
