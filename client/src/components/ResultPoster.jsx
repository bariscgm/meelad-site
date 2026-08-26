import React, { useRef } from 'react';
import { toPng } from 'html-to-image';
import { Download, X } from 'lucide-react';
import Swal from 'sweetalert2';

export default function ResultPoster({ result, candidates, onClose }) {
  const posterRef = useRef(null);
  const [scale, setScale] = React.useState(0.4444);

  React.useEffect(() => {
    const updateScale = () => {
      const maxWidth = Math.min(window.innerWidth - 32, 480); // 32px for padding
      setScale(maxWidth / 1080);
    };
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  // Generate a consistent pseudo-random hue rotation based on program ID/name
  const getHueRotation = () => {
    if (!result?.program?._id) return 0;
    let hash = 0;
    for (let i = 0; i < result.program._id.length; i++) {
      hash = result.program._id.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash % 360); // 0 to 360 degrees
  };
  const hueRotate = getHueRotation();

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
    let displayName = winner.name;
    
    if (result.program?.type === 'Group' && candidates && candidates.length > 0) {
      const groupMembers = candidates.filter(c => {
        if (c.category?.toLowerCase() !== result.program?.category?.toLowerCase()) return false;
        if (result.program?.gender && result.program.gender !== 'General' && c.gender?.toLowerCase() !== result.program.gender.toLowerCase()) return false;
        const progId = result.program?._id;
        
        if (winner.chestNo && c.programCodes?.[progId] === winner.chestNo) return true;
        
        if (!winner.chestNo) {
          const progName = result.program?.name;
          const assignedGroup = c.groupAssignments?.[progId] || c.groupAssignments?.[progName];
          if (assignedGroup && assignedGroup === winner.name) return true;
          
          const wTeamId = winner.team?._id || winner.team;
          const cTeamId = c.team?._id || c.team;
          const wTeamName = winner.team?.name;
          
          if (winner.name === wTeamName && wTeamId === cTeamId && c.programs?.includes(progName)) return true;
        }
        return false;
      }).map(c => c.name);
      
      if (groupMembers.length > 0) {
        displayName = groupMembers.join(', ');
      }
    }

    return (
      <div key={winner.chestNo || winner.name} className="flex flex-col items-center bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/30 shadow-2xl relative mt-8 min-w-[280px] max-w-[320px]">
        <div className={`absolute -top-8 w-16 h-16 rounded-full ${badgeColor} flex items-center justify-center font-black text-white shadow-xl text-2xl border-4 border-slate-900`}>
          {winner.position}
        </div>
        <h3 className="text-[#facc15] font-black text-lg uppercase tracking-[0.2em] mt-6 mb-3 drop-shadow-md text-center">{title}</h3>
        
        <p className="text-white font-black text-3xl text-center leading-tight drop-shadow-lg break-words w-full">{winner.name}</p>
        
        {displayName !== winner.name && (
          <p className="text-white/80 font-semibold text-sm text-center leading-tight drop-shadow-md break-words w-full mt-1.5">{displayName}</p>
        )}
        
        <p className="text-teal-100 font-semibold text-lg mt-2 drop-shadow-md text-center break-words w-full">{winner.team?.name}</p>
        <div className="flex gap-3 mt-5">
          {winner.grade && winner.grade !== 'None' && (
            <span className="px-4 py-1.5 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-sm font-bold text-white shadow-md">Grade {winner.grade}</span>
          )}
          <span className="px-4 py-1.5 bg-teal-600/80 backdrop-blur-sm border border-teal-400/50 rounded-lg text-sm font-bold text-white shadow-md">{pts} pts</span>
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

      {/* Poster Element - 1080x1080 (Instagram Post ratio) */}
      <div 
        className="overflow-hidden rounded-xl shadow-2xl bg-black relative flex-shrink-0" 
        style={{ width: Math.round(1080 * scale), height: Math.round(1080 * scale) }}
      >
        <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}>
          <div 
            ref={posterRef} 
            className="w-[1080px] h-[1080px] relative overflow-hidden flex flex-col items-center pt-[200px] pb-[100px] px-[60px] bg-black"
          >
          {/* Background Template */}
          <img 
            src="/poster-bg.png" 
            alt="Poster Background" 
            className="absolute inset-0 w-full h-full object-fill z-0"
            style={{ filter: `hue-rotate(${hueRotate}deg)` }}
            onError={(e) => {
              // Fallback gradient if image not found
              e.target.style.display = 'none';
              e.target.parentElement.style.background = 'linear-gradient(to bottom right, #0f172a, #064e3b, #0f172a)';
            }}
          />

          <div className="relative z-10 flex flex-col h-full w-full">
            {/* Header / Program Name */}
            <div className="text-center mb-10 w-full px-4">
              <h1 className="text-5xl font-black text-white leading-tight drop-shadow-2xl mb-4 break-words">
                {result.program?.name}
              </h1>
              <div className="flex items-center justify-center gap-4">
                <span className="px-6 py-2.5 bg-white/10 backdrop-blur-md rounded-full text-white text-xl font-bold border border-white/20 shadow-lg">
                  {result.program?.category}
                </span>
                <span className="px-6 py-2.5 bg-white/10 backdrop-blur-md rounded-full text-white text-xl font-bold border border-white/20 shadow-lg">
                  {result.program?.type}
                </span>
              </div>
            </div>

            {/* Winners */}
            <div className="flex-1 flex flex-col items-center justify-center gap-6 w-full mt-2 scale-95">
              
              {/* 1st Place */}
              {firstPlace.length > 0 && (
                <div className="flex flex-wrap justify-center gap-4 w-full">
                  {firstPlace.map(w => renderWinner(w, 'bg-gradient-to-b from-[#fef08a] to-[#eab308]', 'First Prize'))}
                </div>
              )}

              {/* 2nd & 3rd Place row */}
              <div className="flex flex-wrap justify-center gap-6 w-full mt-2">
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

            {/* Empty Footer Space for Template text */}
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
