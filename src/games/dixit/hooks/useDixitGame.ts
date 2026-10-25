import { useState, useEffect, useCallback, useRef } from 'react';
import { DixitState, DixitBroadcast, DixitPlayer, DixitPhase, TableCard } from '../types';
import { RoomPlayer } from './useDixitRoom';
import { createDeck, dealCards, getHandSize, getCardsToPlay, shuffleTableCards, calculateScores, checkWinners } from '../gameLogic';
import { debouncedSaveState } from '../../../lib/roomPersistence';

interface Props {
  playerId: string;
  isHost: boolean;
  roomCode: string | null;
  players: RoomPlayer[];
  broadcast: (e: DixitBroadcast) => void;
  onBroadcast: (cb: (e: DixitBroadcast) => void) => void;
}

const empty: DixitState = {
  phase: 'create', roomCode: '', players: [], deck: [], discardPile: [],
  narratorIndex: 0, clue: '', tableCards: [], votes: [],
  roundNumber: 0, roundScores: null, winners: null,
};

export function useDixitGame({ playerId, isHost, roomCode, players, broadcast, onBroadcast }: Props) {
  const [state, setState] = useState<DixitState>(empty);
  const stRef = useRef(state);
  const bcRef = useRef(broadcast);
  useEffect(() => { bcRef.current = broadcast; }, [broadcast]);

  const sync = useCallback((s: DixitState) => {
    stRef.current = s; setState(s);
    bcRef.current({ type: 'sync', payload: s });
    if (roomCode && s.phase !== 'create') debouncedSaveState(roomCode, s);
  }, [roomCode]);

  // Load saved state from DB when host rejoins
  useEffect(() => {
    if (!isHost || !roomCode || stRef.current.phase !== 'create') return;
    (async () => {
      const { loadRoom } = await import('../../../lib/roomPersistence');
      const room = await loadRoom(roomCode);
      if (room?.state && room.phase === 'playing') {
        stRef.current = room.state;
        setState(room.state);
        bcRef.current({ type: 'sync', payload: room.state });
      }
    })();
  }, [isHost, roomCode]);

  const proc = useCallback((action: string, payload: any) => {
    if (!isHost) return;
    const s = JSON.parse(JSON.stringify(stRef.current)) as DixitState;

    if (action === 'start') {
      // Move from lobby to color-select
      const gamePlayers: DixitPlayer[] = players.map(p => ({
        id: p.id, name: p.name, color: null, score: 0,
        hand: [], playedCardIds: [], hasPlayed: false, hasVoted: false,
      }));
      sync({
        ...empty,
        phase: 'color-select',
        roomCode: s.roomCode || roomCode || '',
        players: gamePlayers,
      });

    } else if (action === 'select-color') {
      const { pId, color } = payload;
      // Prevent duplicate color
      if (s.players.some(p => p.color === color && p.id !== pId)) return;
      s.players = s.players.map(p => p.id === pId ? { ...p, color } : p);

      // Check if all players have selected a color
      if (s.players.every(p => p.color !== null)) {
        // Deal cards
        const deck = createDeck();
        const handSize = getHandSize(s.players.length);
        let remaining = deck;
        s.players = s.players.map(p => {
          const { dealt, remaining: r } = dealCards(remaining, handSize);
          remaining = r;
          return { ...p, hand: dealt };
        });
        s.deck = remaining;
        s.discardPile = [];
        s.narratorIndex = Math.floor(Math.random() * s.players.length);
        s.roundNumber = 1;
        s.phase = 'narrator-pick';
      }
      sync(s);

    } else if (action === 'narrator-pick') {
      const { pId, cardId, clue } = payload;
      const narrator = s.players[s.narratorIndex];
      if (narrator.id !== pId) return;

      s.clue = clue;
      s.players = s.players.map(p => {
        if (p.id === pId) {
          return {
            ...p,
            hand: p.hand.filter(c => c !== cardId),
            playedCardIds: [cardId],
            hasPlayed: true,
          };
        }
        return p;
      });
      s.tableCards = [{ cardId, ownerId: pId, position: 0 }];
      s.votes = [];
      s.phase = 'others-pick';
      sync(s);

    } else if (action === 'player-pick') {
      const { pId, cardIds } = payload as { pId: string; cardIds: number[] };
      const narrator = s.players[s.narratorIndex];
      if (narrator.id === pId) return; // narrator can't play here

      const expectedCount = getCardsToPlay(s.players.length);
      if (cardIds.length !== expectedCount) return;

      s.players = s.players.map(p => {
        if (p.id === pId) {
          return {
            ...p,
            hand: p.hand.filter(c => !cardIds.includes(c)),
            playedCardIds: cardIds,
            hasPlayed: true,
          };
        }
        return p;
      });

      // Add cards to table
      cardIds.forEach(cardId => {
        s.tableCards.push({ cardId, ownerId: pId, position: 0 });
      });

      // Check if all non-narrators have played
      const nonNarrators = s.players.filter(p => p.id !== narrator.id);
      if (nonNarrators.every(p => p.hasPlayed)) {
        // Shuffle and assign positions
        s.tableCards = shuffleTableCards(s.tableCards);
        s.phase = 'voting';
      }
      sync(s);

    } else if (action === 'vote') {
      const { pId, position } = payload;
      const narrator = s.players[s.narratorIndex];
      if (narrator.id === pId) return; // narrator can't vote
      if (s.votes.some(v => v.voterId === pId)) return; // already voted

      // Can't vote for own card
      const votedCard = s.tableCards.find(tc => tc.position === position);
      if (votedCard && votedCard.ownerId === pId) return;

      s.votes.push({ voterId: pId, position });
      s.players = s.players.map(p => p.id === pId ? { ...p, hasVoted: true } : p);

      // Check if all non-narrators have voted
      const nonNarrators = s.players.filter(p => p.id !== narrator.id);
      if (nonNarrators.every(p => p.hasVoted)) {
        // Calculate scores
        const scores = calculateScores(narrator.id, s.tableCards, s.votes, s.players);
        s.roundScores = scores;

        // Apply scores
        scores.forEach(entry => {
          s.players = s.players.map(p =>
            p.id === entry.playerId ? { ...p, score: p.score + entry.pointsGained } : p
          );
        });

        // Check for winners
        const winners = checkWinners(s.players);
        if (winners) {
          s.winners = winners;
          s.phase = 'game-over';
        } else {
          s.phase = 'scoring';
        }
      }
      sync(s);

    } else if (action === 'next-round') {
      // Discard played cards
      const playedIds = s.tableCards.map(tc => tc.cardId);
      s.discardPile = [...s.discardPile, ...playedIds];

      // Draw one card per player (if deck has cards)
      s.players = s.players.map(p => {
        if (s.deck.length > 0) {
          const { dealt, remaining } = dealCards(s.deck, 1);
          s.deck = remaining;
          return {
            ...p,
            hand: [...p.hand, ...dealt],
            playedCardIds: [],
            hasPlayed: false,
            hasVoted: false,
          };
        }
        return { ...p, playedCardIds: [], hasPlayed: false, hasVoted: false };
      });

      // Advance narrator to next player (left = next index)
      s.narratorIndex = (s.narratorIndex + 1) % s.players.length;
      s.clue = '';
      s.tableCards = [];
      s.votes = [];
      s.roundScores = null;
      s.roundNumber += 1;
      s.phase = 'narrator-pick';
      sync(s);

    } else if (action === 'rematch') {
      const gamePlayers = s.players.map(p => ({
        ...p, score: 0, hand: [], playedCardIds: [], hasPlayed: false, hasVoted: false, color: null,
      }));
      sync({
        ...empty,
        phase: 'color-select',
        roomCode: s.roomCode,
        players: gamePlayers,
      });

    } else if (action === 'new-game') {
      sync({ ...empty, phase: 'create' });
    }
  }, [isHost, players, sync, roomCode]);

  useEffect(() => {
    onBroadcast((event) => {
      if (!isHost && event.type === 'sync') {
        setState(event.payload); stRef.current = event.payload;
      } else if (event.type === 'request-sync') {
        if (isHost && stRef.current.phase !== 'create') {
          bcRef.current({ type: 'sync', payload: stRef.current });
        }
      } else if (isHost && event.type === 'action') {
        proc(event.action!, event.payload);
      }
    });
  }, [onBroadcast, isHost, proc]);

  const act = useCallback((a: string, p?: any) => {
    if (isHost) proc(a, p); else bcRef.current({ type: 'action', action: a, payload: p });
  }, [isHost, proc]);

  const my = state.players.find(p => p.id === playerId);
  const narrator = state.players[state.narratorIndex];
  const isNarrator = narrator?.id === playerId;

  return {
    state, myPlayer: my, narrator, isNarrator,
    startGame: useCallback(() => act('start'), [act]),
    selectColor: useCallback((color: string) => act('select-color', { pId: playerId, color }), [act, playerId]),
    narratorPick: useCallback((cardId: number, clue: string) => act('narrator-pick', { pId: playerId, cardId, clue }), [act, playerId]),
    playerPick: useCallback((cardIds: number[]) => act('player-pick', { pId: playerId, cardIds }), [act, playerId]),
    vote: useCallback((position: number) => act('vote', { pId: playerId, position }), [act, playerId]),
    nextRound: useCallback(() => act('next-round'), [act]),
    rematch: useCallback(() => act('rematch'), [act]),
    newGame: useCallback(() => act('new-game'), [act]),
  };
}
