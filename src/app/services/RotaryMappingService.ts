export interface MappingPoint {
  angle: number;
  frequency: number;
}

export class RotaryMappingService {
  private static readonly MAPPING_POINTS: MappingPoint[] = [
    { angle: -75, frequency: 5 },   // "1-10" -> on prend 5 comme moyenne
    { angle: -56, frequency: 15 },
    { angle: -37, frequency: 20 },
    { angle: -18, frequency: 30 },
    { angle: 1, frequency: 50 },
    { angle: 22, frequency: 70 },
    { angle: 45, frequency: 100 },
    { angle: 66, frequency: 120 },
    { angle: 92, frequency: 150 },
    { angle: 114, frequency: 170 },
    { angle: 135, frequency: 200 },
  ];

  /**
   * Mappe la valeur du rotary (0-360°) vers la fréquence (1-200 BPM)
   */
  static mapRotaryToFrequency(rotaryValue: number): number {
    // Convertir la valeur rotary (0-360) en angle relatif (-90 à +270)
    const angle = rotaryValue - 90;

    // Si l'angle est avant le premier point, retourner la fréquence minimale
    if (angle <= this.MAPPING_POINTS[0].angle) {
      return this.MAPPING_POINTS[0].frequency;
    }

    // Si l'angle est après le dernier point, retourner la fréquence maximale
    if (angle >= this.MAPPING_POINTS[this.MAPPING_POINTS.length - 1].angle) {
      return this.MAPPING_POINTS[this.MAPPING_POINTS.length - 1].frequency;
    }

    // Interpolation linéaire entre les points
    for (let i = 0; i < this.MAPPING_POINTS.length - 1; i++) {
      const point1 = this.MAPPING_POINTS[i];
      const point2 = this.MAPPING_POINTS[i + 1];

      if (angle >= point1.angle && angle <= point2.angle) {
        const ratio = (angle - point1.angle) / (point2.angle - point1.angle);
        const frequency = point1.frequency + ratio * (point2.frequency - point1.frequency);
        return Math.round(frequency);
      }
    }

    return 60; // Valeur par défaut
  }

  /**
   * Obtient la liste des points de mapping (pour debug ou affichage)
   */
  static getMappingPoints(): MappingPoint[] {
    return [...this.MAPPING_POINTS];
  }

  /**
   * Valide si une fréquence est dans la plage acceptable
   */
  static isValidFrequency(frequency: number): boolean {
    const minFreq = this.MAPPING_POINTS[0].frequency;
    const maxFreq = this.MAPPING_POINTS[this.MAPPING_POINTS.length - 1].frequency;
    return frequency >= minFreq && frequency <= maxFreq;
  }
} 