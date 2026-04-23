import React from 'react';
import { STUDENTS } from '../constants';
import { formatLKR, RATE_UPDATED_AT } from '../utils';
import { Branch } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { MapPin, TrendingUp, Download, Banknote, Clock } from 'lucide-react';
import { Button } from './Button';

const BRANCHES: Branch[] = ['Colombo HQ', 'Kandy', 'Galle', 'Jaffna'];

export const BranchAnalytics: React.FC = () => {
    // Aggregation Logic
    const branchData = BRANCHES.map(branch => {
        const branchStudents = STUDENTS.filter(s => s.branch === branch);
        const revenue = branchStudents.reduce((acc, s) => acc + (parseFloat(s.budget || "0") * 0.1), 0); // Mock 10% commission
        const conversions = branchStudents.filter(s => ['Visa Pilot', 'Offer Received'].includes(s.status)).length;
        return {
            name: branch,
            students: branchStudents.length,
            revenue: revenue,
            conversions: conversions,
            conversionRate: branchStudents.length ? Math.round((conversions / branchStudents.length) * 100) : 0
        };
    });

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-10">
             <div className="flex justify-between items-end">
                <div>
                   <h1 className="text-2xl font-semibold tracking-tight text-[#0F172A]">Detailed Branch Analytics</h1>
                   <p className="text-sm text-slate-500 mt-1">Deep dive into regional performance metrics.</p>
                   <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-1">
                        <Clock size={10} /> Rates updated: {RATE_UPDATED_AT}
                   </p>
                </div>
                <Button variant="secondary">
                    <Download size={16} className="mr-2" /> Export Report
                </Button>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {branchData.map((data, idx) => (
                    <div key={data.name} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden group hover:border-indigo-300 transition-colors">
                        <div className={`absolute top-0 left-0 w-1 h-full ${idx === 0 ? 'bg-indigo-600' : 'bg-gray-200'}`}></div>
                        <div className="flex justify-between items-start mb-2">
                             <div className="flex items-center gap-2">
                                <MapPin size={16} className="text-slate-400" />
                                <span className="font-semibold text-slate-700">{data.name}</span>
                             </div>
                             {idx === 0 && <span className="bg-indigo-50 text-indigo-700 text-[10px] px-2 py-0.5 rounded-full font-bold">TOP PERFORMER</span>}
                        </div>
                        <div className="grid grid-cols-2 gap-4 mt-4">
                            <div>
                                <p className="text-xs text-slate-400 uppercase">Revenue</p>
                                <p className="text-lg font-bold text-slate-900">{formatLKR(data.revenue)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-400 uppercase">Conv. Rate</p>
                                <p className="text-lg font-bold text-emerald-600">{data.conversionRate}%</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Chart */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-200 shadow-sm min-h-[400px]">
                    <h3 className="text-sm font-bold text-slate-900 mb-6 flex items-center">
                        <TrendingUp size={16} className="mr-2 text-slate-400" />
                        Regional Conversion Performance
                    </h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={branchData} barSize={40}>
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 12}} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 12}} />
                                <Tooltip cursor={{fill: '#F8FAFC'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                                <Bar dataKey="students" name="Total Inquiries" fill="#E2E8F0" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="conversions" name="Successes" fill="#0F172A" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Efficiency Heatmap List */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center">
                        <Banknote size={16} className="mr-2 text-slate-400" />
                        Revenue Efficiency
                    </h3>
                    <div className="space-y-4">
                        {branchData.sort((a,b) => b.revenue - a.revenue).map((data, idx) => (
                            <div key={data.name} className="flex items-center gap-4">
                                <div className="text-xs font-mono text-slate-400 w-4">{idx + 1}</div>
                                <div className="flex-1">
                                    <div className="flex justify-between mb-1">
                                        <span className="text-sm font-medium text-slate-700">{data.name}</span>
                                        <span className="text-sm font-bold text-slate-900">{formatLKR(data.revenue)}</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                                        <div 
                                            className="bg-emerald-500 h-1.5 rounded-full" 
                                            style={{ width: `${(data.revenue / 200000) * 100}%` }} // simplistic scale
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-100">
                        <h4 className="text-xs font-bold text-slate-400 uppercase mb-3">Branch Managers</h4>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold">J</div>
                                <div>
                                    <p className="text-sm font-medium text-slate-900">John Doe</p>
                                    <p className="text-xs text-slate-500">Colombo HQ</p>
                                </div>
                            </div>
                             <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">D</div>
                                <div>
                                    <p className="text-sm font-medium text-slate-900">Devinda K.</p>
                                    <p className="text-xs text-slate-500">Kandy</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};