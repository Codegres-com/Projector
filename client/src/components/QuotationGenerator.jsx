import { useState, useEffect } from 'react';
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink, Font } from '@react-pdf/renderer';
import api from '../api';

// Register a font (optional, using default Helvetica for now)
// Font.register({ family: 'Roboto', src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf' });

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica', color: '#333' },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  brand: { fontSize: 24, fontWeight: 'bold', color: '#2563EB' }, // Blue-600
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 10, marginTop: 20 },
  section: { margin: 10, padding: 10, flexGrow: 1 },
  row: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#EEE', paddingVertical: 8, alignItems: 'center' },
  colDesc: { width: '40%' },
  colRole: { width: '20%' },
  colHours: { width: '10%', textAlign: 'right' },
  colRate: { width: '15%', textAlign: 'right' },
  colCost: { width: '15%', textAlign: 'right' },
  tableHeader: { fontWeight: 'bold', fontSize: 10, color: '#666', borderBottomWidth: 2, borderBottomColor: '#CCC' },
  tableRow: { fontSize: 10 },
  totalRow: { flexDirection: 'row', marginTop: 10, justifyContent: 'flex-end', paddingTop: 10 },
  totalText: { fontSize: 14, fontWeight: 'bold' },
  ironTriangleBox: { marginTop: 30, padding: 15, backgroundColor: '#F3F4F6', borderRadius: 4 },
  ironTriangleTitle: { fontSize: 12, fontWeight: 'bold', marginBottom: 5, color: '#374151' },
  ironTriangleText: { fontSize: 10, color: '#4B5563' },
  disclaimer: { fontSize: 8, color: '#999', marginTop: 50, textAlign: 'center' },
  clientInfo: { fontSize: 10, marginBottom: 20 },
  label: { fontWeight: 'bold', fontSize: 10 }
});

// PDF Document Component
const QuotationPDF = ({ quotation }) => {
    const { estimation, client, validUntil } = quotation;
    if (!estimation) return null;

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.brand}>Projector Agency</Text>
                        <Text style={{ fontSize: 10, color: '#666' }}>123 Creative Blvd, Tech City</Text>
                        <Text style={{ fontSize: 10, color: '#666' }}>contact@projector.agency</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                        <Text style={{ fontSize: 18, fontWeight: 'bold' }}>QUOTATION</Text>
                        <Text style={{ fontSize: 10 }}>Date: {new Date().toLocaleDateString()}</Text>
                        <Text style={{ fontSize: 10 }}>Valid Until: {new Date(validUntil).toLocaleDateString()}</Text>
                    </View>
                </View>

                {/* Client Info */}
                <View style={{ marginTop: 20, marginBottom: 30 }}>
                    <Text style={{ fontSize: 12, fontWeight: 'bold', marginBottom: 5 }}>To:</Text>
                    <Text style={styles.clientInfo}>{client.company}</Text>
                    <Text style={styles.clientInfo}>Attn: {client.name}</Text>
                    <Text style={styles.clientInfo}>{client.email}</Text>
                    <Text style={styles.clientInfo}>{client.address}</Text>
                </View>

                {/* Project Title */}
                <Text style={styles.title}>{estimation.title}</Text>
                <Text style={{ fontSize: 10, marginBottom: 20, color: '#666' }}>Based on Requirement: {estimation.requirement?.title}</Text>

                {/* Line Items Table */}
                <View style={[styles.row, styles.tableHeader]}>
                    <Text style={styles.colDesc}>Description</Text>
                    <Text style={styles.colRole}>Role</Text>
                    <Text style={styles.colHours}>Hours</Text>
                    <Text style={styles.colRate}>Rate</Text>
                    <Text style={styles.colCost}>Total</Text>
                </View>

                {estimation.items?.map((item, i) => (
                    <View key={i} style={[styles.row, styles.tableRow]}>
                        <Text style={styles.colDesc}>{item.description}</Text>
                        <Text style={styles.colRole}>{item.role}</Text>
                        <Text style={styles.colHours}>{item.hours}</Text>
                        <Text style={styles.colRate}>${item.rate}</Text>
                        <Text style={styles.colCost}>${item.cost?.toLocaleString()}</Text>
                    </View>
                ))}

                {/* Totals */}
                <View style={styles.totalRow}>
                    <Text style={styles.totalText}>Total Estimate: ${estimation.totalCost?.toLocaleString()} {estimation.currency}</Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                     <Text style={{ fontSize: 10, color: '#666' }}>Total Hours: {estimation.totalHours}</Text>
                </View>

                {/* Iron Triangle Disclosure */}
                <View style={styles.ironTriangleBox}>
                    <Text style={styles.ironTriangleTitle}>Project Delivery Strategy (Iron Triangle)</Text>
                    <Text style={styles.ironTriangleText}>
                        This project is estimated based on the following constraints:
                    </Text>
                    <View style={{ flexDirection: 'row', marginTop: 5 }}>
                        <Text style={{ fontSize: 10, fontWeight: 'bold' }}>FIXED: </Text>
                        <Text style={styles.ironTriangleText}>{estimation.ironTriangle?.fixed?.join(' & ')}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', marginTop: 2 }}>
                        <Text style={{ fontSize: 10, fontWeight: 'bold' }}>FLEXIBLE: </Text>
                        <Text style={styles.ironTriangleText}>{estimation.ironTriangle?.flexible}</Text>
                    </View>
                    <Text style={{ fontSize: 9, marginTop: 5, fontStyle: 'italic', color: '#666' }}>
                        *By accepting this quote, you acknowledge that the "{estimation.ironTriangle?.flexible}" aspect may vary to maintain the fixed constraints.
                    </Text>
                </View>

                {/* Footer */}
                <Text style={styles.disclaimer}>
                    This quotation is subject to our standard terms and conditions.
                    Please sign and return to accept this proposal.
                </Text>
            </Page>
        </Document>
    );
};


