interface AudioSettings {
  enabled: boolean;
  volume: number;
  language: string;
}

class AudioService {
  private synthesis: SpeechSynthesis;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private settings: AudioSettings = {
    enabled: true,
    volume: 0.8,
    language: 'fr-FR'
  };
  private repetitionTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.synthesis = window.speechSynthesis;
  }

  // Configuration des paramètres audio
  updateSettings(settings: Partial<AudioSettings>) {
    this.settings = { ...this.settings, ...settings };
  }

  playMessage(text: string, options?: { priority?: boolean; repeat?: boolean; repeatInterval?: number }): void {
    if (!this.settings.enabled) return;

    // Si priorité, arrêter le message actuel
    if (options?.priority && this.currentUtterance) {
      this.synthesis.cancel();
      this.clearRepetition();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = this.settings.language;
    utterance.volume = this.settings.volume;
    utterance.rate = 0.9; 

    utterance.onend = () => {
      this.currentUtterance = null;
      
      if (options?.repeat && options?.repeatInterval) {
        this.repetitionTimer = setTimeout(() => {
          this.playMessage(text, options);
        }, options.repeatInterval);
      }
    };

    this.currentUtterance = utterance;
    this.synthesis.speak(utterance);
  }

  // Messages spécifiques du DAE
  playDAEModeAdulte(): void {
    this.playMessage("Mode adulte", { priority: true });
  }

  playDAEInstructions(): void {
    const message = "Insérez fermement le connecteur et appliquez les électrodes";
    this.playMessage(message, { priority: true });
  }

  playDAEElectrodeReminder(): void {
    const message = "Appliquez les électrodes";
    this.playMessage(message, { 
      repeat: true, 
      repeatInterval: 10000 // 10 secondes
    });
  }

  playDAEAnalyse(): void {
    this.playMessage("Analyse en cours", { priority: true });
  }

  playDAEChocRecommande(): void {
    this.playMessage("Choc recommandé", { priority: true });
  }

  playDAEEcartezVousduPatient(): void {
    this.playMessage("Écartez-vous du patient", { priority: true });
  }

  playDAEEcartezVous(): void {
    this.playMessage("Écartez-vous", { priority: true });
  }

  playPasDeChocIndique(): void {
    this.playMessage("Pas de choc indiqué", { priority: true });
  }
  playCommencerRCP(): void {
    this.playMessage("Commencer la réanimation cardio pulmonaire", { priority: true });
  }

  // Arrêter tous les messages et répétitions
  stopAll(): void {
    this.synthesis.cancel();
    this.clearRepetition();
    this.currentUtterance = null;
  }

  // Arrêter uniquement les répétitions
  clearRepetition(): void {
    if (this.repetitionTimer) {
      clearTimeout(this.repetitionTimer);
      this.repetitionTimer = null;
    }
  }

  // Vérifier si un message est en cours
  isSpeaking(): boolean {
    return this.synthesis.speaking || this.currentUtterance !== null;
  }
}

export default AudioService;