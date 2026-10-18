import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../../../lib/supabase';
import { TheMindBroadcast } from '../types';
import { storeSession, recoverSession, createRoomRecord, updateRoomPlayers, loadRoom, updateRoomHost } from '../../../lib/roomPersistence';

export interface RoomPlayer {
  id: string;
  name: string;
  isHost: boolean;
}

export function useTheMindRoom() {
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [playerId, setPlayerId] = useState<string>(() => crypto.randomUUID());
  const [playerName, setPlayerName] = useState<string>('');
  const [players, setPlayers] = useState<RoomPlayer[]>([]);
  const [isHost, setIsHost] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const broadcastCallbackRef = useRef<((event: TheMindBroadcast) => void) | null>(null);

  const onBroadcast = useCallback((callback: (event: TheMindBroadcast) => void) => {
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
    return () => {
      disconnect();
    };
  }, [disconnect]);

  const setupChannel = async (code: string, name: string, host: boolean): Promise<boolean> => {
    const activePlayerId = recoverSession(code)?.playerId || playerId;
    const channelName = `the-mind-${code}`;
    const channel = supabase.channel(channelName, {
      config: {
        presence: {
          key: activePlayerId,
        },
      },
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
                currentPlayers.push({
                  id: presence.id,
                  name: presence.name,
                  isHost: !!presence.isHost,
                });
              }
            });
          });
          
          setPlayers(currentPlayers);
          if (host) updateRoomPlayers(code, currentPlayers);
        })
        .on('broadcast', { event: 'game' }, (payload) => {
          if (broadcastCallbackRef.current) {
            broadcastCallbackRef.current(payload.payload as TheMindBroadcast);
          }
        })
        .subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            await channel.track({
              id: activePlayerId,
              name,
              isHost: host,
            });
            
            setIsConnected(true);
            setRoomCode(code);
            setPlayerName(name);
            setIsHost(host);
            
            if (!host) {
              setTimeout(() => {
                const currentState = channel.presenceState();
                let foundHost = false;
                Object.values(currentState).forEach((presences) => {
                  presences.forEach((presence: any) => {
                    if (presence.isHost) {
                      foundHost = true;
                    }
                  });
                });
                
                if (!foundHost) {
                  disconnect();
                  resolve(false);
                } else {
                  resolve(true);
                  channel.send({ type: 'broadcast', event: 'game', payload: { type: 'request-sync' } });
                }
              }, 1000);
            } else {
              resolve(true);
            }
          } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            setIsConnected(false);
            if (!host) {
              resolve(false);
            }
          }
        });
    });
  };

  const createRoom = useCallback(async (name: string): Promise<void> => {
    const code = Array.from({ length: 4 }, () => String.fromCharCode(65 + Math.floor(Math.random() * 26))).join('');
    await setupChannel(code, name, true);
    await createRoomRecord(code, 'the-mind', playerId, [{ id: playerId, name, isHost: true }]);
    storeSession(code, playerId, name, 'the-mind');
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
      const pid = stored?.playerId || playerId;
      const wasInGame = room.players.some((p: any) => p.name === name || p.id === pid);
      if (!wasInGame) return false;
      
      const rejoiningId = stored?.playerId || pid;
      if (stored) setPlayerId(rejoiningId);
      
      const result = await setupChannel(upperCode, name, false);
      if (result) {
        storeSession(upperCode, rejoiningId, name, 'the-mind');
        return true;
      }
      
      // Host is offline — this player becomes the new host
      await updateRoomHost(upperCode, rejoiningId);
      const hostResult = await setupChannel(upperCode, name, true);
      if (hostResult) {
        storeSession(upperCode, rejoiningId, name, 'the-mind');
      }
      return hostResult;
    }
    
    // Normal join (lobby phase)
    const result = await setupChannel(upperCode, name, false);
    if (result) {
      storeSession(upperCode, playerId, name, 'the-mind');
    }
    return result;
  }, [playerId]);

  const broadcast = useCallback((event: TheMindBroadcast) => {
    if (channelRef.current && isConnected) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'game',
        payload: event,
      });
    }
  }, [isConnected]);

  return {
    roomCode,
    playerId,
    playerName,
    players,
    isHost,
    isConnected,
    createRoom,
    joinRoom,
    broadcast,
    onBroadcast,
    disconnect,
  };
}
