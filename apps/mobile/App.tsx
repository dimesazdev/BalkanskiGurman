import React, { useState, useEffect, JSX } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useFonts } from 'expo-font';
import Loading from './components/Loading';
import './i18n';
import { AuthProvider } from './context/AuthContext';
import HomeScreen from './screens/HomeScreen';
import LoginScreen from './screens/LoginScreen';
import Navbar from './components/Navbar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LoadingProvider } from './context/LoadingContext';
import MyPage from './screens/MyPage';
import RegisterScreen from './screens/RegisterScreen';
import RestaurantsScreen from './screens/RestaurantsScreen';
import ExYuMapScreen from "./screens/ExYuMapScreen";
import FavoritesScreen from './screens/FavoritesScreen';

const Stack = createNativeStackNavigator();

export default function App(): JSX.Element {
  const [fontsLoaded] = useFonts({
    'CormorantGaramond': require('./assets/fonts/CormorantGaramond-VariableFont_wght.ttf'),
    'CormorantGaramond-Italic': require('./assets/fonts/CormorantGaramond-Italic-VariableFont_wght.ttf'),
    'CormorantSC-Regular': require('./assets/fonts/CormorantSC-Regular.ttf'),
    'CormorantSC-Light': require('./assets/fonts/CormorantSC-Light.ttf'),
    'CormorantSC-Medium': require('./assets/fonts/CormorantSC-Medium.ttf'),
    'CormorantSC-SemiBold': require('./assets/fonts/CormorantSC-SemiBold.ttf'),
    'CormorantSC-Bold': require('./assets/fonts/CormorantSC-Bold.ttf'),
  });

  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    const prepareApp = async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      setAppReady(true);
    };
    prepareApp();
  }, []);

  if (!fontsLoaded || !appReady) return <Loading />;

  return (
    <LoadingProvider>
      <SafeAreaProvider>
        <AuthProvider>
          <NavigationContainer>
            <Stack.Navigator
              screenOptions={{
                headerShown: false,
              }}
            >
              <Stack.Screen name="Home" component={HomeScreen} />
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="Register" component={RegisterScreen} />
              <Stack.Screen name="Restaurants" component={RestaurantsScreen} />
              <Stack.Screen name="Favorites" component={FavoritesScreen} />
              <Stack.Screen name="ExYuMap" component={ExYuMapScreen} />
            </Stack.Navigator>
            <Navbar />
          </NavigationContainer>
        </AuthProvider>
      </SafeAreaProvider>
    </LoadingProvider>
  );
}