import { CurrentWeather, DailyWeather } from '../types/weather';

export interface ActivityScore {
  score: number; // 0-10 (0: Bad, 10: Perfect)
  label: string;
  icon: string;
  description: string;
  color: string;
}

export interface LifestyleData {
  running: ActivityScore;
  driving: ActivityScore;
  outdoors: ActivityScore;
  uv: ActivityScore;
  laundry: ActivityScore;
}

// Helper to map score to color
const getScoreColor = (score: number): string => {
  if (score >= 8) return '#4CAF50'; // Green
  if (score >= 5) return '#FF9800'; // Orange
  return '#F44336'; // Red
};

export const calculateLifestyleScores = (
  current: CurrentWeather,
  daily: DailyWeather
): LifestyleData => {
  const { temperature, windSpeed, precipitation, humidity, uvIndex, weatherCode, visibility } = current;

  // 1. Running / Outdoor Exercise
  // Ideal: 10-20°C, low wind, no rain
  let runningScore = 10;
  if (temperature < 5 || temperature > 25) runningScore -= 2;
  if (temperature < 0 || temperature > 30) runningScore -= 3;
  if (precipitation > 0) runningScore -= 4;
  if (windSpeed > 20) runningScore -= 2;
  if (humidity > 80) runningScore -= 1;
  runningScore = Math.max(0, Math.min(10, runningScore));

  // 2. Driving Conditions
  // Ideal: Clear visibility, no rain/snow/ice
  let drivingScore = 10;
  if (visibility < 5) drivingScore -= 3; // < 5km
  if (precipitation > 0) drivingScore -= 2;
  if (precipitation > 2) drivingScore -= 3; // Heavy rain
  if (weatherCode >= 71 && weatherCode <= 77) drivingScore -= 5; // Snow
  if (temperature < 0 && precipitation > 0) drivingScore -= 5; // Ice risk
  if (windSpeed > 40) drivingScore -= 3;
  drivingScore = Math.max(0, Math.min(10, drivingScore));

  // 3. Outdoor Activities (Picnic, Park)
  // Ideal: 20-25°C, sunny, low wind
  let outdoorScore = 10;
  if (precipitation > 0) outdoorScore = 0; // Rain ruins it
  else {
    if (temperature < 15) outdoorScore -= (15 - temperature) / 2;
    if (temperature > 30) outdoorScore -= (temperature - 30) / 2;
    if (windSpeed > 15) outdoorScore -= 2;
    if (uvIndex > 8) outdoorScore -= 1; // Too much sun
  }
  outdoorScore = Math.max(0, Math.min(10, Math.round(outdoorScore)));

  // 4. UV / Sun Protection
  // High score = Needs protection (inverted logic slightly for display?)
  // Let's make Score represent "Safety/Goodness". 
  // Actually for UV, "High Score" usually means "High Risk". 
  // Let's standardize: Score 10 = "Safe/Good/Ideal", Score 0 = "Dangerous/Bad".
  // So for UV: 0 Index -> Score 10 (Safe). 11 Index -> Score 0 (Dangerous).
  let uvSafetyScore = Math.max(0, 10 - uvIndex);

  // 5. Laundry (Drying outside)
  // Ideal: Warm, dry, breezy
  let laundryScore = 10;
  if (precipitation > 0) laundryScore = 0;
  else {
    if (humidity > 70) laundryScore -= 3;
    if (humidity > 90) laundryScore -= 5;
    if (temperature < 10) laundryScore -= 2;
    if (temperature < 0) laundryScore -= 5; // Freezing
    // Wind helps drying
    if (windSpeed > 10) laundryScore += 1;
  }
  laundryScore = Math.max(0, Math.min(10, Math.round(laundryScore)));

  return {
    running: {
      score: runningScore,
      label: 'Koşu',
      icon: 'run',
      description: getRunningDesc(runningScore),
      color: getScoreColor(runningScore)
    },
    driving: {
      score: drivingScore,
      label: 'Sürüş',
      icon: 'car',
      description: getDrivingDesc(drivingScore),
      color: getScoreColor(drivingScore)
    },
    outdoors: {
      score: outdoorScore,
      label: 'Dışarı',
      icon: 'tree',
      description: getOutdoorDesc(outdoorScore),
      color: getScoreColor(outdoorScore)
    },
    uv: {
      score: uvSafetyScore,
      label: 'UV',
      icon: 'white-balance-sunny',
      description: getUVDesc(uvIndex),
      color: getScoreColor(uvSafetyScore)
    },
    laundry: {
      score: laundryScore,
      label: 'Çamaşır',
      icon: 'tshirt-crew', // MaterialCommunityIcons name
      description: getLaundryDesc(laundryScore),
      color: getScoreColor(laundryScore)
    }
  };
};

function getRunningDesc(score: number): string {
  if (score >= 8) return 'Harika zaman!';
  if (score >= 5) return 'Fena değil.';
  return 'Spor salonu daha iyi.';
}

function getDrivingDesc(score: number): string {
  if (score >= 8) return 'Yollar güvenli.';
  if (score >= 5) return 'Dikkatli sür.';
  return 'Zorlu koşullar.';
}

function getOutdoorDesc(score: number): string {
  if (score >= 8) return 'Tadını çıkarın!';
  if (score >= 5) return 'Hazırlıklı çıkın.';
  return 'Evde kalmalı.';
}

function getUVDesc(uvIndex: number): string {
  if (uvIndex <= 2) return 'Düşük risk.';
  if (uvIndex <= 5) return 'Korumasız çıkma.';
  if (uvIndex <= 7) return 'Şapka tak!';
  return 'Güneşten kaçın!';
}

function getLaundryDesc(score: number): string {
  if (score >= 8) return 'Hemen kurur.';
  if (score >= 5) return 'Kuruması sürer.';
  return 'İçeride kurut.';
}
