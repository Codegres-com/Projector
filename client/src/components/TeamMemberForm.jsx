import { useState, useEffect } from 'react';
import api from '../api';

const TeamMemberForm = ({ user, onSave, onCancel }) => {
  const [roles, setRoles] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: '',
    skills: '',
    availability: ''
  });

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await api.get('/roles');
        setRoles(res.data);
        if (!user && res.data.length > 0) {
            // Default to Developer if exists, or first role
            const devRole = res.data.find(r => r.name === 'Developer');
            setFormData(prev => ({ ...prev, role: devRole ? devRole._id : res.data[0]._id }));
        }
      } catch (err) {
        console.error("Failed to fetch roles");
      }
    };
    fetchRoles();
  }, []);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        password: '', // Don't populate password
        role: user.role?._id || user.role, // Handle populated object or ID
        skills: user.skills || '',
        availability: user.availability || ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
      <div className="bg-white p-5 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">{user ? 'Edit Team Member' : 'Add Team Member'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-1">Name</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full border p-2 rounded" required />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-1">Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full border p-2 rounded" required />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-1">
              Password {user && <span className="font-normal text-gray-500">(Leave blank to keep current)</span>}
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full border p-2 rounded"
              required={!user}
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-1">Role</label>
            <select name="role" value={formData.role} onChange={handleChange} className="w-full border p-2 rounded">
              {roles.map(role => (
                <option key={role._id} value={role._id}>{role.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-1">Skills</label>
            <input type="text" name="skills" value={formData.skills} onChange={handleChange} className="w-full border p-2 rounded" placeholder="e.g. React, Node.js" />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-1">Availability</label>
            <input type="text" name="availability" value={formData.availability} onChange={handleChange} className="w-full border p-2 rounded" placeholder="e.g. Full-time, 20hrs/week" />
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TeamMemberForm;
