import { TheMindMode, LevelConfig, TheMindCard, TheMindPlayer, DeckColor } from './types';

export function getPlayerConfig(playerCount: number) {
  if (playerCount === 2) return { totalLevels: 12, startingLives: 2, startingStars: 1 };
  if (playerCount === 3) return { totalLevels: 10, startingLives: 3, startingStars: 1 };
  return { totalLevels: 8, startingLives: 4, startingStars: 1 };
}

export function getLevelConfig(level: number, playerCount: number, mode: TheMindMode): LevelConfig {
  const cardsPerPlayer = level;
  const isBlind = mode === 'extreme' && (level === 3 || level === 5 || level >= 7);
  
  let rewardStar = false;
  let rewardLife = false;
  
  // Bonus rewards: every 3 levels starting from level 2 (2, 5, 8, 11)
  if (level === 2) rewardStar = true;
  else if (level === 5) rewardLife = true;
  else if (level === 8) rewardStar = true;
  else if (level === 11) rewardLife = true;
  
  return {
    cardsPerPlayer,
    isBlind,
    rewardLife,
    rewardStar
  };
}

export function shuffle<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function createDeck(mode: TheMindMode): TheMindCard[] {
  const deck: TheMindCard[] = [];
  if (mode === 'classic') {
    for (let i = 1; i <= 100; i++) {
      deck.push({ value: i, deck: 'white' });
    }
  } else if (mode === 'extreme') {
    for (let i = 1; i <= 50; i++) {
      deck.push({ value: i, deck: 'white' });
      deck.push({ value: i, deck: 'red' });
    }
  }
  return shuffle(deck);
}

export function dealCards(players: TheMindPlayer[], level: number, mode: TheMindMode): TheMindPlayer[] {
  const deck = createDeck(mode);
  
  return players.map(player => {
    const hand: TheMindCard[] = [];
    for (let i = 0; i < level; i++) {
      const card = deck.pop();
      if (card) hand.push(card);
    }
    
    // Sort hand: white ascending, red descending
    hand.sort((a, b) => {
      if (a.deck === 'white' && b.deck === 'white') {
        return a.value - b.value;
      }
      if (a.deck === 'red' && b.deck === 'red') {
        return b.value - a.value;
      }
      return a.deck === 'white' ? -1 : 1;
    });
    
    return { ...player, hand };
  });
}

export function validatePlay(
  card: TheMindCard, 
  whitePile: number[], 
  redPile: number[], 
  allPlayers: TheMindPlayer[], 
  playerId: string
): { valid: boolean; conflictCards: { playerId: string; card: TheMindCard }[] } {
  const conflictCards: { playerId: string; card: TheMindCard }[] = [];
  
  if (card.deck === 'white') {
    for (const player of allPlayers) {
      if (player.id === playerId) continue;
      for (const playerCard of player.hand) {
        if (playerCard.deck === 'white' && playerCard.value < card.value) {
          conflictCards.push({ playerId: player.id, card: playerCard });
        }
      }
    }
  } else {
    for (const player of allPlayers) {
      if (player.id === playerId) continue;
      for (const playerCard of player.hand) {
        if (playerCard.deck === 'red' && playerCard.value > card.value) {
          conflictCards.push({ playerId: player.id, card: playerCard });
        }
      }
    }
  }
  
  return {
    valid: conflictCards.length === 0,
    conflictCards
  };
}

export function checkLevelComplete(players: TheMindPlayer[]): boolean {
  return players.every(player => player.hand.length === 0);
}

export function executeShurikenClassic(players: TheMindPlayer[]): { players: TheMindPlayer[]; discardedCards: { playerId: string; card: TheMindCard }[] } {
  const discardedCards: { playerId: string; card: TheMindCard }[] = [];
  
  const updatedPlayers = players.map(player => {
    if (player.hand.length === 0) return player;
    
    const whiteCards = player.hand.filter(c => c.deck === 'white');
    if (whiteCards.length === 0) return player;
    
    const lowestWhite = whiteCards[0];
    discardedCards.push({ playerId: player.id, card: lowestWhite });
    
    return {
      ...player,
      hand: player.hand.filter(c => c.value !== lowestWhite.value || c.deck !== lowestWhite.deck)
    };
  });
  
  return { players: updatedPlayers, discardedCards };
}

export function executeShurikenExtreme(
  players: TheMindPlayer[],
  choices: Record<string, DeckColor>
): { players: TheMindPlayer[]; discardedCards: { playerId: string; card: TheMindCard }[] } {
  const discardedCards: { playerId: string; card: TheMindCard }[] = [];
  
  const updatedPlayers = players.map(player => {
    if (player.hand.length === 0) return player;
    
    const choice = choices[player.id];
    if (!choice) return player;

    let cardToRemove: TheMindCard | null = null;

    if (choice === 'white') {
      // Discard lowest white card
      const whiteCards = player.hand.filter(c => c.deck === 'white');
      if (whiteCards.length > 0) cardToRemove = whiteCards[0]; // already sorted ascending
    } else {
      // Discard highest red card
      const redCards = player.hand.filter(c => c.deck === 'red');
      if (redCards.length > 0) cardToRemove = redCards[0]; // already sorted descending
    }
    
    if (cardToRemove) {
      discardedCards.push({ playerId: player.id, card: cardToRemove });
      return {
        ...player,
        hand: player.hand.filter(c => !(c.value === cardToRemove!.value && c.deck === cardToRemove!.deck))
      };
    }
    
    return player;
  });
  
  return { players: updatedPlayers, discardedCards };
}

export function removeCardFromHand(players: TheMindPlayer[], playerId: string, card: TheMindCard): TheMindPlayer[] {
  return players.map(player => {
    let newHand = player.hand;
    
    if (player.id === playerId) {
      newHand = newHand.filter(c => !(c.value === card.value && c.deck === card.deck));
    }
    
    if (card.deck === 'white') {
      newHand = newHand.filter(c => !(c.deck === 'white' && c.value < card.value));
    } else if (card.deck === 'red') {
      newHand = newHand.filter(c => !(c.deck === 'red' && c.value > card.value));
    }
    
    return { ...player, hand: newHand };
  });
}
