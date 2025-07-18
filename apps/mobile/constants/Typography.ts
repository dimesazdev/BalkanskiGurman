import { StyleSheet } from 'react-native';
import Colors from './Colors';

const Typography = StyleSheet.create({
    h1: {
        fontSize: 40,
        fontWeight: '700',
        fontFamily: 'CormorantSC-Bold',
    },
    h2: {
        fontSize: 32,
        fontWeight: '600',
        fontFamily: 'CormorantGaramond',
    },
    h3: {
        fontSize: 28,
        fontWeight: '600',
        fontFamily: 'CormorantGaramond',
    },
    h4: {
        fontSize: 24,
        fontWeight: '500',
        fontFamily: 'CormorantGaramond',
    },
    h5: {
        fontSize: 20,
        fontWeight: '500',
        fontFamily: 'CormorantGaramond',
    },
    h6: {
        fontSize: 16,
        fontWeight: '500',
        fontFamily: 'CormorantGaramond',
    },

    p: {
        fontSize: 18,
        fontFamily: 'CormorantGaramond',
    },
    span: {
        fontSize: 16,
        fontFamily: 'CormorantGaramond',
    },
    label: {
        color: Colors.white,
        marginBottom: 6,
        fontSize: 18,
        fontFamily: 'CormorantGaramond-Regular'
    },
    link: {
        fontSize: 16,
        textDecorationLine: 'none',
        color: 'inherit',
        fontFamily: 'CormorantGaramond',
    },
    small: {
        fontSize: 14,
        fontFamily: 'CormorantGaramond',
    },
    strong: {
        fontWeight: '700',
        fontFamily: 'CormorantGaramond',
    },
    blockquote: {
        fontSize: 20,
        fontStyle: 'italic',
        paddingLeft: 12,
        borderLeftWidth: 3,
        borderLeftColor: '#ccc',
        marginVertical: 12,
        fontFamily: 'CormorantGaramond',
    },
    li: {
        fontSize: 16,
        lineHeight: 24,
        fontFamily: 'CormorantGaramond',
    },
});

export default Typography;