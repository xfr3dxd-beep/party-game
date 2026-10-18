// Shared room persistence — save/load game state to Supabase for rejoin support
import { supabase } from './supabase';

export interface PersistedRoom {
  room_code: string;
  game_type: string;
  state: any;
  players: { id: string; name: string; isHost: boolean }[];
  phase: string;
  host_id: string;
  updated_at: string;
}

// ---- LOCAL STORAGE (player identity recovery) ----

const STORAGE_KEY = 'party-game-sessions';

interface StoredSession {
  roomCode: string;
  playerId: string;
  playerName: string;
  gameType: string;
  timestamp: number;
}

function getStoredSessions(): StoredSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const sessions: StoredSession[] = JSON.parse(raw);
    // Clean up sessions older than 24 hours
    const cutoff = Date.now() - 24 * 60 * 60 * 1000;
    return sessions.filter(s => s.timestamp > cutoff);
  } catch { return []; }
}

function saveStoredSessions(sessions: StoredSession[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

/** Store session info so the player can rejoin with the same ID */
export function storeSession(roomCode: string, playerId: string, playerName: string, gameType: string) {
  const sessions = getStoredSessions().filter(s => s.roomCode !== roomCode);
  sessions.push({ roomCode, playerId, playerName, gameType, timestamp: Date.now() });
  saveStoredSessions(sessions);
}

/** Recover stored player ID for a room code (returns null if not found) */
export function recoverSession(roomCode: string): StoredSession | null {
  const sessions = getStoredSessions();
  return sessions.find(s => s.roomCode === roomCode) || null;
}

/** Clear stored session for a room */
export function clearSession(roomCode: string) {
  const sessions = getStoredSessions().filter(s => s.roomCode !== roomCode);
  saveStoredSessions(sessions);
}

// ---- SUPABASE PERSISTENCE ----

/** Create a room record in the database */
export async function createRoomRecord(roomCode: string, gameType: string, hostId: string, players: any[]) {
  const { error } = await supabase.from('party_rooms').upsert({
    room_code: roomCode,
    game_type: gameType,
    phase: 'lobby',
    host_id: hostId,
    players,
    state: null,
    updated_at: new Date().toISOString(),
  });
  if (error) console.error('createRoomRecord error:', error);
}

/** Update the player list in the room */
export async function updateRoomPlayers(roomCode: string, players: any[]) {
  const { error } = await supabase.from('party_rooms')
    .update({ players, updated_at: new Date().toISOString() })
    .eq('room_code', roomCode);
  if (error) console.error('updateRoomPlayers error:', error);
}

/** Save game state to the database (called from sync, debounced) */
export async function saveGameState(roomCode: string, state: any) {
  const { error } = await supabase.from('party_rooms')
    .update({ state, phase: 'playing', updated_at: new Date().toISOString() })
    .eq('room_code', roomCode);
  if (error) console.error('saveGameState error:', error);
}

/** Load persisted room from the database */
export async function loadRoom(roomCode: string): Promise<PersistedRoom | null> {
  const { data, error } = await supabase.from('party_rooms')
    .select('*')
    .eq('room_code', roomCode)
    .single();
  if (error || !data) return null;
  return data as PersistedRoom;
}

/** Check if a room exists and is still active */
export async function roomExists(roomCode: string): Promise<boolean> {
  const { data } = await supabase.from('party_rooms')
    .select('room_code')
    .eq('room_code', roomCode)
    .single();
  return !!data;
}

/** Mark room as finished */
export async function finishRoom(roomCode: string) {
  await supabase.from('party_rooms')
    .update({ phase: 'finished', updated_at: new Date().toISOString() })
    .eq('room_code', roomCode);
}

/** Update the host of a room */
export async function updateRoomHost(roomCode: string, hostId: string) {
  await supabase.from('party_rooms')
    .update({ host_id: hostId, updated_at: new Date().toISOString() })
    .eq('room_code', roomCode);
}

// ---- DEBOUNCED SAVE ----

const saveTimers = new Map<string, ReturnType<typeof setTimeout>>();

/** Debounced save — waits 500ms after last call before actually saving */
export function debouncedSaveState(roomCode: string, state: any) {
  const existing = saveTimers.get(roomCode);
  if (existing) clearTimeout(existing);
  const timer = setTimeout(() => {
    saveGameState(roomCode, state);
    saveTimers.delete(roomCode);
  }, 500);
  saveTimers.set(roomCode, timer);
}
