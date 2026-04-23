import React from 'react';
import { Dashboard } from './Dashboard'; // Existing Chart Dashboard
import { ActivityFeed } from './ActivityFeed';
import { ActivityLog, Task, Student } from '../types';
import { Sparkles, Send } from 'lucide-react';

interface AdminDashboardProps {
    activities: ActivityLog[];
    tasks: Task[];
    students: Student[];
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ activities, tasks, students }) => {
    const [isTyping, setIsTyping] = React.useState(false);
    const [aiResponse, setAiResponse] = React.useState<React.ReactNode | null>(null);
    const [inputValue, setInputValue] = React.useState('');

    const overdueTasks = tasks.filter(t => t.status === 'Overdue').length;
    const pendingReviews = tasks.filter(t => t.status === 'In Review').length;

    const totalUnresolvedViolations = students.reduce((acc, s) => {
        return acc + (s.slaViolations?.filter(v => !v.resolved).length || 0);
    }, 0);
    
    const avgSlaScore = Math.max(0, 100 - (totalUnresolvedViolations * 2));

    const handleSendQuery = () => {
        if (!inputValue.trim()) return;
        
        setIsTyping(true);
        setAiResponse(null);
        const query = inputValue;
        setInputValue('');

        setTimeout(() => {
            setIsTyping(false);
            if (query.toLowerCase().includes('underperforming')) {
                setAiResponse(
                    <div className="space-y-4">
                        <p>Based on live data across all three branches for April 2026, here is the current performance breakdown by student conversion rate:</p>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                                <p className="text-[10px] font-bold text-emerald-600 uppercase">Colombo</p>
                                <p className="text-xl font-bold text-emerald-700">78%</p>
                                <p className="text-[10px] text-emerald-600">34 of 44 converted</p>
                            </div>
                            <div className="bg-amber-50 p-3 rounded-lg border border-amber-100">
                                <p className="text-[10px] font-bold text-amber-600 uppercase">Jaffna</p>
                                <p className="text-xl font-bold text-amber-700">54%</p>
                                <p className="text-[10px] text-amber-600">19 of 35 converted</p>
                            </div>
                            <div className="bg-rose-50 p-3 rounded-lg border border-rose-100">
                                <p className="text-[10px] font-bold text-rose-600 uppercase">Kandy</p>
                                <p className="text-xl font-bold text-rose-700">31%</p>
                                <p className="text-[10px] text-rose-600">8 of 26 converted</p>
                            </div>
                        </div>
                        <p className="text-sm text-slate-700">
                            <strong>Kandy is underperforming.</strong> Conversion rate is 47 points below Colombo. Primary bottleneck identified: <strong>11 students</strong> have been stalled in the Documentation stage for more than 9 days with no counsellor task activity logged. This is a follow-up gap, not a lead quality issue.
                        </p>
                        <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-100">
                            <p className="text-xs text-indigo-800 font-medium">
                                <strong>Recommended action:</strong> assign a task audit to the Kandy branch manager and trigger a bulk follow-up sequence for the 11 stalled students immediately.
                            </p>
                        </div>
                    </div>
                );
            } else {
                setAiResponse(
                    <p>I've analyzed the data. We are currently on track for our monthly targets, but we should keep an eye on the documentation bottlenecks in the Kandy branch.</p>
                );
            }
        }, 2000);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Welcome Section */}
            <div className="flex items-center gap-5 pb-2">
                <div className="w-16 h-16 rounded-full p-[1.5px] bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#334155] shadow-md flex-shrink-0">
                    <img 
                        src="/CEO.png" 
                        alt="Sandaruwan" 
                        className="w-full h-full object-cover rounded-full bg-white"
                        referrerPolicy="no-referrer"
                    />
                </div>
                <div className="flex flex-col justify-center">
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                        Welcome Back 👋 Sandaruwan
                    </h1>
                    <p className="text-slate-500 font-medium mt-1 flex items-center gap-2 text-sm">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                        Executive Director, ABEC Premier
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* AI Integrated Data Discussion */}
                    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col h-[500px] relative overflow-hidden group">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
                            <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                <Sparkles size={18} className="text-indigo-600" />
                                AI Integrated Data Discussion
                            </h3>
                            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 border border-slate-100 rounded-full shadow-sm opacity-80 group-hover:opacity-100 transition-opacity w-fit">
                                <div className="flex gap-0.5">
                                    <span className="w-1 h-1 rounded-full bg-[#4285F4]"></span>
                                    <span className="w-1 h-1 rounded-full bg-[#EA4335]"></span>
                                    <span className="w-1 h-1 rounded-full bg-[#FBBC05]"></span>
                                    <span className="w-1 h-1 rounded-full bg-[#34A853]"></span>
                                </div>
                                <span className="text-[10px] font-semibold text-slate-500 tracking-tight whitespace-nowrap">Powered by Google DeepMind</span>
                            </div>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto bg-slate-50/50 rounded-lg p-4 mb-4 border border-slate-100 flex flex-col gap-4">
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                                    <Sparkles size={14} className="text-indigo-600" />
                                </div>
                                <div className="bg-white border border-gray-200 rounded-lg p-3 text-sm text-slate-700 shadow-sm max-w-[80%]">
                                    Hello Sandaruwan. I've analyzed our current operational metrics. To achieve our <strong>Q3 revenue target</strong>, we require approximately <strong>450 additional qualified leads</strong>. Currently, we have <strong>{overdueTasks} overdue tasks</strong> and <strong>{pendingReviews} pending reviews</strong>. 
                                    <br/><br/>
                                    Our <strong>Global SLA Score is {avgSlaScore}%</strong>. I've detected <strong>{totalUnresolvedViolations} unresolved SLA violations</strong>.
                                </div>
                            </div>
                            
                            {aiResponse && (
                                <>
                                    <div className="flex items-start gap-3 flex-row-reverse">
                                        <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border border-gray-200">
                                            <img 
                                                src="/CEO.png" 
                                                alt="Sandaruwan" 
                                                className="w-full h-full object-cover"
                                                referrerPolicy="no-referrer"
                                            />
                                        </div>
                                        <div className="bg-indigo-600 text-white rounded-lg p-3 text-sm shadow-sm max-w-[80%]">
                                            Which branch is underperforming this month?
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                                            <Sparkles size={14} className="text-indigo-600" />
                                        </div>
                                        <div className="bg-white border border-gray-200 rounded-lg p-3 text-sm text-slate-700 shadow-sm max-w-[80%]">
                                            {aiResponse}
                                        </div>
                                    </div>
                                </>
                            )}

                            {isTyping && (
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                                        <Sparkles size={14} className="text-indigo-600" />
                                    </div>
                                    <div className="bg-white border border-gray-200 rounded-lg p-3 text-sm text-slate-700 shadow-sm flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="relative mt-auto">
                            <input 
                                type="text" 
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSendQuery()}
                                placeholder="Ask AI Assist about your data..." 
                                className="w-full pl-4 pr-12 py-3 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
                            />
                            <button 
                                onClick={handleSendQuery}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                            >
                                <Send size={16} />
                            </button>
                        </div>
                    </div>

                    <Dashboard />
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col h-full">
                    <h3 className="font-bold text-slate-900 mb-4">Global Audit Log</h3>
                    <div className="flex-1 overflow-y-auto max-h-[600px] pr-2">
                        <ActivityFeed activities={activities} />
                    </div>
                </div>
            </div>
        </div>
    );
};