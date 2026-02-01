import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { login, reset } from '../features/authSlice';
import { Mail, Lock, ShieldCheck } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const { email, password } = formData;
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, isError, isSuccess, message, isLoading } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isError) alert(message);
    if (isSuccess || user) navigate('/dashboard');
    dispatch(reset());
  }, [user, isError, isSuccess, message, navigate, dispatch]);

  const onChange = (e) => setFormData((prevState) => ({ ...prevState, [e.target.name]: e.target.value }));

  const onSubmit = (e) => {
    e.preventDefault();
    dispatch(login(formData));
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h2 className="mb-2 text-center text-3xl font-bold text-gray-800">Welcome Back</h2>
        <p className="mb-6 text-center text-gray-500">Login to your account</p>

        <form onSubmit={onSubmit}>
        
          <div className="mb-4 relative">
            <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="email"
              name="email"
              value={email}
              placeholder="Email Address"
              onChange={onChange}
              className="w-full rounded border pl-10 p-3 outline-none focus:border-blue-500"
              required
            />
          </div>

         
          <div className="mb-6 relative">
            <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="password"
              name="password"
              value={password}
              placeholder="Password"
              onChange={onChange}
              className="w-full rounded border pl-10 p-3 outline-none focus:border-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full rounded bg-blue-600 p-3 font-bold text-white hover:bg-blue-700 transition flex justify-center items-center gap-2"
            disabled={isLoading}
          >
            {isLoading ? 'Logging In...' : 'Login'}
          </button>
        </form>

        <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-500 bg-gray-50 p-2 rounded border border-gray-200">
           <ShieldCheck size={16} className="text-blue-600"/>
           <span>Admin login is supported via this form.</span>
        </div>

        <p className="mt-4 text-center text-sm text-gray-600">
          Don't have an account? <a href="/register" className="text-blue-600 hover:underline">Register</a>
        </p>
      </div>
    </div>
  );
};

export default Login;