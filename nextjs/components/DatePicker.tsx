import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

interface DatePickerProps {
    label: string;
    value: string;
    onChange: (date: string) => void;
    required?: boolean;
}

export const DatePicker: React.FC<DatePickerProps> = ({ label, value, onChange, required }) => {
    const [isOpen, setIsOpen] = useState(false);
    // Initialize with value or today
    const [currentDate, setCurrentDate] = useState(value ? new Date(value) : new Date());
    const containerRef = useRef<HTMLDivElement>(null);

    const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleDateClick = (day: number) => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        // Format YYYY-MM-DD
        const formattedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        onChange(formattedDate);
        setIsOpen(false);
    };

    const changeMonth = (offset: number) => {
        const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1);
        setCurrentDate(newDate);
    };

    const renderCalendar = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const days = daysInMonth(year, month);
        const startDay = firstDayOfMonth(year, month);
        
        const slots = [];
        
        // Empty slots for previous month
        for (let i = 0; i < startDay; i++) {
            slots.push(<div key={`empty-${i}`} className="w-8 h-8"></div>);
        }

        // Days
        for (let d = 1; d <= days; d++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            const isSelected = value === dateStr;
            const isToday = new Date().toDateString() === new Date(year, month, d).toDateString();

            slots.push(
                <button
                    key={d}
                    type="button"
                    onClick={(e) => { e.preventDefault(); handleDateClick(d); }}
                    className={`w-8 h-8 text-xs rounded-full flex items-center justify-center transition-all
                        ${isSelected ? 'bg-[#0F172A] text-white font-bold shadow-sm' : 'hover:bg-slate-100 text-slate-700'}
                        ${!isSelected && isToday ? 'text-indigo-600 font-bold bg-indigo-50 border border-indigo-100' : ''}
                    `}
                >
                    {d}
                </button>
            );
        }

        return slots;
    };

    return (
        <div className="space-y-1.5" ref={containerRef}>
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide flex items-center">
                <CalendarIcon size={12} className="mr-1.5" /> {label}
            </label>
            <div className="relative">
                <div 
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-md focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all cursor-pointer flex items-center justify-between"
                >
                    <span className={value ? "text-slate-900" : "text-slate-400"}>
                        {value ? new Date(value).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'Select date...'}
                    </span>
                    <CalendarIcon size={14} className="text-slate-400" />
                </div>

                {isOpen && (
                    <div className="absolute z-50 left-0 mt-1 p-4 bg-white border border-gray-200 rounded-xl shadow-xl w-[280px] animate-in fade-in zoom-in-95 duration-100">
                        <div className="flex justify-between items-center mb-4">
                            <button type="button" onClick={() => changeMonth(-1)} className="p-1 hover:bg-slate-50 rounded-md text-slate-500 transition-colors"><ChevronLeft size={16} /></button>
                            <span className="text-sm font-semibold text-slate-900">{months[currentDate.getMonth()]} {currentDate.getFullYear()}</span>
                            <button type="button" onClick={() => changeMonth(1)} className="p-1 hover:bg-slate-50 rounded-md text-slate-500 transition-colors"><ChevronRight size={16} /></button>
                        </div>
                        <div className="grid grid-cols-7 gap-1 mb-2 text-center">
                            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                                <div key={d} className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{d}</div>
                            ))}
                        </div>
                        <div className="grid grid-cols-7 gap-1 place-items-center">
                            {renderCalendar()}
                        </div>
                    </div>
                )}
            </div>
            {/* Hidden input for form validation */}
            <input 
                type="text" 
                className="sr-only" 
                value={value} 
                required={required} 
                onChange={() => {}} 
                onFocus={() => setIsOpen(true)}
            />
        </div>
    );
};