import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Image,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView
} from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import Popup from '../components/Popup';
import Colors from '../constants/Colors';
import { RootStackParamList } from '../types/navigation';
import ScreenBackground from '@/components/ScreenBackground';
import FormInput from '@/components/FormInput';

type PopupState = {
    message: string;
    variant: 'error' | 'success';
} | null;

const LoginScreen = () => {
    const [selected, setSelected] = useState<string | number>('');

    const { t } = useTranslation();
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const { login } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [popup, setPopup] = useState<PopupState>(null);

    const handleSubmit = async () => {
        try {
            const res = await fetch('http://192.168.100.31:3001/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
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
        <ScreenBackground>
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView contentContainerStyle={styles.scrollContainer}>
                    {popup && (
                        <Popup
                            message={popup.message}
                            variant={popup.variant}
                            onClose={() => setPopup(null)}
                        />
                    )}

                    <View style={styles.card}>
                        <View style={styles.leftSide}>
                            <Image source={require('../assets/images/dark-logo.png')} style={styles.logo} />
                            <Text style={styles.registerText}>{t('login.noAccount')}</Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                                <Text style={styles.registerLink}>{t('login.registerNow')}</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.rightSide}>
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
                                type="default"
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
                                    onPress={() => {
                                        Alert.alert('Google auth not supported in native app');
                                    }}
                                >
                                    <Text style={styles.googleBtnText}>{t('login.continueWithGoogle')}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </ScreenBackground>
    );
};

export default LoginScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    card: {
        flexDirection: 'column',
        backgroundColor: '#fff',
        borderRadius: 24,
        overflow: 'hidden',
        width: '100%',
        maxWidth: 500,
    },
    leftSide: {
        backgroundColor: Colors.beige,
        alignItems: 'center',
        padding: 24,
    },
    logo: {
        width: 180,
        height: 60,
        resizeMode: 'contain',
        marginBottom: 16,
    },
    registerText: {
        fontSize: 16,
        fontFamily: 'CormorantGaramond-Regular',
        color: '#000',
    },
    registerLink: {
        fontSize: 16,
        fontFamily: 'CormorantGaramond-Regular',
        textDecorationLine: 'underline',
        color: '#c94b4b',
    },
    rightSide: {
        backgroundColor: Colors.red,
        padding: 24,
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
    checkboxChecked: {
        backgroundColor: '#c94b4b',
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
});