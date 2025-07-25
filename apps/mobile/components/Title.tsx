import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MotiView } from 'moti';
import { Easing } from 'react-native-reanimated';

type Props = {
    children: React.ReactNode;
    style?: object;
};

const Title: React.FC<Props> = ({ children, style = {} }) => {
    return (
        <MotiView
            from={{ opacity: 0, translateY: -50 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 600, easing: Easing.out(Easing.ease) }}
            style={[styles.wrapper, style]}
        >
            <View style={styles.line} />
            <Text style={styles.text}>{children}</Text>
            <View style={styles.line} />
        </MotiView>
    );
};

export default Title;

const styles = StyleSheet.create({
    wrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 24,
        width: '100%',
    },
    text: {
        fontSize: 28,
        color: '#FFEEDB',
        fontFamily: 'CormorantSC-Bold',
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    line: {
        flex: 1,
        height: 1,
        backgroundColor: '#FFEEDB',
    },
});