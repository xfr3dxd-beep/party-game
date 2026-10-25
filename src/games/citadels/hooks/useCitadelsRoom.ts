// Citadels — Supabase Realtime Room Hook

import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../../../lib/supabase';
import { CitadelsBroadcast } from '../types';
import { storeSession, recoverSession, createRoomRecord, updateRoomPlayers, loadRoom, updateRoomHost } from '../../../lib/roomPersistence';

export interface RoomPlayer {
  id: string;
  name: string;
  isHost: boolean;
}

export function useCitadelsRoom() {
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [playerId, setPlayerId] = useState<string>(() => crypto.randomUUID());
  const [playerName, setPlayerName] = useState<string>('');
  const [players, setPlayers] = useState<RoomPlayer[]>([]);
  const [isHost, setIsHost] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const broadcastCallbackRef = useRef<((event: CitadelsBroadcast) => void) | null>(null);

  const onBroadcast = useCallback((callback: (event: CitadelsBroadcast) => void) => {
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

  // playerIdOverride allows joinRoom to pass the correct ID before React state updates
  const playerIdRef = useRef(playerId);
  playerIdRef.current = playerId;

  const setupChannel = async (code: string, name: string, host: boolean, playerIdOverride?: string): Promise<boolean> => {
    const activePlayerId = playerIdOverride || recoverSession(code)?.playerId || playerIdRef.current;
    const channel = supabase.channel(`citadels-${code}`, { config: { presence: { key: activePlayerId } } });
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
          if (broadcastCallbackRef.current) broadcastCallbackRef.current(payload.payload as CitadelsBroadcast);
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
    await createRoomRecord(code, 'citadels', playerId, [{ id: playerId, name, isHost: true }]);
    storeSession(code, playerId, name, 'citadels');
  }, [playerId]);

  const joinRoom = useCallback(async (code: string, name: string): Promise<boolean> => {
    const upperCode = code.toUpperCase();
    
    // Check for existing session (rejoin from same device/browser)
    const stored = recoverSession(upperCode);
    
    // Check if room exists in DB (rejoin scenario)
    const room = await loadRoom(upperCode);
    if (room && room.phase === 'playing' && room.state) {
      // This is a rejoin — find matching player by stored ID or name
      const pid = stored?.playerId || playerId;
      const matchedPlayer = room.players.find((p: any) => p.id === pid) 
        || room.players.find((p: any) => p.name === name);
      if (!matchedPlayer) return false; // Can't join a game in progress as a new player
      
      // Use the ORIGINAL player ID from the game state so myPlayer resolves correctly
      const rejoiningId = matchedPlayer.id;
      setPlayerId(rejoiningId);
      
      // Try joining as non-host first (check if host is online)
      const result = await setupChannel(upperCode, name, false, rejoiningId);
      if (result) {
        storeSession(upperCode, rejoiningId, name, 'citadels');
        return true;
      }
      
      // Host is offline — this player becomes the new host
      await updateRoomHost(upperCode, rejoiningId);
      const hostResult = await setupChannel(upperCode, name, true, rejoiningId);
      if (hostResult) {
        storeSession(upperCode, rejoiningId, name, 'citadels');
      }
      return hostResult;
    }
    
    // Room exists in DB but not in playing state — treat as lobby rejoin
    if (room && room.phase === 'lobby') {
      const result = await setupChannel(upperCode, name, false);
      if (result) {
        storeSession(upperCode, playerId, name, 'citadels');
        return true;
      }
      // Host might be offline, try becoming host
      await updateRoomHost(upperCode, playerId);
      const hostResult = await setupChannel(upperCode, name, true);
      if (hostResult) storeSession(upperCode, playerId, name, 'citadels');
      return hostResult;
    }
    
    // Normal join (no room in DB — live lobby only)
    const result = await setupChannel(upperCode, name, false);
    if (result) {
      storeSession(upperCode, playerId, name, 'citadels');
    }
    return result;
  }, [playerId]);

  const broadcast = useCallback((event: CitadelsBroadcast) => {
    if (channelRef.current && isConnected) {
      channelRef.current.send({ type: 'broadcast', event: 'game', payload: event });
    }
  }, [isConnected]);

  return { roomCode, playerId, playerName, players, isHost, isConnected, createRoom, joinRoom, broadcast, onBroadcast, disconnect };
}
