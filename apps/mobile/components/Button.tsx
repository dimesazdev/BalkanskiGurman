import Colors from '@/constants/Colors';
import React from 'react';
import {
    Text,
    TouchableOpacity,
    StyleSheet,
    GestureResponderEvent,
    ViewStyle,
    TextStyle,
    View,
} from 'react-native';

type ButtonProps = {
    children: React.ReactNode;
    onPress: (event: GestureResponderEvent) => void;
    variant?:
    | 'red'
    | 'beige'
    | 'yellow'
    | 'green'
    | 'blue'
    | 'red-outline'
    | 'beige-outline'
    | 'red-small'
    | 'yellow-small';
    style?: ViewStyle;
};

const Button = ({
    children,
    onPress,
    variant = 'beige',
    style = {},
}: ButtonProps) => {
    const variantStyles = StyleSheet.flatten([
        styles.base,
        variantMap[variant] || {},
        style,
    ]);

    const textStyle = StyleSheet.flatten([
        styles.text,
        textVariantMap[variant] || {},
    ]);

    return (
        <TouchableOpacity style={variantStyles} onPress={onPress}>
            <View style={styles.content}>
                {React.Children.map(children, (child, index) => {
                    if (typeof child === 'string' || typeof child === 'number') {
                        return (
                            <Text key={index} style={textStyle}>
                                {child}
                            </Text>
                        );
                    }

                    return (
                        <View key={index} style={index > 0 ? styles.iconGap : undefined}>
                            {child}
                        </View>
                    );
                })}
            </View>
        </TouchableOpacity>
    );
};

export default Button;

const styles = StyleSheet.create({
    base: {
        height: 48,
        borderRadius: 20,
        paddingHorizontal: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    text: {
        fontSize: 16,
        fontWeight: '500',
        color: '#000',
        fontFamily: 'CormorantSC-Bold',
    },
    iconGap: {
        marginLeft: 10,
    },
});

const variantMap: Record<string, ViewStyle> = {
    beige: {
        backgroundColor: '#FFEEDB',
    },
    'beige-outline': {
        borderWidth: 2,
        borderColor: '#FFEEDB',
        backgroundColor: 'transparent',
    },
    red: {
        backgroundColor: '#BA3B46',
    },
    'red-outline': {
        borderWidth: 2,
        borderColor: '#BA3B46',
        backgroundColor: 'transparent',
    },
    'red-small': {
        backgroundColor: '#BA3B46',
        height: 32,
        borderRadius: 10,
        paddingHorizontal: 16,
    },
    yellow: {
        backgroundColor: '#F0A404',
    },
    'yellow-small': {
        backgroundColor: '#F0A404',
        height: 32,
        borderRadius: 10,
        paddingHorizontal: 16,
    },
    green: {
        backgroundColor: '#008000',
    },
    blue: {
        backgroundColor: '#1565c0',
    },
};

const textVariantMap: Record<string, TextStyle> = {
    red: { color: '#FFF' },
    'red-small': { color: '#FFF' },
    yellow: { color: '#FFF' },
    'yellow-small': { color: '#FFF' },
    green: { color: '#FFF' },
    blue: { color: '#FFF' },
    'beige-outline': { color: Colors.beige }
};
