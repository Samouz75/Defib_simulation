import React, { useState, forwardRef, useImperativeHandle } from 'react';
import ECGDisplay from '../graphsdata/ECGDisplay';
import PlethDisplay from '../graphsdata/PlethDisplay';
import TimerDisplay from '../TimerDisplay';
import type { RhythmType } from '../graphsdata/ECGRhythms';
import { useFVVitalSigns } from '../../hooks/useFVVitalSigns';

interface MonitorDisplayProps {
  rhythmType?: RhythmType;
  showSynchroArrows?: boolean; 
  heartRate?: number; 
}

export interface MonitorDisplayRef {
  triggerMenu: () => void;
  navigateUp: () => void;
  navigateDown: () => void;
  selectCurrentItem: () => void;
  isInValueEditMode: () => boolean;
  incrementValue: () => void;
  decrementValue: () => void;
}

const MonitorDisplay = forwardRef<MonitorDisplayRef, MonitorDisplayProps>(({ 
  rhythmType = 'sinus',
  showSynchroArrows = false,
  heartRate = 70 
}, ref) => {
  const fvVitalSigns = useFVVitalSigns(rhythmType);
  
  // États pour le menu
  const [showMenu, setShowMenu] = useState(false);
  const [showMesuresMenu, setShowMesuresMenu] = useState(false);
  const [showFCMenu, setShowFCMenu] = useState(false);
  const [showPNIMenu, setShowPNIMenu] = useState(false);
  const [showLimitesFCMenu, setShowLimitesFCMenu] = useState(false);
  const [selectedMenuIndex, setSelectedMenuIndex] = useState(0);
  const [limitesFCValue, setLimitesFCValue] = useState(120);

  // Configuration du menu
  const menuConfigs = {
    main: ['Volume', 'Courbes affichées', 'Mesures/Alarmes', 'Infos patient', 'Tendances'],
    Mesures: ['FC/Arythmie', 'PNI', 'SpO2', 'Pouls', 'Fin'],
    FC: ['Reprise acqu. rythme', 'Alarmes desactivées', 'Limites FC', 'Limites Tachy. V','Limite fréquence ESV', 'Fin'],
    PNI: ['Fréquence PNI', 'Alarmes desactivées','Limites PNI', 'Fin'],
    LimitesFC: ['▲', limitesFCValue.toString(), '▼', 'Fin'],
  };

  // Vérifie si un menu est ouvert
  const isAnyMenuOpen = () => {
    return showMenu || showMesuresMenu || showFCMenu || showPNIMenu || showLimitesFCMenu;
  };

  const getCurrentMenuItems = () => {
    if (showMenu) return menuConfigs.main;
    if (showMesuresMenu) return menuConfigs.Mesures;
    if (showFCMenu) return menuConfigs.FC;
    if (showPNIMenu) return menuConfigs.PNI;
    if (showLimitesFCMenu) return menuConfigs.LimitesFC;
    return [];
  };
 
  const renderMenu = (title: string, items: string[], onClose: () => void) => (
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
      <div className="bg-gray-300 border-2 border-black w-64 shadow-lg">
        <div className="bg-gray-400 px-4 py-2 border-b border-black">
          <h3 className="text-black font-bold text-sm">{title}</h3>
        </div>
        <div className="flex flex-col">
          {items.map((item, index) => (
            <div 
              key={index}
              className={`px-4 py-2 ${index < items.length - 1 ? 'border-b border-gray-500' : ''} ${
                selectedMenuIndex === index ? 'bg-blue-500' : 'bg-gray-300'
              }`}
            >
              <span className={`text-sm ${selectedMenuIndex === index ? 'text-white' : 'text-black'}`}>
                {item}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="fixed inset-0 bg-black bg-opacity-0 -z-10" onClick={onClose}></div>
    </div>
  );

  useImperativeHandle(ref, () => ({
    triggerMenu: () => {
      if (isAnyMenuOpen() && !showMenu) {
        return;
      }
      setShowMenu(!showMenu);
      setSelectedMenuIndex(0); // Reset selection
    },
    navigateUp: () => {
      if (showLimitesFCMenu) {
        return;
      }
      const menuItems = getCurrentMenuItems();
      if (menuItems.length > 0) {
        setSelectedMenuIndex((prev) => (prev > 0 ? prev - 1 : menuItems.length - 1));
      }
    },
    navigateDown: () => {
      if (showLimitesFCMenu) {
        return;
      }
      const menuItems = getCurrentMenuItems();
      if (menuItems.length > 0) {
        setSelectedMenuIndex((prev) => (prev < menuItems.length - 1 ? prev + 1 : 0));
      }
    },
    isInValueEditMode: () => {
      return showLimitesFCMenu;
    },
    incrementValue: () => {
      if (showLimitesFCMenu && limitesFCValue < 200) {
        setLimitesFCValue(prev => prev + 1);
      }
    },
    decrementValue: () => {
      if (showLimitesFCMenu && limitesFCValue > 30) {
        setLimitesFCValue(prev => prev - 1);
      }
    },
    selectCurrentItem: () => {
      if (showLimitesFCMenu) {
        setShowLimitesFCMenu(false);
        return;
      }
      
      // Configuration des actions pour chaque menu
      const actions = {
        main: [
          () => console.log('Volume sélectionné'), // Volume
          () => console.log('Courbes affichées sélectionné'), // Courbes affichées
          () => { setShowMesuresMenu(true); setShowMenu(false); setSelectedMenuIndex(0); }, // Mesures/Alarmes
          () => console.log('Infos patient sélectionné'), // Infos patient
          () => console.log('Tendances sélectionné') // Tendances
        ],
        Mesures: [
          () => { setShowFCMenu(true); setShowMesuresMenu(false); setSelectedMenuIndex(0); }, // FC/Arythmie
          () => { setShowPNIMenu(true); setShowMesuresMenu(false); setSelectedMenuIndex(0); }, // PNI
          () => console.log('SpO2 sélectionné'), // SpO2
          () => console.log('Pouls sélectionné'), // Pouls
          () => setShowMesuresMenu(false) // Fin
        ],
        FC: [
          () => console.log('Reprise acqu. rythme sélectionné'), // Reprise acqu. rythme
          () => console.log('Alarmes desactivées sélectionné'), // Alarmes desactivées
          () => { setShowLimitesFCMenu(true); setShowFCMenu(false); setSelectedMenuIndex(0); }, // Limites FC
          () => console.log('Limites Tachy. V sélectionné'), // Limites Tachy. V
          () => console.log('Limite fréquence ESV sélectionné'), // Limite fréquence ESV
          () => setShowFCMenu(false) // Fin
        ],
        PNI: [
          () => console.log('Fréquence PNI sélectionné'), // Fréquence PNI
          () => console.log('Alarmes desactivées sélectionné'), // Alarmes desactivées
          () => console.log('Limites PNI sélectionné'), // Limites PNI
          () => setShowPNIMenu(false) // Fin
        ],
        LimitesFC: [
          () => { // ▲
            if (limitesFCValue < 200) {
              setLimitesFCValue(prev => prev + 1);
            }
          },
          () => {}, 
          () => { // ▼
            if (limitesFCValue > 30) {
              setLimitesFCValue(prev => prev - 1);
            }
          },
          () => setShowLimitesFCMenu(false) // Fin
        ]
      };

      const currentActions = showMenu ? actions.main : 
                           showMesuresMenu ? actions.Mesures : 
                           showFCMenu ? actions.FC : 
                           showPNIMenu ? actions.PNI : 
                           showLimitesFCMenu ? actions.LimitesFC : [];
      
      currentActions[selectedMenuIndex]?.();
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
            <div className="w-4 h-3 bg-green-500 rounded-sm flex items-center justify-center -mt-2">
              <div className="w-2 h-1.5 bg-white rounded-xs"></div>
            </div>
            {(rhythmType === 'fibrillationVentriculaire' || rhythmType === 'fibrillationAtriale') && (
              <div className="w-35 h-4 bg-red-500 mb-2">
                <span className="block text-center text-white text-xs mb-3"> Analyse ECG impossible</span>
              </div>
            )}
          </div>
          
        </div>

        {/* Rangée 2 - Paramètres médicaux */}
        <div className="h-1/4 border-b border-gray-600 flex items-center justify-between  text-sm bg-black ">
          {/* FC (Fréquence Cardiaque) */}
          <div className="flex flex-col items-center">
            <div className="flex flex-row items-center gap-x-2">
              <div className="text-gray-400 text-xs">FC</div>
              <div className="text-gray-400 text-xs">bpm</div>
            </div>
            <div className="flex flex-row items-center gap-x-2">
              <div className="text-green-400 text-4xl font-bold w-[65px] text-center">
                {rhythmType === 'fibrillationVentriculaire' || rhythmType === 'fibrillationAtriale'
                  ? fvVitalSigns.heartRate 
                  : rhythmType === 'asystole' ? '0' : heartRate}
              </div>
              <div className="text-green-400 text-xs">120</div>
            </div>
          </div>

          {/* SpO2 */}
          <div className="flex flex-col items-center">
            <div className="flex flex-row items-center gap-x-2">
              <div className="text-blue-400 text-2xl font-bold">SpO2</div>
              <div className="text-blue-400 text-xs">%</div>
            </div>

            {/* SpO2 Value */}
            <div className="flex flex-row items-center gap-x-2">
              <div className="text-blue-400 text-4xl font-bold min-w-[60px]">
                {rhythmType === 'fibrillationVentriculaire' || rhythmType === 'fibrillationAtriale' ? '-?-' : '95'}
              </div>
              <div className="flex flex-col items-center">
                <div className="text-blue-400 text-xs">100</div>
                <div className="text-blue-400 text-xs">90</div>
              </div>
            </div>
          </div>

          {/* Pouls */}
          <div className="flex flex-row items-center gap-x-2">
            <div className="flex flex-col items-center">
              <div className="text-blue-400 text-xs">Pouls</div>
              <div className="text-blue-400 text-4xl font-bold min-w-[60px]">
                {rhythmType === 'fibrillationVentriculaire' || rhythmType === 'fibrillationAtriale' ? '-?-' : rhythmType === 'asystole' ? '0' : heartRate}
              </div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-blue-400 text-xs mb-2">bpm</div>
              <div className="text-blue-400 text-xs">120</div>
              <div className="text-blue-400 text-xs">50</div>
            </div>
          </div>

          {/* PNI */}
          <div className="flex flex-col items-center px-1">
            <div className="flex flex-row items-center gap-x-5">
              <div className="text-white text-xs font-bold">PNI</div>
              <div className="text-white text-xs font-bold">5min</div>
              <div className="text-white text-xs font-bold">10:20 </div>
              <div className="text-white text-xs font-bold">mmHg</div>
            </div>
            <div className="flex flex-row items-center gap-x-1 mt-1">
              <div className="text-white text-4xl min-w-[100px]">
                {rhythmType === 'fibrillationVentriculaire' || rhythmType === 'fibrillationAtriale' ? '-?-' : '110/70'}
              </div>
              <div className=" text-white text-xs min-w-[30px]">
                {rhythmType === 'fibrillationVentriculaire' || rhythmType === 'fibrillationAtriale' ? '' : '(80)'}
              </div>
              <div className="flex flex-col items-center gap-x-1">
                <div className=" text-white text-xs">MOY</div>
                <div className=" text-white text-xs">110</div>
                <div className=" text-white text-xs">50</div>
              </div>
            </div>
          </div>

          {/* CO2 et FR - Deux colonnes principales */}
          <div className="flex flex-row items-center gap-x-4">
            {/* Colonne CO2 */}
            <div className="flex flex-col items-center">
              <div className="flex flex-row items-center gap-x-1">
                <div className="text-white text-xs font-bold">CO2ie</div>
                <div className="text-white text-xs font-bold">mmHg</div>
              </div>
              <div className="flex flex-row items-center">
                <div className="text-yellow-400 text-4xl font-bold min-w-[50px]">
                  {rhythmType === 'fibrillationVentriculaire' || rhythmType === 'fibrillationAtriale' ? '-?-' : '--'}
                </div>
                {/*<div className="flex flex-col items-center ml-2">
                  <div className="text-yellow-400 text-xs">50</div>
                  <div className="text-yellow-400 text-xs">30</div>
                </div>*/}
              </div>
            </div>

            {/* Colonne FR */}
            <div className="flex flex-col items-center">
              <div className="flex flex-row items-center gap-x-1">
                <div className="text-white text-xs font-bold">FR</div>
                <div className="text-white text-xs font-bold">rpm</div>
              </div>
              <div className="flex flex-row items-center">
                <div className="text-yellow-400 text-4xl font-bold min-w-[50px]">
                  {rhythmType === 'fibrillationVentriculaire' || rhythmType === 'fibrillationAtriale' ? '-?-' : '--'}
                </div>
                {/*<div className="flex flex-col items-center ml-2">
                  <div className="text-yellow-400 text-xs">30</div>
                  <div className="text-yellow-400 text-xs">8</div>
                </div>*/}
              </div>
            </div>
          </div>
        </div>

        {/* Row 3 - ECG Display avec rythme dynamique et flèches synchro */}
        <div className="h-1/5 border-b border-gray-600 flex flex-col items-center justify-start text-green-400 text-sm bg-black ">
          <ECGDisplay 
            width={800} 
            height={65} 
            rhythmType={rhythmType} 
            showSynchroArrows={showSynchroArrows}
            heartRate={heartRate}
          />
        </div>

        {/* Row  4*/}
        <div className="h-1/6 border-b border-gray-600 flex items-center justify-between px-4 text-blue-400 text-sm bg-black">
          <div className="h-1/6 border-b border-gray-600 flex items-center justify-center text-green-400 text-sm bg-gray-900">
            <div className="flex items-center gap-2"></div>
          </div>
        </div>

        {/* Row 5 */}
        <div className="h-1/5 border-b border-gray-600 flex flex-col items-center justify-start text-green-400 text-sm bg-black ">
          <PlethDisplay width={800} height={45} />
        </div>

        {/* Row 6 */}
        <div className=" bg-black h-1/12 flex items-center justify-between  text-white text-xs ">
          <div className="flex items-center gap-2">
            <div className="bg-gray-500 px-2 py-0.5 h-full flex flex-col justify-center text-xs ">
              <span>Début PNI</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span> </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-gray-500 px-2 py-0.5 h-full flex flex-col justify-center text-xs">
          <span>Menu</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Menu Principal */}
      {showMenu && renderMenu("Menu principal", menuConfigs.main, () => setShowMenu(false))}

      {/* Menu Mesures/Alarmes */}
      {showMesuresMenu && renderMenu("Mesures/Alarmes", menuConfigs.Mesures, () => setShowMesuresMenu(false))}

      {/* Menu FC/Arythmie */}
      {showFCMenu && renderMenu("FC/Arythmie", menuConfigs.FC, () => setShowFCMenu(false))}

      {/* Menu PNI */}
      {showPNIMenu && renderMenu("PNI", menuConfigs.PNI, () => setShowPNIMenu(false))}

      {/* Menu Limites FC */}
      {showLimitesFCMenu && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
          <div className="bg-gray-300 border-2 border-black w-48 shadow-lg">
            <div className="bg-blue-600 px-4 py-2 border-b border-black">
              <h3 className="text-white font-bold text-sm">Limites FC</h3>
            </div>
            
            <div className="flex flex-col items-center py-4">
              <div className="text-black text-2xl px-2 py-1 rounded mb-2">
                ▲
              </div>
              
              <div className="flex items-center gap-2 mb-2">
                <span className="text-black text-2xl font-bold font-mono min-w-[60px] text-center">
                  {limitesFCValue}
                </span>
                <span className="text-black text-sm">bpm</span>
              </div>
              
              <div className="text-black text-2xl px-2 py-1 rounded mb-4">
                ▼
              </div>
              
              <div className="bg-gray-400 px-2 py-1 border border-gray-600 rounded text-black text-sm font-medium">
                Fin
              </div>
            </div>
          </div>
          
          <div 
            className="fixed inset-0 bg-black bg-opacity-0 -z-10"
            onClick={() => setShowLimitesFCMenu(false)}
          ></div>
        </div>
      )}

    </div>
  );
});

export default MonitorDisplay;