import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Settings, Info, Power, FileText, Monitor, Zap } from 'lucide-react';
import { NotificationService } from '../services/NotificationService';

interface DropdownMenuProps {
  onMenuItemSelect?: (action: string) => void;
  onScenarioSelect?: (scenarioId: string) => void;
  onModeSelect?: (mode: string) => void;
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({ 
  onMenuItemSelect, 
  onScenarioSelect, 
  onModeSelect 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fermer le menu quand on clique à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleMenuItemClick = async (action: string) => {
    // Gestion des actions 
    switch (action) {
      case 'scenario_1':
      case 'scenario_2':
      case 'scenario_3':
      case 'scenario_4':
        onScenarioSelect?.(action);
        break;
      
      case 'training_mode':
      case 'exam_mode':
      case 'free_mode':
        onModeSelect?.(action);
        break;
      
      case 'settings':
        await NotificationService.showSuccess('Paramètres ouverts');
        break;
      
      case 'about':
        await NotificationService.showSuccess('Simulateur de Défibrillateur v1.0\nDéveloppé pour la formation médicale');
        break;
      
      case 'reset':
        const confirmed = confirm('Redémarrer le simulateur ?');
        if (confirmed) {
          window.location.reload();
        }
        break;
      
      default:
        onMenuItemSelect?.(action);
        break;
    }
    
    setIsOpen(false);
  };

  const menuItems = [
    {
      id: 'scenarios',
      label: 'Scénarios',
      icon: <FileText className="w-4 h-4" />,
      submenu: [
        { id: 'scenario_1', label: 'Scénario 1 - Fibrillation ventriculaire' },
        { id: 'scenario_2', label: 'Scénario 2 - Tachycardie ventriculaire' },
        { id: 'scenario_3', label: 'Scénario 3 - Asystolie' },
        { id: 'scenario_4', label: 'Scénario 4 - Rythme sinusal' },
      ]
    },

    { id: 'separator_1', label: 'separator' },
    {
      id: 'settings',
      label: 'Paramètres',
      icon: <Settings className="w-4 h-4" />,
    },
    {
      id: 'about',
      label: 'À propos',
      icon: <Info className="w-4 h-4" />,
    },
    { id: 'separator_2', label: 'separator' },
    {
      id: 'reset',
      label: 'Redémarrer',
      icon: <Power className="w-4 h-4" />,
      danger: true
    },
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bouton du menu */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg border border-gray-600 transition-colors duration-200 shadow-lg"
      >
        <span className="text-sm font-medium">Menu</span>
        <ChevronDown 
          className={`w-4 h-4 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`} 
        />
      </button>

      {/* Menu déroulant */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-gray-800 border border-gray-600 rounded-lg shadow-2xl z-50 overflow-hidden">
          <div className="py-2">
            {menuItems.map((item) => {
              if (item.label === 'separator') {
                return (
                  <div 
                    key={item.id} 
                    className="border-t border-gray-600 my-2"
                  />
                );
              }

              if (item.submenu) {
                return (
                  <div key={item.id} className="group relative">
                    <div className="flex items-center gap-3 px-4 py-2 text-white hover:bg-gray-700 cursor-pointer transition-colors duration-200">
                      {item.icon}
                      <span className="text-sm flex-1">{item.label}</span>
                      <ChevronDown className="w-3 h-3 -rotate-90" />
                    </div>
                    
                    {/* Sous-menu */}
                    <div className="absolute left-full top-0 w-72 bg-gray-800 border border-gray-600 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 ml-1">
                      <div className="py-2">
                        {item.submenu.map((subItem) => (
                          <button
                            key={subItem.id}
                            onClick={() => handleMenuItemClick(subItem.id)}
                            className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700 transition-colors duration-200"
                          >
                            {subItem.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <button
                  key={item.id}
                  onClick={() => handleMenuItemClick(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors duration-200 ${
                    item.danger
                      ? 'text-red-400 hover:text-red-300 hover:bg-red-900/20'
                      : 'text-white hover:bg-gray-700'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default DropdownMenu;