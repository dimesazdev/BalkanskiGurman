import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './Layout';
import Home from './pages/Home';
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

const App = () => (
  <Router>
    <Routes>
      <Route element={<Layout />}> {/* using the layout of navbar + footer */}
        <Route path="/restaurants" element={<Restaurants />} />
        <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/register" element={<Register />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/restaurants/:id" element={<RestaurantPage />} />
        <Route path="/me" element={<ManageProfile />} />
        <Route path="/restaurants/:id/reviews" element={<WriteReview />} />
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
          <RequireAdmin>
            <RestaurantFormPage />
          </RequireAdmin>
        } />
        <Route path="/admin/reviews" element={
          <RequireAdmin>
            <AdminReviews />
          </RequireAdmin>
        } />
      </Route>
      <Route path="/" element={<Home />} />
      <Route path="/unauthorized" element={<div style={{ padding: "2rem", textAlign: "center", color: "#FFEEDB" }}><h1>403 - Not Authorized</h1><p>You do not have access to this page.</p></div>} />
    </Routes>
  </Router>
);

export default App;