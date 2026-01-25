import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';
import TeamList from './pages/TeamList';
import ProjectList from './pages/ProjectList';
import ProjectDashboard from './pages/ProjectDashboard';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<PrivateRoute />}>
            <Route element={<Layout />}>
              <Route path="/projects" element={<ProjectList />} />
              <Route path="/projects/:id" element={<ProjectDashboard />} />
              <Route path="/team" element={<TeamList />} />
              <Route path="/" element={<Navigate to="/projects" replace />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
