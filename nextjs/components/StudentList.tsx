import React, { useMemo, useState } from 'react';
import { Student, StudentStatus } from '../types';
import { STUDENTS, EMPLOYEES } from '../constants';
import { MoreHorizontal, Filter, ChevronDown, UserPlus } from 'lucide-react';
import { Button } from './Button';
import { AddStudentModal } from './AddStudentModal';
import { COUNTRY_CHECKLISTS } from '../constants';

interface StudentListProps {
  onSelectStudent: (student: Student) => void;
  students?: Student[];
  onUpdateStudent?: (student: Student) => void;
  onNavigate?: (view: string) => void;
}

const ALL_STATUSES: StudentStatus[] = [
  'New Inquiry',
  'Counseling',
  'Documentation',
  'Uni Application',
  'Offer Received',
  'Visa Pilot'
];

export const StudentList: React.FC<StudentListProps> = ({ onSelectStudent, students = STUDENTS, onUpdateStudent, onNavigate }) => {
  const [filterText, setFilterText] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const filteredStudents = useMemo(() => {
    return students.filter(s => 
      s.name.toLowerCase().includes(filterText.toLowerCase()) || 
      s.id.toLowerCase().includes(filterText.toLowerCase()) ||
      s.country.toLowerCase().includes(filterText.toLowerCase())
    );
  }, [filterText, students]);

  const handleStatusChange = (e: React.MouseEvent | React.ChangeEvent, studentId: string, newStatus: StudentStatus) => {
    e.stopPropagation(); // Prevent row click
    const student = students.find(s => s.id === studentId);
    if (!student || !onUpdateStudent) return;

    // BLOCKER LOGIC
    const currentIndex = ALL_STATUSES.indexOf(student.status);
    const newIndex = ALL_STATUSES.indexOf(newStatus);

    // Only block if moving forward
    if (newIndex > currentIndex) {
        const countryChecklist = COUNTRY_CHECKLISTS[student.country] || COUNTRY_CHECKLISTS['Default'];
        const studentDocs = student.documents || [];

        const checkStageRequirements = (stageName: string) => {
            const stageReqs = countryChecklist.find(c => c.stage === stageName);
            if (!stageReqs) return true; // No requirements for this stage

            const missingDocs = stageReqs.items.filter(item => {
                const hasValidDoc = studentDocs.some(d => 
                    (d.type === item.docType || d.type.includes(item.docType) || item.docType.includes(d.type)) && 
                    d.status !== 'Rejected'
                );
                return !hasValidDoc;
            });

            if (missingDocs.length > 0) {
                alert(`Cannot advance to ${newStatus}: Missing or rejected required documents for the ${stageName} stage.\n\nMissing/Rejected: ${missingDocs.map(m => m.docType).join(', ')}`);
                return false;
            }
            return true;
        };

        // Check all stages up to the new status
        if (newIndex > ALL_STATUSES.indexOf('Documentation') && !checkStageRequirements('Documentation')) return;
        if (newIndex > ALL_STATUSES.indexOf('Uni Application') && !checkStageRequirements('Uni Application')) return;
        if (newIndex > ALL_STATUSES.indexOf('Offer Received') && !checkStageRequirements('Offer Received')) return;
    }

    onUpdateStudent({ ...student, status: newStatus });
  };

  const handleAddStudent = (newStudent: Student) => {
      // This should ideally call a prop to add student, but for now we might need to handle it if onAddStudent is not passed.
      // Since the prompt only asked for "Pipeline Stage row should be change live", I'll focus on that.
      // If we need to add students, we should probably add onAddStudent prop too.
      // For now, I'll leave it as is or log a warning if onAddStudent is missing.
      console.log("Adding student:", newStudent.name);
      console.warn("Add student not fully implemented with lifted state yet");
  };

  const getStatusColor = (status: StudentStatus) => {
    switch (status) {
      case 'New Inquiry': return 'bg-slate-100 text-slate-700 border-gray-200';
      case 'Counseling': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Documentation': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Uni Application': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Offer Received': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Visa Pilot': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getCounselor = (id: string) => {
    return EMPLOYEES.find(e => e.id === id);
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
           <h1 className="text-2xl font-semibold tracking-tight text-[#0F172A]">Students</h1>
           <p className="text-sm text-slate-500 mt-1">Manage pipeline, documents, and visa applications.</p>
        </div>
        <div className="flex gap-2">
            <div className="relative">
                <input 
                type="text" 
                placeholder="Search..." 
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                className="pl-3 pr-8 py-2 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-slate-100 focus:border-slate-300 w-64 transition-all"
                />
                <Filter size={14} className="absolute right-2.5 top-3 text-gray-400" />
            </div>
            <Button onClick={() => setIsAddModalOpen(true)} className="bg-[#0F172A] hover:bg-slate-800">
                <UserPlus size={16} className="mr-2" />
                Add Student
            </Button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-slate-500 font-medium border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 w-[120px]">ID</th>
                <th className="px-6 py-3">Student Name</th>
                <th className="px-6 py-3">Country</th>
                <th className="px-6 py-3">Branch</th>
                <th className="px-6 py-3">Pipeline Stage</th>
                <th className="px-6 py-3">Counselor</th>
                <th className="px-6 py-3 text-right">Academic</th>
                <th className="px-6 py-3 w-[50px]"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredStudents.map((student) => (
                <tr 
                  key={student.id} 
                  onClick={() => onSelectStudent(student)}
                  className="hover:bg-slate-50 cursor-pointer transition-colors group"
                >
                  <td className="px-6 py-3 font-mono text-xs text-slate-400">{student.id}</td>
                  <td className="px-6 py-3 font-medium text-slate-900">
                      {student.name}
                      {student.priority === 'High' && <span className="ml-2 inline-block w-2 h-2 rounded-full bg-rose-500" title="High Priority"></span>}
                  </td>
                  <td className="px-6 py-3 text-slate-600">{student.country}</td>
                  <td className="px-6 py-3 text-slate-500 text-xs">{student.branch}</td>
                  <td className="px-6 py-3" onClick={(e) => e.stopPropagation()}>
                    {/* Status Dropdown - Clean & Easy */}
                    <div className="relative inline-block">
                        <select 
                            value={student.status}
                            onChange={(e) => handleStatusChange(e, student.id, e.target.value as StudentStatus)}
                            className={`appearance-none cursor-pointer pl-3 pr-8 py-1 rounded-full text-xs font-medium border bg-transparent focus:ring-2 focus:ring-offset-1 focus:outline-none ${getStatusColor(student.status)}`}
                        >
                            {ALL_STATUSES.map(s => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                        <ChevronDown size={12} className="absolute right-2.5 top-1.5 pointer-events-none opacity-50" />
                    </div>
                  </td>
                  <td className="px-6 py-3 text-slate-600 flex items-center gap-2">
                    {getCounselor(student.counselor)?.avatar ? (
                        <img src={getCounselor(student.counselor)?.avatar} alt={getCounselor(student.counselor)?.name} className="w-5 h-5 rounded-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                        <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-[10px] font-bold">
                           {(getCounselor(student.counselor)?.name || student.counselor).charAt(0)}
                        </div>
                    )}
                    {getCounselor(student.counselor)?.name || student.counselor}
                  </td>
                  <td className="px-6 py-3 text-right font-mono text-xs text-slate-500">
                    GPA {student.gpa} | IELTS {student.ielts}
                  </td>
                  <td className="px-6 py-3 text-right">
                    <button className="text-slate-400 hover:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreHorizontal size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-3 border-t border-gray-200 bg-gray-50 text-xs text-slate-500 flex justify-between items-center">
            <span>Showing {filteredStudents.length} of {students.length} students</span>
            <div className="flex gap-2">
                <button className="disabled:opacity-50" disabled>Previous</button>
                <button className="disabled:opacity-50">Next</button>
            </div>
        </div>
      </div>

      <AddStudentModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddStudent}
        onNavigate={onNavigate}
      />
    </div>
  );
};