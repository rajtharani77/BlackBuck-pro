import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './app/store';
import Register from './pages/Register';
import Login from './pages/Login';         
import Dashboard from './pages/Dashboard'; 
import ProjectBoard from './pages/ProjectBoard';

function App() {
  return (
    <Provider store={store}>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/project/:id" element={<ProjectBoard />} />
        </Routes>
      </Router>
    </Provider>
  );
}

export default App;