import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import HomePage from './pages/HomePage';
import ClassPage from './pages/ClassPage';
import ConfigPage from './pages/ConfigPage';
import SalePage from './pages/SalePage';

export default function App() {
  return (
    <Routes>
      <Route path="/login"  element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/sale"   element={<SalePage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/"      element={<HomePage />} />
        <Route path="/class" element={<ClassPage />} />
      </Route>
      <Route element={<AdminRoute />}>
        <Route path="/config" element={<ConfigPage />} />
      </Route>
    </Routes>
  );
}
