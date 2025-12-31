
import React from 'react';
import { NAVIGATION_ITEMS } from '../constants.tsx';
import { UserContext } from '../types.ts';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (id: string) => void;
  user: UserContext;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, user }) => {
  const initials = user.displayName
    .split(' ')
    .filter(Boolean)
    .map(n => n[0])
    .join('')
    .toUpperCase();

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shadow-[1px_0_0_0_rgba(0,0,0,0.05)]">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-100">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">ModelMirror</h1>
          </div>
          <nav className="space-y-1">
            {NAVIGATION_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  activeTab === item.id
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <span className={activeTab === item.id ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'}>
                  {item.icon}
                </span>
                {item.label}
              </button>
            ))}
          </nav>
        </div>
        
        {/* Dynamic User Identity Profile Section */}
        <div className="mt-auto p-4 border-t border-slate-100 bg-slate-50/20">
          <div className="flex items-center gap-3 px-3 py-3 rounded-2xl transition-all duration-300 hover:bg-white hover:shadow-md hover:shadow-slate-200/50 cursor-default border border-transparent hover:border-slate-100" aria-label={`Logged in as ${user.displayName}, ${user.role}`}>
            <div className="relative shrink-0">
              {user.avatarUrl ? (
                <img 
                  src={user.avatarUrl} 
                  alt={user.displayName} 
                  className="w-11 h-11 rounded-full object-cover border-2 border-white ring-1 ring-slate-100 shadow-sm"
                />
              ) : (
                <div 
                  className="w-11 h-11 rounded-full bg-slate-900 flex items-center justify-center text-white font-bold text-xs border-2 border-white ring-1 ring-slate-100 shadow-sm"
                  aria-hidden="true"
                >
                  {initials || '?'}
                </div>
              )}
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full shadow-sm" title="Active Session"></div>
            </div>
            <div className="min-w-0 overflow-hidden">
              <p className="text-sm font-bold text-slate-900 truncate tracking-tight leading-tight">
                {user.displayName}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  {user.role} <span className="text-slate-200 font-normal">|</span> {user.tier}
                </p>
                {user.authProvider === 'Session' && (
                  <div className="flex items-center gap-1">
                    <div className="w-1 h-1 rounded-full bg-amber-400 animate-pulse"></div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              {NAVIGATION_ITEMS.find(n => n.id === activeTab)?.label}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-full">
              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
              <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">
                Infrastructure Verified
              </span>
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
