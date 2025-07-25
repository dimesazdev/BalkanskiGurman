import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    Alert,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    TouchableOpacity,
} from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import Popup from '../components/Popup';
import Colors from '../constants/Colors';
import { RootStackParamList } from '../types/navigation';
import FormInput from '@/components/FormInput';
import { getApiBaseUrl } from '@/api/config';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type PopupState = {
    message: string;
    variant: 'error' | 'success';
} | null;

const LoginScreen = () => {
    const insets = useSafeAreaInsets();
    const { t } = useTranslation();
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const { login } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [popup, setPopup] = useState<PopupState>(null);

    const handleSubmit = async () => {
        try {
            const baseUrl = await getApiBaseUrl();
            const res = await fetch(`${baseUrl}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                let message = t('login.loginFailed');

                if (res.status === 401) {
                    message = t('login.invalidCredentials');
                } else if (res.status === 403) {
                    if (data.code === 'BANNED_ACCOUNT') {
                        message = t('login.banned');
                    } else if (data.error?.includes('confirm your email')) {
                        message = t('login.emailNotConfirmed');
                    } else {
                        message = data.error;
                    }
                }

                setPopup({ message, variant: 'error' });
                return;
            }

            login({ ...data.user, token: data.token });
            navigation.navigate('Home');
        } catch (err) {
            setPopup({ message: t('login.somethingWentWrong'), variant: 'error' });
        }
    };

    return (
        <View style={styles.wrapper}>
            {popup && (
                <Popup
                    message={popup.message}
                    variant={popup.variant}
                    onClose={() => setPopup(null)}
                />
            )}
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView
                    contentContainerStyle={[styles.container, { paddingTop: insets.top }]}
                    keyboardShouldPersistTaps="handled"
                >
                    <Animated.View entering={FadeInDown.duration(800)} style={styles.logoSection}>
                        <Image source={require('../assets/images/dark-logo.png')} style={styles.logo} />
                    </Animated.View>

                    <Animated.View entering={FadeInUp.duration(1000)} style={styles.card}>
                        <FormInput
                            id="email"
                            label={t('login.email')}
                            value={email}
                            onChangeText={setEmail}
                            placeholder="john.doe@gmail.com"
                            type="email-address"
                        />

                        <FormInput
                            id="password"
                            label={t('login.password')}
                            value={password}
                            onChangeText={setPassword}
                            placeholder="••••••••"
                            secure
                        />

                        <View style={styles.formOptions}>
                            <TouchableOpacity
                                style={styles.checkboxContainer}
                                onPress={() => setRememberMe(!rememberMe)}
                            >
                                <View style={styles.checkbox}>
                                    {rememberMe && <Text style={styles.checkmark}>✓</Text>}
                                </View>
                                <Text style={styles.checkboxLabel}>{t('login.rememberMe')}</Text>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
                                <Text style={styles.forgotPassword}>{t('login.forgotPassword')}</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.buttonGroup}>
                            <Button variant="beige" onPress={handleSubmit}>
                                {t('login.login')}
                            </Button>

                            <TouchableOpacity
                                style={styles.googleBtn}
                                onPress={() => Alert.alert('Google auth not supported in native app')}
                            >
                                <Text style={styles.googleBtnText}>{t('login.continueWithGoogle')}</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.loginRow}>
                            <Text style={styles.loginText}>{t('login.noAccount')}</Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                                <Text style={styles.loginLink}>{t('login.registerNow')}</Text>
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
};

export default LoginScreen;

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
        height: 100,
        marginBottom: 15,
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
    formOptions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
        alignItems: 'center',
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 4,
        backgroundColor: Colors.beige,
        marginRight: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkmark: {
        color: Colors.red,
        fontSize: 16,
        fontWeight: 'bold',
        lineHeight: 20,
    },
    checkboxLabel: {
        fontSize: 16,
        color: Colors.beige,
        fontFamily: 'CormorantGaramond-Regular',
    },
    forgotPassword: {
        fontSize: 16,
        color: Colors.beige,
        textDecorationLine: 'underline',
        fontFamily: 'CormorantGaramond-Regular',
    },
    buttonGroup: {
        gap: 12,
        marginTop: 16,
    },
    googleBtn: {
        height: 48,
        borderRadius: 20,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    googleBtnText: {
        color: '#000',
        fontFamily: 'CormorantGaramond-Regular',
        fontSize: 16,
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
});