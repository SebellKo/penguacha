import {
  GameState,
  Gem,
  GemColor,
  eggPurchaseCosts,
  evolutionCosts,
  evolutionSuccessRates,
  basePenguinPrices,
  initialMarketData,
  MarketData,
  powderBoostRates,
} from "../types";

// Gem progression order (for reference)
export const gemColors: GemColor[] = [
  "Red",
  "Orange",
  "Yellow",
  "Green",
  "Blue",
  "Indigo",
  "Purple",
  "Amber",
  "Cyan",
];

// Random colors for penguin display
const randomColors = [
  "#FF6B6B",
  "#4ECDC4",
  "#45B7D1",
  "#96CEB4",
  "#FFEAA7",
  "#DDA0DD",
  "#98D8C8",
  "#F7DC6F",
  "#BB8FCE",
  "#85C1E9",
  "#F8C471",
  "#82E0AA",
  "#F1948A",
  "#AED6F1",
  "#D7BDE2",
  "#F8D7DA",
  "#D1ECF1",
  "#D4EDDA",
  "#FFF3CD",
  "#E2E3E5",
];

const getRandomColor = (excludeColors: string[] = []): string => {
  // Filter out excluded colors
  const availableColors = randomColors.filter(
    (color) => !excludeColors.includes(color)
  );

  // If no colors available, use all colors
  if (availableColors.length === 0) {
    return randomColors[Math.floor(Math.random() * randomColors.length)];
  }

  return availableColors[Math.floor(Math.random() * availableColors.length)];
};

// Create a new gem (egg) with a unique ID
export const createGem = (color: GemColor = "Red"): Gem => {
  const level = gemColors.indexOf(color);
  return {
    id: Math.random().toString(36).substring(2, 9),
    color,
    level,
    value: 0, // Eggs have no sell value, only evolved penguins do
    displayColor: getRandomColor(), // 랜덤 색상 추가
  };
};

// Calculate if evolution is successful based on success rate
export const isEnhancementSuccessful = (successRate: number): boolean => {
  return Math.random() * 100 <= successRate;
};

// Calculate if gem powder is obtained when disassembling
export const isGemPowderObtained = (gemColor: GemColor): boolean => {
  // Red gems cannot be disassembled, so they should not yield powder.
  if (gemColor === "Red") {
    return false;
  }
  // Simplified powder chance for NFT game
  const powderChances = {
    Red: 0,
    Orange: 80,
    Yellow: 70,
    Green: 60,
    Blue: 50,
    Indigo: 40,
    Purple: 30,
    Amber: 20,
    Cyan: 10,
  };
  return Math.random() * 100 <= powderChances[gemColor];
};

// 펭귄 색상별 고유 색상 매핑
const penguinDisplayColors: Record<GemColor, string[]> = {
  Red: ["#FF6B6B", "#FF4757", "#FF3838", "#E74C3C", "#C0392B"],
  Orange: ["#FFA726", "#FF9800", "#F57C00", "#E65100", "#FF8F00"],
  Yellow: ["#FFEB3B", "#FFC107", "#FF9800", "#F57F17", "#F9A825"],
  Green: ["#4CAF50", "#66BB6A", "#43A047", "#388E3C", "#2E7D32"],
  Blue: ["#2196F3", "#42A5F5", "#1E88E5", "#1976D2", "#1565C0"],
  Indigo: ["#3F51B5", "#5C6BC0", "#3949AB", "#303F9F", "#283593"],
  Purple: ["#9C27B0", "#AB47BC", "#8E24AA", "#7B1FA2", "#6A1B9A"],
  Amber: ["#FFC107", "#FFB300", "#FFA000", "#FF8F00", "#FF6F00"],
  Cyan: ["#00BCD4", "#26C6DA", "#00ACC1", "#0097A7", "#00838F"],
};

// 사용된 색상을 추적하는 함수
const getUniqueColor = (color: GemColor, usedColors: Set<string>): string => {
  const availableColors = penguinDisplayColors[color].filter(
    (c) => !usedColors.has(c)
  );
  if (availableColors.length === 0) {
    // 모든 색상이 사용된 경우 랜덤하게 선택
    return penguinDisplayColors[color][
      Math.floor(Math.random() * penguinDisplayColors[color].length)
    ];
  }
  return availableColors[Math.floor(Math.random() * availableColors.length)];
};

// 알 판매 가격 계산 (구매 가격의 50%로 낮춤)
export const calculateEggSellPrice = (color: GemColor): number => {
  return Math.round(eggPurchaseCosts[color] * 0.5 * 1000) / 1000;
};

