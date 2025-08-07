export const getFrontendOrigin = () => {
    return process.env.FRONTEND_URL || 'http://localhost:5173';
};