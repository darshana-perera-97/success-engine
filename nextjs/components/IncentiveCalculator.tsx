import React from 'react';
import { STUDENTS, EMPLOYEES } from '../constants';
import { formatLKR } from '../utils';
import { Download, Calendar, Banknote } from 'lucide-react';
import { Button } from './Button';

export const IncentiveCalculator: React.FC = () => {
    // 1. Filter Counselors
    const counselors = EMPLOYEES.filter(e => e.role.includes('Counsel') || e.role.includes('Team Lead'));

    // 2. Calc Commissions & Targets
    const incentiveData = counselors.map(agent => {
        const successfulVisas = STUDENTS.filter(s => s.counselor === agent.id && s.status === 'Visa Pilot');
        
        // Incentive Model: $150 Flat Fee + 0.2% of Student Budget
        const flatCommissions = successfulVisas.length * 150;
        const volumeBonus = successfulVisas.reduce((acc, s) => acc + (parseFloat(s.budget || "0") * 0.002), 0);
        const totalPayout = flatCommissions + volumeBonus;

        // Mock Targets
        const targetRevenue = 2000; // Mock target $2000/mo
        const achievementPct = Math.min(100, Math.round((totalPayout / targetRevenue) * 100));

        return {
            ...agent,
            successCount: successfulVisas.length,
            flatCommissions,
            volumeBonus,
            totalPayout,
            targetRevenue,
            achievementPct
        };
    }).sort((a,b) => b.totalPayout - a.totalPayout);

    const totalMonthPayout = incentiveData.reduce((acc, curr) => acc + curr.totalPayout, 0);
    const totalPipelineRevenue = incentiveData.reduce((acc, curr) => acc + (curr.totalPayout * 1.5), 0); // Mock pipeline multiplier

    return (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-gray-50 to-white">
                <div>
                    <h3 className="font-bold text-slate-900 flex items-center gap-2">
                        <Banknote size={20} className="text-emerald-600" />
                        Incentive & Commission Calculator
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">Automated payout calculation based on "Visa Pilot" status.</p>
                </div>
                <div className="flex items-center gap-6">
                     <div className="text-right hidden sm:block">
                        <p className="text-[10px] text-slate-400 uppercase font-bold">Realized (Feb)</p>
                        <p className="text-xl font-bold text-emerald-600">{formatLKR(totalMonthPayout)}</p>
                    </div>
                     <div className="text-right hidden sm:block">
                        <p className="text-[10px] text-slate-400 uppercase font-bold">Pipeline (Mar)</p>
                        <p className="text-xl font-bold text-slate-900">{formatLKR(totalPipelineRevenue)}</p>
                    </div>
                    <Button variant="secondary" size="sm">
                        <Download size={16} className="mr-2" /> Payroll Export
                    </Button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-slate-500 font-medium border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-4">Counselor</th>
                            <th className="px-6 py-4">Target Progress</th>
                            <th className="px-6 py-4">Visas Granted</th>
                            <th className="px-6 py-4">Total Commission</th>
                            <th className="px-6 py-4 text-center">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {incentiveData.map((agent) => (
                            <tr key={agent.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs">
                                        {agent.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-900">{agent.name}</p>
                                        <p className="text-xs text-slate-500">{agent.branch}</p>
                                    </div>
                                </td>
                                <td className="px-6 py-4 w-64">
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="text-slate-500 font-medium">{formatLKR(agent.totalPayout)} / {formatLKR(agent.targetRevenue)}</span>
                                        <span className="text-slate-700 font-bold">{agent.achievementPct}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                                        <div 
                                            className={`h-full rounded-full ${agent.achievementPct >= 100 ? 'bg-emerald-500' : 'bg-indigo-500'}`} 
                                            style={{width: `${agent.achievementPct}%`}}
                                        />
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-slate-900">{agent.successCount}</span>
                                        <span className="text-xs text-slate-400">students</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 font-bold text-emerald-600 font-mono text-base">
                                    {formatLKR(agent.totalPayout)}
                                </td>
                                <td className="px-6 py-4 text-center">
                                    {agent.totalPayout > 0 ? (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                                            Ready
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-500 border border-slate-200">
                                            -
                                        </span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            <div className="p-4 bg-slate-50 border-t border-gray-200 text-xs text-slate-500 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <Calendar size={14} />
                    <span>Calculation Period: Feb 1, 2026 - Feb 28, 2026</span>
                </div>
                <span>* Volume bonus calculated on confirmed tuition budget</span>
            </div>
        </div>
    );
};