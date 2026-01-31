import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface SkeletonLoaderProps {
    variant?: 'card' | 'hourly' | 'daily' | 'stat' | 'text' | 'circle';
    width?: number | string;
    height?: number | string;
    borderRadius?: number;
    style?: any;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
    variant = 'card',
    width,
    height,
    borderRadius,
    style,
}) => {
    const shimmerAnim = useRef(new Animated.Value(0)).current;
    const screenWidth = Dimensions.get('window').width;

    useEffect(() => {
        const animation = Animated.loop(
            Animated.timing(shimmerAnim, {
                toValue: 1,
                duration: 1200,
                useNativeDriver: true,
            })
        );
        animation.start();
        return () => animation.stop();
    }, [shimmerAnim]);

    const getVariantStyles = () => {
        switch (variant) {
            case 'hourly':
                return { width: 80, height: 130, borderRadius: 20 };
            case 'daily':
                return { width: '100%', height: 70, borderRadius: 12 };
            case 'stat':
                return { width: '48%', height: 100, borderRadius: 16 };
            case 'text':
                return { width: 120, height: 16, borderRadius: 8 };
            case 'circle':
                return { width: 80, height: 80, borderRadius: 40 };
            case 'card':
            default:
                return { width: '100%', height: 150, borderRadius: 16 };
        }
    };

    const variantStyles = getVariantStyles();
    const translateX = shimmerAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [-screenWidth, screenWidth],
    });

    return (
        <View
            style={[
                styles.container,
                {
                    width: width || variantStyles.width,
                    height: height || variantStyles.height,
                    borderRadius: borderRadius || variantStyles.borderRadius,
                },
                style,
            ]}
        >
            <Animated.View
                style={[
                    styles.shimmer,
                    {
                        transform: [{ translateX }],
                    },
                ]}
            >
                <LinearGradient
                    colors={['transparent', 'rgba(255,255,255,0.15)', 'transparent']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.gradient}
                />
            </Animated.View>
        </View>
    );
};

// Pre-built skeleton layouts
export const WeatherCardSkeleton: React.FC = () => (
    <View style={styles.weatherCardSkeleton}>
        <SkeletonLoader variant="text" width={120} height={24} style={{ marginBottom: 10 }} />
        <View style={styles.mainRow}>
            <SkeletonLoader variant="circle" width={80} height={80} />
            <SkeletonLoader variant="text" width={100} height={60} style={{ marginLeft: 10 }} />
        </View>
        <SkeletonLoader variant="text" width={160} height={20} style={{ marginTop: 15 }} />
        <SkeletonLoader variant="text" width={100} height={14} style={{ marginTop: 8 }} />
    </View>
);

export const HourlyForecastSkeleton: React.FC = () => (
    <View style={styles.hourlyContainer}>
        <SkeletonLoader variant="text" width={140} height={20} style={{ marginBottom: 12, marginLeft: 20 }} />
        <View style={styles.hourlyRow}>
            {[1, 2, 3, 4, 5].map((i) => (
                <SkeletonLoader key={i} variant="hourly" style={{ marginRight: 10 }} />
            ))}
        </View>
    </View>
);

export const StatsSkeleton: React.FC = () => (
    <View style={styles.statsContainer}>
        {[1, 2, 3, 4].map((i) => (
            <SkeletonLoader key={i} variant="stat" style={{ marginBottom: 10 }} />
        ))}
    </View>
);

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        overflow: 'hidden',
    },
    shimmer: {
        width: '100%',
        height: '100%',
        position: 'absolute',
    },
    gradient: {
        width: '50%',
        height: '100%',
    },
    weatherCardSkeleton: {
        alignItems: 'center',
        paddingTop: 20,
        paddingHorizontal: 20,
    },
    mainRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
    },
    hourlyContainer: {
        marginTop: 25,
    },
    hourlyRow: {
        flexDirection: 'row',
        paddingLeft: 20,
    },
    statsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        marginTop: 20,
    },
});
