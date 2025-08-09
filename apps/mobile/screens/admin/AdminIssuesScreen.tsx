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
import AdminIssueCard from '@/components/admin/AdminIssueCard';
import AdminIssuePopup from '@/components/admin/AdminIssuePopup';
import Popup from '@/components/Popup';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import Colors from '@/constants/Colors';
import { getApiBaseUrl } from '@/api/config';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const AdminIssuesScreen = () => {
    const insets = useSafeAreaInsets();
    const { t } = useTranslation();
    const { user } = useAuth();

    const [issues, setIssues] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOption, setSortOption] = useState<'issueType' | 'newest' | 'oldest'>('newest');
    const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'resolved'>('all');
    const [selectedIssue, setSelectedIssue] = useState<any | null>(null);
    const [popup, setPopup] = useState<{ message: string; variant: 'success' | 'error' } | null>(null);
    const [baseUrl, setBaseUrl] = useState<string | null>(null);

    useEffect(() => {
        getApiBaseUrl().then(setBaseUrl);
    }, []);

    useEffect(() => {
        if (!user?.token || !baseUrl) return;

        fetch(`${baseUrl}/issues`, {
            headers: {
                Authorization: `Bearer ${user.token}`,
            },
        })
            .then((res) => res.json())
            .then(setIssues)
            .catch(console.error);
    }, [user, baseUrl]);

    const filtered = issues
        .filter((i) => statusFilter === 'all' || i.status?.Name?.toLowerCase() === statusFilter)
        .filter((i) => searchTerm.trim() === '' || i.Explanation?.toLowerCase().includes(searchTerm.toLowerCase()))
        .sort((a, b) => {
            if (sortOption === 'issueType') return a.IssueType.localeCompare(b.IssueType);
            if (sortOption === 'newest') return new Date(b.CreatedAt).getTime() - new Date(a.CreatedAt).getTime();
            if (sortOption === 'oldest') return new Date(a.CreatedAt).getTime() - new Date(b.CreatedAt).getTime();
            return 0;
        });

    const handleResolve = async (issueId: number) => {
        try {
            const res = await fetch(`${baseUrl}/issues/${issueId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user?.token}`,
                },
                body: JSON.stringify({ StatusId: 8 }),
            });

            if (!res.ok) throw new Error();

            const updated = await res.json();

            setIssues((prev) =>
                prev.map((i) =>
                    i.IssueId === issueId ? { ...i, status: { Name: 'Resolved' }, StatusId: 8 } : i
                )
            );

            setSelectedIssue((prev: any) =>
                prev?.IssueId === issueId ? { ...prev, status: { Name: 'Resolved' }, StatusId: 8 } : prev
            );

            setPopup({ message: t('adminIssue.resolved'), variant: 'success' });
        } catch {
            setPopup({ message: t('adminIssue.resolveFailed'), variant: 'error' });
        }
    };

    const statuses = ['all', 'pending', 'resolved'] as const;
    type StatusKey = typeof statuses[number];

    return (
        <>
            {popup && <Popup {...popup} onClose={() => setPopup(null)} />}
            <ScrollView contentContainerStyle={[styles.container, { paddingTop: insets.top }]}>
                <Title>{t('labels.issues')}</Title>

                <View style={styles.filterRow}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statusFilterRow}>
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
                                        {t(`issueStatus.${status}`)}
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
                        sortOptions={['issueType', 'newest', 'oldest']}
                        selected={sortOption}
                        onSelect={(option) => setSortOption(option as any)}
                        t={t}
                    />
                    <Text style={styles.issueCount}>{t('labels.issueCount', { count: filtered.length })}</Text>
                </View>

                <View style={styles.issueList}>
                    {filtered.map((issue) => (
                        <AdminIssueCard
                            key={issue.IssueId}
                            issue={issue}
                            onManage={() => setSelectedIssue(issue)}
                        />
                    ))}
                </View>

                {selectedIssue && (
                    <AdminIssuePopup
                        issue={selectedIssue}
                        visible={true}
                        onClose={() => setSelectedIssue(null)}
                        onResolve={() => handleResolve(selectedIssue.IssueId)}
                    />
                )}
            </ScrollView>
        </>
    );
};

export default AdminIssuesScreen;

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
    active_resolved: {
        backgroundColor: '#2e7d32',
    },
    activeStatusButtonText: {
        color: '#fff',
        fontWeight: '700',
    },
    pending: { backgroundColor: '#ffe0b2' },
    resolved: { backgroundColor: '#c8e6c9' },
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
    issueCount: {
        fontSize: 16,
        fontFamily: 'CormorantGaramond-Regular',
        color: Colors.beige,
    },
    issueList: {
        gap: 16,
    },
});