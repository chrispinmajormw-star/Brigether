'use client';
import { useCallback, useEffect, useRef, useState } from 'react';

export type Participant = {
  id: string;
  name: string;
  presenting: boolean;
  cam: MediaStream | null;
  screen: MediaStream | null;
  micOn: boolean;
  camOn: boolean;
};
export type ChatMsg = { id: string; from: string; text: string; me: boolean };
export type CallStatus = 'idle' | 'connecting' | 'connected' | 'error';
type Handlers = {
  onJoin?: (name: string) => void;
  onLeave?: (name: string) => void;
  onChat?: (m: ChatMsg) => void;
  onPresent?: (name: string, on: boolean) => void;
};

let silent: MediaStream | null = null;
function silentStream(): MediaStream {
  if (!silent) {
    const AC: any = (window as any).AudioContext || (window as any).webkitAudioContext;
    silent = new AC().createMediaStreamDestination().stream as MediaStream;
  }
  return silent as MediaStream;
}

async function getIceServers(): Promise<any[]> {
  const base: any[] = [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ];
  const app = process.env.NEXT_PUBLIC_METERED_APP;
  const key = process.env.NEXT_PUBLIC_METERED_KEY;
  if (!app || !key) return base;
  try {
    const r = await fetch(`https://${app}.metered.live/api/v1/turn/credentials?apiKey=${key}`);
    if (r.ok) {
      const turn = await r.json();
      if (Array.isArray(turn)) return base.concat(turn);
    }
  } catch {}
  return base;
}

