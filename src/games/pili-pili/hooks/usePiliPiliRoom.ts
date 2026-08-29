import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../../../lib/supabase';
import { PiliPiliBroadcast } from '../types';

export interface RoomPlayer {
  id: string;
  name: string;
  isHost: boolean;
}

export function usePiliPiliRoom() {
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [playerId] = useState(() => crypto.randomUUID());
  const [playerName, setPlayerName] = useState<string>('');
  const [players, setPlayers] = useState<RoomPlayer[]>([]);
  const [isHost, setIsHost] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const broadcastCallbackRef = useRef<((event: PiliPiliBroadcast) => void) | null>(null);

  const onBroadcast = useCallback((callback: (event: PiliPiliBroadcast) => void) => {
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
    const channelName = `pili-pili-${code}`;
    const channel = supabase.channel(channelName, {
      config: {
        presence: {
          key: playerId,
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
          
          // Sort players so host is first, or by name, etc.
          setPlayers(currentPlayers);
        })
        .on('broadcast', { event: 'game' }, (payload) => {
          if (broadcastCallbackRef.current) {
            broadcastCallbackRef.current(payload.payload as PiliPiliBroadcast);
          }
        })
        .subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            await channel.track({
              id: playerId,
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
                    if (presence.isHost) foundHost = true;
                  });
                });
                
                if (!foundHost) {
                  disconnect();
                  resolve(false);
                } else {
                  resolve(true);
                }
              }, 1000);
            } else {
              resolve(true);
            }
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
  }, [playerId, setupChannel]);

  const joinRoom = useCallback(async (code: string, name: string): Promise<boolean> => {
    return await setupChannel(code.toUpperCase(), name, false);
  }, [playerId, setupChannel]);

  const broadcast = useCallback((event: PiliPiliBroadcast) => {
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
