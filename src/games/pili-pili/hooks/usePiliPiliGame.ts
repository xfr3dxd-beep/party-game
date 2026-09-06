import { useState, useEffect, useCallback, useRef } from 'react';
import { PiliPiliState, PiliPiliBroadcast, PiliPiliPlayer } from '../types';
import { RoomPlayer } from './usePiliPiliRoom';
import { dealCards, drawMission, getNextPlayerId, resolveTrick, shuffle } from '../gameLogic';

interface UsePiliPiliGameProps {
  playerId: string;
  isHost: boolean;
  players: RoomPlayer[];
  broadcast: (event: PiliPiliBroadcast) => void;
  onBroadcast: (cb: (event: PiliPiliBroadcast) => void) => void;
}

const emptyState: PiliPiliState = {
  phase: 'create', roomCode: '', players: [], currentMission: null,
  roundNumber: 0, currentTrick: [], trickNumber: 0, totalTricks: 0,
  leadPlayerId: null, currentTurnId: null, usedMissionIds: [], dealerId: null,
  swapSelections: {}, swapTrickWinnerId: null, swapTrickTargetId: null,
  swapTrickWinnerCard: null, swapTrickTargetCard: null,
  lastTrickCards: [], lastTrickWinnerId: null,
  timedBetting: false, timedBetSeconds: 0, extraDeck: [],
  foreheadRevealed: {}, foreheadSelectDone: {},
  piliTransferTargets: {}, simultaneousCards: {},
  blindPlay: false, allHandsVisible: false,
  previousBetValue: null, piliEarnedThisRound: {},
};

