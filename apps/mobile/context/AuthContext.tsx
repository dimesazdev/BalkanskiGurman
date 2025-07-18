import { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restoreUser = async () => {
      try {
        const raw = await AsyncStorage.getItem('user');
        if (!raw) return;

        const parsed = JSON.parse(raw);
        if (parsed?.token && typeof parsed.token === 'string') {
          setUser(parsed);
        } else {
          await AsyncStorage.removeItem('user');
        }
      } catch (e) {
        console.error('Failed to restore user', e);
        await AsyncStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    restoreUser();
  }, []);

  const login = async (userData: any) => {
    if (!userData?.token) return;
    setUser(userData);
    await AsyncStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = async () => {
    setUser(null);
    await AsyncStorage.removeItem('user');
  };

  const refreshUser = async () => {
    if (!user?.token) return;

    try {
      const res = await fetch('http://localhost:3001/auth/me', {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      if (!res.ok) return;

      const data = await res.json();

      const updatedUser = {
        token: user.token,
        id: data.UserId,
        name: data.Name,
        surname: data.Surname,
        email: data.Email,
        phoneNumber: data.PhoneNumber,
        country: data.Country,
        city: data.City,
        profilePicture: data.ProfilePictureUrl,
        role: data.userRoles?.[0]?.RoleId || 'User',
        reviewCount: data.reviewCount || 0,
        status: data.status?.Name,
        suspendedUntil: data.SuspendedUntil,
      };

      setUser(updatedUser);
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (err) {
      console.error('Error refreshing user:', err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, refreshUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);