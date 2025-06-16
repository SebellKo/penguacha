import React, { useState, useEffect } from "react";
import {
  GameState,
  GemColor,
  Gem as GemType,
  DisassemblyResultType,
  powderBoostRates,
  evolutionCosts,
  evolutionSuccessRates,
  eggPurchaseCosts,
} from "../types";
import {
  getCurrentMarketPrice,
  calculateEggSellPrice,
} from "../utils/gameLogic";
import Gem from "./Gem";
import BurstEffect from "./BurstEffect";
import SuccessEffect from "./SuccessEffect";

interface GemEnhancerProps {
  gameState: GameState;
  onEnhance: () => void;
  onSell: () => void;
  onDisassemble: () => void;
  actualPowderBoost: number; // Actual boost % from App.tsx
  handleUsePowder: (amount: number) => void;
  handleCancelPowder: () => void;
  handleSelectPowderColor: (color: GemColor) => void;
  disassemblyEffectResult: DisassemblyResultType | null;
  onDisassemblyAnimationComplete: () => void;
  powderToUseStaged: number;
  displaySuccessRate: number; // The final rate to display (base + actualPowderBoost)
  onScreenShake: () => void; // New prop for triggering screen shake
  isAnimationEnabled: boolean; // New prop for animation toggle
  onMoveEggToStorage: () => void; // New prop for moving egg back to storage
}

