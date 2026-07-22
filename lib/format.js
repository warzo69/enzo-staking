// ---------------------------------------------------------------------------
// Fonctions d'affichage et de calcul, réunies au même endroit.
// Comme ça, si une règle de calcul change, on la modifie ICI une seule fois.
// ---------------------------------------------------------------------------

/** Affiche un nombre en euros, format français : 1 250 € */
export function euro(value, withDecimals = false) {
  const n = Number(value) || 0;
  return n.toLocaleString('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: withDecimals ? 2 : 0,
    maximumFractionDigits: withDecimals ? 2 : 0,
  });
}

/** Affiche un pourcentage : 42,5 % */
export function percent(value, decimals = 0) {
  const n = Number(value) || 0;
  return `${n.toLocaleString('fr-FR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })} %`;
}

/** Affiche une date en français : 12 mars 2026 */
export function dateFr(value) {
  if (!value) return '';
  return new Date(value).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/** Date courte : 12/03/2026 */
export function dateShort(value) {
  if (!value) return '';
  return new Date(value).toLocaleDateString('fr-FR');
}

// ---------------------------------------------------------------------------
// CALCULS DU STAKING
// ---------------------------------------------------------------------------

/**
 * Montant recherché = buy-in × pourcentage vendu.
 * Ex : 500 € × 50 % = 250 €.
 */
export function amountSought(buyIn, percentSold) {
  return (Number(buyIn) || 0) * ((Number(percentSold) || 0) / 100);
}

/**
 * Total déjà collecté = somme des montants des investisseurs.
 */
export function collected(investors = []) {
  return investors.reduce((sum, i) => sum + (Number(i.amount) || 0), 0);
}

/**
 * Progression du financement (0 à 100).
 */
export function fundingProgress(collectedAmount, sought) {
  if (!sought) return 0;
  return Math.min(100, (collectedAmount / sought) * 100);
}

/**
 * Part d'un investisseur DANS LA PART VENDUE.
 * Ex : il met 50 € sur 250 € recherchés → il possède 20 % de la part vendue.
 */
export function investorShareOfSold(investorAmount, sought) {
  if (!sought) return 0;
  return (Number(investorAmount) || 0) / sought * 100;
}

// ---------------------------------------------------------------------------
// CALCULS DES RÉSULTATS (une fois le tournoi terminé)
// ---------------------------------------------------------------------------

/**
 * Résultat brut du tournoi = gain - buy-in.
 * (Résultat "poker" classique, sans tenir compte du staking.)
 */
export function grossProfit(payout, buyIn) {
  return (Number(payout) || 0) - (Number(buyIn) || 0);
}

/**
 * ROI en % = (gain - buy-in) / buy-in × 100.
 */
export function roi(payout, buyIn) {
  if (!buyIn) return 0;
  return grossProfit(payout, buyIn) / buyIn * 100;
}

/**
 * Remboursement d'UN investisseur.
 * Chaque euro investi achète une fraction (montant / buy-in) de l'action totale
 * et récupère cette même fraction du gain.
 *   remboursement = gain × (montant investi / buy-in)
 * Ex : buy-in 500 €, il a mis 50 €, gain 4000 € → 4000 × 50/500 = 400 €.
 */
export function investorReturn(payout, buyIn, investorAmount) {
  if (!buyIn) return 0;
  return (Number(payout) || 0) * (Number(investorAmount) || 0) / buyIn;
}

/** Bénéfice net d'un investisseur = remboursement - mise. */
export function investorNet(payout, buyIn, investorAmount) {
  return investorReturn(payout, buyIn, investorAmount) - (Number(investorAmount) || 0);
}

/**
 * Part du joueur (Enzo) après staking.
 * Il ne garde que la part NON vendue de son résultat.
 *   net Enzo = (gain - buy-in) × (1 - % vendu / 100)
 */
export function playerNet(payout, buyIn, percentSold) {
  return grossProfit(payout, buyIn) * (1 - (Number(percentSold) || 0) / 100);
}
