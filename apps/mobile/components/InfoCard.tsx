import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Colors from '@/constants/Colors';

type InfoCardProps = {
    icon?: string;
    label: string;
    value?: string;
    onClick?: () => void;
    style?: ViewStyle;
};

const InfoCard: React.FC<InfoCardProps> = ({ icon, label, value, onClick, style }) => {
    const Container = onClick ? TouchableOpacity : View;

    return (
        <Container onPress={onClick} style={[styles.card, onClick && styles.clickable, style]}>
            <View style={styles.header}>
                {icon && <MaterialCommunityIcons name={icon} size={24} color={Colors.red} />}
                <Text style={styles.label}>{label}</Text>
            </View>
            {value && <Text style={styles.value}>{value}</Text>}
        </Container>
    );
};

export default InfoCard;

const styles = StyleSheet.create({
    card: {
        backgroundColor: Colors.beige,
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 16,
        alignItems: 'center',
        justifyContent: 'center',
        width: 280,
        textAlign: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
        elevation: 3,
    },
    clickable: {
        // Optionally scale on press via animation if needed
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
        justifyContent: 'center',
    },
    label: {
        fontSize: 18,
        fontFamily: 'CormorantSC-SemiBold',
        color: '#333',
    },
    value: {
        fontSize: 16,
        color: '#666',
        fontFamily: 'CormorantGaramond-Regular',
        textAlign: 'center',
    },
});