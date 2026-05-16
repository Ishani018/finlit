import React, { useState } from 'react';
import { useGame } from './context/GameContext';
import { JOBS } from './data/jobs';
import { INVESTMENTS } from './data/investments';
import { Briefcase, ShoppingBag, ChevronRight, X, Play, Pause, Lock, CheckCircle, AlertCircle } from 'lucide-react';

const GameLayout = () => {
  const {
    balance, turn, nextMonth, netWorth,
    currentJob, currentHousing, dependents,
    applyForJob, buyInvestment,
    isPlaying, setIsPlaying, checkJobRequirements
  } = useGame();

  const [activeMenu, setActiveMenu] = useState(null); // null, 'jobs', 'investments'
  const [selectedJob, setSelectedJob] = useState(null); // For detailed view

  if (!currentHousing || balance === undefined) {
    return <div className="flex h-screen w-full items-center justify-center text-white bg-black font-mono">Loading Simulation...</div>;
  }

  const handleApply = (job) => {
    const result = applyForJob(job);
    if (result.allowed) {
      setSelectedJob(null);
      setActiveMenu(null);
    } else {
      alert(`Cannot apply: ${result.reason}`);
    }
  };

  return (
    <div className="flex flex-col h-screen w-full max-w-md mx-auto bg-black overflow-hidden font-mono select-none border-x border-gray-800 shadow-2xl relative">

      {/* --- TOP HEADER (STATUS) --- */}
      <div className="z-20 pt-6 pb-2 flex justify-center bg-black/80 backdrop-blur-md border-b border-white/10">
        <div className="bg-gray-900/50 rounded-full px-6 py-2 flex items-center gap-6 border border-white/10">
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Balance</span>
            <span className="text-xl font-bold text-green-400">₹{balance?.toLocaleString()}</span>
          </div>
          <div className="h-8 w-px bg-white/10"></div>
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Net Worth</span>
            <span className="text-sm font-bold text-blue-400">₹{netWorth?.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* --- MIDDLE STAGE (THE ROOM) --- */}
      <div className="flex-1 relative bg-gray-900 flex items-center justify-center overflow-hidden">
        <img
          src={currentHousing.image}
          alt={currentHousing.name}
          className="w-full h-full object-contain"
        />

        {/* Date Display (Floating) */}
        <div className="absolute top-4 left-4 bg-black/50 backdrop-blur rounded px-3 py-1 text-xs text-white/80 border border-white/5">
          {turn.month}/{turn.year}
        </div>

        {/* Job Badge (Floating) */}
        <div className="absolute top-4 right-4 bg-black/50 backdrop-blur rounded px-3 py-1 text-xs text-white/80 border border-white/5 flex items-center gap-2">
          <Briefcase size={12} className="text-yellow-500" />
          <span>{currentJob?.name || 'Unemployed'}</span>
        </div>

        {/* Pause Overlay indicator */}
        {!isPlaying && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur px-4 py-1 rounded-full text-[10px] text-white/60 border border-white/10 flex items-center gap-2">
            <Pause size={10} /> PAUSED
          </div>
        )}
      </div>

      {/* --- BOTTOM DOCK (CONTROLS) --- */}
      <div className="z-20 pb-8 pt-4 bg-black/80 backdrop-blur-md border-t border-white/10 flex justify-center items-end gap-6">

        <button
          onClick={() => { setActiveMenu(activeMenu === 'jobs' ? null : 'jobs'); setIsPlaying(false); }}
          className={`flex flex-col items-center gap-1 transition-transform active:scale-95 ${activeMenu === 'jobs' ? 'text-white' : 'text-gray-400 hover:text-gray-200'}`}
        >
          <div className="w-12 h-12 bg-gray-800 rounded-2xl flex items-center justify-center border border-white/10">
            <Briefcase size={20} />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider">Jobs</span>
        </button>

        {/* PLAY / PAUSE HERO BUTTON */}
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className={`group relative flex flex-col items-center justify-center w-20 h-20 rounded-full shadow-lg border-4 border-gray-900 active:scale-95 transition-all -mt-8 ring-4 ring-transparent ${isPlaying ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gradient-to-br from-indigo-600 to-purple-700 hover:ring-indigo-500/30'}`}
        >
          {isPlaying ? (
            <Pause size={32} fill="white" className="text-white" />
          ) : (
            <Play size={32} fill="white" className="text-white ml-1" />
          )}
        </button>

        <button
          onClick={() => { setActiveMenu(activeMenu === 'investments' ? null : 'investments'); setIsPlaying(false); }}
          className={`flex flex-col items-center gap-1 transition-transform active:scale-95 ${activeMenu === 'investments' ? 'text-white' : 'text-gray-400 hover:text-gray-200'}`}
        >
          <div className="w-12 h-12 bg-gray-800 rounded-2xl flex items-center justify-center border border-white/10">
            <ShoppingBag size={20} />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider">Shop</span>
        </button>

      </div>

      {/* --- MENUS (HALF-SCREEN SHEETS) --- */}
      {activeMenu && (
        <div className="absolute inset-x-0 bottom-0 top-[30%] bg-black/95 backdrop-blur-xl rounded-t-3xl border-t border-white/10 shadow-2xl flex flex-col overflow-hidden animate-slide-up z-30">

          {/* Menu Header */}
          <div className="flex justify-between items-center p-6 border-b border-white/10 bg-white/5">
            <h2 className="text-lg font-bold text-white uppercase tracking-widest flex items-center gap-2">
              {activeMenu === 'jobs' && <><Briefcase size={18} /> Job Board</>}
              {activeMenu === 'investments' && <><ShoppingBag size={18} /> Real Estate</>}
            </h2>
            <button onClick={() => setActiveMenu(null)} className="p-2 rounded-full hover:bg-white/10">
              <X size={24} className="text-gray-400" />
            </button>
          </div>

          {/* Menu Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-10 scrollbar-hide">

            {/* JOBS LIST */}
            {activeMenu === 'jobs' && !selectedJob && JOBS.map(job => {
              const reqStatus = checkJobRequirements(job);
              const isLocked = !reqStatus.allowed;

              return (
                <div
                  key={job.id}
                  onClick={() => setSelectedJob(job)}
                  className={`p-4 rounded-xl border flex items-center gap-4 transition-all cursor-pointer ${isLocked ? 'bg-white/5 border-white/5 opacity-70 grayscale' : 'bg-white/10 border-white/10 hover:bg-white/20'}`}
                >
                  <img src={job.image} className="w-12 h-12 rounded-lg object-cover bg-black/50" />
                  <div className="flex-1">
                    <h3 className="font-bold text-white flex items-center gap-2">
                      {job.name}
                      {isLocked && <Lock size={12} className="text-gray-500" />}
                    </h3>
                    <div className="flex gap-2 mt-1">
                      <span className="text-xs font-bold text-green-400 bg-green-400/10 px-2 py-0.5 rounded">₹{job.salary.toLocaleString()}/mo</span>
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-gray-500" />
                </div>
              );
            })}

            {/* INVESTMENTS LIST (Shop) */}
            {activeMenu === 'investments' && INVESTMENTS.map(inv => (
              <div key={inv.id} className="bg-white/5 rounded-xl border border-white/5 overflow-hidden group">
                <div className="h-40 w-full relative">
                  <img src={inv.image} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90"></div>
                  <div className="absolute bottom-3 left-4">
                    <h3 className="font-bold text-white text-lg">{inv.name}</h3>
                    <span className="text-xs text-gray-300 bg-black/50 px-2 py-1 rounded">{inv.type === 'housing' ? 'Housing' : 'Business'}</span>
                  </div>
                </div>
                <div className="p-4 flex justify-between items-center bg-white/5">
                  <div>
                    <div className="text-xl font-bold text-yellow-500">₹{inv.cost.toLocaleString()}</div>
                    <div className="text-xs text-gray-400">Maint: ₹{inv.maintenance.toLocaleString()}/mo</div>
                  </div>
                  <button
                    onClick={() => buyInvestment(inv)}
                    className="bg-green-600 hover:bg-green-500 text-white px-6 py-2 rounded-lg text-sm font-bold uppercase tracking-wider shadow-lg"
                  >
                    Buy
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- DETAILED JOB VIEW MODAL --- */}
      {selectedJob && (
        <div className="absolute inset-x-0 bottom-0 top-[10%] bg-gray-900 rounded-t-3xl border-t border-white/10 shadow-[0_-20px_60px_rgba(0,0,0,0.9)] z-40 flex flex-col overflow-hidden animate-slide-up">

          {/* Header Image */}
          <div className="h-48 w-full relative shrink-0">
            <img src={selectedJob.office_image || selectedJob.image} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent"></div>
            <button
              onClick={() => setSelectedJob(null)}
              className="absolute top-4 right-4 bg-black/50 p-2 rounded-full text-white hover:bg-black/80"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            <h2 className="text-3xl font-bold text-white mb-1">{selectedJob.name}</h2>
            <span className="text-indigo-400 text-sm font-bold uppercase tracking-wider mb-6 block">{selectedJob.type}</span>

            <div className="bg-white/5 p-4 rounded-xl border border-white/5 mb-6">
              <div className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-1">Monthly Salary</div>
              <div className="text-2xl font-bold text-green-400">₹{selectedJob.salary.toLocaleString()}</div>
            </div>

            <div className="mb-6">
              <h3 className="text-white font-bold mb-3 flex items-center gap-2"><CheckCircle size={16} /> Requirements</h3>
              <div className="space-y-3">
                {/* Net Worth Check */}
                <div className={`p-3 rounded-lg border flex justify-between items-center ${netWorth >= selectedJob.req_net_worth ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                  <span className="text-sm font-bold">Net Worth &gt; ₹{selectedJob.req_net_worth.toLocaleString()}</span>
                  {netWorth >= selectedJob.req_net_worth ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                </div>
                {/* Degrees Check */}
                {selectedJob.req_degrees.map((deg, i) => (
                  <div key={i} className="p-3 rounded-lg border border-red-500/20 bg-red-500/10 text-red-400 flex justify-between items-center">
                    <span className="text-sm font-bold">{deg}</span>
                    <AlertCircle size={16} />
                  </div>
                ))}
                {selectedJob.req_degrees.length === 0 && selectedJob.req_net_worth === 0 && (
                  <div className="text-sm text-gray-400 italic">No entry requirements.</div>
                )}
              </div>
            </div>

            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              {selectedJob.description}
            </p>
          </div>

          {/* Action Bar */}
          <div className="p-6 border-t border-white/10 bg-gray-900">
            <button
              onClick={() => handleApply(selectedJob)}
              disabled={!checkJobRequirements(selectedJob).allowed}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-bold py-4 rounded-xl text-lg uppercase tracking-widest transition-all"
            >
              {checkJobRequirements(selectedJob).allowed ? 'Apply Now' : 'Locked'}
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default GameLayout;
