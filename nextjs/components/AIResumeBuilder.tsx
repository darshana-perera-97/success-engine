import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Upload, 
  CheckCircle, 
  Loader2, 
  ArrowRight, 
  Eye,
  RefreshCw,
  User,
  GraduationCap,
  Briefcase,
  Wand2,
  FileText,
  Mail,
  Phone,
  MapPin,
  Plus,
  Trash2,
  Copy,
  Trophy,
  Camera,
  Layout,
  Type,
  Award,
  Languages,
  Heart,
  Target,
  Settings,
  Image as ImageIcon
} from 'lucide-react';
import { Button } from './Button';

interface AIResumeBuilderProps {
  onNavigate?: (view: string) => void;
  onSaveCV?: (cvData: any) => void;
}

export const AIResumeBuilder: React.FC<AIResumeBuilderProps> = ({ onNavigate, onSaveCV }) => {
  const [step, setStep] = useState<'initial' | 'upload-cv' | 'processing' | 'extracted' | 'uploading' | 'refining' | 'preview' | 'success'>('initial');
  const [activeFlow, setActiveFlow] = useState<'assist' | 'update' | null>(null);
  const [progress, setProgress] = useState(0);
  const [showPdf, setShowPdf] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  // Mock extracted data from CV.pdf
  const initialExtractedData = useMemo(() => ({
    name: "Nirash Dilshan Jayantha",
    role: "CO-Founder | ABEC Premier",
    email: "info@abecpremier.com",
    phone: "(+94) 77 96 95 412",
    experience: [
      { title: "Co-Founder & GTM Lead", company: "ABEC Premier", period: "OCT 2020 – PRESENT" },
      { title: "Lead Product Designer", company: "Reach Solutions", period: "2017 – 2020" }
    ],
    education: [
      { degree: "Bachelor of Information Technology (BIT)", school: "University of Colombo" },
      { degree: "Higher National Diploma Digital Communication", school: "Aquinas College" }
    ],
    testScores: [
      { name: "IELTS", score: "7.5" }
    ],
    profilePicture: null as string | null,
    customSections: [] as { id: string, title: string, icon: string, content: string }[]
  }), []);

  const [editableData, setEditableData] = useState(initialExtractedData);

  const reset = useCallback(() => {
    setStep('initial');
    setActiveFlow(null);
    setProgress(0);
    setShowPdf(false);
    setUploadedFile(null);
    setEditableData(initialExtractedData);
  }, [initialExtractedData]);

  const handleDataChange = (field: string, value: any) => {
    setEditableData(prev => ({ ...prev, [field]: value }));
  };

  const updateExperience = (index: number, field: string, value: string) => {
    const newExp = [...editableData.experience];
    newExp[index] = { ...newExp[index], [field]: value };
    handleDataChange('experience', newExp);
  };

  const addExperience = () => {
    handleDataChange('experience', [...editableData.experience, { title: "", company: "", period: "" }]);
  };

  const duplicateExperience = (index: number) => {
    const newExp = [...editableData.experience];
    newExp.splice(index + 1, 0, { ...newExp[index] });
    handleDataChange('experience', newExp);
  };

  const removeExperience = (index: number) => {
    handleDataChange('experience', editableData.experience.filter((_, i) => i !== index));
  };

  const updateEducation = (index: number, field: string, value: string) => {
    const newEdu = [...editableData.education];
    newEdu[index] = { ...newEdu[index], [field]: value };
    handleDataChange('education', newEdu);
  };

  const addEducation = () => {
    handleDataChange('education', [...editableData.education, { degree: "", school: "" }]);
  };

  const duplicateEducation = (index: number) => {
    const newEdu = [...editableData.education];
    newEdu.splice(index + 1, 0, { ...newEdu[index] });
    handleDataChange('education', newEdu);
  };

  const removeEducation = (index: number) => {
    handleDataChange('education', editableData.education.filter((_, i) => i !== index));
  };

  const updateTestScore = (index: number, field: string, value: string) => {
    const newScores = [...editableData.testScores];
    newScores[index] = { ...newScores[index], [field]: value };
    handleDataChange('testScores', newScores);
  };

  const addTestScore = () => {
    handleDataChange('testScores', [...editableData.testScores, { name: "", score: "" }]);
  };

  const removeTestScore = (index: number) => {
    handleDataChange('testScores', editableData.testScores.filter((_, i) => i !== index));
  };

  const addCustomSection = () => {
    const newSection = {
      id: Math.random().toString(36).substr(2, 9),
      title: "New Section",
      icon: "Award",
      content: ""
    };
    handleDataChange('customSections', [...editableData.customSections, newSection]);
  };

  const updateCustomSection = (id: string, field: string, value: string) => {
    const newSections = editableData.customSections.map(s => 
      s.id === id ? { ...s, [field]: value } : s
    );
    handleDataChange('customSections', newSections);
  };

  const removeCustomSection = (id: string) => {
    handleDataChange('customSections', editableData.customSections.filter(s => s.id !== id));
  };

  const handleProfilePictureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        handleDataChange('profilePicture', event.target?.result as string);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const renderIcon = (iconName: string, size = 18, className = "") => {
    const icons: Record<string, any> = {
      Award, Languages, Heart, Target, Trophy, Briefcase, GraduationCap, User, FileText, Mail, Phone, MapPin, Sparkles, Wand2, Layout, Type, Settings, ImageIcon
    };
    const IconComponent = icons[iconName] || Award;
    return <IconComponent size={size} className={className} />;
  };

  const startAssistFlow = () => {
    setActiveFlow('assist');
    setStep('processing');
    setProgress(0);
  };

  const startUpdateFlow = () => {
    setActiveFlow('update');
    setStep('upload-cv');
    setProgress(0);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0]);
      // Simulate upload initiation
      setTimeout(() => {
        setStep('uploading');
      }, 800);
    }
  };

  useEffect(() => {
    if (step === 'processing' || step === 'uploading' || step === 'refining') {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            if (step === 'processing') setStep('extracted');
            if (step === 'uploading') setStep('refining');
            if (step === 'refining') setStep('preview');
            return 100;
          }
          return prev + (step === 'uploading' ? 4 : 2);
        });
      }, 50);
      return () => clearInterval(interval);
    }
    
    if (step === 'success') {
      const timer = setTimeout(() => {
        // "End CV Upload Automate Animation and exit"
        if (onNavigate) {
          onNavigate('dashboard');
        } else {
          window.location.hash = '#dashboard';
        }
        reset();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [step, onNavigate, reset]);

  const handleRefineSubmit = () => {
    setStep('refining');
    setProgress(0);
  };

  const handleFinalUpload = () => {
    if (onSaveCV) {
      onSaveCV({
        ...editableData,
        updatedAt: new Date().toISOString()
      });
    }
    setStep('success');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
            ABEC Premier AI Resume Builder
            <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full font-bold uppercase tracking-wider">Beta</span>
          </h1>
          <p className="text-slate-500 mt-1">Professional resumes powered by ABEC Premier AI technology.</p>
        </div>
        {step !== 'initial' && step !== 'success' && (
          <Button variant="ghost" onClick={reset} className="text-slate-500">
            <RefreshCw size={16} className="mr-2" /> Start Over
          </Button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {step === 'initial' && (
          <motion.div 
            key="initial"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            {/* Flow 1: AI CV Assist */}
            <div className="group relative bg-white border border-gray-200 rounded-3xl p-8 shadow-sm hover:shadow-xl hover:border-indigo-300 transition-all duration-500 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 group-hover:bg-indigo-100 transition-colors duration-500"></div>
              <div className="relative z-10">
                <div className="w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-200 group-hover:scale-110 transition-transform duration-500">
                  <Sparkles size={28} />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-3">AI CV Assist</h2>
                <p className="text-slate-500 mb-8 leading-relaxed">
                  Automatically generate a professional resume using your existing profile data and AI optimization.
                </p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle size={16} className="text-emerald-500" /> Auto-fill from CV.pdf
                  </li>
                  <li className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle size={16} className="text-emerald-500" /> AI Content Optimization
                  </li>
                  <li className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle size={16} className="text-emerald-500" /> Modern Editorial Layout
                  </li>
                </ul>
                <Button 
                  onClick={startAssistFlow} 
                  className="w-full h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-lg font-bold shadow-lg shadow-indigo-100 group-hover:gap-4 transition-all"
                >
                  Generate CV <ArrowRight size={20} />
                </Button>
              </div>
            </div>

            {/* Flow 2: Update Old CV */}
            <div className="group relative bg-white border border-gray-200 rounded-3xl p-8 shadow-sm hover:shadow-xl hover:border-emerald-300 transition-all duration-500 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full -mr-16 -mt-16 group-hover:bg-emerald-100 transition-colors duration-500"></div>
              <div className="relative z-10">
                <div className="w-14 h-14 bg-emerald-600 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-emerald-200 group-hover:scale-110 transition-transform duration-500">
                  <Upload size={28} />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-3">Update Old CV</h2>
                <p className="text-slate-500 mb-8 leading-relaxed">
                  Upload your outdated resume and let ABEC Premier AI transform it into a modern, high-conversion document.
                </p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle size={16} className="text-emerald-500" /> Smooth Data Extraction
                  </li>
                  <li className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle size={16} className="text-emerald-500" /> Add Latest Education & IELTS
                  </li>
                  <li className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle size={16} className="text-emerald-500" /> Real-time Preview
                  </li>
                </ul>
                <Button 
                  onClick={startUpdateFlow} 
                  variant="secondary"
                  className="w-full h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-lg font-bold shadow-lg shadow-emerald-100 group-hover:gap-4 transition-all"
                >
                  Upload Old CV <ArrowRight size={20} />
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {step === 'upload-cv' && (
          <motion.div 
            key="upload-cv"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="bg-white border border-gray-200 rounded-3xl p-12 shadow-xl text-center space-y-8"
          >
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Upload size={32} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900">Upload Your Current CV</h3>
              <p className="text-slate-500 mt-2 mb-8">ABEC Premier AI will analyze your existing resume to extract your professional background.</p>
              
              <div className="relative group">
                <input 
                  type="file" 
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="border-2 border-dashed border-slate-200 rounded-2xl p-10 group-hover:border-emerald-400 group-hover:bg-emerald-50/30 transition-all duration-300">
                  <div className="space-y-2">
                    <Upload className="mx-auto text-slate-400 group-hover:text-emerald-500 transition-colors" size={32} />
                    <p className="text-sm font-bold text-slate-600">Click to upload or drag and drop</p>
                    <p className="text-xs text-slate-400">PDF, DOCX or DOC (Max. 5MB)</p>
                  </div>
                </div>
              </div>
              
              {uploadedFile && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-slate-200">
                      <FileText className="text-emerald-600" size={20} />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-bold text-slate-700 truncate max-w-[200px]">{uploadedFile.name}</p>
                      <p className="text-[10px] text-slate-400">{(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <Loader2 className="animate-spin text-emerald-600" size={20} />
                </motion.div>
              )}
            </div>
          </motion.div>
        )}

        {(step === 'processing' || step === 'uploading') && (
          <motion.div 
            key="processing"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="bg-white border border-gray-200 rounded-3xl p-12 shadow-xl text-center space-y-8"
          >
            <div className="relative w-24 h-24 mx-auto">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="48"
                  cy="48"
                  r="44"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  className="text-gray-100"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="44"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={276}
                  strokeDashoffset={276 - (276 * progress) / 100}
                  className="text-indigo-600 transition-all duration-300"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="animate-spin text-indigo-600" size={32} />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-900">
                {step === 'processing' ? 'ABEC Premier AI Scanning CV.pdf...' : 'Uploading Old CV...'}
              </h3>
              <p className="text-slate-500 mt-2">ABEC Premier AI is extracting your professional DNA.</p>
            </div>
            <div className="max-w-md mx-auto bg-gray-100 h-2 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-indigo-600"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-center gap-8 text-xs font-bold text-slate-400 uppercase tracking-widest">
              <span className={progress > 20 ? 'text-indigo-600' : ''}>Parsing</span>
              <span className={progress > 50 ? 'text-indigo-600' : ''}>Analyzing</span>
              <span className={progress > 80 ? 'text-indigo-600' : ''}>Optimizing</span>
            </div>
          </motion.div>
        )}

        {step === 'extracted' && (
          <motion.div 
            key="extracted"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <User size={18} className="text-indigo-600" /> Extracted Profile
                </h3>
                <div className="flex flex-col md:flex-row gap-8">
                  <div className="flex-shrink-0">
                    <label className="text-[10px] uppercase font-bold text-slate-400 block mb-2 text-center">Profile Photo</label>
                    <div className="relative group">
                      <div className="w-32 h-32 rounded-2xl bg-slate-100 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden transition-all group-hover:border-indigo-400 group-hover:bg-indigo-50">
                        {editableData.profilePicture ? (
                          <img src={editableData.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <div className="text-center">
                            <Camera className="mx-auto text-slate-300 mb-1" size={24} />
                            <span className="text-[10px] font-bold text-slate-400">Upload</span>
                          </div>
                        )}
                      </div>
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={handleProfilePictureUpload}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                      {editableData.profilePicture && (
                        <button 
                          onClick={() => handleDataChange('profilePicture', null)}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="flex-1 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-slate-400">Full Name</label>
                        <input 
                          type="text" 
                          value={editableData.name}
                          onChange={(e) => handleDataChange('name', e.target.value)}
                          placeholder="Nirash Dilshan Jayantha"
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-slate-400">Current Role</label>
                        <input 
                          type="text" 
                          value={editableData.role}
                          onChange={(e) => handleDataChange('role', e.target.value)}
                          placeholder="CO-Founder | NexGenAI Solutions"
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-slate-400">Email</label>
                        <input 
                          type="email" 
                          value={editableData.email}
                          onChange={(e) => handleDataChange('email', e.target.value)}
                          placeholder="Info@nexgenai.asia"
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-slate-400">Phone</label>
                        <input 
                          type="text" 
                          value={editableData.phone}
                          onChange={(e) => handleDataChange('phone', e.target.value)}
                          placeholder="(+94) 77 96 95 412"
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-slate-900 flex items-center gap-2">
                    <Briefcase size={18} className="text-indigo-600" /> Experience
                  </h3>
                  <Button variant="ghost" size="sm" onClick={addExperience} className="text-indigo-600 h-8 px-2">
                    <Plus size={14} className="mr-1" /> Add
                  </Button>
                </div>
                <div className="space-y-4">
                  {editableData.experience.map((exp, i) => (
                    <div key={i} className="group p-4 bg-slate-50 rounded-xl border border-slate-100 relative">
                      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => duplicateExperience(i)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-md transition-all">
                          <Copy size={14} />
                        </button>
                        <button onClick={() => removeExperience(i)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-white rounded-md transition-all">
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold text-slate-400">Job Title</label>
                          <input 
                            type="text" 
                            value={exp.title}
                            onChange={(e) => updateExperience(i, 'title', e.target.value)}
                            placeholder="e.g. Lead Product Designer"
                            className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-900 outline-none focus:border-indigo-500 transition-all"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold text-slate-400">Company</label>
                          <input 
                            type="text" 
                            value={exp.company}
                            onChange={(e) => updateExperience(i, 'company', e.target.value)}
                            placeholder="e.g. ABEC Premier"
                            className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-900 outline-none focus:border-indigo-500 transition-all"
                          />
                        </div>
                        <div className="space-y-1 md:col-span-2">
                          <label className="text-[10px] uppercase font-bold text-slate-400">Period</label>
                          <input 
                            type="text" 
                            value={exp.period}
                            onChange={(e) => updateExperience(i, 'period', e.target.value)}
                            placeholder="e.g. OCT 2020 – PRESENT"
                            className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-indigo-600 outline-none focus:border-indigo-500 transition-all"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-slate-900 flex items-center gap-2">
                    <GraduationCap size={18} className="text-indigo-600" /> Education
                  </h3>
                  <Button variant="ghost" size="sm" onClick={addEducation} className="text-indigo-600 h-8 px-2">
                    <Plus size={14} className="mr-1" /> Add
                  </Button>
                </div>
                <div className="space-y-4">
                  {editableData.education.map((edu, i) => (
                    <div key={i} className="group p-4 bg-slate-50 rounded-xl border border-slate-100 relative">
                      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => duplicateEducation(i)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-md transition-all">
                          <Copy size={14} />
                        </button>
                        <button onClick={() => removeEducation(i)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-white rounded-md transition-all">
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold text-slate-400">Degree / Qualification</label>
                          <input 
                            type="text" 
                            value={edu.degree}
                            onChange={(e) => updateEducation(i, 'degree', e.target.value)}
                            placeholder="e.g. Bachelor of Information Technology"
                            className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-900 outline-none focus:border-indigo-500 transition-all"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold text-slate-400">Institution</label>
                          <input 
                            type="text" 
                            value={edu.school}
                            onChange={(e) => updateEducation(i, 'school', e.target.value)}
                            placeholder="e.g. University of Colombo"
                            className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-900 outline-none focus:border-indigo-500 transition-all"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-slate-900 flex items-center gap-2">
                    <Trophy size={18} className="text-indigo-600" /> Test Scores
                  </h3>
                  <Button variant="ghost" size="sm" onClick={addTestScore} className="text-indigo-600 h-8 px-2">
                    <Plus size={14} className="mr-1" /> Add
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {editableData.testScores.map((score, i) => (
                    <div key={i} className="group p-3 bg-slate-50 rounded-xl border border-slate-100 relative flex items-center gap-3">
                      <div className="flex-1 grid grid-cols-2 gap-2">
                        <input 
                          type="text" 
                          value={score.name}
                          onChange={(e) => updateTestScore(i, 'name', e.target.value)}
                          placeholder="IELTS"
                          className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-[11px] font-bold text-slate-700 outline-none"
                        />
                        <input 
                          type="text" 
                          value={score.score}
                          onChange={(e) => updateTestScore(i, 'score', e.target.value)}
                          placeholder="7.5"
                          className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-[11px] font-bold text-indigo-600 outline-none"
                        />
                      </div>
                      <button onClick={() => removeTestScore(i)} className="text-slate-400 hover:text-rose-600 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-slate-900 flex items-center gap-2">
                    <Layout size={18} className="text-indigo-600" /> Custom Sections
                  </h3>
                  <Button variant="ghost" size="sm" onClick={addCustomSection} className="text-indigo-600 h-8 px-2">
                    <Plus size={14} className="mr-1" /> Add Section
                  </Button>
                </div>
                <div className="space-y-6">
                  {editableData.customSections.map((section) => (
                    <div key={section.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100 relative group">
                      <button 
                        onClick={() => removeCustomSection(section.id)}
                        className="absolute top-2 right-2 p-1.5 text-slate-400 hover:text-rose-600 hover:bg-white rounded-md transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={14} />
                      </button>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold text-slate-400">Section Title</label>
                          <input 
                            type="text" 
                            value={section.title}
                            onChange={(e) => updateCustomSection(section.id, 'title', e.target.value)}
                            placeholder="e.g. Projects"
                            className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-900 outline-none focus:border-indigo-500 transition-all"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold text-slate-400">Icon</label>
                          <select 
                            value={section.icon}
                            onChange={(e) => updateCustomSection(section.id, 'icon', e.target.value)}
                            className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-900 outline-none focus:border-indigo-500 transition-all"
                          >
                            {['Award', 'Languages', 'Heart', 'Target', 'Trophy', 'Briefcase', 'GraduationCap', 'FileText', 'Sparkles', 'Wand2', 'Layout', 'Type', 'Settings', 'ImageIcon'].map(icon => (
                              <option key={icon} value={icon}>{icon}</option>
                            ))}
                          </select>
                        </div>
                        <div className="flex items-end pb-1.5">
                          <div className="w-10 h-10 bg-white rounded-lg border border-slate-200 flex items-center justify-center text-indigo-600">
                            {renderIcon(section.icon)}
                          </div>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-slate-400">Content</label>
                        <textarea 
                          value={section.content}
                          onChange={(e) => updateCustomSection(section.id, 'content', e.target.value)}
                          placeholder="Add details about this section..."
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 outline-none focus:border-indigo-500 transition-all min-h-[100px]"
                        />
                      </div>
                    </div>
                  ))}
                  {editableData.customSections.length === 0 && (
                    <div className="text-center py-8 border-2 border-dashed border-slate-100 rounded-xl">
                      <p className="text-sm text-slate-400">No custom sections added yet.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-indigo-900 rounded-2xl p-6 text-white shadow-xl">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <Wand2 size={18} /> AI Optimization
                </h3>
                <p className="text-sm text-indigo-200 leading-relaxed mb-6">
                  We've identified 4 key areas to improve your CV impact for international universities.
                </p>
                <Button 
                  onClick={handleRefineSubmit}
                  className="w-full bg-white text-indigo-900 hover:bg-indigo-50 font-bold"
                >
                  Generate AI Optimized CV
                </Button>
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <h3 className="font-bold text-slate-900 mb-4">Source Document</h3>
                <div className="aspect-[3/4] bg-slate-100 rounded-xl flex items-center justify-center border border-gray-200 overflow-hidden relative group">
                  <img 
                    src="/CV.pdf" 
                    alt="CV Preview" 
                    className="w-full h-full object-cover opacity-50 group-hover:opacity-100 transition-opacity"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/cv/400/600';
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Eye className="text-white" size={32} />
                  </div>
                </div>
                <p className="text-[10px] text-center text-slate-400 mt-3 font-mono">CV.pdf • 1.2 MB</p>
              </div>
            </div>
          </motion.div>
        )}

        {step === 'refining' && (
          <motion.div 
            key="refining"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white border border-gray-200 rounded-3xl p-12 shadow-xl text-center space-y-8"
          >
            <div className="flex justify-center">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600"
              >
                <Sparkles size={40} />
              </motion.div>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-900">
                {activeFlow === 'update' ? 'Transferring to Latest Education...' : 'Refining Content...'}
              </h3>
              <p className="text-slate-500 mt-2">
                {activeFlow === 'update' 
                  ? 'Integrating IELTS, PTE and latest academic background.' 
                  : 'Applying high-impact verbs and academic alignment.'}
              </p>
            </div>
            <div className="max-w-md mx-auto space-y-2">
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-indigo-600"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs font-bold text-indigo-600">{progress}% Complete</p>
            </div>
            {activeFlow === 'update' && progress > 50 && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-center gap-4"
              >
                <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full text-xs font-bold border border-emerald-100">
                  <CheckCircle size={14} /> IELTS 7.5 Added
                </div>
                <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full text-xs font-bold border border-emerald-100">
                  <CheckCircle size={14} /> PTE 82 Added
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {step === 'preview' && (
          <motion.div 
            key="preview"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-8"
          >
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                  <CheckCircle size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-emerald-900">Resume Ready!</h3>
                  <p className="text-sm text-emerald-700">Your AI-optimized CV is ready for download.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setShowPdf(!showPdf)}
                  className="bg-white border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                >
                  <Eye size={16} className="mr-2" /> {showPdf ? 'Hide PDF' : 'Preview PDF'}
                </Button>
                <Button 
                  onClick={handleFinalUpload}
                  className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-lg shadow-indigo-100 border-none px-6"
                >
                  <Upload size={16} className="mr-2" /> Update & Upload CV to System
                </Button>
              </div>
            </div>

            {showPdf ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-gray-200 rounded-3xl shadow-2xl overflow-hidden max-w-4xl mx-auto aspect-[1/1.414] w-full"
              >
                <iframe 
                  src="/CV.pdf" 
                  className="w-full h-full border-none"
                  title="CV Preview"
                />
              </motion.div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-3xl shadow-2xl overflow-hidden max-w-4xl mx-auto">
                <div className="h-12 bg-slate-900 flex items-center justify-between px-6">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                    <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono uppercase tracking-widest">ABEC Premier AI CV Preview</span>
                  <div className="w-12"></div>
                </div>
                <div className="p-12 bg-white min-h-[800px]">
                  {/* Simulated CV Content */}
                  <div className="flex justify-between items-start border-b-2 border-slate-900 pb-8 mb-8">
                    <div className="flex gap-6 items-start">
                      {editableData.profilePicture && (
                        <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-slate-900 flex-shrink-0">
                          <img src={editableData.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div>
                        <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">{editableData.name}</h1>
                        <p className="text-indigo-600 font-bold mt-1">{editableData.role}</p>
                      </div>
                    </div>
                    <div className="text-right text-xs text-slate-500 space-y-1">
                      <p>{editableData.email}</p>
                      <p>{editableData.phone}</p>
                      <p>Colombo, Sri Lanka</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-12 gap-8">
                    {/* Sidebar - Grid Layout */}
                    <div className="col-span-4 space-y-8 border-r border-slate-100 pr-8">
                      <section>
                        <h2 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] mb-4">Contact</h2>
                        <div className="space-y-2 text-[11px] text-slate-600 font-medium">
                          <p className="flex items-center gap-2"><Mail size={12} className="text-indigo-400" /> {editableData.email}</p>
                          <p className="flex items-center gap-2"><Phone size={12} className="text-indigo-400" /> {editableData.phone}</p>
                          <p className="flex items-center gap-2"><MapPin size={12} className="text-indigo-400" /> Colombo, Sri Lanka</p>
                        </div>
                      </section>

                      <section>
                        <h2 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] mb-4">Skills</h2>
                        <div className="flex flex-wrap gap-1.5">
                          {['AI Product Design', 'GTM Strategy', 'B2B Growth', 'UI/UX', 'SaaS', 'Framer', 'Product Management'].map(skill => (
                            <span key={skill} className="text-[9px] font-bold bg-slate-50 text-slate-700 px-2 py-1 rounded border border-slate-100 uppercase">{skill}</span>
                          ))}
                        </div>
                      </section>

                      <section>
                        <h2 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] mb-4">Test Scores</h2>
                        <div className="space-y-3">
                          {editableData.testScores.map((score, i) => (
                            <div key={i} className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                              <div className="flex justify-between text-[10px] font-bold mb-1">
                                <span>{score.name}</span>
                                <span className="text-indigo-600">{score.score} Overall</span>
                              </div>
                              <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden">
                                <div className="bg-indigo-500 h-full" style={{ width: `${Math.min(100, (parseFloat(score.score) / 9) * 100)}%` }}></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </section>

                      <section>
                        <h2 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] mb-4">Languages</h2>
                        <div className="space-y-2">
                          <div className="flex justify-between text-[10px] font-bold">
                            <span className="text-slate-600">English</span>
                            <span className="text-indigo-600">Native</span>
                          </div>
                          <div className="flex justify-between text-[10px] font-bold">
                            <span className="text-slate-600">Sinhala</span>
                            <span className="text-indigo-600">Native</span>
                          </div>
                        </div>
                      </section>
                    </div>

                    {/* Main Content - Grid Layout */}
                    <div className="col-span-8 space-y-10">
                      <section>
                        <h2 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                          <span className="w-6 h-[1px] bg-slate-900"></span> Professional Experience
                        </h2>
                        <div className="space-y-8">
                          {editableData.experience.map((exp, i) => (
                            <div key={i} className="relative pl-6 border-l border-slate-100">
                              <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-indigo-600"></div>
                              <div className="flex justify-between items-baseline mb-1">
                                <h3 className="font-bold text-slate-900 text-base">{exp.title}</h3>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{exp.period}</span>
                              </div>
                              <p className="text-sm text-indigo-600 font-bold mb-3">{exp.company}</p>
                              <ul className="space-y-2">
                                <li className="text-xs text-slate-600 leading-relaxed flex gap-2">
                                  <span className="text-indigo-400 mt-1.5 w-1 h-1 rounded-full bg-indigo-400 shrink-0"></span>
                                  Spearheaded GTM strategies resulting in 40% market share growth within the first year.
                                </li>
                                <li className="text-xs text-slate-600 leading-relaxed flex gap-2">
                                  <span className="text-indigo-400 mt-1.5 w-1 h-1 rounded-full bg-indigo-400 shrink-0"></span>
                                  Orchestrated cross-functional teams to deliver AI-driven B2B solutions for global clients.
                                </li>
                              </ul>
                            </div>
                          ))}
                        </div>
                      </section>

                      <section>
                        <h2 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                          <span className="w-6 h-[1px] bg-slate-900"></span> Education
                        </h2>
                        <div className="grid grid-cols-1 gap-6">
                          {activeFlow === 'update' && (
                            <motion.div 
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl relative overflow-hidden"
                            >
                              <div className="absolute top-0 right-0 p-2">
                                <span className="text-[8px] font-black bg-indigo-600 text-white px-2 py-0.5 rounded-full uppercase">New</span>
                              </div>
                              <h3 className="font-bold text-slate-900 text-sm">Master of Business Administration (MBA)</h3>
                              <p className="text-xs text-indigo-600 font-bold">In Progress - 2026</p>
                              <p className="text-[10px] text-slate-500 mt-1 italic">Specializing in AI Strategy & Digital Transformation</p>
                            </motion.div>
                          )}
                          {editableData.education.map((edu, i) => (
                            <div key={i} className="pl-6 border-l border-slate-100">
                              <h3 className="font-bold text-slate-900 text-sm">{edu.degree}</h3>
                              <p className="text-xs text-slate-500 font-medium">{edu.school}</p>
                            </div>
                          ))}
                        </div>
                      </section>

                      {editableData.customSections.map((section) => (
                        <section key={section.id}>
                          <h2 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                            <span className="w-6 h-[1px] bg-slate-900"></span> {section.title}
                          </h2>
                          <div className="pl-6 border-l border-slate-100">
                            <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">
                              {section.content}
                            </p>
                          </div>
                        </section>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {step === 'success' && (
          <motion.div 
            key="success"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-20 space-y-6"
          >
            <div className="w-32 h-32 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shadow-xl shadow-emerald-100">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", damping: 12 }}
              >
                <CheckCircle size={64} />
              </motion.div>
            </div>
            <div className="text-center">
              <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">Success!</h2>
              <p className="text-slate-500 mt-2">Your CV has been updated and saved to your profile.</p>
            </div>
            <p className="text-xs text-slate-400 animate-pulse">Exiting in 3 seconds...</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