const GemEnhancer: React.FC<GemEnhancerProps> = ({
  gameState,
  onEnhance,
  onSell,
  onDisassemble,
  actualPowderBoost,
  handleUsePowder,
  handleCancelPowder,
  handleSelectPowderColor,
  disassemblyEffectResult,
  onDisassemblyAnimationComplete,
  powderToUseStaged,
  displaySuccessRate,
  onScreenShake,
  isAnimationEnabled,
  onMoveEggToStorage,
}) => {
  const [enhanceResult, setEnhanceResult] = useState<
    "success" | "failure" | null
  >(null);
  const [showEffect, setShowEffect] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [previousGemColor, setPreviousGemColor] = useState<string | null>(null);
  const [actionType, setActionType] = useState<
    "enhance" | "disassemble" | null
  >(null);
  const [showBurst, setShowBurst] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const { currentGem, ethBalance } = gameState;

  // Calculate current market price for the current gem
  const currentMarketPrice = currentGem
    ? getCurrentMarketPrice(currentGem.color, gameState.marketData)
    : 0;

  // Calculate egg sell price
  const eggSellPrice =
    currentGem && currentGem.level === 0
      ? calculateEggSellPrice(currentGem.color)
      : 0;

  // Check if current gem is in preview mode
  const isPreviewMode = currentGem && currentGem.id.startsWith("preview-");

  useEffect(() => {
    if (disassemblyEffectResult !== null && actionType === "disassemble") {
      setIsAnimating(true);
      setShowEffect(true);
      const timer = setTimeout(() => {
        setShowEffect(false);
        setIsAnimating(false);
        setPreviousGemColor(null);
        setActionType(null);
        onDisassemblyAnimationComplete();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [disassemblyEffectResult, actionType, onDisassemblyAnimationComplete]);

  useEffect(() => {
    if (previousGemColor && actionType === "enhance") {
      // In NFT system, check if evolution was successful by checking evolved penguins
      if (gameState.evolvedPenguins.length > 0) {
        const lastEvolved =
          gameState.evolvedPenguins[gameState.evolvedPenguins.length - 1];
        if (lastEvolved.color === previousGemColor) {
          console.log("Evolution SUCCESS detected:", previousGemColor);
          setEnhanceResult("success");
          setShowSuccess(true);
        }
      } else if (!currentGem) {
        // Evolution failed - no current gem and no new evolved penguin
        console.log("Evolution FAILURE detected:", previousGemColor);
        setEnhanceResult("failure");
        setShowBurst(true);
        onScreenShake();
      }
    }
  }, [
    currentGem,
    previousGemColor,
    actionType,
    onScreenShake,
    gameState.evolvedPenguins,
  ]);

  const handleBurstComplete = () => {
    setShowBurst(false);
    setEnhanceResult(null);
  };

  const handleSuccessComplete = () => {
    setShowSuccess(false);
    setEnhanceResult(null);
  };

  // NFT Game: Show UI even without current gem
  const canEnhance =
    currentGem &&
    currentGem.level === 0 &&
    ethBalance >= evolutionCosts[currentGem.color] &&
    !isPreviewMode; // Only purchased eggs can be evolved
  const canSell = currentGem && currentGem.level > 0; // Can only sell evolved penguins
  const canDisassemble = currentGem && currentGem.color !== "Red";

  // Check if gem is waiting to be enhanced (can enhance but not currently animating)
  const isWaitingForEnhancement = canEnhance && !isAnimating;

  const handleEnhanceClick = () => {
    if (!canEnhance || isAnimating) return;

    console.log("Enhancement started from color:", currentGem.color);
    setIsAnimating(true);
    setActionType("enhance");
    setPreviousGemColor(currentGem.color);

    // Reset any previous effects
    setShowBurst(false);
    setShowSuccess(false);
    setEnhanceResult(null);

    // Execute enhancement immediately without video
    onEnhance();

    // Clean up animation state after effect duration
    setTimeout(() => {
      setIsAnimating(false);
      setPreviousGemColor(null);
      setActionType(null);
    }, 1500);
  };

  const handleDisassembleClick = () => {
    if (!canDisassemble || isAnimating) return;

    setActionType("disassemble");
    setPreviousGemColor(currentGem.color);
    onDisassemble();
  };

  return (
    <>
      <div className="flex flex-col gap-6">
        {/* IGLOO INCUBATION CHAMBER */}
        <div className="flex flex-col items-center w-full">
          {/* Enhanced Arcane Pedestal Card */}
          <div className="arcane-pedestal-card w-full flex flex-col items-center justify-center relative">
            {/* Mystical Header */}
            <div className="arcane-pedestal-header">
              <h2 className="arcane-pedestal-title font-pixel">
                ❄️ IGLOO INCUBATION CHAMBER ❄️
              </h2>
              <div className="arcane-pedestal-subtitle font-pixel">
                Antarctic Magic Circle of Egg Evolution
              </div>
            </div>

            {/* Mystical Gem Display Area */}
            <div className="arcane-pedestal-chamber">
              {/* Outer Mystical Rings */}
              <div className="arcane-ring-outer"></div>
              <div className="arcane-ring-middle"></div>
              <div className="arcane-ring-inner"></div>

              {/* Mystical Corner Runes */}
              <div className="arcane-rune arcane-rune-tl">◊</div>
              <div className="arcane-rune arcane-rune-tr">◊</div>
              <div className="arcane-rune arcane-rune-bl">◊</div>
              <div className="arcane-rune arcane-rune-br">◊</div>

              {/* Central Gem Platform */}
              <div className="arcane-gem-platform">
                <div className="arcane-platform-base"></div>
                <div className="arcane-platform-glow"></div>

                <div
                  className="relative animate-float"
                  style={{ animationDuration: "3s" }}
                >
                  {currentGem ? (
                    <>
                      <Gem
                        gem={currentGem}
                        size="lg"
                        isAnimating={isAnimating}
                        isWaitingForEnhancement={isWaitingForEnhancement}
                        isInIceStorage={true}
                        isInIncubationChamber={true}
                      />

                      {/* Burst Effect Component - only for enhancement failures */}
                      <BurstEffect
                        isActive={showBurst}
                        onComplete={handleBurstComplete}
                        gemColor={currentGem.color}
                      />

                      {/* Success Effect Component - only for enhancement successes */}
                      <SuccessEffect
                        isActive={showSuccess}
                        onComplete={handleSuccessComplete}
                        gemColor={currentGem.color}
                      />
                    </>
                  ) : (
                    <div className="w-32 h-32 flex items-center justify-center">
                      <div className="text-center">
                        <p className="font-pixel text-lg text-gray-400 opacity-50">
                          Empty
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Mystical Energy Particles */}
              <div className="arcane-particles">
                <div className="arcane-particle arcane-particle-1"></div>
                <div className="arcane-particle arcane-particle-2"></div>
                <div className="arcane-particle arcane-particle-3"></div>
                <div className="arcane-particle arcane-particle-4"></div>
                <div className="arcane-particle arcane-particle-5"></div>
                <div className="arcane-particle arcane-particle-6"></div>
              </div>
            </div>

            {/* Enhanced Result Display */}
            {actionType === "enhance" && enhanceResult && (
              <div
                className={`arcane-result-display ${
                  enhanceResult === "success"
                    ? "arcane-result-success"
                    : "arcane-result-failure"
                }`}
              >
                <div className="arcane-result-text font-pixel">
                  {enhanceResult === "success"
                    ? "❄️ TRANSFORMATION SUCCESSFUL! ❄️"
                    : "🧊 TRANSFORMATION FAILED! 🧊"}
                </div>
                <div className="arcane-result-subtitle font-pixel">
                  {enhanceResult === "success"
                    ? "Your Pengu has evolved to a new form!"
                    : "The Antarctic magic has dispersed..."}
                </div>
              </div>
            )}

            {/* Enhanced Disassembly Result Display */}
            {actionType === "disassemble" && disassemblyEffectResult && (
              <div
                className={`arcane-result-display ${
                  disassemblyEffectResult === "success"
                    ? "arcane-result-disassemble-success"
                    : "arcane-result-disassemble-failure"
                }`}
              >
                <div className="arcane-result-text font-pixel">
                  {disassemblyEffectResult === "success"
                    ? "❄️ ICE CRYSTALS EXTRACTED! ❄️"
                    : "🧊 NO CRYSTALS OBTAINED 🧊"}
                </div>
                <div className="arcane-result-subtitle font-pixel">
                  {disassemblyEffectResult === "success"
                    ? "Magical ice essence has been harvested!"
                    : "The Pengu yielded no magical residue..."}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* PENGU INFORMATION */}
        <div className="alchemist-panel w-full relative overflow-hidden">
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

          <h2 className="text-xl font-bold mb-4 font-pixel text-center relative z-10">
            <span className="bg-gradient-to-r from-cyan-300 via-blue-200 to-cyan-300 bg-clip-text text-transparent drop-shadow-lg">
              ❄️ PENGU INFORMATION ❄️
            </span>
          </h2>

          {currentGem ? (
            <>
              <div className="mb-4 p-3 bg-gradient-to-br from-cyan-900/20 to-blue-900/30 rounded-lg border border-cyan-400/30 backdrop-blur-sm relative z-10">
                <p className="text-lg font-pixel text-cyan-100">
                  {currentGem.level === 0
                    ? "🥚 Current Egg: "
                    : "🐧 Current Penguin: "}
                  <span
                    className={`text-${currentGem.color.toLowerCase()}-400 font-bold drop-shadow-md`}
                  >
                    {currentGem.color === "Red"
                      ? currentGem.level === 0
                        ? "Pengu #1234 Egg"
                        : "Pengu #1234"
                      : currentGem.color === "Orange"
                      ? currentGem.level === 0
                        ? "Pengu #1235 Egg"
                        : "Pengu #1235"
                      : currentGem.color === "Yellow"
                      ? currentGem.level === 0
                        ? "Pengu #1236 Egg"
                        : "Pengu #1236"
                      : currentGem.color === "Green"
                      ? currentGem.level === 0
                        ? "Pengu #1237 Egg"
                        : "Pengu #1237"
                      : currentGem.color === "Blue"
                      ? currentGem.level === 0
                        ? "Pengu #1238 Egg"
                        : "Pengu #1238"
                      : currentGem.color === "Indigo"
                      ? currentGem.level === 0
                        ? "Pengu #1239 Egg"
                        : "Pengu #1239"
                      : currentGem.color === "Purple"
                      ? currentGem.level === 0
                        ? "Pengu #1240 Egg"
                        : "Pengu #1240"
                      : currentGem.color === "Amber"
                      ? currentGem.level === 0
                        ? "Pengu #1241 Egg"
                        : "Pengu #1241"
                      : currentGem.color === "Cyan"
                      ? currentGem.level === 0
                        ? "Pengu #1242 Egg"
                        : "Pengu #1242"
                      : currentGem.level === 0
                      ? "Unknown Pengu Egg"
                      : "Unknown Pengu"}
                  </span>
                </p>
                <p className="font-pixel text-cyan-200">
                  💎 Purchase Cost:{" "}
                  <span className="text-yellow-300 font-bold drop-shadow-md">
                    {eggPurchaseCosts[currentGem.color]} ETH
                  </span>
                </p>
              </div>

              {currentGem.level === 0 ? (
                // 알 상태일 때
                <div className="mb-4 p-3 bg-gradient-to-br from-blue-900/30 to-indigo-900/40 rounded-lg border border-blue-400/40 backdrop-blur-sm relative z-10 shadow-lg shadow-blue-500/20">
                  <p className="text-lg font-semibold font-pixel text-center mb-2">
                    <span className="bg-gradient-to-r from-blue-300 via-cyan-200 to-blue-300 bg-clip-text text-transparent drop-shadow-lg">
                      ❄️ EVOLUTION MAGIC ❄️
                    </span>
                  </p>
                  <div className="font-pixel text-blue-100">
                    <p className="mb-1">Evolution Target:</p>
                    <p
                      className={`text-${currentGem.color.toLowerCase()}-400 font-bold drop-shadow-md text-center`}
                    >
                      {currentGem.color === "Red"
                        ? "Pengu #1234"
                        : currentGem.color === "Orange"
                        ? "Pengu #1235"
                        : currentGem.color === "Yellow"
                        ? "Pengu #1236"
                        : currentGem.color === "Green"
                        ? "Pengu #1237"
                        : currentGem.color === "Blue"
                        ? "Pengu #1238"
                        : currentGem.color === "Indigo"
                        ? "Pengu #1239"
                        : currentGem.color === "Purple"
                        ? "Pengu #1240"
                        : currentGem.color === "Amber"
                        ? "Pengu #1241"
                        : currentGem.color === "Cyan"
                        ? "Pengu #1242"
                        : "Unknown Pengu"}
                    </p>
                  </div>
                  <p className="font-pixel text-blue-100">
                    Evolution Cost:{" "}
                    <span className="text-yellow-300 font-bold drop-shadow-md">
                      💎 {evolutionCosts[currentGem.color]} ETH
                    </span>
                  </p>
                  <p className="font-pixel text-blue-100">
                    Success Rate:{" "}
                    <span className="text-green-300 font-bold drop-shadow-md">
                      {actualPowderBoost > 0 ? (
                        <>
                          <span className="line-through text-gray-400">
                            {evolutionSuccessRates[currentGem.color]}%
                          </span>{" "}
                          <span className="text-green-200 font-bold">
                            {displaySuccessRate.toFixed(2)}%
                          </span>
                          <span className="text-xs text-green-300 ml-1">
                            (+{actualPowderBoost.toFixed(2)}%)
                          </span>
                        </>
                      ) : (
                        `${evolutionSuccessRates[currentGem.color]}%`
                      )}
                    </span>
                  </p>
                  <p className="font-pixel text-blue-100">
                    Expected Market Value:{" "}
                    <span className="text-green-300 font-bold drop-shadow-md">
                      💎 {currentMarketPrice.toFixed(3)} ETH
                    </span>
                  </p>
                  <p className="font-pixel text-blue-100">
                    Egg Sell Price:{" "}
                    <span className="text-orange-300 font-bold drop-shadow-md">
                      💎 {eggSellPrice.toFixed(3)} ETH
                    </span>
                  </p>
                  <p className="font-pixel text-xs text-gray-300 mt-1">
                    * Market price changes based on supply & demand
                  </p>
                </div>
              ) : (
                // 펭귄 상태일 때
                <div className="mb-4 p-3 bg-gradient-to-br from-green-900/30 to-emerald-900/40 rounded-lg border border-green-400/40 backdrop-blur-sm relative z-10 shadow-lg shadow-green-500/20">
                  <p className="text-lg font-semibold font-pixel text-center mb-2">
                    <span className="bg-gradient-to-r from-green-300 via-emerald-200 to-green-300 bg-clip-text text-transparent drop-shadow-lg">
                      🐧 EVOLVED PENGUIN 🐧
                    </span>
                  </p>
                  <p className="font-pixel text-green-100">
                    Current Market Value:{" "}
                    <span className="text-green-300 font-bold drop-shadow-md">
                      💎 {currentMarketPrice.toFixed(3)} ETH
                    </span>
                  </p>
                  <p className="font-pixel text-xs text-gray-300 mt-1">
                    * Market price changes based on supply & demand
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="mb-4 p-3 bg-gradient-to-br from-gray-900/20 to-slate-900/30 rounded-lg border border-gray-400/30 backdrop-blur-sm relative z-10">
              <p className="text-lg font-pixel text-gray-300 text-center">
                🥚 No Egg Selected
              </p>
              <p className="font-pixel text-gray-400 text-center text-sm">
                Select a penguin to purchase an egg
              </p>
            </div>
          )}

          <div className="flex flex-col gap-3 mt-6 relative z-10">
            {currentGem && currentGem.level === 0 ? (
              // 알 상태일 때 버튼들
              <>
                <button
                  onClick={handleEnhanceClick}
                  disabled={!canEnhance || isAnimating}
                  className={`alchemist-button font-pixel text-sm transition-all duration-300 ${
                    canEnhance && !isAnimating
                      ? "hover:scale-105 hover:shadow-lg hover:shadow-blue-400/50"
                      : "cursor-not-allowed opacity-60"
                  }`}
                >
                  🥚 Evolve to Penguin ❄️
                  {isPreviewMode && (
                    <span className="text-xs text-gray-400 ml-1">
                      (Preview Only)
                    </span>
                  )}
                </button>
                <button
                  onClick={onMoveEggToStorage}
                  disabled={isAnimating || isPreviewMode}
                  className={`alchemist-button font-pixel text-sm transition-all duration-300 ${
                    !isAnimating && !isPreviewMode
                      ? "hover:scale-105 hover:shadow-lg hover:shadow-orange-400/50 bg-orange-600 hover:bg-orange-500"
                      : "cursor-not-allowed opacity-60"
                  }`}
                >
                  📦 Move to Storage
                  {isPreviewMode && (
                    <span className="text-xs text-gray-400 ml-1">
                      (Preview Only)
                    </span>
                  )}
                </button>
              </>
            ) : currentGem && currentGem.level > 0 ? (
              // 펭귄 상태일 때 버튼들
              <button
                onClick={onSell}
                disabled={!canSell || isAnimating}
                className={`alchemist-button font-pixel text-sm transition-all duration-300 ${
                  canSell && !isAnimating
                    ? "hover:scale-105 hover:shadow-lg hover:shadow-green-400/50"
                    : "cursor-not-allowed opacity-60"
                }`}
              >
                🐧 Sell Penguin (💎{currentMarketPrice.toFixed(3)} ETH)
              </button>
            ) : (
              // 아무것도 없을 때
              <button
                disabled
                className="alchemist-button font-pixel text-sm cursor-not-allowed opacity-60"
              >
                🥚 Select Egg First
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default GemEnhancer;
