import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { register, reset } from '../features/authSlice';
import { User, Briefcase } from 'lucide-react'; 

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'USER', 
  });

  const { name, email, password, role } = formData;
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, isError, isSuccess, message } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isError) alert(message);
    if (isSuccess || user) navigate('/dashboard'); 
    dispatch(reset());
  }, [user, isError, isSuccess, message, navigate, dispatch]);

  const onChange = (e) => setFormData((prevState) => ({ ...prevState, [e.target.name]: e.target.value }));

  const onSubmit = (e) => {
    e.preventDefault();
    dispatch(register(formData));
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h2 className="mb-6 text-center text-2xl font-bold text-gray-800">Create Account</h2>

        <form onSubmit={onSubmit}>
          <div className="mb-6 flex gap-4">
            <div
              onClick={() => setFormData({ ...formData, role: 'USER' })}
              className={`flex flex-1 cursor-pointer flex-col items-center justify-center rounded-lg border-2 p-4 transition-all ${
                role === 'USER' ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-gray-200 text-gray-500 hover:border-gray-300'
              }`}
            >
              <User size={24} />
              <span className="mt-2 text-sm font-semibold">Employee</span>
            </div>

            <div
              onClick={() => setFormData({ ...formData, role: 'MANAGER' })}
              className={`flex flex-1 cursor-pointer flex-col items-center justify-center rounded-lg border-2 p-4 transition-all ${
                role === 'MANAGER' ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-gray-200 text-gray-500 hover:border-gray-300'
              }`}
            >
              <Briefcase size={24} />
              <span className="mt-2 text-sm font-semibold">Manager</span>
            </div>
          </div>

          <div className="mb-4">
            <input
              type="text"
              name="name"
              value={name}
              placeholder="Full Name"
              onChange={onChange}
              className="w-full rounded border p-3 outline-none focus:border-blue-500"
              required
            />
          </div>
          <div className="mb-4">
            <input
              type="email"
              name="email"
              value={email}
              placeholder="Email Address"
              onChange={onChange}
              className="w-full rounded border p-3 outline-none focus:border-blue-500"
              required
            />
          </div>
          <div className="mb-6">
            <input
              type="password"
              name="password"
              value={password}
              placeholder="Password"
              onChange={onChange}
              className="w-full rounded border p-3 outline-none focus:border-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full rounded bg-blue-600 p-3 font-bold text-white hover:bg-blue-700 transition"
          >
            Register as {role === 'USER' ? 'Employee' : 'Manager'}
          </button>
        </form>
        
        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account? <a href="/login" className="text-blue-600 hover:underline">Login</a>
        </p>
      </div>
    </div>
  );
};

export default Register;