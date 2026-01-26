import { useState, useEffect } from 'react';
import api from '../api';
import ClientForm from '../components/ClientForm';

const ClientList = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);

  const fetchClients = async () => {
    try {
      const res = await api.get('/clients');
      setClients(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleCreate = () => {
    setEditingClient(null);
    setIsModalOpen(true);
  };

  const handleEdit = (client) => {
    setEditingClient(client);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      try {
        await api.delete(`/clients/${id}`);
        fetchClients();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleSave = async (formData) => {
    try {
      if (editingClient) {
        await api.put(`/clients/${editingClient._id}`, formData);
      } else {
        await api.post('/clients', formData);
      }
      setIsModalOpen(false);
      fetchClients();
    } catch (err) {
      console.error(err);
      alert('Error saving client');
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Client Management (CRM)</h1>
        <button
          onClick={handleCreate}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add New Client
        </button>
      </div>

      <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company / Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact Info</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {clients.map((client) => (
              <tr key={client._id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{client.company}</div>
                  <div className="text-sm text-gray-500">{client.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{client.email}</div>
                  <div className="text-sm text-gray-500">{client.phone}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500 max-w-xs truncate" title={client.address}>{client.address}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => handleEdit(client)} className="text-indigo-600 hover:text-indigo-900 mr-4">Edit</button>
                  <button onClick={() => handleDelete(client._id)} className="text-red-600 hover:text-red-900">Delete</button>
                </td>
              </tr>
            ))}
            {clients.length === 0 && (
                <tr>
                    <td colSpan="4" className="px-6 py-4 text-center text-gray-500">No clients found. Add one to get started.</td>
                </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <ClientForm
          client={editingClient}
          onSave={handleSave}
          onCancel={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};

export default ClientList;
