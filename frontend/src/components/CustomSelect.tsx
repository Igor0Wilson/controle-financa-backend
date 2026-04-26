import React, { useState, useRef, useEffect } from 'react';
import { FaChevronDown } from 'react-icons/fa';

interface Option {
  id: string;
  name: string;
}

interface Props {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
}

const CustomSelect: React.FC<Props> = ({ options, value, onChange, placeholder = 'Selecione...', label, error }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.id === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      {label && <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">{label}</label>}
      
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-5 py-4 rounded-2xl border-2 transition-all outline-none flex items-center justify-between text-left font-medium ${
          error ? 'border-red-100 bg-red-50 focus:border-red-300' : 'border-slate-100 bg-slate-50 focus:border-slate-900'
        }`}
      >
        <span className={selectedOption ? 'text-slate-800' : 'text-slate-400'}>
          {selectedOption ? selectedOption.name : placeholder}
        </span>
        {React.createElement(FaChevronDown as any, { 
          className: `text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}` 
        })}
      </button>

      {isOpen && (
        <div className="absolute z-[100] w-full mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="max-h-60 overflow-y-auto">
            <div 
              className="px-5 py-3 hover:bg-slate-50 cursor-pointer text-slate-400 text-sm font-medium border-b border-slate-50"
              onClick={() => { onChange(''); setIsOpen(false); }}
            >
              {placeholder}
            </div>
            {options.map((option) => (
              <div
                key={option.id}
                className={`px-5 py-4 hover:bg-slate-900 hover:text-white cursor-pointer transition-colors text-slate-700 font-bold text-sm ${
                  value === option.id ? 'bg-slate-100' : ''
                }`}
                onClick={() => {
                  onChange(option.id);
                  setIsOpen(false);
                }}
              >
                {option.name}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {error && <p className="mt-2 text-xs text-red-500 font-bold ml-1">{error}</p>}
    </div>
  );
};

export default CustomSelect;
