'use client';
import { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Icon } from '@/components/Icons';

type Msg = { from: string; text: string; me?: boolean };

function RoomInner() {
  const search = useSearchParams();
  const code = (search.get('code') ?? '').toUpperCase();
  const router = useRouter();

  const [info, setInfo] = useState<any>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [draft, setDraft] = useState('');
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem(`brigether:join:${code}`);
    if (!raw) { router.replace(`/meeting/lobby?code=${code}`); return; }
    const parsed = JSON.parse(raw);
    setInfo(parsed);
    const wantVideo = !parsed.lowBandwidth;
    setCamOn(wantVideo);
    navigator.mediaDevices
      .getUserMedia({ audio: true, video: wantVideo })
      .then(setStream)
      .catch(() => { setCamOn(false); setMicOn(false); });
  }, [code, router]);

  useEffect(() => {
    if (videoRef.current && stream) videoRef.current.srcObject = stream;
  }, [stream, info, camOn]);

  useEffect(() => () => stream?.getTracks().forEach((tk) => tk.stop()), [stream]);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs, chatOpen]);

  function toggleMic() {
    stream?.getAudioTracks().forEach((tk) => (tk.enabled = !micOn));
    setMicOn(!micOn);
  }
  function toggleCam() {
    stream?.getVideoTracks().forEach((tk) => (tk.enabled = !camOn));
    setCamOn(!camOn);
  }
  function leave() {
    stream?.getTracks().forEach((tk) => tk.stop());
    router.push('/');
  }
  async function copyInvite() {
    const base = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
    const link = `${window.location.origin}${base}/meeting/lobby/?code=${code}`;
    try { await navigator.clipboard.writeText(link); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch {}
  }
  function send(e: React.FormEvent) {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setMsgs((m) => [...m, { from: info.displayName, text, me: true }]);
    setDraft('');
  }

  if (!info) return <main id="main" className="min-h-screen bg-slate-900 grid place-items-center text-slate-300">Joining…</main>;

  const initial = info.displayName.charAt(0).toUpperCase();
  const ctrl = 'w-12 h-12 rounded-full grid place-items-center transition';

  return (
    <div className="h-screen bg-slate-900 text-white flex flex-col">
      <header className="h-14 px-4 flex items-center justify-between border-b border-white/10 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <span className="font-semibold truncate">Meeting</span>
          <span className="font-mono text-sm tracking-wider bg-white/10 px-2.5 py-1 rounded-lg">{code}</span>
        </div>
        <div className="flex items-center gap-2">
          {info.lowBandwidth && <span className="text-xs bg-amber-500/20 text-amber-300 px-2.5 py-1 rounded-full">Low-data mode</span>}
          <button onClick={copyInvite} className="text-sm bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg inline-flex items-center gap-2">
            <Icon name={copied ? 'check' : 'copy'} className="w-4 h-4" /> {copied ? 'Copied' : 'Copy invite'}
          </button>
        </div>
      </header>

      <div className="flex-1 flex min-h-0 relative">
        <main id="main" className="flex-1 p-3 sm:p-4 min-w-0">
          <div className="h-full grid gap-3 md:grid-cols-2 auto-rows-fr">
            <div className="relative rounded-2xl overflow-hidden bg-slate-800 grid place-items-center min-h-[200px]">
              <video ref={videoRef} autoPlay muted playsInline className={`w-full h-full object-cover -scale-x-100 ${camOn ? '' : 'hidden'}`} />
              {!camOn && (
                <div className="w-24 h-24 rounded-full bg-brand text-white text-4xl font-bold grid place-items-center">{initial}</div>
              )}
              <span className="absolute left-3 bottom-3 bg-black/60 text-sm px-3 py-1 rounded-lg inline-flex items-center gap-2">
                {!micOn && <Icon name="micOff" className="w-3.5 h-3.5 text-red-400" />}
                {info.displayName} (You)
              </span>
            </div>

            <div className="rounded-2xl border-2 border-dashed border-white/15 grid place-items-center text-center p-6 min-h-[200px]">
              <div>
                <p className="font-semibold">Waiting for others</p>
                <p className="text-sm text-slate-400 mt-1">Share this code to invite people</p>
                <p className="font-mono text-2xl tracking-widest mt-3">{code}</p>
                <button onClick={copyInvite} className="mt-4 text-sm bg-brand hover:bg-brand-dark px-4 py-2 rounded-xl font-medium">
                  {copied ? 'Link copied' : 'Copy invite link'}
                </button>
              </div>
            </div>
          </div>
        </main>

        {chatOpen && (
          <aside className="absolute inset-0 sm:static sm:w-80 bg-white text-ink flex flex-col shrink-0 z-10" aria-label="Chat">
            <div className="h-14 px-4 flex items-center justify-between border-b border-slate-200">
              <h2 className="font-semibold">In-call chat</h2>
              <button onClick={() => setChatOpen(false)} aria-label="Close chat" className="p-2 rounded-lg hover:bg-slate-100">
                <Icon name="x" className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3" aria-live="polite">
              {msgs.length === 0 && <p className="text-sm text-slate-500 text-center mt-6">No messages yet. Say hello!</p>}
              {msgs.map((m, i) => (
                <div key={i} className={m.me ? 'flex justify-end' : ''}>
                  <div className={`max-w-[85%] px-3.5 py-2 rounded-2xl text-sm ${m.me ? 'bg-brand text-white' : 'bg-slate-100'}`}>
                    {!m.me && <p className="text-xs font-semibold text-slate-500">{m.from}</p>}
                    {m.text}
                  </div>
                </div>
              ))}
              <div ref={endRef} />
            </div>
            <form onSubmit={send} className="p-3 border-t border-slate-200 flex gap-2">
              <input className="input" placeholder="Send a message" value={draft} onChange={(e) => setDraft(e.target.value)} />
              <button className="w-11 h-11 rounded-xl bg-brand text-white grid place-items-center shrink-0" aria-label="Send">
                <Icon name="send" className="w-4 h-4" />
              </button>
            </form>
          </aside>
        )}
      </div>

      <footer className="h-20 px-4 flex items-center justify-center gap-3 border-t border-white/10 shrink-0">
        <button onClick={toggleMic} aria-label={micOn ? 'Mute microphone' : 'Unmute microphone'} aria-pressed={!micOn}
          className={`${ctrl} ${micOn ? 'bg-white/10 hover:bg-white/20' : 'bg-danger'}`}>
          <Icon name={micOn ? 'mic' : 'micOff'} />
        </button>
        <button onClick={toggleCam} aria-label={camOn ? 'Turn off camera' : 'Turn on camera'} aria-pressed={!camOn}
          className={`${ctrl} ${camOn ? 'bg-white/10 hover:bg-white/20' : 'bg-danger'}`}>
          <Icon name={camOn ? 'video' : 'videoOff'} />
        </button>
        <button onClick={() => setChatOpen(!chatOpen)} aria-label="Toggle chat" aria-pressed={chatOpen}
          className={`${ctrl} ${chatOpen ? 'bg-brand' : 'bg-white/10 hover:bg-white/20'}`}>
          <Icon name="chat" />
        </button>
        <button onClick={leave} className="h-12 px-6 rounded-full bg-danger hover:brightness-110 font-semibold">Leave</button>
      </footer>
    </div>
  );
}

export default function RoomPage() {
  return (
    <Suspense fallback={null}>
      <RoomInner />
    </Suspense>
  );
}