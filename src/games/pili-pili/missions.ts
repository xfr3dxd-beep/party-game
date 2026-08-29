import { Mission } from './types';

// Creating 36 missions with various effects and cards per player.
// Standard distribution of cards: 3-8.
export const missions: Mission[] = Array.from({ length: 36 }, (_, i) => {
  const id = i + 1;
  const cardsPerPlayer = (i % 6) + 3; // 3 to 8
  
  const mission: Mission = {
    id,
    name: `Missione ${id}`,
    description: `Distribuisci ${cardsPerPlayer} carte.`,
    cardsPerPlayer,
  };

  // Add some variety based on id
  if (id % 5 === 0) {
    mission.invertWinner = true;
    mission.description += ' Vince la carta più bassa.';
  } else if (id % 7 === 0) {
    mission.blindBet = true;
    mission.description += ' Scommetti prima di vedere le carte.';
  } else if (id % 8 === 0) {
    mission.swapDirection = 'left';
    mission.description += ' Scambia una carta con il giocatore a sinistra.';
  } else if (id % 9 === 0) {
    mission.doubleFirst = true;
    mission.description += ' Il primo trick vale doppio.';
  } else if (id % 11 === 0) {
    mission.doublePenalty = true;
    mission.description += ' Penalità raddoppiate.';
  } else if (id % 13 === 0) {
    mission.bonusPrecise = true;
    mission.description += ' Previsione esatta toglie 1 Pili.';
  } else if (id % 17 === 0) {
    mission.jokerInPlay = true;
    mission.description += ' Il Joker entra in gioco.';
  }

  return mission;
});
