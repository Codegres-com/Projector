import { useState, useEffect } from 'react';
import api from '../api';

const CredentialManager = ({ projectId }) => {
  const [credentials, setCredentials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    username: '',
    password: '',
    description: ''
  });

  // Visibility state for each credential
  const [visiblePasswords, setVisiblePasswords] = useState({});

  useEffect(() => {
    fetchCredentials();
  }, [projectId]);

  const fetchCredentials = async () => {
    try {
      const res = await api.get(`/credentials?projectId=${projectId}`);
      setCredentials(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch credentials", err);
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        const res = await api.put(`/credentials/${editingId}`, formData);
        setCredentials(credentials.map(c => c._id === editingId ? res.data : c));
      } else {
        const res = await api.post('/credentials', { ...formData, project: projectId });
        setCredentials([res.data, ...credentials]);
      }
      closeModal();
    } catch (err) { // eslint-disable-line no-unused-vars
      alert('Failed to save credential');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this credential?')) {
      try {
        await api.delete(`/credentials/${id}`);
        setCredentials(credentials.filter(c => c._id !== id));
      } catch (err) { // eslint-disable-line no-unused-vars
        alert('Failed to delete credential');
      }
    }
  };

  const openModal = (credential = null) => {
    if (credential) {
      setEditingId(credential._id);
      setFormData({
        title: credential.title,
        url: credential.url || '',
        username: credential.username || '',
        password: credential.password,
        description: credential.description || ''
      });
    } else {
      setEditingId(null);
      setFormData({
        title: '',
        url: '',
        username: '',
        password: '',
        description: ''
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const togglePasswordVisibility = (id) => {
    setVisiblePasswords(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      // Could add a toast notification here
      alert("Copied to clipboard!"); // Simple feedback
    });
  };

  if (loading) return <div>Loading Credentials...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Credentials</h2>
        <button
          onClick={() => openModal()}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add Credential
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {credentials.map(cred => (
          <div key={cred._id} className="bg-white p-5 rounded-lg shadow border border-gray-200 flex flex-col">
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-bold text-lg text-gray-800">{cred.title}</h3>
              <div className="flex gap-2">
                <button onClick={() => openModal(cred)} className="text-blue-500 hover:text-blue-700 text-sm">Edit</button>
                <button onClick={() => handleDelete(cred._id)} className="text-red-500 hover:text-red-700 text-sm">Delete</button>
              </div>
            </div>

            {cred.url && (
              <div className="mb-2">
                <a href={cred.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm truncate block">
                  {cred.url}
                </a>
              </div>
            )}

            {cred.description && (
              <p className="text-gray-600 text-sm mb-4">{cred.description}</p>
            )}

            <div className="mt-auto space-y-3">
              {cred.username && (
                <div className="bg-gray-50 p-2 rounded border border-gray-100">
                  <span className="text-xs text-gray-500 uppercase font-semibold block mb-1">Username</span>
                  <div className="flex justify-between items-center">
                    <code className="text-sm text-gray-800 break-all">{cred.username}</code>
                    <button
                      onClick={() => copyToClipboard(cred.username)}
                      className="text-gray-400 hover:text-blue-600 text-xs ml-2"
                      title="Copy Username"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              )}

              <div className="bg-gray-50 p-2 rounded border border-gray-100">
                <span className="text-xs text-gray-500 uppercase font-semibold block mb-1">Password</span>
                <div className="flex justify-between items-center">
                  <code className="text-sm text-gray-800 break-all">
                    {visiblePasswords[cred._id] ? cred.password : '••••••••••••'}
                  </code>
                  <div className="flex gap-2 ml-2">
                    <button
                      onClick={() => togglePasswordVisibility(cred._id)}
                      className="text-gray-400 hover:text-blue-600 text-xs"
                      title={visiblePasswords[cred._id] ? "Hide" : "Show"}
                    >
                      {visiblePasswords[cred._id] ? "Hide" : "Show"}
                    </button>
                    <button
                      onClick={() => copyToClipboard(cred.password)}
                      className="text-gray-400 hover:text-blue-600 text-xs"
                      title="Copy Password"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {credentials.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-500">
            No credentials added yet.
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">{editingId ? 'Edit Credential' : 'Add Credential'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Title</label>
                  <input
                    type="text"
                    name="title"
                    required
                    value={formData.title}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">URL</label>
                  <input
                    type="url"
                    name="url"
                    value={formData.url}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Username</label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Password</label>
                  <input
                    type="text"
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    name="description"
                    rows="3"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CredentialManager;
