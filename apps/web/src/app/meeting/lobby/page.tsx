'use client';
import { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { Icon } from '@/components/Icons';
import { Centered } from '@/components/Centered';

function LobbyInner() {
  const search = useSearchParams();
  const code = (search.get('code') ?? '').toUpperCase();
  const router = useRouter();

  const [meeting, setMeeting] = useState<any>(null);
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [micOn, setMicOn] = useState(false);
  const [camOn, setCamOn] = useState(false);
  const [micLevel, setMicLevel] = useState(0);
  const [lowBandwidth, setLowBandwidth] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!code) { setError('No meeting code in the link.'); return; }
    api.getMeeting(code)
      .then((m) => { setMeeting(m); setLowBandwidth(!!m.lowBandwidthDefault); })
      .catch((e) => setError(e.message));
  }, [code]);

  async function startMedia(video: boolean) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video });
      streamRef.current?.getTracks().forEach((tk) => tk.stop());
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = video ? stream : null;
      setMicOn(true);
      setCamOn(video);
      setError(null);

      if (!audioCtxRef.current) {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioCtxRef.current = ctx;
        const src = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        src.connect(analyser);
        const data = new Uint8Array(analyser.frequencyBinCount);
        const tick = () => {
          analyser.getByteFrequencyData(data);
          const avg = data.reduce((a, b) => a + b, 0) / data.length;
          setMicLevel(Math.min(100, Math.round((avg / 128) * 100)));
          rafRef.current = requestAnimationFrame(tick);
        };
        tick();
      }
    } catch {
      setError('Could not access your microphone or camera. Allow access in the browser address bar and try again.');
    }
  }

  function stopMedia() {
    streamRef.current?.getTracks().forEach((tk) => tk.stop());
    streamRef.current = null;
    setMicOn(false);
    setCamOn(false);
  }

  useEffect(() => () => {
    stopMedia();
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    audioCtxRef.current?.close();
  }, []);

  async function joinNow() {
    if (!displayName.trim()) { setError('Please enter your name to join.'); return; }
    try {
      const tk = await api.getToken(code, displayName.trim());
      sessionStorage.setItem(
        `brigether:join:${code}`,
        JSON.stringify({ ...tk, displayName: displayName.trim(), lowBandwidth }),
      );
      stopMedia();
      router.push(`/meeting/room?code=${code}`);
    } catch (e: any) { setError(e.message); }
  }

  return (
    <Centered width="max-w-2xl">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-extrabold tracking-tight">{meeting ? meeting.title : 'Ready to join?'}</h1>
        <p className="text-sm text-ink/50 mt-1 font-mono tracking-widest">{code}</p>
      </div>

      <div className="aspect-video bg-ink rounded-[2rem] overflow-hidden relative grid place-items-center shadow-xl shadow-ink/10">
        <video ref={videoRef} autoPlay muted playsInline className={`w-full h-full object-cover -scale-x-100 ${camOn ? '' : 'hidden'}`} />
        {!camOn && (
          <div className="text-center text-white/70">
            <div className="w-20 h-20 rounded-full bg-brand text-ink grid place-items-center mx-auto text-3xl font-extrabold">
              {displayName ? displayName.charAt(0).toUpperCase() : '?'}
            </div>
            <p className="mt-3 text-sm">{micOn ? 'Camera is off' : 'Turn on your mic and camera to preview'}</p>
          </div>
        )}
      </div>

      <div className="flex justify-center gap-3 mt-5">
        <button type="button" onClick={() => startMedia(camOn)} aria-label="Turn on microphone" aria-pressed={micOn}
          className={`w-14 h-14 rounded-full grid place-items-center border border-ink/10 transition ${micOn ? 'bg-white' : 'bg-danger text-white'}`}>
          <Icon name={micOn ? 'mic' : 'micOff'} />
        </button>
        <button type="button" onClick={() => startMedia(!camOn)} aria-label="Toggle camera" aria-pressed={camOn}
          className={`w-14 h-14 rounded-full grid place-items-center border border-ink/10 transition ${camOn ? 'bg-white' : 'bg-danger text-white'}`}>
          <Icon name={camOn ? 'video' : 'videoOff'} />
        </button>
      </div>

      {micOn && (
        <div className="mt-4 max-w-xs mx-auto h-1.5 bg-ink/10 rounded-full overflow-hidden" aria-label="Microphone level">
          <div className="h-1.5 bg-brand rounded-full transition-all" style={{ width: `${micLevel}%` }} />
        </div>
      )}

      <div className="mt-8 max-w-md mx-auto space-y-4">
        {error && <p role="alert" className="text-danger text-sm bg-danger/10 rounded-2xl px-4 py-2.5 text-center">{error}</p>}
        <input className="input text-center" value={displayName} onChange={(e) => setDisplayName(e.target.value)}
          maxLength={60} placeholder="Your name" aria-label="Your name" />

        <label className="flex items-center justify-center gap-3 text-sm cursor-pointer">
          <input type="checkbox" className="w-4 h-4 accent-orange-600" checked={lowBandwidth} onChange={(e) => setLowBandwidth(e.target.checked)} />
          <span><span className="font-semibold">Low-data mode</span> <span className="text-ink/50">· audio only</span></span>
        </label>

        <button className="btn-accent w-full text-base py-4" onClick={joinNow}>Join now</button>
      </div>
    </Centered>
  );
}

export default function LobbyPage() {
  return (
    <Suspense fallback={null}>
      <LobbyInner />
    </Suspense>
  );
}