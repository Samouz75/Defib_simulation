import { useState, useEffect } from "react";
import DropdownMenu from "./DropdownMenu";
import ECGRhythmDropdown from "./controls/ECGRhythmDropdown";
import type { RhythmType } from "./graphsdata/ECGRhythms";

interface HeaderProps {
  onStartScenario?: (scenarioId: string) => void;
  currentRhythm: RhythmType;
  onRhythmChange: (rhythm: RhythmType) => void;
  isScenarioActive: boolean;
  heartRate: number;
  onHeartRateChange: (rate: number) => void;
  showVitalSignsHint: boolean;
}

export default function Header({
  onStartScenario,
  currentRhythm,
  onRhythmChange,
  isScenarioActive,
  heartRate,
  onHeartRateChange,
  showVitalSignsHint,
}: HeaderProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);
  

  if (!isClient) {
    return null;
  }

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: "60px",
        backgroundColor: "transparent",
        borderBottom: "transparent",
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        padding: "0 20px",
        zIndex: 1000,
      }}
    >
      {showVitalSignsHint && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-100 bg-blue-500 text-white text-xs px-3 py-2 rounded-lg shadow-lg animate-pulse">
          Cliquez sur les constantes (FC, SpO2, PNI) pour les afficher
        </div>
      )}
      <div className="absolute left-6 z-50">
        <ECGRhythmDropdown
          currentRhythm={currentRhythm}
          onRhythmChange={onRhythmChange}
          isScenarioActive={isScenarioActive}
          heartRate={heartRate}
          onHeartRateChange={onHeartRateChange}
        />
      </div>
      <DropdownMenu onStartScenario={onStartScenario} />
    </div>
  );
}
