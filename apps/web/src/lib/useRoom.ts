'use client';
import { useCallback, useEffect, useRef, useState } from 'react';

export type Peer = { id: string; name: string; presenting?: boolean };
export type ChatMsg = { id: string; from: string; text: string; me: boolean };
type Handlers = {
  onJoin?: (p: Peer) => void;
  onLeave?: (p: Peer) => void;
  onChat?: (m: ChatMsg) => void;
  onPresent?: (name: string, on: boolean) => void;
};

/* Presence, chat and presenting state between tabs of the same browser. */
export function useRoom(code: string, name: string | null, handlers: Handlers) {
  const [peers, setPeers] = useState<Peer[]>([]);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const chRef = useRef<BroadcastChannel | null>(null);
  const idRef = useRef('');
  const presRef = useRef(false);
  const h = useRef(handlers);
  h.current = handlers;

  useEffect(() => {
    if (!name || !code || typeof BroadcastChannel === 'undefined') return;
    const id = crypto.randomUUID();
    idRef.current = id;
    const ch = new BroadcastChannel(`brigether-room-${code}`);
    chRef.current = ch;
    const known = new Map<string, Peer>();

    const add = (p: Peer, silent: boolean) => {
      if (known.has(p.id)) return;
      known.set(p.id, p);
      setPeers(Array.from(known.values()));
      if (!silent) h.current.onJoin?.(p);
    };

    ch.onmessage = (e) => {
      const m = e.data;
      if (!m || m.id === id) return;
      if (m.type === 'hello') {
        add({ id: m.id, name: m.name, presenting: !!m.presenting }, false);
        ch.postMessage({ type: 'here', id, name, to: m.id, presenting: presRef.current });
      } else if (m.type === 'here' && m.to === id) {
        add({ id: m.id, name: m.name, presenting: !!m.presenting }, true);
      } else if (m.type === 'present') {
        const p = known.get(m.id);
        if (p) {
          known.set(m.id, { ...p, presenting: !!m.on });
          setPeers(Array.from(known.values()));
          h.current.onPresent?.(p.name, !!m.on);
        }
      } else if (m.type === 'bye') {
        const p = known.get(m.id);
        if (p) {
          known.delete(m.id);
          setPeers(Array.from(known.values()));
          h.current.onLeave?.(p);
        }
      } else if (m.type === 'chat') {
        const msg = { id: m.msgId, from: m.name, text: m.text, me: false };
        setMessages((prev) => [...prev, msg]);
        h.current.onChat?.(msg);
      }
    };

    ch.postMessage({ type: 'hello', id, name, presenting: presRef.current });
    const bye = () => ch.postMessage({ type: 'bye', id });
    window.addEventListener('pagehide', bye);
    return () => {
      bye();
      window.removeEventListener('pagehide', bye);
      ch.close();
      chRef.current = null;
    };
  }, [code, name]);

  const sendChat = useCallback((text: string) => {
    const msgId = crypto.randomUUID();
    setMessages((prev) => [...prev, { id: msgId, from: name ?? 'Me', text, me: true }]);
    chRef.current?.postMessage({ type: 'chat', id: idRef.current, name, text, msgId });
  }, [name]);

  const setPresenting = useCallback((on: boolean) => {
    presRef.current = on;
    chRef.current?.postMessage({ type: 'present', id: idRef.current, on });
  }, []);

  return { peers, messages, sendChat, setPresenting };
}