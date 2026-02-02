export interface WeightMetrics {
  id: string;
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

export interface DatabaseWeightMetric {
  id: string;
  user_id: string;
  timestamp: string;
  body_fat_percentage: number;
  muscle_mass: number;
  visceral_fat: number;
  bmr: number;
  bmi: number;
  created_at: string;
  updated_at: string;
}

export function toWeightMetrics(dbMetric: DatabaseWeightMetric): WeightMetrics {
  return {
    id: dbMetric.id,
    timestamp: dbMetric.timestamp,
    bodyFatPercentage: dbMetric.body_fat_percentage,
    muscleMass: dbMetric.muscle_mass,
    visceralFat: dbMetric.visceral_fat,
    bmr: dbMetric.bmr,
    bmi: dbMetric.bmi,
  };
}
