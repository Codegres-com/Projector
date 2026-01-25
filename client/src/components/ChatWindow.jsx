import { useState, useEffect, useRef } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import api from '../api';
import { useAuth } from '../context/AuthContext';

const ChatWindow = ({ projectId, recipientId, title }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState('');
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    try {
      let query = '';
      if (projectId) query = `projectId=${projectId}`;
      else if (recipientId) query = `userId=${recipientId}`;
      else return;

      const res = await api.get(`/messages?${query}`);
      // Only update if length changed or new message to avoid jitter,
      // but for simple polling replacing all is safer for consistency
      // To improve UX, we could diff, but for now simple set is MVP.
      // We check if the last message ID is different to determine if we should scroll
      const lastMsgId = messages.length > 0 ? messages[messages.length - 1]._id : null;
      const newLastMsgId = res.data.length > 0 ? res.data[res.data.length - 1]._id : null;

      setMessages(res.data);
      setLoading(false);

      if (lastMsgId !== newLastMsgId) {
          setTimeout(scrollToBottom, 100);
      }
    } catch (err) {
      console.error('Failed to fetch messages', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000); // Poll every 3 seconds
    return () => clearInterval(interval);
  }, [projectId, recipientId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if ((!content || content === '<p><br></p>') && files.length === 0) return;

    const formData = new FormData();
    formData.append('content', content);
    if (projectId) formData.append('projectId', projectId);
    if (recipientId) formData.append('recipientId', recipientId);

    for (let i = 0; i < files.length; i++) {
        formData.append('attachments', files[i]);
    }

    try {
      await api.post('/messages', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setContent('');
      setFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = '';
      fetchMessages(); // Immediate fetch
    } catch (err) {
      console.error('Failed to send message', err);
      alert('Failed to send message');
    }
  };

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Custom Toolbar for Quill to keep it simple
  const modules = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link'],
      ['clean']
    ],
  };

  return (
    <div className="flex flex-col h-[600px] bg-white border border-gray-200 rounded-lg shadow-sm">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
        <h3 className="text-lg font-semibold text-gray-800">{title || 'Chat'}</h3>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {loading && messages.length === 0 ? (
          <div className="text-center text-gray-500">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-10">No messages yet. Start the conversation!</div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender._id === user?._id;
            return (
              <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[70%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                  <div className="flex items-center gap-2 mb-1">
                    {!isMe && <span className="text-xs font-bold text-gray-600">{msg.sender.name}</span>}
                    <span className="text-xs text-gray-400">{formatTime(msg.createdAt)}</span>
                  </div>

                  <div className={`p-3 rounded-lg shadow-sm break-words ${
                    isMe ? 'bg-blue-500 text-white' : 'bg-white border border-gray-200 text-gray-800'
                  }`}>
                     <div
                        className="prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: msg.content }}
                        style={{ color: isMe ? 'inherit' : undefined }}
                     />
                  </div>

                  {/* Attachments */}
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {msg.attachments.map((att, idx) => {
                          const fileName = att.split('/').pop();
                          const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(att);
                          return (
                              <a
                                key={idx}
                                href={att}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`block overflow-hidden border rounded ${isImage ? 'w-32 h-32' : 'p-2 bg-gray-100 text-xs'}`}
                              >
                                {isImage ? (
                                    <img src={att} alt="attachment" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="flex items-center gap-1">
                                        <span>📎</span>
                                        <span className="truncate max-w-[150px]">{fileName}</span>
                                    </div>
                                )}
                              </a>
                          )
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-200 bg-white rounded-b-lg">
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">

            {/* Rich Text Editor */}
            <div className="bg-white">
                <ReactQuill
                    theme="snow"
                    value={content}
                    onChange={setContent}
                    modules={modules}
                    className="h-24 mb-10" // mb-10 to make space for toolbar if needed or adjust height
                />
            </div>

            {/* Attachments & Send */}
            <div className="flex justify-between items-center mt-2 pt-2">
                <div className="flex items-center gap-2">
                    <label className="cursor-pointer px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded text-gray-600 text-sm flex items-center gap-1 border border-gray-300">
                        <span>📎 Attach</span>
                        <input
                            type="file"
                            multiple
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            className="hidden"
                        />
                    </label>
                    {files.length > 0 && (
                        <span className="text-xs text-gray-500">{files.length} file(s) selected</span>
                    )}
                </div>
                <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition font-medium disabled:opacity-50"
                    disabled={(!content || content === '<p><br></p>') && files.length === 0}
                >
                    Send
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;
