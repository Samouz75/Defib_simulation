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
}

export default function Header({
  onStartScenario,
  currentRhythm,
  onRhythmChange,
  isScenarioActive,
  heartRate,
  onHeartRateChange,
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
