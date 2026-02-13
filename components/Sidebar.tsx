
import React from 'react';
import { ChatSession } from '../types';

interface SidebarProps {
  sessions: ChatSession[];
  currentSessionId: string | null;
  isOpen: boolean;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession: (id: string, e: React.MouseEvent) => void;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  sessions,
  currentSessionId,
  isOpen,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  onToggle
}) => {
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
          onClick={onToggle}
        />
      )}

      <aside className={`fixed md:static inset-y-0 left-0 z-50 w-72 bg-slate-900 border-r border-slate-800 flex flex-col transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full md:hidden'}`}>
        <div className="p-4 flex flex-col h-full">
          <button
            onClick={onNewChat}
            className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-slate-200 transition-all mb-4 group"
          >
            <i className="fas fa-plus text-xs group-hover:rotate-90 transition-transform"></i>
            <span className="font-semibold text-sm">New Orbit</span>
          </button>

          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2">
            <h3 className="text-[10px] uppercase tracking-widest text-slate-500 font-bold px-2 mb-2">History</h3>
            {sessions.length === 0 ? (
              <p className="text-xs text-slate-600 italic px-2">No past transmissions found.</p>
            ) : (
              sessions.sort((a, b) => b.updatedAt - a.updatedAt).map((session) => (
                <div
                  key={session.id}
                  onClick={() => onSelectSession(session.id)}
                  className={`group relative flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                    currentSessionId === session.id 
                      ? 'bg-slate-800 text-slate-100 border border-slate-700' 
                      : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-300'
                  }`}
                >
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <i className={`fas ${currentSessionId === session.id ? 'fa-comment-dots text-blue-400' : 'fa-comment text-slate-600'} text-xs`}></i>
                    <span className="text-sm truncate pr-6">{session.title}</span>
                  </div>
                  
                  <button
                    onClick={(e) => onDeleteSession(session.id, e)}
                    className="absolute right-2 opacity-0 group-hover:opacity-100 p-2 hover:text-red-400 transition-all text-slate-500"
                    title="Delete Chat"
                  >
                    <i className="fas fa-trash-alt text-[10px]"></i>
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="mt-auto pt-4 border-t border-slate-800">
            <div className="flex items-center space-x-3 px-2 py-2">
               <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-500">
                 <i className="fas fa-user-astronaut"></i>
               </div>
               <div className="flex flex-col">
                 <span className="text-xs text-slate-300 font-medium">Earth Observer</span>
                 <span className="text-[10px] text-slate-600 uppercase">Standard Access</span>
               </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
