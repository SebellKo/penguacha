import React from "react";
import {
  GemColor,
  GameState,
  eggPurchaseCosts,
  evolutionCosts,
} from "../types";
import {
  previewPenguin,
  purchaseEggToInventory,
  getCurrentMarketPrice,
} from "../utils/gameLogic";

// Import egg images
import redEggImg from "../asssets/images/e-1234.png";
import orangeEggImg from "../asssets/images/e-1235.png";
import yellowEggImg from "../asssets/images/e-1236.png";
import greenEggImg from "../asssets/images/e-1237.png";
import blueEggImg from "../asssets/images/e-1238.png";
import indigoEggImg from "../asssets/images/e-1239.png";
import purpleEggImg from "../asssets/images/e-1240.png";
import amberEggImg from "../asssets/images/e-1241.png";
import cyanEggImg from "../asssets/images/e-1242.png";

interface PenguinSelectorProps {
  gameState: GameState;
  onGameStateChange: (newState: GameState) => void;
}

const eggImages = {
  Red: redEggImg,
  Orange: orangeEggImg,
  Yellow: yellowEggImg,
  Green: greenEggImg,
  Blue: blueEggImg,
  Indigo: indigoEggImg,
  Purple: purpleEggImg,
  Amber: amberEggImg,
  Cyan: cyanEggImg,
};

const eggNames = {
  Red: "Red Egg",
  Orange: "Orange Egg",
  Yellow: "Yellow Egg",
  Green: "Green Egg",
  Blue: "Blue Egg",
  Indigo: "Indigo Egg",
  Purple: "Purple Egg",
  Amber: "Amber Egg",
  Cyan: "Cyan Egg",
};

const gemColors: GemColor[] = [
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

const PenguinSelector: React.FC<PenguinSelectorProps> = ({
  gameState,
  onGameStateChange,
}) => {
  const handlePreview = (color: GemColor) => {
    const newState = previewPenguin(gameState, color);
    onGameStateChange(newState);
  };

  const handlePurchaseEgg = (color: GemColor) => {
    const newState = purchaseEggToInventory(gameState, color);
    onGameStateChange(newState);
  };

  return (
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

      <h2 className="text-lg font-bold mb-3 font-pixel text-center relative z-10">
        <span className="bg-gradient-to-r from-cyan-300 via-blue-200 to-cyan-300 bg-clip-text text-transparent drop-shadow-lg">
          🥚 EGG MARKET 🥚
        </span>
      </h2>

      <div className="flex flex-col gap-2 relative z-10 max-h-96 overflow-y-auto scrollbar-hide">
        {gemColors.map((color) => {
          const eggCost = eggPurchaseCosts[color];
          const evolutionCost = evolutionCosts[color];
          const totalCost = eggCost + evolutionCost;
          const marketPrice = getCurrentMarketPrice(
            color,
            gameState.marketData
          );
          const profitPotential = Math.round(
            ((marketPrice - totalCost) / totalCost) * 100
          );
          const canAfford = gameState.ethBalance >= eggCost;
          const hasInventorySpace = gameState.inventory.some(
            (slot) => slot === null
          );

          return (
            <div
              key={color}
              className="flex items-center justify-between p-3 border rounded-lg bg-gray-50"
            >
              <div className="flex items-center space-x-3">
                <img
                  src={eggImages[color]}
                  alt={`${color} Egg`}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <div className="font-semibold text-gray-800">
                    {eggNames[color]}
                  </div>
                  <div className="text-sm text-gray-600">
                    Cost: {totalCost.toFixed(3)} ETH
                  </div>
                  <div className="text-xs text-gray-500">
                    Market: {marketPrice.toFixed(3)} ETH
                  </div>
                  <div
                    className={`text-xs ${
                      profitPotential > 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    Profit: {profitPotential > 0 ? "+" : ""}
                    {profitPotential}%
                  </div>
                </div>
              </div>
              <div className="flex flex-col space-y-2">
                <button
                  onClick={() => handlePreview(color)}
                  className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors"
                >
                  Preview
                </button>
                <button
                  onClick={() => handlePurchaseEgg(color)}
                  disabled={!canAfford || !hasInventorySpace}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    canAfford && hasInventorySpace
                      ? "bg-green-500 text-white hover:bg-green-600"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  Buy Egg
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-3 text-center relative z-10">
        <p className="alchemist-text text-xs font-pixel opacity-80">
          Buy eggs to store for strategic evolution
        </p>
      </div>
    </div>
  );
};

export default PenguinSelector;
