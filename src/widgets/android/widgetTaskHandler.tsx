/**
 * Android Widget Task Handler
 * react-native-android-widget için widget görev işleyicisi
 */

import React from 'react';
import type { WidgetTaskHandlerProps } from 'react-native-android-widget';
import { getWidgetData } from '../../services/widgetService';
import {
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
} from './WeatherWidgets';

// Widget isimleri
const WIDGET_NAMES = {
  TEMPERATURE_SMALL: 'TemperatureSmall',
  TEMPERATURE_MEDIUM: 'TemperatureMedium',
  TEMPERATURE_LARGE: 'TemperatureLarge',
  DAILY_SUMMARY_SMALL: 'DailySummarySmall',
  DAILY_SUMMARY_MEDIUM: 'DailySummaryMedium',
  DAILY_SUMMARY_LARGE: 'DailySummaryLarge',
  PRECIPITATION_SMALL: 'PrecipitationSmall',
  PRECIPITATION_MEDIUM: 'PrecipitationMedium',
  COMFORT_SMALL: 'ComfortSmall',
  MOON_PHASE_SMALL: 'MoonPhaseSmall',
  MOON_PHASE_MEDIUM: 'MoonPhaseMedium',
} as const;

/**
 * Android Widget Task Handler
 * Bu fonksiyon tüm widget görevlerini işler
 */
export async function widgetTaskHandler(props: WidgetTaskHandlerProps): Promise<React.JSX.Element> {
  const widgetInfo = props.widgetInfo;
  const widgetName = widgetInfo.widgetName;
  
  try {
    // Widget verilerini al
    const data = await getWidgetData();
    
    // Widget türüne göre render et
    switch (widgetName) {
      // Sıcaklık Widget'ları
      case WIDGET_NAMES.TEMPERATURE_SMALL:
        return <TemperatureWidgetSmall data={data} />;
      case WIDGET_NAMES.TEMPERATURE_MEDIUM:
        return <TemperatureWidgetMedium data={data} />;
      case WIDGET_NAMES.TEMPERATURE_LARGE:
        return <TemperatureWidgetLarge data={data} />;
      
      // Günlük Özet Widget'ları
      case WIDGET_NAMES.DAILY_SUMMARY_SMALL:
        return <DailySummaryWidgetSmall data={data} />;
      case WIDGET_NAMES.DAILY_SUMMARY_MEDIUM:
        return <DailySummaryWidgetMedium data={data} />;
      case WIDGET_NAMES.DAILY_SUMMARY_LARGE:
        return <DailySummaryWidgetLarge data={data} />;
      
      // Yağış Widget'ları
      case WIDGET_NAMES.PRECIPITATION_SMALL:
        return <PrecipitationWidgetSmall data={data} />;
      case WIDGET_NAMES.PRECIPITATION_MEDIUM:
        return <PrecipitationWidgetMedium data={data} />;
      
      // Konfor Widget'ı
      case WIDGET_NAMES.COMFORT_SMALL:
        return <ComfortWidgetSmall data={data} />;
      
      // Ay Fazı Widget'ları
      case WIDGET_NAMES.MOON_PHASE_SMALL:
        return <MoonPhaseWidgetSmall data={data} />;
      case WIDGET_NAMES.MOON_PHASE_MEDIUM:
        return <MoonPhaseWidgetMedium data={data} />;
      
      // Varsayılan olarak sıcaklık widget'ı göster
      default:
        return <TemperatureWidgetSmall data={data} />;
    }
  } catch (error) {
    console.error('Widget rendering failed:', error);
    // Hata durumunda basit bir görünüm döndür
    // Bu, uygulamanın çökmesini engeller
    const { FlexWidget, TextWidget } = require('react-native-android-widget');
    return (
      <FlexWidget
        style={{
          height: 'match_parent',
          width: 'match_parent',
          backgroundColor: '#FF5252',
          borderRadius: 16,
          justifyContent: 'center',
          alignItems: 'center',
          padding: 8,
        }}
      >
        <TextWidget 
          text="Hata" 
          style={{ fontSize: 14, color: '#ffffff', fontWeight: 'bold' }} 
        />
        <TextWidget 
          text="Yenileyin" 
          style={{ fontSize: 10, color: '#ffffff' }} 
        />
      </FlexWidget>
    );
  }
}

// Widget adlarını dışa aktar
export { WIDGET_NAMES };
