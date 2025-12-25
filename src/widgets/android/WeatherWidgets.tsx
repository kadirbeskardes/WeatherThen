/**
 * Android Widget Components
 * react-native-android-widget için widget bileşenleri
 */

import React from 'react';
import {
  FlexWidget,
  TextWidget,
} from 'react-native-android-widget';
import { CompleteWidgetData } from '../../services/widgetService';
import { getWidgetTheme, WIDGET_THEMES, WidgetTheme } from '../types';

// Sabit metinler
const LOADING_TEXT = 'Yükleniyor...';

// ColorProp tipi - hex veya rgba formatı
type ColorProp = `#${string}` | `rgba(${number}, ${number}, ${number}, ${number})`;

// Tema renklerini Android widget formatına dönüştür
// rgba formatı desteklenmediği için hex'e dönüştür
const toHex = (color: string): ColorProp => {
  // Zaten hex ise direkt döndür
  if (color.startsWith('#')) {
    return color as ColorProp;
  }
  
  // rgba formatını hex'e dönüştür
  if (color.startsWith('rgba')) {
    const match = color.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/);
    if (match) {
      const r = parseInt(match[1]);
      const g = parseInt(match[2]);
      const b = parseInt(match[3]);
      const a = parseFloat(match[4]);
      
      // Alpha ile birlikte hex'e çevir (ARGB formatı)
      const alpha = Math.round(a * 255).toString(16).padStart(2, '0');
      const red = r.toString(16).padStart(2, '0');
      const green = g.toString(16).padStart(2, '0');
      const blue = b.toString(16).padStart(2, '0');
      
      return `#${alpha}${red}${green}${blue}` as ColorProp;
    }
  }
  
  // Varsayılan beyaz
  return '#ffffff' as ColorProp;
};

// Android için tema adaptörü
const getAndroidTheme = (weatherCode: number, isNight: boolean) => {
  const theme = getWidgetTheme(weatherCode, isNight);
  return {
    background: toHex(theme.background),
    textPrimary: toHex(theme.textPrimary),
    textSecondary: toHex(theme.textSecondary),
    accent: toHex(theme.accent),
  };
};

// Gece teması için adaptör
const getAndroidNightTheme = () => {
  const theme = WIDGET_THEMES.night;
  return {
    background: toHex(theme.background),
    textPrimary: toHex(theme.textPrimary),
    textSecondary: toHex(theme.textSecondary),
    accent: toHex(theme.accent),
  };
};

// Hava durumu emoji'leri
const getWeatherEmoji = (code: number, isNight: boolean = false): string => {
  if (isNight && code <= 2) return '🌙';
  const emojis: { [key: number]: string } = {
    0: '☀️', 1: '🌤️', 2: '⛅', 3: '☁️',
    45: '🌫️', 48: '🌫️',
    51: '🌧️', 53: '🌧️', 55: '🌧️',
    61: '🌧️', 63: '🌧️', 65: '🌧️',
    66: '🌨️', 67: '🌨️',
    71: '❄️', 73: '❄️', 75: '❄️', 77: '❄️',
    80: '🌦️', 81: '🌦️', 82: '⛈️',
    85: '🌨️', 86: '🌨️',
    95: '⛈️', 96: '⛈️', 99: '⛈️',
  };
  return emojis[code] || '☀️';
};

// Gece kontrolü - opsiyonel saat parametresi kabul eder
const isNightTime = (hour?: number): boolean => {
  const currentHour = hour ?? new Date().getHours();
  return currentHour >= 20 || currentHour < 6;
};

interface WeatherWidgetProps {
  data: CompleteWidgetData | null;
}

/**
 * Sıcaklık Widget'ı - Small
 */
