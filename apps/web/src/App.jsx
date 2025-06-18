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
      </Route>
      <Route path="/" element={<Home />} />
    </Routes>
  </Router>
);

export default App;