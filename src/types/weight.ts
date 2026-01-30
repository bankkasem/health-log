export interface WeightMetrics {
  timestamp: string;
  bodyFatPercentage: number;
  muscleMass: number;
  visceralFat: number;
  bmr: number;
  bmi: number;
}

export interface WeightFormData {
  bodyFatPercentage: string;
  muscleMass: string;
  visceralFat: string;
  bmr: string;
  bmi: string;
}
