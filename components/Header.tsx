
import React from 'react';

interface HeaderProps {
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
}

const Header: React.FC<HeaderProps> = ({ onToggleSidebar, isSidebarOpen }) => {
  return (
    <header className="flex items-center justify-between border-b border-slate-800 pb-4">
      <div className="flex items-center space-x-3">
        <button 
          onClick={onToggleSidebar}
          className="p-2 -ml-2 text-slate-400 hover:text-slate-100 transition-colors md:hidden"
        >
          <i className={`fas ${isSidebarOpen ? 'fa-times' : 'fa-bars'} text-lg`}></i>
        </button>
        <button 
          onClick={onToggleSidebar}
          className="hidden md:block p-2 -ml-2 text-slate-400 hover:text-slate-100 transition-colors"
        >
          <i className={`fas ${isSidebarOpen ? 'fa-times' : 'fa-bars'} text-lg`}></i>
        </button>
        <div className="relative">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-tr from-slate-400 via-slate-200 to-white shadow-[0_0_15px_rgba(255,255,255,0.3)]"></div>
          <div className="absolute top-0 right-0 w-3 h-3 bg-blue-500 rounded-full border-2 border-slate-950 animate-pulse"></div>
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-100 to-slate-400">
            Luna
          </h1>
          <p className="text-[10px] text-blue-400 uppercase tracking-widest font-bold">Status: Full Moon</p>
        </div>
      </div>
      <div className="hidden sm:flex flex-col items-end text-right">
        {/* Empty or can add other metadata here if needed later */}
      </div>
    </header>
  );
};

export default Header;
