import React, { useEffect, useState } from 'react';
import { StyleSheet, Animated } from 'react-native';

const Loading = () => {
    const [visible, setVisible] = useState(false);
    const opacity = useState(new Animated.Value(0))[0];
    const rotateAnim = useState(new Animated.Value(0))[0];

    useEffect(() => {
        const fadeIn = setTimeout(() => {
            setVisible(true);
            Animated.timing(opacity, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }).start();
        }, 50);

        Animated.loop(
            Animated.timing(rotateAnim, {
                toValue: 1,
                duration: 1500,
                useNativeDriver: true,
            })
        ).start();

        return () => clearTimeout(fadeIn);
    }, []);

    if (!visible) return null;

    const rotateInterpolate = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    return (
        <Animated.View style={[styles.overlay, { opacity }]}>
            <Animated.Image
                source={require('../assets/images/icon.png')}
                style={[styles.logo, { transform: [{ rotate: rotateInterpolate }] }]}
                resizeMode="contain"
            />
        </Animated.View>
    );
};

export default Loading;

const styles = StyleSheet.create({
    overlay: {
        position: 'absolute',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
    },
    logo: {
        width: 80,
        height: 80,
    },
});