import React, { useState } from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    TouchableOpacity,
    Modal,
    Pressable,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { RootStackParamList } from '@/types/navigation';
import Alert from './Alert';
import Colors from '@/constants/Colors';

const ADMIN_ROLE_ID = '644f2db4-9bbb-40a2-8b7d-963623c0c64a';
const OWNER_ROLE_ID = '34fuihi4-5vj8-3v4e-43v5-3jfismy876s5';

const flagMap: Record<'EN' | 'MK' | 'SR' | 'SL', any> = {
    EN: require('../assets/images/uk-flag-icon.png'),
    MK: require('../assets/images/mk-flag-icon.png'),
    SR: require('../assets/images/sr-flag-icon.png'),
    SL: require('../assets/images/si-flag-icon.png'),
};

const Navbar = () => {
    const { t, i18n } = useTranslation();
    const { user, logout } = useAuth();
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const [showMenu, setShowMenu] = useState(false);

    const [alertVisible, setAlertVisible] = useState(false);

    const changeLanguage = (lang: 'EN' | 'MK' | 'SR' | 'SL') => {
        i18n.changeLanguage(lang.toLowerCase());
        setShowMenu(false);
    };

    const handleLogout = () => {
        setShowMenu(false);
        setAlertVisible(true);
    };

    const renderNavItem = <T extends keyof RootStackParamList>(
        icon: string,
        route: T
    ) => (
        <TouchableOpacity
            key={route}
            style={styles.navItem}
            onPress={() => navigation.navigate(route)}
        >
            <MaterialCommunityIcons name={icon} size={26} color="#FFEEDB" />
        </TouchableOpacity>
    );

    const renderMenuItems = () => (
        <View style={styles.menuModal}>
            <View style={styles.menuContent}>
                <View style={styles.langDropdownUp}>
                    {(Object.keys(flagMap) as Array<'EN' | 'MK' | 'SR' | 'SL'>).map((lang) => (
                        <Pressable key={lang} style={styles.langItem} onPress={() => changeLanguage(lang)}>
                            <Image source={flagMap[lang]} style={styles.langIcon} />
                            <Text style={styles.langOption}>{lang}</Text>
                        </Pressable>
                    ))}
                </View>

                {user ? (
                    <View style={styles.userInfo}>
                        {user.profilePicture ? (
                            <Image source={{ uri: user.profilePicture }} style={styles.avatar} />
                        ) : (
                            <MaterialCommunityIcons name="account-circle-outline" size={24} color="#2f2f2f" />
                        )}
                        <Text style={styles.userText}>{user.name} {user.surname?.charAt(0)}.</Text>
                        <TouchableOpacity onPress={handleLogout}>
                            <MaterialCommunityIcons name="logout" size={22} color="#2f2f2f" />
                        </TouchableOpacity>
                    </View>
                ) : (
                    <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                        <Text style={styles.userText}>{t('navbar.login')}</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );

    return (
        <>
            <View style={styles.navbar}>
                {!user?.role || (user.role !== ADMIN_ROLE_ID && user.role !== OWNER_ROLE_ID) ? (
                    <>
                        {renderNavItem('home-outline', 'Home')}
                        {renderNavItem('silverware-fork-knife', 'ExYuMap')}
                        {user && renderNavItem('heart-outline', 'Favorites')}
                        {user && renderNavItem('alert-circle-outline', 'Issues')}
                    </>
                ) : user.role === ADMIN_ROLE_ID ? (
                    <>
                        {renderNavItem('home-outline', 'AdminHome')}
                        {renderNavItem('silverware-fork-knife', 'AdminRestaurants')}
                        {renderNavItem('message-draw', 'AdminReviews')}
                        {renderNavItem('account-group', 'AdminUsers')}
                        {renderNavItem('alert-circle-outline', 'AdminIssues')}
                    </>
                ) : (
                    <>
                        {renderNavItem('home-outline', 'OwnerHome')}
                        {renderNavItem('silverware-fork-knife', 'OwnerRestaurants')}
                        {renderNavItem('message-draw', 'OwnerReviews')}
                    </>
                )}

                <TouchableOpacity style={styles.navItem} onPress={() => setShowMenu(true)}>
                    <MaterialCommunityIcons name="menu" size={26} color="#FFEEDB" />
                </TouchableOpacity>
            </View>
            <Modal visible={showMenu} transparent animationType="fade">
                <Pressable style={styles.overlay} onPress={() => setShowMenu(false)}>
                    {renderMenuItems()}
                </Pressable>
            </Modal>
            <Alert
                visible={alertVisible}
                message={t('navbar.logoutConfirm') || 'Are you sure you want to logout?'}
                buttonText={t('navbar.logout') || 'Logout'}
                onButtonClick={() => {
                    setAlertVisible(false);
                    logout();
                    navigation.navigate('Home');
                }}
                onClose={() => setAlertVisible(false)}
            />
        </>
    );
};

export default Navbar;

const styles = StyleSheet.create({
    navbar: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 16,
        backgroundColor: Colors.red,
        paddingBottom: 25
    },
    navItem: {
        padding: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    menuModal: {
        position: 'absolute',
        bottom: 70,
        right: 16,
        backgroundColor: '#FFEEDB',
        borderRadius: 16,
        padding: 12,
        elevation: 6,
    },
    menuContent: {
        alignItems: 'center',
    },
    langDropdownUp: {
        marginBottom: 12,
    },
    langItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
        paddingHorizontal: 12,
    },
    langIcon: {
        width: 20,
        height: 20,
        marginRight: 8,
        borderRadius: 4,
    },
    langOption: {
        fontSize: 14,
        color: '#2f2f2f',
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    avatar: {
        width: 28,
        height: 28,
        borderRadius: 14,
        marginRight: 6,
    },
    userText: {
        fontSize: 16,
        fontFamily: 'CormorantGaramond',
        color: '#2f2f2f',
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.2)',
        justifyContent: 'flex-end',
        alignItems: 'flex-end',
    },
});