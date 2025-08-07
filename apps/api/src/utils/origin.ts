export const getFrontendOrigin = () => {
    return process.env.NODE_ENV === 'production'
        ? 'https://balkanskigurman.vercel.app'
        : 'http://localhost:5173';
};