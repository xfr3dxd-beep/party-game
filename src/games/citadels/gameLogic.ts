// Citadels — Pure Game Logic Functions

import {
  CitadelsState, CitadelsPlayer, DistrictCard, BuiltDistrict,
  DraftState, ScoreBreakdown, TaxEntry,
} from './types';
import { getCharacterById, ALL_CHARACTERS } from './characters';
import { getDistrictById, ALL_VIOLA } from './districts';

// ---- HELPERS ----

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function drawCards(deck: DistrictCard[], count: number): { drawn: DistrictCard[]; remaining: DistrictCard[] } {
  const drawn = deck.slice(0, count);
  const remaining = deck.slice(count);
  return { drawn, remaining };
}

export function returnToBottom(deck: DistrictCard[], cards: DistrictCard[]): DistrictCard[] {
  return [...deck, ...cards];
}

// ---- DRAFT ----

/**
 * Setup the draft state based on player count.
 * Characters must be sorted by rank in the pool.
 */
export function setupDraft(
  characterPool: number[],
  playerCount: number,
  crownHolderId: string,
  players: CitadelsPlayer[],
): DraftState {
  const shuffled = shuffle(characterPool);
  const faceDownId = shuffled[0];
  let faceUpCount = 0;
  if (playerCount === 4) faceUpCount = 2;
  else if (playerCount === 5) faceUpCount = 1;
  // 6+ players: 0 face-up

  let faceUpIds = shuffled.slice(1, 1 + faceUpCount);
  const remaining = shuffled.slice(1 + faceUpCount);

  // If rank 4 (Re/Imperatore/Patrizio) is face-up, replace it
  const rank4Ids = [10, 11, 12];
  for (let i = 0; i < faceUpIds.length; i++) {
    if (rank4Ids.includes(faceUpIds[i])) {
      // Put it back in remaining and draw a new one
      const replaced = faceUpIds[i];
      remaining.push(replaced);
      const newShuffle = shuffle(remaining);
      // Find one that's NOT rank 4
      const replIdx = newShuffle.findIndex(id => !rank4Ids.includes(id));
      if (replIdx >= 0) {
        faceUpIds[i] = newShuffle[replIdx];
        newShuffle.splice(replIdx, 1);
        remaining.length = 0;
        remaining.push(...newShuffle);
      }
    }
  }

  // Pick order: start from crown holder, then clockwise
  const crownIdx = players.findIndex(p => p.id === crownHolderId);
  const pickOrder: string[] = [];
  for (let i = 0; i < playerCount; i++) {
    pickOrder.push(players[(crownIdx + i) % playerCount].id);
  }

  return {
    faceDownId,
    faceUpIds,
    remainingIds: remaining,
    currentPickerIndex: 0,
    pickOrder,
    picks: {},
    phase: 'picking',
  };
}

/**
 * Player picks a character from remaining.
 * Returns updated draft state.
 */
export function pickCharacter(draft: DraftState, playerId: string, charId: number, playerCount: number): DraftState {
  const newPicks = { ...draft.picks, [playerId]: charId };
  const newRemaining = draft.remainingIds.filter(id => id !== charId);
  const nextIdx = draft.currentPickerIndex + 1;
  const totalPickers = draft.pickOrder.length;

  // Special rules for last picks:
  // 7 players: 7th player chooses between remaining card + face-down card
  // 8 players: 8th player chooses between remaining card + face-down card
  // 9 players: 8th player picks, unchosen goes to 9th

  if (nextIdx >= totalPickers) {
    return { ...draft, picks: newPicks, remainingIds: newRemaining, currentPickerIndex: nextIdx, phase: 'done' };
  }

  // For 7-player game, when 6th player picks (index 5), the 7th sees remaining + faceDown
  // For 8-player game, when 7th player picks (index 6), the 8th sees remaining + faceDown
  // For 9-player game, when 7th picks (index 6), 8th sees remaining + faceDown, 9th gets unchosen
  if (playerCount >= 7 && nextIdx === totalPickers - 1 && newRemaining.length === 1) {
    // Next (last or second-to-last) player gets remaining + faceDown to choose from
    return {
      ...draft,
      picks: newPicks,
      remainingIds: [...newRemaining, draft.faceDownId],
      currentPickerIndex: nextIdx,
      phase: 'picking',
    };
  }

  if (playerCount === 9 && nextIdx === totalPickers - 2 && newRemaining.length === 1) {
    // 8th player gets remaining + faceDown
    return {
      ...draft,
      picks: newPicks,
      remainingIds: [...newRemaining, draft.faceDownId],
      currentPickerIndex: nextIdx,
      phase: 'picking',
    };
  }

  return { ...draft, picks: newPicks, remainingIds: newRemaining, currentPickerIndex: nextIdx, phase: 'picking' };
}

