import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout, reset } from '../features/authSlice';
import { getProjects, createProject } from '../features/projectSlice';
import axios from 'axios';

const Dashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const { projects = [], isLoading } = useSelector((state) => state.projects);

  const [showModal, setShowModal] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '', memberIds: [], assignedManagerId: '' });
  const [allUsers, setAllUsers] = useState([]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else {
      dispatch(getProjects());
      
      if (user.role === 'MANAGER' || user.role === 'ADMIN') {
        const config = {
          headers: { Authorization: `Bearer ${user.token}` },
        };

        axios.get(`${import.meta.env.VITE_API_BASE_URL}/users`, config)
          .then(res => setAllUsers(res.data))
          .catch(err => console.error(err));
      }
    }
  }, [user, navigate, dispatch]);

  const handleCreateProject = (e) => {
    e.preventDefault();
    dispatch(createProject(newProject));
    setShowModal(false);
    setNewProject({ name: '', description: '', memberIds: [], assignedManagerId: '' });
  };

  const toggleUserSelection = (userId) => {
    setNewProject(prev => {
      const isSelected = prev.memberIds.includes(userId);
      if (isSelected) return { ...prev, memberIds: prev.memberIds.filter(id => id !== userId) };
      else return { ...prev, memberIds: [...prev.memberIds, userId] };
    });
  };

  const onLogout = () => {
    dispatch(logout());
    dispatch(reset());
    navigate('/login');
  };

  const managers = Array.isArray(allUsers) ? allUsers.filter(u => u.role === 'MANAGER') : [];
  const employees = Array.isArray(allUsers) ? allUsers.filter(u => u.role === 'USER') : [];

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-600">Task Handler</h1>
        <div className="flex items-center gap-4">
          <span className="font-medium text-gray-700">{user?.name} ({user?.role})</span>
          <button onClick={onLogout} className="bg-red-500 text-white px-4 py-2 rounded text-sm hover:bg-red-600 transition">Logout</button>
        </div>
      </nav>

      <div className="p-8 max-w-7xl mx-auto">
        
        {(user?.role === 'MANAGER' || user?.role === 'ADMIN') && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">{user.role === 'ADMIN' ? 'All Projects' : 'My Projects'}</h2>
              <button onClick={() => setShowModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition">+ New Project</button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.isArray(projects) && projects.map((project) => (
                <div key={project.id} className="bg-white p-6 rounded shadow border-t-4 border-blue-500 hover:shadow-lg transition">
                  <h3 className="font-bold text-xl mb-2">{project.name}</h3>
                  <p className="text-gray-600 text-sm mb-4">{project.description}</p>
                  
                  {user.role === 'ADMIN' && (
                    <p className="text-xs text-blue-800 bg-blue-100 p-1 rounded inline-block mb-2">
                       Manager: {project.manager?.name || 'Self'}
                    </p>
                  )}

                  <div className="text-xs text-gray-500 mb-4">
                    <span className="font-semibold">Team: </span>
                    {project.members && project.members.length > 0 ? project.members.map(m => m.name).join(', ') : 'No members'}
                  </div>
                  <div className="mt-4 flex justify-end">
                    <button onClick={() => navigate(`/project/${project.id}`)} className="text-blue-600 text-sm font-semibold hover:underline flex items-center gap-1">Manage Tasks →</button>
                  </div>
                </div>
              ))}
              
              {!isLoading && Array.isArray(projects) && projects.length === 0 && (
                <p className="text-gray-500 col-span-3 text-center">No projects found.</p>
              )}
            </div>
          </div>
        )}

        {user?.role === 'USER' && (
           <div>
             <h2 className="text-2xl font-bold mb-6">Assigned Projects</h2>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.isArray(projects) && projects.map((project) => (
                <div key={project.id} className="bg-white p-6 rounded shadow hover:shadow-lg transition">
                  <h3 className="font-bold text-xl">{project.name}</h3>
                  <p className="text-gray-500 text-sm mb-2">{project.description}</p>
                  <p className="mt-2 text-sm text-blue-600 font-semibold">Manager: {project.manager?.name || 'Unknown'}</p>
                  <div className="mt-4 border-t pt-4">
                    <button onClick={() => navigate(`/project/${project.id}`)} className="w-full bg-blue-50 text-blue-600 py-2 rounded font-medium hover:bg-blue-100 transition">View Task Board</button>
                  </div>
                </div>
              ))}
              {!isLoading && Array.isArray(projects) && projects.length === 0 && (
                <p className="text-gray-500 text-lg">No projects have been assigned to you yet.</p>
              )}
            </div>
           </div>
        )}

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-lg shadow-xl">
              <h3 className="text-xl font-bold mb-4">Create New Project</h3>
              <form onSubmit={handleCreateProject}>
                <input className="w-full border p-2 rounded mb-3" placeholder="Project Name" value={newProject.name} onChange={e => setNewProject({...newProject, name: e.target.value})} required />
                <textarea className="w-full border p-2 rounded mb-3" placeholder="Description" value={newProject.description} onChange={e => setNewProject({...newProject, description: e.target.value})} />
                
                {user.role === 'ADMIN' && (
                  <div className="mb-4">
                    <label className="block text-sm font-bold mb-1">Assign Project Manager:</label>
                    <select 
                      className="w-full border p-2 rounded" 
                      value={newProject.assignedManagerId} 
                      onChange={e => setNewProject({...newProject, assignedManagerId: e.target.value})}
                      required
                    >
                      <option value="">-- Select Manager --</option>
                      {managers.map(m => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                <p className="text-sm font-bold mb-2">Assign Team Members:</p>
                <div className="max-h-32 overflow-y-auto border p-2 rounded mb-4 bg-gray-50">
                  {employees.map(u => (
                    <div key={u.id} className="flex items-center gap-2 mb-2">
                      <input type="checkbox" id={`user-${u.id}`} checked={newProject.memberIds.includes(u.id)} onChange={() => toggleUserSelection(u.id)} className="cursor-pointer" />
                      <label htmlFor={`user-${u.id}`} className="cursor-pointer text-sm text-gray-700">{u.name}</label>
                    </div>
                  ))}
                  {employees.length === 0 && <p className="text-gray-500 text-sm">No employees found.</p>}
                </div>

                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Create Project</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default Dashboard;
