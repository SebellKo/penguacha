import React, { useState, useEffect, useCallback } from "react";
import "./App.css";
import Gem from "./components/Gem";
import GemEnhancer from "./components/GemEnhancer";
import PenguinSelector from "./components/PenguinSelector";
import Inventory from "./components/Inventory";
import BackgroundMusic from "./components/BackgroundMusic";
import Assets from "./assets.json";
// Import local background image
import backgroundImg from "./asssets/images/background.png";
import {
  initializeGameState,
  purchaseEgg,
  purchaseEggToInventory,
  enhanceGem,
  sellGem,
  sellCurrentEgg,
  sellEggFromInventory,
  moveGemToInventory,
  moveGemFromInventory,
  disassembleGem,
  isGemPowderObtained,
  calculateBoostedSuccessRate,
  getCurrentMarketPrice,
  calculateEggSellPrice,
} from "./utils/gameLogic";
import {
  GameState,
  GemColor,
  Gem as GemType,
  DisassemblyResultType,
  powderBoostRates,
  evolutionCosts,
  evolutionSuccessRates,
} from "./types";

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(initializeGameState());
  const [actualPowderBoost, setActualPowderBoost] = useState(0);
  const [disassemblyEffectResult, setDisassemblyEffectResult] =
    useState<DisassemblyResultType | null>(null);
  const [powderToUseForEnhancement, setPowderToUseForEnhancement] = useState(0);
  const [isScreenShaking, setIsScreenShaking] = useState(false);
  const [isAnimationEnabled, setIsAnimationEnabled] = useState(true);
  const [isMusicEnabled, setIsMusicEnabled] = useState(false);
  const [selectedPenguinColor, setSelectedPenguinColor] =
    useState<GemColor | null>("Red");
  const [selectedEvolvedPenguin, setSelectedEvolvedPenguin] =
    useState<GemType | null>(null);
  const [selectedEgg, setSelectedEgg] = useState<GemType | null>(null);
  const [displaySuccessRate, setDisplaySuccessRate] = useState<number>(0);
  const [activeStorageTab, setActiveStorageTab] = useState<"eggs" | "penguins">(
    "eggs"
  );

  useEffect(() => {
    const savedState = localStorage.getItem("gemGameState");
    if (savedState) {
      try {
        setGameState(JSON.parse(savedState));
      } catch (e) {
        console.error("Failed to load saved game state:", e);
        setGameState(initializeGameState());
      }
    }

    // Load animation preference from localStorage
    const savedAnimationPref = localStorage.getItem("gemGameAnimationEnabled");
    if (savedAnimationPref !== null) {
      setIsAnimationEnabled(JSON.parse(savedAnimationPref));
    }

    // Load music preference from localStorage
    const savedMusicPref = localStorage.getItem("gemGameMusicEnabled");
    if (savedMusicPref !== null) {
      setIsMusicEnabled(JSON.parse(savedMusicPref));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("gemGameState", JSON.stringify(gameState));
  }, [gameState]);

  useEffect(() => {
    localStorage.setItem(
      "gemGameAnimationEnabled",
      JSON.stringify(isAnimationEnabled)
    );
  }, [isAnimationEnabled]);

  useEffect(() => {
    localStorage.setItem("gemGameMusicEnabled", JSON.stringify(isMusicEnabled));
  }, [isMusicEnabled]);

  const resetPowderSelection = () => {
    setActualPowderBoost(0);
    setPowderToUseForEnhancement(0);
  };

  const handleEnhance = () => {
    const newGameState = enhanceGem(gameState, actualPowderBoost);
    setGameState(newGameState);

    // Reset staged powder after enhancement
    setPowderToUseForEnhancement(0);
    setActualPowderBoost(0);
  };

  const handleSell = () => {
    // This function is not used in NFT version
    resetPowderSelection();
  };

  const handleDisassemble = () => {
    if (!gameState.currentGem) return;

    const powderObtained = isGemPowderObtained(gameState.currentGem.color);
    const result: DisassemblyResultType = powderObtained
      ? "success"
      : "failure";

    setDisassemblyEffectResult(result);

    const newGameState = disassembleGem(gameState, powderObtained);
    setGameState(newGameState);
  };

  const handleDisassemblyAnimationComplete = () => {
    setDisassemblyEffectResult(null);
  };

  const handleSelectPowderColor = (color: GemColor) => {
    setGameState((prevState) => ({
      ...prevState,
      selectedPowderColor:
        prevState.selectedPowderColor === color ? null : color,
    }));
  };

  const handleUsePowder = (amount: number) => {
    setPowderToUseForEnhancement(amount);
  };

  const handleCancelPowder = () => {
    setPowderToUseForEnhancement(0);
    setActualPowderBoost(0);
  };

  const handleScreenShake = useCallback(() => {
    setIsScreenShaking(true);
    setTimeout(() => setIsScreenShaking(false), 500);
  }, []);

  const handleRestart = () => {
    setGameState(initializeGameState());
    resetPowderSelection();
    setDisassemblyEffectResult(null);
    setGameState((prevState) => ({ ...prevState, selectedPowderColor: null }));
  };

  const handleToggleAnimation = () => {
    setIsAnimationEnabled((prev) => !prev);
  };

  const handleToggleMusic = () => {
    setIsMusicEnabled((prev) => !prev);
  };

  const handleSelectEvolvedPenguin = (penguin: GemType) => {
    setSelectedEvolvedPenguin(penguin);
  };

  const handleSelectEgg = (egg: GemType) => {
    setSelectedEgg(egg);
  };

  const handleMoveSelectedEgg = () => {
    if (!selectedEgg) return;

    const eggIndex = gameState.inventory.findIndex(
      (item) => item?.id === selectedEgg.id
    );
    if (eggIndex !== -1) {
      const newInventory = [...gameState.inventory];

      // 현재 IGLOO에 있는 알이 있다면 선택한 알과 교체
      if (gameState.currentGem) {
        // 직접 교체: 인벤토리의 선택한 알 자리에 현재 알을 넣기
        newInventory[eggIndex] = gameState.currentGem;
      } else {
        // IGLOO가 비어있다면 선택한 알 자리를 null로 설정
        newInventory[eggIndex] = null;
      }

      // 선택한 알을 IGLOO로 이동하면서 원래 위치 정보 저장
      const eggWithOriginalPosition = {
        ...selectedEgg,
        originalInventoryIndex: eggIndex, // 원래 위치 저장
      };

      const newGameState = {
        ...gameState,
        inventory: newInventory,
        currentGem: eggWithOriginalPosition,
        enhancementCost:
          selectedEgg.level === 0 ? evolutionCosts[selectedEgg.color] : 0,
        successRate:
          selectedEgg.level === 0
            ? evolutionSuccessRates[selectedEgg.color]
            : 0,
      };

      setGameState(newGameState);
      setSelectedEgg(null);
    }
  };

  const handleSellSelectedEgg = () => {
    if (!selectedEgg) return;

    const eggIndex = gameState.inventory.findIndex(
      (item) => item?.id === selectedEgg.id
    );
    if (eggIndex !== -1) {
      const newGameState = sellEggFromInventory(gameState, eggIndex);
      setGameState(newGameState);
      setSelectedEgg(null);
    }
  };

  const getEggName = (color: GemColor): string => {
    const nameMap = {
      Red: "Pengu #1234 Egg",
      Orange: "Pengu #1235 Egg",
      Yellow: "Pengu #1236 Egg",
      Green: "Pengu #1237 Egg",
      Blue: "Pengu #1238 Egg",
      Indigo: "Pengu #1239 Egg",
      Purple: "Pengu #1240 Egg",
      Amber: "Pengu #1241 Egg",
      Cyan: "Pengu #1242 Egg",
    };
    return nameMap[color];
  };

  const calculateEggSellPrice = (color: GemColor): number => {
    const eggCosts: Record<GemColor, number> = {
      Red: 0.01,
      Orange: 0.015,
      Yellow: 0.02,
      Green: 0.025,
      Blue: 0.03,
      Indigo: 0.035,
      Purple: 0.04,
      Amber: 0.06,
      Cyan: 0.08,
    };
    return eggCosts[color] * 0.5; // 50% of purchase price
  };

  const handleSellEvolvedPenguin = () => {
    if (!selectedEvolvedPenguin) return;

    // 현재 마켓 가격으로 판매
    const currentPrice = currentMarketPrices[selectedEvolvedPenguin.color];

    setGameState((prevState) => {
      const newEthBalance = prevState.ethBalance + currentPrice;
      const newEvolvedPenguins = prevState.evolvedPenguins.filter(
        (p) => p.id !== selectedEvolvedPenguin.id
      );

      return {
        ...prevState,
        ethBalance: Math.round(newEthBalance * 1000) / 1000,
        evolvedPenguins: newEvolvedPenguins,
      };
    });

    setSelectedEvolvedPenguin(null);
  };

  const getPenguinName = (color: GemColor): string => {
    const nameMap = {
      Red: "Pengu #1234",
      Orange: "Pengu #1235",
      Yellow: "Pengu #1236",
      Green: "Pengu #1237",
      Blue: "Pengu #1238",
      Indigo: "Pengu #1239",
      Purple: "Pengu #1240",
      Amber: "Pengu #1241",
      Cyan: "Pengu #1242",
    };
    return nameMap[color] || "Unknown Pengu";
  };

  // 현재 마켓 가격들을 계산
  const currentMarketPrices = React.useMemo(() => {
    const prices: Record<GemColor, number> = {} as Record<GemColor, number>;
    Object.keys(gameState.marketData).forEach((color) => {
      prices[color as GemColor] = getCurrentMarketPrice(
        color as GemColor,
        gameState.marketData
      );
    });
    return prices;
  }, [gameState.marketData]);

  // 인벤토리에서 알과 펭귄 분리
  const eggs = gameState.inventory.filter((gem) => gem && gem.level === 0);
  const penguins = gameState.inventory.filter((gem) => gem && gem.level > 0);

  // Update display success rate when relevant values change
  useEffect(() => {
    if (gameState.currentGem && gameState.currentGem.level === 0) {
      const baseRate = gameState.successRate;
      const boostedRate = calculateBoostedSuccessRate(
        baseRate,
        powderToUseForEnhancement,
        gameState.selectedPowderColor
      );
      setDisplaySuccessRate(boostedRate);
      setActualPowderBoost(boostedRate - baseRate);
    } else {
      setDisplaySuccessRate(0);
      setActualPowderBoost(0);
    }
  }, [
    gameState.successRate,
    powderToUseForEnhancement,
    gameState.selectedPowderColor,
    gameState.currentGem,
  ]);

  const handleSellCurrentEgg = () => {
    const newGameState = sellCurrentEgg(gameState);
    setGameState(newGameState);
  };

  const handleSellFromCollection = (gemIndex: number) => {
    const newGameState = sellGem(gameState, gemIndex);
    setGameState(newGameState);
  };

  const handleSellEggFromInventory = (slotIndex: number) => {
    const newGameState = sellEggFromInventory(gameState, slotIndex);
    setGameState(newGameState);
  };

  const handleInventoryClick = (index: number) => {
    if (gameState.inventory[index] === null) {
      // Move from current to inventory
      const newGameState = moveGemToInventory(gameState, index);
      setGameState(newGameState);
    } else {
      // Move from inventory to current
      const newGameState = moveGemFromInventory(gameState, index);
      setGameState(newGameState);
    }
  };

  const handleMoveCurrentEggToStorage = () => {
    if (!gameState.currentGem || gameState.currentGem.level !== 0) return;

    // Don't allow moving preview eggs to storage
    if (gameState.currentGem.id.startsWith("preview-")) return;

    setGameState((prevState) => {
      const newInventory = [...prevState.inventory];
      const currentGem = prevState.currentGem!; // Non-null assertion since we checked above

      // 원래 위치가 있고 그 자리가 비어있다면 원래 자리로 돌려보내기
      if (
        currentGem.originalInventoryIndex !== undefined &&
        newInventory[currentGem.originalInventoryIndex] === null
      ) {
        // 원래 위치 정보 제거하고 원래 자리에 배치
        const { originalInventoryIndex, ...eggWithoutPosition } = currentGem;
        newInventory[originalInventoryIndex] = eggWithoutPosition;
      } else {
        // 원래 자리가 없거나 이미 차있다면 빈 슬롯 찾기
        const emptySlotIndex = newInventory.findIndex((slot) => slot === null);
        if (emptySlotIndex === -1) return prevState; // No empty slots

        // 원래 위치 정보 제거하고 빈 슬롯에 배치
        const { originalInventoryIndex, ...eggWithoutPosition } = currentGem;
        newInventory[emptySlotIndex] = eggWithoutPosition;
      }

      return {
        ...prevState,
        currentGem: null,
        inventory: newInventory,
      };
    });
  };

  return (
    <div
      className={`min-h-screen text-white p-4 md:p-8 alchemist-lab-bg ${
        isScreenShaking ? "screen-shake-active" : ""
      }`}
      style={{
        backgroundImage: `url(${backgroundImg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Background Music Component */}
      <BackgroundMusic isEnabled={isMusicEnabled} volume={0.3} />

      <div className="alchemist-overlay">
        <div className="max-w-6xl mx-auto">
          <header className="mb-8 text-center alchemist-header">
            <h1 className="text-3xl md:text-4xl font-bold mb-2 alchemist-title font-pixel">
              PenguaCha
            </h1>
            <p className="text-gray-200 mb-4 alchemist-subtitle text-lg font-pixel">
              Transform your adorable Pengu in the magical Antarctic igloo!
            </p>
            <div className="flex justify-center items-center gap-4 flex-wrap">
              <div className="alchemist-money-display">
                <span className="text-yellow-300 font-pixel">
                  💎 ETH: {gameState.ethBalance.toFixed(3)}
                </span>
              </div>

              {/* Music Toggle */}
              <div className="flex items-center gap-2 bg-gray-900/80 px-3 py-2 rounded-lg border border-blue-500/30 shadow-lg shadow-blue-500/20 backdrop-blur-sm">
                <span className="text-sm font-pixel text-gray-300">Music:</span>
                <button
                  onClick={handleToggleMusic}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 ${
                    isMusicEnabled ? "bg-blue-600" : "bg-gray-600"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                      isMusicEnabled ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
                <span
                  className={`text-sm font-pixel ${
                    isMusicEnabled ? "text-blue-400" : "text-gray-400"
                  }`}
                >
                  {isMusicEnabled ? "ON" : "OFF"}
                </span>
              </div>
            </div>
          </header>
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left Column - IGLOO INCUBATION CHAMBER + PENGU INFORMATION */}
            <div className="w-full lg:w-1/2">
              <GemEnhancer
                gameState={gameState}
                onEnhance={handleEnhance}
                onSell={handleSell}
                onDisassemble={handleDisassemble}
                actualPowderBoost={actualPowderBoost}
                handleUsePowder={handleUsePowder}
                handleCancelPowder={handleCancelPowder}
                handleSelectPowderColor={handleSelectPowderColor}
                disassemblyEffectResult={disassemblyEffectResult}
                onDisassemblyAnimationComplete={
                  handleDisassemblyAnimationComplete
                }
                powderToUseStaged={powderToUseForEnhancement}
                displaySuccessRate={displaySuccessRate}
                onScreenShake={handleScreenShake}
                isAnimationEnabled={isAnimationEnabled}
                onMoveEggToStorage={handleMoveCurrentEggToStorage}
              />
            </div>

            {/* Right Column - SELECT PENGU + ICE STORAGE */}
            <div className="w-full lg:w-1/2 flex flex-col gap-6">
              <PenguinSelector
                gameState={gameState}
                onGameStateChange={setGameState}
              />

              {/* Unified Storage Section - Eggs & Penguins */}
              <div className="alchemist-panel relative overflow-hidden">
                {/* Antarctic decorative elements */}
                <div className="absolute top-2 left-2 text-cyan-300/30 text-xs animate-pulse">
                  ❄
                </div>
                <div
                  className="absolute top-4 right-4 text-blue-200/40 text-sm animate-bounce"
                  style={{ animationDelay: "0.5s" }}
                >
                  ❅
                </div>
                <div
                  className="absolute bottom-4 left-4 text-cyan-200/30 text-xs animate-pulse"
                  style={{ animationDelay: "1s" }}
                >
                  ❄
                </div>
                <div
                  className="absolute bottom-2 right-2 text-blue-300/40 text-sm animate-bounce"
                  style={{ animationDelay: "1.5s" }}
                >
                  ❅
                </div>

                {/* Tab Navigation */}
                <div className="flex mb-4 relative z-10">
                  <button
                    onClick={() => {
                      setActiveStorageTab("eggs");
                      setSelectedEgg(null);
                      setSelectedEvolvedPenguin(null);
                    }}
                    className={`flex-1 font-pixel text-sm py-2 px-4 rounded-l-lg transition-all duration-300 ${
                      activeStorageTab === "eggs"
                        ? "bg-orange-600 text-white shadow-lg"
                        : "bg-gray-600 text-gray-300 hover:bg-gray-500"
                    }`}
                  >
                    EGG STORAGE
                  </button>
                  <button
                    onClick={() => {
                      setActiveStorageTab("penguins");
                      setSelectedEgg(null);
                      setSelectedEvolvedPenguin(null);
                    }}
                    className={`flex-1 font-pixel text-sm py-2 px-4 rounded-r-lg transition-all duration-300 ${
                      activeStorageTab === "penguins"
                        ? "bg-cyan-600 text-white shadow-lg"
                        : "bg-gray-600 text-gray-300 hover:bg-gray-500"
                    }`}
                  >
                    ICE STORAGE
                  </button>
                </div>

                {/* Dynamic Header */}
                <h3 className="text-lg font-bold mb-3 alchemist-text-gold font-pixel text-center relative z-10">
                  {activeStorageTab === "eggs" ? (
                    <span className="bg-gradient-to-r from-orange-300 via-yellow-200 to-orange-300 bg-clip-text text-transparent drop-shadow-lg">
                      🥚 EGG STORAGE 🥚
                    </span>
                  ) : (
                    <span className="bg-gradient-to-r from-cyan-300 via-blue-200 to-cyan-300 bg-clip-text text-transparent drop-shadow-lg">
                      ❄️ ICE STORAGE ❄️
                    </span>
                  )}
                </h3>
                <p className="text-sm alchemist-text mb-3 text-center relative z-10">
                  {activeStorageTab === "eggs"
                    ? "Strategic egg investment collection"
                    : "Evolved penguins collection"}
                </p>

                {/* Content Grid */}
                <div className="grid grid-cols-6 gap-2 max-h-32 overflow-y-auto scrollbar-hide relative z-10 mb-4">
                  {activeStorageTab === "eggs" ? (
                    // Egg Storage Content
                    gameState.inventory.filter(
                      (item) => item && item.level === 0
                    ).length === 0 ? (
                      <div className="col-span-6 text-center py-4">
                        <span className="alchemist-text text-xs opacity-60 font-pixel">
                          No eggs stored
                        </span>
                      </div>
                    ) : (
                      gameState.inventory.map((item, index) => {
                        if (!item || item.level > 0) return null;

                        return (
                          <div
                            key={`egg-${item.id}-${index}`}
                            className={`alchemist-inventory-slot w-16 h-16 p-1 cursor-pointer transition-all duration-300 hover:scale-105 ${
                              selectedEgg?.id === item.id
                                ? "ring-2 ring-orange-400 bg-orange-900/30"
                                : ""
                            }`}
                            onClick={() => handleSelectEgg(item)}
                          >
                            <Gem
                              gem={item}
                              size="full"
                              isAnimating={false}
                              isWaitingForEnhancement={false}
                              isInIceStorage={false}
                            />
                          </div>
                        );
                      })
                    )
                  ) : // Penguin Storage Content
                  gameState.evolvedPenguins.length === 0 ? (
                    <div className="col-span-6 text-center py-4">
                      <span className="alchemist-text text-xs opacity-60 font-pixel">
                        No penguins yet
                      </span>
                    </div>
                  ) : (
                    gameState.evolvedPenguins.map((penguin, index) => (
                      <div
                        key={`${penguin.id}-${index}`}
                        className={`alchemist-inventory-slot w-16 h-16 p-1 cursor-pointer transition-all duration-300 hover:scale-105 ${
                          selectedEvolvedPenguin?.id === penguin.id
                            ? "ring-2 ring-cyan-400 bg-cyan-900/30"
                            : ""
                        }`}
                        onClick={() => handleSelectEvolvedPenguin(penguin)}
                      >
                        <Gem
                          gem={penguin}
                          size="full"
                          isAnimating={false}
                          isWaitingForEnhancement={false}
                          isInIceStorage={false}
                        />
                      </div>
                    ))
                  )}
                </div>

                {/* Dynamic Info Panel */}
                {activeStorageTab === "eggs" ? (
                  // Egg Info Panel
                  selectedEgg ? (
                    <div className="bg-gradient-to-br from-orange-900/30 to-yellow-900/40 rounded-lg border border-orange-400/40 backdrop-blur-sm p-3 mb-3 relative z-10">
                      <div className="flex items-center gap-3 mb-2">
                        <div
                          className="w-8 h-8 rounded-full border-2 border-white/50"
                          style={{
                            backgroundColor: selectedEgg.displayColor,
                          }}
                        ></div>
                        <div>
                          <p className="font-pixel text-sm text-orange-100 font-bold">
                            {getEggName(selectedEgg.color)}
                          </p>
                          <p className="font-pixel text-xs text-orange-300">
                            💎{" "}
                            {calculateEggSellPrice(selectedEgg.color).toFixed(
                              3
                            )}{" "}
                            ETH
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={handleMoveSelectedEgg}
                          className="flex-1 font-pixel text-xs transition-all duration-300 hover:scale-105 hover:shadow-lg alchemist-button hover:shadow-blue-400/50"
                        >
                          MOVE
                        </button>
                        <button
                          onClick={handleSellSelectedEgg}
                          className="flex-1 alchemist-button font-pixel text-xs transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-red-400/50"
                        >
                          SELL EGG
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gradient-to-br from-gray-900/20 to-slate-900/30 rounded-lg border border-gray-400/30 backdrop-blur-sm p-3 mb-3 relative z-10">
                      <p className="font-pixel text-xs text-gray-400 text-center">
                        Select an egg to manage
                      </p>
                    </div>
                  )
                ) : // Penguin Info Panel
                selectedEvolvedPenguin ? (
                  <div className="bg-gradient-to-br from-blue-900/30 to-indigo-900/40 rounded-lg border border-blue-400/40 backdrop-blur-sm p-3 mb-3 relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                      <div
                        className="w-8 h-8 rounded-full border-2 border-white/50"
                        style={{
                          backgroundColor: selectedEvolvedPenguin.displayColor,
                        }}
                      ></div>
                      <div>
                        <p className="font-pixel text-sm text-cyan-100 font-bold">
                          {getPenguinName(selectedEvolvedPenguin.color)}
                        </p>
                        <p className="font-pixel text-xs text-cyan-300">
                          💎{" "}
                          {currentMarketPrices[
                            selectedEvolvedPenguin.color
                          ].toFixed(3)}{" "}
                          ETH
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleSellEvolvedPenguin}
                      className="w-full alchemist-button font-pixel text-xs transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-yellow-400/50"
                    >
                      💰 Sell Penguin
                    </button>
                  </div>
                ) : (
                  <div className="bg-gradient-to-br from-gray-900/20 to-slate-900/30 rounded-lg border border-gray-400/30 backdrop-blur-sm p-3 mb-3 relative z-10">
                    <p className="font-pixel text-xs text-gray-400 text-center">
                      Select a penguin to sell
                    </p>
                  </div>
                )}

                {/* Dynamic Counter */}
                <p className="text-xs alchemist-text text-center opacity-80 relative z-10">
                  {activeStorageTab === "eggs"
                    ? `Eggs: ${
                        gameState.inventory.filter(
                          (item) => item && item.level === 0
                        ).length
                      }/20`
                    : `Total: ${gameState.evolvedPenguins.length}`}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
