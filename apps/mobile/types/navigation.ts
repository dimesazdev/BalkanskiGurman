export type RootStackParamList = {
    Home: undefined;
    Login: undefined;
    Register: undefined;
    ManageProfile: undefined;
    HomeRedirect: undefined;

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
    RestaurantForm: { id?: number };

    OwnerHome: undefined;
    OwnerRestaurants: undefined;
    OwnerReviews: undefined;

    RestaurantPage: { id: number };
    WriteReview: { id: number };
    ExYuMap: { country?: string };
    ReportIssue: {
        issueType?: string;
        restaurantId?: number;
        restaurant?: any;
    };

    ForgotPassword: undefined;
    ChangePassword: undefined;
};