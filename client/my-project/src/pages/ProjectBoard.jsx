import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';

const ProjectBoard = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  
  const [newTask, setNewTask] = useState({ title: '', description: '', assignedToEmail: '' });
  
  const [allUsers, setAllUsers] = useState([]);

  useEffect(() => {
    if (!user) return navigate('/login');
    const fetchData = async () => {
      try {
        const taskRes = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/tasks/${id}`, { withCredentials: true });
        setTasks(taskRes.data);
        
        if (user.role === 'ADMIN' || user.role === 'MANAGER') {
            const userRes = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/users`, { withCredentials: true });
            setAllUsers(userRes.data);
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Failed to load board", err);
        setLoading(false);
      }
    };
    fetchData();
  }, [id, user, navigate]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/tasks`, { ...newTask, projectId: id }, { withCredentials: true });
      setTasks([res.data, ...tasks]);
      setShowTaskModal(false);
      setNewTask({ title: '', description: '', assignedToEmail: '' });
    } catch (err) {
      alert("Failed to create task. Please check the email or try again.");
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    const updatedTasks = tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t);
    setTasks(updatedTasks);
    try {
      await axios.patch(`${import.meta.env.VITE_API_BASE_URL}/tasks/${taskId}/status`, { status: newStatus }, { withCredentials: true });
    } catch (err) {
      alert("You are not authorized to move this task!");
      const originalRes = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/tasks/${id}`, { withCredentials: true });
      setTasks(originalRes.data);
    }
  };

  const canMoveTask = (task) => {
    if (user.role === 'ADMIN') return true;
    if (user.role === 'MANAGER') return true; 
    if (user.id === task.assignedTo?.id) return true; 
    return false;
  };

  if (loading) return <div className="p-10 text-center">Loading Tasks...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <button onClick={() => navigate('/dashboard')} className="text-gray-600 hover:text-black">← Back to Dashboard</button>
          
          <h1 className="text-2xl font-bold">Task Handler</h1>
          
          {(user.role === 'ADMIN' || user.role === 'MANAGER') && (
            <button 
              onClick={() => setShowTaskModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              + Add Task
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-150px)]">
          {['TODO', 'IN_PROGRESS', 'DONE'].map(status => (
            <div key={status} className="bg-gray-200 p-4 rounded-lg flex flex-col">
              <h2 className="font-bold text-gray-700 mb-4 px-2">{status.replace('_', ' ')}</h2>
              
              <div className="flex-1 overflow-y-auto space-y-3">
                {tasks.filter(t => t.status === status).map(task => (
                  <div key={task.id} className="bg-white p-4 rounded shadow relative group">
                    <h4 className="font-semibold">{task.title}</h4>
                    <p className="text-sm text-gray-500 mb-2">{task.description}</p>
                    
                    <div className="text-xs text-blue-600 font-medium bg-blue-50 inline-block px-2 py-1 rounded">
                      {task.assignedTo?.name || 'Unassigned'}
                    </div>

                    {canMoveTask(task) && (
                      <div className="mt-3 flex gap-2 text-xs">
                        {status !== 'TODO' && <button onClick={() => handleStatusChange(task.id, 'TODO')} className="text-gray-500 hover:underline">To Todo</button>}
                        {status !== 'IN_PROGRESS' && <button onClick={() => handleStatusChange(task.id, 'IN_PROGRESS')} className="text-blue-600 hover:underline">To Progress</button>}
                        {status !== 'DONE' && <button onClick={() => handleStatusChange(task.id, 'DONE')} className="text-green-600 hover:underline">To Done</button>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {showTaskModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-xl">
              <h3 className="text-lg font-bold mb-4">Add New Task</h3>
              <form onSubmit={handleCreateTask}>
                <input 
                    className="w-full border p-2 rounded mb-3" 
                    placeholder="Task Title" 
                    value={newTask.title} 
                    onChange={e => setNewTask({...newTask, title: e.target.value})} 
                    required 
                />
                <textarea 
                    className="w-full border p-2 rounded mb-3" 
                    placeholder="Description" 
                    value={newTask.description} 
                    onChange={e => setNewTask({...newTask, description: e.target.value})} 
                />
                
                <div className="mb-4">
                    <label className="block text-sm font-bold mb-1 text-gray-700">Assign To:</label>
                    <select 
                        className="w-full border p-2 rounded bg-white" 
                        value={newTask.assignedToEmail} 
                        onChange={e => setNewTask({...newTask, assignedToEmail: e.target.value})}
                    >
                        <option value="">-- Leave Unassigned --</option>
                        {allUsers.map(u => (
                            <option key={u.id} value={u.email}>
                                {u.name} ({u.email})
                            </option>
                        ))}
                    </select>
                </div>
                
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => setShowTaskModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Create Task</button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ProjectBoard;