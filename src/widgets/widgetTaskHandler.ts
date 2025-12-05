/**
 * Widget Task Handler
 * Native widget'lar için görev işleyici (Android)
 * 
 * Bu dosya react-native-android-widget paketi kurulduğunda aktif olacaktır.
 */

import { getWidgetData, prepareWidgetData, saveWidgetData, CompleteWidgetData } from '../services/widgetService';

// Widget görevleri için tip tanımları
export type WidgetTaskName = 
  | 'WIDGET_UPDATE'
  | 'WIDGET_CLICK'
  | 'WIDGET_RESIZE'
  | 'WIDGET_DELETED';

export interface WidgetTask {
  name: WidgetTaskName;
  widgetId: number;
  widgetName: string;
  payload?: any;
}

// Widget verilerini güncelle
export async function handleWidgetUpdate(
  latitude: number,
  longitude: number,
  locationName: string,
  language: string = 'tr'
): Promise<CompleteWidgetData | null> {
  try {
    const data = await prepareWidgetData(latitude, longitude, locationName, language);
    await saveWidgetData(data);
    return data;
  } catch (error) {
    console.error('Widget güncelleme hatası:', error);
    return null;
  }
}

// Widget görevini işle
export async function handleWidgetTask(task: WidgetTask): Promise<void> {
  console.log('Widget görevi:', task.name, task.widgetId);
  
  switch (task.name) {
    case 'WIDGET_UPDATE':
      // Widget güncelleme isteği
      // Konum bilgisi AsyncStorage'dan alınacak
      break;
      
    case 'WIDGET_CLICK':
      // Widget'a tıklandı - uygulamayı aç
      break;
      
    case 'WIDGET_RESIZE':
      // Widget boyutu değişti
      break;
      
    case 'WIDGET_DELETED':
      // Widget silindi
      break;
  }
}

// Widget güncelleme aralığı (milisaniye)
export const WIDGET_UPDATE_INTERVAL = 30 * 60 * 1000; // 30 dakika

// Widget'ları periyodik olarak güncelle
export function scheduleWidgetUpdates(): void {
  // Bu fonksiyon native tarafta çağrılacak
  // Expo'da background task kullanılabilir
  console.log('Widget güncellemeleri planlandı');
}

/**
 * Widget Provider JSX - Android için
 * 
 * Bu JSX, react-native-android-widget paketi ile kullanılacak.
 * Native tarafa widget görünümünü render eder.
 * 
 * Örnek kullanım (paket kurulduktan sonra):
 * 
 * import { WidgetTaskHandlerProps } from 'react-native-android-widget';
 * 
 * export async function widgetTaskHandler(props: WidgetTaskHandlerProps) {
 *   const widgetInfo = props.widgetInfo;
 *   const data = await getWidgetData();
 *   
 *   switch (widgetInfo.widgetName) {
 *     case 'Temperature':
 *       return renderTemperatureWidget(data);
 *     case 'DailySummary':
 *       return renderDailySummaryWidget(data);
 *     // ... diğer widget'lar
 *   }
 * }
 */

// Kolay entegrasyon için hazır fonksiyonlar
export const WidgetHelpers = {
  // Sıcaklık formatla
  formatTemperature: (temp: number, unit: 'celsius' | 'fahrenheit' = 'celsius'): string => {
    if (unit === 'fahrenheit') {
      return `${Math.round((temp * 9/5) + 32)}°F`;
    }
    return `${Math.round(temp)}°C`;
  },
  
  // Rüzgar hızı formatla
  formatWindSpeed: (speed: number, unit: 'kmh' | 'mph' | 'ms' = 'kmh'): string => {
    switch (unit) {
      case 'mph':
        return `${Math.round(speed * 0.621371)} mph`;
      case 'ms':
        return `${Math.round(speed / 3.6)} m/s`;
      default:
        return `${Math.round(speed)} km/h`;
    }
  },
  
  // Zaman formatla
  formatTime: (isoString: string, is24Hour: boolean = true): string => {
    const date = new Date(isoString);
    if (is24Hour) {
      return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  },
  
  // Tarih formatla
  formatDate: (isoString: string, language: string = 'tr'): string => {
    const date = new Date(isoString);
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'short', 
      day: 'numeric', 
      month: 'short' 
    };
    return date.toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US', options);
  },
};
