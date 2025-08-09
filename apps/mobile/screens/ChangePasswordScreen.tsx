import React, { useState } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Text,
    TouchableOpacity
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '@/types/navigation';
import { useAuth } from '@/context/AuthContext';
import FormInput from '@/components/FormInput';
import Title from '@/components/Title';
import Popup from '@/components/Popup';
import Button from '@/components/Button';
import Loading from '@/components/Loading';
import { validateFields } from '@/utils/validators';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getApiBaseUrl } from '@/api/config';

const ChangePasswordScreen = () => {
    const insets = useSafeAreaInsets();
    const { t } = useTranslation();
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const { user } = useAuth();

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [retypePassword, setRetypePassword] = useState('');
    const [popup, setPopup] = useState<null | { message: string; variant: 'success' | 'error' }>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        const validationErrors = validateFields(
            { password: newPassword, retypePassword },
            t
        );

        if (Object.keys(validationErrors).length > 0) {
            const firstError = validationErrors.password || validationErrors.retypePassword;
            setPopup({ message: firstError, variant: 'error' });
            return;
        }

        setLoading(true);
        try {
            const baseUrl = getApiBaseUrl();
            const res = await fetch(`${baseUrl}/auth/change-password`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.token}`,
                },
                body: JSON.stringify({
                    currentPassword,
                    newPassword,
                    confirmPassword: retypePassword,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setPopup({
                    message: data.error || t('changePassword.error'),
                    variant: 'error',
                });
                return;
            }

            setPopup({
                message: t('changePassword.success'),
                variant: 'success',
            });

            setCurrentPassword('');
            setNewPassword('');
            setRetypePassword('');

            setTimeout(() => navigation.navigate('ManageProfile'), 2000);
        } catch (err) {
            console.error(err);
            setPopup({
                message: t('changePassword.unexpected'),
                variant: 'error',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {popup && <Popup {...popup} onClose={() => setPopup(null)} />}
            {loading && <Loading />}

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={[styles.container, { paddingTop: insets.top }]} keyboardShouldPersistTaps="handled">
                    <Title>{t('changePassword.title')}</Title>

                    <Animated.View entering={FadeInUp.duration(800)} style={styles.form}>
                        <FormInput
                            id="currentPassword"
                            label={t('changePassword.current')}
                            value={currentPassword}
                            onChangeText={setCurrentPassword}
                            placeholder={t('changePassword.currentPlaceholder')}
                            secure
                        />
                        <FormInput
                            id="newPassword"
                            label={t('changePassword.new')}
                            value={newPassword}
                            onChangeText={setNewPassword}
                            placeholder={t('changePassword.newPlaceholder')}
                            secure
                        />
                        <FormInput
                            id="retypePassword"
                            label={t('changePassword.retype')}
                            value={retypePassword}
                            onChangeText={setRetypePassword}
                            placeholder={t('changePassword.retypePlaceholder')}
                            secure
                        />

                        <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
                            <Text style={styles.forgotLink}>
                                {t('changePassword.forgot')}
                            </Text>
                        </TouchableOpacity>

                        <Button variant="red" onPress={handleSubmit}>
                            {t('changePassword.button')}
                        </Button>
                    </Animated.View>
                </ScrollView>
            </KeyboardAvoidingView>
        </>
    );
};

export default ChangePasswordScreen;

const styles = StyleSheet.create({
    container: {
        padding: 24,
        alignItems: 'center',
        gap: 20,
    },
    form: {
        width: '100%',
        maxWidth: 500,
        gap: 12,
    },
    forgotLink: {
        textAlign: 'right',
        width: '100%',
        fontSize: 18,
        color: '#fff',
        textDecorationLine: 'underline',
        fontFamily: 'CormorantGaramond-Regular',
        marginTop: -4,
        marginBottom: 12,
    },
});