export function usePiliPiliGame({ playerId, isHost, players, broadcast, onBroadcast }: UsePiliPiliGameProps) {
  const [state, setState] = useState<PiliPiliState>(emptyState);
  const stRef = useRef(state);
  stRef.current = state;
  const bcRef = useRef(broadcast);
  bcRef.current = broadcast;

  const sync = useCallback((s: PiliPiliState) => {
    setState(s); stRef.current = s;
    if (isHost) bcRef.current({ type: 'sync', payload: s });
  }, [isHost]);

  useEffect(() => {
    if (isHost && stRef.current.phase === 'create' && players.length > 0) {
      const np: PiliPiliPlayer[] = players.map(p =>
        stRef.current.players.find(ep => ep.id === p.id) ||
        { id: p.id, name: p.name, hand: [], pilis: 0, bet: null, tricksWon: 0 }
      );
      if (np.length !== stRef.current.players.length) sync({ ...stRef.current, players: np });
    }
  }, [isHost, players, sync]);

  const leftOf = (ps: PiliPiliPlayer[], id: string) => ps[(ps.findIndex(p => p.id === id) + 1) % ps.length].id;
  const rightOf = (ps: PiliPiliPlayer[], id: string) => ps[(ps.findIndex(p => p.id === id) - 1 + ps.length) % ps.length].id;

  const doDirectionalSwap = (s: PiliPiliState): PiliPiliState => {
    const m = s.currentMission; if (!m?.swapDirection) return s;
    const ps = s.players.map(p => ({ ...p, hand: [...p.hand] }));
    const giving: Record<string, number[]> = {};
    for (const p of ps) { giving[p.id] = s.swapSelections[p.id] || []; p.hand = p.hand.filter(c => !giving[p.id].includes(c)); }
    for (const p of ps) {
      const nId = m.swapDirection === 'left' ? rightOf(ps, p.id) : leftOf(ps, p.id);
      p.hand = [...p.hand, ...(giving[nId] || [])].sort((a, b) => a - b);
    }
    return { ...s, players: ps, swapSelections: {} };
  };

  const afterTrick = (s: PiliPiliState, winnerId: string): PiliPiliState => {
    const wi = s.players.findIndex(p => p.id === winnerId);
    s.players[wi] = { ...s.players[wi], tricksWon: s.players[wi].tricksWon + 1 };
    s.trickNumber += 1;
    if (s.currentMission?.penaltyFirstLast && (s.trickNumber === 1 || s.trickNumber === s.totalTricks))
      s.players[wi] = { ...s.players[wi], pilis: s.players[wi].pilis + 1 };
    if (s.currentMission?.penaltyRange) {
      const [lo, hi] = s.currentMission.penaltyRange;
      const wc = s.currentTrick.find(c => c.playerId === winnerId)?.card || 0;
      if (wc >= lo && wc <= hi) s.players[wi] = { ...s.players[wi], pilis: s.players[wi].pilis + 1 };
    }
    s.lastTrickCards = [...s.currentTrick]; s.lastTrickWinnerId = winnerId;
    s.phase = 'trick-result';
    return s;
  };

  const afterTrickDismissed = (s: PiliPiliState): PiliPiliState => {
    const wId = s.lastTrickWinnerId!;
    if (s.trickNumber >= s.totalTricks) {
      // Round over — calc penalties
      const earned: Record<string, number> = {};
      s.players = s.players.map(p => {
        const diff = Math.abs((p.bet || 0) - p.tricksWon);
        let np = p.pilis + diff;
        if (diff === 0 && s.currentMission?.bonusPrecise) {
          const amt = s.currentMission.bonusPreciseAmount === 'bet-value' ? (p.bet || 0) : 1;
          np = Math.max(0, np - amt);
        }
        earned[p.id] = diff; // pili earned this round (before transfer)
        return { ...p, pilis: np };
      });
      // Pili transfer (missions 21, 34)
      if (s.currentMission?.transferPili && Object.keys(s.piliTransferTargets).length > 0) {
        s.players = s.players.map(p => {
          const targetId = s.piliTransferTargets[p.id];
          if (targetId) {
            const targetEarned = earned[targetId] || 0;
            return { ...p, pilis: p.pilis + targetEarned };
          }
          return p;
        });
      }
      s.phase = s.players.some(p => p.pilis >= 7) ? 'game-over' : 'round-result';
      s.currentTrick = [];
    } else if (s.currentMission?.swapAfterTrick) {
      const wi = s.players.findIndex(p => p.id === wId);
      if (s.players[wi].hand.length > 0) {
        s.swapTrickWinnerId = wId; s.swapTrickTargetId = null;
        s.swapTrickWinnerCard = null; s.swapTrickTargetCard = null;
        s.phase = 'swap-after-trick'; s.currentTrick = [];
      } else { s.leadPlayerId = wId; s.currentTurnId = wId; s.currentTrick = []; s.phase = 'play'; }
    } else {
      s.leadPlayerId = wId; s.currentTurnId = wId; s.currentTrick = []; s.phase = 'play';
    }
    return s;
  };

  const afterAllBets = (s: PiliPiliState): PiliPiliState => {
    const m = s.currentMission;
    if (m?.drawAfterBet && s.extraDeck.length > 0) {
      s.players = s.players.map(p => {
        const drawn = s.extraDeck.splice(0, m.drawAfterBet!);
        return { ...p, hand: [...p.hand, ...drawn].sort((a, b) => a - b) };
      });
      s.totalTricks = s.players[0].hand.length;
    }
    if (m?.swapDirection && m.swapTiming === 'after-bet') {
      if (m.swapCount === -1) {
        const sel: Record<string, number[]> = {};
        for (const p of s.players) sel[p.id] = [...p.hand];
        s.swapSelections = sel;
        const sw = doDirectionalSwap(s);
        Object.assign(s, { players: sw.players, swapSelections: {} });
        s.phase = 'play'; s.currentTurnId = getNextPlayerId(s.players, s.dealerId!);
        s.leadPlayerId = s.currentTurnId; s.currentTrick = [];
      } else { s.phase = 'swapping'; s.swapSelections = {}; }
    } else {
      s.phase = 'play'; s.currentTurnId = getNextPlayerId(s.players, s.dealerId!);
      s.leadPlayerId = s.currentTurnId; s.currentTrick = [];
    }
    // Set blind play for missions 19, 32
    if (m?.blindAfterView) s.blindPlay = true;
    // Set all hands visible for missions 13, 27
    if (m?.openHands) s.allHandsVisible = true;
    return s;
  };

  const proc = useCallback((action: string, payload: any) => {
    if (!isHost) return;
    const s = { ...stRef.current };

    if (action === 'start' || action === 'next-round') {
      s.roundNumber += 1;
      s.dealerId = s.dealerId ? getNextPlayerId(s.players, s.dealerId) : s.players[0].id;
      const m = drawMission(s.usedMissionIds);
      s.currentMission = m; s.usedMissionIds = [...s.usedMissionIds, m.id];
      s.players = dealCards(s.players, m.cardsPerPlayer, !!m.jokerInPlay);
      s.totalTricks = m.cardsPerPlayer; s.trickNumber = 0; s.currentTrick = [];
      s.lastTrickCards = []; s.lastTrickWinnerId = null;
      s.swapSelections = {}; s.swapTrickWinnerId = null; s.swapTrickTargetId = null;
      s.swapTrickWinnerCard = null; s.swapTrickTargetCard = null;
      s.timedBetting = false; s.timedBetSeconds = 0;
      s.foreheadRevealed = {}; s.foreheadSelectDone = {};
      s.piliTransferTargets = {}; s.simultaneousCards = {};
      s.blindPlay = false; s.allHandsVisible = false;
      s.previousBetValue = null; s.piliEarnedThisRound = {};
      if (m.drawAfterBet) {
        const used = s.players.flatMap(p => p.hand);
        s.extraDeck = shuffle(Array.from({ length: 55 }, (_, i) => i + 1).filter(c => !used.includes(c)));
      } else { s.extraDeck = []; }
      if (m.timedView) { s.timedBetting = true; s.timedBetSeconds = m.timedView; }
      // Forehead missions: go to forehead-select first
      if (m.foreheadCards && m.foreheadCount) { s.phase = 'forehead-select'; }
      else { s.phase = 'mission'; }
      s.currentTurnId = null;
      sync(s);

    } else if (action === 'proceed-to-betting') {
      // Check if pili transfer mission: need transfer select first
      if (s.currentMission?.transferPili) {
        s.phase = 'pili-transfer-select'; s.piliTransferTargets = {};
      } else {
        s.phase = 'betting'; s.currentTurnId = getNextPlayerId(s.players, s.dealerId!);
      }
      sync(s);

    } else if (action === 'auto-proceed-timed') {
      s.phase = 'betting'; s.currentTurnId = null; // simultaneous
      sync(s);

    } else if (action === 'forehead-select') {
      // Player chose cards to reveal (missions 10, 11)
      const { pId, cards } = payload;
      s.foreheadRevealed = { ...s.foreheadRevealed, [pId]: cards };
      s.foreheadSelectDone = { ...s.foreheadSelectDone, [pId]: true };
      if (Object.keys(s.foreheadSelectDone).length === s.players.length) {
        s.allHandsVisible = false; // only forehead cards visible
        s.phase = 'mission'; // show mission then proceed to betting
      }
      sync(s);

    } else if (action === 'pili-transfer-select') {
      // Player chose target for pili transfer (missions 21, 34)
      const { pId, targetId } = payload;
      s.piliTransferTargets = { ...s.piliTransferTargets, [pId]: targetId };
      if (Object.keys(s.piliTransferTargets).length === s.players.length) {
        s.phase = 'betting'; s.currentTurnId = getNextPlayerId(s.players, s.dealerId!);
      }
      sync(s);

    } else if (action === 'bet') {
      const { pId, bet } = payload;
      const pi = s.players.findIndex(p => p.id === pId);
      if (pi === -1 || s.players[pi].bet !== null) return;
      s.players = [...s.players]; s.players[pi] = { ...s.players[pi], bet };
      s.previousBetValue = bet; // track for noCopyBet
      if (s.players.every(p => p.bet !== null)) {
        const r = afterAllBets(s); sync(r);
      } else {
        if (s.currentTurnId !== null) s.currentTurnId = getNextPlayerId(s.players, pId);
        sync(s);
      }

    } else if (action === 'force-bets') {
      s.players = s.players.map(p => p.bet === null ? { ...p, bet: s.totalTricks } : p);
      const r = afterAllBets(s); sync(r);

    } else if (action === 'swap-select') {
      const { pId, cards } = payload;
      s.swapSelections = { ...s.swapSelections, [pId]: cards };
      if (Object.keys(s.swapSelections).length === s.players.length) {
        const sw = doDirectionalSwap(s);
        Object.assign(s, { players: sw.players, swapSelections: {} });
        s.phase = 'play'; s.currentTurnId = getNextPlayerId(s.players, s.dealerId!);
        s.leadPlayerId = s.currentTurnId; s.currentTrick = [];
      }
      sync(s);

    } else if (action === 'play') {
      const { pId, card } = payload;
      if (s.currentMission?.simultaneousPlay) {
        // Simultaneous: collect choices
        s.simultaneousCards = { ...s.simultaneousCards, [pId]: card };
        if (Object.keys(s.simultaneousCards).length === s.players.length) {
          // All chose — remove cards from hands and build trick
          s.players = s.players.map(p => ({
            ...p, hand: p.hand.filter(c => c !== s.simultaneousCards[p.id])
          }));
          s.currentTrick = s.players.map(p => ({ playerId: p.id, card: s.simultaneousCards[p.id] }));
          s.simultaneousCards = {};
          const wId = resolveTrick(s.currentTrick, s.currentMission?.invertWinner);
          const r = afterTrick(s, wId); sync(r);
        } else { sync(s); }
      } else {
        if (s.currentTurnId !== pId) return;
        const pi = s.players.findIndex(p => p.id === pId);
        s.players = [...s.players];
        s.players[pi] = { ...s.players[pi], hand: s.players[pi].hand.filter(c => c !== card) };
        s.currentTrick = [...s.currentTrick, { playerId: pId, card }];
        if (s.currentTrick.length === s.players.length) {
          const wId = resolveTrick(s.currentTrick, s.currentMission?.invertWinner);
          const r = afterTrick(s, wId); sync(r);
        } else { s.currentTurnId = getNextPlayerId(s.players, pId); sync(s); }
      }

    } else if (action === 'dismiss-trick-result') {
      const r = afterTrickDismissed(s); sync(r);

    } else if (action === 'swap-trick-target') {
      s.swapTrickTargetId = payload.targetId; sync(s);
    } else if (action === 'swap-trick-card') {
      const { pId, card } = payload;
      if (pId === s.swapTrickWinnerId) s.swapTrickWinnerCard = card;
      else if (pId === s.swapTrickTargetId) s.swapTrickTargetCard = card;
      if (s.swapTrickWinnerCard !== null && s.swapTrickTargetCard !== null) {
        const wId = s.swapTrickWinnerId!; const tId = s.swapTrickTargetId!;
        s.players = s.players.map(p => {
          if (p.id === wId) { const h = p.hand.filter(c => c !== s.swapTrickWinnerCard); h.push(s.swapTrickTargetCard!); return { ...p, hand: h.sort((a, b) => a - b) }; }
          if (p.id === tId) { const h = p.hand.filter(c => c !== s.swapTrickTargetCard); h.push(s.swapTrickWinnerCard!); return { ...p, hand: h.sort((a, b) => a - b) }; }
          return p;
        });
        s.phase = 'play'; s.leadPlayerId = wId; s.currentTurnId = wId;
        s.swapTrickWinnerId = null; s.swapTrickTargetId = null;
        s.swapTrickWinnerCard = null; s.swapTrickTargetCard = null;
      }
      sync(s);

    } else if (action === 'new-game') {
      const rp = s.players.map(p => ({ ...p, pilis: 0, bet: null, hand: [] as number[], tricksWon: 0 }));
      const ns: PiliPiliState = { ...emptyState, players: rp, roomCode: s.roomCode };
      ns.roundNumber = 1; ns.dealerId = ns.players[0].id;
      const m = drawMission([]); ns.currentMission = m; ns.usedMissionIds = [m.id];
      ns.players = dealCards(ns.players, m.cardsPerPlayer, !!m.jokerInPlay);
      ns.totalTricks = m.cardsPerPlayer;
      if (m.timedView) { ns.timedBetting = true; ns.timedBetSeconds = m.timedView; }
      if (m.drawAfterBet) { const u = ns.players.flatMap(p => p.hand); ns.extraDeck = shuffle(Array.from({ length: 55 }, (_, i) => i + 1).filter(c => !u.includes(c))); }
      if (m.foreheadCards && m.foreheadCount) ns.phase = 'forehead-select';
      else ns.phase = 'mission';
      sync(ns);
    }
  }, [isHost, sync]);

  useEffect(() => {
    onBroadcast((ev) => {
      if (!isHost && ev.type === 'sync') { setState(ev.payload); stRef.current = ev.payload; }
      else if (isHost && ev.type === 'action') proc(ev.action!, ev.payload);
    });
  }, [onBroadcast, isHost, proc]);

  const act = useCallback((a: string, p?: any) => {
    if (isHost) proc(a, p); else bcRef.current({ type: 'action', action: a, payload: p });
  }, [isHost, proc]);

  const my = state.players.find(p => p.id === playerId);
  return {
    state, myPlayer: my, myHand: my?.hand || [],
    startGame: useCallback(() => act('start'), [act]),
    proceedToBetting: useCallback(() => act('proceed-to-betting'), [act]),
    autoProceedTimed: useCallback(() => act('auto-proceed-timed'), [act]),
    placeBet: useCallback((b: number) => act('bet', { pId: playerId, bet: b }), [act, playerId]),
    forceBets: useCallback(() => act('force-bets'), [act]),
    playCard: useCallback((c: number) => act('play', { pId: playerId, card: c }), [act, playerId]),
    dismissTrickResult: useCallback(() => act('dismiss-trick-result'), [act]),
    swapSelect: useCallback((cs: number[]) => act('swap-select', { pId: playerId, cards: cs }), [act, playerId]),
    swapTrickTarget: useCallback((t: string) => act('swap-trick-target', { targetId: t }), [act]),
    swapTrickCard: useCallback((c: number) => act('swap-trick-card', { pId: playerId, card: c }), [act, playerId]),
    nextRound: useCallback(() => act('next-round'), [act]),
    newGame: useCallback(() => act('new-game'), [act]),
    foreheadSelect: useCallback((cs: number[]) => act('forehead-select', { pId: playerId, cards: cs }), [act, playerId]),
    piliTransferSelect: useCallback((t: string) => act('pili-transfer-select', { pId: playerId, targetId: t }), [act, playerId]),
  };
}