const QuotationGenerator = ({ quotation, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
      estimation: '',
      client: '',
      validUntil: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // +14 days default
      status: 'Draft'
  });

  const [estimations, setEstimations] = useState([]);
  const [selectedEstimation, setSelectedEstimation] = useState(null);

  useEffect(() => {
      // Fetch available estimations
      const fetchEst = async () => {
          try {
              const res = await api.get('/estimations');
              setEstimations(res.data);
          } catch (err) { console.error(err); }
      };
      fetchEst();
  }, []);

  useEffect(() => {
    if (quotation) {
        setFormData({
            estimation: quotation.estimation._id || quotation.estimation,
            client: quotation.client._id || quotation.client,
            validUntil: new Date(quotation.validUntil).toISOString().split('T')[0],
            status: quotation.status
        });
        // Pre-load selected estimation data for PDF
        if (quotation.estimation && typeof quotation.estimation === 'object') {
             setSelectedEstimation(quotation.estimation);
        }
    }
  }, [quotation]);

  const handleEstimationChange = (e) => {
      const estId = e.target.value;
      const est = estimations.find(e => e._id === estId);

      setFormData(prev => ({
          ...prev,
          estimation: estId,
          client: est?.client?._id || est?.client // Auto-link client from estimation
      }));
      setSelectedEstimation(est);
  };

  const handleChange = (e) => {
      setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
      e.preventDefault();
      onSave(formData);
  };

  // Construct a temporary full quotation object for PDF rendering
  const pdfData = {
      estimation: selectedEstimation,
      client: selectedEstimation?.client,
      validUntil: formData.validUntil,
      status: formData.status
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-4xl h-[90vh] flex flex-col">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          {quotation ? 'Edit Quotation' : 'Generate Quotation'}
        </h2>

        <div className="flex-1 flex gap-6 overflow-hidden">
            {/* Form Side */}
            <form onSubmit={handleSubmit} className="w-1/3 flex flex-col">
                 <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Select Estimation</label>
                    <select
                        name="estimation"
                        value={formData.estimation}
                        onChange={handleEstimationChange}
                        className="shadow border rounded w-full py-2 px-3"
                        required
                        disabled={!!quotation} // Lock estimation on edit if desired
                    >
                        <option value="">Select...</option>
                        {estimations.map(e => (
                            <option key={e._id} value={e._id}>{e.title} - ${e.totalCost}</option>
                        ))}
                    </select>
                 </div>

                 {selectedEstimation && (
                     <div className="mb-4 p-4 bg-gray-50 rounded text-sm">
                         <p><strong>Client:</strong> {selectedEstimation.client?.company}</p>
                         <p><strong>Total:</strong> ${selectedEstimation.totalCost?.toLocaleString()}</p>
                         <p><strong>Strategy:</strong> {selectedEstimation.ironTriangle?.fixed?.join(' & ')} Fixed</p>
                     </div>
                 )}

                 <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Valid Until</label>
                    <input
                        type="date"
                        name="validUntil"
                        value={formData.validUntil}
                        onChange={handleChange}
                        className="shadow border rounded w-full py-2 px-3"
                        required
                    />
                 </div>

                 <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Status</label>
                    <select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        className="shadow border rounded w-full py-2 px-3"
                    >
                        <option value="Draft">Draft</option>
                        <option value="Sent">Sent</option>
                        <option value="Approved">Approved</option>
                        <option value="Rejected">Rejected</option>
                    </select>
                 </div>

                 <div className="mt-auto flex gap-2">
                     <button type="button" onClick={onCancel} className="flex-1 px-4 py-2 bg-gray-300 rounded">Cancel</button>
                     <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded">Save</button>
                 </div>
            </form>

            {/* Preview Side */}
            <div className="w-2/3 bg-gray-100 rounded border p-4 flex flex-col items-center justify-center">
                {selectedEstimation ? (
                    <div className="text-center">
                        <p className="mb-4 font-semibold text-gray-600">PDF Ready for Generation</p>
                        <PDFDownloadLink
                            document={<QuotationPDF quotation={pdfData} />}
                            fileName={`Quote_${selectedEstimation.title.replace(/\s+/g, '_')}.pdf`}
                            className="bg-red-600 text-white px-6 py-3 rounded shadow hover:bg-red-700 flex items-center justify-center gap-2"
                        >
                            {({ loading }) => (loading ? 'Loading PDF...' : 'Download PDF Quote')}
                        </PDFDownloadLink>
                        <p className="text-xs text-gray-500 mt-4 max-w-xs mx-auto">
                            Includes Iron Triangle Disclosure: <br/>
                            Fixed: {selectedEstimation.ironTriangle?.fixed?.join(', ')}
                        </p>
                    </div>
                ) : (
                    <p className="text-gray-400">Select an estimation to preview PDF download</p>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default QuotationGenerator;
