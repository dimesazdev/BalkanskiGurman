import React, { useEffect, useState } from 'react';
import {
    View,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
} from 'react-native';
import Title from '@/components/Title';
import SearchBar from '@/components/SearchBar';
import SortBar from '@/components/SortBar';
import AdminUserCard from '@/components/admin/AdminUserCard';
import AdminUserPopup from '@/components/admin/AdminUserPopup';
import Popup from '@/components/Popup';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import Colors from '@/constants/Colors';
import { getApiBaseUrl } from '@/api/config';
import ScreenBackground from '@/components/ScreenBackground';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const AdminUsersScreen: React.FC = () => {
    const insets = useSafeAreaInsets();
    const { t } = useTranslation();
    const { user } = useAuth();

    const [users, setUsers] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOption, setSortOption] = useState<'newest' | 'oldest' | 'reviewsAsc' | 'reviewsDesc'>('newest');
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended' | 'banned'>('all');
    const [selectedUser, setSelectedUser] = useState<any | null>(null);
    const [popup, setPopup] = useState<{ message: string; variant: 'success' | 'error' } | null>(null);

    const [baseUrl, setBaseUrl] = useState<string | null>(null);

    useEffect(() => {
        getApiBaseUrl().then(setBaseUrl);
    }, []);

    useEffect(() => {
        if (!user?.token || !baseUrl) return;
        fetch(`${baseUrl}/users`, {
            headers: {
                Authorization: `Bearer ${user.token}`,
            },
        })
            .then(res => res.json())
            .then(setUsers)
            .catch(console.error);
    }, [user, baseUrl]);

    const filtered = users
        .filter((u) => statusFilter === 'all' || u.status?.Name?.toLowerCase() === statusFilter)
        .filter((u) => {
            const name = `${u.Name} ${u.Surname}`.toLowerCase();
            return name.includes(searchTerm.toLowerCase()) || u.Email.toLowerCase().includes(searchTerm.toLowerCase());
        })
        .sort((a, b) => {
            if (sortOption === 'newest') return new Date(b.CreatedAt).getTime() - new Date(a.CreatedAt).getTime();
            if (sortOption === 'oldest') return new Date(a.CreatedAt).getTime() - new Date(b.CreatedAt).getTime();
            if (sortOption === 'reviewsAsc') return (a._count?.reviews || 0) - (b._count?.reviews || 0);
            if (sortOption === 'reviewsDesc') return (b._count?.reviews || 0) - (a._count?.reviews || 0);
            return 0;
        });

    const handleStatusChange = async (userId: string, statusId: number) => {
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
            const updated = await res.json();

            const statusMap: Record<1 | 2 | 3, { Name: string }> = {
                1: { Name: 'Active' },
                2: { Name: 'Suspended' },
                3: { Name: 'Banned' },
            };

            const mergedUser = {
                ...updated,
                status: statusMap[updated.StatusId as 1 | 2 | 3],
            };

            setUsers((prev) => prev.map((u) => (u.UserId === userId ? { ...u, ...mergedUser } : u)));
            setSelectedUser((prev: any) => (prev?.UserId === userId ? { ...prev, ...mergedUser } : prev));

            setPopup({ message: t('adminUser.statusUpdated'), variant: 'success' });
        } catch {
            setPopup({ message: t('adminUser.statusUpdateFailed'), variant: 'error' });
        }
    };

    const statuses = ['all', 'active', 'suspended', 'banned'] as const;
    type StatusKey = typeof statuses[number];

    return (
        <ScreenBackground>
            <ScrollView contentContainerStyle={[styles.container, { paddingTop: insets.top }]}>
                {popup && <Popup {...popup} onClose={() => setPopup(null)} />}
                <Title>{t('labels.users')}</Title>

                <View style={styles.filterRow}>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.statusFilterRow}
                    >
                        {statuses.map((status: StatusKey) => {
                            const baseStyle = styles.statusButton;
                            const bgStyle = status !== 'all' ? styles[status] : undefined;
                            const activeStyle = status !== 'all' && statusFilter === status
                                ? styles[`active_${status}` as keyof typeof styles]
                                : undefined;

                            return (
                                <TouchableOpacity
                                    key={status}
                                    style={[baseStyle, bgStyle, activeStyle] as any}
                                    onPress={() => setStatusFilter(status)}
                                >
                                    <Text
                                        style={[
                                            styles.statusButtonText,
                                            status !== 'all' && statusFilter === status
                                                ? styles.activeStatusButtonText
                                                : null,
                                        ] as any}
                                    >
                                        {t(`userStatus.${status}`)}
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
                        sortOptions={['newest', 'oldest', 'reviewsAsc', 'reviewsDesc']}
                        selected={sortOption}
                        onSelect={(option) => setSortOption(option as any)}
                        t={t}
                    />
                    <Text style={styles.userCount}>{t('labels.users', { count: filtered.length })}</Text>
                </View>

                <View style={styles.userList}>
                    {filtered.map((user) => (
                        <AdminUserCard key={user.UserId} user={user} onManage={() => setSelectedUser(user)} />
                    ))}
                </View>

                {selectedUser && (
                    <AdminUserPopup
                        user={selectedUser}
                        visible={true}
                        onClose={() => setSelectedUser(null)}
                        onAction={(actionType, userId) => {
                            const statusMap = { activate: 1, suspend: 2, ban: 3 };
                            handleStatusChange(userId, statusMap[actionType as keyof typeof statusMap]);
                        }}
                    />
                )}
            </ScrollView>
        </ScreenBackground>
    );
};

export default AdminUsersScreen;

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
    active_active: { backgroundColor: '#2e7d32' },
    active_suspended: { backgroundColor: '#ef6c00' },
    active_banned: { backgroundColor: '#c62828' },
    activeStatusButtonText: {
        color: '#fff',
        fontWeight: '700',
    },
    active: { backgroundColor: '#c8e6c9' },
    suspended: { backgroundColor: '#ffe0b2' },
    banned: { backgroundColor: '#ffcdd2' },
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
    userCount: {
        fontSize: 16,
        fontFamily: 'CormorantGaramond-Regular',
        color: Colors.beige,
    },
    userList: {
        gap: 16,
    },
});