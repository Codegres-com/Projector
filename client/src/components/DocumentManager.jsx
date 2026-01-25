import React, { useState, useEffect, useRef } from 'react';
import api from '../api';

const DocumentManager = ({ projectId }) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const res = await api.get(`/documents?projectId=${projectId}`);
        setDocuments(res.data);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch documents", err);
        setLoading(false);
      }
    };
    fetchDocuments();
  }, [projectId]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    if (e.target.files[0] && !title) {
        setTitle(e.target.files[0].name);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    formData.append('project', projectId);

    try {
      const res = await api.post('/documents', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setDocuments(prev => [res.data, ...prev]);
      setFile(null);
      setTitle('');
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) { // eslint-disable-line no-unused-vars
      alert('Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (docId) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        await api.delete(`/documents/${docId}`);
        setDocuments(prev => prev.filter(d => d._id !== docId));
      } catch (err) { // eslint-disable-line no-unused-vars
        alert('Failed to delete document');
      }
    }
  };

  // Helper to construct URL
  const getDownloadUrl = (filePath) => {
      // filePath is usually "uploads/filename-123.ext"
      // We want "/uploads/filename-123.ext"
      // We assume the server serves "uploads" directory at "/uploads"
      const filename = filePath.split(/[/\\]/).pop(); // Handle both / and \
      return `/uploads/${filename}`;
  };

  const formatSize = (bytes) => {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) return <div>Loading Documents...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Documents</h2>
      </div>

      {/* Upload Area */}
      <div className="bg-gray-50 p-6 rounded-lg border border-dashed border-gray-300 mb-8">
        <form onSubmit={handleUpload} className="flex gap-4 items-end">
            <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Upload File</label>
                <input
                    ref={fileInputRef}
                    id="fileInput"
                    type="file"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0
                        file:text-sm file:font-semibold
                        file:bg-blue-50 file:text-blue-700
                        hover:file:bg-blue-100"
                />
            </div>
            <div className="flex-1">
                 <label className="block text-sm font-medium text-gray-700 mb-1">Title (Optional)</label>
                 <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Document Title"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                 />
            </div>
            <button
                type="submit"
                disabled={!file || uploading}
                className={`px-4 py-2 rounded text-white ${!file || uploading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
                {uploading ? 'Uploading...' : 'Upload'}
            </button>
        </form>
      </div>

      {/* List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {documents.map(doc => (
            <div key={doc._id} className="bg-white p-4 rounded-lg shadow border border-gray-200 flex flex-col justify-between">
                <div>
                    <div className="flex items-start justify-between">
                        <div className="bg-blue-100 p-2 rounded text-blue-600">
                            📄
                        </div>
                        <button onClick={() => handleDelete(doc._id)} className="text-gray-400 hover:text-red-500">×</button>
                    </div>
                    <h3 className="font-medium mt-3 text-gray-900 truncate" title={doc.title}>{doc.title}</h3>
                    <p className="text-xs text-gray-500 mt-1">{doc.originalName}</p>
                    <p className="text-xs text-gray-400 mt-2">
                        {formatSize(doc.size)} • {new Date(doc.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-400">
                        By {doc.uploader?.name}
                    </p>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100">
                    <a
                        href={getDownloadUrl(doc.filePath)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium block text-center"
                    >
                        Download / View
                    </a>
                </div>
            </div>
        ))}
         {documents.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-500">
                No documents uploaded yet.
            </div>
        )}
      </div>
    </div>
  );
};

export default DocumentManager;
