const getApiBaseUrl = () => {
  return process.env.NODE_ENV === "production"
    ? "https://balkanskigurman.onrender.com"
    : "http://localhost:3001";
};

export default getApiBaseUrl;