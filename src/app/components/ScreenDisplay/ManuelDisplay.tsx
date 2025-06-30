import React, { forwardRef, useImperativeHandle, useState, useEffect, useRef } from "react";
import ECGDisplay from "../graphsdata/ECGDisplay";
import TimerDisplay from "../TimerDisplay";
import type { RhythmType } from "../graphsdata/ECGRhythms";

interface ManuelDisplayProps {
  frequency: string; // Fréquence cardiaque manuelle (1-200)
  chargeProgress: number; // 0-100 pour la barre de progression
  shockCount: number; // Nombre de chocs délivrés
  isCharging: boolean; // État de charge en cours
  rhythmType?: RhythmType; // Nouveau prop pour le rythme ECG
  showSynchroArrows?: boolean; //prop pour les flèches synchro
  heartRate?: number; // Fréquence cardiaque
  isCharged?: boolean; // État de charge complète
  onCancelCharge?: () => boolean; // Callback pour annuler la charge
}

export interface ManuelDisplayRef {
  triggerCancelCharge: () => boolean;
}

const ManuelDisplay = forwardRef<ManuelDisplayRef, ManuelDisplayProps>(({
  frequency,
  chargeProgress,
  shockCount,
  isCharging,
  rhythmType = 'sinus', // Par défaut : rythme sinusal
  showSynchroArrows = false,
  heartRate = 70,
  isCharged = false,
  onCancelCharge
}, ref) => {

  // État pour "Choc délivré" et "Commencez la RCP"
  const [showShockDelivered, setShowShockDelivered] = useState(false);
  const [showCPRMessage, setShowCPRMessage] = useState(false);
  
  // État pour le clignotement des fibrillations
  const [fibBlink, setFibBlink] = useState(false);

  // Refs pour les timers afin de pouvoir les nettoyer
  const timer1Ref = useRef<NodeJS.Timeout | null>(null);
  const timer2Ref = useRef<NodeJS.Timeout | null>(null);

  // Fonction pour nettoyer tous les timers précédents
  const clearAllTimers = () => {
    if (timer1Ref.current) {
      clearTimeout(timer1Ref.current);
      timer1Ref.current = null;
    }
    if (timer2Ref.current) {
      clearTimeout(timer2Ref.current);
      timer2Ref.current = null;
    }
  };

  // Effet pour nettoyer les états quand une nouvelle charge commence
  useEffect(() => {
    if (isCharging) {
      // Nettoyer tous les timers précédents
      clearAllTimers();
      
      // Nettoyer tous les messages précédents
      setShowShockDelivered(false);
      setShowCPRMessage(false);
    }
  }, [isCharging]);

  // Effet pour gérer la séquence de messages après choc
  useEffect(() => {
    if (shockCount > 0) {
      clearAllTimers();
      
      setShowShockDelivered(true);
      
      // Après 4 secondes : cacher "Choc délivré" et afficher "Commencez la RCP"
      timer1Ref.current = setTimeout(() => {
        setShowShockDelivered(false);
        setShowCPRMessage(true);
      }, 4000);
      
      // Après 8 secondes supplémentaires : cacher "Commencez la RCP"
      timer2Ref.current = setTimeout(() => {
        setShowCPRMessage(false);
      }, 12000); 

      return () => {
        clearAllTimers();
      };
    }
  }, [shockCount]);

  // Effet pour le clignotement des fibrillations
  useEffect(() => {
    if (rhythmType === 'fibrillationVentriculaire' || rhythmType === 'fibrillationAtriale') {
      const interval = setInterval(() => {
        setFibBlink(prev => !prev);
      }, 500); 

      return () => clearInterval(interval);
    }
  }, [rhythmType]);

  useImperativeHandle(ref, () => ({
    triggerCancelCharge: () => {
      return onCancelCharge ? onCancelCharge() : false;
    }
  }));
  return (
    <div className="absolute inset-3 bg-gray-900 rounded-lg">
      <div className="h-full flex flex-col">
        {/* Rangée 1 - En-tête */}
        <div className="h-1/6 border-b border-gray-600 flex items-center justify-between bg-black text-white text-sm font-mono grid grid-cols-3">
          {/* Section gauche - Info patient */}
          <div className="flex items-center h-full">
            <div className="bg-orange-500 px-3 py-1 h-full flex flex-col justify-sart">
              <div className="text-black font-bold text-xs">Adulte</div>
              <div className="text-black text-xs">≥25 kg</div>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <TimerDisplay
              onTimeUpdate={(seconds) => {        
              }}
            />
          </div>

          {/* Section droite - Date et icône */}
          <div className="flex items-end flex-col gap-2 px-3 justify-end">
          <div className="flex flex-row items-center gap-x-2">
            <div className="text-white text-xs">
              {new Date()
                .toLocaleDateString("fr-FR", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })
                .replace(".", "")}{" "}
              {new Date().toLocaleTimeString("fr-FR", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              })}
            </div>
       
            <div className="w-4 h-3 bg-green-500 rounded-sm flex items-center justify-center">
              <div className="w-2 h-1.5 bg-white rounded-xs"></div>
            </div>
            </div>
            {(rhythmType === 'fibrillationVentriculaire' || rhythmType === 'fibrillationAtriale') && (
              <div className="w-35 h-4 bg-red-500 mb-2">
                <span className="block text-center text-white text-xs mb-3"> Analyse ECG impossible</span>
              </div>
            )}
          </div>
          
        </div>

        {/* Rangée 2 - Paramètres médicaux */}
        <div className="text-left h-1/4 border-b border-gray-600 flex items-center gap-8 px-4 text-sm bg-black">
          {/* FC */}
          <div className="flex flex-col">
            {(rhythmType === 'fibrillationVentriculaire' || rhythmType === 'fibrillationAtriale') ? (
              // Composant clignotant pour les fibrillations
              <div className="flex items-center justify-center -ml-9">
                <div className={`px-5 py-0.2 ${fibBlink ? 'bg-red-600' : 'bg-white'}`}>
                  <span className={`text-xs font-bold ${fibBlink ? 'text-white' : 'text-red-600'}`}>
                    {rhythmType === 'fibrillationVentriculaire' ? 'Fib.V' : 'Fib.A'}
                  </span>
                </div>
              </div>
            ) : (
              // Affichage normal FC et bpm
              <div className="flex flex-row items-center gap-x-2">
                <div className="text-gray-400 text-xs">FC</div>
                <div className="text-gray-400 text-xs">bpm</div>
              </div>
            )}
            <div className="flex flex-row items-center gap-x-2">
              <div className="text-green-400 text-4xl font-bold">
                {rhythmType === 'fibrillationVentriculaire' ? '--' : rhythmType === 'asystole' ? '0' : rhythmType === 'fibrillationAtriale' ? '--' : heartRate}
              </div>
              <div className="text-green-400 text-xs">120</div>
            </div>
          </div>

          {/* SpO2 */}
          <div className="flex flex-col">
            <div className="flex flex-row items-center gap-x-2">
              <div className="text-blue-400 text-2xl font-bold">SpO2</div>
              <div className="text-blue-400 text-xs">%</div>
            </div>

            {/* SpO2 Value */}
            <div className="flex flex-row  gap-x-2">
              <div className="text-blue-400 text-4xl font-bold -mt-2">
                {rhythmType === 'fibrillationVentriculaire' || rhythmType === 'fibrillationAtriale' ? '--' : '95'}
              </div>
              <div className="flex flex-col items-center">
                <div className="text-blue-400 text-xs">100</div>
                <div className="text-blue-400 text-xs">90</div>
              </div>
            </div>
          </div>

          {/* Pouls */}
          <div className="flex flex-row  gap-x-2">
            <div className="flex flex-col ">
              <div className="text-blue-400 text-xs">Pouls</div>
              <div className="text-blue-400 text-4xl font-bold">
                {rhythmType === 'fibrillationVentriculaire' ? '--' : rhythmType === 'asystole' ? '0' : rhythmType === 'fibrillationAtriale' ? '--' : heartRate}
              </div>
            </div>
            <div className="flex flex-col ">
              <div className="text-blue-400 text-xs mb-2">bpm</div>
              <div className="text-blue-400 text-xs">120</div>
              <div className="text-blue-400 text-xs">50</div>
            </div>
          </div>
        </div>

        {/* Row 3 - ECG Display avec rythme dynamique et flèches synchro */}
        <div className="h-1/3 border-b border-gray-600 flex flex-col items-center justify-start text-green-400 text-sm bg-black ">
          <ECGDisplay 
            width={800} 
            height={65} 
            rhythmType={rhythmType} 
            showSynchroArrows={showSynchroArrows}
            heartRate={heartRate}
          />
          <div className="w-full text-xs font-bold text-green-400 text-right ">
            <span>
              {rhythmType === 'fibrillationVentriculaire' ? 'Fibrillation ventriculaire' : 
               rhythmType === 'asystole' ? 'Asystolie' : 'Rythme sinusal'}
            </span>
          </div>
          <div className="w-full flex justify-start items-center gap-4 text-xs font-bold text-white">
            <div className="text-left">
              <span>RCP :</span>
            </div>
            <div className="w-24 h-3 bg-gray-600 rounded">
              <div
                className={`h-full bg-red-500 rounded transition-all duration-100 ${
                  chargeProgress === 100 ? "animate-pulse" : ""
                }`}
                style={{ width: `${chargeProgress}%` }}
              />
            </div>
            <div className="text-center ml-30">
              <span>Chocs : {shockCount}</span>
            </div>
            <div className="text-right ml-auto">
              <span>Energie sélectionnée : {frequency} joules</span>
            </div>
          </div>
        </div>

        {/* Row 4 - Deuxième ECG Display avec rythme dynamique et flèches synchro */}
        <div className=" h-1/3 border-b border-gray-600 flex flex-col items-center justify-start text-blue-400 text-sm bg-black">
          <ECGDisplay 
            width={800} 
            height={65} 
            rhythmType={rhythmType} 
            showSynchroArrows={showSynchroArrows}
            heartRate={heartRate}
          />
        </div>

        {/* Row 5 - Message de choc prêt */}
          {isCharged && (
            <div className="h-6 -mb-2 flex items-center justify-center bg-black z-10">
              <div className="bg-white px-2 py-0.2 rounded-xs mt-2">
                <span className="text-black text-xs font-bold">Délivrez le choc maintenant</span>
              </div>
            </div>
          )}

        {/* Row 5 - Messages après choc */}
         {showShockDelivered && (
           <div className="h-6 -mb-2 flex items-center justify-center bg-black z-10">
             <div className="bg-white px-2 py-0.2 rounded-xs mt-2">
               <span className="text-black text-xs font-bold">Choc délivré</span>
             </div>
           </div>
         )}
         
         {showCPRMessage && (
           <div className="h-6 -mb-2 flex items-center justify-center bg-black z-10">
             <div className="bg-white px-2 py-0.2 rounded-xs mt-2">
               <span className="text-black text-xs font-bold">Commencez la réanimation cardio pulmonaire</span>
             </div>
           </div>
         )}

        {/* Row 6 */}
        <div className=" pt-5 pb-2 bg-black h-1/12 flex items-center justify-between  text-white text-xs ">
          <div className="flex">
            <div className="flex items-center gap-2">
              <div className="bg-gray-500 px-2 py-0.5 h-full flex flex-col justify-center text-xs mr-1 ">
                <span>Début PNI</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-gray-500 px-2 py-0.5 h-full flex flex-col justify-center text-xs ">
                <span>Début RCP</span>
              </div>
            </div>
          </div>
          <div className="flex">
            <div className="flex items-center gap-2">
              <div className={`px-2 py-0.5 h-full flex flex-col justify-center text-xs mr-1 ${
                isCharged ? 'bg-red-500 text-white' : 'bg-gray-500 text-gray-300'
              }`}>
                <span>Annuler Charge</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-gray-500 px-2 py-0.5 h-full flex flex-col justify-center text-xs ">
                <span>Menu</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default ManuelDisplay;