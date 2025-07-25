import { NetworkInfo } from 'react-native-network-info';

let cachedApiUrl: string | null = null;

export const getApiBaseUrl = async (): Promise<string> => {
    // if (cachedApiUrl) return cachedApiUrl;

    // if (__DEV__) {
    //     const ip = await NetworkInfo.getIPAddress();
    //     console.log('NetworkInfo:', NetworkInfo);
    //     cachedApiUrl = `http://${ip}:3001`; // default port
    // } else {
    //     cachedApiUrl = 'https://balkanskigurman.com'; // fallback for builds
    // }

    // return cachedApiUrl;
    return "http://192.168.100.31:3001"
};