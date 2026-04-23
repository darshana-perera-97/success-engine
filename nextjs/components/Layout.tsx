import React, { useState } from 'react';
import { 
  Users, 
  LayoutDashboard, 
  CheckSquare, 
  FileText,
  Settings, 
  Bell, 
  Search,
  Command,
  LogOut,
  BarChart3,
  UserCircle,
  Shield,
  Briefcase,
  MessageSquare,
  Globe,
  DollarSign,
  Calendar,
  UserCog,
  Menu,
  X
} from 'lucide-react';
import { UserRole } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeView: string;
  onNavigate: (view: string) => void;
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeView, onNavigate, currentRole, onRoleChange }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Dynamic Navigation based on Role
  const getNavItems = () => {
    switch (currentRole) {
      case 'Student':
        return [
          { id: 'dashboard', label: 'My Application', icon: <LayoutDashboard size={20} /> },
          { id: 'resume', label: 'AI Resume', icon: <FileText size={20} /> },
          { id: 'calendar', label: 'Book Session', icon: <Calendar size={20} /> }, 
          { id: 'finance', label: 'My Finances', icon: <DollarSign size={20} /> },
          { id: 'messages', label: 'Messages', icon: <MessageSquare size={20} />, badge: '1' },
          { id: 'tasks', label: 'My Checklist', icon: <CheckSquare size={20} />, badge: '2' },
        ];
      case 'Counselor':
        return [
          { id: 'dashboard', label: 'My Dashboard', icon: <LayoutDashboard size={20} /> },
          { id: 'calendar', label: 'Calendar', icon: <Calendar size={20} /> },
          { id: 'students', label: 'My Students', icon: <Users size={20} /> },
          { id: 'university', label: 'Uni Finder', icon: <Globe size={20} /> }, 
          { id: 'messages', label: 'Inbox', icon: <MessageSquare size={20} />, badge: '3' },
          { id: 'tasks', label: 'My Tasks', icon: <CheckSquare size={20} />, badge: '5' },
        ];
      case 'Manager':
        return [
          { id: 'dashboard', label: 'Command Center', icon: <LayoutDashboard size={20} /> },
          { id: 'counselors', label: 'Counselors', icon: <UserCog size={20} /> }, 
          { id: 'calendar', label: 'Team Calendar', icon: <Calendar size={20} /> }, 
          { id: 'branch', label: 'Branch Analytics', icon: <BarChart3 size={20} /> },
          { id: 'students', label: 'All Students', icon: <Users size={20} /> },
          { id: 'university', label: 'Uni Database', icon: <Globe size={20} /> },
          { id: 'messages', label: 'Live Ops (Ghost)', icon: <MessageSquare size={20} /> },
          { id: 'tasks', label: 'Escalations', icon: <CheckSquare size={20} />, badge: '3' },
        ];
      case 'Admin':
      default:
        return [
          { id: 'dashboard', label: 'Global Overview', icon: <LayoutDashboard size={20} /> },
          { id: 'counselors', label: 'Counselors', icon: <UserCog size={20} /> }, 
          { id: 'branch', label: 'Branch Analytics', icon: <BarChart3 size={20} /> },
          { id: 'students', label: 'All Students', icon: <Users size={20} /> },
          { id: 'university', label: 'Uni Database', icon: <Globe size={20} /> },
          { id: 'messages', label: 'Omni-Channel', icon: <MessageSquare size={20} /> },
        ];
    }
  };

  const navItems = getNavItems();

  return (
    <div className="flex h-screen bg-[#F9FAFB] text-slate-900 font-sans overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-[60] lg:hidden backdrop-blur-sm animate-in fade-in"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-[70] w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:hidden flex flex-col justify-between
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
         <div>
          <div className="h-16 flex items-center px-6 border-b border-gray-100 justify-between">
            <div className="flex items-center w-[80%]">
                <img 
                    src="/MainLogo.png" 
                    alt="ABEC Premier Logo" 
                    className="w-full h-auto object-contain"
                    referrerPolicy="no-referrer"
                />
            </div>
            <button onClick={() => setIsMobileMenuOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
            </button>
          </div>

          <nav className="mt-6 flex flex-col gap-1 px-4">
            <div className="px-2 pb-4 mb-2 border-b border-gray-50">
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2">
                    {currentRole} Interface
                </p>
            </div>
            {navItems.map((item) => (
               <NavItem 
                key={item.id}
                icon={item.icon} 
                label={item.label} 
                isActive={activeView === item.id || (activeView === 'student-detail' && item.id === 'students')} 
                onClick={() => {
                    onNavigate(item.id);
                    setIsMobileMenuOpen(false);
                }}
                badge={item.badge}
              />
            ))}
          </nav>
        </div>

        <div className="p-4 border-t border-gray-100">
          <NavItem 
            icon={<Settings size={20} />} 
            label="Settings" 
            isActive={activeView === 'settings'} 
            onClick={() => {
                onNavigate('settings');
                setIsMobileMenuOpen(false);
            }}
          />
          <NavItem 
            icon={<LogOut size={20} />} 
            label="Logout" 
            isActive={false} 
            onClick={() => {}}
            className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
          />
        </div>
      </aside>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 border-r border-gray-200 bg-white flex-col justify-between transition-all duration-300 z-30">
        <div>
          <div className="h-16 flex items-center px-6 border-b border-gray-100">
            <div className="w-[80%] flex items-center">
                <img 
                    src="/MainLogo.png" 
                    alt="ABEC Premier Logo" 
                    className="w-full h-auto object-contain"
                    referrerPolicy="no-referrer"
                />
            </div>
          </div>

          <nav className="mt-6 flex flex-col gap-1 px-4">
            <div className="px-2 pb-4 mb-2 border-b border-gray-50">
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2">
                    {currentRole} Interface
                </p>
            </div>
            {navItems.map((item) => (
               <NavItem 
                key={item.id}
                icon={item.icon} 
                label={item.label} 
                isActive={activeView === item.id || (activeView === 'student-detail' && item.id === 'students')} 
                onClick={() => onNavigate(item.id)}
                badge={item.badge}
              />
            ))}
          </nav>
        </div>

        <div className="p-4 border-t border-gray-100">
          <NavItem 
            icon={<Settings size={20} />} 
            label="Settings" 
            isActive={activeView === 'settings'} 
            onClick={() => onNavigate('settings')}
          />
          <NavItem 
            icon={<LogOut size={20} />} 
            label="Logout" 
            isActive={false} 
            onClick={() => {}}
            className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
          />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-gray-200 flex items-center justify-between px-4 lg:px-8 z-[50] sticky top-0">
          <div className="flex items-center text-sm text-slate-500 gap-3">
             <button 
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden p-2 -ml-2 text-slate-500 hover:bg-gray-100 rounded-md"
             >
                <Menu size={20} />
             </button>
             <span className="hidden md:inline-flex items-center bg-gray-100 px-2 py-1 rounded text-xs border border-gray-200 text-gray-500 mr-4">
                <Command size={12} className="mr-1" /> K
             </span>
             <span className="font-medium text-slate-900 capitalize">{activeView.replace('-', ' ')}</span>
          </div>

          <div className="flex items-center gap-4">
            {currentRole !== 'Student' && (
                <div className="relative hidden md:block">
                <Search className="absolute left-2.5 top-2.5 text-gray-400" size={16} />
                <input 
                    type="text" 
                    placeholder="Search anything..." 
                    className="pl-9 pr-4 py-1.5 w-64 text-sm bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-400 focus:bg-white transition-all placeholder:text-gray-400"
                />
                </div>
            )}
            
            <button className="relative p-2 text-gray-500 hover:text-slate-900 hover:bg-gray-100 rounded-full transition-colors">
              <Bell size={20} strokeWidth={1.5} />
              <span className="absolute top-2 right-2 h-2 w-2 bg-rose-500 rounded-full border border-white"></span>
            </button>
            
            {/* Role Switcher */}
            <div className="relative group">
                <button className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-all">
                    <div className="h-8 w-8 rounded-full border-2 border-white shadow-sm ring-1 ring-gray-100 overflow-hidden flex items-center justify-center bg-white">
                        <img 
                            src="/canadian.png" 
                            alt="User Role" 
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                        />
                    </div>
                    <div className="text-left hidden md:block">
                        <p className="text-xs font-semibold text-slate-900 leading-tight">{currentRole}</p>
                        <p className="text-[10px] text-slate-500 leading-tight">Switch View</p>
                    </div>
                </button>
                
                {/* Dropdown - Fixed Gap Issue using pt-2 instead of mt-2 */}
                <div className="absolute right-0 top-full pt-2 w-48 hidden group-hover:block animate-in fade-in zoom-in-95 duration-150 origin-top-right z-[100]">
                    <div className="bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden p-1">
                        <RoleOption role="Student" current={currentRole} onClick={onRoleChange} icon={<UserCircle size={14} />} />
                        <RoleOption role="Counselor" current={currentRole} onClick={onRoleChange} icon={<Briefcase size={14} />} />
                        <RoleOption role="Manager" current={currentRole} onClick={onRoleChange} icon={<BarChart3 size={14} />} />
                        <RoleOption role="Admin" current={currentRole} onClick={onRoleChange} icon={<Shield size={14} />} />
                    </div>
                </div>
            </div>
          </div>
        </header>

        {/* Viewport */}
        <div className="flex-1 overflow-auto p-4 lg:p-8">
          <div className="max-w-7xl mx-auto h-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

const RoleOption = ({ role, current, onClick, icon }: { role: UserRole, current: UserRole, onClick: (r: UserRole) => void, icon: React.ReactNode }) => (
    <button 
        onClick={() => onClick(role)}
        className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors
            ${current === role ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}
        `}
    >
        {icon}
        {role}
    </button>
);

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
  badge?: string;
  className?: string;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, isActive, onClick, badge, className }) => {
  return (
    <button 
      onClick={onClick}
      className={`
        group flex items-center justify-center lg:justify-start w-full p-2.5 rounded-md text-sm font-medium transition-all duration-200
        ${isActive 
          ? 'bg-slate-100 text-[#0F172A]' 
          : 'text-slate-500 hover:bg-gray-50 hover:text-slate-900'}
        ${className}
      `}
    >
      <span className={`${isActive ? 'text-[#0F172A]' : 'text-slate-400 group-hover:text-slate-600'}`}>
        {icon}
      </span>
      <span className="ml-3 block flex-1 text-left">{label}</span>
      {badge && (
        <span className={`
            inline-flex items-center justify-center min-w-[20px] h-[20px] px-1.5 rounded-full text-[10px] font-bold shadow-sm
            ${isActive ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-600 border border-indigo-100'}
            transition-all duration-300 group-hover:scale-110
        `}>
          {badge}
        </span>
      )}
    </button>
  );
};