import React, { useEffect, useState } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    Text,
    Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Title from '@/components/Title';
import FormSelect from '@/components/FormSelect';
import FormTextarea from '@/components/FormTextarea';
import ImagePicker from '@/components/ImagePicker';
import Button from '@/components/Button';
import Popup from '@/components/Popup';
import Loading from '@/components/Loading';
import RestaurantSelector from '@/components/RestaurantSelector';
import ScreenBackground from '@/components/ScreenBackground';

import { useAuth } from '@/context/AuthContext';
import { RootStackParamList } from '@/types/navigation';

type ImageType = {
    file: {
        uri: string;
        name: string;
        type: string;
    };
    url: string;
}

type RouteParams = RouteProp<RootStackParamList, 'ReportIssue'>;

const ReportIssueScreen: React.FC = () => {
    const insets = useSafeAreaInsets();
    const { t } = useTranslation();
    const { user } = useAuth();
    const navigation = useNavigation();
    const route = useRoute<RouteParams>();

    const [issueType, setIssueType] = useState(route.params?.issueType || '');
    const [explanation, setExplanation] = useState('');
    const [images, setImages] = useState<ImageType[]>([]);
    const [popup, setPopup] = useState<{ message: string; variant: 'success' | 'error' | 'warning' } | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const [restaurants, setRestaurants] = useState([]);
    const [loadingRestaurants, setLoadingRestaurants] = useState(false);
    const [selectedRestaurant, setSelectedRestaurant] = useState<any>(route.params?.restaurant || null);

    const issueOptions = [
        { value: 'Bug Report', label: t('report.issueTypes.bugReport') },
        { value: 'Wrong Info', label: t('report.issueTypes.wrongInfo') },
        { value: 'Other', label: t('report.issueTypes.other') },
    ];

    useEffect(() => {
        if (issueType === 'Wrong Info') {
            setLoadingRestaurants(true);
            fetch('http://192.168.100.31:3001/restaurants')
                .then(res => res.json())
                .then(data => {
                    setRestaurants(data);
                    if (route.params?.restaurantId) {
                        const found = data.find((r: any) => r.RestaurantId === route.params?.restaurantId);
                        if (found) setSelectedRestaurant(found);
                    }
                })
                .catch(console.error)
                .finally(() => setLoadingRestaurants(false));
        }
    }, [issueType]);

    const uploadImages = async () => {
        const filesToUpload = images.filter(img => img.file);
        if (filesToUpload.length === 0) return [];

        const formData = new FormData();
        filesToUpload.forEach(img => {
            formData.append('files', {
                uri: img.file.uri,
                name: 'image.jpg',
                type: 'image/jpeg',
            } as any);
        });

        const res = await fetch('http://192.168.100.31:3001/upload/restaurant-photos', {
            method: 'POST',
            body: formData,
        });

        const data = await res.json();
        return data.urls;
    };

    const handleSubmit = async () => {
        if (!issueType || !explanation.trim()) {
            setPopup({ message: t('report.errorRequired'), variant: 'error' });
            return;
        }

        if (issueType === 'Wrong Info' && !selectedRestaurant) {
            setPopup({ message: t('report.errorRestaurant'), variant: 'error' });
            return;
        }

        setSubmitting(true);

        try {
            const uploadedUrls = await uploadImages();
            const [photo1, photo2, photo3] = uploadedUrls;

            const payload = {
                IssueType: issueType,
                Explanation: explanation,
                PhotoUrl1: photo1 || null,
                PhotoUrl2: photo2 || null,
                PhotoUrl3: photo3 || null,
                RestaurantId: selectedRestaurant?.RestaurantId || null,
            };

            const res = await fetch('http://192.168.100.31:3001/issues', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user?.token}`,
                },
                body: JSON.stringify(payload),
            });

            if (!res.ok) throw new Error();

            setPopup({ message: t('report.success'), variant: 'success' });
            setIssueType('');
            setExplanation('');
            setImages([]);
            setSelectedRestaurant(null);

            setTimeout(() => navigation.goBack(), 2000);
        } catch (error) {
            console.error(error);
            setPopup({ message: t('report.errorSubmit'), variant: 'error' });
        } finally {
            setSubmitting(false);
        }
    };

    if (submitting) return <Loading />;

    return (
        <ScreenBackground>
            {popup && <Popup {...popup} onClose={() => setPopup(null)} />}
            <ScrollView contentContainerStyle={[styles.container, { paddingTop: insets.top }]}>
                <Title style={styles.title}>{t('report.title')}</Title>

                <FormSelect
                    label={t('report.issueType')}
                    value={issueType}
                    onChange={(val) => setIssueType(String(val))}
                    options={issueOptions}
                    placeholder={t('report.selectIssueType')}
                />

                {issueType === 'Wrong Info' && (
                    <View style={styles.selectRestaurant}>
                        <Text style={styles.label}>{t('report.chooseRestaurant')} *</Text>
                        {loadingRestaurants ? (
                            <Text style={styles.loadingText}>Loading restaurants...</Text>
                        ) : (
                            <RestaurantSelector
                                restaurants={restaurants}
                                selectedRestaurant={selectedRestaurant}
                                onSelect={setSelectedRestaurant}
                            />
                        )}
                    </View>
                )}

                <View style={styles.imagePicker}>
                    <Text style={styles.label}>{t('report.addPhotos')}</Text>
                    <ImagePicker images={images} setImages={setImages} maxImages={3} />
                </View>

                <FormTextarea
                    id="explanation"
                    label={t('report.explanation')}
                    value={explanation}
                    onChange={(val) => setExplanation(val)}
                    placeholder={t('report.explanationPlaceholder')}
                    rows={4}
                />

                <Button variant="red" onPress={handleSubmit}>
                    {submitting ? t('report.submitting') : t('report.submit')}
                </Button>
            </ScrollView>
        </ScreenBackground>
    );
};

export default ReportIssueScreen;

const styles = StyleSheet.create({
    container: {
        padding: 24,
        paddingBottom: 60,
    },
    title: {
        textAlign: 'center',
        marginBottom: 12,
    },
    label: {
        color: '#fff',
        fontSize: 18,
        fontFamily: 'CormorantGaramond-Regular',
        marginBottom: 6,
    },
    loadingText: {
        fontStyle: 'italic',
        color: '#fff',
        fontFamily: 'CormorantGaramond-Regular',
    },
    imagePicker: {
        marginBottom: 16,
    },
    selectRestaurant: {
        marginBottom: 16,

    }
});