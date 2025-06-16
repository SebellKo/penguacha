import React, { useEffect, useState } from "react";
import { GemColor } from "../types";

interface SuccessEffectProps {
  isActive: boolean;
  onComplete: () => void;
  gemColor: GemColor;
}

interface Sparkle {
  id: number;
  x: number;
  y: number;
  delay: number;
  type: string;
  size: string;
}

const SuccessEffect: React.FC<SuccessEffectProps> = ({
  isActive,
  onComplete,
  gemColor,
}) => {
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);

  useEffect(() => {
    if (isActive) {
      // Generate magical sparkles
      const newSparkles: Sparkle[] = [];
      for (let i = 0; i < 8; i++) {
        newSparkles.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          delay: Math.random() * 0.5,
          type: Math.random() > 0.5 ? "star" : "diamond",
          size: Math.random() > 0.5 ? "small" : "medium",
        });
      }
      setSparkles(newSparkles);

      // Complete after animation duration
      const timer = setTimeout(() => {
        onComplete();
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [isActive, onComplete]);

  if (!isActive) return null;

  // Color classes based on gem color
  const getColorClasses = () => {
    switch (gemColor) {
      case "Red":
        return "text-red-400 border-red-400";
      case "Orange":
        return "text-orange-400 border-orange-400";
      case "Yellow":
        return "text-yellow-400 border-yellow-400";
      case "Green":
        return "text-green-400 border-green-400";
      case "Blue":
        return "text-blue-400 border-blue-400";
      case "Indigo":
        return "text-indigo-400 border-indigo-400";
      case "Purple":
        return "text-purple-400 border-purple-400";
      default:
        return "text-white border-white";
    }
  };

  const colorClasses = getColorClasses();

  return (
    <div className="success-container">
      {/* Magical sparkles */}
      {sparkles.map((sparkle) => (
        <div
          key={sparkle.id}
          className={`success-sparkle-magical ${sparkle.type} ${sparkle.size} ${colorClasses}`}
          style={{
            left: `${sparkle.x}%`,
            top: `${sparkle.y}%`,
            animationDelay: `${sparkle.delay}s`,
          }}
        >
          {sparkle.type === "star" ? "✦" : "◆"}
        </div>
      ))}

      {/* Magical pulse rings */}
      <div className={`success-pulse-magical-1 ${colorClasses}`} />
      <div className={`success-pulse-magical-2 ${colorClasses}`} />
    </div>
  );
};

export default SuccessEffect;
