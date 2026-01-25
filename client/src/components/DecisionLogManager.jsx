import { useState, useEffect } from 'react';
import api from '../api';

const DecisionLogManager = ({ projectId }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    status: 'Proposed',
    context: '',
    decision: '',
    rationale: ''
  });

  useEffect(() => {
    fetchLogs();
  }, [projectId]);

  const fetchLogs = async () => {
    try {
      const res = await api.get(`/decision-logs?projectId=${projectId}`);
      setLogs(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch decision logs", err);
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
        const res = await api.put(`/decision-logs/${editingId}`, formData);
        setLogs(logs.map(l => l._id === editingId ? res.data : l));
      } else {
        const res = await api.post('/decision-logs', { ...formData, project: projectId });
        setLogs([res.data, ...logs]);
      }
      closeModal();
    } catch (err) { // eslint-disable-line no-unused-vars
      alert('Failed to save decision log');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this decision log?')) {
      try {
        await api.delete(`/decision-logs/${id}`);
        setLogs(logs.filter(l => l._id !== id));
      } catch (err) { // eslint-disable-line no-unused-vars
        alert('Failed to delete decision log');
      }
    }
  };

  const openModal = (log = null) => {
    if (log) {
      setEditingId(log._id);
      setFormData({
        title: log.title,
        status: log.status,
        context: log.context,
        decision: log.decision,
        rationale: log.rationale
      });
    } else {
      setEditingId(null);
      setFormData({
        title: '',
        status: 'Proposed',
        context: '',
        decision: '',
        rationale: ''
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Approved': return 'bg-green-100 text-green-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      case 'Proposed':
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (loading) return <div>Loading Decision Logs...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Decision Logs</h2>
        <button
          onClick={() => openModal()}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Log Decision
        </button>
      </div>

      <div className="space-y-4">
        {logs.map(log => (
          <div key={log._id} className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <h3 className="font-bold text-lg text-gray-900">{log.title}</h3>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(log.status)}`}>
                  {log.status}
                </span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => openModal(log)} className="text-blue-500 hover:text-blue-700 text-sm">Edit</button>
                <button onClick={() => handleDelete(log._id)} className="text-red-500 hover:text-red-700 text-sm">Delete</button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Context</h4>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{log.context}</p>
              </div>
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Decision</h4>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{log.decision}</p>
              </div>
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Rationale</h4>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{log.rationale}</p>
              </div>
            </div>

            <div className="mt-4 text-xs text-gray-400">
               Logged on {new Date(log.createdAt).toLocaleDateString()}
            </div>
          </div>
        ))}

        {logs.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No decisions logged yet.
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">{editingId ? 'Edit Decision Log' : 'Log New Decision'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2">
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
                      <label className="block text-sm font-medium text-gray-700">Status</label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                      >
                        <option value="Proposed">Proposed</option>
                        <option value="Approved">Approved</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Context (The "Why" and "What")</label>
                  <textarea
                    name="context"
                    required
                    rows="3"
                    value={formData.context}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                    placeholder="Describe the situation, problem, or constraints..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Decision</label>
                  <textarea
                    name="decision"
                    required
                    rows="3"
                    value={formData.decision}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                    placeholder="What was decided?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Rationale</label>
                  <textarea
                    name="rationale"
                    required
                    rows="3"
                    value={formData.rationale}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                    placeholder="Why was this decision made over alternatives?"
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
                  Save Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DecisionLogManager;
