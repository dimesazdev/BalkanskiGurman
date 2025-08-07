"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getApiBaseUrl = void 0;
let cachedApiUrl = null;
const getApiBaseUrl = async () => {
    // if (cachedApiUrl) return cachedApiUrl;
    // if (__DEV__) {
    //     const ip = await NetworkInfo.getIPAddress();
    //     console.log('NetworkInfo:', NetworkInfo);
    //     cachedApiUrl = `http://${ip}:3001`; // default port
    // } else {
    //     cachedApiUrl = 'https://balkanskigurman.com'; // fallback for builds
    // }
    // return cachedApiUrl;
    return "https://balkanskigurman.onrender.com";
    // return "http://192.168.0.46:3001"
    // return "http://192.168.0.197:3001"
};
exports.getApiBaseUrl = getApiBaseUrl;
