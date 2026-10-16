'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Volume2, Play, Activity, Sparkles } from 'lucide-react';

interface SwitchProfile {
  id: string;
  name: string;
  type: string;
  desc: string;
  baseFreq: number;
  clickFreq: number;
  reverbDuration: number;
  acousticBadge: string;
  actuationForce: string;
}

const SWITCHES: SwitchProfile[] = [
  {
    id: 'linear',
    name: 'Deep Linear Thock',
    type: 'Gateron Oil King / Black Ink',
    desc: 'Perjalanan switch mulus tanpa bump. Memaksimalkan pantulan akustik dinding PBT 1.5mm untuk suara bas tebal yang padat.',
    baseFreq: 85,
    clickFreq: 1100,
    reverbDuration: 0.055,
    acousticBadge: 'Low-Pitch Bass Thock',
    actuationForce: '55g Force',
  },
  {
    id: 'tactile',
    name: 'Snappy Holy Panda',
    type: 'Lubed Tactile Drop',
    desc: 'Bump tactile yang tegas di awal tekanan tombol. Menghasilkan suara "pop" berkarakter tajam dengan resonansi solid tanpa getaran kopong.',
    baseFreq: 145,
    clickFreq: 1900,
    reverbDuration: 0.045,
    acousticBadge: 'Crisp Mid Clack-Thock',
    actuationForce: '67g Force',
  },
  {
    id: 'clicky',
    name: 'Artisan Box Jade',
    type: 'Clickbar Mechanical',
    desc: 'Mekanisme clickbar ganda untuk umpan balik ketikan super memuaskan. Suara klik tajam dan renyah disukai para typist murni.',
    baseFreq: 210,
    clickFreq: 2800,
    reverbDuration: 0.035,
    acousticBadge: 'Sharp High Click',
    actuationForce: '50g Force',
  },
];

export default function AcousticSoundboard() {
  const [activeSwitch, setActiveSwitch] = useState<string>('linear');
  const [isPlaying, setIsPlaying] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const current = SWITCHES.find((s) => s.id === activeSwitch) || SWITCHES[0];

  const playSwitchSound = (sw: SwitchProfile) => {
    try {
      if (!audioCtxRef.current) {
        const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
        audioCtxRef.current = new AudioCtxClass();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const now = ctx.currentTime;
      setIsPlaying(true);

      // 1. Bass Bottom-Out Resonance
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = sw.id === 'linear' ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(sw.baseFreq * 1.5, now);
      osc.frequency.exponentialRampToValueAtTime(sw.baseFreq * 0.4, now + sw.reverbDuration * 1.2);

      gain.gain.setValueAtTime(0.45, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + sw.reverbDuration * 1.5);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + sw.reverbDuration * 1.6);

      // 2. High Frequency Click / Slider Contact
      const clickOsc = ctx.createOscillator();
      const clickGain = ctx.createGain();
      clickOsc.type = 'sine';
      clickOsc.frequency.setValueAtTime(sw.clickFreq, now);
      clickOsc.frequency.exponentialRampToValueAtTime(400, now + 0.025);

      clickGain.gain.setValueAtTime(sw.id === 'clicky' ? 0.4 : 0.18, now);
      clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

      clickOsc.connect(clickGain);
      clickGain.connect(ctx.destination);
      clickOsc.start(now);
      clickOsc.stop(now + 0.035);

      setTimeout(() => setIsPlaying(false), 200);
    } catch {
      // Audio not permitted
    }
  };

  // Oscilloscope Animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let phase = 0;
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.beginPath();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#F95738';

      const width = canvas.width;
      const height = canvas.height;
      const mid = height / 2;
      const amp = isPlaying ? 22 : 4;
      const freq = isPlaying ? 0.06 : 0.02;

      for (let x = 0; x < width; x++) {
        const y = mid + Math.sin(x * freq + phase) * amp * Math.sin((x / width) * Math.PI);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      phase += isPlaying ? 0.25 : 0.04;
      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying]);

  return (
    <div className="w-full clay-card p-6 sm:p-8">
      {/* Header Badge & Title */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="clay-pill inline-flex items-center gap-2 px-3.5 py-1 text-[#F95738] text-xs font-mono font-bold mb-3">
            <Volume2 className="w-3.5 h-3.5" />
            <span>AKUSTIK THOCK SWITCH LAB</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-[#FAF0CA] tracking-tight">
            Uji Resonansi Suara Keycap 1.5mm
          </h3>
          <p className="text-sm text-[#BACAD6] mt-1 max-w-xl">
            Dinding PBT 1.5mm meredam dengung kopong. Dengarkan simulasi ketukan nyata switch lubed dengan profil akustik asli.
          </p>
        </div>

        {/* Live Oscilloscope Waveform */}
        <div className="clay-inset px-4 py-2 flex items-center gap-3 w-full sm:w-auto self-start md:self-auto">
          <Activity className="w-4 h-4 text-[#F95738] animate-pulse" />
          <canvas
            ref={canvasRef}
            width={160}
            height={36}
            className="w-[140px] sm:w-[160px] h-[36px]"
          />
        </div>
      </div>

      {/* Switch Selection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {SWITCHES.map((sw) => {
          const isSelected = activeSwitch === sw.id;
          return (
            <button
              key={sw.id}
              type="button"
              onClick={() => {
                setActiveSwitch(sw.id);
                playSwitchSound(sw);
              }}
              className={`p-5 rounded-3xl text-left transition-all duration-200 relative group cursor-pointer ${
                isSelected
                  ? 'bg-[#134978] border-2 border-[#F95738] shadow-lg text-[#FAF0CA]'
                  : 'clay-card-tint bg-[#0A2C4C] hover:bg-[#103D66] text-[#BACAD6]'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono font-bold text-[#8FAEC7]">{sw.actuationForce}</span>
                <span className={`clay-pill px-2.5 py-0.5 text-[10px] font-mono font-bold ${
                  isSelected ? 'bg-[#08233C] text-[#F95738]' : 'text-[#8FAEC7]'
                }`}>
                  {sw.acousticBadge}
                </span>
              </div>

              <h4 className="text-base font-extrabold text-[#FAF0CA] mb-1 group-hover:text-[#F95738] transition-colors">
                {sw.name}
              </h4>
              <p className="text-xs text-[#F95738] font-mono font-semibold mb-3">{sw.type}</p>
              <p className="text-xs text-[#BACAD6] leading-relaxed">{sw.desc}</p>

              {/* Tap to Play Pill */}
              <div className="mt-4 pt-3 border-t border-[#FAF0CA]/10 flex items-center justify-between text-xs">
                <span className="text-[#BACAD6] font-semibold">Klik untuk Tes</span>
                <div className="clay-btn-primary p-2 flex items-center justify-center">
                  <Play className="w-3.5 h-3.5 fill-current" />
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Switch Interactive Sound Bar */}
      <div className="clay-card-tint p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-[#08233C] border border-[#F95738]/20 flex items-center justify-center text-[#F95738] shadow-sm">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-[#8FAEC7] font-mono font-bold">Switch Terpilih:</div>
            <div className="text-sm sm:text-base font-extrabold text-[#FAF0CA]">
              {current?.name} <span className="text-xs text-[#8FAEC7] font-normal">({current?.acousticBadge})</span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => current && playSwitchSound(current)}
          className="clay-btn-primary w-full sm:w-auto px-6 py-3 font-bold text-xs sm:text-sm active:scale-95 transition flex items-center justify-center gap-2 cursor-pointer"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>Dengarkan Ketukan Switch (Thock!)</span>
        </button>
      </div>
    </div>
  );
}
