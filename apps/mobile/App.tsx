import React, { JSX } from 'react';
import { ImageBackground, StyleSheet } from 'react-native';
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

  if (!fontsLoaded) return <Loading />;

  return (
    <LoadingProvider>
      <SafeAreaProvider>
        <AuthProvider>
          <NavigationContainer>
            <ImageBackground
              source={require('./assets/images/background_dark.png')}
              resizeMode="cover"
              style={styles.background}
            >
              <Stack.Navigator
                screenOptions={{
                  headerShown: false,
                  contentStyle: { backgroundColor: 'transparent' },
                  animation: 'none'
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
            </ImageBackground>
          </NavigationContainer>
        </AuthProvider>
      </SafeAreaProvider>
    </LoadingProvider>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});
