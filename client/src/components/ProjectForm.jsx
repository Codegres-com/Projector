import { useState, useEffect } from 'react';
import api from '../api';

const ProjectForm = ({ project, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'Planning',
    startDate: '',
    endDate: '',
    client: '',
    manager: '',
    team: []
  });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch users for dropdowns
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

    if (project) {
        // Pre-fill form if editing
        setFormData({
            name: project.name || '',
            description: project.description || '',
            status: project.status || 'Planning',
            startDate: project.startDate ? project.startDate.split('T')[0] : '',
            endDate: project.endDate ? project.endDate.split('T')[0] : '',
            client: project.client?._id || project.client || '',
            manager: project.manager?._id || project.manager || '',
            team: project.team ? project.team.map(t => t._id || t) : []
        });
    }
  }, [project]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTeamChange = (e) => {
    const options = e.target.options;
    const value = [];
    for (let i = 0, l = options.length; i < l; i++) {
        if (options[i].selected) {
        value.push(options[i].value);
        }
    }
    setFormData(prev => ({ ...prev, team: value }));
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    const dataToSubmit = { ...formData };
    if (!dataToSubmit.client) delete dataToSubmit.client;
    if (!dataToSubmit.manager) delete dataToSubmit.manager;
    onSave(dataToSubmit);
  };

  if (loading) return <div>Loading...</div>;

  const clients = users.filter(u => u.role === 'Client');
  const staff = users.filter(u => u.role !== 'Client');

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl">
        <h2 className="text-2xl font-bold mb-6">{project ? 'Edit Project' : 'New Project'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
                <label className="block text-sm font-medium text-gray-700">Project Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2" />
            </div>

            {/* Description */}
            <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea name="description" value={formData.description} onChange={handleChange} rows="3"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2" />
            </div>

             <div className="grid grid-cols-2 gap-4">
                {/* Status */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <select name="status" value={formData.status} onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2">
                        <option value="Planning">Planning</option>
                        <option value="Active">Active</option>
                        <option value="Completed">Completed</option>
                        <option value="On Hold">On Hold</option>
                        <option value="Archived">Archived</option>
                    </select>
                </div>
                 {/* Client */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Client</label>
                    <select name="client" value={formData.client} onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2">
                        <option value="">Select Client</option>
                        {clients.map(u => (
                            <option key={u._id} value={u._id}>{u.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {/* Start Date */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Start Date</label>
                    <input type="date" name="startDate" value={formData.startDate} onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2" />
                </div>
                {/* End Date */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">End Date</label>
                    <input type="date" name="endDate" value={formData.endDate} onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2" />
                </div>
            </div>

             <div className="grid grid-cols-2 gap-4">
                {/* Manager */}
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Project Manager</label>
                    <select name="manager" value={formData.manager} onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2">
                        <option value="">Select Manager</option>
                        {staff.map(u => (
                            <option key={u._id} value={u._id}>{u.name} ({u.role})</option>
                        ))}
                    </select>
                </div>

                {/* Team (Simple Multi-select) */}
                <div>
                     <label className="block text-sm font-medium text-gray-700">Team Members</label>
                     <select name="team" multiple value={formData.team} onChange={handleTeamChange}
                         className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2 h-24">
                         {staff.map(u => (
                             <option key={u._id} value={u._id}>{u.name}</option>
                         ))}
                     </select>
                     <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple</p>
                </div>
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
export default ProjectForm;