/**
 * Assign characters to players after draft is complete.
 * For 9 players, the 9th player gets the unchosen card from the 8th player's choice.
 */
export function assignCharacters(players: CitadelsPlayer[], draft: DraftState): CitadelsPlayer[] {
  return players.map(p => ({
    ...p,
    characterId: draft.picks[p.id] ?? null,
    isAlive: true,
    isBewitched: false,
    hasGathered: false,
    buildsUsed: 0,
    maxBuilds: 1,
    hasUsedEffect: false,
    goldSpentThisTurn: 0,
    magistrateToken: null,
    blackmailerToken: null,
    blackmailerPaid: false,
  }));
}

// ---- TURN ORDER ----

/** Get characters in rank order for calling */
export function getCallOrder(characterPool: number[], players: CitadelsPlayer[]): number[] {
  // Sort by rank
  return [...characterPool].sort((a, b) => {
    const ca = getCharacterById(a);
    const cb = getCharacterById(b);
    return ca.rank - cb.rank;
  });
}

/** Find which player has a given character */
export function findPlayerByCharacter(players: CitadelsPlayer[], charId: number): CitadelsPlayer | undefined {
  return players.find(p => p.characterId === charId);
}

// ---- RESOURCES ----

/** Count districts of a color in player's city */
export function countDistrictsByColor(player: CitadelsPlayer, color: string): number {
  return player.builtDistricts.filter(bd => {
    const d = getDistrictById(bd.districtId);
    return d.color === color;
  }).length;
}

/** Check if player has a built district by id */
export function hasBuiltDistrict(player: CitadelsPlayer, districtId: number): boolean {
  return player.builtDistricts.some(bd => bd.districtId === districtId);
}

/** Check if player has a built district by name */
export function hasBuiltDistrictByName(player: CitadelsPlayer, nameIt: string): boolean {
  return player.builtDistricts.some(bd => getDistrictById(bd.districtId).nameIt === nameIt);
}

/** Count total built districts (Monumento counts as 2) */
export function countBuiltDistricts(player: CitadelsPlayer): number {
  let count = 0;
  for (const bd of player.builtDistricts) {
    if (bd.districtId === 514) count += 2; // Monumento
    else count += 1;
  }
  return count;
}

// ---- BUILDING ----

/** Check if a player can build a district */
export function canBuild(player: CitadelsPlayer, card: DistrictCard, state: CitadelsState): { ok: boolean; reason?: string } {
  const district = getDistrictById(card.districtId);

  // Volta Segreta can never be built
  if (district.id === 530) return { ok: false, reason: 'La Volta Segreta non può essere costruita.' };

  // Monumento: can't build if 5+ districts
  if (district.id === 514 && countBuiltDistricts(player) >= 5) {
    return { ok: false, reason: 'Non puoi costruire il Monumento se hai già 5+ quartieri.' };
  }

  // Can't build same name unless you have Cava (505)
  if (!hasBuiltDistrict(player, 505) && hasBuiltDistrictByName(player, district.nameIt)) {
    return { ok: false, reason: 'Hai già un quartiere con questo nome.' };
  }

  // Cost check
  let cost = district.cost;
  // Fabbrica discount for viola
  if (district.isUnique && hasBuiltDistrict(player, 507)) cost = Math.max(0, cost - 1);

  if (player.gold < cost) return { ok: false, reason: 'Oro insufficiente.' };

  return { ok: true };
}

// ---- SCORING ----

