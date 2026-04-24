import React, { useState, useEffect } from 'react';
import { Appointment, Student, UserRole, Employee } from '../types';
import { STUDENTS } from '../constants';
import { Button } from './Button';
import { ChevronLeft, ChevronRight, Clock, User, CheckCircle, AlertTriangle, Video, Settings, X, Save } from 'lucide-react';

interface CalendarSchedulerProps {
    appointments: Appointment[];
    onBookAppointment: (apt: Appointment) => void;
    onUpdateAppointment: (apt: Appointment) => void;
    currentRole: UserRole;
    currentUser: Student | Employee;
    employees?: Employee[];
    onUpdateEmployee?: (emp: Employee) => void;
}

export const CalendarScheduler: React.FC<CalendarSchedulerProps> = ({ appointments, onBookAppointment, onUpdateAppointment, currentRole, currentUser, employees = [], onUpdateEmployee }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
    const [selectedCounselorId, setSelectedCounselorId] = useState<string>('');
    const [bookingTime, setBookingTime] = useState<string | null>(null);
    const [bookingType, setBookingType] = useState<'Counseling' | 'Visa Check' | 'Mock Interview'>('Counseling');
    
    // Availability Settings Modal
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [tempAvailability, setTempAvailability] = useState<{
        days: number[];
        startHour: number;
        endHour: number;
    }>({ days: [1,2,3,4,5], startHour: 9, endHour: 17 });

    // Outcome Modal State
    const [outcomeModalOpen, setOutcomeModalOpen] = useState(false);
    const [selectedAptId, setSelectedAptId] = useState<string | null>(null);
    const [outcomeStatus, setOutcomeStatus] = useState<'Completed' | 'No Show'>('Completed');
    const [outcomeNotes, setOutcomeNotes] = useState('');

    // --- Student Mode Init ---
    useEffect(() => {
        if (currentRole === 'Student') {
            const s = currentUser as Student;
            if (s.counselor && selectedCounselorId !== s.counselor) {
               setSelectedCounselorId(s.counselor);
            }
        } else if (currentRole === 'Counselor') {
            if (currentUser.id && selectedCounselorId !== currentUser.id) {
                setSelectedCounselorId(currentUser.id);
            }
            
            // Load availability
            const emp = employees.find(e => e.id === currentUser.id);
            if (emp?.availability) {
                // Check if we need to update to avoid infinite loop
                const isDifferent = JSON.stringify(emp.availability) !== JSON.stringify(tempAvailability);
                if (isDifferent) {
                     setTempAvailability(emp.availability);
                }
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentRole, currentUser, employees]);

    // --- Helpers ---
    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };

    const changeMonth = (offset: number) => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
        setSelectedDate(null);
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-CA'); // YYYY-MM-DD
    };

    const getCounselor = (id: string) => employees.find(e => e.id === id);
    const getStudent = (id: string) => STUDENTS.find(s => s.id === id);

    // --- Availability Logic ---
    const generateTimeSlots = (date: Date, counselorId: string) => {
        const counselor = getCounselor(counselorId);
        if (!counselor?.availability) return [];

        const dayOfWeek = date.getDay();
        if (!counselor.availability.days.includes(dayOfWeek)) return []; // Closed

        const slots = [];
        const { startHour, endHour } = counselor.availability;
        
        // Existing appointments for this counselor on this date
        const dateStr = formatDate(date);
        const dayAppointments = appointments.filter(a => a.counselorId === counselorId && a.date === dateStr && a.status !== 'Cancelled');
        
        // Helper to check if a slot overlaps with any booked appointment
        const isBooked = (slotTime: string) => {
             return dayAppointments.some(a => {
                 // Simple exact match for now, assuming standard slots
                 // Ideally check ranges: [slotStart, slotEnd) overlaps [aptStart, aptEnd)
                 return a.time === slotTime;
             });
        };

        // Generate 30-minute slots
        for (let h = startHour; h < endHour; h++) {
            // :00
            const timeString00 = `${h.toString().padStart(2, '0')}:00`;
            if (!isBooked(timeString00)) {
                slots.push(timeString00);
            }
            // :30
            const timeString30 = `${h.toString().padStart(2, '0')}:30`;
            if (!isBooked(timeString30)) {
                slots.push(timeString30);
            }
        }
        return slots;
    };

    // --- Handlers ---
    const handleBook = () => {
        if (!selectedDate || !bookingTime || !selectedCounselorId) return;
        
        const newApt: Appointment = {
            id: `APT-${Date.now()}`,
            counselorId: selectedCounselorId,
            studentId: (currentUser as Student).id,
            title: `${bookingType} Session`,
            date: formatDate(selectedDate),
            time: bookingTime,
            duration: 30, // 30 mins default
            type: bookingType,
            status: 'Scheduled',
            meetingLink: 'https://meet.google.com/abc-defg-hij'
        };

        onBookAppointment(newApt);
        setBookingTime(null);
        alert(`Session booked for ${newApt.date} at ${newApt.time}! Notification sent.`);
    };

    const handleSaveAvailability = () => {
        if (currentRole === 'Counselor' && onUpdateEmployee) {
            const updatedEmp = { ...currentUser as Employee, availability: tempAvailability };
            onUpdateEmployee(updatedEmp);
            setIsSettingsOpen(false);
            alert('Availability settings updated!');
        }
    };

    const toggleDay = (dayIndex: number) => {
        setTempAvailability(prev => {
            const days = prev.days.includes(dayIndex) 
                ? prev.days.filter(d => d !== dayIndex)
                : [...prev.days, dayIndex].sort();
            return { ...prev, days };
        });
    };

    const handleLogOutcome = () => {
        if (!selectedAptId) return;
        const apt = appointments.find(a => a.id === selectedAptId);
        if (apt) {
            onUpdateAppointment({
                ...apt,
                status: outcomeStatus,
                outcomeNotes: outcomeNotes
            });
            setOutcomeModalOpen(false);
            setOutcomeNotes('');
            setSelectedAptId(null);
        }
    };

    // --- Render Components ---

    const renderCalendar = () => {
        const days = getDaysInMonth(currentDate);
        const startDay = getFirstDayOfMonth(currentDate);
        const slots = [];

        // Header Days
        const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        
        // Empty slots
        for (let i = 0; i < startDay; i++) {
            slots.push(<div key={`empty-${i}`} className="h-10"></div>);
        }

        // Day slots
        for (let d = 1; d <= days; d++) {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), d);
            const dateStr = formatDate(date);
            const isToday = formatDate(new Date()) === dateStr;
            const isSelected = selectedDate && formatDate(selectedDate) === dateStr;
            
            // Check availability dots
            
            const myAppointmentsDay = appointments.filter(a => {
                if (currentRole === 'Manager' || currentRole === 'Team Lead' || currentRole === 'Admin') return a.date === dateStr;
                if (currentRole === 'Counselor') return a.date === dateStr && a.counselorId === currentUser.id;
                return a.date === dateStr && a.studentId === currentUser.id;
            });

            slots.push(
                <button
                    key={d}
                    onClick={() => setSelectedDate(date)}
                    className={`h-10 w-10 mx-auto rounded-full flex flex-col items-center justify-center relative transition-all text-sm
                        ${isSelected ? 'bg-[#0F172A] text-white shadow-md' : 'hover:bg-slate-100 text-slate-700'}
                        ${isToday && !isSelected ? 'text-indigo-600 font-bold bg-indigo-50' : ''}
                    `}
                >
                    {d}
                    {/* Dots for existing appointments */}
                    <div className="flex gap-0.5 mt-0.5">
                         {myAppointmentsDay.map((_, i) => (
                             i < 3 && <div key={i} className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white/50' : 'bg-indigo-400'}`}></div>
                         ))}
                    </div>
                </button>
            );
        }

        return (
            <div className="w-full max-w-sm mx-auto">
                <div className="flex justify-between items-center mb-4 px-2">
                    <button onClick={() => changeMonth(-1)} className="p-1 hover:bg-slate-100 rounded-full"><ChevronLeft size={20} /></button>
                    <h3 className="font-bold text-slate-800">{currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h3>
                    <button onClick={() => changeMonth(1)} className="p-1 hover:bg-slate-100 rounded-full"><ChevronRight size={20} /></button>
                </div>
                <div className="grid grid-cols-7 text-center mb-2">
                    {weekDays.map(d => <div key={d} className="text-xs font-bold text-slate-400 uppercase">{d}</div>)}
                </div>
                <div className="grid grid-cols-7 gap-y-2">
                    {slots}
                </div>
            </div>
        );
    };

    // --- Main Logic Switch ---
    // Past appointments needing review (Counselor Only)
    const pendingReview = currentRole === 'Counselor' 
        ? appointments.filter(a => a.counselorId === currentUser.id && a.status === 'Scheduled' && new Date(`${a.date}T${a.time}`) < new Date())
        : [];

    return (
        <div className="space-y-6 animate-in fade-in duration-500 h-full flex flex-col">
            <div className="flex justify-between items-end shrink-0">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-[#0F172A]">Calendar & Appointments</h1>
                    <p className="text-sm text-slate-500 mt-1">
                        {currentRole === 'Student' ? 'Book sessions with your counselor.' : 'Manage your schedule and availability.'}
                    </p>
                </div>
                {currentRole === 'Counselor' && (
                    <Button variant="secondary" size="sm" onClick={() => setIsSettingsOpen(true)}>
                        <Settings size={14} className="mr-2" /> Availability Settings
                    </Button>
                )}
            </div>

            {/* Pending Reviews Alert (Counselor) */}
            {pendingReview.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between animate-in slide-in-from-top-2">
                    <div className="flex items-center gap-3">
                         <div className="p-2 bg-amber-100 text-amber-600 rounded-full">
                             <AlertTriangle size={20} />
                         </div>
                         <div>
                             <h4 className="font-bold text-amber-800 text-sm">Action Required</h4>
                             <p className="text-xs text-amber-700">{pendingReview.length} past sessions need outcome logging.</p>
                         </div>
                    </div>
                    <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white border-none" onClick={() => {
                        setSelectedAptId(pendingReview[0].id);
                        setOutcomeModalOpen(true);
                    }}>
                        Review Now
                    </Button>
                </div>
            )}

            {/* Availability Settings Modal */}
            {isSettingsOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-xl border border-gray-100 shadow-2xl w-full max-w-md scale-100 animate-in zoom-in-95 overflow-hidden">
                        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                <Settings size={18} /> Availability Settings
                            </h3>
                            <button onClick={() => setIsSettingsOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 space-y-6">
                            {/* Days Selection */}
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase block mb-3">Available Days</label>
                                <div className="flex justify-between gap-1">
                                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => {
                                        const isSelected = tempAvailability.days.includes(i);
                                        return (
                                            <button
                                                key={i}
                                                onClick={() => toggleDay(i)}
                                                className={`w-10 h-10 rounded-full text-sm font-bold transition-all flex items-center justify-center
                                                    ${isSelected ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}
                                                `}
                                            >
                                                {day}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Time Range */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Start Time</label>
                                    <select 
                                        className="w-full p-2 border border-gray-200 rounded-lg text-sm"
                                        value={tempAvailability.startHour}
                                        onChange={(e) => setTempAvailability(prev => ({ ...prev, startHour: parseInt(e.target.value) }))}
                                    >
                                        {Array.from({ length: 24 }).map((_, i) => (
                                            <option key={i} value={i}>{i.toString().padStart(2, '0')}:00</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase block mb-2">End Time</label>
                                    <select 
                                        className="w-full p-2 border border-gray-200 rounded-lg text-sm"
                                        value={tempAvailability.endHour}
                                        onChange={(e) => setTempAvailability(prev => ({ ...prev, endHour: parseInt(e.target.value) }))}
                                    >
                                        {Array.from({ length: 24 }).map((_, i) => (
                                            <option key={i} value={i}>{i.toString().padStart(2, '0')}:00</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="bg-blue-50 p-3 rounded-lg flex gap-3 items-start">
                                <Clock size={16} className="text-blue-600 shrink-0 mt-0.5" />
                                <p className="text-xs text-blue-800">
                                    Students will be able to book 30-minute sessions within these hours.
                                </p>
                            </div>
                        </div>
                        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-2">
                            <Button variant="ghost" onClick={() => setIsSettingsOpen(false)}>Cancel</Button>
                            <Button onClick={handleSaveAvailability}>
                                <Save size={16} className="mr-2" /> Save Settings
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1 min-h-0">
                {/* Left: Calendar & Filters */}
                <div className="lg:col-span-4 bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-fit">
                    {renderCalendar()}
                    
                    <div className="mt-8 pt-6 border-t border-gray-100 space-y-4">
                        <div className="flex items-center justify-between text-sm">
                            <span className="flex items-center gap-2 text-slate-600">
                                <div className="w-2 h-2 rounded-full bg-indigo-500"></div> Upcoming
                            </span>
                            <span className="flex items-center gap-2 text-slate-600">
                                <div className="w-2 h-2 rounded-full bg-emerald-500"></div> Completed
                            </span>
                        </div>
                    </div>
                </div>

                {/* Right: Slots or Appointment List */}
                <div className="lg:col-span-8 space-y-6 flex flex-col">
                    
                    {/* Booking Interface (Visible if Date Selected) */}
                    {selectedDate && currentRole !== 'Manager' && currentRole !== 'Team Lead' && currentRole !== 'Admin' && (
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm animate-in slide-in-from-left-2">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                    <Clock size={18} className="text-slate-400" />
                                    Available Slots for {selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                </h3>
                                {currentRole === 'Student' && (
                                    <select 
                                        className="text-xs border-gray-200 rounded-md p-1.5 bg-gray-50 outline-none focus:ring-1 focus:ring-indigo-500"
                                        value={bookingType}
                                        onChange={(e) => setBookingType(e.target.value as any)}
                                    >
                                        <option value="Counseling">Counseling</option>
                                        <option value="Visa Check">Visa Check</option>
                                        <option value="Mock Interview">Mock Interview</option>
                                    </select>
                                )}
                            </div>

                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 mb-6">
                                {selectedCounselorId ? generateTimeSlots(selectedDate, selectedCounselorId).map(time => (
                                    <button
                                        key={time}
                                        onClick={() => setBookingTime(time)}
                                        className={`py-2 px-1 rounded-md text-xs font-medium border transition-all
                                            ${bookingTime === time 
                                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' 
                                                : 'bg-white border-gray-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-600'}
                                        `}
                                    >
                                        {time}
                                    </button>
                                )) : (
                                    <div className="col-span-full text-center text-slate-400 text-sm py-4">
                                        Select a counselor to view availability.
                                    </div>
                                )}
                                {selectedCounselorId && generateTimeSlots(selectedDate, selectedCounselorId).length === 0 && (
                                    <div className="col-span-full text-center text-slate-400 text-sm py-4 italic">
                                        No slots available on this date.
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end pt-4 border-t border-gray-100">
                                <Button disabled={!bookingTime} onClick={handleBook}>
                                    Book {bookingType}
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Upcoming List */}
                    <div className="bg-white border border-gray-200 rounded-xl shadow-sm flex-1 overflow-hidden flex flex-col">
                        <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                            <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wide">Scheduled Sessions</h3>
                        </div>
                        <div className="divide-y divide-gray-100 overflow-y-auto flex-1 p-0">
                            {appointments.filter(a => {
                                if (currentRole === 'Manager' || currentRole === 'Team Lead' || currentRole === 'Admin') return true;
                                if (currentRole === 'Counselor') return a.counselorId === currentUser.id;
                                return a.studentId === currentUser.id;
                            }).sort((a,b) => {
                                const dateA = new Date(`${a.date}T${a.time}`);
                                const dateB = new Date(`${b.date}T${b.time}`);
                                const now = new Date();
                                const isPastA = dateA < now;
                                const isPastB = dateB < now;

                                if (isPastA && !isPastB) return 1; // Past comes after future
                                if (!isPastA && isPastB) return -1; // Future comes before past
                                
                                if (!isPastA && !isPastB) {
                                    // Both future: Ascending (nearest first)
                                    return dateA.getTime() - dateB.getTime();
                                } else {
                                    // Both past: Descending (nearest first)
                                    return dateB.getTime() - dateA.getTime();
                                }
                            }).map(apt => {
                                const isPast = new Date(`${apt.date}T${apt.time}`) < new Date();
                                const student = getStudent(apt.studentId);
                                const counselor = getCounselor(apt.counselorId);
                                const otherName = currentRole === 'Student' ? counselor?.name : student?.name;

                                return (
                                    <div key={apt.id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between group">
                                        <div className="flex items-center gap-4">
                                            <div className={`flex flex-col items-center justify-center w-12 h-12 rounded-lg border ${isPast ? 'bg-slate-50 border-slate-200 text-slate-400' : 'bg-indigo-50 border-indigo-100 text-indigo-700'}`}>
                                                <span className="text-xs font-bold uppercase">{new Date(apt.date).toLocaleDateString('en-US', {month: 'short'})}</span>
                                                <span className="text-lg font-bold leading-none">{new Date(apt.date).getDate()}</span>
                                            </div>
                                            <div>
                                                <h4 className={`font-semibold ${isPast ? 'text-slate-500' : 'text-slate-900'}`}>{apt.title}</h4>
                                                <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                                                    <span className="flex items-center gap-1"><Clock size={12}/> {apt.time} ({apt.duration}m)</span>
                                                    <span className="flex items-center gap-1"><User size={12}/> {otherName}</span>
                                                    {apt.status === 'Completed' && <span className="text-emerald-600 flex items-center gap-1"><CheckCircle size={12}/> Completed</span>}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {!isPast && apt.status === 'Scheduled' && (
                                                <Button size="sm" variant="secondary" className="h-8">
                                                    <Video size={14} className="mr-2" /> Join
                                                </Button>
                                            )}
                                            {isPast && apt.status === 'Scheduled' && currentRole === 'Counselor' && (
                                                <Button size="sm" className="h-8 bg-amber-600 hover:bg-amber-700 border-none text-white" onClick={() => {
                                                    setSelectedAptId(apt.id);
                                                    setOutcomeModalOpen(true);
                                                }}>
                                                    Log Outcome
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                            {appointments.length === 0 && (
                                <div className="p-8 text-center text-slate-400 text-sm">No appointments found.</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Outcome Modal */}
            {outcomeModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-xl border border-gray-100 shadow-2xl p-6 w-full max-w-md scale-100 animate-in zoom-in-95">
                        <h3 className="font-bold text-lg text-slate-900 mb-4">Log Session Outcome</h3>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Status</label>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => setOutcomeStatus('Completed')}
                                        className={`flex-1 py-2 rounded-md text-sm font-medium border ${outcomeStatus === 'Completed' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'border-gray-200 text-slate-600'}`}
                                    >
                                        Completed
                                    </button>
                                    <button 
                                        onClick={() => setOutcomeStatus('No Show')}
                                        className={`flex-1 py-2 rounded-md text-sm font-medium border ${outcomeStatus === 'No Show' ? 'bg-rose-50 border-rose-200 text-rose-700' : 'border-gray-200 text-slate-600'}`}
                                    >
                                        No Show
                                    </button>
                                </div>
                            </div>
                            
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Session Notes</label>
                                <textarea 
                                    className="w-full p-3 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 outline-none resize-none"
                                    rows={4}
                                    placeholder="Key discussion points and next steps..."
                                    value={outcomeNotes}
                                    onChange={(e) => setOutcomeNotes(e.target.value)}
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <Button variant="ghost" onClick={() => setOutcomeModalOpen(false)}>Cancel</Button>
                                <Button onClick={handleLogOutcome}>Save Log</Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};