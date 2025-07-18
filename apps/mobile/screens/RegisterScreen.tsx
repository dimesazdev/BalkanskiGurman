import React, { useState } from 'react';
import {
    View,
    ScrollView,
    Image,
    StyleSheet,
    TouchableOpacity,
    Text,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

import FormInput from '../components/FormInput';
import PhoneNumberPicker from '../components/PhoneNumberPicker';
import CountryPicker from '../components/CountryPicker';
import CityPicker from '../components/CityPicker';
import Button from '../components/Button';
import Loading from '../components/Loading';
import Popup from '../components/Popup';

import Colors from '@/constants/Colors';
import { validateFields } from '../utils/validators';
import { RootStackParamList } from '../types/navigation';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type PopupState = {
    message: string;
    variant: 'success' | 'error' | 'warning';
} | null;

const RegisterScreen = () => {
    const { t, i18n } = useTranslation();
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    const [formData, setFormData] = useState({
        name: '',
        surname: '',
        email: '',
        phoneNumber: '',
        city: '',
        country: '',
        countryIso: '',
        password: '',
        retypePassword: '',
        countryCode: '+389',
    });

    const [loading, setLoading] = useState(false);
    const [activePopup, setActivePopup] = useState<PopupState>(null);

    const handleChange = (key: string, value: string) => {
        setFormData((prev) => ({ ...prev, [key]: value }));
    };

    const handleSubmit = async () => {
        const validationErrors = validateFields(formData, t);
        if (Object.keys(validationErrors).length > 0) {
            showNextPopup(Object.values(validationErrors));
            return;
        }

        setLoading(true);

        try {
            const fullPhone = `${formData.countryCode}${formData.phoneNumber}`.replace(/\D/g, '');
            const cleanedCode = formData.countryCode.replace(/\D/g, '');
            const phoneNumberToSend =
                formData.phoneNumber.trim() === '' || fullPhone === cleanedCode
                    ? null
                    : `${formData.countryCode}${formData.phoneNumber}`;

            const payload = {
                name: formData.name,
                surname: formData.surname,
                email: formData.email,
                phoneNumber: phoneNumberToSend,
                city: formData.city.trim() === '' ? null : formData.city,
                country: formData.country,
                password: formData.password,
                language: i18n.language,
            };

            const res = await fetch('http://192.168.100.31:3001/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const message = res.status === 409
                    ? t('register.emailExists')
                    : t('alerts.registerError');
                setActivePopup({ message, variant: 'warning' });
                setLoading(false);
                return;
            }

            setActivePopup({
                message: t('register.success'),
                variant: 'success',
            });

            setTimeout(() => {
                navigation.navigate('Login');
            }, 3000);
        } catch (err) {
            console.error('🔥 Error during registration:', err);
            setActivePopup({
                message: t('alerts.registerError'),
                variant: 'warning',
            });
        } finally {
            setLoading(false);
        }
    };

    const showNextPopup = (messages: string | any[]) => {
        if (messages.length === 0) return;
        const [first, ...rest] = messages;
        setActivePopup({ message: first, variant: 'warning' });
        setTimeout(() => {
            setActivePopup(null);
            showNextPopup(rest);
        }, 4000);
    };

    return (
        <View style={styles.wrapper}>
            {loading && <Loading />}
            {activePopup && (
                <Popup
                    message={activePopup.message}
                    variant={activePopup.variant}
                    onClose={() => setActivePopup(null)}
                />
            )}

            <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
                <Animated.View entering={FadeInDown.duration(800)} style={styles.logoSection}>
                    <Image source={require('../assets/images/dark-logo.png')} style={styles.logo} />
                </Animated.View>

                <Animated.View entering={FadeInUp.duration(1000)} style={styles.card}>
                    <View style={styles.formColumn}>
                        <FormInput id="name" label={t('register.name') + ' *'} value={formData.name} onChangeText={(val) => handleChange('name', val)} placeholder={t('register.namePlaceholder')} required />
                        <FormInput id="surname" label={t('register.surname') + ' *'} value={formData.surname} onChangeText={(val) => handleChange('surname', val)} placeholder={t('register.surnamePlaceholder')} required />
                        <FormInput id="email" label={t('register.email') + ' *'} value={formData.email} onChangeText={(val) => handleChange('email', val)} placeholder={t('register.emailPlaceholder')} required type="email-address" />
                        <PhoneNumberPicker label={t('register.phone')} value={{ phoneNumber: formData.phoneNumber, countryCode: formData.countryCode }} onChange={({ phoneNumber, countryCode }) => setFormData((prev) => ({ ...prev, phoneNumber, countryCode }))} />
                        <CountryPicker value={formData.countryIso} onChange={({ countryIso, countryName }) => setFormData((prev) => ({ ...prev, countryIso, country: countryName, city: '' }))} />
                        <CityPicker countryIso={formData.countryIso} value={formData.city} onChange={(val) => handleChange('city', val)} disabled={!formData.countryIso} />
                        <FormInput id="password" label={t('register.password') + ' *'} value={formData.password} onChangeText={(val) => handleChange('password', val)} placeholder={t('register.passwordPlaceholder')} secure required />
                        <FormInput id="retypePassword" label={t('register.retypePassword') + ' *'} value={formData.retypePassword} onChangeText={(val) => handleChange('retypePassword', val)} placeholder={t('register.retypePasswordPlaceholder')} secure required />
                    </View>

                    <Button onPress={handleSubmit} variant="beige" style={styles.button}>
                        {t('register.register')}
                    </Button>

                    <View style={styles.loginRow}>
                        <Text style={styles.loginText}>{t('register.already')}</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                            <Text style={styles.loginLink}>{t('register.loginHere')}</Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </ScrollView>
        </View>
    );
};

export default RegisterScreen;

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        backgroundColor: Colors.beige,
    },
    container: {
        padding: 24,
        alignItems: 'center',
    },
    logoSection: {
        paddingVertical: 24,
        alignItems: 'center',
    },
    logo: {
        width: 150,
        height: 60,
        resizeMode: 'contain',
    },
    card: {
        backgroundColor: Colors.red,
        borderRadius: 24,
        padding: 24,
        width: '100%',
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowOffset: { width: 0, height: 8 },
        shadowRadius: 20,
        elevation: 10,
    },
    formColumn: {
        width: '100%'
    },
    loginRow: {
        marginTop: 24,
        alignItems: 'center',
        gap: 4,
    },
    loginText: {
        color: Colors.white,
        fontSize: 16,
        fontFamily: 'CormorantGaramond-Regular',
    },
    loginLink: {
        fontSize: 18,
        color: Colors.white,
        fontWeight: '600',
        fontFamily: 'CormorantGaramond-Regular',
        textDecorationLine: 'underline',
    },
    button: {
        marginTop: 15
    }
});