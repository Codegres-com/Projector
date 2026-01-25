import React, { useState, useEffect } from 'react';
import api from '../api';
import BugForm from './BugForm';

const BugTracker = ({ projectId }) => {
  const [bugs, setBugs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBug, setEditingBug] = useState(null);

  useEffect(() => {
    const fetchBugs = async () => {
      try {
        const res = await api.get(`/bugs?projectId=${projectId}`);
        setBugs(res.data);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch bugs", err);
        setLoading(false);
      }
    };
    fetchBugs();
  }, [projectId]);

  const handleCreateClick = () => {
      setEditingBug(null);
      setIsFormOpen(true);
  };

  const handleEditClick = (bug) => {
      setEditingBug(bug);
      setIsFormOpen(true);
  };

  const handleSaveBug = async (bugData) => {
      try {
          if (editingBug) {
              const res = await api.put(`/bugs/${editingBug._id}`, bugData);
              setBugs(prev => prev.map(b => b._id === res.data._id ? res.data : b));
          } else {
              const res = await api.post('/bugs', bugData);
              setBugs(prev => [res.data, ...prev]);
          }
          setIsFormOpen(false);
      } catch (err) { // eslint-disable-line no-unused-vars
          alert('Failed to save bug');
      }
  };

  const handleDeleteBug = async (bugId) => {
      if(window.confirm("Delete this bug?")) {
        try {
            await api.delete(`/bugs/${bugId}`);
            setBugs(prev => prev.filter(b => b._id !== bugId));
        } catch(err) { // eslint-disable-line no-unused-vars
            alert('Failed to delete bug');
        }
      }
  }

  if (loading) return <div>Loading Bugs...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Bug Tracker</h2>
        <button onClick={handleCreateClick} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
            + Report Bug
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bug</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Severity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assignee</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                {bugs.length > 0 ? (
                    bugs.map(bug => (
                        <tr key={bug._id}>
                            <td className="px-6 py-4">
                                <div className="text-sm font-medium text-gray-900">{bug.title}</div>
                                <div className="text-sm text-gray-500 truncate max-w-xs">{bug.description}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                    bug.severity === 'Critical' ? 'bg-red-100 text-red-800' :
                                    bug.severity === 'High' ? 'bg-orange-100 text-orange-800' :
                                    'bg-green-100 text-green-800'
                                }`}>
                                    {bug.severity}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {bug.status}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {bug.assignee ? bug.assignee.name : 'Unassigned'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button onClick={() => handleEditClick(bug)} className="text-blue-600 hover:text-blue-900 mr-4">Edit</button>
                                <button onClick={() => handleDeleteBug(bug._id)} className="text-red-600 hover:text-red-900">Delete</button>
                            </td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">No bugs found.</td>
                    </tr>
                )}
            </tbody>
        </table>
      </div>

      {isFormOpen && (
        <BugForm
            projectId={projectId}
            bug={editingBug}
            onSave={handleSaveBug}
            onCancel={() => setIsFormOpen(false)}
        />
      )}
    </div>
  );
};

export default BugTracker;
