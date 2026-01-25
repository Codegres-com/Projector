import { useState, useEffect } from 'react';
import api from '../api';

const BugForm = ({ projectId, bug, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    severity: 'Medium',
    status: 'Open',
    reproductionSteps: '',
    assignee: ''
  });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get('/users');
        setUsers(res.data);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch users");
        setLoading(false);
      }
    };
    fetchUsers();

    if (bug) {
        setFormData({
            title: bug.title || '',
            description: bug.description || '',
            severity: bug.severity || 'Medium',
            status: bug.status || 'Open',
            reproductionSteps: bug.reproductionSteps || '',
            assignee: bug.assignee?._id || bug.assignee || ''
        });
    }
  }, [bug]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const dataToSubmit = { ...formData, project: projectId };
    if (!dataToSubmit.assignee) delete dataToSubmit.assignee;
    onSave(dataToSubmit);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-6">{bug ? 'Edit Bug' : 'Report Bug'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input type="text" name="title" value={formData.title} onChange={handleChange} required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2" />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Severity</label>
                    <select name="severity" value={formData.severity} onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2">
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        <option value="Critical">Critical</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <select name="status" value={formData.status} onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2">
                        <option value="Open">Open</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                        <option value="Closed">Closed</option>
                    </select>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea name="description" value={formData.description} onChange={handleChange} rows="3"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2" />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Reproduction Steps</label>
                <textarea name="reproductionSteps" value={formData.reproductionSteps} onChange={handleChange} rows="3"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                    placeholder="1. Step one..."/>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Assignee</label>
                <select name="assignee" value={formData.assignee} onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2">
                    <option value="">Unassigned</option>
                    {users.map(u => (
                        <option key={u._id} value={u._id}>{u.name}</option>
                    ))}
                </select>
            </div>

            <div className="flex justify-end gap-4 mt-6">
                <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300">
                    Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                    Save
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default BugForm;
