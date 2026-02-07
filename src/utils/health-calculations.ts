/**
 * Health calculation utilities using demographic data
 */

export interface UserDemographics {
  gender: "male" | "female" | "other";
  dateOfBirth: string; // ISO date format
  height: number; // in centimeters
  weight?: number; // in kilograms (optional, for BMI calculation)
}

/**
 * Calculate age from date of birth
 */
export function calculateAge(dateOfBirth: string): number {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
}

/**
 * Calculate BMI (Body Mass Index)
 * Formula: weight (kg) / (height (m))^2
 */
export function calculateBMI(weight: number, height: number): number {
  const heightInMeters = height / 100;
  const bmi = weight / (heightInMeters * heightInMeters);
  return Math.round(bmi * 10) / 10; // Round to 1 decimal place
}

/**
 * Get BMI category (WHO standard)
 */
export function getBMICategory(bmi: number): string {
  if (bmi < 18.5) return "น้ำหนักน้อย";
  if (bmi < 25) return "น้ำหนักปกติ";
  if (bmi < 30) return "น้ำหนักเกิน";
  return "อ้วน";
}

/**
 * Calculate BMR (Basal Metabolic Rate) using Mifflin-St Jeor Equation
 * More accurate than Harris-Benedict
 *
 * Men: BMR = (10 × weight in kg) + (6.25 × height in cm) - (5 × age) + 5
 * Women: BMR = (10 × weight in kg) + (6.25 × height in cm) - (5 × age) - 161
 */
export function calculateBMR(
  demographics: UserDemographics,
  weight: number,
): number {
  const age = calculateAge(demographics.dateOfBirth);
  const { height, gender } = demographics;

  let bmr = 10 * weight + 6.25 * height - 5 * age;

  if (gender === "male") {
    bmr += 5;
  } else if (gender === "female") {
    bmr -= 161;
  } else {
    // For "other", use average of male and female formulas
    bmr -= 78;
  }

  return Math.round(bmr);
}

/**
 * Calculate TDEE (Total Daily Energy Expenditure)
 * BMR × Activity Factor
 */
export type ActivityLevel =
  | "sedentary" // Little or no exercise
  | "light" // Exercise 1-3 days/week
  | "moderate" // Exercise 3-5 days/week
  | "active" // Exercise 6-7 days/week
  | "very-active"; // Physical job or training twice per day

const activityMultipliers: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  "very-active": 1.9,
};

export function calculateTDEE(
  bmr: number,
  activityLevel: ActivityLevel,
): number {
  return Math.round(bmr * activityMultipliers[activityLevel]);
}

/**
 * Calculate ideal weight range based on BMI 18.5-24.9
 */
export function calculateIdealWeightRange(height: number): {
  min: number;
  max: number;
} {
  const heightInMeters = height / 100;
  const min = 18.5 * heightInMeters * heightInMeters;
  const max = 24.9 * heightInMeters * heightInMeters;

  return {
    min: Math.round(min * 10) / 10,
    max: Math.round(max * 10) / 10,
  };
}

/**
 * Calculate body fat percentage category
 */
export function getBodyFatCategory(
  bodyFatPercentage: number,
  gender: "male" | "female" | "other",
): string {
  if (gender === "male" || gender === "other") {
    if (bodyFatPercentage < 6) return "ต่ำเกินไป";
    if (bodyFatPercentage < 14) return "นักกีฬา";
    if (bodyFatPercentage < 18) return "ฟิต";
    if (bodyFatPercentage < 25) return "ปกติ";
    return "สูง";
  }

  // Female
  if (bodyFatPercentage < 14) return "ต่ำเกินไป";
  if (bodyFatPercentage < 21) return "นักกีฬา";
  if (bodyFatPercentage < 25) return "ฟิต";
  if (bodyFatPercentage < 32) return "ปกติ";
  return "สูง";
}

/**
 * Estimate weight from muscle mass and body fat percentage
 * Formula: weight = muscle_mass / (1 - body_fat_percentage/100)
 */
export function estimateWeight(
  muscleMass: number,
  bodyFatPercentage: number,
): number {
  const weight = muscleMass / (1 - bodyFatPercentage / 100);
  return Math.round(weight * 10) / 10;
}

/**
 * Validate if calculated values are reasonable
 */
export function validateHealthMetrics(metrics: {
  bmi?: number;
  bmr?: number;
  bodyFatPercentage?: number;
  visceralFat?: number;
}): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (metrics.bmi !== undefined) {
    if (metrics.bmi < 10 || metrics.bmi > 50) {
      errors.push("BMI อยู่นอกช่วงที่เป็นไปได้");
    }
  }

  if (metrics.bmr !== undefined) {
    if (metrics.bmr < 800 || metrics.bmr > 3000) {
      errors.push("BMR อยู่นอกช่วงที่เป็นไปได้");
    }
  }

  if (metrics.bodyFatPercentage !== undefined) {
    if (metrics.bodyFatPercentage < 3 || metrics.bodyFatPercentage > 60) {
      errors.push("เปอร์เซ็นต์ไขมันอยู่นอกช่วงที่เป็นไปได้");
    }
  }

  if (metrics.visceralFat !== undefined) {
    if (metrics.visceralFat < 1 || metrics.visceralFat > 60) {
      errors.push("ไขมันในช่องท้องอยู่นอกช่วงที่เป็นไปได้");
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
