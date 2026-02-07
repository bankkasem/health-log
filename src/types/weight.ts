export interface WeightMetrics {
  id: string;
  timestamp: string;
  bodyFatPercentage: number;
  muscleMass: number;
  visceralFat?: number;
  weight: number;
  bmr: number;
  bmi: number;
}

export interface WeightFormData {
  bodyFatPercentage: string;
  muscleMass: string;
  weight: string;
  visceralFat?: string;
}

export type WeightMetricsInput = Omit<WeightMetrics, "id">;

export interface DatabaseWeightMetric {
  id: string;
  user_id: string;
  timestamp: string;
  body_fat_percentage: number;
  muscle_mass: number;
  visceral_fat?: number;
  weight: number;
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
    ...(dbMetric.visceral_fat !== undefined &&
      dbMetric.visceral_fat !== null && { visceralFat: dbMetric.visceral_fat }),
    weight: dbMetric.weight,
    bmr: dbMetric.bmr,
    bmi: dbMetric.bmi,
  };
}
