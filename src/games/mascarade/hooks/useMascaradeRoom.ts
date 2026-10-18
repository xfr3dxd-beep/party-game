import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../../../lib/supabase';
import { MascaradeBroadcast } from '../types';
import { storeSession, recoverSession, createRoomRecord, updateRoomPlayers, loadRoom, updateRoomHost } from '../../../lib/roomPersistence';

export interface RoomPlayer {
  id: string;
  name: string;
  isHost: boolean;
}

export function useMascaradeRoom() {
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [playerId, setPlayerId] = useState<string>(() => crypto.randomUUID());
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
    const activePlayerId = recoverSession(code)?.playerId || playerId;
    const channel = supabase.channel(`mascarade-${code}`, { config: { presence: { key: activePlayerId } } });
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
          if (host) updateRoomPlayers(code, cp);
        })
        .on('broadcast', { event: 'game' }, (payload) => {
          if (broadcastCallbackRef.current) broadcastCallbackRef.current(payload.payload as MascaradeBroadcast);
        })
        .subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            await channel.track({ id: activePlayerId, name, isHost: host });
            setIsConnected(true); setRoomCode(code); setPlayerName(name); setIsHost(host);
            if (!host) {
              setTimeout(() => {
                const cs = channel.presenceState();
                let fh = false;
                Object.values(cs).forEach(pr => pr.forEach((p: any) => { if (p.isHost) fh = true; }));
                if (fh) {
                  resolve(true);
                  channel.send({ type: 'broadcast', event: 'game', payload: { type: 'request-sync' } });
                } else {
                  disconnect();
                  resolve(false);
                }
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
    await createRoomRecord(code, 'mascarade', playerId, [{ id: playerId, name, isHost: true }]);
    storeSession(code, playerId, name, 'mascarade');
  }, [playerId]);

  const joinRoom = useCallback(async (code: string, name: string): Promise<boolean> => {
    const upperCode = code.toUpperCase();
    
    // Check for existing session (rejoin)
    const stored = recoverSession(upperCode);
    if (stored) {
      setPlayerId(stored.playerId);
    }
    
    // Check if room exists in DB with saved state (rejoin scenario)
    const room = await loadRoom(upperCode);
    if (room && room.phase === 'playing' && room.state) {
      // This is a rejoin — check if the player was in this game
      const pid = stored?.playerId || playerId;
      const wasInGame = room.players.some((p: any) => p.name === name || p.id === pid);
      if (!wasInGame) return false; // Can't join a game in progress as a new player
      
      // Use the stored player ID if found, otherwise use current
      const rejoiningId = stored?.playerId || pid;
      if (stored) setPlayerId(rejoiningId);
      
      // Check if host is online
      const result = await setupChannel(upperCode, name, false);
      if (result) {
        storeSession(upperCode, rejoiningId, name, 'mascarade');
        return true;
      }
      
      // Host is offline — this player becomes the new host
      await updateRoomHost(upperCode, rejoiningId);
      const hostResult = await setupChannel(upperCode, name, true);
      if (hostResult) {
        storeSession(upperCode, rejoiningId, name, 'mascarade');
      }
      return hostResult;
    }
    
    // Normal join (lobby phase)
    const result = await setupChannel(upperCode, name, false);
    if (result) {
      storeSession(upperCode, playerId, name, 'mascarade');
    }
    return result;
  }, [playerId]);

  const broadcast = useCallback((event: MascaradeBroadcast) => {
    if (channelRef.current && isConnected) {
      channelRef.current.send({ type: 'broadcast', event: 'game', payload: event });
    }
  }, [isConnected]);

  return { roomCode, playerId, playerName, players, isHost, isConnected, createRoom, joinRoom, broadcast, onBroadcast, disconnect };
}
