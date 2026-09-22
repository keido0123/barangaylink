import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function UserLogin() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await loginUser(form.email, form.password);
      toast.success('Welcome back!');
      queueMicrotask(() => navigate('/dashboard', { replace: true }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4 overflow-hidden">
      
      {/* Background */}
      <div
        className="fixed inset-0 bg-cover bg-center scale-105"
        style={{ backgroundImage: "url('/catalina.jpg')" }}
      />
      <div className="fixed inset-0 bg-gradient-to-br from-[#2f3e2e]/80 via-black/70 to-[#7d5b2f]/70" />

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white/95 backdrop-blur-xl border border-[#c9a227]/30 rounded-3xl shadow-2xl overflow-hidden">

          {/* Top Accent */}
          <div className="h-2 bg-gradient-to-r from-[#c9a227] via-[#8b6b2e] to-[#2f5d3f]" />

          <div className="p-8">
            
            {/* Logo + Title */}
            <div className="text-center mb-8">
              <div className="relative inline-block">
                <img
                  src="/logo.png"
                  alt="Sta. Catalina Logo"
                  className="w-24 h-24 rounded-full object-cover mx-auto border-4 border-[#c9a227] shadow-lg"
                />
              </div>

              <h2 className="mt-4 text-3xl font-bold text-[#2f3e2e]">
                Resident Login
              </h2>

              <p className="text-[#7d5b2f] text-sm mt-1 font-medium tracking-wide">
                Barangay Sta. Catalina E-Services
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-[#2f3e2e] mb-2">
                  Email Address
                </label>

                <input
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    setForm({ ...form, email: e.target.value })
                  }
                  className="w-full rounded-2xl border border-[#d4c29a] bg-[#faf7ef] px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#c9a227] focus:border-[#c9a227] transition"
                  placeholder="Enter your email"
                  required
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-[#2f3e2e] mb-2">
                  Password
                </label>

                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                    className="w-full rounded-2xl border border-[#d4c29a] bg-[#faf7ef] px-4 py-3 pr-12 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#c9a227] focus:border-[#c9a227] transition"
                    placeholder="••••••••"
                    required
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-4 flex items-center text-[#7d5b2f] hover:text-[#2f5d3f] transition"
                  >
                    {showPassword ? (
                        <Eye size={20} />
                    ) : (
                       <EyeOff size={20} />
                    
                    )}
                  </button>
                </div>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#2f5d3f] to-[#3f7d56] hover:from-[#264d34] hover:to-[#346947] text-white py-3 rounded-2xl font-semibold shadow-lg transition-all duration-300 disabled:opacity-50"
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>

            {/* Footer Links */}
            <div className="mt-6 text-center space-y-3">
              <p className="text-sm text-gray-600">
                Don&apos;t have an account?{' '}
                <Link
                  to="/register"
                  className="text-[#2f5d3f] font-semibold hover:text-[#c9a227] transition"
                >
                  Register here
                </Link>
              </p>

              <p className="text-xs text-gray-500">
                Are you an official?{' '}
                <Link
                  to="/admin/login"
                  className="text-[#7d5b2f] hover:text-[#c9a227] transition"
                >
                  Admin Login →
                </Link>
              </p>

              <Link
                to="/"
                className="block text-xs text-gray-400 hover:text-[#7d5b2f] transition"
              >
                ← Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}