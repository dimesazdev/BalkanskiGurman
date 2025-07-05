import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './Layout';
import Restaurants from './pages/Restaurants';
import Login from './pages/Login';
import Register from './pages/Register';
import Favorites from './pages/Favorites';
import RestaurantPage from './pages/RestaurantPage';
import ManageProfile from './pages/ManageProfile';
import WriteReview from './pages/WriteReview';
import RequireAdmin from './context/RequireAdmin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminRestaurants from './pages/admin/AdminRestaurants';
import RestaurantFormPage from './pages/admin/RestaurantFormPage';
import AdminReviews from './pages/admin/AdminReviews';
import AdminUsers from './pages/admin/AdminUsers';
import ReportAnIssue from './pages/ReportAnIssue';
import AdminIssues from './pages/admin/AdminIssues';
import HomeRedirect from './components/HomeRedirect';
import ScrollToTop from './components/ScrollToTop';
import RequireOwner from './context/RequireOwner';
import OwnerDashboard from './pages/owner/OwnerDashboard';
import OwnerRestaurants from './pages/owner/OwnerRestaurants';
import OwnerReviews from './pages/owner/OwnerReviews';
import RequireAdminOrOwner from './context/RequireAdminOrOwner';
import CommunityGuidelines from './pages/CommunityGuidelines';
import VerifyEmail from './pages/VerifyEmail';
import ChangePassword from './pages/ChangePassword';
import ResetPassword from './pages/ResetPassword';
import ForgotPassword from './pages/ForgotPassword';

const App = () => (
  <Router>
    <ScrollToTop />
    <Routes>
      <Route element={<Layout />}> {/* using the layout of navbar + footer */}
        <Route path="/restaurants" element={<Restaurants />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/restaurants/:id" element={<RestaurantPage />} />
        <Route path="/me" element={<ManageProfile />} />
        <Route path="/restaurants/:id/reviews" element={<WriteReview />} />
        <Route path="/issues" element={<ReportAnIssue />} />
        <Route path="/community-guidelines" element={<CommunityGuidelines />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/auth/change-password" element={<ChangePassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/forgot-password" element={<ForgotPassword/>} />

        <Route path="/admin" element={
          <RequireAdmin>
            <AdminDashboard />
          </RequireAdmin>
        } />
        <Route path="/admin/restaurants" element={
          <RequireAdmin>
            <AdminRestaurants />
          </RequireAdmin>
        } />
        <Route path="/admin/restaurants/add" element={
          <RequireAdmin>
            <RestaurantFormPage />
          </RequireAdmin>
        } />
        <Route path="/admin/restaurants/edit/:id" element={
          <RequireAdminOrOwner>
            <RestaurantFormPage />
          </RequireAdminOrOwner>
        } />
        <Route path="/admin/reviews" element={
          <RequireAdmin>
            <AdminReviews />
          </RequireAdmin>
        } />
        <Route path="/admin/users" element={
          <RequireAdmin>
            <AdminUsers />
          </RequireAdmin>
        } />
        <Route path="/admin/issues" element={
          <RequireAdmin>
            <AdminIssues />
          </RequireAdmin>
        } />
        <Route path="/owner" element={
          <RequireOwner>
            <OwnerDashboard />
          </RequireOwner>
        } />
        <Route path="/owner/restaurants" element={
          <RequireOwner>
            <OwnerRestaurants />
          </RequireOwner>
        } />
        <Route path="/owner/reviews" element={
          <RequireOwner>
            <OwnerReviews />
          </RequireOwner>
        } />
      </Route>
      <Route path="/" element={<HomeRedirect />} />
      <Route path="/auth/login" element={<Login />} />
      <Route path="/auth/register" element={<Register />} />
      <Route path="/unauthorized" element={<div style={{ padding: "2rem", textAlign: "center", color: "#FFEEDB" }}><h1>403 - Not Authorized</h1><p>You do not have access to this page.</p></div>} />
    </Routes>
  </Router>
);

export default App;