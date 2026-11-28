'use client';
import { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { Icon, Logo } from '@/components/Icons';

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
    <main id="main" className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-4 py-6">
        <Logo text />
        <div className="grid lg:grid-cols-5 gap-8 mt-8 items-center">
          <div className="lg:col-span-3">
            <div className="aspect-video bg-slate-900 rounded-2xl overflow-hidden relative grid place-items-center">
              <video ref={videoRef} autoPlay muted playsInline className={`w-full h-full object-cover -scale-x-100 ${camOn ? '' : 'hidden'}`} />
              {!camOn && (
                <div className="text-center text-slate-300">
                  <div className="w-20 h-20 rounded-full bg-slate-700 grid place-items-center mx-auto text-3xl font-bold text-white">
                    {displayName ? displayName.charAt(0).toUpperCase() : '?'}
                  </div>
                  <p className="mt-3 text-sm">{micOn ? 'Camera is off' : 'Turn on your mic and camera to preview'}</p>
                </div>
              )}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3">
                <button type="button" onClick={() => startMedia(camOn)} aria-label="Turn on microphone" aria-pressed={micOn}
                  className={`w-12 h-12 rounded-full grid place-items-center ${micOn ? 'bg-white text-ink' : 'bg-danger text-white'}`}>
                  <Icon name={micOn ? 'mic' : 'micOff'} />
                </button>
                <button type="button" onClick={() => (camOn ? startMedia(false) : startMedia(true))} aria-label="Toggle camera" aria-pressed={camOn}
                  className={`w-12 h-12 rounded-full grid place-items-center ${camOn ? 'bg-white text-ink' : 'bg-danger text-white'}`}>
                  <Icon name={camOn ? 'video' : 'videoOff'} />
                </button>
              </div>
            </div>
            {micOn && (
              <div className="mt-3 flex items-center gap-3">
                <Icon name="mic" className="w-4 h-4 text-slate-500" />
                <div className="h-2 flex-1 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-2 bg-brand rounded-full transition-all" style={{ width: `${micLevel}%` }} />
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-2 space-y-5">
            <div>
              <h1 className="text-2xl font-bold">{meeting ? meeting.title : 'Ready to join?'}</h1>
              {meeting && <p className="text-sm text-slate-500 mt-1">Meeting code <span className="font-mono tracking-wider">{meeting.code}</span></p>}
            </div>

            {error && <p role="alert" className="text-danger text-sm bg-danger/10 rounded-xl px-4 py-2.5">{error}</p>}

            <label className="block">
              <span className="text-sm font-medium">Your name</span>
              <input className="input mt-1.5" value={displayName} onChange={(e) => setDisplayName(e.target.value)} maxLength={60} placeholder="Enter your name" />
            </label>

            <label className="flex items-start gap-3 bg-slate-50 border border-slate-200 rounded-xl p-3 cursor-pointer">
              <input type="checkbox" className="mt-1 accent-teal-600" checked={lowBandwidth} onChange={(e) => setLowBandwidth(e.target.checked)} />
              <span>
                <span className="block text-sm font-medium">Low-data mode</span>
                <span className="block text-xs text-slate-500">Audio only, so the call uses far less data.</span>
              </span>
            </label>

            <button className="btn-primary w-full text-base py-3" onClick={joinNow}>Join now</button>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function LobbyPage() {
  return (
    <Suspense fallback={null}>
      <LobbyInner />
    </Suspense>
  );
}