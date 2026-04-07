
/**
 * Calculates Harris-Benedict BMR (TMB in Portuguese)
 */
export function calculateBMR(weight: number, height: number, age: number, sex: 'M' | 'F'): number {
  if (sex === 'M') {
    return 66.5 + (13.75 * weight) + (5.003 * height) - (6.75 * age);
  } else {
    return 655.1 + (9.563 * weight) + (1.850 * height) - (4.676 * age);
  }
}

/**
 * Maps activity level string to numeric factor
 */
export function getActivityFactor(level: string): number {
  const factors: Record<string, number> = {
    'sedentary': 1.2,
    'lightly_active': 1.375,
    'moderately_active': 1.55,
    'very_active': 1.725,
    'extra_active': 1.9,
  };
  return factors[level] || 1.2;
}

/**
 * Calculates macro distribution based on total energy (GET)
 */
export function calculateMacros(get: number) {
  return {
    protein: {
      min_pct: 10,
      max_pct: 35,
      min_grams: Math.round((get * 0.10) / 4),
      max_grams: Math.round((get * 0.35) / 4),
    },
    carbohydrate: {
      min_pct: 45,
      max_pct: 65,
      min_grams: Math.round((get * 0.45) / 4),
      max_grams: Math.round((get * 0.65) / 4),
    },
    lipid: {
      min_pct: 20,
      max_pct: 35,
      min_grams: Math.round((get * 0.20) / 9),
      max_grams: Math.round((get * 0.35) / 9),
    }
  };
}

/**
 * Calculates Body Mass Index (IMC)
 */
export function calculateIMC(weight: number, heightCm: number): number {
  if (!weight || !heightCm) return 0;
  return weight / ((heightCm / 100) ** 2);
}

/**
 * Gets classification for IMC
 */
export function getIMCClassification(imc: number) {
  if (imc <= 0) return { label: "N/A", color: "text-gray-400" };
  if (imc < 18.5) return { label: "Abaixo do peso", color: "text-blue-600" };
  if (imc < 25) return { label: "Peso normal", color: "text-green-600" };
  if (imc < 30) return { label: "Sobrepeso", color: "text-yellow-600" };
  if (imc < 35) return { label: "Obesidade Grau I", color: "text-orange-600" };
  if (imc < 40) return { label: "Obesidade Grau II", color: "text-red-600" };
  return { label: "Obesidade Grau III", color: "text-red-800 font-bold" };
}

/**
 * Calculates Waist-to-Hip Ratio (RCQ)
 */
export function calculateRCQ(waist: number, hip: number): number {
  if (!waist || !hip) return 0;
  return waist / hip;
}

/**
 * Gets classification for RCQ
 */
export function getRCQClassification(rcq: number, sex: string) {
  if (rcq <= 0) return { label: "N/A", color: "text-gray-400" };
  if (sex === 'masculino' || sex === 'M') {
    if (rcq < 0.90) return { label: "Baixo risco", color: "text-green-600" };
    if (rcq < 1.00) return { label: "Risco moderado", color: "text-yellow-600" };
    return { label: "Alto risco", color: "text-red-600" };
  } else {
    // Feminino
    if (rcq < 0.80) return { label: "Baixo risco", color: "text-green-600" };
    if (rcq < 0.85) return { label: "Risco moderado", color: "text-yellow-600" };
    return { label: "Alto risco", color: "text-red-600" };
  }
}
