
// FIX: Imported useMemo from React.
import React, { useState, useMemo } from 'react';
import { DocumentFile, UserRole, Student, Task } from '../types';
import { Upload, FileText, Check, X, AlertCircle, Eye, Hourglass, Download, MessageCircle, FileUp } from 'lucide-react';
import { Button } from './Button';

import { COUNTRY_CHECKLISTS } from '../constants';

// Helper for ID generation
const generateId = (prefix: string) => `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

interface DocumentManagerProps {
    student: Student;
    userRole: UserRole;
    onUpdateDocument: (doc: DocumentFile) => void;
    onAddDocument: (doc: DocumentFile) => void;
    tasks?: Task[];
    onUpdateTasks?: (tasks: Task[]) => void;
}

export const DocumentManager: React.FC<DocumentManagerProps> = ({ student, userRole, onUpdateDocument, onAddDocument, tasks = [], onUpdateTasks }) => {
    const [rejectionModal, setRejectionModal] = useState<{ isOpen: boolean; doc: DocumentFile | null }>({ isOpen: false, doc: null });
    const [rejectionReason, setRejectionReason] = useState('');
    
    const [uploadModal, setUploadModal] = useState<{ isOpen: boolean; docType: string | null }>({ isOpen: false, docType: null });
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [whatsappNotification, setWhatsappNotification] = useState<{ show: boolean; message: string }>({ show: false, message: '' });

    const studentDocuments = useMemo(() => student.documents || [], [student.documents]);

    const showWhatsappNotification = (message: string) => {
        setWhatsappNotification({ show: true, message });
        setTimeout(() => setWhatsappNotification({ show: false, message: '' }), 4000);
    };

    const handleSimulatedUpload = () => {
        if (!uploadModal.docType) return;
        setIsUploading(true);
        setUploadProgress(0);
        
        const interval = setInterval(() => {
            setUploadProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setTimeout(() => {
                        handleFileUpload(uploadModal.docType!);
                        setIsUploading(false);
                        setUploadModal({ isOpen: false, docType: null });
                        showWhatsappNotification(`Document "${uploadModal.docType}" uploaded successfully. WhatsApp notification sent to student.`);
                    }, 500);
                    return 100;
                }
                return prev + 25;
            });
        }, 400);
    };

    const handleFileUpload = (docType: string) => {
        const newDoc: DocumentFile = {
            id: generateId('doc'),
            name: `${docType.replace(/([A-Z])/g, ' $1')}.pdf`,
            type: docType,
            status: 'Pending',
            uploadedAt: 'Just now',
            phase: 1,
            tier: 'Global',
            url: '#'
        };
        onAddDocument(newDoc);

        // Trigger Task Status Change to 'In Review'
        if (onUpdateTasks) {
            const linkedTask = tasks.find(t => 
                t.student_id === student.id &&
                t.documentType === docType &&
                t.status !== 'Completed'
            );
            if (linkedTask) {
                onUpdateTasks([{ ...linkedTask, status: 'In Review' }]);
            }
        }
    };

    const handleReview = (doc: DocumentFile, status: 'Verified' | 'Rejected', reason?: string) => {
        const updatedDoc = { ...doc, status, rejectionReason: status === 'Rejected' ? reason : undefined };
        onUpdateDocument(updatedDoc);
        
        if (status === 'Verified' && onUpdateTasks) {
            const linkedTask = tasks.find(t => 
                t.student_id === student.id &&
                t.documentType === doc.type &&
                t.status !== 'Completed'
            );
            if (linkedTask) {
                onUpdateTasks([{ ...linkedTask, status: 'Completed' }]);
            }
        }

        setRejectionModal({ isOpen: false, doc: null });
        setRejectionReason('');
        
        const actionText = status === 'Verified' ? 'approved' : 'rejected';
        showWhatsappNotification(`Document "${doc.name}" was ${actionText}. WhatsApp notification sent to student.`);
    };

    const checklist = useMemo(() => {
        const countryChecklist = COUNTRY_CHECKLISTS[student.country] || COUNTRY_CHECKLISTS['Default'];
        
        return countryChecklist.map(category => ({
            ...category,
            items: category.items.map(item => ({
                ...item,
                uploadedFiles: studentDocuments.filter(d => d.type === item.docType || d.type.includes(item.docType) || item.docType.includes(d.type)).sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
            }))
        }));
    }, [student.country, studentDocuments]);
    
    const isStaff = userRole !== 'Student';

    const totalRequired = checklist.reduce((acc, cat) => acc + cat.items.length, 0);
    const totalVerified = checklist.reduce((acc, cat) => acc + cat.items.filter(item => item.uploadedFiles.some(f => f.status === 'Verified')).length, 0);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                <div>
                    <h4 className="text-indigo-900 font-semibold">Paperless Pipeline: {student.country}</h4>
                    <p className="text-indigo-700 text-xs mt-1">
                        {totalVerified} / {totalRequired} Verified
                    </p>
                </div>
            </div>

            <div className="space-y-6">
                {checklist.map((category) => (
                    <div key={category.stage}>
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{category.stage} Requirements</h3>
                        <div className="space-y-3">
                            {category.items.map(({ docType, description, uploadedFiles }) => (
                                <div key={docType} className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h4 className="text-sm font-medium text-slate-700">{docType}</h4>
                                            <p className="text-xs text-slate-500">{description}</p>
                                        </div>
                                        <Button size="sm" variant="secondary" onClick={() => setUploadModal({ isOpen: true, docType })}>
                                            <Upload size={14} className="mr-2" /> Upload
                                        </Button>
                                    </div>

                                    {uploadedFiles.length > 0 ? (
                                        uploadedFiles.map((uploadedFile, idx) => (
                                            <div key={uploadedFile.id || `${uploadedFile.name}-${idx}`} className="bg-white border border-gray-200 p-3 rounded-lg flex items-center justify-between group hover:shadow-sm transition-all">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${uploadedFile.status === 'Verified' ? 'bg-emerald-100 text-emerald-600' : uploadedFile.status === 'Rejected' ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-500'}`}><FileText size={18} /></div>
                                                    <div>
                                                        <p className="text-sm font-medium text-slate-900">{uploadedFile.name}</p>
                                                        <p className="text-xs text-slate-500">{uploadedFile.uploadedAt}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${uploadedFile.status === 'Verified' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : uploadedFile.status === 'Rejected' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>{uploadedFile.status}</span>
                                                    {uploadedFile.status === 'Rejected' && uploadedFile.rejectionReason && (
                                                        <div className="relative group/tip">
                                                            <AlertCircle size={14} className="text-rose-500 cursor-help" />
                                                            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 p-2 bg-slate-800 text-white text-xs rounded shadow-lg z-10 hidden group-hover/tip:block animate-in fade-in zoom-in-95">
                                                                {uploadedFile.rejectionReason}
                                                            </div>
                                                        </div>
                                                    )}
                                                    <div className="flex items-center gap-2 ml-2 pl-2 border-l border-gray-200">
                                                        {uploadedFile.url && (
                                                            <>
                                                                <a href={uploadedFile.url} target="_blank" rel="noopener noreferrer" title="Preview" className="p-1.5 rounded text-slate-500 hover:bg-slate-100 hover:text-slate-900">
                                                                    <Eye size={16} />
                                                                </a>
                                                                <a href={uploadedFile.url} download={uploadedFile.name} title="Download" className="p-1.5 rounded text-slate-500 hover:bg-slate-100 hover:text-slate-900">
                                                                    <Download size={16} />
                                                                </a>
                                                            </>
                                                        )}
                                                        {isStaff && (uploadedFile.status === 'Pending' || uploadedFile.status === 'Reviewing') && (
                                                            <>
                                                                <div className="w-px h-5 bg-gray-200"></div>
                                                                <button onClick={() => handleReview(uploadedFile, 'Verified')} title="Approve" className="p-1.5 rounded bg-emerald-50 text-emerald-600 hover:bg-emerald-100"><Check size={16} /></button>
                                                                <button onClick={() => setRejectionModal({ isOpen: true, doc: uploadedFile })} title="Reject" className="p-1.5 rounded bg-rose-50 text-rose-600 hover:bg-rose-100"><X size={16} /></button>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="bg-slate-50 border-2 border-dashed border-gray-200 p-3 rounded-lg flex items-center justify-between group hover:border-indigo-200 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-white border border-gray-200 text-slate-400 shrink-0"><Hourglass size={18} /></div>
                                                <div>
                                                    <p className="text-sm font-medium text-slate-500">Pending Upload</p>
                                                    <p className="text-xs text-slate-400">Awaiting submission</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Rejection Modal */}
            {rejectionModal.isOpen && rejectionModal.doc && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md border border-gray-100 scale-100 animate-in zoom-in-95">
                        <div className="p-5 border-b border-gray-100">
                             <h3 className="font-semibold text-lg text-rose-900">Rejection Reason</h3>
                             <p className="text-xs text-slate-500 mt-1">Provide a clear reason for rejecting "{rejectionModal.doc.name}". This will be visible to the student.</p>
                        </div>
                        <div className="p-5 space-y-4">
                            <textarea
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                rows={3}
                                className="w-full p-2 text-sm border border-gray-200 rounded-md focus:ring-1 focus:ring-rose-300 outline-none"
                                placeholder="e.g., 'Document is blurry', 'Passport is expired'..."
                            />
                            <div className="flex justify-end gap-2">
                                <Button variant="ghost" onClick={() => setRejectionModal({ isOpen: false, doc: null })}>Cancel</Button>
                                <Button variant="danger" disabled={!rejectionReason.trim()} onClick={() => handleReview(rejectionModal.doc!, 'Rejected', rejectionReason)}>
                                    Confirm Rejection
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Upload Modal */}
            {uploadModal.isOpen && uploadModal.docType && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md border border-gray-100 scale-100 animate-in zoom-in-95 overflow-hidden">
                        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-slate-50">
                             <div>
                                 <h3 className="font-semibold text-lg text-slate-900">Upload Document</h3>
                                 <p className="text-xs text-slate-500 mt-1">Uploading: <span className="font-medium text-slate-700">{uploadModal.docType}</span></p>
                             </div>
                             {!isUploading && (
                                 <button onClick={() => setUploadModal({ isOpen: false, docType: null })} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors">
                                     <X size={18} />
                                 </button>
                             )}
                        </div>
                        <div className="p-6">
                            {!isUploading ? (
                                <div 
                                    className="border-2 border-dashed border-indigo-200 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-indigo-50/50 hover:border-indigo-300 transition-colors group"
                                    onClick={handleSimulatedUpload}
                                >
                                    <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                        <FileUp size={24} />
                                    </div>
                                    <h4 className="text-sm font-medium text-slate-900 mb-1">Click to browse or drag file here</h4>
                                    <p className="text-xs text-slate-500">Supports PDF, JPG, PNG (Max 10MB)</p>
                                </div>
                            ) : (
                                <div className="py-8 flex flex-col items-center justify-center text-center">
                                    <div className="w-16 h-16 relative mb-6">
                                        <svg className="w-full h-full text-indigo-100" viewBox="0 0 36 36">
                                            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                                        </svg>
                                        <svg className="w-full h-full text-indigo-600 absolute top-0 left-0 transition-all duration-300 ease-out" viewBox="0 0 36 36" strokeDasharray={`${uploadProgress}, 100`}>
                                            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                                        </svg>
                                        <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-indigo-700">
                                            {uploadProgress}%
                                        </div>
                                    </div>
                                    <h4 className="text-sm font-medium text-slate-900 mb-1">Uploading Document...</h4>
                                    <p className="text-xs text-slate-500">Please wait while we process your file.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* WhatsApp Notification Toast */}
            {whatsappNotification.show && (
                <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
                    <div className="bg-white border border-emerald-100 shadow-xl rounded-lg p-4 flex items-start gap-3 max-w-sm">
                        <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shrink-0">
                            <MessageCircle size={20} />
                        </div>
                        <div className="flex-1">
                            <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                                WhatsApp Sent
                                <span className="flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                            </h4>
                            <p className="text-xs text-slate-600 mt-1 leading-relaxed">{whatsappNotification.message}</p>
                        </div>
                        <button onClick={() => setWhatsappNotification({ show: false, message: '' })} className="text-slate-400 hover:text-slate-600">
                            <X size={16} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};