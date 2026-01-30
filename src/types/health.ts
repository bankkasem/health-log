export interface HealthMetrics {
  timestamp: string;
  bodyFatPercentage: number;
  muscleMass: number;
  visceralFat: number;
  bmr: number;
  bmi: number;
}

export interface HealthFormData {
  bodyFatPercentage: string;
  muscleMass: string;
  visceralFat: string;
  bmr: string;
  bmi: string;
}
