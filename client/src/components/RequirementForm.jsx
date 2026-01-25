import { useState, useEffect } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import api from '../api';

const RequirementForm = ({ requirement, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    details: '',
    client: '',
    status: 'Draft'
  });
  const [clients, setClients] = useState([]);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await api.get('/clients');
        setClients(res.data);
      } catch (err) {
        console.error('Error fetching clients:', err);
      }
    };
    fetchClients();
  }, []);

  useEffect(() => {
    if (requirement) {
      setFormData({
        title: requirement.title || '',
        details: requirement.details || '',
        client: requirement.client?._id || requirement.client || '',
        status: requirement.status || 'Draft'
      });
    }
  }, [requirement]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleQuillChange = (value) => {
    setFormData({ ...formData, details: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-4xl h-[90vh] flex flex-col">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          {requirement ? 'Edit Requirement' : 'New Requirement'}
        </h2>
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="grid grid-cols-2 gap-6 mb-4">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">Client</label>
                <select
                  name="client"
                  value={formData.client}
                  onChange={handleChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                  disabled={!!requirement} // Prevent changing client on edit for simplicity if preferred, or allow it.
                >
                  <option value="">Select a Client</option>
                  {clients.map(c => (
                    <option key={c._id} value={c._id}>{c.company} ({c.name})</option>
                  ))}
                </select>
              </div>
          </div>

          <div className="mb-4 flex-1 flex flex-col">
            <label className="block text-gray-700 text-sm font-bold mb-2">Requirement Details</label>
             <div className="flex-1 overflow-hidden flex flex-col">
                <ReactQuill
                    theme="snow"
                    value={formData.details}
                    onChange={handleQuillChange}
                    className="h-full flex flex-col"
                    modules={{
                        toolbar: [
                            [{ 'header': [1, 2, false] }],
                            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                            [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
                            ['link', 'image'],
                            ['clean']
                        ],
                    }}
                    style={{ height: '100%', flex: 1, display: 'flex', flexDirection: 'column' }}
                />
             </div>
             {/* Hacky fix for ReactQuill styling in flex container */}
             <style>{`
                 .ql-container { flex: 1; overflow-y: auto; }
                 .ql-editor { min-height: 200px; }
             `}</style>
          </div>

          <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
            <div>
                 <label className="mr-2 text-sm font-bold text-gray-700">Status:</label>
                 <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="border rounded py-1 px-2 text-sm"
                 >
                     <option value="Draft">Draft</option>
                     <option value="Finalized">Finalized</option>
                     <option value="Archived">Archived</option>
                 </select>
            </div>
            <div className="flex gap-2">
                <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                >
                Cancel
                </button>
                <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                Save Requirement
                </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RequirementForm;
