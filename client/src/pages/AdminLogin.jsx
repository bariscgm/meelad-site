import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');

    if (
      (username.trim() === 'admin' || username.trim() === 'admin@festpro.com') &&
      password === 'admin123'
    ) {
      localStorage.setItem('isAdminAuthenticated', 'true');
      localStorage.setItem('adminUser', username);
      navigate('/admin');
    } else {
      setError('Invalid username or password. Please check your credentials.');
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
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-md w-full glass-dark p-8 md:p-10 rounded-3xl border border-slate-800 shadow-2xl relative z-10 space-y-8">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-block transition hover:scale-105">
            <img
              src="/ilmul_rasool_logo.png"
              alt="Ilmul Rasool Logo"
              className="w-20 h-20 object-contain mx-auto bg-white/5 p-2 rounded-2xl border border-white/10"
            />
          </Link>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center justify-center gap-2">
            <span dir="rtl">إلى الرسول</span>
            <span className="text-teal-400 font-mono text-xl">'26</span> Admin Login
          </h1>
          <p className="text-xs text-teal-300 font-semibold">Darussalam Higher Secondary Madrasa Narikkuni | Calicut Reg No: 2179</p>
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
            <label className="block text-xs font-semibold text-slate-300 mb-2">Username or Email</label>
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
            className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-purple-500/25 transition flex items-center justify-center gap-2"
          >
            Sign In to Admin Portal
          </button>
        </form>
      </div>
    </div>
  );
}
