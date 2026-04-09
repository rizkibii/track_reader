import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, AdminRoute, ProfileRoute } from './components/RouteGuards';
import Login from './pages/Login';
import CompleteProfile from './pages/CompleteProfile';
import Library from './pages/Library';
import Reader from './pages/Reader';
import History from './pages/History';
import AdminDashboard from './pages/AdminDashboard';
import AdminEbooks from './pages/AdminEbooks';
import AdminAddEbook from './pages/AdminAddEbook';
import AdminUsers from './pages/AdminUsers';
import UserProfile from './pages/UserProfile';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Login />} />

          {/* Auth required, profile completion NOT required */}
          <Route path="/profile" element={<ProfileRoute><CompleteProfile /></ProfileRoute>} />

          {/* Auth + profile completed required */}
          <Route path="/user" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
          <Route path="/library" element={<ProtectedRoute><Library /></ProtectedRoute>} />
          <Route path="/reader/:ebookId" element={<ProtectedRoute><Reader /></ProtectedRoute>} />
          <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />

          {/* Admin only */}
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
          <Route path="/admin/ebooks" element={<AdminRoute><AdminEbooks /></AdminRoute>} />
          <Route path="/admin/ebooks/add" element={<AdminRoute><AdminAddEbook /></AdminRoute>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
