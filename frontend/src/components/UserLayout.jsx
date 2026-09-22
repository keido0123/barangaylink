import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiLogOut } from 'react-icons/fi';

const navItems = [
  { path: '/dashboard', icon: '🏠', label: 'Home' },
  { path: '/request-document', icon: '📄', label: 'Request' },
  { path: '/my-requests', icon: '📋', label: 'My Docs' },
  { path: '/report-incident', icon: '🚨', label: 'Report' },
  { path: '/my-reports', icon: '📝', label: 'My Reports' },
];

export default function UserLayout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[#f5f1e8]">

      {/* Top Bar */}
      <header className="bg-gradient-to-r from-[#2f5d3f] via-[#3d6b4f] to-[#7d5b2f] text-white px-4 py-3 flex items-center justify-between sticky top-0 z-40 shadow-lg border-b border-[#c9a227]/20">

        {/* Logo */}
        <div className="flex items-center gap-3">
          <img
            src="/logo.png"
            alt="Logo"
            className="w-10 h-10 rounded-full border-2 border-[#c9a227] object-cover shadow-md"
          />

          <div>
            <h1 className="font-bold text-sm tracking-wide">
              Sta. Catalina
            </h1>

            <p className="text-[10px] text-[#f5deb3]">
              Resident Portal
            </p>
          </div>
        </div>

        {/* User + Logout */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-[#f5deb3] hidden sm:block font-medium">
            {user?.name}
          </span>

          <button
            onClick={logout}
            className="text-xs bg-white/10 border border-white/10 px-3 py-1.5 rounded-xl hover:bg-white/20 transition"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 h-full w-64 bg-gradient-to-b from-[#2f5d3f] to-[#23452f] flex-col pt-20 z-30 shadow-2xl border-r border-[#c9a227]/20">

        {/* User Info */}
        <div className="px-5 pb-5 border-b border-white/10">
          <img
            src="/logo.png"
            alt="Logo"
            className="w-20 h-20 rounded-full border-4 border-[#c9a227] object-cover mx-auto shadow-lg"
          />

          <h2 className="text-white text-center mt-3 font-semibold">
            {user?.name}
          </h2>

          <p className="text-[#d4c29a] text-center text-sm">
            {user?.purok}
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 mt-2">
          {navItems.map(item => {
            const active = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 text-sm font-medium
                  ${
                    active
                      ? 'bg-gradient-to-r from-[#c9a227] to-[#8b6b2e] text-white shadow-lg'
                      : 'text-[#f3e7c4] hover:bg-white/10 hover:text-white'
                  }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 text-[#f3e7c4] hover:text-white hover:bg-white/10 px-4 py-3 rounded-2xl transition"
          >
            <FiLogOut style={{ marginRight: 10 }} />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="pb-24 md:ml-64 min-h-screen">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-[#d4c29a] z-40 md:hidden shadow-2xl">

        <div className="flex items-center justify-around py-2">
          {navItems.map(item => {
            const active = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-300
                  ${
                    active
                      ? 'text-[#2f5d3f] bg-[#f5e8bf]'
                      : 'text-[#7d7d7d]'
                  }`}
              >
                <span className="text-lg">{item.icon}</span>

                <span className="text-[11px] font-medium">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}