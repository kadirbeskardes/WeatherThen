/**
 * Wind Direction Indicator
 * Rüzgar yönünü gösteren mini pusula
 */

import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ThemeColors } from '../utils/themeUtils';

interface WindDirectionIndicatorProps {
  direction: number; // 0-360 derece
  theme: ThemeColors;
}

const WindDirectionIndicatorComponent: React.FC<WindDirectionIndicatorProps> = ({
  direction,
  theme,
}) => {
  const rotation = direction - 45; // Ok simgesi 45 derece döndürülmüş
  
  return (
    <View style={styles.container}>
      <View style={[styles.compass, { borderColor: theme.cardBorder }]}>
        <Text style={styles.northLabel}>N</Text>
        <View 
          style={[
            styles.arrow, 
            { 
              transform: [{ rotate: `${rotation}deg` }],
            }
          ]}
        >
          <Text style={styles.arrowIcon}>➤</Text>
        </View>
      </View>
    </View>
  );
};

export const WindDirectionIndicator = memo(WindDirectionIndicatorComponent);

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  compass: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  northLabel: {
    position: 'absolute',
    top: -2,
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  arrow: {
    position: 'absolute',
  },
  arrowIcon: {
    fontSize: 20,
    color: '#4ECDC4',
  },
});
