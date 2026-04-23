import React, { useState } from 'react';
import { ActivityFeed } from './ActivityFeed';
import { EscalationDesk } from './EscalationDesk';
import { IncentiveCalculator } from './IncentiveCalculator';
import { LeaderboardWidget } from './LeaderboardWidget';
import { ActivityLog, Task } from '../types';
import { STUDENTS } from '../constants';
import { formatLKR } from '../utils';
import { AlertOctagon, TrendingUp, ArrowRight, Zap, CheckSquare, Banknote } from 'lucide-react';
import { Button } from './Button';

interface ManagerDashboardProps {
    activities: ActivityLog[];
    tasks: Task[];
    onNavigate: (view: string) => void;
}

export const ManagerDashboard: React.FC<ManagerDashboardProps> = ({ activities, tasks, onNavigate }) => {
    const [activeTab, setActiveTab] = useState<'escalations' | 'reviews'>('escalations');
    
    // --- Aggregation Logic for KPIs ---
    const totalRevenue = STUDENTS.reduce((acc, s) => acc + (parseFloat(s.budget || "0") * 0.1), 0); // Mock 10%
    const overdueTasks = tasks.filter(t => t.status === 'Overdue').length;
    const pendingReviews = tasks.filter(t => t.status === 'In Review').length;
    const visaGrantedCount = STUDENTS.filter(s => s.status === 'Visa Pilot').length; // Assuming Visa Pilot includes granted for now, or we can just count Visa Pilot
    const visaProcessingCount = STUDENTS.filter(s => ['Visa Pilot'].includes(s.status)).length;
    const successRate = visaProcessingCount ? Math.round((visaGrantedCount / visaProcessingCount) * 100) : 0;

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-[#0F172A]">Command Center</h1>
                    <p className="text-sm text-slate-500 mt-1">Operational oversight and critical action items.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="secondary" className="w-full sm:w-auto" onClick={() => onNavigate('branch')}>View Full Analytics</Button>
                </div>
            </div>

            {/* Row 1: High-Level KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <DashboardCard 
                    title="Est. Revenue (Q3)" 
                    value={formatLKR(totalRevenue)} 
                    icon={<Banknote size={20} />} 
                    trend="+12% vs target"
                    trendColor="text-emerald-600"
                />
                <DashboardCard 
                    title="SLA Breaches" 
                    value={overdueTasks.toString()} 
                    icon={<AlertOctagon size={20} />} 
                    trend={overdueTasks > 0 ? "Requires Attention" : "All Clear"}
                    trendColor={overdueTasks > 0 ? "text-rose-600" : "text-emerald-600"}
                    highlight={overdueTasks > 0}
                    onClick={() => onNavigate('tasks')}
                />
                 <DashboardCard 
                    title="Pending Reviews" 
                    value={pendingReviews.toString()} 
                    icon={<CheckSquare size={20} />} 
                    trend={pendingReviews > 0 ? "Action Required" : "Up to date"}
                    trendColor={pendingReviews > 0 ? "text-amber-600" : "text-slate-500"}
                    highlight={pendingReviews > 0}
                    onClick={() => onNavigate('tasks')}
                />
                 <DashboardCard 
                    title="Visa Success Rate" 
                    value={`${successRate}%`} 
                    icon={<TrendingUp size={20} />} 
                    trend="Top Tier"
                    trendColor="text-indigo-600"
                />
            </div>

            {/* Row 2: The Core Workflow (Revenue vs Leaderboard vs Escalation) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Left: Revenue Leaders + Incentive */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Incentive Calc (High value) */}
                    <IncentiveCalculator />

                     {/* Escalation Desk & Reviews */}
                    <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${activeTab === 'escalations' ? 'bg-rose-500 animate-pulse' : 'bg-slate-300'}`} />
                                    Command Center
                                </h3>
                                <div className="flex bg-slate-100 p-1 rounded-lg self-start">
                                    <button 
                                        onClick={() => setActiveTab('escalations')}
                                        className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${activeTab === 'escalations' ? 'bg-white text-rose-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        Escalations ({overdueTasks})
                                    </button>
                                    <button 
                                        onClick={() => setActiveTab('reviews')}
                                        className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${activeTab === 'reviews' ? 'bg-white text-amber-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        Pending Reviews ({pendingReviews})
                                    </button>
                                </div>
                            </div>
                            <button onClick={() => onNavigate('tasks')} className="text-xs text-indigo-600 font-medium hover:underline flex items-center">
                                Manage All Tasks <ArrowRight size={12} className="ml-1" />
                            </button>
                        </div>
                        <div className="bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
                            {activeTab === 'escalations' ? (
                                <EscalationDesk tasks={tasks} onReassign={(id) => console.log(id)} />
                            ) : (
                                <div className="p-4 space-y-3">
                                    {tasks.filter(t => t.status === 'In Review').length === 0 ? (
                                        <div className="text-center py-8 text-slate-500 text-sm">No tasks pending review.</div>
                                    ) : (
                                        tasks.filter(t => t.status === 'In Review').map(task => (
                                            <div key={task.id} className="flex justify-between items-center p-3 bg-amber-50 border border-amber-100 rounded-lg">
                                                <div>
                                                    <p className="text-sm font-medium text-slate-900">{task.task}</p>
                                                    <p className="text-xs text-slate-500">Submitted by {task.assigned_to.join(', ')}</p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button size="sm" variant="outline" className="text-xs h-7">Reject</Button>
                                                    <Button size="sm" className="text-xs h-7 bg-emerald-600 hover:bg-emerald-700">Approve</Button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right: Gamified Leaderboard & Live Ops */}
                <div className="space-y-8">
                    <LeaderboardWidget />
                    
                    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm h-auto flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                <Zap size={18} className="text-indigo-600" fill="currentColor" />
                                Live Operations Feed
                            </h3>
                        </div>
                        <div className="flex-1 min-h-[250px] overflow-y-auto">
                            <ActivityFeed activities={activities} limit={5} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Helper Component for consistency
const DashboardCard: React.FC<{ 
    title: string; 
    value: string; 
    icon: React.ReactNode; 
    trend: string; 
    trendColor: string;
    highlight?: boolean;
    onClick?: () => void;
}> = ({ title, value, icon, trend, trendColor, highlight, onClick }) => (
    <div 
        onClick={onClick}
        className={`p-5 rounded-xl border shadow-sm flex flex-col justify-between transition-all
        ${highlight ? 'bg-rose-50 border-rose-100' : 'bg-white border-gray-200'}
        ${onClick ? 'cursor-pointer hover:border-indigo-300 hover:shadow-md' : ''}
    `}>
        <div className="flex justify-between items-start">
            <div className={`p-2 rounded-lg ${highlight ? 'bg-white text-rose-600' : 'bg-slate-50 text-slate-500'}`}>
                {icon}
            </div>
            {highlight && <div className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />}
        </div>
        <div className="mt-4">
            <h4 className={`text-xs font-bold uppercase tracking-wider ${highlight ? 'text-rose-700' : 'text-slate-500'}`}>{title}</h4>
            <div className={`text-2xl font-bold mt-1 tracking-tight ${highlight ? 'text-rose-900' : 'text-slate-900'}`}>{value}</div>
            <p className={`text-xs font-medium mt-2 ${trendColor}`}>{trend}</p>
        </div>
    </div>
);