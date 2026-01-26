import { useState, useEffect } from 'react';
import api from '../api';
import QuotationGenerator from '../components/QuotationGenerator';

const QuotationList = () => {
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuote, setEditingQuote] = useState(null);

  const fetchQuotations = async () => {
    try {
      const res = await api.get('/quotations');
      setQuotations(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotations();
  }, []);

  const handleCreate = () => {
    setEditingQuote(null);
    setIsModalOpen(true);
  };

  const handleEdit = (quote) => {
    setEditingQuote(quote);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this quotation?')) {
      try {
        await api.delete(`/quotations/${id}`);
        fetchQuotations();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleSave = async (formData) => {
    try {
      if (editingQuote) {
        await api.put(`/quotations/${editingQuote._id}`, formData);
      } else {
        await api.post('/quotations', formData);
      }
      setIsModalOpen(false);
      fetchQuotations();
    } catch (err) {
      console.error(err);
      alert('Error saving quotation');
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Quotations</h1>
        <button
          onClick={handleCreate}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Generate New Quote
        </button>
      </div>

      <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project / Estimation</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valid Until</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {quotations.map((quote) => (
              <tr key={quote._id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{quote.estimation?.title}</div>
                  <div className="text-xs text-gray-500">ID: {quote._id.substring(0,8)}...</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{quote.client?.company}</div>
                  <div className="text-xs text-gray-500">{quote.client?.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                  ${quote.estimation?.totalCost?.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                        ${quote.status === 'Approved' ? 'bg-green-100 text-green-800' :
                          quote.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                          quote.status === 'Sent' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'}`}>
                        {quote.status}
                    </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(quote.validUntil).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => handleEdit(quote)} className="text-indigo-600 hover:text-indigo-900 mr-4">View/Edit</button>
                  <button onClick={() => handleDelete(quote._id)} className="text-red-600 hover:text-red-900">Delete</button>
                </td>
              </tr>
            ))}
             {quotations.length === 0 && (
                <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-gray-500">No quotations found. Generate one from your estimations.</td>
                </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <QuotationGenerator
          quotation={editingQuote}
          onSave={handleSave}
          onCancel={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};

export default QuotationList;