// NFT 마켓 가격 계산 함수
export const calculateMarketPrice = (
  color: GemColor,
  marketData: MarketData
): number => {
  const basePrice = basePenguinPrices[color];
  const supplyFactor = Math.max(0.3, Math.min(2.0, 1000 / marketData.supply)); // 공급량이 적을수록 가격 상승
  const demandFactor = Math.max(0.5, Math.min(1.5, marketData.totalSold / 100)); // 판매량이 많을수록 가격 상승
  const volatility = (Math.random() - 0.5) * 0.2; // ±10% 랜덤 변동

  const marketPrice =
    basePrice * supplyFactor * demandFactor * (1 + volatility);
  return Math.max(basePrice * 0.3, Math.min(basePrice * 3, marketPrice)); // 최소 30%, 최대 300% 제한
};

// 마켓 데이터 업데이트 함수
export const updateMarketData = (
  color: GemColor,
  marketData: Record<GemColor, MarketData>,
  soldPrice: number
): Record<GemColor, MarketData> => {
  const newMarketData = { ...marketData };
  const colorData = { ...newMarketData[color] };

  // 공급량 감소 (판매될 때마다)
  colorData.supply = Math.max(1, colorData.supply - 1);

  // 마지막 판매 가격 업데이트
  colorData.lastSoldPrice = soldPrice;

  // 가격 히스토리 업데이트 (최근 10개만 유지)
  colorData.priceHistory = [...colorData.priceHistory, soldPrice].slice(-10);

  // 총 판매량 증가
  colorData.totalSold += 1;

  newMarketData[color] = colorData;
  return newMarketData;
};

// 현재 마켓 가격 가져오기
export const getCurrentMarketPrice = (
  color: GemColor,
  marketData: Record<GemColor, MarketData>
): number => {
  return calculateMarketPrice(color, marketData[color]);
};

// Initialize a new game state for NFT game
export const initializeGameState = (): GameState => {
  return {
    ethBalance: 1.0, // Player starts with 1.0 ETH
    currentGem: null, // No starting gem - player must purchase eggs
    inventory: Array(20).fill(null),
    evolvedPenguins: [], // Successfully evolved penguins
    enhancementCost: 0,
    successRate: 0,
    gemPowder: 0,
    selectedPowderColor: null,
    powderCounts: {
      Red: 0,
      Orange: 0,
      Yellow: 0,
      Green: 0,
      Blue: 0,
      Indigo: 0,
      Purple: 0,
      Amber: 0,
      Cyan: 0,
    },
    marketData: initialMarketData,
  };
};

// Purchase an egg directly to inventory (새로운 기능)
export const purchaseEggToInventory = (
  gameState: GameState,
  color: GemColor
): GameState => {
  const cost = eggPurchaseCosts[color];
  if (gameState.ethBalance < cost) {
    return gameState;
  }

  // 빈 인벤토리 슬롯 찾기
  const emptySlotIndex = gameState.inventory.findIndex((slot) => slot === null);
  if (emptySlotIndex === -1) {
    return gameState; // 인벤토리가 가득 참
  }

  // 사용된 색상 수집
  const usedColors = new Set(
    [...gameState.evolvedPenguins, gameState.currentGem, ...gameState.inventory]
      .filter((gem): gem is Gem => gem !== null)
      .map((gem) => gem.displayColor)
      .filter((color): color is string => color !== undefined)
  );

  const newEgg: Gem = {
    id: `${color}-${Date.now()}-${Math.random()}`,
    color,
    level: 0, // 알 상태
    value: calculateEggSellPrice(color), // 알 판매 가격 설정
    displayColor: getUniqueColor(color, usedColors),
  };

  const newInventory = [...gameState.inventory];
  newInventory[emptySlotIndex] = newEgg;

  return {
    ...gameState,
    ethBalance: Math.round((gameState.ethBalance - cost) * 1000) / 1000,
    inventory: newInventory,
  };
};

