import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      if (storedUser?.token) {
        setUser(storedUser);
      } else {
        console.warn("Invalid or missing user token in localStorage");
        localStorage.removeItem('user');
      }
    } catch (e) {
      console.error("Failed to parse user from localStorage", e);
      localStorage.removeItem('user');
    }
  }, []);

  const login = (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  const refreshUser = async () => {
    if (!user?.token) {
      console.warn("Cannot refresh user — token missing");
      return;
    }

    const res = await fetch('http://localhost:3001/auth/me', {
      headers: {
        Authorization: `Bearer ${user.token}`
      }
    });

    if (!res.ok) {
      console.warn("Failed to refresh user", res.status);
      return;
    }

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
      reviewCount: data.reviewCount || 0
    };

    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);