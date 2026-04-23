import React, { useState } from 'react';
import { Student } from '../types';
import { CheckCircle, AlertCircle, Lock, Unlock } from 'lucide-react';

interface VisaPilotProps {
    student: Student;
    onUpdateStudent?: (student: Student) => void;
}

type VisaStage = 'Pre-Flight Check' | 'Launch' | 'Landing';

interface StageConfig {
    name: VisaStage;
    description: string;
    items: string[];
    blockerMessage: string;
}

const VISA_WORKFLOWS: Record<string, StageConfig[]> = {
    Australia: [
        { name: 'Pre-Flight Check', description: 'Compliance Verification', items: ['FAR (Financial Audit)', 'GTE/GS Approval', 'OSHC'], blockerMessage: 'Cannot proceed to Launch without FAR and GTE.' },
        { name: 'Launch', description: 'Lodgment & Biometrics', items: ['ImmiAccount Lodgment', 'HAP ID (Medical)', 'Biometrics'], blockerMessage: 'Cannot proceed to Landing without Biometrics.' },
        { name: 'Landing', description: 'Decision & Pre-Departure', items: ['Visa Grant Notice', 'VEVO Check', 'Flight Ticket'], blockerMessage: 'Cannot complete without Visa Grant Notice.' }
    ],
    Canada: [
        { name: 'Pre-Flight Check', description: 'Compliance Verification', items: ['PAL (Provincial Attestation)', 'GIC Certificate', 'Upfront Medicals'], blockerMessage: 'Cannot proceed to Launch without PAL and GIC.' },
        { name: 'Launch', description: 'Lodgment & Biometrics', items: ['IRCC Portal Lodgment', 'Biometrics Instruction Letter (BIL)'], blockerMessage: 'Cannot proceed to Landing without BIL.' },
        { name: 'Landing', description: 'Decision & Pre-Departure', items: ['Passport Request (PPR)', 'POE Letter', 'Flight Ticket'], blockerMessage: 'Cannot complete without POE Letter.' }
    ],
    UK: [
        { name: 'Pre-Flight Check', description: 'Compliance Verification', items: ['CAS Issuance', 'TB Test Certificate', 'Financials (28-day rule)'], blockerMessage: 'Cannot proceed to Launch without CAS and TB Test.' },
        { name: 'Launch', description: 'Lodgment & Biometrics', items: ['UKVI Lodgment', 'IHS Payment', 'VFS Appointment'], blockerMessage: 'Cannot proceed to Landing without VFS Appointment.' },
        { name: 'Landing', description: 'Decision & Pre-Departure', items: ['BRP Collection Letter', 'Vignette', 'Flight Ticket'], blockerMessage: 'Cannot complete without Vignette.' }
    ],
    Default: [
        { name: 'Pre-Flight Check', description: 'Compliance Verification', items: ['Financial Clearance', 'Medical Check'], blockerMessage: 'Cannot proceed to Launch without Financial Clearance.' },
        { name: 'Launch', description: 'Lodgment & Biometrics', items: ['Portal Lodgment', 'Biometrics'], blockerMessage: 'Cannot proceed to Landing without Biometrics.' },
        { name: 'Landing', description: 'Decision & Pre-Departure', items: ['Visa Decision', 'Flight Ticket'], blockerMessage: 'Cannot complete without Visa Decision.' }
    ]
};

export const VisaPilot: React.FC<VisaPilotProps> = ({ student, onUpdateStudent }) => {
    const workflow = VISA_WORKFLOWS[student.country] || VISA_WORKFLOWS.Default;
    const [visaState, setVisaState] = useState<Record<string, string>>(student.visa || {});

    // Determine current active stage based on completion
    let currentStageIndex = 0;
    for (let i = 0; i < workflow.length; i++) {
        const stage = workflow[i];
        const allCompleted = stage.items.every(item => visaState[item] === 'Completed');
        if (allCompleted) {
            currentStageIndex = i + 1;
        } else {
            break;
        }
    }
    
    // Cap at the last stage if everything is done
    if (currentStageIndex >= workflow.length) {
        currentStageIndex = workflow.length - 1;
    }

    const handleToggleItem = (item: string) => {
        const newState = {
            ...visaState,
            [item]: visaState[item] === 'Completed' ? 'Pending' : 'Completed'
        };
        setVisaState(newState);
        if (onUpdateStudent) {
            onUpdateStudent({ ...student, visa: newState as any });
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-slate-800">Visa Pilot Engine</h2>
                    <p className="text-sm text-slate-500 mt-1">Country-specific state machine for {student.country}</p>
                </div>
            </div>

            <div className="flex flex-col gap-6">
                {workflow.map((stage, index) => {
                    const isLocked = index > currentStageIndex;
                    const isActive = index === currentStageIndex;
                    const isCompleted = index < currentStageIndex || (index === workflow.length - 1 && stage.items.every(item => visaState[item] === 'Completed'));

                    return (
                        <div 
                            key={stage.name} 
                            className={`relative rounded-xl border p-5 transition-all ${
                                isLocked ? 'bg-slate-50 border-slate-200 opacity-60' : 
                                isActive ? 'bg-white border-nexgenai-navy shadow-md ring-1 ring-nexgenai-navy/20' : 
                                'bg-emerald-50/30 border-emerald-200'
                            }`}
                        >
                            {/* Stage Header */}
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                                            isLocked ? 'bg-slate-200 text-slate-500' :
                                            isActive ? 'bg-indigo-100 text-indigo-700' :
                                            'bg-emerald-100 text-emerald-700'
                                        }`}>
                                            STAGE {index + 1}
                                        </span>
                                        {isLocked && <Lock size={14} className="text-slate-400" />}
                                        {isActive && <Unlock size={14} className="text-indigo-500" />}
                                        {isCompleted && <CheckCircle size={14} className="text-emerald-500" />}
                                    </div>
                                    <h3 className={`font-bold ${isLocked ? 'text-slate-500' : 'text-slate-800'}`}>{stage.name}</h3>
                                    <p className="text-xs text-slate-500 mt-0.5">{stage.description}</p>
                                </div>
                            </div>

                            {/* Stage Items */}
                            <div className="space-y-3 mt-6">
                                {stage.items.map(item => {
                                    const itemStatus = visaState[item] || 'Pending';
                                    const itemCompleted = itemStatus === 'Completed';
                                    
                                    return (
                                        <div 
                                            key={item} 
                                            className={`flex items-center justify-between p-3 rounded-lg border ${
                                                isLocked ? 'border-slate-200 bg-slate-100/50' :
                                                itemCompleted ? 'border-emerald-200 bg-emerald-50/50' :
                                                'border-slate-200 bg-white hover:border-indigo-300 cursor-pointer transition-colors'
                                            }`}
                                            onClick={() => !isLocked && handleToggleItem(item)}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`flex-shrink-0 w-5 h-5 rounded-full border flex items-center justify-center ${
                                                    itemCompleted ? 'bg-emerald-500 border-emerald-600' : 'border-slate-300 bg-slate-50'
                                                }`}>
                                                    {itemCompleted && <CheckCircle size={12} className="text-white" />}
                                                </div>
                                                <span className={`text-sm font-medium ${itemCompleted ? 'text-slate-700 line-through opacity-70' : 'text-slate-700'}`}>
                                                    {item}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Blocker Warning */}
                            {isActive && !isCompleted && (
                                <div className="mt-5 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
                                    <AlertCircle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
                                    <p className="text-xs text-amber-800 font-medium leading-relaxed">
                                        {stage.blockerMessage}
                                    </p>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