/*
  Real calls between devices (mesh): PeerJS cloud for signalling.
  - Every person has one "main" peer.
  - The first person also claims a "directory" peer (brigether-CODE) that tells newcomers who is in the room.
  - If the directory holder leaves, another person claims it.
*/
export function useCall(
  code: string,
  name: string | null,
  ready: boolean,
  localStream: MediaStream | null,
  handlers: Handlers,
) {
  const [peers, setPeers] = useState<Participant[]>([]);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [status, setStatus] = useState<CallStatus>('idle');

  const peersRef = useRef<Map<string, Participant>>(new Map());
  const connsRef = useRef<Map<string, any>>(new Map());
  const localRef = useRef<MediaStream | null>(localStream);
  const screenRef = useRef<MediaStream | null>(null);
  const screenCalls = useRef<any[]>([]);
  const stateRef = useRef({ mic: true, cam: true });
  const callScreenRef = useRef<(id: string) => void>(() => {});
  const h = useRef(handlers);
  localRef.current = localStream;
  h.current = handlers;

  const sync = useCallback(() => {
    setPeers(Array.from(peersRef.current.values()));
  }, []);

  const broadcast = useCallback((msg: any) => {
    connsRef.current.forEach((c) => {
      try { if (c.open) c.send(msg); } catch {}
    });
  }, []);

  useEffect(() => {
    if (!code || !name || !ready) return;
    const myName: string = name;
    let dead = false;
    let main: any = null;
    let dir: any = null;
    let dirHolder = '';
    let PeerCtor: any = null;
    let iceServers: any[] = [];
    const j: { fail: (() => void) | null } = { fail: null };
    const pending = new Set<string>();
    const announced = new Set<string>();
    const answered = new Set<string>();
    const hubId = `brigether-${code.toLowerCase()}`;

    const upsert = (id: string, patch: Partial<Participant>) => {
      const cur: Participant = peersRef.current.get(id) ?? {
        id, name: 'Guest', presenting: false, cam: null, screen: null, micOn: true, camOn: true,
      };
      peersRef.current.set(id, { ...cur, ...patch });
      sync();
    };

    const drop = (id: string) => {
      connsRef.current.delete(id);
      pending.delete(id);
      const p = peersRef.current.get(id);
      peersRef.current.delete(id);
      sync();
      if (p && announced.has(id)) {
        announced.delete(id);
        h.current.onLeave?.(p.name);
      }
      if (id === dirHolder) {
        dirHolder = '';
        claimLater(0);
      }
    };

    const claimLater = (n: number) => {
      setTimeout(async () => {
        if (dead || dir || dirHolder || n > 4) return;
        const ok = await tryClaim();
        if (!ok && !dead && !dirHolder) claimLater(n + 1);
      }, n === 0 ? 400 + Math.random() * 1200 : 2000);
    };

    const tryClaim = () =>
      new Promise<boolean>((resolve) => {
        let settled = false;
        const d = new PeerCtor(hubId, { config: { iceServers } });
        d.on('open', () => {
          if (settled) return;
          settled = true;
          if (dead) { try { d.destroy(); } catch {} resolve(false); return; }
          dir = d;
          d.on('connection', (c: any) => {
            c.on('data', (m: any) => {
              if (!m || m.type !== 'join') return;
              const ids = new Set<string>();
              ids.add(main.id);
              connsRef.current.forEach((_c, id) => ids.add(id));
              answered.forEach((id) => ids.add(id));
              ids.delete(c.peer);
              answered.add(c.peer);
              c.send({ type: 'peers', ids: Array.from(ids) });
            });
          });
          broadcast({ type: 'dir' });
          resolve(true);
        });
        d.on('error', () => {
          if (settled) return;
          settled = true;
          try { d.destroy(); } catch {}
          resolve(false);
        });
      });

    const wireCall = (call: any) => {
      call.on('stream', (s: MediaStream) => {
        const kind = call.metadata && call.metadata.kind;
        upsert(call.peer, kind === 'screen' ? { screen: s } : { cam: s });
      });
    };

    const callCam = (id: string) => {
      try {
        const call = main.call(id, localRef.current ?? silentStream(), { metadata: { kind: 'cam' } });
        wireCall(call);
      } catch {}
    };

    const callScreen = (id: string) => {
      const s = screenRef.current;
      if (!s) return;
      try {
        const call = main.call(id, s, { metadata: { kind: 'screen' } });
        screenCalls.current.push(call);
      } catch {}
    };
    callScreenRef.current = callScreen;

    const handle = (id: string, m: any) => {
      if (!m || !m.type) return;
      if (m.type === 'hello') {
        const nm = String(m.name || 'Guest').slice(0, 60);
        upsert(id, { name: nm, presenting: !!m.presenting, micOn: m.mic !== false, camOn: m.cam !== false });
        if (m.dir) dirHolder = id;
        if (!announced.has(id)) {
          announced.add(id);
          h.current.onJoin?.(nm);
        }
      } else if (m.type === 'dir') {
        dirHolder = id;
      } else if (m.type === 'state') {
        upsert(id, { micOn: m.mic !== false, camOn: m.cam !== false });
      } else if (m.type === 'present') {
        const nm = peersRef.current.get(id)?.name ?? 'Someone';
        upsert(id, m.on ? { presenting: true } : { presenting: false, screen: null });
        h.current.onPresent?.(nm, !!m.on);
      } else if (m.type === 'chat') {
        const msg: ChatMsg = {
          id: String(m.msgId),
          from: String(m.name || 'Guest').slice(0, 60),
          text: String(m.text).slice(0, 2000),
          me: false,
        };
        setMessages((prev) => prev.concat([msg]));
        h.current.onChat?.(msg);
      }
    };

    const wireConn = (conn: any) => {
      const id = conn.peer;
      conn.on('open', () => {
        pending.delete(id);
        connsRef.current.set(id, conn);
        conn.send({
          type: 'hello',
          name: myName,
          presenting: !!screenRef.current,
          mic: stateRef.current.mic,
          cam: stateRef.current.cam,
          dir: !!dir,
        });
        if (screenRef.current) callScreen(id);
      });
      conn.on('data', (m: any) => handle(id, m));
      conn.on('close', () => drop(id));
      conn.on('error', () => drop(id));
    };

    const connectTo = (id: string) => {
      if (!id || id === main.id || connsRef.current.has(id) || pending.has(id)) return;
      pending.add(id);
      const conn = main.connect(id, { reliable: true });
      wireConn(conn);
      conn.on('open', () => callCam(id));
    };

    const joinRoom = async (attempt: number) => {
      if (dead) return;
      const claimed = await tryClaim();
      if (dead) return;
      if (claimed) { setStatus('connected'); return; }

      let done = false;
      let timer: any = null;
      const retry = () => {
        if (done) return;
        done = true;
        j.fail = null;
        clearTimeout(timer);
        if (attempt < 4) setTimeout(() => joinRoom(attempt + 1), 1500);
        else setStatus('error');
      };
      j.fail = retry;
      timer = setTimeout(retry, 7000);

      const c = main.connect(hubId, { reliable: true });
      c.on('open', () => c.send({ type: 'join' }));
      c.on('data', (m: any) => {
        if (done || !m || m.type !== 'peers') return;
        done = true;
        j.fail = null;
        clearTimeout(timer);
        (m.ids as string[]).forEach(connectTo);
        setStatus('connected');
        try { c.close(); } catch {}
      });
      c.on('error', retry);
    };

    const leaveNow = () => { try { if (main) main.destroy(); } catch {} };
    window.addEventListener('pagehide', leaveNow);

    (async () => {
      setStatus('connecting');
      const mod: any = await import('peerjs');
      if (dead) return;
      PeerCtor = mod.Peer || mod.default;
      iceServers = await getIceServers();
      if (dead) return;

      main = new PeerCtor(undefined, { config: { iceServers } });
      main.on('error', (e: any) => {
        const t = e && e.type;
        if (t === 'peer-unavailable') { if (j.fail) j.fail(); }
        else if (t === 'network' || t === 'server-error' || t === 'socket-error' || t === 'socket-closed') setStatus('error');
      });
      main.on('call', (call: any) => {
        const kind = call.metadata && call.metadata.kind;
        if (kind === 'screen') call.answer();
        else call.answer(localRef.current ?? silentStream());
        wireCall(call);
      });
      main.on('connection', wireConn);
      main.on('open', () => joinRoom(0));
    })();

    return () => {
      dead = true;
      window.removeEventListener('pagehide', leaveNow);
      connsRef.current.forEach((c) => { try { c.close(); } catch {} });
      connsRef.current.clear();
      screenCalls.current.forEach((c) => { try { c.close(); } catch {} });
      screenCalls.current = [];
      try { if (dir) dir.destroy(); } catch {}
      try { if (main) main.destroy(); } catch {}
      peersRef.current.clear();
      setPeers([]);
      setStatus('idle');
    };
  }, [code, name, ready, sync, broadcast]);

  const sendChat = useCallback((text: string) => {
    const msgId = Math.random().toString(36).slice(2) + Date.now().toString(36);
    setMessages((prev) => prev.concat([{ id: msgId, from: name ?? 'Me', text, me: true }]));
    broadcast({ type: 'chat', msgId, name, text });
  }, [name, broadcast]);

  const shareScreen = useCallback((s: MediaStream | null) => {
    screenRef.current = s;
    screenCalls.current.forEach((c) => { try { c.close(); } catch {} });
    screenCalls.current = [];
    broadcast({ type: 'present', on: !!s });
    if (s) connsRef.current.forEach((_c, id) => callScreenRef.current(id));
  }, [broadcast]);

  const setMedia = useCallback((mic: boolean, cam: boolean) => {
    stateRef.current = { mic, cam };
    broadcast({ type: 'state', mic, cam });
  }, [broadcast]);

  return { peers, messages, status, sendChat, shareScreen, setMedia };
}