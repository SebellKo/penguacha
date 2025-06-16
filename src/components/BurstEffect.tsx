import React, { useEffect, useState } from "react";
import { GemColor } from "../types";

interface BurstEffectProps {
  isActive: boolean;
  onComplete: () => void;
  gemColor: GemColor;
}

interface Particle {
  id: number;
  dx: number;
  dy: number;
  delay: number;
  type: string;
  size: string;
}

const BurstEffect: React.FC<BurstEffectProps> = ({
  isActive,
  onComplete,
  gemColor,
}) => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (isActive) {
      // Generate destructive particles
      const newParticles: Particle[] = [];
      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * 2 * Math.PI;
        const distance = 60 + Math.random() * 40;
        newParticles.push({
          id: i,
          dx: Math.cos(angle) * distance,
          dy: Math.sin(angle) * distance,
          delay: Math.random() * 0.2,
          type: Math.random() > 0.5 ? "shard" : "fragment",
          size: Math.random() > 0.5 ? "small" : "medium",
        });
      }
      setParticles(newParticles);

      // Complete after animation duration
      const timer = setTimeout(() => {
        onComplete();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [isActive, onComplete]);

  if (!isActive) return null;

  // Color classes based on gem color
  const getColorClasses = () => {
    switch (gemColor) {
      case "Red":
        return "border-red-500 bg-red-400";
      case "Orange":
        return "border-orange-500 bg-orange-400";
      case "Yellow":
        return "border-yellow-500 bg-yellow-400";
      case "Green":
        return "border-green-500 bg-green-400";
      case "Blue":
        return "border-blue-500 bg-blue-400";
      case "Indigo":
        return "border-indigo-500 bg-indigo-400";
      case "Purple":
        return "border-purple-500 bg-purple-400";
      default:
        return "border-gray-500 bg-gray-400";
    }
  };

  const colorClasses = getColorClasses();

  return (
    <div className="burst-container">
      {/* Destructive particles */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className={`burst-particle-destructive ${particle.type} ${particle.size} ${colorClasses}`}
          style={
            {
              left: "50%",
              top: "50%",
              "--dx": `${particle.dx}px`,
              "--dy": `${particle.dy}px`,
              animationDelay: `${particle.delay}s`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
};

export default BurstEffect;
