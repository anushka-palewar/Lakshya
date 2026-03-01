import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Dashboard from './components/Dashboard/Dashboard';
import VisionGallery from './components/Gallery/VisionGallery';
import ManifestationPage from './components/Manifestation/ManifestationPage';
import DreamsListPage from './components/Dreams/DreamsListPage';
import DreamFormPage from './components/Dreams/DreamFormPage';
import { authService } from './services/api';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  if (!authService.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Register />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/visions"
            element={
              <ProtectedRoute>
                <VisionGallery />
              </ProtectedRoute>
            }
          />

          <Route
            path="/manifestation"
            element={
              <ProtectedRoute>
                <ManifestationPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dreams"
            element={
              <ProtectedRoute>
                <DreamsListPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dreams/new"
            element={
              <ProtectedRoute>
                <DreamFormPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dreams/:id/edit"
            element={
              <ProtectedRoute>
                <DreamFormPage />
              </ProtectedRoute>
            }
          />

          {/* Default Route */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
