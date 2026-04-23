import React, { useState, useMemo } from 'react';
import { UNIVERSITY_PROGRAMS, STUDENTS } from '../constants';
import { UniversityProgram, Country } from '../types';
import { Search, BookOpen, MapPin, GraduationCap, CheckCircle, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { Button } from './Button';

interface UniversityKnowledgeBaseProps {
    onNavigate?: (view: string) => void;
}

export const UniversityKnowledgeBase: React.FC<UniversityKnowledgeBaseProps> = () => {
    // --- Filters State ---
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCountry, setSelectedCountry] = useState<Country | 'All'>('All');
    const [maxBudget, setMaxBudget] = useState<string>('');
    const [ieltsFilter, setIeltsFilter] = useState<string>('');

    // --- Application Simulation State ---
    const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
    const [selectedProgram, setSelectedProgram] = useState<UniversityProgram | null>(null);
    const [selectedStudentId, setSelectedStudentId] = useState<string>('');
    const [applyStep, setApplyStep] = useState<'select' | 'processing' | 'success'>('select');

    // --- Filter Logic ---
    const filteredPrograms = useMemo(() => {
        return UNIVERSITY_PROGRAMS.filter(prog => {
            const matchesSearch = prog.programName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                  prog.university.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCountry = selectedCountry === 'All' || prog.country === selectedCountry;
            const matchesBudget = !maxBudget || prog.tuition <= parseFloat(maxBudget);
            const matchesIelts = !ieltsFilter || prog.minIELTS <= parseFloat(ieltsFilter);

            return matchesSearch && matchesCountry && matchesBudget && matchesIelts;
        });
    }, [searchQuery, selectedCountry, maxBudget, ieltsFilter]);

    // --- Handlers ---
    const handleApplyClick = (program: UniversityProgram) => {
        setSelectedProgram(program);
        setApplyStep('select');
        setIsApplyModalOpen(true);
        setSelectedStudentId('');
    };

    const handleConfirmApply = () => {
        if (!selectedStudentId) return;
        setApplyStep('processing');
        
        // Simulate API delay for "Data Pull"
        setTimeout(() => {
            setApplyStep('success');
        }, 2000);
    };

    const closeApplyModal = () => {
        setIsApplyModalOpen(false);
        setSelectedProgram(null);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 h-[calc(100vh-120px)] flex flex-col">
            <div className="flex justify-between items-end shrink-0">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-[#0F172A]">University Knowledge Base</h1>
                    <p className="text-sm text-slate-500 mt-1">Search global partners and auto-fill applications.</p>
                </div>
            </div>

            {/* Search Bar & Filters */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-4 shrink-0">
                <div className="relative">
                    <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search by university or program name (e.g. 'Data Science')..." 
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                
                <div className="flex flex-wrap gap-4 items-end">
                    <div className="flex-1 min-w-[150px]">
                        <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">Destination</label>
                        <select 
                            className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-md outline-none focus:border-indigo-500"
                            value={selectedCountry}
                            onChange={(e) => setSelectedCountry(e.target.value as Country | 'All')}
                        >
                            <option value="All">Global (All)</option>
                            <option value="UK">UK</option>
                            <option value="Canada">Canada</option>
                            <option value="Australia">Australia</option>
                            <option value="New Zealand">New Zealand</option>
                            <option value="USA">USA</option>
                        </select>
                    </div>
                    <div className="flex-1 min-w-[150px]">
                        <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">Max Budget</label>
                        <div className="relative">
                            <span className="absolute left-3 top-2 text-slate-400 text-xs">$</span>
                            <input 
                                type="number" 
                                placeholder="e.g. 20000" 
                                className="w-full pl-6 pr-3 py-2 text-sm bg-white border border-gray-200 rounded-md outline-none focus:border-indigo-500"
                                value={maxBudget}
                                onChange={(e) => setMaxBudget(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="flex-1 min-w-[150px]">
                         <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">Student IELTS</label>
                         <select 
                            className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-md outline-none focus:border-indigo-500"
                            value={ieltsFilter}
                            onChange={(e) => setIeltsFilter(e.target.value)}
                        >
                            <option value="">Any Score</option>
                            <option value="5.5">5.5+</option>
                            <option value="6.0">6.0+</option>
                            <option value="6.5">6.5+</option>
                            <option value="7.0">7.0+</option>
                        </select>
                    </div>
                    <Button variant="secondary" onClick={() => { setSearchQuery(''); setSelectedCountry('All'); setMaxBudget(''); setIeltsFilter(''); }}>
                        Reset Filters
                    </Button>
                </div>
            </div>

            {/* Results Grid */}
            <div className="flex-1 overflow-y-auto min-h-0">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-6">
                    {filteredPrograms.length === 0 ? (
                        <div className="col-span-full text-center py-20 text-slate-400">
                            <BookOpen size={48} className="mx-auto mb-4 opacity-20" />
                            <p>No programs match your criteria.</p>
                            <p className="text-sm">Try adjusting the budget or country filters.</p>
                        </div>
                    ) : (
                        filteredPrograms.map(prog => (
                            <div key={prog.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow flex flex-col group">
                                <div className={`h-24 ${prog.logoColor} p-6 flex items-center justify-center relative overflow-hidden`}>
                                     {/* Abstract Pattern */}
                                     <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
                                     <h3 className="text-white font-bold text-xl tracking-tight relative z-10 text-center">{prog.university}</h3>
                                </div>
                                
                                <div className="p-5 flex-1 flex flex-col">
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-bold text-slate-900 text-lg leading-tight">{prog.programName}</h4>
                                        <span className="text-xs font-bold px-2 py-1 bg-slate-100 text-slate-600 rounded flex items-center shrink-0 ml-2">
                                            #{prog.ranking} Rank
                                        </span>
                                    </div>
                                    
                                    <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
                                        <MapPin size={14} /> {prog.country}
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                                        <div className="bg-gray-50 p-2 rounded border border-gray-100">
                                            <span className="text-xs text-slate-400 block uppercase">Tuition</span>
                                            <span className="font-semibold text-slate-900">{prog.currency} {prog.tuition.toLocaleString()}</span>
                                        </div>
                                        <div className="bg-gray-50 p-2 rounded border border-gray-100">
                                            <span className="text-xs text-slate-400 block uppercase">Intake</span>
                                            <span className="font-semibold text-slate-900">{prog.intake}</span>
                                        </div>
                                        <div className="bg-gray-50 p-2 rounded border border-gray-100">
                                            <span className="text-xs text-slate-400 block uppercase">Req. IELTS</span>
                                            <span className="font-semibold text-slate-900">{prog.minIELTS}</span>
                                        </div>
                                         <div className="bg-gray-50 p-2 rounded border border-gray-100">
                                            <span className="text-xs text-slate-400 block uppercase">Duration</span>
                                            <span className="font-semibold text-slate-900">{prog.duration}</span>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2 mb-6">
                                        {prog.tags.map(tag => (
                                            <span key={tag} className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-100 font-medium">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>

                                    <div className="mt-auto pt-4 border-t border-gray-100">
                                        <Button className="w-full group-hover:bg-indigo-600 group-hover:text-white transition-colors" onClick={() => handleApplyClick(prog)}>
                                            Apply Now <ArrowRight size={16} className="ml-2" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Application Simulation Modal */}
            {isApplyModalOpen && selectedProgram && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg border border-gray-100 overflow-hidden scale-100 animate-in zoom-in-95">
                        
                        {/* Header */}
                        <div className={`p-6 text-white ${applyStep === 'success' ? 'bg-emerald-600' : 'bg-[#0F172A]'}`}>
                            <h3 className="font-bold text-lg flex items-center gap-2">
                                {applyStep === 'success' ? <CheckCircle /> : <GraduationCap />}
                                {applyStep === 'success' ? 'Application Drafted!' : `Apply to ${selectedProgram.university}`}
                            </h3>
                            <p className="text-white/80 text-xs mt-1">
                                {applyStep === 'success' 
                                    ? 'The student data has been synced to the portal.' 
                                    : `Program: ${selectedProgram.programName} (${selectedProgram.intake})`}
                            </p>
                        </div>

                        <div className="p-6">
                            {applyStep === 'select' && (
                                <div className="space-y-4">
                                    <p className="text-sm text-slate-600">Select a student to auto-fill the application form from the CRM database.</p>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase">Select Student</label>
                                        <select 
                                            className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                            value={selectedStudentId}
                                            onChange={(e) => setSelectedStudentId(e.target.value)}
                                        >
                                            <option value="" disabled>Choose a student...</option>
                                            {STUDENTS.filter(s => s.country === selectedProgram.country).map(s => (
                                                <option key={s.id} value={s.id}>{s.name} (ID: {s.id})</option>
                                            ))}
                                            {STUDENTS.filter(s => s.country !== selectedProgram.country).map(s => (
                                                 <option key={s.id} value={s.id} disabled>{s.name} (Different Country: {s.country})</option>
                                            ))}
                                        </select>
                                        <p className="text-[10px] text-slate-400">* Only students targeting {selectedProgram.country} are selectable.</p>
                                    </div>
                                    <div className="pt-4 flex justify-end gap-3">
                                        <Button variant="ghost" onClick={closeApplyModal}>Cancel</Button>
                                        <Button disabled={!selectedStudentId} onClick={handleConfirmApply}>
                                            Start Auto-Fill
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {applyStep === 'processing' && (
                                <div className="py-8 text-center space-y-4">
                                    <Loader2 size={40} className="mx-auto text-indigo-600 animate-spin" />
                                    <div>
                                        <h4 className="font-bold text-slate-900">Syncing Student Data...</h4>
                                        <p className="text-sm text-slate-500 mt-1">Mapping Transcripts, SOP, and Passport details.</p>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-2 max-w-xs mx-auto overflow-hidden">
                                        <div className="h-full bg-indigo-600 rounded-full animate-progress origin-left w-full"></div>
                                    </div>
                                </div>
                            )}

                            {applyStep === 'success' && (
                                <div className="text-center space-y-4">
                                    <div className="bg-emerald-50 text-emerald-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-2">
                                        <Sparkles size={32} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900 text-lg">Ready for Review</h4>
                                        <p className="text-sm text-slate-500 max-w-xs mx-auto">
                                            Application ID <strong>#APP-8675</strong> has been created. 
                                            Please review the final draft in the student's "Uni Applications" tab.
                                        </p>
                                    </div>
                                    <div className="pt-4">
                                        <Button className="w-full bg-emerald-600 hover:bg-emerald-700 border-none" onClick={closeApplyModal}>
                                            Done
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};