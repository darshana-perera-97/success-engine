import React from 'react';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
    PieChart, Pie, AreaChart, Area, Legend
} from 'recharts';
import { STUDENTS } from '../constants';
import { formatRawLKR } from '../utils';
import { Users, Globe, Briefcase, MapPin, Banknote } from 'lucide-react';

const funnelData = [
  { name: 'Total Inquiries', value: STUDENTS.length, fill: '#94A3B8' },
  { name: 'Counseling', value: STUDENTS.filter(s => s.status === 'Counseling' || s.status === 'New Inquiry').length, fill: '#64748B' },
  { name: 'Uni Apps', value: STUDENTS.filter(s => ['Uni Application', 'Offer Received', 'Visa Pilot'].includes(s.status)).length, fill: '#6366F1' },
  { name: 'Visas Granted', value: STUDENTS.filter(s => s.status === 'Visa Pilot').length, fill: '#10B981' },
];

const countryData = [
    { name: 'UK', value: STUDENTS.filter(s => s.country === 'UK').length },
    { name: 'Canada', value: STUDENTS.filter(s => s.country === 'Canada').length },
    { name: 'Australia', value: STUDENTS.filter(s => s.country === 'Australia').length },
    { name: 'New Zealand', value: STUDENTS.filter(s => s.country === 'New Zealand').length },
    { name: 'Other', value: STUDENTS.filter(s => s.country === 'USA').length },
];

const revenueData = [
    { month: 'Jan', revenue: 12000000 },
    { month: 'Feb', revenue: 15000000 },
    { month: 'Mar', revenue: 18000000 },
    { month: 'Apr', revenue: 22000000 },
    { month: 'May', revenue: 25000000 },
    { month: 'Jun', revenue: 30000000 },
];


const PIE_COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#6366F1'];

export const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
        <h1 className="text-2xl font-semibold tracking-tight text-[#0F172A]">Executive Overview</h1>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
             <KpiCard title="Total Students" value={STUDENTS.length.toString()} trend="+12%" icon={<Users size={20} />} />
             <KpiCard title="Active Applications" value="18" trend="+5%" icon={<Briefcase size={20} />} />
             <KpiCard title="Visa Success Rate" value="94%" trend="+2%" icon={<Globe size={20} />} positive />
             <KpiCard title="Est. Revenue (Q3)" value={formatRawLKR(45000000)} trend="+8%" icon={<Banknote size={20} />} positive />
        </div>

        {/* Top Row Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Conversion Funnel */}
            <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-[350px] flex flex-col">
                <h3 className="text-sm font-semibold text-slate-900 mb-4">Conversion Funnel Report</h3>
                <div className="flex-1 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={funnelData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                            <XAxis type="number" hide />
                            <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
                            <Tooltip 
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                cursor={{ fill: '#F1F5F9' }}
                            />
                            <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={32}>
                                {funnelData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Country Distribution */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-[350px] flex flex-col">
                <h3 className="text-sm font-semibold text-slate-900 mb-2">Market Distribution</h3>
                <div className="flex-1 relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={countryData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {countryData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-8">
                         <div className="text-center">
                             <div className="text-2xl font-bold text-slate-900">{STUDENTS.length}</div>
                             <div className="text-xs text-slate-500 uppercase">Active</div>
                         </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Forecast */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-[300px]">
                <h3 className="text-sm font-semibold text-slate-900 mb-4 flex justify-between">
                    <span>Revenue Forecast</span>
                    <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded text-xs font-bold">+15% vs Last Year</span>
                </h3>
                <ResponsiveContainer width="100%" height="80%">
                    <AreaChart data={revenueData}>
                        <defs>
                            <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#0F172A" stopOpacity={0.1}/>
                                <stop offset="95%" stopColor="#0F172A" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                        <YAxis hide />
                        <Tooltip 
                            formatter={(value: number) => [formatRawLKR(value), 'Revenue']}
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Area type="monotone" dataKey="revenue" stroke="#0F172A" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Mini Branch Performance */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-[300px] overflow-hidden">
                <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center">
                    <MapPin size={16} className="mr-2" /> Branch Performance Snapshot
                </h3>
                <div className="space-y-4">
                    {[
                        { name: 'Colombo HQ', conversion: 78, students: 44, color: 'bg-indigo-600' },
                        { name: 'Jaffna', conversion: 54, students: 35, color: 'bg-slate-400' },
                        { name: 'Galle', conversion: 42, students: 22, color: 'bg-slate-400' },
                        { name: 'Kandy', conversion: 31, students: 26, color: 'bg-rose-500' }
                    ].map((branch) => {
                         return (
                            <div key={branch.name}>
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="font-medium text-slate-700">{branch.name}</span>
                                    <span className="text-slate-500">{branch.conversion}% Conversion ({branch.students} Students)</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-2">
                                    <div 
                                        className={`h-2 rounded-full ${branch.color}`} 
                                        style={{ width: `${branch.conversion}%` }}
                                    ></div>
                                </div>
                            </div>
                         )
                    })}
                </div>
                <div className="mt-6 pt-4 border-t border-gray-100 text-center">
                    <button className="text-xs font-semibold text-indigo-600 hover:text-indigo-800">View Full Branch Analytics &rarr;</button>
                </div>
            </div>
        </div>
    </div>
  );
};

const KpiCard: React.FC<{ title: string; value: string; trend: string; icon: React.ReactNode; positive?: boolean }> = ({ title, value, trend, icon, positive }) => (
    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
        <div className="flex justify-between items-start">
            <div className="text-slate-500 bg-slate-50 p-2 rounded-lg">{icon}</div>
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${positive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                {trend}
            </span>
        </div>
        <div className="mt-4">
            <h4 className="text-slate-500 text-xs font-medium uppercase tracking-wider">{title}</h4>
            <div className="text-2xl font-bold text-slate-900 mt-1 tracking-tight">{value}</div>
        </div>
    </div>
);