import React, { useEffect, useState } from 'react';
import {
    View,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity
} from 'react-native';
import Title from '@/components/Title';
import SearchBar from '@/components/SearchBar';
import SortBar from '@/components/SortBar';
import AdminReviewCard from '@/components/admin/AdminReviewCard';
import AdminReviewPopup from '@/components/admin/AdminReviewPopup';
import Popup from '@/components/Popup';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import Colors from '@/constants/Colors';
import { getApiBaseUrl } from '@/api/config';
import ScreenBackground from '@/components/ScreenBackground';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const AdminReviewsScreen = () => {
    const insets = useSafeAreaInsets();
    const { t } = useTranslation();
    const { user } = useAuth();

    const [reviews, setReviews] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOption, setSortOption] = useState<'rating' | 'newest' | 'oldest'>('newest');
    const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'recheck'>('all');
    const [selectedReview, setSelectedReview] = useState<any | null>(null);
    const [popup, setPopup] = useState<{ message: string; variant: 'success' | 'error' } | null>(null);

    const [baseUrl, setBaseUrl] = useState<string | null>(null);

    useEffect(() => {
        getApiBaseUrl().then(url => {
            setBaseUrl(url);
        });
    }, []);

    useEffect(() => {
        if (!user?.token || !baseUrl) return;

        fetch(`${baseUrl}/reviews`, {
            headers: {
                Authorization: `Bearer ${user.token}`,
            },
        })
            .then((res) => res.json())
            .then((data) => setReviews(data))
            .catch(console.error);
    }, [user, baseUrl]);

    const filtered = reviews
        .filter((r) => statusFilter === 'all' || r.status?.Name?.toLowerCase() === statusFilter)
        .filter((r) =>
            searchTerm.trim() === '' || r.Comment?.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .sort((a, b) => {
            if (sortOption === 'rating') return b.Rating - a.Rating;
            if (sortOption === 'newest') return new Date(b.CreatedAt).getTime() - new Date(a.CreatedAt).getTime();
            if (sortOption === 'oldest') return new Date(a.CreatedAt).getTime() - new Date(b.CreatedAt).getTime();
            return 0;
        });

    const handleReviewAction = async (action: string, reviewId: number) => {
        try {
            const res = await fetch(`${baseUrl}/reviews/${reviewId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user?.token}`,
                },
                body: JSON.stringify({ action }),
            });

            if (!res.ok) throw new Error();
            const updatedReview = await res.json();

            setReviews((prev) =>
                prev.map((r) =>
                    r.ReviewId === reviewId ? { ...r, status: updatedReview.status, StatusId: updatedReview.StatusId } : r
                )
            );

            setSelectedReview((prev: { ReviewId: number; }) =>
                prev && prev.ReviewId === reviewId
                    ? { ...prev, status: updatedReview.status, StatusId: updatedReview.StatusId }
                    : prev
            );

            setPopup({ message: t(`popup.statusChangeSuccess.${action}`), variant: 'success' });
        } catch {
            setPopup({ message: t(`popup.statusChangeError.${action}`), variant: 'error' });
        }
    };

    const handleUserStatusChange = async (userId: string, statusId: number) => {
        try {
            const res = await fetch(`${baseUrl}/users/${userId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user?.token}`,
                },
                body: JSON.stringify({ StatusId: statusId }),
            });

            if (!res.ok) throw new Error();
            const updatedUser = await res.json();

            setReviews((prev) =>
                prev.map((r) =>
                    r.user.UserId === userId ? { ...r, user: { ...r.user, ...updatedUser } } : r
                )
            );

            setSelectedReview((prev: { user: { UserId: string; }; }) =>
                prev && prev.user.UserId === userId ? { ...prev, user: { ...prev.user, ...updatedUser } } : prev
            );

            setPopup({
                message: t(`popup.statusChangeSuccess.${statusId === 2 ? 'suspend' : 'ban'}`),
                variant: 'success',
            });
        } catch {
            setPopup({
                message: t(`popup.statusChangeError.${statusId === 2 ? 'suspend' : 'ban'}`),
                variant: 'error',
            });
        }
    };

    const statuses = ['all', 'approved', 'pending', 'rejected', 'recheck'] as const;
    type StatusKey = typeof statuses[number];

    return (
        <ScreenBackground>
            {popup && <Popup {...popup} onClose={() => setPopup(null)} />}
            <ScrollView contentContainerStyle={[styles.container, { paddingTop: insets.top }]}>
                <Title>{t('labels.reviews')}</Title>

                <View style={styles.filterRow}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statusFilterRow}>
                        {statuses.map((status: StatusKey) => {
                            const activeStyleKey = `active_${status}` as keyof typeof styles;

                            return (
                                <TouchableOpacity
                                    key={status}
                                    style={[
                                        styles.statusButton,
                                        styles[status],
                                        status !== 'all' && statusFilter === status && styles[activeStyleKey],
                                    ]}
                                    onPress={() => setStatusFilter(status as any)}
                                >
                                    <Text
                                        style={[
                                            styles.statusButtonText,
                                            status !== 'all' && statusFilter === status && styles.activeStatusButtonText,
                                        ]}
                                    >
                                        {t(`reviewStatus.${status}`)}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>

                    <SearchBar
                        placeholder={t('labels.searchByKeyword')}
                        value={searchTerm}
                        onChange={setSearchTerm}
                    />
                </View>

                <View style={styles.sortRow}>
                    <SortBar
                        sortOptions={['rating', 'newest', 'oldest']}
                        selected={sortOption}
                        onSelect={(option) => setSortOption(option as 'rating' | 'newest' | 'oldest')}
                        t={t}
                    />
                    <Text style={styles.reviewCount}>{t('labels.reviewCount', { count: filtered.length })}</Text>
                </View>

                <View style={styles.reviewList}>
                    {filtered.map((review) => (
                        <AdminReviewCard
                            key={review.ReviewId}
                            review={review}
                            onManage={() => setSelectedReview(review)}
                        />
                    ))}
                </View>

                {selectedReview && (
                    <AdminReviewPopup
                        review={selectedReview}
                        visible={true}
                        onClose={() => setSelectedReview(null)}
                        onAction={(actionType, id) => {
                            if (['suspend', 'ban'].includes(actionType)) {
                                const statusMap: Record<'suspend' | 'ban', number> = { suspend: 2, ban: 3 };
                                handleUserStatusChange(id, statusMap[actionType as 'suspend' | 'ban']);
                            } else {
                                handleReviewAction(actionType, Number(id));
                            }
                        }}
                    />
                )}
            </ScrollView>
        </ScreenBackground>
    );
};

export default AdminReviewsScreen;

const styles = StyleSheet.create({
    container: {
        padding: 16,
    },
    filterRow: {
        gap: 16,
        marginBottom: 16,
    },
    statusFilterRow: {
        flexDirection: 'row',
        gap: 10,
        paddingBottom: 6,
    },
    statusButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 14,
        backgroundColor: '#eee',
    },
    active_pending: {
        backgroundColor: '#ef6c00',
    },
    active_approved: {
        backgroundColor: '#2e7d32',
    },
    active_rejected: {
        backgroundColor: '#c62828',
    },
    active_recheck: {
        backgroundColor: '#1565c0',
    },
    activeStatusButtonText: {
        color: '#fff',
        fontWeight: '700',
    },
    pending: { backgroundColor: '#ffe0b2' },
    approved: { backgroundColor: '#c8e6c9' },
    rejected: { backgroundColor: '#ffcdd2' },
    recheck: { backgroundColor: '#bbdefb' },
    statusButtonText: {
        fontSize: 16,
        fontFamily: 'CormorantGaramond-Regular',
        color: '#333',
    },
    sortRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        flexWrap: 'wrap'
    },
    reviewCount: {
        fontSize: 16,
        fontFamily: 'CormorantGaramond-Regular',
        color: Colors.beige,
    },
    reviewList: {
        gap: 16,
    },
});