export function TemperatureWidgetSmall({ data }: WeatherWidgetProps) {
  if (!data?.current) {
    return (
      <FlexWidget
        style={{
          height: 'match_parent',
          width: 'match_parent',
          backgroundColor: '#4A90E2',
          borderRadius: 16,
          justifyContent: 'center',
          alignItems: 'center',
          padding: 8,
        }}
      >
        <TextWidget text={LOADING_TEXT} style={{ fontSize: 12, color: '#ffffff' }} />
      </FlexWidget>
    );
  }

  const isNight = isNightTime();
  const theme = getAndroidTheme(data.current.conditionCode, isNight);
  const emoji = getWeatherEmoji(data.current.conditionCode, isNight);

  return (
    <FlexWidget
      style={{
        height: 'match_parent',
        width: 'match_parent',
        backgroundColor: theme.background,
        borderRadius: 16,
        padding: 12,
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
      clickAction="OPEN_APP"
    >
      {/* Konum */}
      <TextWidget
        text={`📍 ${data.current.location}`}
        style={{
          fontSize: 10,
          color: theme.textSecondary,
        }}
        maxLines={1}
      />
      
      {/* Ana sıcaklık */}
      <FlexWidget
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <TextWidget
          text={emoji}
          style={{ fontSize: 28 }}
        />
        <TextWidget
          text={`${Math.round(data.current.temperature)}°`}
          style={{
            fontSize: 36,
            fontWeight: '200',
            color: theme.textPrimary,
            marginLeft: 4,
          }}
        />
      </FlexWidget>
      
      {/* Durum */}
      <TextWidget
        text={data.current.condition}
        style={{
          fontSize: 11,
          color: theme.textPrimary,
          textAlign: 'center',
        }}
        maxLines={1}
      />
    </FlexWidget>
  );
}

/**
 * Sıcaklık Widget'ı - Medium
 */
export function TemperatureWidgetMedium({ data }: WeatherWidgetProps) {
  if (!data?.current) {
    return (
      <FlexWidget
        style={{
          height: 'match_parent',
          width: 'match_parent',
          backgroundColor: '#4A90E2',
          borderRadius: 16,
          justifyContent: 'center',
          alignItems: 'center',
          padding: 8,
        }}
      >
        <TextWidget text={LOADING_TEXT} style={{ fontSize: 14, color: '#ffffff' }} />
      </FlexWidget>
    );
  }

  const isNight = isNightTime();
  const theme = getAndroidTheme(data.current.conditionCode, isNight);
  const emoji = getWeatherEmoji(data.current.conditionCode, isNight);

  return (
    <FlexWidget
      style={{
        height: 'match_parent',
        width: 'match_parent',
        backgroundColor: theme.background,
        borderRadius: 16,
        padding: 14,
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
      clickAction="OPEN_APP"
    >
      {/* Üst kısım - Konum */}
      <TextWidget
        text={`📍 ${data.current.location}`}
        style={{
          fontSize: 11,
          color: theme.textSecondary,
        }}
        maxLines={1}
      />
      
      {/* Ana içerik */}
      <FlexWidget
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Sol - Sıcaklık */}
        <FlexWidget
          style={{
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <TextWidget
            text={emoji}
            style={{ fontSize: 36 }}
          />
          <FlexWidget style={{ marginLeft: 8 }}>
            <TextWidget
              text={`${Math.round(data.current.temperature)}°`}
              style={{
                fontSize: 42,
                fontWeight: '200',
                color: theme.textPrimary,
              }}
            />
            <TextWidget
              text={`Hissedilen: ${Math.round(data.current.feelsLike)}°`}
              style={{
                fontSize: 11,
                color: theme.textSecondary,
              }}
            />
          </FlexWidget>
        </FlexWidget>
        
        {/* Sağ - Ek bilgiler */}
        <FlexWidget
          style={{
            alignItems: 'flex-end',
          }}
        >
          <TextWidget
            text={data.current.condition}
            style={{
              fontSize: 12,
              fontWeight: '500',
              color: theme.textPrimary,
            }}
          />
          <TextWidget
            text={`💧 ${data.current.humidity}%  💨 ${Math.round(data.current.windSpeed)} km/h`}
            style={{
              fontSize: 10,
              color: theme.textSecondary,
              marginTop: 4,
            }}
          />
        </FlexWidget>
      </FlexWidget>
    </FlexWidget>
  );
}

/**
 * Sıcaklık Widget'ı - Large
 */
export function TemperatureWidgetLarge({ data }: WeatherWidgetProps) {
  if (!data?.current || !data?.hourly) {
    return (
      <FlexWidget
        style={{
          height: 'match_parent',
          width: 'match_parent',
          backgroundColor: '#4A90E2',
          borderRadius: 16,
          justifyContent: 'center',
          alignItems: 'center',
          padding: 8,
        }}
      >
        <TextWidget text={LOADING_TEXT} style={{ fontSize: 14, color: '#ffffff' }} />
      </FlexWidget>
    );
  }

  const isNight = isNightTime();
  const theme = getAndroidTheme(data.current.conditionCode, isNight);
  const emoji = getWeatherEmoji(data.current.conditionCode, isNight);
  
  // Sonraki 4 saatlik veri
  const hourlyData = data.hourly.slice(0, 4);

  return (
    <FlexWidget
      style={{
        height: 'match_parent',
        width: 'match_parent',
        backgroundColor: theme.background,
        borderRadius: 16,
        padding: 14,
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
      clickAction="OPEN_APP"
    >
      {/* Üst kısım - Konum */}
      <TextWidget
        text={`📍 ${data.current.location}`}
        style={{
          fontSize: 11,
          color: theme.textSecondary,
        }}
        maxLines={1}
      />
      
      {/* Ana sıcaklık */}
      <FlexWidget
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <TextWidget
          text={emoji}
          style={{ fontSize: 44 }}
        />
        <FlexWidget style={{ marginLeft: 12 }}>
          <TextWidget
            text={`${Math.round(data.current.temperature)}°`}
            style={{
              fontSize: 52,
              fontWeight: '200',
              color: theme.textPrimary,
            }}
          />
          <TextWidget
            text={`Hissedilen: ${Math.round(data.current.feelsLike)}°`}
            style={{
              fontSize: 12,
              color: theme.textSecondary,
            }}
          />
        </FlexWidget>
      </FlexWidget>
      
      {/* Durum ve detaylar */}
      <FlexWidget style={{ alignItems: 'center' }}>
        <TextWidget
          text={data.current.condition}
          style={{
            fontSize: 14,
            fontWeight: '500',
            color: theme.textPrimary,
          }}
        />
        <TextWidget
          text={`💧 ${data.current.humidity}%   💨 ${Math.round(data.current.windSpeed)} km/h   ☀️ UV ${data.current.uvIndex}`}
          style={{
            fontSize: 11,
            color: theme.textSecondary,
            marginTop: 4,
          }}
        />
      </FlexWidget>
      
      {/* Saatlik tahmin */}
      <FlexWidget
        style={{
          flexDirection: 'row',
          justifyContent: 'space-around',
          paddingTop: 12,
        }}
      >
        {hourlyData.map((hour, index) => (
          <FlexWidget key={index} style={{ alignItems: 'center' }}>
            <TextWidget
              text={hour.hour}
              style={{ fontSize: 10, color: theme.textSecondary }}
            />
            <TextWidget
              text={getWeatherEmoji(hour.conditionCode, isNightTime(parseInt(hour.hour)))}
              style={{ fontSize: 16, marginTop: 4, marginBottom: 4 }}
            />
            <TextWidget
              text={`${Math.round(hour.temperature)}°`}
              style={{ fontSize: 12, color: theme.textPrimary, fontWeight: '500' }}
            />
          </FlexWidget>
        ))}
      </FlexWidget>
    </FlexWidget>
  );
}

/**
 * Günlük Özet Widget'ı - Small
 */
export function DailySummaryWidgetSmall({ data }: WeatherWidgetProps) {
  if (!data?.current || !data?.daily?.[0]) {
    return (
      <FlexWidget
        style={{
          height: 'match_parent',
          width: 'match_parent',
          backgroundColor: '#4A90E2',
          borderRadius: 16,
          justifyContent: 'center',
          alignItems: 'center',
          padding: 8,
        }}
      >
        <TextWidget text={LOADING_TEXT} style={{ fontSize: 12, color: '#ffffff' }} />
      </FlexWidget>
    );
  }

  const isNight = isNightTime();
  const theme = getAndroidTheme(data.current.conditionCode, isNight);
  const emoji = getWeatherEmoji(data.current.conditionCode, isNight);
  const today = data.daily[0];

  return (
    <FlexWidget
      style={{
        height: 'match_parent',
        width: 'match_parent',
        backgroundColor: theme.background,
        borderRadius: 16,
        padding: 12,
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
      clickAction="OPEN_APP"
    >
      <TextWidget
        text="Bugün"
        style={{
          fontSize: 12,
          fontWeight: '600',
          color: theme.textPrimary,
        }}
      />
      
      <FlexWidget style={{ alignItems: 'center' }}>
        <TextWidget text={emoji} style={{ fontSize: 32 }} />
        <TextWidget
          text={data.current.condition}
          style={{
            fontSize: 11,
            color: theme.textPrimary,
            marginTop: 4,
          }}
          maxLines={1}
        />
      </FlexWidget>
      
      <TextWidget
        text={`↑ ${Math.round(today.tempMax)}° / ↓ ${Math.round(today.tempMin)}°`}
        style={{
          fontSize: 11,
          color: theme.textSecondary,
          textAlign: 'center',
        }}
      />
    </FlexWidget>
  );
}

/**
 * Günlük Özet Widget'ı - Medium
 */
export function DailySummaryWidgetMedium({ data }: WeatherWidgetProps) {
  if (!data?.current || !data?.daily?.[0]) {
    return (
      <FlexWidget
        style={{
          height: 'match_parent',
          width: 'match_parent',
          backgroundColor: '#4A90E2',
          borderRadius: 16,
          justifyContent: 'center',
          alignItems: 'center',
          padding: 8,
        }}
      >
        <TextWidget text={LOADING_TEXT} style={{ fontSize: 14, color: '#ffffff' }} />
      </FlexWidget>
    );
  }

  const isNight = isNightTime();
  const theme = getAndroidTheme(data.current.conditionCode, isNight);
  const emoji = getWeatherEmoji(data.current.conditionCode, isNight);
  const today = data.daily[0];

  return (
    <FlexWidget
      style={{
        height: 'match_parent',
        width: 'match_parent',
        backgroundColor: theme.background,
        borderRadius: 16,
        padding: 14,
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
      clickAction="OPEN_APP"
    >
      {/* Başlık */}
      <FlexWidget
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <TextWidget
          text="Bugün"
          style={{
            fontSize: 14,
            fontWeight: '600',
            color: theme.textPrimary,
          }}
        />
        <TextWidget
          text={data.current.location}
          style={{
            fontSize: 11,
            color: theme.textSecondary,
          }}
          maxLines={1}
        />
      </FlexWidget>
      
      {/* Ana bilgi */}
      <FlexWidget
        style={{
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        <TextWidget text={emoji} style={{ fontSize: 40, marginRight: 12 }} />
        <FlexWidget>
          <TextWidget
            text={data.current.condition}
            style={{
              fontSize: 16,
              fontWeight: '500',
              color: theme.textPrimary,
            }}
          />
          <TextWidget
            text={`↑ ${Math.round(today.tempMax)}° / ↓ ${Math.round(today.tempMin)}°`}
            style={{
              fontSize: 12,
              color: theme.textSecondary,
              marginTop: 2,
            }}
          />
        </FlexWidget>
      </FlexWidget>
      
      {/* Detaylar */}
      <FlexWidget
        style={{
          flexDirection: 'row',
          justifyContent: 'space-around',
        }}
      >
        <TextWidget
          text={`🌡️ ${Math.round(data.current.feelsLike)}°`}
          style={{ fontSize: 10, color: theme.textSecondary }}
        />
        <TextWidget
          text={`🌧️ %${data.current.precipitationProbability}`}
          style={{ fontSize: 10, color: theme.textSecondary }}
        />
        <TextWidget
          text={`💨 ${Math.round(data.current.windSpeed)} km/h`}
          style={{ fontSize: 10, color: theme.textSecondary }}
        />
      </FlexWidget>
    </FlexWidget>
  );
}

/**
 * Günlük Özet Widget'ı - Large
 */
export function DailySummaryWidgetLarge({ data }: WeatherWidgetProps) {
  if (!data?.current || !data?.daily) {
    return (
      <FlexWidget
        style={{
          height: 'match_parent',
          width: 'match_parent',
          backgroundColor: '#4A90E2',
          borderRadius: 16,
          justifyContent: 'center',
          alignItems: 'center',
          padding: 8,
        }}
      >
        <TextWidget text={LOADING_TEXT} style={{ fontSize: 14, color: '#ffffff' }} />
      </FlexWidget>
    );
  }

  const isNight = isNightTime();
  const theme = getAndroidTheme(data.current.conditionCode, isNight);
  const emoji = getWeatherEmoji(data.current.conditionCode, isNight);
  
  // 5 günlük tahmin
  const forecast = data.daily.slice(0, 5);

  return (
    <FlexWidget
      style={{
        height: 'match_parent',
        width: 'match_parent',
        backgroundColor: theme.background,
        borderRadius: 16,
        padding: 14,
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
      clickAction="OPEN_APP"
    >
      {/* Başlık */}
      <FlexWidget
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <TextWidget
          text="Bugün"
          style={{
            fontSize: 14,
            fontWeight: '600',
            color: theme.textPrimary,
          }}
        />
        <TextWidget
          text={data.current.location}
          style={{
            fontSize: 11,
            color: theme.textSecondary,
          }}
          maxLines={1}
        />
      </FlexWidget>
      
      {/* Ana bilgi */}
      <FlexWidget
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <TextWidget text={emoji} style={{ fontSize: 48, marginRight: 12 }} />
        <FlexWidget>
          <TextWidget
            text={data.current.condition}
            style={{
              fontSize: 18,
              fontWeight: '500',
              color: theme.textPrimary,
            }}
          />
          <TextWidget
            text={`↑ ${Math.round(forecast[0].tempMax)}° / ↓ ${Math.round(forecast[0].tempMin)}°`}
            style={{
              fontSize: 13,
              color: theme.textSecondary,
              marginTop: 2,
            }}
          />
        </FlexWidget>
      </FlexWidget>
      
      {/* Detaylar */}
      <FlexWidget
        style={{
          flexDirection: 'row',
          justifyContent: 'space-around',
        }}
      >
        <TextWidget
          text={`🌡️ ${Math.round(data.current.feelsLike)}°`}
          style={{ fontSize: 11, color: theme.textSecondary }}
        />
        <TextWidget
          text={`🌧️ %${data.current.precipitationProbability}`}
          style={{ fontSize: 11, color: theme.textSecondary }}
        />
        <TextWidget
          text={`💨 ${Math.round(data.current.windSpeed)}`}
          style={{ fontSize: 11, color: theme.textSecondary }}
        />
        <TextWidget
          text={`💧 %${data.current.humidity}`}
          style={{ fontSize: 11, color: theme.textSecondary }}
        />
      </FlexWidget>
      
      {/* 5 günlük tahmin */}
      <FlexWidget
        style={{
          paddingTop: 12,
        }}
      >
        {forecast.map((day, index) => (
          <FlexWidget
            key={index}
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingTop: 4,
              paddingBottom: 4,
            }}
          >
            <TextWidget
              text={day.dayName}
              style={{ fontSize: 11, color: theme.textSecondary }}
            />
            <TextWidget
              text={getWeatherEmoji(day.conditionCode)}
              style={{ fontSize: 14 }}
            />
            <TextWidget
              text={`${Math.round(day.tempMin)}° / ${Math.round(day.tempMax)}°`}
              style={{ fontSize: 11, color: theme.textPrimary }}
            />
            <TextWidget
              text={`🌧️ %${day.precipitationProbability}`}
              style={{ fontSize: 9, color: theme.textSecondary }}
            />
          </FlexWidget>
        ))}
      </FlexWidget>
    </FlexWidget>
  );
}

/**
 * Yağış Olasılığı Widget'ı - Small
 */
export function PrecipitationWidgetSmall({ data }: WeatherWidgetProps) {
  if (!data?.current) {
    return (
      <FlexWidget
        style={{
          height: 'match_parent',
          width: 'match_parent',
          backgroundColor: '#4682B4',
          borderRadius: 16,
          justifyContent: 'center',
          alignItems: 'center',
          padding: 8,
        }}
      >
        <TextWidget text={LOADING_TEXT} style={{ fontSize: 12, color: '#ffffff' }} />
      </FlexWidget>
    );
  }

  const isNight = isNightTime();
  const theme = getAndroidTheme(data.current.conditionCode, isNight);
  const precipProb = data.current.precipitationProbability;
  
  const getStatusEmoji = (prob: number): string => {
    if (prob < 20) return '☀️';
    if (prob < 40) return '🌤️';
    if (prob < 60) return '🌥️';
    if (prob < 80) return '🌧️';
    return '⛈️';
  };

  return (
    <FlexWidget
      style={{
        height: 'match_parent',
        width: 'match_parent',
        backgroundColor: theme.background,
        borderRadius: 16,
        padding: 12,
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
      clickAction="OPEN_APP"
    >
      <TextWidget
        text="🌧️ Yağış"
        style={{
          fontSize: 12,
          fontWeight: '600',
          color: theme.textPrimary,
        }}
      />
      
      <TextWidget text={getStatusEmoji(precipProb)} style={{ fontSize: 32 }} />
      
      <TextWidget
        text={`%${precipProb}`}
        style={{
          fontSize: 28,
          fontWeight: '300',
          color: theme.textPrimary,
        }}
      />
      
      <TextWidget
        text="Şu an"
        style={{
          fontSize: 10,
          color: theme.textSecondary,
        }}
      />
    </FlexWidget>
  );
}

/**
 * Yağış Olasılığı Widget'ı - Medium
 */
export function PrecipitationWidgetMedium({ data }: WeatherWidgetProps) {
  if (!data?.current || !data?.hourly) {
    return (
      <FlexWidget
        style={{
          height: 'match_parent',
          width: 'match_parent',
          backgroundColor: '#4682B4',
          borderRadius: 16,
          justifyContent: 'center',
          alignItems: 'center',
          padding: 8,
        }}
      >
        <TextWidget text={LOADING_TEXT} style={{ fontSize: 14, color: '#ffffff' }} />
      </FlexWidget>
    );
  }

  const isNight = isNightTime();
  const theme = getAndroidTheme(data.current.conditionCode, isNight);
  const precipProb = data.current.precipitationProbability;
  
  // Sonraki 6 saatteki maksimum yağış
  const next6Hours = data.hourly.slice(0, 6);
  const maxPrecip = Math.max(...next6Hours.map(h => h.precipitationProbability));
  
  const getStatusText = (prob: number): string => {
    if (prob < 20) return 'Yağış beklenmiyor';
    if (prob < 40) return 'Düşük olasılık';
    if (prob < 60) return 'Orta olasılık';
    if (prob < 80) return 'Yüksek olasılık';
    return 'Yağış bekleniyor';
  };

  return (
    <FlexWidget
      style={{
        height: 'match_parent',
        width: 'match_parent',
        backgroundColor: theme.background,
        borderRadius: 16,
        padding: 14,
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
      clickAction="OPEN_APP"
    >
      {/* Başlık */}
      <FlexWidget
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <TextWidget
          text="🌧️ Yağış"
          style={{
            fontSize: 12,
            fontWeight: '600',
            color: theme.textPrimary,
          }}
        />
        <TextWidget
          text={data.current.location}
          style={{
            fontSize: 10,
            color: theme.textSecondary,
          }}
          maxLines={1}
        />
      </FlexWidget>
      
      {/* Ana içerik */}
      <FlexWidget
        style={{
          flexDirection: 'row',
          justifyContent: 'space-around',
          alignItems: 'center',
        }}
      >
        <FlexWidget style={{ alignItems: 'center' }}>
          <TextWidget
            text={`%${precipProb}`}
            style={{
              fontSize: 32,
              fontWeight: '300',
              color: theme.textPrimary,
            }}
          />
          <TextWidget
            text="Şu an"
            style={{
              fontSize: 10,
              color: theme.textSecondary,
            }}
          />
        </FlexWidget>
        
        <FlexWidget style={{ alignItems: 'center' }}>
          <TextWidget
            text={`%${maxPrecip}`}
            style={{
              fontSize: 24,
              fontWeight: '300',
              color: theme.textPrimary,
            }}
          />
          <TextWidget
            text="6 saat maks"
            style={{
              fontSize: 10,
              color: theme.textSecondary,
            }}
          />
        </FlexWidget>
      </FlexWidget>
      
      {/* Durum */}
      <TextWidget
        text={getStatusText(maxPrecip)}
        style={{
          fontSize: 11,
          color: theme.textSecondary,
          textAlign: 'center',
        }}
      />
    </FlexWidget>
  );
}

/**
 * Konfor İndeksi Widget'ı - Small
 */
export function ComfortWidgetSmall({ data }: WeatherWidgetProps) {
  if (!data?.comfort) {
    return (
      <FlexWidget
        style={{
          height: 'match_parent',
          width: 'match_parent',
          backgroundColor: '#4A90E2',
          borderRadius: 16,
          justifyContent: 'center',
          alignItems: 'center',
          padding: 8,
        }}
      >
        <TextWidget text={LOADING_TEXT} style={{ fontSize: 12, color: '#ffffff' }} />
      </FlexWidget>
    );
  }

  const isNight = isNightTime();
  const theme = data.current ? getAndroidTheme(data.current.conditionCode, isNight) : {
    background: '#4A90E2' as ColorProp,
    textPrimary: '#ffffff' as ColorProp,
    textSecondary: '#cccccc' as ColorProp,
    accent: '#FFD700' as ColorProp,
  };
  const comfort = data.comfort;
  
  const getComfortEmoji = (index: number): string => {
    if (index >= 80) return '😊';
    if (index >= 60) return '🙂';
    if (index >= 40) return '😐';
    if (index >= 20) return '😕';
    return '😫';
  };

  return (
    <FlexWidget
      style={{
        height: 'match_parent',
        width: 'match_parent',
        backgroundColor: theme.background,
        borderRadius: 16,
        padding: 12,
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
      clickAction="OPEN_APP"
    >
      <TextWidget
        text="Konfor"
        style={{
          fontSize: 12,
          fontWeight: '600',
          color: theme.textPrimary,
        }}
      />
      
      <TextWidget text={getComfortEmoji(comfort.comfortIndex)} style={{ fontSize: 32 }} />
      
      <FlexWidget style={{ flexDirection: 'row', alignItems: 'center' }}>
        <TextWidget
          text={`${comfort.comfortIndex}`}
          style={{
            fontSize: 28,
            fontWeight: '300',
            color: theme.textPrimary,
          }}
        />
        <TextWidget
          text="/100"
          style={{
            fontSize: 12,
            color: theme.textSecondary,
          }}
        />
      </FlexWidget>
      
      <TextWidget
        text={`UV ${comfort.uvIndex}`}
        style={{
          fontSize: 10,
          color: theme.textSecondary,
        }}
      />
    </FlexWidget>
  );
}

/**
 * Ay Fazı Widget'ı - Small
 */
export function MoonPhaseWidgetSmall({ data }: WeatherWidgetProps) {
  if (!data?.moon) {
    return (
      <FlexWidget
        style={{
          height: 'match_parent',
          width: 'match_parent',
          backgroundColor: '#1A1A2E',
          borderRadius: 16,
          justifyContent: 'center',
          alignItems: 'center',
          padding: 8,
        }}
      >
        <TextWidget text={LOADING_TEXT} style={{ fontSize: 12, color: '#ffffff' }} />
      </FlexWidget>
    );
  }

  const theme = getAndroidNightTheme();
  const moon = data.moon;

  return (
    <FlexWidget
      style={{
        height: 'match_parent',
        width: 'match_parent',
        backgroundColor: theme.background,
        borderRadius: 16,
        padding: 12,
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
      clickAction="OPEN_APP"
    >
      <TextWidget
        text="🌙 Ay Fazı"
        style={{
          fontSize: 11,
          fontWeight: '600',
          color: theme.textPrimary,
        }}
      />
      
      <TextWidget text={moon.emoji} style={{ fontSize: 40 }} />
      
      <TextWidget
        text={moon.phaseName}
        style={{
          fontSize: 11,
          color: theme.textPrimary,
        }}
        maxLines={1}
      />
      
      <TextWidget
        text={`%${moon.illumination} aydınlık`}
        style={{
          fontSize: 9,
          color: theme.textSecondary,
        }}
      />
    </FlexWidget>
  );
}

/**
 * Ay Fazı Widget'ı - Medium
 */
export function MoonPhaseWidgetMedium({ data }: WeatherWidgetProps) {
  if (!data?.moon) {
    return (
      <FlexWidget
        style={{
          height: 'match_parent',
          width: 'match_parent',
          backgroundColor: '#1A1A2E',
          borderRadius: 16,
          justifyContent: 'center',
          alignItems: 'center',
          padding: 8,
        }}
      >
        <TextWidget text={LOADING_TEXT} style={{ fontSize: 14, color: '#ffffff' }} />
      </FlexWidget>
    );
  }

  const theme = getAndroidNightTheme();
  const moon = data.moon;

  return (
    <FlexWidget
      style={{
        height: 'match_parent',
        width: 'match_parent',
        backgroundColor: theme.background,
        borderRadius: 16,
        padding: 14,
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
      clickAction="OPEN_APP"
    >
      {/* Başlık */}
      <FlexWidget
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <TextWidget
          text="🌙 Ay Fazı"
          style={{
            fontSize: 12,
            fontWeight: '600',
            color: theme.textPrimary,
          }}
        />
        {data.current && (
          <TextWidget
            text={data.current.location}
            style={{
              fontSize: 10,
              color: theme.textSecondary,
            }}
            maxLines={1}
          />
        )}
      </FlexWidget>
      
      {/* Ana içerik */}
      <FlexWidget
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <TextWidget text={moon.emoji} style={{ fontSize: 48, marginRight: 16 }} />
        <FlexWidget>
          <TextWidget
            text={moon.phaseName}
            style={{
              fontSize: 16,
              fontWeight: '600',
              color: theme.textPrimary,
            }}
          />
          <TextWidget
            text={`%${moon.illumination} aydınlık`}
            style={{
              fontSize: 12,
              color: theme.textSecondary,
              marginTop: 2,
            }}
          />
        </FlexWidget>
      </FlexWidget>
      
      {/* Ay takvimi */}
      <FlexWidget
        style={{
          flexDirection: 'row',
          justifyContent: 'space-around',
        }}
      >
        <TextWidget text="🌑" style={{ fontSize: 14 }} />
        <TextWidget text="🌒" style={{ fontSize: 14 }} />
        <TextWidget text="🌓" style={{ fontSize: 14 }} />
        <TextWidget text="🌔" style={{ fontSize: 14 }} />
        <TextWidget text="🌕" style={{ fontSize: 14 }} />
        <TextWidget text="🌖" style={{ fontSize: 14 }} />
        <TextWidget text="🌗" style={{ fontSize: 14 }} />
        <TextWidget text="🌘" style={{ fontSize: 14 }} />
      </FlexWidget>
    </FlexWidget>
  );
}

// Tüm widget'ları dışa aktar
export const AndroidWidgets = {
  TemperatureWidgetSmall,
  TemperatureWidgetMedium,
  TemperatureWidgetLarge,
  DailySummaryWidgetSmall,
  DailySummaryWidgetMedium,
  DailySummaryWidgetLarge,
  PrecipitationWidgetSmall,
  PrecipitationWidgetMedium,
  ComfortWidgetSmall,
  MoonPhaseWidgetSmall,
  MoonPhaseWidgetMedium,
};
