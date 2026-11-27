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

  async function enableMedia(video: boolean) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video });
      streamRef.current?.getTracks().forEach((tk) => tk.stop());
      streamRef.current = stream;
      if (video && videoRef.current) videoRef.current.srcObject = stream;
      setMicOn(true);
      setCamOn(video);

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
      setError('Could not access microphone/camera. Check browser permissions.');
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
    if (!displayName.trim()) { setError('Please enter your display name.'); return; }
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
    <main id="main" className="min-h-screen grid place-items-center px-4 py-8">
      <div className="card w-full max-w-4xl p-6 md:p-8 space-y-5">
        <header className="flex items-center gap-3">
          <Logo />
          <div>
            <h1 className="text-xl font-bold">{meeting ? meeting.title : 'Lobby'}</h1>
            {meeting && <p className="text-sm text-gray-500">Code {meeting.code}</p>}
          </div>
        </header>

        {error && <p role="alert" className="text-danger text-sm bg-danger/10 rounded-2xl px-4 py-2">{error}</p>}

        <div className="grid md:grid-cols-2 gap-6">
          <div className="aspect-video bg-ink rounded-3xl overflow-hidden grid place-items-center relative">
            <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
            {!camOn && <p className="absolute text-white/70 text-sm">Camera off</p>}
          </div>

          <div className="space-y-4">
            <label className="block">
              <span className="text-sm font-medium">Your name</span>
              <input className="input mt-1" value={displayName} onChange={(e) => setDisplayName(e.target.value)} maxLength={60} />
            </label>

            <div className="flex gap-2 flex-wrap">
              <button type="button" onClick={() => enableMedia(camOn)} className={micOn ? 'btn-gold' : 'btn-soft'}>
                <Icon name="mic" className="w-4 h-4" /> Microphone {micOn ? '✓' : ''}
              </button>
              <button type="button" onClick={() => enableMedia(true)} className={camOn ? 'btn-gold' : 'btn-soft'}>
                <Icon name="video" className="w-4 h-4" /> Camera {camOn ? '✓' : ''}
              </button>
            </div>

            {micOn && (
              <div>
                <p className="text-xs text-gray-500 mb-1">Mic level</p>
                <div className="h-2 bg-panel rounded-full">
                  <div className="h-2 bg-brand rounded-full transition-all" style={{ width: `${micLevel}%` }} />
                </div>
              </div>
            )}

            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={lowBandwidth} onChange={(e) => setLowBandwidth(e.target.checked)} />
              Low bandwidth mode (audio only)
            </label>

            <button className="btn-primary w-full text-lg py-3" onClick={joinNow}>Join now</button>
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