import { useEffect } from 'react';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { useAuth } from '@/context/AuthContext';
import { RootStackParamList } from '@/types/navigation';

const ADMIN_ROLE_ID = '644f2db4-9bbb-40a2-8b7d-963623c0c64a';
const OWNER_ROLE_ID = '34fuihi4-5vj8-3v4e-43v5-3jfismy876s5';

const HomeRedirect = () => {
    const { user } = useAuth();
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();

    useEffect(() => {
        if (user?.role === ADMIN_ROLE_ID) {
            navigation.reset({ index: 0, routes: [{ name: 'AdminHome' }] });
        } else if (user?.role === OWNER_ROLE_ID) {
            navigation.reset({ index: 0, routes: [{ name: 'OwnerHome' }] });
        } else {
            navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
        }
    }, [user]);

    return null;
};

export default HomeRedirect;