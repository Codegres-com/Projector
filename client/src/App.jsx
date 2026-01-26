import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';
import TeamList from './pages/TeamList';
import ProjectList from './pages/ProjectList';
import ProjectDashboard from './pages/ProjectDashboard';
import Messages from './pages/Messages';
import Roles from './pages/Roles';
import ClientList from './pages/ClientList';
import RequirementList from './pages/RequirementList';
import EstimationList from './pages/EstimationList';
import QuotationList from './pages/QuotationList';

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
              <Route path="/roles" element={<Roles />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/clients" element={<ClientList />} />
              <Route path="/requirements" element={<RequirementList />} />
              <Route path="/estimations" element={<EstimationList />} />
              <Route path="/quotations" element={<QuotationList />} />
              <Route path="/" element={<Navigate to="/projects" replace />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
