import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    ScrollView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import PhoneNumberPicker from '@/components/PhoneNumberPicker';
import CountryPicker from '@/components/CountryPicker';
import CityPicker from '@/components/CityPicker';
import FormInput from '@/components/FormInput';
import Button from '@/components/Button';
import Title from '@/components/Title';
import Popup from '@/components/Popup';
import Loading from '@/components/Loading';
import Colors from '@/constants/Colors';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { ImageInfo } from 'expo-image-picker/build/ImagePicker.types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import translatedCountries from '@/assets/locales/translatedCountries.json';
import { TouchableOpacity } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '@/types/navigation';
import { getApiBaseUrl } from '@/api/config';

const ManageProfileScreen: React.FC = () => {
    const insets = useSafeAreaInsets();
    const { t } = useTranslation();
    const { user } = useAuth();
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();

    const [userData, setUserData] = useState<any>(null);
    const [formData, setFormData] = useState({
        name: '', surname: '', email: '',
        phoneNumber: '', phoneCountryIso: '',
        country: '', city: '',
    });

    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [profilePhoto, setProfilePhoto] = useState<ImageInfo | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [popup, setPopup] = useState<null | { message: string; variant: 'success' | 'warning' | 'error' }>(null);
    const [showAlert, setShowAlert] = useState(false);

    const baseUrl = getApiBaseUrl();

    const fetchProfileData = async () => {
        try {
            const baseUrl = await getApiBaseUrl();
            const res = await fetch(`${baseUrl}/auth/me`, {
                headers: { Authorization: `Bearer ${user.token}` },
            });
            const data = await res.json();
            setUserData(data);
            setFormData({
                name: data.Name || '',
                surname: data.Surname || '',
                email: data.Email || '',
                phoneNumber: data.PhoneNumber || '',
                phoneCountryIso: data.CountryIso || '',
                country: data.Country || '',
                city: data.City || '',
            });
            setPhotoPreview(data.ProfilePictureUrl || null);
        } catch {
            setPopup({ message: t('manageProfile.fetchError'), variant: 'error' });
        }
    };

    useEffect(() => {
        if (user?.token) fetchProfileData();
    }, [user]);

    const handlePhotoChange = async () => {
        const res = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });
        if (!res.canceled && res.assets[0]) {
            setPhotoPreview(res.assets[0].uri);
            setProfilePhoto(res.assets[0]);
        }
    };

    const handleSaveChanges = async () => {
        try {
            setShowAlert(true);
            setIsSaving(true);

            let profilePictureUrl = userData?.ProfilePictureUrl;

            if (profilePhoto) {
                const form = new FormData();
                form.append('file', {
                    uri: profilePhoto.uri,
                    type: 'image/jpeg',
                    name: 'profile.jpg',
                } as any);

                const uploadRes = await fetch(`${baseUrl}/upload/profile-picture`, {
                    method: 'POST',
                    body: form,
                });
                const uploadData = await uploadRes.json();
                profilePictureUrl = uploadData.url;
            }

            const saveRes = await fetch(`${baseUrl}/auth/me`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.token}`,
                },
                body: JSON.stringify({
                    Name: formData.name,
                    Surname: formData.surname,
                    Email: formData.email,
                    PhoneNumber: formData.phoneNumber,
                    CountryIso: formData.phoneCountryIso,
                    Country: formData.country,
                    City: formData.city,
                    ProfilePictureUrl: profilePictureUrl,
                }),
            });

            if (!saveRes.ok) throw new Error();

            setPopup({ message: t('manageProfile.saveSuccess'), variant: 'success' });
            const saveData = await saveRes.json();
            setUserData(saveData.user);
        } catch {
            setPopup({ message: t('manageProfile.saveError'), variant: 'error' });
        } finally {
            setIsSaving(false);
            setShowAlert(false);
        }
    };

    if (!user) return null;
    const reviewCount = userData?._count?.reviews || 0;

    return (
        <>
            {popup && <Popup {...popup} onClose={() => setPopup(null)} />}
            <ScrollView contentContainerStyle={[styles.container, { paddingTop: insets.top }]}>
                {showAlert && <Loading />}
                <Title>{t('profile.accountInfo')}</Title>

                <View style={styles.photoSection}>
                    <View style={styles.photoPlaceholder}>
                        {photoPreview ? (
                            <Image source={{ uri: photoPreview }} style={styles.photoPreview} />
                        ) : (
                            <Icon name="account" size={64} color={Colors.red} />
                        )}
                    </View>

                    <Button variant="red-small" onPress={handlePhotoChange}>
                        {t('buttons.choosePhoto')}
                    </Button>

                    <View style={styles.medals}>
                        {[{ threshold: 1, color: '#cd7f32' }, { threshold: 11, color: '#c0c0c0' }, { threshold: 26, color: '#ffd700' }, { threshold: 51, color: '#00bfff' }].map((m, i) => (
                            <Icon
                                key={i}
                                name={i < 3 ? 'medal' : 'diamond-stone'}
                                size={28}
                                color={m.color}
                                style={{ opacity: reviewCount >= m.threshold ? 1 : 0.3 }}
                            />
                        ))}
                    </View>

                    <Text style={styles.reviewCount}>
                        {t('labels.reviewCount', { count: reviewCount })}
                    </Text>
                </View>

                <View style={styles.formGrid}>
                    <FormInput label={t('register.name')} value={formData.name} onChangeText={(v) => setFormData({ ...formData, name: v })} id="" />
                    <FormInput label={t('register.surname')} value={formData.surname} onChangeText={(v) => setFormData({ ...formData, surname: v })} id="" />
                    <FormInput label={t('register.email')} value={formData.email} onChangeText={(v) => setFormData({ ...formData, email: v })} id="" />

                    <PhoneNumberPicker
                        label={t('register.phone')}
                        value={{
                            phoneNumber: formData.phoneNumber,
                            countryIso: formData.phoneCountryIso,
                        }}
                        onChange={({ phoneNumber, countryIso }) =>
                            setFormData({ ...formData, phoneNumber, phoneCountryIso: countryIso })}
                    />

                    <CountryPicker
                        value={translatedCountries.find(c => c.name === formData.country)?.isoCode || ''}
                        onChange={({ countryIso, countryName }) =>
                            setFormData({ ...formData, country: countryName, city: '' })}
                    />

                    <CityPicker
                        countryIso={translatedCountries.find(c => c.name === formData.country)?.isoCode || ''}
                        value={formData.city}
                        onChange={(city) => setFormData({ ...formData, city })}
                    />
                </View>

                <TouchableOpacity onPress={() => navigation.navigate('ChangePassword')}>
                    <Text style={styles.changePasswordLink}>
                        {t('profile.changePassword')}
                    </Text>
                </TouchableOpacity>

                <Button variant="red" onPress={handleSaveChanges}>
                    {isSaving ? t('buttons.saving') : t('buttons.saveChanges')}
                </Button>
            </ScrollView>
        </>
    );
};

export default ManageProfileScreen;

const styles = StyleSheet.create({
    container: {
        padding: 24,
        gap: 24,
    },
    photoSection: {
        alignItems: 'center',
        gap: 12,
    },
    photoPlaceholder: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: Colors.beige,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    photoPreview: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    medals: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 6,
    },
    reviewCount: {
        color: Colors.beige,
        fontFamily: 'CormorantGaramond-Regular',
        fontSize: 16,
    },
    formGrid: {
        flexDirection: 'column'
    },
    changePasswordLink: {
        fontSize: 18,
        color: Colors.beige,
        fontFamily: 'CormorantGaramond-Regular',
        textDecorationLine: 'underline',
        textAlign: 'center',
        marginTop: -15
    },
});