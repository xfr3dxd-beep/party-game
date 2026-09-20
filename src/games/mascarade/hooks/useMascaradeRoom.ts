import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../../../lib/supabase';
import { MascaradeBroadcast } from '../types';

export interface RoomPlayer {
  id: string;
  name: string;
  isHost: boolean;
}

export function useMascaradeRoom() {
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [playerId] = useState(() => crypto.randomUUID());
  const [playerName, setPlayerName] = useState<string>('');
  const [players, setPlayers] = useState<RoomPlayer[]>([]);
  const [isHost, setIsHost] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const broadcastCallbackRef = useRef<((event: MascaradeBroadcast) => void) | null>(null);

  const onBroadcast = useCallback((callback: (event: MascaradeBroadcast) => void) => {
    broadcastCallbackRef.current = callback;
  }, []);

  const disconnect = useCallback(() => {
    if (channelRef.current) {
      channelRef.current.unsubscribe();
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
    setRoomCode(null); setPlayers([]); setIsHost(false); setIsConnected(false);
  }, []);

  useEffect(() => { return () => { disconnect(); }; }, [disconnect]);

  const setupChannel = async (code: string, name: string, host: boolean): Promise<boolean> => {
    const channel = supabase.channel(`mascarade-${code}`, { config: { presence: { key: playerId } } });
    channelRef.current = channel;
    return new Promise((resolve) => {
      channel
        .on('presence', { event: 'sync' }, () => {
          const state = channel.presenceState();
          const cp: RoomPlayer[] = [];
          Object.values(state).forEach((presences) => {
            presences.forEach((pr: any) => {
              if (pr.id && pr.name) cp.push({ id: pr.id, name: pr.name, isHost: !!pr.isHost });
            });
          });
          setPlayers(cp);
        })
        .on('broadcast', { event: 'game' }, (payload) => {
          if (broadcastCallbackRef.current) broadcastCallbackRef.current(payload.payload as MascaradeBroadcast);
        })
        .subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            await channel.track({ id: playerId, name, isHost: host });
            setIsConnected(true); setRoomCode(code); setPlayerName(name); setIsHost(host);
            if (!host) {
              setTimeout(() => {
                const cs = channel.presenceState();
                let fh = false;
                Object.values(cs).forEach(pr => pr.forEach((p: any) => { if (p.isHost) fh = true; }));
                resolve(fh ? true : (disconnect(), false));
              }, 1000);
            } else resolve(true);
          } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            setIsConnected(false); if (!host) resolve(false);
          }
        });
    });
  };

  const createRoom = useCallback(async (name: string) => {
    const code = Array.from({ length: 4 }, () => String.fromCharCode(65 + Math.floor(Math.random() * 26))).join('');
    await setupChannel(code, name, true);
  }, []);

  const joinRoom = useCallback(async (code: string, name: string): Promise<boolean> => {
    return await setupChannel(code.toUpperCase(), name, false);
  }, []);

  const broadcast = useCallback((event: MascaradeBroadcast) => {
    if (channelRef.current && isConnected) {
      channelRef.current.send({ type: 'broadcast', event: 'game', payload: event });
    }
  }, [isConnected]);

  return { roomCode, playerId, playerName, players, isHost, isConnected, createRoom, joinRoom, broadcast, onBroadcast, disconnect };
}
