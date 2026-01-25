import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import ProjectForm from '../components/ProjectForm';
import KanbanBoard from '../components/KanbanBoard';
import BugTracker from '../components/BugTracker';
import DocumentManager from '../components/DocumentManager';
import CredentialManager from '../components/CredentialManager';
import DecisionLogManager from '../components/DecisionLogManager';

const ProjectDashboard = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Overview');

  // Stats for Overview
  const [stats, setStats] = useState({
      tasks: 0,
      openBugs: 0,
      docs: 0,
      credentials: 0,
      decisions: 0
  });

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await api.get(`/projects/${id}`);
        setProject(res.data);
        setLoading(false);

        // Fetch stats
        const tasksRes = await api.get(`/tasks?projectId=${id}`);
        const bugsRes = await api.get(`/bugs?projectId=${id}`);
        const docsRes = await api.get(`/documents?projectId=${id}`);
        const credsRes = await api.get(`/credentials?projectId=${id}`);
        const logsRes = await api.get(`/decision-logs?projectId=${id}`);

        setStats({
            tasks: tasksRes.data.length,
            openBugs: bugsRes.data.filter(b => b.status === 'Open').length,
            docs: docsRes.data.length,
            credentials: credsRes.data.length,
            decisions: logsRes.data.length
        });

      } catch (err) { // eslint-disable-line no-unused-vars
        setError('Failed to fetch project details');
        setLoading(false);
      }
    };
    fetchProject();
  }, [id]);

  const handleEditSave = async (formData) => {
    try {
      const res = await api.put(`/projects/${id}`, formData);
      setProject(res.data);
      setIsEditModalOpen(false);
    } catch (err) { // eslint-disable-line no-unused-vars
      alert('Failed to update project');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      try {
        await api.delete(`/projects/${id}`);
        navigate('/projects');
      } catch (err) { // eslint-disable-line no-unused-vars
        alert('Failed to delete project');
      }
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;
  if (!project) return <div className="p-6">Project not found</div>;

  const renderTabContent = () => {
      switch(activeTab) {
          case 'Kanban':
              return <KanbanBoard projectId={id} />;
          case 'Bugs':
              return <BugTracker projectId={id} />;
          case 'Documents':
              return <DocumentManager projectId={id} />;
          case 'Credentials':
              return <CredentialManager projectId={id} />;
          case 'Decisions':
              return <DecisionLogManager projectId={id} />;
          case 'Overview':
          default:
              return (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div onClick={() => setActiveTab('Kanban')} className="bg-blue-50 p-6 rounded-lg border border-blue-100 cursor-pointer hover:bg-blue-100 transition">
                        <h3 className="text-lg font-bold text-blue-900">Tasks</h3>
                        <p className="text-3xl font-bold text-blue-600 my-2">{stats.tasks}</p>
                        <p className="text-sm text-blue-800">Total Tasks</p>
                    </div>
                    <div onClick={() => setActiveTab('Bugs')} className="bg-red-50 p-6 rounded-lg border border-red-100 cursor-pointer hover:bg-red-100 transition">
                        <h3 className="text-lg font-bold text-red-900">Bugs</h3>
                        <p className="text-3xl font-bold text-red-600 my-2">{stats.openBugs}</p>
                        <p className="text-sm text-red-800">Open Bugs</p>
                    </div>
                    <div onClick={() => setActiveTab('Documents')} className="bg-gray-50 p-6 rounded-lg border border-gray-100 cursor-pointer hover:bg-gray-100 transition">
                        <h3 className="text-lg font-bold text-gray-900">Documents</h3>
                        <p className="text-3xl font-bold text-gray-600 my-2">{stats.docs}</p>
                        <p className="text-sm text-gray-800">Files Uploaded</p>
                    </div>
                    <div onClick={() => setActiveTab('Credentials')} className="bg-purple-50 p-6 rounded-lg border border-purple-100 cursor-pointer hover:bg-purple-100 transition">
                        <h3 className="text-lg font-bold text-purple-900">Credentials</h3>
                        <p className="text-3xl font-bold text-purple-600 my-2">{stats.credentials}</p>
                        <p className="text-sm text-purple-800">Stored Credentials</p>
                    </div>
                    <div onClick={() => setActiveTab('Decisions')} className="bg-orange-50 p-6 rounded-lg border border-orange-100 cursor-pointer hover:bg-orange-100 transition">
                        <h3 className="text-lg font-bold text-orange-900">Decisions</h3>
                        <p className="text-3xl font-bold text-orange-600 my-2">{stats.decisions}</p>
                        <p className="text-sm text-orange-800">Decision Logs</p>
                    </div>
                </div>
              );
      }
  };

  return (
    <div>
      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3">
               <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
               <span className={`px-3 py-1 text-sm rounded-full ${
                            project.status === 'Active' ? 'bg-green-100 text-green-800' :
                            project.status === 'Completed' ? 'bg-gray-100 text-gray-800' :
                            'bg-yellow-100 text-yellow-800'
                        }`}>
                    {project.status}
                </span>
            </div>
            <p className="text-gray-600 mt-2">{project.description}</p>
          </div>
          <div className="flex gap-2">
            <button
                onClick={() => setIsEditModalOpen(true)}
                className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded border border-blue-200"
            >
                Edit
            </button>
            <button
                onClick={handleDelete}
                className="px-4 py-2 text-red-600 hover:bg-red-50 rounded border border-red-200"
            >
                Delete
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6 pt-6 border-t border-gray-100">
            <div>
                <span className="text-xs font-semibold text-gray-500 uppercase">Client</span>
                <p className="font-medium">{project.client?.name || 'N/A'}</p>
                <p className="text-xs text-gray-500">{project.client?.email}</p>
            </div>
            <div>
                <span className="text-xs font-semibold text-gray-500 uppercase">Manager</span>
                <p className="font-medium">{project.manager?.name || 'N/A'}</p>
            </div>
            <div>
                <span className="text-xs font-semibold text-gray-500 uppercase">Dates</span>
                <p className="text-sm">Start: {project.startDate ? new Date(project.startDate).toLocaleDateString() : '-'}</p>
                <p className="text-sm">End: {project.endDate ? new Date(project.endDate).toLocaleDateString() : '-'}</p>
            </div>
            <div>
                <span className="text-xs font-semibold text-gray-500 uppercase">Team</span>
                <div className="flex -space-x-2 mt-1">
                    {project.team && project.team.length > 0 ? (
                        project.team.map((member, i) => (
                            <div key={member._id || i} className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs border-2 border-white" title={member.name}>
                                {member.name ? member.name.charAt(0) : '?'}
                            </div>
                        ))
                    ) : (
                        <span className="text-sm text-gray-400">No team assigned</span>
                    )}
                </div>
            </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
              {['Overview', 'Kanban', 'Documents', 'Bugs', 'Credentials', 'Decisions'].map((tab) => (
                  <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`
                          whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                          ${activeTab === tab
                              ? 'border-blue-500 text-blue-600'
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                      `}
                  >
                      {tab}
                  </button>
              ))}
          </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
          {renderTabContent()}
      </div>

       {isEditModalOpen && (
        <ProjectForm
          project={project}
          onSave={handleEditSave}
          onCancel={() => setIsEditModalOpen(false)}
        />
      )}
    </div>
  );
};

export default ProjectDashboard;
