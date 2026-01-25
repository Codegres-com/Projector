import { useState, useEffect } from 'react';
import api from '../api';

const EstimationBuilder = ({ estimation, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    requirement: '',
    client: '',
    items: [],
    ironTriangle: { fixed: [], flexible: '' },
    currency: 'USD',
    totalHours: 0,
    totalCost: 0
  });

  const [clients, setClients] = useState([]);
  const [requirements, setRequirements] = useState([]);
  const [loadingAI, setLoadingAI] = useState(false);

  // Constants
  const TRIANGLE_OPTS = ['Scope', 'Time', 'Cost'];

  useEffect(() => {
    // Initial fetch of clients and requirements
    const loadData = async () => {
        try {
            const [clientsRes, reqsRes] = await Promise.all([
                api.get('/clients'),
                api.get('/requirements')
            ]);
            setClients(clientsRes.data);
            setRequirements(reqsRes.data);
        } catch(err) {
            console.error('Failed to load dependency data', err);
        }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (estimation) {
      setFormData({
        title: estimation.title,
        requirement: estimation.requirement._id || estimation.requirement,
        client: estimation.client._id || estimation.client,
        items: estimation.items || [],
        ironTriangle: estimation.ironTriangle || { fixed: [], flexible: '' },
        currency: estimation.currency || 'USD',
        totalHours: estimation.totalHours || 0,
        totalCost: estimation.totalCost || 0
      });
    }
  }, [estimation]);

  // Recalculate totals whenever items change
  useEffect(() => {
    const hours = formData.items.reduce((acc, item) => acc + (Number(item.hours) || 0), 0);
    const cost = formData.items.reduce((acc, item) => acc + (Number(item.cost) || 0), 0);
    setFormData(prev => ({ ...prev, totalHours: hours, totalCost: cost }));
  }, [formData.items]);


  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRequirementChange = (e) => {
      const reqId = e.target.value;
      const req = requirements.find(r => r._id === reqId);
      // Auto-set client if requirement selected
      if (req) {
          setFormData(prev => ({
              ...prev,
              requirement: reqId,
              client: req.client?._id || req.client
          }));
      } else {
           setFormData(prev => ({ ...prev, requirement: reqId }));
      }
  };

  // Iron Triangle Logic
  const handleTriangleClick = (option) => {
      const { fixed } = formData.ironTriangle;
      let newFixed = [...fixed];

      if (newFixed.includes(option)) {
          // Unselect
          newFixed = newFixed.filter(o => o !== option);
      } else {
          // Select (max 2)
          if (newFixed.length < 2) {
              newFixed.push(option);
          }
      }

      // Determine Flexible
      let newFlexible = '';
      if (newFixed.length === 2) {
          newFlexible = TRIANGLE_OPTS.find(o => !newFixed.includes(o));
      }

      setFormData({
          ...formData,
          ironTriangle: { fixed: newFixed, flexible: newFlexible }
      });
  };

  // Item Management
  const handleAddItem = () => {
      setFormData({
          ...formData,
          items: [...formData.items, { description: '', role: 'Developer', hours: 0, rate: 100, cost: 0 }]
      });
  };

  const handleItemChange = (index, field, value) => {
      const newItems = [...formData.items];
      newItems[index][field] = value;
      // Recalc cost for row
      if (field === 'hours' || field === 'rate') {
          newItems[index].cost = Number(newItems[index].hours) * Number(newItems[index].rate);
      }
      setFormData({ ...formData, items: newItems });
  };

  const handleRemoveItem = (index) => {
       const newItems = formData.items.filter((_, i) => i !== index);
       setFormData({ ...formData, items: newItems });
  };

  // AI Generation
  const handleGenerateAI = async () => {
      if (!formData.requirement) {
          alert('Please select a Requirement first.');
          return;
      }
      setLoadingAI(true);
      try {
          const res = await api.post('/estimations/ai-generate', { requirementId: formData.requirement });
          if (res.data.items) {
              setFormData(prev => ({
                  ...prev,
                  items: res.data.items
              }));
          }
      } catch (err) {
          console.error(err);
          alert('AI Generation failed.');
      } finally {
          setLoadingAI(false);
      }
  };


  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.ironTriangle.fixed.length !== 2) {
        alert('Please select exactly 2 FIXED constraints for the Iron Triangle.');
        return;
    }
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-5xl h-[90vh] flex flex-col">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          {estimation ? 'Edit Estimation' : 'New Estimation'}
        </h2>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
           {/* Top Section: Basic Info */}
           <div className="grid grid-cols-3 gap-6 mb-6">
                <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">Title</label>
                    <input type="text" name="title" value={formData.title} onChange={handleChange} className="shadow border rounded w-full py-2 px-3" required />
                </div>
                <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">Requirement</label>
                    <select name="requirement" value={formData.requirement} onChange={handleRequirementChange} className="shadow border rounded w-full py-2 px-3" required>
                        <option value="">Select Requirement</option>
                        {requirements.map(r => (
                            <option key={r._id} value={r._id}>{r.title}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">Client</label>
                    <select name="client" value={formData.client} onChange={handleChange} className="shadow border rounded w-full py-2 px-3 bg-gray-100" disabled>
                        <option value="">(Auto-filled)</option>
                        {clients.map(c => (
                            <option key={c._id} value={c._id}>{c.company}</option>
                        ))}
                    </select>
                </div>
           </div>

           {/* Middle Section: Iron Triangle & AI */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 p-4 bg-gray-50 rounded border">
                <div>
                    <h3 className="text-sm font-bold text-gray-700 mb-2">Iron Triangle (Select 2 FIXED)</h3>
                    <div className="flex gap-4">
                        {TRIANGLE_OPTS.map(opt => (
                            <button
                                key={opt}
                                type="button"
                                onClick={() => handleTriangleClick(opt)}
                                className={`px-4 py-2 rounded border font-semibold transition
                                    ${formData.ironTriangle.fixed.includes(opt)
                                        ? 'bg-blue-600 text-white border-blue-600'
                                        : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-100'}`}
                            >
                                {opt}
                            </button>
                        ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                        Flexible: <span className="font-bold text-green-600">{formData.ironTriangle.flexible || 'None'}</span>
                    </p>
                </div>
                <div className="flex items-center justify-end">
                    <button
                        type="button"
                        onClick={handleGenerateAI}
                        disabled={loadingAI}
                        className="bg-purple-600 text-white px-6 py-3 rounded shadow hover:bg-purple-700 flex items-center gap-2 disabled:opacity-50"
                    >
                        {loadingAI ? 'Generating...' : '✨ Generate Line Items with AI'}
                    </button>
                </div>
           </div>

           {/* Bottom Section: Line Items */}
           <div className="flex-1 flex flex-col overflow-hidden border rounded-lg">
               <div className="bg-gray-100 p-3 border-b flex justify-between items-center">
                   <h3 className="font-bold text-gray-700">Line Items</h3>
                   <button type="button" onClick={handleAddItem} className="text-sm text-blue-600 hover:underline">+ Add Item</button>
               </div>
               <div className="flex-1 overflow-y-auto p-4 bg-white">
                   <table className="w-full text-left">
                       <thead>
                           <tr className="text-xs text-gray-500 border-b">
                               <th className="pb-2 w-1/2">Description</th>
                               <th className="pb-2">Role</th>
                               <th className="pb-2">Hours</th>
                               <th className="pb-2">Rate</th>
                               <th className="pb-2">Cost</th>
                               <th className="pb-2"></th>
                           </tr>
                       </thead>
                       <tbody>
                           {formData.items.map((item, i) => (
                               <tr key={i} className="border-b last:border-0">
                                   <td className="py-2 pr-2">
                                       <input
                                        type="text"
                                        value={item.description}
                                        onChange={(e) => handleItemChange(i, 'description', e.target.value)}
                                        className="w-full border rounded px-2 py-1"
                                        placeholder="Task description"
                                       />
                                   </td>
                                   <td className="py-2 pr-2">
                                        <input
                                        type="text"
                                        value={item.role}
                                        onChange={(e) => handleItemChange(i, 'role', e.target.value)}
                                        className="w-full border rounded px-2 py-1"
                                       />
                                   </td>
                                   <td className="py-2 pr-2 w-20">
                                       <input
                                        type="number"
                                        value={item.hours}
                                        onChange={(e) => handleItemChange(i, 'hours', e.target.value)}
                                        className="w-full border rounded px-2 py-1 text-right"
                                       />
                                   </td>
                                   <td className="py-2 pr-2 w-20">
                                       <input
                                        type="number"
                                        value={item.rate}
                                        onChange={(e) => handleItemChange(i, 'rate', e.target.value)}
                                        className="w-full border rounded px-2 py-1 text-right"
                                       />
                                   </td>
                                   <td className="py-2 pr-2 w-24 text-right font-mono">
                                       ${item.cost.toLocaleString()}
                                   </td>
                                   <td className="py-2 text-right">
                                       <button type="button" onClick={() => handleRemoveItem(i)} className="text-red-500 hover:text-red-700">×</button>
                                   </td>
                               </tr>
                           ))}
                       </tbody>
                   </table>
               </div>
               <div className="bg-gray-50 p-4 border-t flex justify-between items-center">
                   <div className="text-sm text-gray-600">
                       Currency: <select name="currency" value={formData.currency} onChange={handleChange} className="border rounded ml-2 p-1"><option>USD</option><option>EUR</option><option>GBP</option></select>
                   </div>
                   <div className="text-right">
                       <p className="text-sm text-gray-500">Total Hours: <span className="font-bold text-gray-800">{formData.totalHours}</span></p>
                       <p className="text-xl font-bold text-green-600">Total Cost: ${formData.totalCost.toLocaleString()}</p>
                   </div>
               </div>
           </div>

           <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
                <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Save Estimation</button>
           </div>
        </form>
      </div>
    </div>
  );
};

export default EstimationBuilder;
