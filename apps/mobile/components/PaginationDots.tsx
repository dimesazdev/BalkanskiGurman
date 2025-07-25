import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { interpolate, useAnimatedStyle, withTiming } from 'react-native-reanimated';

type Props = {
    count: number;
    index: number;
};

const AnimatedDots: React.FC<Props> = ({ count, index }) => {
    return (
        <View style={styles.dotRow}>
            {Array.from({ length: count }).map((_, i) => (
                <AnimatedDot key={i} active={i === index} />
            ))}
        </View>
    );
};

const AnimatedDot = ({ active }: { active: boolean }) => {
    const rStyle = useAnimatedStyle(() => {
        return {
            width: withTiming(active ? 14 : 8),
            opacity: withTiming(active ? 1 : 0.4),
        };
    }, [active]);

    return <Animated.View style={[styles.dot, rStyle]} />;
};

export default AnimatedDots;

const styles = StyleSheet.create({
    dotRow: {
        flexDirection: 'row',
        marginTop: 12,
        gap: 6,
        justifyContent: 'center',
        alignItems: 'center',
    },
    dot: {
        height: 8,
        borderRadius: 4,
        backgroundColor: '#FFEEDB',
    },
});
