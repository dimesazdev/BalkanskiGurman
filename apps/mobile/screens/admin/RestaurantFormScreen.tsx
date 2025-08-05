import React, { useEffect, useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    View,
    Text,
    Pressable,
    Image
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { RootStackParamList } from '@/types/navigation';
import Title from '@/components/Title';
import FormInput from '@/components/FormInput';
import FormSelect from '@/components/FormSelect';
import PhoneNumberPicker from '@/components/PhoneNumberPicker';
import ImagePicker from '@/components/ImagePicker';
import Button from '@/components/Button';
import CountryPicker from '@/components/CountryPicker';
import CityPicker from '@/components/CityPicker';
import FormTextarea from '@/components/FormTextarea';
import MediaGallery from '@/components/MediaGallery';
import ScreenBackground from '@/components/ScreenBackground';
import Colors from '@/constants/Colors';
import { getApiBaseUrl } from '@/api/config';
import { getAmenityIcon } from '@/utils/getAmenityIcon';
import { validateFields } from '@/utils/validators';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import WorkingHoursCardList from '@/components/WorkingHoursCardList';
import { getAllCountries, FlagType } from 'react-native-country-picker-modal';
import Amenities from '@/components/Amenities';
import Alert from '@/components/Alert';
import Popup from '@/components/Popup';
import { parsePhoneNumberFromString, CountryCode } from 'libphonenumber-js';
import { useAuth } from '@/context/AuthContext';
import translatedCountries from '@/assets/locales/translatedCountries.json';

const AMENITY_OPTIONS = [
    { code: 'DELIV', label: 'filters.delivery' },
    { code: 'PARK', label: 'filters.parking' },
    { code: 'PET', label: 'filters.pet' },
    { code: 'CARD', label: 'filters.card' },
    { code: 'KIDS', label: 'filters.kids' },
    { code: 'SMOK', label: 'filters.smoking' },
    { code: 'VEGAN', label: 'filters.vegan' },
    { code: 'VEGE', label: 'filters.vegetarian' },
    { code: 'GLUT', label: 'filters.glutenfree' },
    { code: 'HALAL', label: 'filters.halal' },
];

type ImageType = {
    file: {
        uri: string;
        name: string;
        type: string;
    };
    url: string;
};

type CuisineOption = {
    value: string | number;
    code: string;
};

import type { WorkingHour } from '@/components/WorkingHoursCardList';
import Loading from '@/components/Loading';

type FormDataType = {
    name: string;
    priceRange: string;
    details: string;
    phoneNumber: string;
    website: string;
    menuUrl: string;
    street: string;
    postalCode: string;
    country: string;
    phoneCountryIso: string;
    city: string;
    cuisine: string;
    cuisineOptions: CuisineOption[];
    amenities: string[];
    workingHours: WorkingHour[];
};

export const relationWithOptionalDelete = (createArray: any[], isEdit: boolean) =>
    !createArray || createArray.length === 0
        ? undefined
        : isEdit
            ? { deleteMany: {}, create: createArray }
            : { create: createArray };

const RestaurantFormScreen: React.FC = () => {
    const insets = useSafeAreaInsets();
    const { t } = useTranslation();
    const navigation = useNavigation();
    const route = useRoute<RouteProp<RootStackParamList, 'RestaurantForm'>>();
    const isEdit = !!route.params?.id;
    const { user } = useAuth();
    const [isSaving, setIsSaving] = useState(false);

    const [formData, setFormData] = useState<FormDataType>({
        name: '',
        priceRange: '',
        details: '',
        phoneNumber: '',
        website: '',
        menuUrl: '',
        street: '',
        postalCode: '',
        country: '',
        phoneCountryIso: '',
        city: '',
        cuisine: '',
        cuisineOptions: [],
        amenities: [],
        workingHours: Array.from({ length: 7 }, (_, i) => ({
            DayOfWeek: i + 1,
            OpenHour: '',
            OpenMinute: '',
            CloseHour: '',
            CloseMinute: '',
            IsClosed: false,
        })),
    });

    const ALLOWED_COUNTRY_ISOS = ["SI", "HR", "BA", "RS", "ME", "MK"];

    const [images, setImages] = useState<ImageType[]>([]);
    const [videos, setVideos] = useState<string[]>([]);
    const [videoInput, setVideoInput] = useState('');

    const [popupQueue, setPopupQueue] = useState<string[]>([]);
    const [currentPopup, setCurrentPopup] = useState<string | null>(null);

    const selectedIso = translatedCountries.find(
        c => c.name === formData.country
    )?.isoCode || '';

    useEffect(() => {
        if (!currentPopup && popupQueue.length > 0) {
            const nextMessage = popupQueue[0];
            setCurrentPopup(nextMessage);
            setPopupQueue(prev => prev.slice(1));

            const timer = setTimeout(() => {
                setCurrentPopup(null);
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [popupQueue, currentPopup]);


    const [showNoWorkingHoursAlert, setShowNoWorkingHoursAlert] = useState(false);
    const [showNoAmenitiesAlert, setShowNoAmenitiesAlert] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            const baseUrl = await getApiBaseUrl();

            const cuisinesRes = await fetch(`${baseUrl}/cuisines`);
            const cuisines = await cuisinesRes.json();

            const cuisineOptions = cuisines.map((c: any) => ({
                value: String(c.CuisineId),
                code: c.Code,
            }));

            setFormData(prev => ({ ...prev, cuisineOptions }));

            if (isEdit) {
                const res = await fetch(`${baseUrl}/restaurants/${route.params?.id}`);
                const data = await res.json();

                const inferPhoneDataFromFullNumber = async (fullNumber: string, countryName?: string) => {
                    const allCountries = await getAllCountries(FlagType.FLAT);

                    let iso = '';
                    if (countryName) {
                        iso = getCountryIsoFromCountryName(countryName);
                    }

                    const country = allCountries.find(c => c.cca2 === iso);
                    const callingCode = country?.callingCode?.[0];
                    let stripped = fullNumber;

                    if (callingCode && fullNumber.startsWith(`+${callingCode}`)) {
                        stripped = fullNumber.slice(callingCode.length + 1);
                    }

                    return {
                        phoneNumber: fullNumber,
                        phoneCountryIso: iso,
                        stripped,
                    };
                };

                const phoneData = await inferPhoneDataFromFullNumber(
                    data.PhoneNumber || '',
                    data.address?.Country || ''
                );

                setFormData(prev => ({
                    ...prev,
                    name: data.Name,
                    priceRange: String(data.PriceRange),
                    details: data.Details || '',
                    phoneNumber: phoneData.phoneNumber,
                    phoneCountryIso: phoneData.phoneCountryIso,
                    cuisine: String(data.cuisines?.[0]?.cuisine?.CuisineId || ''),
                    website: data.Website || '',
                    menuUrl: data.MenuUrl || '',
                    street: data.address?.Street || '',
                    postalCode: data.address?.PostalCode || '',
                    country: data.address?.Country || '',
                    city: data.address?.City || '',
                    amenities: data.amenities.map((a: any) => a.amenity.Code),
                    workingHours: data.workingHours || prev.workingHours,
                }));

                if (data.images?.length) {
                    const imageItems: ImageType[] = [];
                    const videoUrls: string[] = [];

                    data.images.forEach((item: any) => {
                        const url = typeof item === 'string' ? item : item.Url;

                        if (url.includes("youtube.com/embed/") || url.includes("youtu.be/")) {
                            videoUrls.push(url);
                        } else {
                            const fileName = url.split('/').pop() || 'image.jpg';
                            const fileType = fileName.endsWith('.png') ? 'image/png' : 'image/jpeg';
                            imageItems.push({
                                file: { uri: url, name: fileName, type: fileType },
                                url,
                            });
                        }
                    });

                    setImages(imageItems);
                    setVideos(videoUrls);
                }

                if (data.videos?.length) {
                    setVideos(data.videos.map((v: any) => v.Url));
                }
            }
        };

        fetchData();
    }, [isEdit, route.params?.id]);

    const handleChange = (field: keyof FormDataType, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleAmenityToggle = (code: string) => {
        setFormData((prev) => ({
            ...prev,
            amenities: prev.amenities.includes(code)
                ? prev.amenities.filter((a) => a !== code)
                : [...prev.amenities, code],
        }));
    };

    const handleWorkingHourChange = (index: number, updated: Partial<WorkingHour>) => {
        setFormData((prev) => {
            const updatedHours = [...prev.workingHours];
            updatedHours[index] = { ...updatedHours[index], ...updated };
            return { ...prev, workingHours: updatedHours };
        });
    };

    const validateForm = async ({ allowNoWorkingHours = false, allowNoAmenities = false } = {}) => {
        if (!formData.name.trim()) {
            setPopupQueue(prev => [...prev, t("formErrors.nameRequired")]);
            return "error";
        }
        if (!formData.priceRange) {
            setPopupQueue(prev => [...prev, t("formErrors.priceRangeRequired")]);
            return "error";
        }
        if (!formData.details.trim()) {
            setPopupQueue(prev => [...prev, t("formErrors.detailsRequired")]);
            return "error";
        }
        if (!formData.phoneNumber || formData.phoneNumber.trim().length < 5) {
            setPopupQueue(prev => [...prev, t("formErrors.phoneRequired")]);
            return "error";
        }
        const parsed = parsePhoneNumberFromString(formData.phoneNumber, formData.phoneCountryIso as CountryCode);
        if (!parsed || !parsed.isValid()) {
            setPopupQueue(prev => [...prev, t("formErrors.phoneInvalid")]);
            return "error";
        }
        if (!formData.cuisine) {
            setPopupQueue(prev => [...prev, t("formErrors.cuisineRequired")]);
            return "error";
        }
        if (!formData.country || !formData.city || !formData.street || !formData.postalCode) {
            setPopupQueue(prev => [...prev, t("formErrors.addressRequired")]);
            return "error";
        }
        if (!isEdit && images.length === 0) {
            setPopupQueue(prev => [...prev, t("formErrors.imageRequired")]);
            return "error";
        }
        if (videos.length > 3) {
            setPopupQueue(prev => [...prev, t("formErrors.max3Videos")]);
            return "error";
        }

        const isEntryEmpty = (entry: WorkingHour) => {
            return (
                entry.IsClosed ||
                (
                    (entry.OpenHour === "" || entry.OpenHour === null) &&
                    (entry.OpenMinute === "" || entry.OpenMinute === null) &&
                    (entry.CloseHour === "" || entry.CloseHour === null) &&
                    (entry.CloseMinute === "" || entry.CloseMinute === null)
                )
            );
        };

        const allEmptyOrClosed = formData.workingHours.every(isEntryEmpty);
        if (!allowNoWorkingHours && allEmptyOrClosed) {
            return "workingHours";
        }

        if (!allowNoAmenities && formData.amenities.length === 0) {
            return "amenities";
        }

        return "valid";
    };

    const uploadImages = async (): Promise<string[]> => {
        const imageFiles = images.filter(img => img.file && !img.url.includes('youtube.com'));
        if (imageFiles.length === 0) return [];

        const formDataObj = new FormData();
        imageFiles.forEach(img => {
            formDataObj.append('files', {
                uri: img.file.uri,
                name: img.file.name,
                type: img.file.type,
            } as any);
        });

        const baseUrl = await getApiBaseUrl();
        const res = await fetch(`${baseUrl}/upload/restaurant-photos`, {
            method: 'POST',
            body: formDataObj,
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        if (!res.ok) throw new Error('Failed to upload images');
        const data = await res.json();
        return data.urls;
    };

    const handleAddVideo = () => {
        if (videos.length >= 3) return;

        const match = videoInput.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/);
        if (match) {
            const embedUrl = `https://www.youtube.com/embed/${match[1]}`;
            if (!videos.includes(embedUrl)) {
                setVideos(prev => [...prev, embedUrl]);
            }
            setVideoInput('');
        } else {
            setPopupQueue(prev => [...prev, t('formErrors.invalidYoutubeLink')]);
        }
    };

    const handleRemoveVideo = (index: number) => {
        setVideos(prev => prev.filter((_, i) => i !== index));
    };

    const getYoutubeThumbnail = (embedUrl: string) => {
        const match = embedUrl.match(/embed\/([^?&]+)/);
        return match ? `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg` : null;
    };

    const getCountryIsoFromCountryName = (countryName: string): string => {
        const match = translatedCountries.find(c => c.name === countryName);
        return match?.isoCode || '';
    };

    const handleSave = async ({ allowNoWorkingHours = false, allowNoAmenities = false } = {}) => {
        const validationResult = await validateForm({ allowNoWorkingHours, allowNoAmenities });
        if (validationResult === "valid") {
            await performSave();
        } else if (validationResult === "workingHours") {
            setShowNoWorkingHoursAlert(true);
        } else if (validationResult === "amenities") {
            setShowNoAmenitiesAlert(true);
        }
    };

    const performSave = async () => {
        try {
            setIsSaving(true);

            const cuisineData = formData.cuisine
                ? [{ cuisine: { connect: { CuisineId: Number(formData.cuisine) } } }]
                : [];

            const amenityData = formData.amenities.map(code => ({
                amenity: { connect: { Code: code } }
            }));

            const uploadedImageUrls = await uploadImages();
            const imageData = uploadedImageUrls.map(url => ({ Url: url }));
            const videoData = videos.map(v => ({ Url: v }));

            const workingHourData = formData.workingHours.map(entry => {
                const isTrulyEmpty =
                    [entry.OpenHour, entry.OpenMinute, entry.CloseHour, entry.CloseMinute]
                        .every(val => val === "" || val === null || val === undefined);

                const isClosed = entry.IsClosed || isTrulyEmpty;

                return {
                    DayOfWeek: entry.DayOfWeek,
                    IsClosed: isClosed,
                    OpenHour: isClosed ? null : Number(entry.OpenHour),
                    OpenMinute: isClosed ? null : Number(entry.OpenMinute),
                    CloseHour: isClosed ? null : Number(entry.CloseHour),
                    CloseMinute: isClosed ? null : Number(entry.CloseMinute),
                };
            });

            const baseUrl = await getApiBaseUrl();
            const payload = {
                Name: formData.name,
                PriceRange: Number(formData.priceRange),
                Details: formData.details,
                PhoneNumber: formData.phoneNumber,
                Website: formData.website,
                MenuUrl: formData.menuUrl,
                cuisines: relationWithOptionalDelete(cuisineData, isEdit),
                amenities: relationWithOptionalDelete(amenityData, isEdit),
                workingHours: relationWithOptionalDelete(workingHourData, isEdit),
                images: relationWithOptionalDelete([...imageData, ...videoData], isEdit),
                address: isEdit
                    ? {
                        update: {
                            Street: formData.street,
                            PostalCode: formData.postalCode,
                            City: formData.city,
                            Country: formData.country
                        }
                    }
                    : {
                        create: {
                            Street: formData.street,
                            PostalCode: formData.postalCode,
                            City: formData.city,
                            Country: formData.country
                        }
                    }
            };

            const res = await fetch(`${baseUrl}/restaurants${isEdit ? `/${route.params?.id}` : ''}`, {
                method: isEdit ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.token}`
                },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                throw new Error('API request failed');
            }

            setPopupQueue(prev => [...prev, t("alerts.restaurantUpdated")]);
            navigation.goBack();
        } catch (err) {
            setPopupQueue(prev => [...prev, t("alerts.restaurantError")]);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <ScreenBackground>
            {currentPopup && (
                <Popup
                    message={currentPopup}
                    onClose={() => setCurrentPopup(null)}
                />
            )}
            {showNoWorkingHoursAlert && (
                <Alert
                    message={t("formErrors.noWorkingHoursConfirm")}
                    buttonText={t("buttons.confirm")}
                    onButtonClick={() => {
                        setShowNoWorkingHoursAlert(false);
                        handleSave({ allowNoWorkingHours: true });
                    }}
                    onClose={() => setShowNoWorkingHoursAlert(false)}
                    cancelText={t("buttons.cancel")}
                />
            )}
            {showNoAmenitiesAlert && (
                <Alert
                    message={t("formErrors.noAmenitiesConfirm")}
                    buttonText={t("buttons.confirm")}
                    onButtonClick={() => {
                        setShowNoAmenitiesAlert(false);
                        handleSave({ allowNoWorkingHours: true, allowNoAmenities: true });
                    }}
                    onClose={() => setShowNoAmenitiesAlert(false)}
                    cancelText={t("buttons.cancel")}
                />
            )}
            {isSaving && <Loading />}
            <ScrollView contentContainerStyle={[styles.container, { paddingTop: insets.top }]}>
                <Title>{t("form.restaurantDetails")}</Title>
                <FormInput label={t('restaurantForm.labels.restaurantName')} value={formData.name} onChangeText={(val) => handleChange('name', val)} id={''} placeholder={t("placeholders.restaurantName")} />
                <FormSelect label={t('restaurantForm.labels.priceRange')} value={formData.priceRange} onChange={(val) => handleChange('priceRange', val)} options={[{ label: '5–10€', value: '1' }, { label: '10–20€', value: '2' }, { label: '20€+', value: '3' }]} placeholder={t("form.selectPrice")} />
                <FormTextarea label={t('restaurantForm.labels.details')} value={formData.details} onChange={(val) => handleChange('details', val)} id={''} placeholder={t("placeholders.restaurantDetails")} />
                <PhoneNumberPicker
                    value={{
                        phoneNumber: formData.phoneNumber,
                        countryIso: formData.phoneCountryIso,
                    }}
                    onChange={({ phoneNumber, countryIso }) =>
                        setFormData(prev => ({
                            ...prev,
                            phoneNumber,
                            phoneCountryIso: countryIso,
                        }))
                    }
                    label={t('register.phone')}
                    required
                    defaultIso={getCountryIsoFromCountryName(formData.country)}
                    allowedIsoCodes={ALLOWED_COUNTRY_ISOS}
                />
                <FormSelect
                    label={t("restaurantForm.labels.cuisine")}
                    value={formData.cuisine}
                    onChange={(val) => handleChange('cuisine', String(val))}
                    options={(formData.cuisineOptions || []).map(option => ({
                        value: option.value,
                        label: t(`cuisines.${option.code}`),
                    }))}
                    placeholder={t("form.selectCuisine")}
                />

                <FormInput label={t('restaurantForm.labels.website')} value={formData.website} onChangeText={(val) => handleChange('website', val)} id={''} placeholder={t("restaurantForm.placeholder.website")} />
                <FormInput label={t('restaurantForm.labels.menuUrl')} value={formData.menuUrl} onChangeText={(val) => handleChange('menuUrl', val)} id={''} placeholder={t("restaurantForm.placeholder.menuUrl")} />

                {/* Section 2: Media Gallery */}
                <Title>{t('form.mediaGallery')}</Title>
                <ImagePicker images={images} setImages={setImages} maxImages={10} style={{ justifyContent: 'center', marginBottom: 16 }} />

                <View style={{ marginBottom: 16 }}>
                    <FormInput
                        label={t('form.youtubeVideoUrl')}
                        value={videoInput}
                        onChangeText={setVideoInput}
                        id={'video-url'}
                        placeholder="https://www.youtube.com/watch?v=..."
                    />
                    <Button variant="red" onPress={handleAddVideo} disabled={!videoInput}>
                        {t('buttons.add')}
                    </Button>
                </View>

                {videos.length > 0 && (
                    <View style={styles.videoList}>
                        {videos.map((v, i) => {
                            const thumbnail = getYoutubeThumbnail(v);
                            return (
                                <View key={i} style={styles.videoItem}>
                                    {thumbnail && (
                                        <Image
                                            source={{ uri: thumbnail }}
                                            style={styles.videoThumbnail}
                                            resizeMode="cover"
                                        />
                                    )}
                                    <Button variant="red-small" onPress={() => handleRemoveVideo(i)}>
                                        {t('buttons.remove')}
                                    </Button>
                                </View>
                            );
                        })}
                    </View>
                )}

                {/* Section 3: Address */}
                <Title>{t("form.address")}</Title>
                <FormInput label={t('restaurantForm.labels.street')} value={formData.street} onChangeText={(val) => handleChange('street', val)} id={''} placeholder={t("restaurantForm.placeholder.street")} />
                <FormInput label={t('restaurantForm.labels.postalCode')} value={formData.postalCode} onChangeText={(val) => handleChange('postalCode', val)} id={''} placeholder={t("restaurantForm.placeholder.postalCode")} />
                <CountryPicker
                    value={selectedIso}
                    onChange={({ countryIso, countryName }) =>
                        setFormData((prev) => ({
                            ...prev,
                            country: countryName,
                        }))
                    }
                    allowedIsoCodes={ALLOWED_COUNTRY_ISOS}
                />
                <CityPicker
                    countryIso={selectedIso}
                    value={formData.city}
                    onChange={(val) => handleChange('city', val)}
                />

                {/* Section 4: Working Hours */}
                <Title>{t('form.workingHours')}</Title>
                <WorkingHoursCardList
                    workingHours={formData.workingHours}
                    onChange={handleWorkingHourChange}
                />

                {/* Section 5: Amenities */}
                <Title>{t('form.amenities')}</Title>
                <Amenities
                    selected={formData.amenities}
                    onChange={(val) => setFormData(prev => ({ ...prev, amenities: val }))}
                />

                <Button
                    variant="red"
                    onPress={() => handleSave({ allowNoWorkingHours: false, allowNoAmenities: false })}
                >
                    {t('buttons.saveChanges')}
                </Button>
            </ScrollView>
        </ScreenBackground>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
        paddingBottom: 50,
    },
    videoList: {
        gap: 16,
        marginBottom: 24,
    },
    videoItem: {
        backgroundColor: Colors.beige,
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    videoWrapper: {
        width: '100%',
        marginBottom: 8,
    },
    iframePlaceholder: {
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#eee',
        borderRadius: 6,
        padding: 8,
    },
    videoUrlText: {
        fontSize: 14,
        color: '#333',
        fontFamily: 'CormorantGaramond-Regular',
    },
    videoLabel: {
        fontSize: 16,
        fontFamily: 'CormorantGaramond-Bold',
        marginBottom: 6,
    },
    videoThumbnail: {
        width: '100%',
        height: 180,
        borderRadius: 6,
        marginBottom: 8,
    },
});

export default RestaurantFormScreen;