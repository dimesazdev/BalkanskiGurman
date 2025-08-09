import React, { useState } from 'react';
import {
    View,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import Animated, { FadeInUp } from 'react-native-reanimated';

import Title from '../components/Title';
import FormInput from '../components/FormInput';
import Button from '../components/Button';
import Popup from '../components/Popup';
import { RootStackParamList } from '../types/navigation';
import { getApiBaseUrl } from '@/api/config';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Loading from '@/components/Loading';

type PopupState = {
    message: string;
    variant: 'success' | 'error';
} | null;

const ForgotPasswordScreen = () => {
    const insets = useSafeAreaInsets();
    const { t, i18n } = useTranslation();
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [popup, setPopup] = useState<PopupState>(null);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const baseUrl = await getApiBaseUrl();

            const res = await fetch(`${baseUrl}/auth/request-password-reset`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    language: i18n.language
                }),
            });

            await res.json();

            setPopup({
                message: t('forgotPassword.success'),
                variant: 'success'
            });

            setEmail('');
            setTimeout(() => {
                navigation.navigate('Login');
            }, 3000);
        } catch (err) {
            console.error(err);
            setPopup({
                message: t('forgotPassword.error'),
                variant: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={[styles.wrapper, { paddingTop: insets.top }]}>
            {popup && (
                <Popup
                    message={popup.message}
                    variant={popup.variant}
                    onClose={() => setPopup(null)}
                />
            )}
            {loading && <Loading />}
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={{ flex: 1 }}
            >
                <ScrollView
                    contentContainerStyle={styles.container}
                    keyboardShouldPersistTaps="handled"
                >
                    <Title>{t('forgotPassword.title')}</Title>

                    <Animated.View
                        entering={FadeInUp.duration(800)}
                        style={styles.form}
                    >
                        <FormInput
                            id="email"
                            label={t('forgotPassword.email')}
                            value={email}
                            onChangeText={setEmail}
                            placeholder={t('forgotPassword.emailPlaceholder')}
                            type="email-address"
                        />
                        <Button
                            onPress={handleSubmit}
                            variant="red"
                        >
                            {t('forgotPassword.button')}
                        </Button>
                    </Animated.View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
};

export default ForgotPasswordScreen;

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
    },
    container: {
        padding: 24,
        alignItems: 'center',
    },
    form: {
        width: '100%',
        maxWidth: 500,
        gap: 12,
    },
});