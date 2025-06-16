import React from "react";
import { Gem as GemType } from "../types";
import Assets from "../assets.json";

// Import local gem images (new penguin images)
import redGemImg from "../asssets/images/p-1234.png";
import orangeGemImg from "../asssets/images/p-1235.png";
import yellowGemImg from "../asssets/images/p-1236.png";
import greenGemImg from "../asssets/images/p-1237.png";
import blueGemImg from "../asssets/images/p-1238.png";
import indigoGemImg from "../asssets/images/p-1239.png";
import purpleGemImg from "../asssets/images/p-1240.png";
import pinkGemImg from "../asssets/images/p-1241.png";
import cyanGemImg from "../asssets/images/p-1242.png";

// Import ice storage gem images (new egg images)
import redIceGemImg from "../asssets/images/e-1234.png";
import orangeIceGemImg from "../asssets/images/e-1235.png";
import yellowIceGemImg from "../asssets/images/e-1236.png";
import greenIceGemImg from "../asssets/images/e-1237.png";
import blueIceGemImg from "../asssets/images/e-1238.png";
import indigoIceGemImg from "../asssets/images/e-1239.png";
import purpleIceGemImg from "../asssets/images/e-1240.png";
import extraIceGemImg from "../asssets/images/e-1241.png";
import extraIceGemImg2 from "../asssets/images/e-1242.png";

interface GemProps {
  gem: GemType;
  size?: "sm" | "md" | "lg" | "full";
  onClick?: () => void;
  isSelected?: boolean;
  isAnimating?: boolean; // Enhancement animation
  isWaitingForEnhancement?: boolean; // New prop for waiting animation
  isInIceStorage?: boolean; // New prop for ice storage display
  isInIncubationChamber?: boolean; // New prop for incubation chamber circular display
}

const gemImageUrls = {
  Red: redGemImg,
  Orange: orangeGemImg,
  Yellow: yellowGemImg,
  Green: greenGemImg,
  Blue: blueGemImg,
  Indigo: indigoGemImg,
  Purple: purpleGemImg,
  Amber: pinkGemImg,
  Cyan: cyanGemImg,
};

const iceStorageImageUrls = {
  Red: redIceGemImg,
  Orange: orangeIceGemImg,
  Yellow: yellowIceGemImg,
  Green: greenIceGemImg,
  Blue: blueIceGemImg,
  Indigo: indigoIceGemImg,
  Purple: purpleIceGemImg,
  Amber: extraIceGemImg,
  Cyan: extraIceGemImg2,
};

const gemSizeClasses = {
  sm: "w-14 h-14",
  md: "w-20 h-20",
  lg: "w-32 h-32",
  full: "w-full h-full",
};

const iceStorageSizeClasses = {
  sm: "w-full h-full", // Ice storage에서 슬롯을 꽉 채우도록
  md: "w-20 h-20",
  lg: "w-32 h-32",
  full: "w-full h-full",
};

const Gem: React.FC<GemProps> = ({
  gem,
  size = "md",
  onClick,
  isSelected,
  isAnimating = false,
  isWaitingForEnhancement = false,
  isInIceStorage = false,
  isInIncubationChamber = false,
}) => {
  // 알(level 0)이면 항상 알 이미지 사용, 그 외에는 기존 로직
  const imageUrl =
    gem.level === 0
      ? isInIncubationChamber
        ? gemImageUrls[gem.color] // IGLOO에서는 펭귄 이미지
        : iceStorageImageUrls[gem.color] // 다른 곳에서는 알 이미지
      : isInIceStorage
      ? iceStorageImageUrls[gem.color]
      : gemImageUrls[gem.color]; // 펭귄 이미지

  const sizeClass = isInIceStorage
    ? iceStorageSizeClasses[size]
    : gemSizeClasses[size];
  const selectedClass = isSelected ? "ring-4 ring-white/80 rounded-lg" : "";

  // Enhanced pixel art effects for higher level gems
  const getEffectClasses = () => {
    const level = gem.level;
    let effectClasses = "";

    // Pixel art style glow effects
    if (level >= 2) effectClasses += " animate-pulse filter drop-shadow-lg";
    if (level >= 4) effectClasses += " brightness-110";
    if (level >= 6) effectClasses += " contrast-125 saturate-125";

    return effectClasses;
  };

  const effectClasses = getEffectClasses();

  // Enhancement animation classes - applies to all gems during enhancement
  const enhancementAnimationClass = isAnimating
    ? "animate-pulse opacity-70"
    : "";

  // Waiting for enhancement animation - gentle blinking effect
  const waitingAnimationClass =
    isWaitingForEnhancement && !isAnimating ? "gem-waiting-blink" : "";

  return (
    <div
      className={`relative ${sizeClass} cursor-pointer transition-all duration-300 transform hover:scale-105 ${effectClasses} ${selectedClass} ${enhancementAnimationClass} ${waitingAnimationClass} pixel-art-gem ${
        isInIncubationChamber ? "rounded-full overflow-hidden" : ""
      }`}
      onClick={onClick}
      style={{
        animationDuration:
          gem.level >= 2
            ? "2s"
            : isAnimating
            ? "1s"
            : isWaitingForEnhancement
            ? "2s"
            : undefined,
        imageRendering: "pixelated", // Ensures crisp pixel art rendering
        transform: "translateY(-5px)", // Move penguin image 5px up
      }}
    >
      <img
        src={imageUrl}
        alt={`${gem.color} Gem`}
        className={`w-full h-full ${
          isInIncubationChamber ? "object-cover rounded-full" : "object-contain"
        } pixel-art-image ${
          isAnimating ? "opacity-70 animate-pulse" : ""
        } ${waitingAnimationClass}`}
        style={{
          imageRendering: "pixelated",
          animationDuration: isAnimating
            ? "1s"
            : isWaitingForEnhancement
            ? "2s"
            : undefined,
        }}
      />

      {/* Pixel art style sparkle effects for higher level gems */}
      {gem.level >= 3 && (
        <>
          <div
            className="absolute top-[10%] right-[10%] w-[12%] h-[12%] bg-white rounded-sm opacity-80 animate-ping pixel-sparkle"
            style={{ animationDelay: "0.2s", animationDuration: "2.5s" }}
          />
          <div
            className="absolute bottom-[15%] left-[15%] w-[10%] h-[10%] bg-white rounded-sm opacity-70 animate-ping pixel-sparkle"
            style={{ animationDelay: "0.5s", animationDuration: "3s" }}
          />
        </>
      )}

      {gem.level >= 5 && (
        <>
          <div
            className="absolute top-[35%] left-[8%] w-[8%] h-[8%] bg-yellow-300 rounded-sm opacity-80 animate-ping pixel-sparkle"
            style={{ animationDelay: "0.3s", animationDuration: "2s" }}
          />
          <div
            className="absolute bottom-[30%] right-[8%] w-[10%] h-[10%] bg-yellow-200 rounded-sm opacity-70 animate-ping pixel-sparkle"
            style={{ animationDelay: "0.7s", animationDuration: "2.8s" }}
          />
        </>
      )}
    </div>
  );
};

export default Gem;
