import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function AdminLogin() {
  const [form, setForm] = useState({
    email: '',
    password: ''
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { loginAdmin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await loginAdmin(form.email, form.password);

      toast.success('Welcome, Official!');

      queueMicrotask(() =>
        navigate('/admin/dashboard', { replace: true })
      );
    } catch (err) {
      toast.error(
        err.response?.data?.message || 'Invalid credentials'
      );
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

      <div className="fixed inset-0 bg-gradient-to-br from-[#1f1f1f]/90 via-black/80 to-[#7d5b2f]/70" />

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-[#1e1e1e]/95 backdrop-blur-xl border border-[#c9a227]/30 rounded-3xl shadow-2xl overflow-hidden">

          {/* Top Accent */}
          <div className="h-2 bg-gradient-to-r from-[#c9a227] via-[#8b6b2e] to-[#2f5d3f]" />

          <div className="p-8">

            {/* Header */}
            <div className="text-center mb-8">

              <img
                src="/logo.png"
                alt="Sta. Catalina Logo"
                className="w-24 h-24 rounded-full border-4 border-[#c9a227] shadow-lg object-cover mx-auto"
              />

              <h2 className="mt-4 text-3xl font-bold text-white">
                Official Login
              </h2>

              <p className="text-[#d4c29a] text-sm mt-1 font-medium tracking-wide">
                Barangay Sta. Catalina Admin Portal
              </p>

              <div className="mt-4 px-4 py-2 bg-[#c9a227]/10 border border-[#c9a227]/30 rounded-full inline-block">
                <span className="text-[#e6c65c] text-xs font-semibold tracking-wide">
                  🔒 Restricted Access
                </span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-[#f5f5f5] mb-2">
                  Official Email
                </label>

                <input
                  type="email"
                  value={form.email}
                  onChange={e =>
                    setForm({
                      ...form,
                      email: e.target.value
                    })
                  }
                  className="w-full rounded-2xl border border-[#5c5c5c] bg-[#2a2a2a] text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#c9a227] focus:border-[#c9a227] transition"
                  placeholder="official@stcatalina.gov.ph"
                  required
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-[#f5f5f5] mb-2">
                  Password
                </label>

                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={e =>
                      setForm({
                        ...form,
                        password: e.target.value
                      })
                    }
                    className="w-full rounded-2xl border border-[#5c5c5c] bg-[#2a2a2a] text-white px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-[#c9a227] focus:border-[#c9a227] transition"
                    placeholder="••••••••"
                    required
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(!showPassword)
                    }
                    className="absolute inset-y-0 right-4 flex items-center text-[#d4c29a] hover:text-[#c9a227] transition"
                  >
                    {showPassword ? (
                      <Eye size={20} />
                    ) : (
                      <EyeOff size={20} />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#c9a227] to-[#8b6b2e] hover:from-[#b8931f] hover:to-[#755626] text-white py-3 rounded-2xl font-semibold shadow-lg transition-all duration-300 disabled:opacity-50"
              >
                {loading
                  ? 'Authenticating...'
                  : 'Login as Official'}
              </button>
            </form>

            {/* Footer */}
            <div className="mt-6 text-center">
              <Link
                to="/login"
                className="text-sm text-[#d4c29a] hover:text-[#c9a227] transition"
              >
                ← Resident Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}