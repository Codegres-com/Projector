import { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';

const RESOURCES = [
  'projects',
  'tasks',
  'bugs',
  'documents',
  'credentials',
  'decisionLogs',
  'chat',
  'team',
  'roles'
];

const ACTIONS = ['create', 'read', 'update', 'delete'];

const Roles = () => {
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user, can } = useAuth();

  // State for new role form
  const [isCreating, setIsCreating] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDesc, setNewRoleDesc] = useState('');

  const fetchRoles = async () => {
    try {
      const res = await api.get('/roles');
      setRoles(res.data);
      if (res.data.length > 0 && !selectedRole) {
        setSelectedRole(res.data[0]);
      } else if (selectedRole) {
        // Refresh selected role data
        const updated = res.data.find(r => r._id === selectedRole._id);
        if (updated) setSelectedRole(updated);
      }
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch roles");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleCreateRole = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/roles', {
        name: newRoleName,
        description: newRoleDesc,
        permissions: {} // Start empty
      });
      setRoles([...roles, res.data]);
      setSelectedRole(res.data);
      setIsCreating(false);
      setNewRoleName('');
      setNewRoleDesc('');
    } catch (err) {
      alert(err.response?.data?.msg || 'Failed to create role');
    }
  };

  const handleDeleteRole = async (id) => {
    if (!window.confirm('Are you sure you want to delete this role?')) return;
    try {
      await api.delete(`/roles/${id}`);
      const newRoles = roles.filter(r => r._id !== id);
      setRoles(newRoles);
      if (selectedRole._id === id) {
        setSelectedRole(newRoles[0] || null);
      }
    } catch (err) {
      alert(err.response?.data?.msg || 'Failed to delete role');
    }
  };

  const handleTogglePermission = async (resource, action) => {
    if (!selectedRole) return;
    if (selectedRole.name === 'Admin') {
        alert("Cannot modify Admin permissions");
        return;
    }

    const currentPerms = selectedRole.permissions?.[resource] || {};
    const newValue = !currentPerms[action];

    // Optimistic update
    const updatedRole = {
      ...selectedRole,
      permissions: {
        ...selectedRole.permissions,
        [resource]: {
          ...currentPerms,
          [action]: newValue
        }
      }
    };

    setSelectedRole(updatedRole); // Update UI immediately

    try {
      await api.put(`/roles/${selectedRole._id}`, {
        permissions: updatedRole.permissions
      });
      // Optionally re-fetch to ensure sync or just rely on success
      setRoles(roles.map(r => r._id === selectedRole._id ? updatedRole : r));
    } catch (err) {
      console.error(err);
      alert('Failed to update permission');
      fetchRoles(); // Revert on error
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden">
      {/* Sidebar: Role List */}
      <div className="w-1/4 bg-gray-50 border-r border-gray-200 p-4 overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Roles</h2>
          {can('roles', 'create') && (
            <button
                onClick={() => setIsCreating(true)}
                className="text-sm bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
            >
                + New
            </button>
          )}
        </div>

        {isCreating && (
          <form onSubmit={handleCreateRole} className="mb-4 bg-white p-3 rounded shadow border">
            <input
              className="w-full border p-1 rounded mb-2 text-sm"
              placeholder="Role Name"
              value={newRoleName}
              onChange={e => setNewRoleName(e.target.value)}
              required
            />
            <input
              className="w-full border p-1 rounded mb-2 text-sm"
              placeholder="Description"
              value={newRoleDesc}
              onChange={e => setNewRoleDesc(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="text-xs bg-green-600 text-white px-2 py-1 rounded"
              >
                Save
              </button>
            </div>
          </form>
        )}

        <div className="space-y-2">
          {roles.map(role => (
            <div
              key={role._id}
              onClick={() => setSelectedRole(role)}
              className={`p-3 rounded cursor-pointer border ${
                selectedRole?._id === role._id
                  ? 'bg-blue-50 border-blue-300 shadow-sm'
                  : 'bg-white border-gray-200 hover:bg-gray-100'
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-700">{role.name}</span>
                {role.isSystem && <span className="text-[10px] bg-gray-200 text-gray-600 px-1 rounded">SYSTEM</span>}
              </div>
              <p className="text-xs text-gray-500 truncate">{role.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content: Permission Matrix */}
      <div className="w-3/4 p-6 overflow-y-auto">
        {selectedRole ? (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">{selectedRole.name} Permissions</h2>
                <p className="text-gray-500">{selectedRole.description}</p>
              </div>
              {!selectedRole.isSystem && can('roles', 'delete') && (
                <button
                  onClick={() => handleDeleteRole(selectedRole._id)}
                  className="text-red-600 border border-red-600 px-3 py-1 rounded hover:bg-red-50 text-sm"
                >
                  Delete Role
                </button>
              )}
            </div>

            <div className="bg-white rounded shadow overflow-hidden border border-gray-200">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Resource</th>
                    {ACTIONS.map(action => (
                      <th key={action} className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        {action}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {RESOURCES.map(resource => (
                    <tr key={resource} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 capitalize">
                        {resource.replace(/([A-Z])/g, ' $1').trim()} {/* Format camelCase */}
                      </td>
                      {ACTIONS.map(action => {
                        const isChecked = selectedRole.permissions?.[resource]?.[action] === true;
                        const isAdmin = selectedRole.name === 'Admin';
                        return (
                          <td key={action} className="px-4 py-3 text-center">
                            <input
                              type="checkbox"
                              checked={isAdmin ? true : isChecked}
                              disabled={isAdmin || !can('roles', 'update')} // Admin always true, readonly
                              onChange={() => handleTogglePermission(resource, action)}
                              className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 disabled:opacity-50"
                            />
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 text-xs text-gray-500">
              <p>* Changes are saved automatically.</p>
              {selectedRole.name === 'Admin' && <p>* Admin permissions cannot be modified.</p>}
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-500 mt-20">Select a role to view permissions</div>
        )}
      </div>
    </div>
  );
};

export default Roles;
