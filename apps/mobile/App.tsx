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
import RestaurantPageScreen from './screens/RestaurantPageScreen';
import WriteReviewScreen from './screens/WriteReviewScreen';
import ManageProfileScreen from './screens/ManageProfileScreen';
import ReportIssueScreen from './screens/ReportIssueScreen';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';
import ChangePasswordScreen from './screens/ChangePasswordScreen';
import AdminHomeScreen from './screens/admin/AdminHomeScreen';
import HomeRedirect from './context/HomeRedirect';
import RestaurantFormScreen from './screens/admin/RestaurantFormScreen';
import AdminReviewsScreen from './screens/admin/AdminReviewsScreen';
import AdminUsersScreen from './screens/admin/AdminUsersScreen';
import AdminIssuesScreen from './screens/admin/AdminIssuesScreen';
import OwnerHomeScreen from './screens/owner/OwnerHomeScreen';
import OwnerRestaurantsScreen from './screens/owner/OwnerRestaurantsScreen';
import OwnerReviewsScreen from './screens/owner/OwnerReviewsScreen';

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
              <Stack.Screen name="ManageProfile" component={ManageProfileScreen} />
              <Stack.Screen name="Restaurants" component={RestaurantsScreen} />
              <Stack.Screen name="Favorites" component={FavoritesScreen} />
              <Stack.Screen name="ExYuMap" component={ExYuMapScreen} />
              <Stack.Screen name="RestaurantPage" component={RestaurantPageScreen} />
              <Stack.Screen name="WriteReview" component={WriteReviewScreen} />
              <Stack.Screen name="ReportIssue" component={ReportIssueScreen} />
              <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
              <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />

              <Stack.Screen name="RestaurantForm" component={RestaurantFormScreen} />
              <Stack.Screen name="AdminHome" component={AdminHomeScreen} />
              <Stack.Screen name="AdminReviews" component={AdminReviewsScreen} />
              <Stack.Screen name="AdminUsers" component={AdminUsersScreen} />
              <Stack.Screen name="AdminIssues" component={AdminIssuesScreen} />

              <Stack.Screen name="OwnerHome" component={OwnerHomeScreen} />
              <Stack.Screen name="OwnerRestaurants" component={OwnerRestaurantsScreen} />
              <Stack.Screen name="OwnerReviews" component={OwnerReviewsScreen} />

              <Stack.Screen name="HomeRedirect" component={HomeRedirect} />
            </Stack.Navigator>
            <Navbar />
          </NavigationContainer>
        </AuthProvider>
      </SafeAreaProvider>
    </LoadingProvider>
  );
}

const _consoleError = console.error;
console.error = (...args) => {
  if (
    typeof args[0] === 'string' &&
    args[0].includes('Text strings must be rendered within a <Text>')
  ) {
    console.trace('⚠️ Caught text rendering error');
  }
  _consoleError(...args);
};