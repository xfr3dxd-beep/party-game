import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../../../lib/supabase';
import { DecryptoBroadcast } from '../types';
import { storeSession, recoverSession, createRoomRecord, updateRoomPlayers, loadRoom, updateRoomHost } from '../../../lib/roomPersistence';

export interface RoomPlayer {
  id: string;
  name: string;
  isHost: boolean;
}

export function useDecryptoRoom() {
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [playerId, setPlayerId] = useState<string>(() => crypto.randomUUID());
  const [playerName, setPlayerName] = useState<string>('');
  const [players, setPlayers] = useState<RoomPlayer[]>([]);
  const [isHost, setIsHost] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const broadcastCallbackRef = useRef<((event: DecryptoBroadcast) => void) | null>(null);

  const onBroadcast = useCallback((callback: (event: DecryptoBroadcast) => void) => {
    broadcastCallbackRef.current = callback;
  }, []);

  const disconnect = useCallback(() => {
    if (channelRef.current) {
      channelRef.current.unsubscribe();
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
    setRoomCode(null);
    setPlayers([]);
    setIsHost(false);
    setIsConnected(false);
  }, []);

  useEffect(() => {
    return () => { disconnect(); };
  }, [disconnect]);

  const playerIdRef = useRef(playerId);
  playerIdRef.current = playerId;

  const setupChannel = async (code: string, name: string, host: boolean, playerIdOverride?: string): Promise<boolean> => {
    const activePlayerId = playerIdOverride || recoverSession(code)?.playerId || playerIdRef.current;
    const channelName = `decrypto-${code}`;
    const channel = supabase.channel(channelName, {
      config: { presence: { key: activePlayerId } },
    });

    channelRef.current = channel;

    return new Promise((resolve) => {
      channel
        .on('presence', { event: 'sync' }, () => {
          const state = channel.presenceState();
          const currentPlayers: RoomPlayer[] = [];
          Object.values(state).forEach((presences) => {
            presences.forEach((presence: any) => {
              if (presence.id && presence.name) {
                currentPlayers.push({ id: presence.id, name: presence.name, isHost: !!presence.isHost });
              }
            });
          });
          setPlayers(currentPlayers);
          if (host) updateRoomPlayers(code, currentPlayers);
        })
        .on('broadcast', { event: 'game' }, (payload) => {
          if (broadcastCallbackRef.current) {
            broadcastCallbackRef.current(payload.payload as DecryptoBroadcast);
          }
        })
        .subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            await channel.track({ id: activePlayerId, name, isHost: host });
            setIsConnected(true);
            setRoomCode(code);
            setPlayerName(name);
            setIsHost(host);
            if (!host) {
              setTimeout(() => {
                const cs = channel.presenceState();
                let foundHost = false;
                Object.values(cs).forEach((p) => p.forEach((pr: any) => { if (pr.isHost) foundHost = true; }));
                if (!foundHost) { disconnect(); resolve(false); }
                else { resolve(true); channel.send({ type: 'broadcast', event: 'game', payload: { type: 'request-sync' } }); }
              }, 1000);
            } else { resolve(true); }
          } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            setIsConnected(false);
            if (!host) resolve(false);
          }
        });
    });
  };

  const createRoom = useCallback(async (name: string): Promise<void> => {
    const code = Array.from({ length: 4 }, () => String.fromCharCode(65 + Math.floor(Math.random() * 26))).join('');
    await setupChannel(code, name, true);
    await createRoomRecord(code, 'decrypto', playerId, [{ id: playerId, name, isHost: true }]);
    storeSession(code, playerId, name, 'decrypto');
  }, [playerId]);

  const joinRoom = useCallback(async (code: string, name: string): Promise<boolean> => {
    const upperCode = code.toUpperCase();
    const stored = recoverSession(upperCode);
    const room = await loadRoom(upperCode);

    if (room && room.phase === 'playing' && room.state) {
      const pid = stored?.playerId || playerId;
      const statePlayers = room.state?.players || [];
      const matchedPlayer = room.players.find((p: any) => p.id === pid)
        || statePlayers.find((p: any) => p.id === pid)
        || room.players.find((p: any) => p.name === name)
        || statePlayers.find((p: any) => p.name === name);
      if (!matchedPlayer) return false;
      const rejoiningId = matchedPlayer.id;
      setPlayerId(rejoiningId);
      const result = await setupChannel(upperCode, name, false, rejoiningId);
      if (result) { storeSession(upperCode, rejoiningId, name, 'decrypto'); return true; }
      await updateRoomHost(upperCode, rejoiningId);
      const hostResult = await setupChannel(upperCode, name, true, rejoiningId);
      if (hostResult) storeSession(upperCode, rejoiningId, name, 'decrypto');
      return hostResult;
    }

    if (room && room.phase === 'lobby') {
      const result = await setupChannel(upperCode, name, false);
      if (result) { storeSession(upperCode, playerId, name, 'decrypto'); return true; }
      await updateRoomHost(upperCode, playerId);
      const hostResult = await setupChannel(upperCode, name, true);
      if (hostResult) storeSession(upperCode, playerId, name, 'decrypto');
      return hostResult;
    }

    const result = await setupChannel(upperCode, name, false);
    if (result) storeSession(upperCode, playerId, name, 'decrypto');
    return result;
  }, [playerId]);

  const broadcast = useCallback((event: DecryptoBroadcast) => {
    if (channelRef.current && isConnected) {
      channelRef.current.send({ type: 'broadcast', event: 'game', payload: event });
    }
  }, [isConnected]);

  return { roomCode, playerId, playerName, players, isHost, isConnected, createRoom, joinRoom, broadcast, onBroadcast, disconnect };
}
