import { useState, useEffect } from 'react';
import api from '../api';
import EstimationBuilder from '../components/EstimationBuilder';

const EstimationList = () => {
  const [estimations, setEstimations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEst, setEditingEst] = useState(null);

  const fetchEstimations = async () => {
    try {
      const res = await api.get('/estimations');
      setEstimations(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEstimations();
  }, []);

  const handleCreate = () => {
    setEditingEst(null);
    setIsModalOpen(true);
  };

  const handleEdit = (est) => {
    setEditingEst(est);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this estimation?')) {
      try {
        await api.delete(`/estimations/${id}`);
        fetchEstimations();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleSave = async (formData) => {
    try {
      if (editingEst) {
        await api.put(`/estimations/${editingEst._id}`, formData);
      } else {
        await api.post('/estimations', formData);
      }
      setIsModalOpen(false);
      fetchEstimations();
    } catch (err) {
      console.error(err);
      alert('Error saving estimation');
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Estimation Builder</h1>
        <button
          onClick={handleCreate}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          New Estimation
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {estimations.map((est) => (
              <div key={est._id} className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition">
                  <div className="flex justify-between items-start mb-4">
                      <div>
                          <h3 className="text-lg font-bold text-gray-900">{est.title}</h3>
                          <p className="text-sm text-gray-500">for {est.client?.company}</p>
                      </div>
                      <div className="text-right">
                          <p className="text-xl font-bold text-green-600">${est.totalCost?.toLocaleString()}</p>
                          <p className="text-xs text-gray-500">{est.totalHours} hours</p>
                      </div>
                  </div>

                  <div className="mb-4">
                      <p className="text-xs font-semibold text-gray-400 uppercase">Requirement</p>
                      <p className="text-sm text-gray-700 truncate">{est.requirement?.title}</p>
                  </div>

                  <div className="mb-4">
                      <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Iron Triangle Strategy</p>
                      <div className="flex gap-2">
                          {est.ironTriangle?.fixed?.map(f => (
                              <span key={f} className="bg-gray-800 text-white text-xs px-2 py-1 rounded">{f} (Fixed)</span>
                          ))}
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                              {est.ironTriangle?.flexible} (Flexible)
                          </span>
                      </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t">
                      <button onClick={() => handleEdit(est)} className="text-sm text-blue-600 hover:text-blue-800">Edit</button>
                      <button onClick={() => handleDelete(est._id)} className="text-sm text-red-600 hover:text-red-800">Delete</button>
                  </div>
              </div>
          ))}
      </div>

      {estimations.length === 0 && (
          <div className="text-center py-12 text-gray-500">
              No estimations found. Create one to get started.
          </div>
      )}

      {isModalOpen && (
        <EstimationBuilder
          estimation={editingEst}
          onSave={handleSave}
          onCancel={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};

export default EstimationList;
