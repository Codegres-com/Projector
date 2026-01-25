import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import ProjectForm from '../components/ProjectForm';
import { useAuth } from '../context/AuthContext';

const ProjectList = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProject, setCurrentProject] = useState(null);
  const { user } = useAuth(); // Assuming useAuth provides user info

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects');
      setProjects(res.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch projects');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleAddClick = () => {
    setCurrentProject(null);
    setIsModalOpen(true);
  };

  const handleSave = async (formData) => {
    try {
        if (currentProject) {
            // Update logic is usually inside the Dashboard for detailed edit, but if we reused form here:
             const res = await api.put(`/projects/${currentProject._id}`, formData);
             setProjects(projects.map(p => (p._id === currentProject._id ? res.data : p)));
        } else {
            // Create
            const res = await api.post('/projects', formData);
            setProjects([res.data, ...projects]);
        }
        setIsModalOpen(false);
    } catch (err) {
        alert(err.response?.data?.message || 'Failed to save project');
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  return (
    <div>
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Projects</h2>
            <button
                onClick={handleAddClick}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2"
            >
                <span>+ New Project</span>
            </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map(project => (
                <div key={project._id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                        <Link to={`/projects/${project._id}`} className="text-xl font-bold text-blue-600 hover:underline">
                            {project.name}
                        </Link>
                         <span className={`px-2 py-1 text-xs rounded-full ${
                            project.status === 'Active' ? 'bg-green-100 text-green-800' :
                            project.status === 'Completed' ? 'bg-gray-100 text-gray-800' :
                            'bg-yellow-100 text-yellow-800'
                        }`}>
                            {project.status}
                        </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{project.description || 'No description'}</p>

                    <div className="text-sm text-gray-500 space-y-1">
                        <p><span className="font-medium">Client:</span> {project.client?.name || 'N/A'}</p>
                        <p><span className="font-medium">Manager:</span> {project.manager?.name || 'N/A'}</p>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center text-xs text-gray-400">
                        <span>Started: {project.startDate ? new Date(project.startDate).toLocaleDateString() : 'TBD'}</span>
                    </div>
                </div>
            ))}
        </div>

        {isModalOpen && (
            <ProjectForm
                project={currentProject}
                onSave={handleSave}
                onCancel={() => setIsModalOpen(false)}
            />
        )}
    </div>
  );
};
export default ProjectList;
