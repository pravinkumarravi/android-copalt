import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play } from 'lucide-react';
import { CHANNELS, ROWS_DATA } from './mediaData';

const CARD_WIDTH = 260;
const CARD_GAP = 28;
const ROW_HEIGHT = 280;

export default function HomeScreen() {
  const navigate = useNavigate();

  // Focus state: 0 = sidebar, 1 = card rail
  const [focusZone, setFocusZone] = useState(1);
  const [sidebarIndex, setSidebarIndex] = useState(0);
  const [rowIndex, setRowIndex] = useState(0);
  const [rowColMemory, setRowColMemory] = useState({ 0: 0, 1: 0 });

  const currentCol = rowColMemory[rowIndex] || 0;
  const currentHighlight = ROWS_DATA[rowIndex].items[currentCol];
  const isSidebarOpen = focusZone === 0;

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter', ' '].includes(e.key)) {
        e.preventDefault();
        e.stopPropagation();
      }

      switch (e.key) {
        case 'ArrowLeft':
          if (focusZone === 1) {
            if (currentCol > 0) {
              setRowColMemory((prev) => ({
                ...prev,
                [rowIndex]: currentCol - 1,
              }));
            } else {
              setFocusZone(0);
            }
          }
          break;

        case 'ArrowRight':
          if (focusZone === 0) {
            setFocusZone(1);
          } else if (focusZone === 1) {
            const maxCols = ROWS_DATA[rowIndex].items.length - 1;
            if (currentCol < maxCols) {
              setRowColMemory((prev) => ({
                ...prev,
                [rowIndex]: currentCol + 1,
              }));
            }
          }
          break;

        case 'ArrowUp':
          if (focusZone === 0) {
            setSidebarIndex((prev) => Math.max(0, prev - 1));
          } else if (focusZone === 1) {
            if (rowIndex > 0) {
              setRowIndex((prev) => prev - 1);
            }
          }
          break;

        case 'ArrowDown':
          if (focusZone === 0) {
            setSidebarIndex((prev) => Math.min(CHANNELS.length - 1, prev + 1));
          } else if (focusZone === 1) {
            if (rowIndex < ROWS_DATA.length - 1) {
              setRowIndex((prev) => prev + 1);
            }
          }
          break;

        case 'Enter':
          if (focusZone === 1) {
            const item = ROWS_DATA[rowIndex].items[currentCol];
            navigate(`/player/${item.id}`);
          }
          break;

        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown, { capture: true });
    return () => window.removeEventListener('keydown', handleKeyDown, { capture: true });
  }, [focusZone, sidebarIndex, rowIndex, currentCol, navigate]);

  const computeRowTransform = (rIdx) => {
    const cIdx = rowColMemory[rIdx] || 0;
    const shiftX = cIdx * (CARD_WIDTH + CARD_GAP);
    return `translateX(-${shiftX}px)`;
  };

  const computeContainerTransform = () => {
    const shiftY = rowIndex * ROW_HEIGHT;
    return `translateY(-${shiftY}px)`;
  };

  return (
    <div className="relative w-screen h-screen bg-[#0f0f0f] text-white overflow-hidden">
      <div className="relative flex w-full h-full">
        {/* Collapsible Left TV Sidebar */}
        <aside
          className={`flex flex-col py-9 px-3.5 border-r border-white/10 transition-all duration-300 z-10 ${
            isSidebarOpen ? 'w-[250px] bg-[#0f0f0f]/98 backdrop-blur-md' : 'w-[76px] bg-[#0f0f0f]/50'
          }`}
        >
          <div className="flex items-center gap-3 pl-3.5 mb-9">
            <span className="text-[#3ea6ff] text-2xl">●</span>
            {isSidebarOpen && <span className="text-lg font-black tracking-wider text-white">COBALT TV</span>}
          </div>

          <nav className="flex flex-col gap-2.5">
            {CHANNELS.map((ch, idx) => {
              const isFocused = focusZone === 0 && sidebarIndex === idx;
              return (
                <div
                  key={ch.id}
                  className={`flex items-center gap-3.5 p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                    isSidebarOpen ? 'justify-start' : 'justify-center'
                  } ${
                    isFocused
                      ? 'bg-white/15 scale-105 shadow-[0_0_16px_rgba(255,255,255,0.2)]'
                      : 'hover:bg-white/5'
                  }`}
                >
                  <span className="text-[#3ea6ff] font-black text-base">#</span>
                  {isSidebarOpen && (
                    <span
                      className={`text-[15px] font-bold whitespace-nowrap ${
                        isFocused ? 'text-white' : 'text-neutral-400'
                      }`}
                    >
                      {ch.title}
                    </span>
                  )}
                </div>
              );
            })}
          </nav>
        </aside>

        {/* Content Canvas */}
        <div className="flex-1 flex flex-col pt-9 pl-14 overflow-visible">
          {/* Spotlight Meta Header */}
          <header className="max-w-[700px] mb-6 flex flex-col gap-2">
            <div className="flex items-center gap-2.5">
              <span className="bg-[#3ea6ff] text-[#0f0f0f] text-[11px] font-black px-2 py-0.5 rounded tracking-wide">
                {currentHighlight.badge}
              </span>
              <span className="text-[13px] text-neutral-400 font-semibold">{currentHighlight.duration}</span>
            </div>
            <h1 className="text-4xl font-black leading-tight drop-shadow-md">{currentHighlight.title}</h1>
            <p className="text-[15px] text-neutral-300 leading-normal">{currentHighlight.subtitle}</p>
            <div className="inline-flex items-center gap-2 bg-[#272727] px-3.5 py-1.5 rounded-full text-xs text-neutral-200 font-bold mt-1 w-fit">
              <Play size={13} fill="#ffffff" />
              <span>Press ENTER to open dedicated player</span>
            </div>
          </header>

          {/* Leanback Vertical Container */}
          <div className="flex-1 overflow-visible relative">
            <div
              className="flex flex-col gap-5 transition-transform duration-350 ease-out will-change-transform"
              style={{ transform: computeContainerTransform() }}
            >
              {ROWS_DATA.map((row, rIdx) => {
                const isCurrentRow = rowIndex === rIdx;

                return (
                  <div key={row.id} className="h-[280px] flex flex-col gap-3">
                    <h2
                      className={`text-lg font-extrabold tracking-wide transition-colors duration-250 ${
                        isCurrentRow && focusZone === 1 ? 'text-white' : 'text-neutral-500'
                      }`}
                    >
                      {row.title}
                    </h2>

                    {/* Horizontal Card Track */}
                    <div className="w-full overflow-visible">
                      <div
                        className="flex gap-7 transition-transform duration-350 ease-out will-change-transform"
                        style={{ transform: computeRowTransform(rIdx) }}
                      >
                        {row.items.map((card, cIdx) => {
                          const isCardFocused =
                            focusZone === 1 && rowIndex === rIdx && currentCol === cIdx;

                          return (
                            <div
                              key={card.id}
                              className={`flex-none w-[260px] bg-[#1f1f1f] rounded-xl overflow-hidden cursor-pointer origin-left transition-all duration-300 ease-out border-3 ${
                                isCardFocused
                                  ? 'scale-108 border-white shadow-[0_12px_30px_rgba(0,0,0,0.8),0_0_20px_rgba(255,255,255,0.4)] z-10'
                                  : 'border-transparent'
                              }`}
                              onClick={() => navigate(`/player/${card.id}`)}
                            >
                              <div className="relative w-full h-[146px] bg-[#181818]">
                                <img
                                  src={card.thumb}
                                  alt={card.title}
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute bottom-2.5 right-2.5 bg-black/70 rounded-full p-2 flex items-center justify-center">
                                  <Play size={16} fill="#ffffff" />
                                </div>
                              </div>
                              <div className="p-3">
                                <p className="text-sm font-extrabold truncate">{card.title}</p>
                                <span className="text-xs text-neutral-400 font-semibold mt-0.5 block">{card.duration}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
