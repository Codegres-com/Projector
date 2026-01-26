import { useState, useEffect } from 'react';
import api from '../api';
import RequirementForm from '../components/RequirementForm';

const RequirementList = () => {
  const [requirements, setRequirements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReq, setEditingReq] = useState(null);

  const fetchRequirements = async () => {
    try {
      const res = await api.get('/requirements');
      setRequirements(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequirements();
  }, []);

  const handleCreate = () => {
    setEditingReq(null);
    setIsModalOpen(true);
  };

  const handleEdit = (req) => {
    setEditingReq(req);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this requirement?')) {
      try {
        await api.delete(`/requirements/${id}`);
        fetchRequirements();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleSave = async (formData) => {
    try {
      if (editingReq) {
        await api.put(`/requirements/${editingReq._id}`, formData);
      } else {
        await api.post('/requirements', formData);
      }
      setIsModalOpen(false);
      fetchRequirements();
    } catch (err) {
      console.error(err);
      alert('Error saving requirement');
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Requirements Gathering</h1>
        <button
          onClick={handleCreate}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          New Requirement
        </button>
      </div>

      <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {requirements.map((req) => (
              <tr key={req._id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-blue-600">{req.title}</div>
                  <div className="text-xs text-gray-400 truncate max-w-xs" dangerouslySetInnerHTML={{ __html: req.details.substring(0, 50) + '...' }} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{req.client?.company || 'N/A'}</div>
                  <div className="text-xs text-gray-500">{req.client?.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                        ${req.status === 'Finalized' ? 'bg-green-100 text-green-800' :
                          req.status === 'Archived' ? 'bg-gray-100 text-gray-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {req.status}
                    </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(req.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => handleEdit(req)} className="text-indigo-600 hover:text-indigo-900 mr-4">Edit</button>
                  <button onClick={() => handleDelete(req._id)} className="text-red-600 hover:text-red-900">Delete</button>
                </td>
              </tr>
            ))}
             {requirements.length === 0 && (
                <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-gray-500">No requirements found. Start gathering requirements.</td>
                </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <RequirementForm
          requirement={editingReq}
          onSave={handleSave}
          onCancel={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};

export default RequirementList;
