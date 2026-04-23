import React from 'react';
import { ActivityLog } from '../types';
import { Upload, CheckCircle, XCircle, AlertTriangle, Shield, Clock } from 'lucide-react';

interface ActivityFeedProps {
    activities: ActivityLog[];
    limit?: number;
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ activities, limit }) => {
    const displayActivities = limit ? activities.slice(0, limit) : activities;

    const getIcon = (type: ActivityLog['type']) => {
        switch(type) {
            case 'upload': return <Upload size={14} className="text-blue-500" />;
            case 'approval': return <CheckCircle size={14} className="text-emerald-500" />;
            case 'rejection': return <XCircle size={14} className="text-rose-500" />;
            case 'task': return <Clock size={14} className="text-amber-500" />;
            case 'system': return <Shield size={14} className="text-slate-500" />;
            default: return <AlertTriangle size={14} className="text-slate-400" />;
        }
    };

    return (
        <div className="space-y-4">
            {displayActivities.map((act) => (
                <div key={act.id} className="flex gap-3 items-start p-3 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-gray-100">
                    <div className="w-8 h-8 rounded-full bg-white border border-gray-100 shadow-sm flex items-center justify-center flex-shrink-0 mt-0.5">
                        {getIcon(act.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900">
                            <span className="font-bold text-indigo-900">{act.user}</span> 
                            <span className="text-slate-600 font-normal"> {act.action} </span>
                            <span className="font-medium text-slate-900">{act.target}</span>
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded uppercase tracking-wide font-medium">{act.role}</span>
                            <span className="text-xs text-slate-400">• {act.timestamp}</span>
                        </div>
                    </div>
                </div>
            ))}
            {displayActivities.length === 0 && (
                <div className="text-center py-8 text-slate-400 text-sm">No recent activity.</div>
            )}
        </div>
    );
};