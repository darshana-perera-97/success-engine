import React from 'react';
import { Trophy, Medal, TrendingUp, Star, Crown } from 'lucide-react';
import { STUDENTS, EMPLOYEES } from '../constants';

export const LeaderboardWidget: React.FC = () => {
    // 1. Filter Counselors
    const counselors = EMPLOYEES.filter(e => e.role.includes('Counsel') || e.role.includes('Team Lead'));

    // 2. Calculate Scores
    const leaderboard = counselors.map(counselor => {
        const myStudents = STUDENTS.filter(s => s.counselor === counselor.id);
        
        // Scoring Algorithm
        let score = 0;
        let visas = 0;
        
        myStudents.forEach(s => {
            if (s.status === 'Visa Pilot') { score += 50; visas++; }
            else if (s.status === 'Offer Received') score += 10;
            else if (s.status === 'Uni Application') score += 5;
            else if (s.status === 'Documentation') score += 2;
        });

        return {
            ...counselor,
            score,
            visas,
            activeCount: myStudents.length
        };
    }).sort((a, b) => b.score - a.score); // Descending

    const top3 = leaderboard.slice(0, 3);
    const currentUserRank = leaderboard.findIndex(c => c.id === 'EMP002') + 1; // Mock Sarah's Rank

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-[#0F172A] p-4 text-white flex justify-between items-center">
                <div>
                    <h4 className="font-bold text-sm flex items-center gap-2">
                        <Trophy size={16} className="text-yellow-400" />
                        Leaderboard
                    </h4>
                    <p className="text-[10px] text-slate-400">Weekly Performance</p>
                </div>
                <div className="text-right">
                    <p className="text-[10px] uppercase text-slate-400 font-bold">Your Rank</p>
                    <p className="text-lg font-bold leading-none text-white">#{currentUserRank}</p>
                </div>
            </div>

            <div className="p-2">
                {top3.map((agent, idx) => {
                    let medalColor = '';
                    let Icon = Star;
                    
                    if (idx === 0) { medalColor = 'text-yellow-500 bg-yellow-50 border-yellow-100'; Icon = Crown; }
                    else if (idx === 1) { medalColor = 'text-slate-500 bg-slate-100 border-slate-200'; Icon = Medal; }
                    else if (idx === 2) { medalColor = 'text-orange-600 bg-orange-50 border-orange-100'; Icon = Medal; }

                    return (
                        <div key={agent.id} className="flex items-center gap-3 p-3 border-b last:border-0 border-gray-50 hover:bg-slate-50 transition-colors rounded-lg">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${medalColor} font-bold text-xs shadow-sm`}>
                                {idx === 0 ? <Icon size={14} fill="currentColor" /> : (idx + 1)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className={`text-sm font-semibold truncate ${idx === 0 ? 'text-slate-900' : 'text-slate-700'}`}>
                                    {agent.name}
                                </p>
                                <p className="text-[10px] text-slate-400 flex items-center gap-2">
                                    <span>{agent.score} pts</span>
                                    <span>•</span>
                                    <span>{agent.visas} Visas</span>
                                </p>
                            </div>
                            {idx === 0 && (
                                <div className="text-xs font-bold text-emerald-600 flex flex-col items-end">
                                    <TrendingUp size={14} />
                                    <span>Top</span>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
            
            <div className="bg-gray-50 p-2 text-center border-t border-gray-100">
                <button className="text-xs text-indigo-600 font-medium hover:underline">View Full Rankings</button>
            </div>
        </div>
    );
};