import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { API_URL } from '../config/api.js';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const portalType = location.state?.portal ? `${location.state.portal} ` : '';
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let data;
      const normalizedUsername = username.toLowerCase().trim();

      // Admin hardcoded override
      if (normalizedUsername === 'admin') {
        if (password === 'admin123') {
          data = {
            success: true,
            user: { 
              id: 'admin-hardcoded', 
              name: 'System Administrator', 
              username: 'admin', 
              role: 'Admin', 
              team: 'System', 
              status: 'Active' 
            }
          };
        } else {
          data = { success: false, message: 'Invalid username or password.' };
        }
      } else {
        // Fetch from DB for all other users
        const response = await fetch(`${API_URL}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });
        data = await response.json();
      }

      if (data.success) {
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Redirect based on role
        const role = data.user.role;
        if (role === 'Admin') navigate('/admin');
        else if (role === 'Team Leader') navigate('/team');
        else if (role === 'Stage Manager') navigate('/stage');
        else if (role === 'Judge') navigate('/judge');
        else navigate('/');
      } else {
        setError(data.message || 'Invalid username or password.');
      }
    } catch (err) {
      setError('Connection error. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0e1c] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Back to Home Button */}
      <Link
        to="/"
        className="absolute top-6 left-6 z-20 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-sm font-semibold border border-white/10 transition"
      >
        ← Back to Home
      </Link>

      {/* Background Decorative Gradients */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-600/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-md w-full glass-dark p-8 md:p-10 rounded-3xl border border-slate-800 shadow-2xl relative z-10 space-y-8">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex flex-col items-center justify-center transition hover:scale-105 mb-4">
            <div className="w-20 h-20 flex items-center justify-center bg-teal-500/10 border border-teal-500/20 rounded-2xl mx-auto mb-2">
              <svg className="w-10 h-10 text-teal-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1.894-15.682a8.001 8.001 0 00-4.57 11.238A8.001 8.001 0 0015.68 15.54a6.5 6.5 0 11-5.575-9.222z"/>
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight flex flex-col items-center justify-center gap-1">
              Meelad Fest
              <span className="text-sm font-semibold text-teal-400">{portalType}Login Portal</span>
            </h1>
          </Link>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-semibold rounded-xl">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">Username</label>
            <input
              type="text"
              required
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-800 bg-white/5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">Password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-800 bg-white/5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-purple-500/25 transition flex items-center justify-center gap-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
