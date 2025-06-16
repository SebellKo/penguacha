export type GemColor =
  | "Red"
  | "Orange"
  | "Yellow"
  | "Green"
  | "Blue"
  | "Indigo"
  | "Purple"
  | "Amber"
  | "Cyan";

// NFT Market Data Interface
export interface MarketData {
  supply: number; // 시장에 풀린 물량
  lastSoldPrice: number; // 마지막 판매 가격 (ETH)
  priceHistory: number[]; // 최근 10개 가격 기록
  totalSold: number; // 총 판매량
}

export interface Gem {
  id: string;
  color: GemColor;
  level: number;
  value: number;
  displayColor?: string; // 랜덤 색상 표시용
  originalInventoryIndex?: number; // 원래 인벤토리 위치 (IGLOO에서 STORAGE로 돌아갈 때 사용)
}

export interface GameState {
  ethBalance: number; // Changed from money to ETH balance
  currentGem: Gem | null;
  inventory: (Gem | null)[];
  evolvedPenguins: Gem[]; // Successfully evolved penguins
  enhancementCost: number;
  successRate: number;
  gemPowder: number;
  selectedPowderColor: GemColor | null;
  powderCounts: Record<GemColor, number>;
  marketData: Record<GemColor, MarketData>; // NFT 마켓 데이터
}

// NFT Game Economics - Each penguin has independent costs and rates
export const eggPurchaseCosts: Record<GemColor, number> = {
  Red: 0.01, // 0.01 ETH
  Orange: 0.015, // 0.015 ETH
  Yellow: 0.02, // 0.02 ETH
  Green: 0.025, // 0.025 ETH
  Blue: 0.03, // 0.03 ETH
  Indigo: 0.04, // 0.04 ETH
  Purple: 0.05, // 0.05 ETH
  Amber: 0.06, // 0.06 ETH
  Cyan: 0.08, // 0.08 ETH
};

export const evolutionCosts: Record<GemColor, number> = {
  Red: 0.005, // 0.005 ETH
  Orange: 0.008, // 0.008 ETH
  Yellow: 0.012, // 0.012 ETH
  Green: 0.015, // 0.015 ETH
  Blue: 0.02, // 0.02 ETH
  Indigo: 0.025, // 0.025 ETH
  Purple: 0.03, // 0.03 ETH
  Amber: 0.035, // 0.035 ETH
  Cyan: 0.04, // 0.04 ETH
};

// 더 현실적인 낮은 확률로 수정
export const evolutionSuccessRates: Record<GemColor, number> = {
  Red: 65, // 65% success rate (기존 85% → 65%)
  Orange: 55, // 55% success rate (기존 80% → 55%)
  Yellow: 45, // 45% success rate (기존 75% → 45%)
  Green: 35, // 35% success rate (기존 70% → 35%)
  Blue: 25, // 25% success rate (기존 65% → 25%)
  Indigo: 20, // 20% success rate (기존 60% → 20%)
  Purple: 15, // 15% success rate (기존 55% → 15%)
  Amber: 10, // 10% success rate (기존 50% → 10%)
  Cyan: 5, // 5% success rate (기존 45% → 5%)
};

// 기본 펭귄 가격 (마켓 가격 계산의 기준점)
export const basePenguinPrices: Record<GemColor, number> = {
  Red: 0.02, // 0.02 ETH
  Orange: 0.035, // 0.035 ETH
  Yellow: 0.055, // 0.055 ETH
  Green: 0.08, // 0.08 ETH
  Blue: 0.12, // 0.12 ETH
  Indigo: 0.18, // 0.18 ETH
  Purple: 0.25, // 0.25 ETH
  Amber: 0.35, // 0.35 ETH
  Cyan: 0.5, // 0.5 ETH
};

// 초기 마켓 데이터
export const initialMarketData: Record<GemColor, MarketData> = {
  Red: {
    supply: 1000,
    lastSoldPrice: 0.02,
    priceHistory: [0.02],
    totalSold: 0,
  },
  Orange: {
    supply: 800,
    lastSoldPrice: 0.035,
    priceHistory: [0.035],
    totalSold: 0,
  },
  Yellow: {
    supply: 600,
    lastSoldPrice: 0.055,
    priceHistory: [0.055],
    totalSold: 0,
  },
  Green: {
    supply: 400,
    lastSoldPrice: 0.08,
    priceHistory: [0.08],
    totalSold: 0,
  },
  Blue: {
    supply: 300,
    lastSoldPrice: 0.12,
    priceHistory: [0.12],
    totalSold: 0,
  },
  Indigo: {
    supply: 200,
    lastSoldPrice: 0.18,
    priceHistory: [0.18],
    totalSold: 0,
  },
  Purple: {
    supply: 150,
    lastSoldPrice: 0.25,
    priceHistory: [0.25],
    totalSold: 0,
  },
  Amber: {
    supply: 100,
    lastSoldPrice: 0.35,
    priceHistory: [0.35],
    totalSold: 0,
  },
  Cyan: { supply: 50, lastSoldPrice: 0.5, priceHistory: [0.5], totalSold: 0 },
};

export type DisassemblyResultType = "success" | "failure";
export const powderBoostRates: Record<GemColor, number> = {
  Red: 0, // Red powder provides no boost and won't be selectable for boost
  Orange: 5,
  Yellow: 8,
  Green: 10,
  Blue: 15,
  Indigo: 20,
  Purple: 0, // Purple powder provides no boost by default as per new request (implicitly)
  Amber: 25,
  Cyan: 30,
};