// Preview penguin without purchasing (새로운 기능 - 구매 없는 미리보기)
export const previewPenguin = (
  gameState: GameState,
  color: GemColor
): GameState => {
  // 사용된 색상 수집
  const usedColors = new Set(
    [...gameState.evolvedPenguins, gameState.currentGem, ...gameState.inventory]
      .filter((gem): gem is Gem => gem !== null)
      .map((gem) => gem.displayColor)
      .filter((color): color is string => color !== undefined)
  );

  const previewGem: Gem = {
    id: `preview-${color}-${Date.now()}`,
    color,
    level: 0, // 알 상태
    value: calculateEggSellPrice(color), // 알 판매 가격 설정
    displayColor: getUniqueColor(color, usedColors),
  };

  // Preview 시에도 마켓 가격 변동 시뮬레이션 (모든 색상에 대해)
  const updatedMarketData = { ...gameState.marketData };
  Object.keys(updatedMarketData).forEach((marketColor) => {
    const currentData = updatedMarketData[marketColor as GemColor];
    const currentPrice = getCurrentMarketPrice(
      marketColor as GemColor,
      gameState.marketData
    );

    // ±5% 범위에서 랜덤 변동
    const volatility = 0.05;
    const change = (Math.random() - 0.5) * 2 * volatility;
    const newPrice = Math.max(0.001, currentPrice * (1 + change));

    // 가격 히스토리 업데이트
    const newPriceHistory = [...currentData.priceHistory, newPrice].slice(-10);

    updatedMarketData[marketColor as GemColor] = {
      ...currentData,
      lastSoldPrice: Math.round(newPrice * 1000) / 1000,
      priceHistory: newPriceHistory,
    };
  });

  return {
    ...gameState,
    currentGem: previewGem,
    enhancementCost: evolutionCosts[color],
    successRate: evolutionSuccessRates[color],
    marketData: updatedMarketData, // 업데이트된 마켓 데이터 적용
  };
};

// Purchase an egg (NFT Game) - 기존 기능 (미리보기용에서 실제 구매로 변경)
export const purchaseEgg = (
  gameState: GameState,
  color: GemColor
): GameState => {
  const cost = eggPurchaseCosts[color];
  if (gameState.ethBalance < cost) {
    return gameState;
  }

  // 사용된 색상 수집
  const usedColors = new Set(
    [...gameState.evolvedPenguins, gameState.currentGem, ...gameState.inventory]
      .filter((gem): gem is Gem => gem !== null)
      .map((gem) => gem.displayColor)
      .filter((color): color is string => color !== undefined)
  );

  const newGem: Gem = {
    id: `${color}-${Date.now()}`,
    color,
    level: 0, // 알 상태
    value: calculateEggSellPrice(color), // 알 판매 가격 설정
    displayColor: getUniqueColor(color, usedColors),
  };

  return {
    ...gameState,
    ethBalance: Math.round((gameState.ethBalance - cost) * 1000) / 1000,
    currentGem: newGem,
    enhancementCost: evolutionCosts[color],
    successRate: evolutionSuccessRates[color],
  };
};

// Sell current egg (새로운 기능)
export const sellCurrentEgg = (gameState: GameState): GameState => {
  if (!gameState.currentGem || gameState.currentGem.level > 0) {
    return gameState; // 알이 아니면 판매 불가
  }

  const sellPrice = calculateEggSellPrice(gameState.currentGem.color);

  return {
    ...gameState,
    ethBalance: Math.round((gameState.ethBalance + sellPrice) * 1000) / 1000,
    currentGem: null,
    enhancementCost: 0,
    successRate: 0,
  };
};

// Sell egg from inventory (새로운 기능)
export const sellEggFromInventory = (
  gameState: GameState,
  slotIndex: number
): GameState => {
  if (slotIndex < 0 || slotIndex >= gameState.inventory.length) {
    return gameState;
  }

  const eggToSell = gameState.inventory[slotIndex];
  if (!eggToSell || eggToSell.level > 0) {
    return gameState; // 알이 아니면 판매 불가
  }

  const sellPrice = calculateEggSellPrice(eggToSell.color);
  const newInventory = [...gameState.inventory];
  newInventory[slotIndex] = null;

  return {
    ...gameState,
    ethBalance: Math.round((gameState.ethBalance + sellPrice) * 1000) / 1000,
    inventory: newInventory,
  };
};

