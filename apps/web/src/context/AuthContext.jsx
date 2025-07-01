import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('user');
      if (!raw) {
        console.info("No user in localStorage");
        return;
      }

      const storedUser = JSON.parse(raw);
      if (storedUser?.token && typeof storedUser.token === 'string') {
        console.log("Restored user from localStorage:", storedUser);
        setUser(storedUser);
      } else {
        console.warn("Invalid or missing user token in localStorage", storedUser);
        localStorage.removeItem('user');
      }
    } catch (e) {
      console.error("Failed to parse user from localStorage", e);
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  }, []);

  const login = (userData) => {
    if (!userData || !userData.token) {
      console.error("Cannot login: invalid userData", userData);
      return;
    }
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

    try {
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
    } catch (err) {
      console.error("Error while refreshing user:", err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, refreshUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);