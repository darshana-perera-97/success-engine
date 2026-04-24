import React, { useEffect, useMemo, useState } from 'react';
import { formatRawLKR, RATE_UPDATED_AT } from '../utils';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { MapPin, TrendingUp, Download, Banknote, Clock, Plus, X } from 'lucide-react';
import { Button } from './Button';
import { BranchRow, createBranch, getBranches } from '../authApi';

export const BranchAnalytics: React.FC = () => {
    const [branches, setBranches] = useState<BranchRow[]>([]);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [location, setLocation] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadBranches = async () => {
            const result = await getBranches();
            if (!result.ok) return;
            setBranches(result.data);
        };
        loadBranches();
    }, []);

    // Aggregation Logic
    const branchData = useMemo(() => branches.map(branch => {
        const students = branch.totalInquiries || 0;
        const conversions = branch.successes || 0;
        const revenue = branch.revenue || 0;
        return {
            name: branch.location,
            students,
            revenue: revenue,
            conversions: conversions,
            conversionRate: students ? Math.round((conversions / students) * 100) : 0
        };
    }), [branches]);
    const totalRevenue = useMemo(
        () => branchData.reduce((sum, branch) => sum + branch.revenue, 0),
        [branchData]
    );
    const revenueRankedData = useMemo(
        () =>
            [...branchData]
                .sort((a, b) => b.revenue - a.revenue)
                .map((branch) => ({
                    ...branch,
                    revenueShare: totalRevenue > 0 ? (branch.revenue / totalRevenue) * 100 : 0,
                })),
        [branchData, totalRevenue]
    );

    return (
        <>
        <div className="space-y-6 animate-in fade-in duration-500 pb-10">
             <div className="flex justify-between items-end">
                <div>
                   <h1 className="text-2xl font-semibold tracking-tight text-[#0F172A]">Detailed Branch Analytics</h1>
                   <p className="text-sm text-slate-500 mt-1">Deep dive into regional performance metrics.</p>
                   <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-1">
                        <Clock size={10} /> Rates updated: {RATE_UPDATED_AT}
                   </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button onClick={() => setIsAddOpen(true)}>
                        <Plus size={16} className="mr-2" /> Add Branch
                    </Button>
                    <Button variant="secondary">
                        <Download size={16} className="mr-2" /> Export Report
                    </Button>
                </div>
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
                                <p className="text-lg font-bold text-slate-900">{formatRawLKR(data.revenue)}</p>
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
                        {revenueRankedData.map((data, idx) => (
                            <div key={data.name} className="flex items-center gap-4">
                                <div className="text-xs font-mono text-slate-400 w-4">{idx + 1}</div>
                                <div className="flex-1">
                                    <div className="flex justify-between mb-1">
                                        <span className="text-sm font-medium text-slate-700">{data.name}</span>
                                        <div className="text-right">
                                            <span className="text-sm font-bold text-slate-900">{formatRawLKR(data.revenue)}</span>
                                            <p className="text-[11px] text-slate-500">{data.revenueShare.toFixed(1)}% of total</p>
                                        </div>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                                        <div 
                                            className="bg-emerald-500 h-1.5 rounded-full" 
                                            style={{ width: `${Math.max(3, data.revenueShare)}%` }}
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
        {isAddOpen && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
                <div className="w-full max-w-md bg-white rounded-xl border border-gray-100 shadow-2xl overflow-hidden">
                    <div className="p-5 border-b border-gray-100 bg-gray-50/60 flex items-start justify-between">
                        <div>
                            <h3 className="font-semibold text-lg text-slate-900">Add Branch</h3>
                            <p className="text-xs text-slate-500 mt-0.5">Add a new branch location.</p>
                        </div>
                        <button type="button" className="text-slate-400 hover:text-slate-600" onClick={() => setIsAddOpen(false)}>
                            <X size={18} />
                        </button>
                    </div>
                    <form
                        className="p-5 space-y-4"
                        onSubmit={async (e) => {
                            e.preventDefault();
                            setError('');
                            setIsSaving(true);
                            const result = await createBranch(location.trim());
                            setIsSaving(false);
                            if (!result.ok) {
                                setError(result.error);
                                return;
                            }
                            setBranches((prev) => [...prev, result.data]);
                            setLocation('');
                            setIsAddOpen(false);
                        }}
                    >
                        {error ? <p className="text-xs text-rose-600 bg-rose-50 border border-rose-100 rounded-md px-3 py-2">{error}</p> : null}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold uppercase tracking-wide text-slate-700">Branch Location</label>
                            <input
                                className="w-full px-3 py-2 text-sm bg-slate-50 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                placeholder="e.g. Matara"
                                required
                            />
                        </div>
                        <div className="pt-2 flex justify-end gap-2">
                            <Button type="button" variant="ghost" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                            <Button type="submit" isLoading={isSaving}>Save Branch</Button>
                        </div>
                    </form>
                </div>
            </div>
        )}
        </>
    );
};