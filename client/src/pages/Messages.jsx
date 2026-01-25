import { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import ChatWindow from '../components/ChatWindow';

const Messages = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get('/users');
        // Filter out current user
        const otherUsers = res.data.filter(u => u._id !== currentUser?._id);
        setUsers(otherUsers);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch users', err);
        setError('Failed to load users');
        setLoading(false);
      }
    };

    if (currentUser) {
        fetchUsers();
    }
  }, [currentUser]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  return (
    <div className="flex h-[calc(100vh-100px)] border border-gray-200 rounded-lg shadow-sm bg-white overflow-hidden">
      {/* Sidebar: User List */}
      <div className="w-1/3 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-bold text-gray-800">Direct Messages</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
            {users.length === 0 ? (
                <div className="p-4 text-gray-500">No other users found.</div>
            ) : (
                users.map(u => (
                    <div
                        key={u._id}
                        onClick={() => setSelectedUser(u)}
                        className={`p-4 cursor-pointer hover:bg-blue-50 transition border-b border-gray-100 flex items-center gap-3
                            ${selectedUser?._id === u._id ? 'bg-blue-50 border-l-4 border-l-blue-500' : 'border-l-4 border-l-transparent'}
                        `}
                    >
                         <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">
                            {u.name.charAt(0)}
                         </div>
                         <div>
                             <p className="font-semibold text-gray-800">{u.name}</p>
                             <p className="text-xs text-gray-500 capitalize">{u.role}</p>
                         </div>
                    </div>
                ))
            )}
        </div>
      </div>

      {/* Main: Chat Window */}
      <div className="flex-1 bg-gray-50">
          {selectedUser ? (
              <div className="h-full p-4">
                 <ChatWindow
                    key={selectedUser._id} // Force remount when user changes
                    recipientId={selectedUser._id}
                    title={`Chat with ${selectedUser.name}`}
                 />
              </div>
          ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                  Select a user to start chatting
              </div>
          )}
      </div>
    </div>
  );
};

export default Messages;
