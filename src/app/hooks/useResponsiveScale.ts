import { useState, useEffect } from "react";

interface ScaleConfig {
  baseWidth: number;
  baseHeight: number;
  maxScale: number;
  minScale: number;
  padding: number;
}

const DEFAULT_CONFIG: ScaleConfig = {
  baseWidth: 1600,
  baseHeight: 1100,
  maxScale: 1.2,
  minScale: 0.4,
  padding: 40,
};

export const useResponsiveScale = (config: Partial<ScaleConfig> = {}) => {
  const [scale, setScale] = useState(1);
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  useEffect(() => {
    const calculateScale = () => {
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;

      const scaleX = (windowWidth - finalConfig.padding) / finalConfig.baseWidth;
      const scaleY = (windowHeight - finalConfig.padding) / finalConfig.baseHeight;

      const newScale = Math.min(scaleX, scaleY, finalConfig.maxScale);
      setScale(Math.max(newScale, finalConfig.minScale));
    };

    calculateScale();
    window.addEventListener("resize", calculateScale);

    return () => window.removeEventListener("resize", calculateScale);
  }, [finalConfig]);

  return scale;
}; 