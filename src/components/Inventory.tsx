import React from "react";
import { Gem as GemType } from "../types";
import Gem from "./Gem";

interface InventoryProps {
  gems: (GemType | null)[];
  onGemClick: (index: number) => void;
  isAnimating?: boolean; // For consistency with other components
}

const Inventory: React.FC<InventoryProps> = ({
  gems,
  onGemClick,
  isAnimating = false,
}) => {
  return (
    <div className="alchemist-panel">
      <h2 className="text-xl font-bold mb-4 font-pixel alchemist-text-gold text-center">
        ❄️ Frozen Pengu Vault ❄️
      </h2>
      <div className="grid grid-cols-5 gap-3">
        {gems.map((gem, index) => (
          <div
            key={index}
            className={`alchemist-inventory-slot ${
              gem ? "occupied" : ""
            } cursor-pointer transition-all duration-300 hover:scale-105`}
            onClick={() => onGemClick(index)}
          >
            {gem ? (
              <div className="flex items-center justify-center w-full h-full">
                <Gem
                  gem={gem}
                  size="sm"
                  isAnimating={isAnimating}
                  isWaitingForEnhancement={false} // Inventory gems don't wait for enhancement
                />
              </div>
            ) : (
              <div className="flex items-center justify-center w-full h-full min-h-[3rem]">
                <span className="alchemist-text text-xs opacity-60 font-pixel">
                  Empty
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="mt-4 text-center">
        <p className="alchemist-text text-xs font-pixel opacity-80">
          Click Pengus to store or retrieve from frozen vault
        </p>
      </div>
    </div>
  );
};

export default Inventory;
