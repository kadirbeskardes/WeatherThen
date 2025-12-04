import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ThemeColors } from '../utils/themeUtils';
import { AppSettings } from '../types/settings';
import { WeatherData } from '../types/weather';

interface FeelsLikeExplainerProps {
  weatherData: WeatherData;
  theme: ThemeColors;
  settings: AppSettings;
  convertTemperature: (celsius: number) => number;
  getTemperatureSymbol: () => string;
}

export const FeelsLikeExplainer: React.FC<FeelsLikeExplainerProps> = ({
  weatherData,
  theme,
  settings,
  convertTemperature,
  getTemperatureSymbol,
}) => {
  const actualTemp = weatherData.current.temperature;
  const feelsLike = weatherData.current.apparentTemperature;
  const windSpeed = weatherData.current.windSpeed;
  const humidity = weatherData.current.humidity;
  
  const diff = feelsLike - actualTemp;
  const symbol = getTemperatureSymbol();
  
  const getExplanation = (): { icon: string; title: string; description: string } => {
    if (settings.language === 'tr') {
      if (diff <= -3) {
        return {
          icon: '🥶',
          title: 'Rüzgar Soğuğu',
          description: `${windSpeed} km/s rüzgar, havayı ${Math.abs(Math.round(diff))}° daha soğuk hissettiriyor.`,
        };
      } else if (diff >= 3) {
        return {
          icon: '🥵',
          title: 'Nem Etkisi',
          description: `%${humidity} nem oranı, havayı ${Math.round(diff)}° daha sıcak hissettiriyor.`,
        };
      } else {
        return {
          icon: '😊',
          title: 'Normal Hissiyat',
          description: 'Hava, termometrenin gösterdiği gibi hissediliyor.',
        };
      }
    } else {
      if (diff <= -3) {
        return {
          icon: '🥶',
          title: 'Wind Chill',
          description: `${windSpeed} km/h wind makes it feel ${Math.abs(Math.round(diff))}° colder.`,
        };
      } else if (diff >= 3) {
        return {
          icon: '🥵',
          title: 'Humidity Effect',
          description: `${humidity}% humidity makes it feel ${Math.round(diff)}° warmer.`,
        };
      } else {
        return {
          icon: '😊',
          title: 'Normal Feel',
          description: 'The weather feels like what the thermometer shows.',
        };
      }
    }
  };
  
  const explanation = getExplanation();
  
  // Factors affecting feels-like temperature
  const factors = [
    {
      icon: '💨',
      label: settings.language === 'tr' ? 'Rüzgar' : 'Wind',
      value: `${windSpeed} ${settings.language === 'tr' ? 'km/s' : 'km/h'}`,
      impact: windSpeed > 20 ? 'high' : windSpeed > 10 ? 'medium' : 'low',
    },
    {
      icon: '💧',
      label: settings.language === 'tr' ? 'Nem' : 'Humidity',
      value: `${humidity}%`,
      impact: humidity > 70 ? 'high' : humidity > 50 ? 'medium' : 'low',
    },
    {
      icon: '☀️',
      label: 'UV',
      value: `${weatherData.current.uvIndex}`,
      impact: weatherData.current.uvIndex > 6 ? 'high' : weatherData.current.uvIndex > 3 ? 'medium' : 'low',
    },
  ];
  
  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return '#F44336';
      case 'medium': return '#FF9800';
      default: return '#4CAF50';
    }
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: theme.text }]}>
        🤔 {settings.language === 'tr' ? 'Neden Bu Kadar Hissediliyor?' : 'Why Does It Feel Like This?'}
      </Text>
      
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
        {/* Temperature comparison */}
        <View style={styles.tempComparison}>
          <View style={styles.tempBox}>
            <Text style={[styles.tempLabel, { color: theme.textSecondary }]}>
              {settings.language === 'tr' ? 'Gerçek' : 'Actual'}
            </Text>
            <Text style={[styles.tempValue, { color: theme.text }]}>
              {convertTemperature(actualTemp)}{symbol}
            </Text>
          </View>
          
          <View style={styles.arrowContainer}>
            <Text style={styles.arrow}>→</Text>
          </View>
          
          <View style={styles.tempBox}>
            <Text style={[styles.tempLabel, { color: theme.textSecondary }]}>
              {settings.language === 'tr' ? 'Hissedilen' : 'Feels Like'}
            </Text>
            <Text style={[styles.tempValue, { color: diff < 0 ? '#64B5F6' : diff > 0 ? '#FF8A65' : theme.text }]}>
              {convertTemperature(feelsLike)}{symbol}
            </Text>
          </View>
        </View>
        
        {/* Explanation */}
        <View style={[styles.explanationBox, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
          <Text style={styles.explanationIcon}>{explanation.icon}</Text>
          <View style={styles.explanationContent}>
            <Text style={[styles.explanationTitle, { color: theme.text }]}>
              {explanation.title}
            </Text>
            <Text style={[styles.explanationDesc, { color: theme.textSecondary }]}>
              {explanation.description}
            </Text>
          </View>
        </View>
        
        {/* Factors */}
        <View style={styles.factorsRow}>
          {factors.map((factor, index) => (
            <View key={index} style={styles.factorItem}>
              <Text style={styles.factorIcon}>{factor.icon}</Text>
              <Text style={[styles.factorValue, { color: theme.text }]}>{factor.value}</Text>
              <View style={[styles.factorIndicator, { backgroundColor: getImpactColor(factor.impact) }]} />
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 25,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  tempComparison: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  tempBox: {
    alignItems: 'center',
    flex: 1,
  },
  tempLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  tempValue: {
    fontSize: 28,
    fontWeight: '700',
  },
  arrowContainer: {
    paddingHorizontal: 16,
  },
  arrow: {
    fontSize: 24,
    color: 'rgba(255,255,255,0.5)',
  },
  explanationBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  explanationIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  explanationContent: {
    flex: 1,
  },
  explanationTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  explanationDesc: {
    fontSize: 12,
    lineHeight: 16,
  },
  factorsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  factorItem: {
    alignItems: 'center',
  },
  factorIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  factorValue: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  factorIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
