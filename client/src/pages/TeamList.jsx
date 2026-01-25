import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import TeamMemberForm from '../components/TeamMemberForm';
import { useAuth } from '../context/AuthContext';

const TeamList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null); // User being edited
  const { isAdmin, can } = useAuth();
  const navigate = useNavigate();

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch team members');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddClick = () => {
    setCurrentUser(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (user) => {
    setCurrentUser(user);
    setIsModalOpen(true);
  };

  const handleDeleteClick = async (id) => {
    if (window.confirm('Are you sure you want to delete this team member?')) {
      try {
        await api.delete(`/users/${id}`);
        setUsers(users.filter(u => u._id !== id));
      } catch (err) {
        alert('Failed to delete user');
      }
    }
  };

  const handleSave = async (formData) => {
    try {
      if (currentUser) {
        // Update
        const res = await api.put(`/users/${currentUser._id}`, formData);
        setUsers(users.map(u => (u._id === currentUser._id ? res.data : u)));
      } else {
        // Create
        const res = await api.post('/users', formData);
        setUsers([...users, res.data]);
      }
      setIsModalOpen(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save user');
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Team Directory</h2>
        <div className="flex gap-2">
            {can('roles', 'read') && (
                <button
                    onClick={() => navigate('/roles')}
                    className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                >
                    Manage Roles
                </button>
            )}
            {can('team', 'create') && (
                <button
                    onClick={handleAddClick}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2"
                >
                    <span>+ Add Member</span>
                </button>
            )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map(user => (
          <div key={user._id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{user.name}</h3>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
              <span className={`px-2 py-1 text-xs rounded-full ${
                user.role?.name === 'Admin' ? 'bg-purple-100 text-purple-800' :
                user.role?.name === 'PM' ? 'bg-green-100 text-green-800' :
                user.role?.name === 'Client' ? 'bg-yellow-100 text-yellow-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {user.role?.name || 'Unknown'}
              </span>
            </div>

            <div className="mt-4 space-y-2">
              <div>
                <span className="text-xs font-semibold text-gray-500 uppercase">Skills</span>
                <p className="text-sm text-gray-700">{user.skills || 'N/A'}</p>
              </div>
              <div>
                <span className="text-xs font-semibold text-gray-500 uppercase">Availability</span>
                <p className="text-sm text-gray-700">{user.availability || 'N/A'}</p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-100">
                {can('team', 'update') && (
                    <button
                        onClick={() => handleEditClick(user)}
                        className="text-sm text-blue-600 hover:text-blue-800"
                    >
                        Edit
                    </button>
                )}
                {can('team', 'delete') && (
                    <button
                        onClick={() => handleDeleteClick(user._id)}
                        className="text-sm text-red-600 hover:text-red-800"
                    >
                        Delete
                    </button>
                )}
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <TeamMemberForm
          user={currentUser}
          onSave={handleSave}
          onCancel={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};

export default TeamList;
