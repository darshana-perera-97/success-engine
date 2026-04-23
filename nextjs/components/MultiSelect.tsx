import React, { useState, useRef, useEffect } from 'react';
import { X, Check, ChevronsUpDown } from 'lucide-react';

interface Option {
  value: string;
  label: string;
  subLabel?: string;
}

interface MultiSelectProps {
  options: Option[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  label: string;
}

export const MultiSelect: React.FC<MultiSelectProps> = ({ options, value, onChange, placeholder = "Select...", label }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleOption = (optionValue: string) => {
    const newValue = value.includes(optionValue)
      ? value.filter(v => v !== optionValue)
      : [...value, optionValue];
    onChange(newValue);
  };

  const removeOption = (e: React.MouseEvent, optionValue: string) => {
    e.stopPropagation();
    onChange(value.filter(v => v !== optionValue));
  };

  const filteredOptions = options.filter(opt => 
    opt.label.toLowerCase().includes(searchTerm.toLowerCase()) || 
    opt.subLabel?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-1.5" ref={containerRef}>
      <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide">{label}</label>
      <div className="relative">
        <div 
          onClick={() => setIsOpen(!isOpen)}
          className="w-full min-h-[42px] px-3 py-2 bg-slate-50 border border-gray-200 rounded-md focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all cursor-text flex flex-wrap gap-1.5 items-center"
        >
           {value.length === 0 && !isOpen && (
             <span className="text-slate-400 text-sm">{placeholder}</span>
           )}
           
           {value.map(val => {
             const opt = options.find(o => o.value === val);
             return (
               <span key={val} className="inline-flex items-center px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 text-xs border border-indigo-100">
                 {opt?.label}
                 <button onClick={(e) => removeOption(e, val)} className="ml-1 hover:text-indigo-900"><X size={12} /></button>
               </span>
             );
           })}

           <div className="flex-1 min-w-[60px]">
             <input 
               type="text" 
               className="w-full bg-transparent border-none p-0 text-sm focus:ring-0 text-slate-700 placeholder:text-slate-400"
               placeholder={value.length === 0 ? "" : ""}
               value={searchTerm}
               onChange={(e) => {
                   setSearchTerm(e.target.value);
                   setIsOpen(true);
               }}
               onFocus={() => setIsOpen(true)}
             />
           </div>
           
           <div className="absolute right-2 top-2.5 text-slate-400 pointer-events-none">
             <ChevronsUpDown size={14} />
           </div>
        </div>

        {isOpen && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-100 rounded-md shadow-lg max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-100">
                {filteredOptions.length === 0 ? (
                    <div className="p-3 text-sm text-slate-400 text-center">No results found.</div>
                ) : (
                    <div className="py-1">
                        {filteredOptions.map(opt => (
                            <div 
                                key={opt.value}
                                onClick={() => toggleOption(opt.value)}
                                className={`px-3 py-2 text-sm cursor-pointer hover:bg-slate-50 flex items-center justify-between ${value.includes(opt.value) ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700'}`}
                            >
                                <div>
                                    <div className="font-medium">{opt.label}</div>
                                    {opt.subLabel && <div className="text-xs opacity-70">{opt.subLabel}</div>}
                                </div>
                                {value.includes(opt.value) && <Check size={14} className="text-indigo-600" />}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        )}
      </div>
    </div>
  );
};