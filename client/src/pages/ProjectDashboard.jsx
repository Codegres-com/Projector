import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import ProjectForm from '../components/ProjectForm';

const ProjectDashboard = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const fetchProject = async () => {
    try {
      const res = await api.get(`/projects/${id}`);
      setProject(res.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch project details');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
  }, [id]);

  const handleEditSave = async (formData) => {
    try {
      const res = await api.put(`/projects/${id}`, formData);
      setProject(res.data);
      setIsEditModalOpen(false);
    } catch (err) {
      alert('Failed to update project');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      try {
        await api.delete(`/projects/${id}`);
        navigate('/projects');
      } catch (err) {
        alert('Failed to delete project');
      }
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;
  if (!project) return <div className="p-6">Project not found</div>;

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

      {/* Modules Placeholders */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-gray-50 p-6 rounded-lg border border-dashed border-gray-300 flex flex-col items-center justify-center h-48">
            <h3 className="text-lg font-medium text-gray-400">Kanban Board</h3>
            <p className="text-sm text-gray-400">Coming Soon</p>
        </div>
        <div className="bg-gray-50 p-6 rounded-lg border border-dashed border-gray-300 flex flex-col items-center justify-center h-48">
            <h3 className="text-lg font-medium text-gray-400">Documents</h3>
            <p className="text-sm text-gray-400">Coming Soon</p>
        </div>
        <div className="bg-gray-50 p-6 rounded-lg border border-dashed border-gray-300 flex flex-col items-center justify-center h-48">
            <h3 className="text-lg font-medium text-gray-400">Requirements</h3>
            <p className="text-sm text-gray-400">Coming Soon</p>
        </div>
        <div className="bg-gray-50 p-6 rounded-lg border border-dashed border-gray-300 flex flex-col items-center justify-center h-48">
            <h3 className="text-lg font-medium text-gray-400">Bug Tracker</h3>
            <p className="text-sm text-gray-400">Coming Soon</p>
        </div>
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
