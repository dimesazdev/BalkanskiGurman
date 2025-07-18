export type RootStackParamList = {
    Home: undefined;
    Login: undefined;
    Register: undefined;
    ForgotPassword: undefined;

    Restaurants: {
        city: string;
        country: string;
        metro?: string;
    };
    Favorites: undefined;
    Issues: undefined;

    AdminHome: undefined;
    AdminRestaurants: undefined;
    AdminReviews: undefined;
    AdminUsers: undefined;
    AdminIssues: undefined;

    OwnerHome: undefined;
    OwnerRestaurants: undefined;
    OwnerReviews: undefined;

    RestaurantDetails: { id: number };
    ExYuMap: undefined;
};