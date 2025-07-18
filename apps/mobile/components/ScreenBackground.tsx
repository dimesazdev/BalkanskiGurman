import React from 'react';
import { ImageBackground, StyleSheet, ViewStyle } from 'react-native';

type Props = {
    children: React.ReactNode;
    style?: ViewStyle;
};

const ScreenBackground = ({ children, style }: Props) => {
    return (
        <ImageBackground
            source={require('../assets/images/background_dark.png')}
            resizeMode="cover"
            style={[styles.background, style]}
        >
            {children}
        </ImageBackground>
    );
};

export default ScreenBackground;

const styles = StyleSheet.create({
    background: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
});