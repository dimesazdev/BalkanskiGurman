export type RootStackParamList = {
    Home: undefined;
    Login: undefined;
    Register: undefined;
    ManageProfile: undefined;

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

    RestaurantPage: { id: number };
    WriteReview: { id: number };
    ExYuMap: undefined;
    ReportIssue: {
        issueType?: string;
        restaurantId?: number;
        restaurant?: any;
    };

    ForgotPassword: undefined;
};