export function calculateScore(player: CitadelsPlayer, state: CitadelsState): { total: number; breakdown: ScoreBreakdown } {
  let districtCosts = 0;
  const colorsOwned = new Set<string>();

  for (const bd of player.builtDistricts) {
    const d = getDistrictById(bd.districtId);
    districtCosts += d.cost + (bd.artisanCoins || 0);
    colorsOwned.add(d.color);
  }

  // Quartiere Stregato (522) counts as any color for diversity
  if (hasBuiltDistrict(player, 522)) {
    // Add missing colors
    for (const c of ['blue', 'green', 'yellow', 'red', 'purple']) colorsOwned.add(c);
  }

  const colorDiversity = colorsOwned.size >= 5 ? 3 : 0;

  // First to 7 bonus
  let firstTo7Bonus = 0;
  if (state.firstTo7PlayerId === player.id) firstTo7Bonus = 4;
  else if (countBuiltDistricts(player) >= 7 && state.gameEndRound === state.roundNumber) firstTo7Bonus = 2;

  // Viola bonuses
  const violaBonuses: { name: string; points: number }[] = [];

  // Basilica (502): 1pt per odd-cost district
  if (hasBuiltDistrict(player, 502)) {
    const oddCount = player.builtDistricts.filter(bd => getDistrictById(bd.districtId).cost % 2 === 1).length;
    if (oddCount > 0) violaBonuses.push({ name: 'Basilica', points: oddCount });
  }

  // Campidoglio (504): 3pts if 3+ districts of same color
  if (hasBuiltDistrict(player, 504)) {
    const colorCounts: Record<string, number> = {};
    for (const bd of player.builtDistricts) {
      const c = getDistrictById(bd.districtId).color;
      colorCounts[c] = (colorCounts[c] || 0) + 1;
    }
    if (Object.values(colorCounts).some(c => c >= 3)) {
      violaBonuses.push({ name: 'Campidoglio', points: 3 });
    }
  }

  // Porta dei Draghi (520): +2pts
  if (hasBuiltDistrict(player, 520)) violaBonuses.push({ name: 'Porta dei Draghi', points: 2 });

  // Pozzo dei Desideri (521): 1pt per viola built
  if (hasBuiltDistrict(player, 521)) {
    const violaCount = player.builtDistricts.filter(bd => getDistrictById(bd.districtId).color === 'purple').length;
    violaBonuses.push({ name: 'Pozzo dei Desideri', points: violaCount });
  }

  // Sala delle Mappe (523): 1pt per card in hand
  if (hasBuiltDistrict(player, 523)) {
    violaBonuses.push({ name: 'Sala delle Mappe', points: player.hand.length });
  }

  // Tesoreria Imperiale (528): 1pt per gold
  if (hasBuiltDistrict(player, 528)) {
    violaBonuses.push({ name: 'Tesoreria Imperiale', points: player.gold });
  }

  // Torre d'Avorio (529): 5pts if only viola
  if (hasBuiltDistrict(player, 529)) {
    const violaBuilt = player.builtDistricts.filter(bd => getDistrictById(bd.districtId).color === 'purple').length;
    if (violaBuilt === 1) violaBonuses.push({ name: "Torre d'Avorio", points: 5 });
  }

  // Statua (526): 5pts if has crown
  if (hasBuiltDistrict(player, 526) && player.hasCrown) {
    violaBonuses.push({ name: 'Statua', points: 5 });
  }

  // Museo (515): 1pt per card tucked
  if (hasBuiltDistrict(player, 515)) {
    const museo = player.builtDistricts.find(bd => bd.districtId === 515);
    if (museo && museo.museumCards > 0) violaBonuses.push({ name: 'Museo', points: museo.museumCards });
  }

  // Volta Segreta (530): 3pts if in hand at end
  if (player.hand.some(c => c.districtId === 530)) {
    violaBonuses.push({ name: 'Volta Segreta', points: 3 });
  }

  const violaTotal = violaBonuses.reduce((sum, b) => sum + b.points, 0);
  const total = districtCosts + colorDiversity + firstTo7Bonus + violaTotal;

  return {
    total,
    breakdown: { districtCosts, colorDiversity, firstTo7Bonus, violaBonuses },
  };
}

// ---- GAME END ----

export function checkGameEnd(players: CitadelsPlayer[]): string | null {
  for (const p of players) {
    if (countBuiltDistricts(p) >= 7) return p.id;
  }
  return null;
}

// ---- INITIAL STATE ----

export function createInitialState(): CitadelsState {
  return {
    phase: 'create',
    roomCode: '',
    players: [],
    characterPool: [],
    violaPool: [],
    presetName: '',
    districtDeck: [],
    discardPile: [],
    draftState: null,
    roundNumber: 0,
    crownHolderId: '',
    currentRank: 0,
    activePlayerId: null,
    calledRanks: [],
    assassinatedRank: null,
    robbedRank: null,
    bewitchedRank: null,
    taxPool: [],
    effectContext: null,
    drawnCards: null,
    firstTo7PlayerId: null,
    gameEndTriggered: false,
    gameEndRound: 0,
    scores: null,
  };
}
