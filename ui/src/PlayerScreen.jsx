import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Pause, ArrowLeft } from 'lucide-react';
import { findMediaById } from './mediaData';

export default function PlayerScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const media = findMediaById(id);

  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [controlFocus, setControlFocus] = useState(0); // 0: Play/Pause, 1: Back

  const playerRef = useRef(null);
  const controlsTimeoutRef = useRef(null);

  const resetControlsTimer = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 4000);
  };

  useEffect(() => {
    resetControlsTimer();

    const handleKeyDown = (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter', ' ', 'Escape', 'Backspace'].includes(e.key)) {
        e.preventDefault();
        e.stopPropagation();
      }

      resetControlsTimer();

      switch (e.key) {
        case 'ArrowLeft':
          if (playerRef.current) {
            playerRef.current.currentTime = Math.max(0, playerRef.current.currentTime - 10);
          }
          break;

        case 'ArrowRight':
          if (playerRef.current) {
            playerRef.current.currentTime = Math.min(duration, playerRef.current.currentTime + 10);
          }
          break;

        case 'ArrowUp':
          setControlFocus(1); // focus Back button
          break;

        case 'ArrowDown':
          setControlFocus(0); // focus Play/Pause button
          break;

        case 'Enter':
        case 'MediaPlayPause':
          if (controlFocus === 1) {
            navigate(-1);
          } else {
            toggleVideo();
          }
          break;

        case 'Escape':
        case 'Backspace':
          navigate(-1);
          break;

        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown, { capture: true });
    return () => window.removeEventListener('keydown', handleKeyDown, { capture: true });
  }, [controlFocus, isPlaying, duration, navigate]);

  const toggleVideo = () => {
    if (!playerRef.current) return;
    if (playerRef.current.paused) {
      playerRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      playerRef.current.pause();
      setIsPlaying(false);
    }
  };

  const formatTime = (secs) => {
    const s = Math.floor(secs || 0);
    const m = Math.floor(s / 60);
    const remainder = s % 60;
    return `${String(m).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="relative w-screen h-screen bg-black overflow-hidden">
      {/* Fullscreen Video Stream */}
      <video
        ref={playerRef}
        src={media.videoUrl}
        className="w-full h-full object-contain bg-black"
        autoPlay
        playsInline
        onTimeUpdate={() => {
          if (playerRef.current) {
            setCurrentTime(playerRef.current.currentTime);
          }
        }}
        onLoadedMetadata={() => {
          if (playerRef.current) {
            setDuration(playerRef.current.duration);
            playerRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
          }
        }}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      {/* TV Player HUD Overlay */}
      <div
        className={`absolute inset-0 flex flex-col justify-between py-10 px-15 bg-gradient-to-b from-black/85 via-transparent to-black/90 transition-opacity duration-300 ${
          showControls ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <button
            className={`flex items-center gap-3 bg-white/12 text-white py-3 px-5 rounded-xl text-sm font-bold cursor-pointer transition-all duration-200 border-2 ${
              controlFocus === 1
                ? 'bg-[#3ea6ff] text-black border-white scale-105 shadow-[0_0_20px_rgba(62,166,255,0.8)]'
                : 'border-transparent'
            }`}
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={20} />
            <span>Back to Home (Press Up)</span>
          </button>
          <div className="flex items-center gap-3.5">
            <span className="text-xl font-extrabold text-white">{media.title}</span>
            <span className="bg-[#3ea6ff] text-black px-2.5 py-1 rounded-md text-xs font-black">{media.badge}</span>
          </div>
        </div>

        {/* Bottom Player Controls */}
        <div className="flex flex-col gap-5">
          {/* Scrubber Progress Bar */}
          <div className="flex items-center gap-4.5">
            <span className="text-sm text-neutral-300 font-bold w-12 text-center">{formatTime(currentTime)}</span>
            <div className="flex-1 h-1.5 bg-white/25 rounded-full overflow-hidden">
              <div className="h-full bg-[#3ea6ff] rounded-full" style={{ width: `${progressPercent}%` }} />
            </div>
            <span className="text-sm text-neutral-300 font-bold w-12 text-center">{formatTime(duration)}</span>
          </div>

          {/* Play / Pause button */}
          <div className="flex items-center justify-between">
            <button
              className={`flex items-center gap-3 bg-white/18 text-white py-3 px-7 rounded-xl cursor-pointer transition-all duration-200 border-2 ${
                controlFocus === 0
                  ? 'bg-[#3ea6ff] text-black border-white scale-108 shadow-[0_0_24px_rgba(62,166,255,0.9)]'
                  : 'border-transparent'
              }`}
              onClick={toggleVideo}
            >
              {isPlaying ? <Pause size={28} /> : <Play size={28} fill="#ffffff" />}
              <span className="text-base font-extrabold">{isPlaying ? 'Pause' : 'Play'}</span>
            </button>
            <span className="text-sm text-neutral-400 font-semibold">Press ◀ / ▶ to seek 10s • Enter to toggle</span>
          </div>
        </div>
      </div>
    </div>
  );
}
