import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Loading from "../components/Loading";
import { useAuth } from "../context/AuthContext";
import getApiBaseUrl from '../api/config';

const GoogleCallback = () => {
    const navigate = useNavigate();
    const { login } = useAuth();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');

        if (!token) {
            navigate('/auth/login?error=google');
            return;
        }

        const fetchUser = async () => {
            try {
                localStorage.setItem('token', token);
                const baseUrl = getApiBaseUrl();
                const res = await fetch(`${baseUrl}/auth/me`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                const user = await res.json();

                if (res.ok) {
                    login({
                        token,
                        id: user.UserId,
                        name: user.Name,
                        surname: user.Surname,
                        email: user.Email,
                        phoneNumber: user.PhoneNumber,
                        country: user.Country,
                        city: user.City,
                        profilePicture: user.ProfilePictureUrl,
                        role: user.userRoles?.[0]?.RoleId || 'User',
                        reviewCount: user._count?.reviews || 0,
                        status: user.status?.Name,
                        suspendedUntil: user.SuspendedUntil
                    });

                    navigate(user.Country ? '/' : '/complete-profile');
                } else {
                    navigate('/auth/login?error=google');
                }
            } catch (error) {
                console.error("Failed to fetch user after Google login", error);
                navigate('/auth/login?error=google');
            }
        };

        fetchUser();
    }, [navigate, login]);

    return <Loading />;
};

export default GoogleCallback;
