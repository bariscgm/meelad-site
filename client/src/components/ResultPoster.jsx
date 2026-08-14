import React, { useRef } from 'react';
import { toPng } from 'html-to-image';
import { Download, X } from 'lucide-react';
import Swal from 'sweetalert2';

export default function ResultPoster({ result, onClose }) {
  const posterRef = useRef(null);

  const calculatePoints = (type, position, grade) => {
    let pts = 0;
    const pos = Number(position);
    if (type === 'Individual') {
      if (pos === 1) pts += 5;
      else if (pos === 2) pts += 3;
      else if (pos === 3) pts += 1;
      if (grade === 'A') pts += 5;
      else if (grade === 'B') pts += 3;
      else if (grade === 'C') pts += 1;
    } else if (type === 'Group') {
      if (pos === 1) pts += 10;
      else if (pos === 2) pts += 5;
      else if (pos === 3) pts += 3;
      if (grade === 'A') pts += 10;
      else if (grade === 'B') pts += 5;
      else if (grade === 'C') pts += 3;
    }
    return pts;
  };

  const handleDownload = async () => {
    if (!posterRef.current) return;
    try {
      const dataUrl = await toPng(posterRef.current, { cacheBust: true, pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = `${result.program?.name || 'result'}-poster.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Failed to generate poster', 'error');
    }
  };

  // Group winners by position
  const getWinnersByPosition = (pos) => {
    return result.winners?.filter(w => w.position === pos) || [];
  };

  const firstPlace = getWinnersByPosition(1);
  const secondPlace = getWinnersByPosition(2);
  const thirdPlace = getWinnersByPosition(3);

  const renderWinner = (winner, badgeColor, title) => {
    const pts = winner.points || calculatePoints(result.program?.type, winner.position, winner.grade);
    return (
      <div key={winner.chestNo || winner.name} className="flex flex-col items-center bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/20 shadow-xl relative mt-4 min-w-[200px]">
        <div className={`absolute -top-6 w-12 h-12 rounded-full ${badgeColor} flex items-center justify-center font-bold text-white shadow-lg text-lg border-4 border-[#1e1b4b]`}>
          {winner.position}
        </div>
        <h3 className="text-[#facc15] font-black text-sm uppercase tracking-widest mt-4 mb-2">{title}</h3>
        <p className="text-white font-bold text-xl text-center leading-tight">{winner.name}</p>
        <p className="text-purple-200 text-sm mt-1">{winner.team?.name}</p>
        <div className="flex gap-2 mt-3">
          {winner.grade && winner.grade !== 'None' && (
            <span className="px-2 py-0.5 bg-white/20 rounded text-xs font-semibold text-white">Grade {winner.grade}</span>
          )}
          <span className="px-2 py-0.5 bg-purple-500/50 rounded text-xs font-semibold text-white">{pts} pts</span>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
      {/* Controls */}
      <div className="flex justify-between w-full max-w-[800px] mb-4">
        <h2 className="text-white font-bold text-xl">Poster Preview</h2>
        <div className="flex gap-3">
          <button onClick={handleDownload} className="flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-xl font-bold transition shadow-lg">
            <Download size={18} />
            Download
          </button>
          <button onClick={onClose} className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-xl font-bold transition shadow-lg">
            <X size={18} />
            Close
          </button>
        </div>
      </div>

      {/* Poster Element - Fixed Size for consistent rendering (e.g., 1080x1080 square for Instagram) */}
      <div className="overflow-hidden rounded-xl shadow-2xl bg-black border-4 border-slate-700 w-[600px] h-[600px] relative flex-shrink-0 origin-top" style={{ transform: 'scale(0.85)' }}>
        <div 
          ref={posterRef} 
          className="w-[800px] h-[800px] bg-gradient-to-br from-[#1e1b4b] via-[#4c1d95] to-[#1e1b4b] relative overflow-hidden flex flex-col p-12 origin-top-left"
          style={{ transform: 'scale(0.75)' }} // Scale down visually so it fits inside the 600x600 preview, but render as 800x800
        >
          {/* Decorative Elements */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-500/20 rounded-full blur-[100px]"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-teal-500/20 rounded-full blur-[120px]"></div>
          </div>

          <div className="relative z-10 flex flex-col h-full">
            {/* Header */}
            <div className="text-center mb-10">
              <p className="text-teal-400 font-bold uppercase tracking-[0.3em] text-sm mb-2">Meelad Fest Official Results</p>
              <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-100 to-white leading-tight">
                {result.program?.name}
              </h1>
              <div className="flex items-center justify-center gap-3 mt-4">
                <span className="px-4 py-1.5 bg-white/10 rounded-full text-white text-sm font-semibold border border-white/10 shadow-inner">
                  {result.program?.category}
                </span>
                <span className="px-4 py-1.5 bg-white/10 rounded-full text-white text-sm font-semibold border border-white/10 shadow-inner">
                  {result.program?.type}
                </span>
              </div>
            </div>

            {/* Winners */}
            <div className="flex-1 flex flex-col items-center justify-center gap-8 w-full mt-4">
              
              {/* 1st Place */}
              {firstPlace.length > 0 && (
                <div className="flex flex-wrap justify-center gap-6 w-full">
                  {firstPlace.map(w => renderWinner(w, 'bg-gradient-to-b from-[#fef08a] to-[#eab308]', 'First Prize'))}
                </div>
              )}

              {/* 2nd & 3rd Place row */}
              <div className="flex flex-wrap justify-center gap-8 w-full mt-2">
                {secondPlace.length > 0 && (
                  <div className="flex gap-4">
                    {secondPlace.map(w => renderWinner(w, 'bg-gradient-to-b from-[#e2e8f0] to-[#94a3b8]', 'Second Prize'))}
                  </div>
                )}
                {thirdPlace.length > 0 && (
                  <div className="flex gap-4">
                    {thirdPlace.map(w => renderWinner(w, 'bg-gradient-to-b from-[#fed7aa] to-[#f97316]', 'Third Prize'))}
                  </div>
                )}
              </div>

            </div>

            {/* Footer */}
            <div className="mt-auto text-center border-t border-white/10 pt-6 flex justify-between items-end">
              <div className="text-left">
                <p className="text-purple-300/80 text-xs font-bold uppercase tracking-widest">Judged By</p>
                <p className="text-white font-medium">{result.judge?.name || 'Official Jury'}</p>
              </div>
              <div className="text-right">
                <p className="text-white/40 text-xs font-medium">Generated via Admin Portal</p>
                <h2 className="text-xl font-bold text-white/80 italic mt-1">Meelad Fest '26</h2>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
