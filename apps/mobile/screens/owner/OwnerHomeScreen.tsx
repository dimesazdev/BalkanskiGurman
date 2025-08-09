import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { MotiView } from 'moti';
import { RootStackParamList } from '@/types/navigation';
import Title from '@/components/Title';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const iconSize = 48;

const OwnerHomeScreen = () => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const { t } = useTranslation();

    const sections = [
        { title: t('owner.myRestaurants'), path: 'OwnerRestaurants', icon: 'silverware-fork-knife' },
        { title: t('owner.myReviews'), path: 'OwnerReviews', icon: 'message-draw' },
    ];

    const directions = ['left', 'right'];

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <Title>{t('owner.dashboardTitle')}</Title>
            <View style={styles.grid}>
                {sections.map(({ title, path, icon }, index) => {
                    const from = directions[index % directions.length];
                    const translate =
                        from === 'left' ? { translateX: -50 } :
                            from === 'right' ? { translateX: 50 } :
                                { translateY: 50 };

                    return (
                        <MotiView
                            key={title}
                            from={{ opacity: 0, ...translate }}
                            animate={{ opacity: 1, translateX: 0, translateY: 0 }}
                            transition={{
                                delay: index * 200,
                                duration: 600,
                            }}
                            style={styles.boxWrapper}
                        >
                            <TouchableOpacity
                                style={styles.box}
                                activeOpacity={0.8}
                                onPress={() => navigation.navigate(path as any)}
                            >
                                <Icon name={icon} size={iconSize} color="#C0392B" />
                                <Text style={styles.title}>{title}</Text>
                            </TouchableOpacity>
                        </MotiView>
                    );
                })}
            </View>
        </View>
    );
};

export default OwnerHomeScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 24,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 16,
    },
    boxWrapper: {
        width: '100%',
    },
    box: {
        backgroundColor: '#ffe7d6',
        borderRadius: 12,
        paddingVertical: 28,
        paddingHorizontal: 16,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 4,
    },
    title: {
        fontSize: 18,
        color: '#000',
        marginTop: 12,
        fontFamily: 'CormorantSC-Bold',
        textAlign: 'center',
    },
});