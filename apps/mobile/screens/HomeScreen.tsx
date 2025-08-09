import React from 'react';
import { View, Image, StyleSheet, Dimensions, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import Button from '../components/Button';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get('window');

const HomeScreen = () => {
    const { t } = useTranslation();
    const navigation = useNavigation();
    return (
        <View style={styles.mainContent}>
            <View style={styles.plateContainer}>
                <Image
                    source={require('../assets/images/plate.webp')}
                    style={styles.plate}
                    resizeMode="contain"
                />
            </View>
            <Image
                source={require('../assets/images/light-logo.png')}
                style={styles.logo}
                resizeMode="contain"
            />
            <Button
                variant="red"
                onPress={() => navigation.navigate('ExYuMap' as never)}
                style={styles.button}
            >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={{ color: '#FFF', fontFamily: 'CormorantSC-Bold', fontSize: 16 }}>
                        {t('home.button')}
                    </Text>
                    <MaterialCommunityIcons
                        name="arrow-right-thin"
                        size={22}
                        color="#FFF"
                        style={{ marginLeft: 10 }}
                    />
                </View>
            </Button>
        </View>
    );
};

export default HomeScreen;

const styles = StyleSheet.create({
    mainContent: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
    },
    logo: {
        width: width * 0.6,
        height: undefined,
        aspectRatio: 1,
        marginBottom: 15,
    },
    button: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    icon: {
        marginLeft: 8,
    },
    plateContainer: {
        width: '100%',
        alignItems: 'center'
    },
    plate: {
        width: width * 0.8,
        height: undefined,
        aspectRatio: 1
    },
});