// Evolve the current egg to penguin (NFT Game)
export const enhanceGem = (
  gameState: GameState,
  actualPowderBoost: number
): GameState => {
  if (!gameState.currentGem || gameState.currentGem.level > 0) {
    return gameState;
  }

  const cost = evolutionCosts[gameState.currentGem.color];
  if (gameState.ethBalance < cost) {
    return gameState;
  }

  const baseSuccessRate = evolutionSuccessRates[gameState.currentGem.color];
  const finalSuccessRate = Math.min(95, baseSuccessRate + actualPowderBoost);
  const success = Math.random() * 100 < finalSuccessRate;

  if (success) {
    // 성공: 펭귄으로 진화하고 현재 마켓 가격으로 가치 설정
    const marketPrice = getCurrentMarketPrice(
      gameState.currentGem.color,
      gameState.marketData
    );
    const evolvedGem: Gem = {
      ...gameState.currentGem,
      level: 1,
      value: Math.round(marketPrice * 1000) / 1000, // 소수점 3자리로 반올림
    };

    return {
      ...gameState,
      ethBalance: Math.round((gameState.ethBalance - cost) * 1000) / 1000,
      currentGem: null,
      evolvedPenguins: [...gameState.evolvedPenguins, evolvedGem],
      enhancementCost: 0,
      successRate: 0,
    };
  } else {
    // 실패: 알이 사라지고 ETH만 소모
    return {
      ...gameState,
      ethBalance: Math.round((gameState.ethBalance - cost) * 1000) / 1000,
      currentGem: null,
      enhancementCost: 0,
      successRate: 0,
    };
  }
};

// Sell penguin from evolved penguins collection
export const sellGem = (gameState: GameState, gemIndex: number): GameState => {
  if (gemIndex < 0 || gemIndex >= gameState.evolvedPenguins.length) {
    return gameState;
  }

  const gemToSell = gameState.evolvedPenguins[gemIndex];
  const sellPrice = getCurrentMarketPrice(
    gemToSell.color,
    gameState.marketData
  );

  // 마켓 데이터 업데이트
  const updatedMarketData = updateMarketData(
    gemToSell.color,
    gameState.marketData,
    sellPrice
  );

  return {
    ...gameState,
    ethBalance: Math.round((gameState.ethBalance + sellPrice) * 1000) / 1000,
    evolvedPenguins: gameState.evolvedPenguins.filter(
      (_, index) => index !== gemIndex
    ),
    marketData: updatedMarketData,
  };
};

// Move gem to inventory
export const moveGemToInventory = (
  gameState: GameState,
  slotIndex: number
): GameState => {
  if (
    !gameState.currentGem ||
    slotIndex < 0 ||
    slotIndex >= gameState.inventory.length
  ) {
    return gameState;
  }

  if (gameState.inventory[slotIndex] !== null) {
    return gameState;
  }

  const newInventory = [...gameState.inventory];
  newInventory[slotIndex] = gameState.currentGem;

  return {
    ...gameState,
    currentGem: null,
    inventory: newInventory,
    enhancementCost: 0,
    successRate: 0,
  };
};

// Move gem from inventory
export const moveGemFromInventory = (
  gameState: GameState,
  slotIndex: number
): GameState => {
  if (
    gameState.currentGem ||
    slotIndex < 0 ||
    slotIndex >= gameState.inventory.length
  ) {
    return gameState;
  }

  const gemToMove = gameState.inventory[slotIndex];
  if (!gemToMove) {
    return gameState;
  }

  const newInventory = [...gameState.inventory];
  newInventory[slotIndex] = null;

  return {
    ...gameState,
    currentGem: gemToMove,
    inventory: newInventory,
    enhancementCost:
      gemToMove.level === 0 ? evolutionCosts[gemToMove.color] : 0,
    successRate:
      gemToMove.level === 0 ? evolutionSuccessRates[gemToMove.color] : 0,
  };
};

// Calculate boosted success rate for display
export const calculateBoostedSuccessRate = (
  baseRate: number,
  powderUsed: number,
  selectedPowderColor: GemColor | null
): number => {
  if (!selectedPowderColor || powderUsed <= 0) {
    return baseRate;
  }
  const boostAmount = powderBoostRates[selectedPowderColor] * powderUsed;
  return Math.min(100, baseRate + boostAmount);
};

// Disassemble penguin for powder (if needed)
export const disassembleGem = (
  gameState: GameState,
  powderObtained: boolean
): GameState => {
  if (!gameState.currentGem || gameState.currentGem.level === 0) {
    return gameState; // Can't disassemble eggs
  }

  const gemColor = gameState.currentGem.color;
  let newPowderCounts = { ...gameState.powderCounts };

  if (powderObtained) {
    newPowderCounts = {
      ...newPowderCounts,
      [gemColor]: (newPowderCounts[gemColor] || 0) + 1,
    };
  }

  return {
    ...gameState,
    currentGem: null,
    powderCounts: newPowderCounts,
    enhancementCost: 0,
    successRate: 0,
  };
};
