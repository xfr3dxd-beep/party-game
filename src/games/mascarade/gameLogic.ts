import { MascaradePlayer } from './types';
import { getRolesForGame } from './roles';

// Fisher-Yates shuffle
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function dealRoles(
  players: { id: string; name: string }[],
  playerCount: number,
  variant: 'A' | 'B'
): { players: MascaradePlayer[]; rolesInGame: number[] } {
  const roleIds = getRolesForGame(playerCount, variant);
  const shuffled = shuffle(roleIds);
  const gamePlayers: MascaradePlayer[] = players.map((p, i) => ({
    id: p.id,
    name: p.name,
    roleId: shuffled[i],
    coins: 6,
    seatIndex: i,
    hasViewedCard: false,
    hasIntroduced: false,
  }));
  return { players: gamePlayers, rolesInGame: roleIds };
}

// Get next player index (clockwise)
export function nextSeat(current: number, total: number): number {
  return (current + 1) % total;
}

// Get left neighbor (clockwise = next seat)
export function getLeftNeighbor(seatIndex: number, players: MascaradePlayer[]): MascaradePlayer {
  const nextIdx = (seatIndex + 1) % players.length;
  return players.find(p => p.seatIndex === nextIdx)!;
}

// Get right neighbor
export function getRightNeighbor(seatIndex: number, players: MascaradePlayer[]): MascaradePlayer {
  const prevIdx = (seatIndex - 1 + players.length) % players.length;
  return players.find(p => p.seatIndex === prevIdx)!;
}

// Safe coin transfer: can't go negative
export function transferCoins(
  from: MascaradePlayer, to: MascaradePlayer, amount: number,
  players: MascaradePlayer[]
): MascaradePlayer[] {
  const actual = Math.min(amount, from.coins);
  return players.map(p => {
    if (p.id === from.id) return { ...p, coins: p.coins - actual };
    if (p.id === to.id) return { ...p, coins: p.coins + actual };
    return p;
  });
}

// Give coins from bank (infinite)
export function giveFromBank(playerId: string, amount: number, players: MascaradePlayer[]): MascaradePlayer[] {
  return players.map(p => p.id === playerId ? { ...p, coins: p.coins + amount } : p);
}

// Take coin to pot
export function payToPot(playerId: string, amount: number, players: MascaradePlayer[]): { players: MascaradePlayer[]; potAdd: number } {
  const player = players.find(p => p.id === playerId)!;
  const actual = Math.min(amount, player.coins);
  return {
    players: players.map(p => p.id === playerId ? { ...p, coins: p.coins - actual } : p),
    potAdd: actual,
  };
}

// Check win: 13 coins or Baro with 10+
export function checkWin(players: MascaradePlayer[]): string | null {
  for (const p of players) {
    if (p.coins >= 13) return p.id;
  }
  return null;
}

// Get richest players
export function getRichest(players: MascaradePlayer[]): MascaradePlayer[] {
  const max = Math.max(...players.map(p => p.coins));
  return players.filter(p => p.coins === max);
}

// Resolve Mendicante effect
export function resolveMendicante(mendicanteId: string, players: MascaradePlayer[]): MascaradePlayer[] {
  let ps = [...players.map(p => ({ ...p }))];
  const mend = ps.find(p => p.id === mendicanteId)!;
  const mendSeat = mend.seatIndex;
  const total = ps.length;

  // Go clockwise from mendicante's left
  for (let i = 1; i < total; i++) {
    const targetSeat = (mendSeat + i) % total;
    const target = ps.find(p => p.seatIndex === targetSeat)!;
    const currentMend = ps.find(p => p.id === mendicanteId)!;
    if (target.coins > currentMend.coins) {
      target.coins -= 1;
      const m = ps.find(p => p.id === mendicanteId)!;
      m.coins += 1;
    }
  }
  return ps;
}

// Swap two players' cards (secretly)
export function swapCards(p1Id: string, p2Id: string, players: MascaradePlayer[]): MascaradePlayer[] {
  const p1 = players.find(p => p.id === p1Id)!;
  const p2 = players.find(p => p.id === p2Id)!;
  const r1 = p1.roleId;
  const r2 = p2.roleId;
  return players.map(p => {
    if (p.id === p1Id) return { ...p, roleId: r2 };
    if (p.id === p2Id) return { ...p, roleId: r1 };
    return p;
  });
}

// Swap two players' seats (Marionettista: names move, cards stay)
export function swapSeats(p1Id: string, p2Id: string, players: MascaradePlayer[]): MascaradePlayer[] {
  const p1 = players.find(p => p.id === p1Id)!;
  const p2 = players.find(p => p.id === p2Id)!;
  const s1 = p1.seatIndex;
  const s2 = p2.seatIndex;
  return players.map(p => {
    if (p.id === p1Id) return { ...p, seatIndex: s2 };
    if (p.id === p2Id) return { ...p, seatIndex: s1 };
    return p;
  });
}

// Swap all coins between two players
export function swapCoins(p1Id: string, p2Id: string, players: MascaradePlayer[]): MascaradePlayer[] {
  const p1 = players.find(p => p.id === p1Id)!;
  const p2 = players.find(p => p.id === p2Id)!;
  const c1 = p1.coins;
  const c2 = p2.coins;
  return players.map(p => {
    if (p.id === p1Id) return { ...p, coins: c2 };
    if (p.id === p2Id) return { ...p, coins: c1 };
    return p;
  });
}

// Get player by seat index
export function getPlayerBySeat(seat: number, players: MascaradePlayer[]): MascaradePlayer | undefined {
  return players.find(p => p.seatIndex === seat);
}

// Get active player by turn
export function getActivePlayer(players: MascaradePlayer[], turnIndex: number): MascaradePlayer {
  // turnIndex is the seatIndex of the active player
  return players.find(p => p.seatIndex === turnIndex)!;
}
