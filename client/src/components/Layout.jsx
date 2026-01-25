import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md flex-shrink-0 hidden md:block">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-blue-600">Projector</h1>
          <p className="text-xs text-gray-500 mt-1">Agency Management</p>
        </div>
        <nav className="mt-6">
          <Link to="/projects" className="block px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600">
            Projects
          </Link>
          <Link to="/team" className="block px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600">
            Team Management
          </Link>
        </nav>
        <div className="p-6 border-t mt-auto absolute bottom-0 w-64">
           <div className="mb-4">
             <p className="font-semibold text-gray-800">{user?.name}</p>
             <p className="text-sm text-gray-500 capitalize">{user?.role}</p>
           </div>
           <button onClick={handleLogout} className="text-red-500 text-sm hover:underline">
             Sign Out
           </button>
        </div>
      </aside>

      {/* Mobile Header (simplified) */}
      <div className="flex-1 flex flex-col overflow-hidden">
         <header className="md:hidden bg-white shadow-sm p-4 flex justify-between items-center">
            <h1 className="text-xl font-bold text-blue-600">Projector</h1>
            <button onClick={handleLogout} className="text-sm text-gray-600">Logout</button>
         </header>

         {/* Main Content */}
         <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
            <Outlet />
         </main>
      </div>
    </div>
  );
};

export default Layout;
