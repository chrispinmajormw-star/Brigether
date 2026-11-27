'use client';
import { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { t } from '@/lib/strings';

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
    if (!displayName.trim()) { setError(t('requiredField')); return; }
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
    <main id="main" className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-teal">{t('lobby')}</h1>
        {meeting && <p className="text-gray-700">{meeting.title} · code {meeting.code}</p>}
      </header>

      {error && <p role="alert" className="text-red-600">{error}</p>}

      <div className="card grid md:grid-cols-2 gap-4">
        <div className="aspect-video bg-black rounded-lg overflow-hidden grid place-items-center relative">
          <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
          {!camOn && <p className="absolute text-white/70 text-sm">Camera off</p>}
        </div>

        <div className="space-y-3">
          <label className="block">
            <span className="text-sm font-medium">{t('displayName')}</span>
            <input className="input mt-1" value={displayName} onChange={(e) => setDisplayName(e.target.value)} maxLength={60} />
          </label>

          <div className="flex gap-2 flex-wrap">
            <button type="button" onClick={() => enableMedia(camOn)} className={micOn ? 'btn-gold' : 'btn-primary'}>
              {t('micCheck')} {micOn ? '✓' : ''}
            </button>
            <button type="button" onClick={() => enableMedia(true)} className={camOn ? 'btn-gold' : 'btn-primary'}>
              {t('camCheck')} {camOn ? '✓' : ''}
            </button>
          </div>

          {micOn && (
            <div>
              <p className="text-xs text-gray-600 mb-1">Mic level</p>
              <div className="h-2 bg-gray-200 rounded">
                <div className="h-2 bg-teal rounded transition-all" style={{ width: `${micLevel}%` }} />
              </div>
            </div>
          )}

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={lowBandwidth} onChange={(e) => setLowBandwidth(e.target.checked)} />
            {t('lowBandwidth')}
          </label>

          <button className="btn-gold w-full" onClick={joinNow}>{t('joinNow')}</button>
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