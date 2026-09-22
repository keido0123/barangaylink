import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiLogOut } from 'react-icons/fi';

const gold = '#C9A227';
const goldLight = '#E8C547';
const goldFaint = 'rgba(201,162,39,0.12)';
const goldBorder = 'rgba(201,162,39,0.3)';
const darkGreen = '#1A3A18';
const darkGreenHover = '#2D5A27';
const sidebarBg = '#0F2210';

const navItems = [
  { path: '/admin/dashboard', icon: '📊', label: 'Dashboard' },
  { path: '/admin/documents', icon: '📄', label: 'Documents' },
  { path: '/admin/incidents', icon: '🚨', label: 'Incidents' },
  { path: '/admin/residents', icon: '👥', label: 'Residents' },
  { path: '/admin/announcements', icon: '📢', label: 'Announcements' },
  { path: '/admin/reports', icon: '📈', label: 'Reports' },
];

export default function AdminLayout({ children }) {
  const { admin, logout } = useAuth();
  const location = useLocation();

  return (
    <div style={{ minHeight: '100vh', background: '#f3f4f6', display: 'flex', fontFamily: 'Inter, sans-serif' }}>

      {/* ===== SIDEBAR ===== */}
      <aside style={{
        width: 224, background: sidebarBg,
        display: 'flex', flexDirection: 'column',
        position: 'fixed', height: '100%', zIndex: 40,
        borderRight: `1px solid ${goldBorder}`,
      }}>

        {/* Logo & Admin Info */}
        <div style={{
          padding: '20px 16px',
          borderBottom: `1px solid ${goldBorder}`,
          textAlign: 'center',
        }}>
          <img src="/logo.png" alt="Logo" style={{
            width: 64, height: 64, borderRadius: '50%',
            objectFit: 'cover', margin: '0 auto 10px',
            border: `2px solid ${gold}`,
            boxShadow: `0 0 16px rgba(201,162,39,0.35)`,
          }} />
          <p style={{ color: '#f5e6c8', fontWeight: 700, fontSize: 13, marginBottom: 3 }}>
            {admin?.name}
          </p>
          <span style={{
            display: 'inline-block',
            background: goldFaint,
            border: `1px solid ${goldBorder}`,
            color: gold,
            fontSize: 10, fontWeight: 600,
            padding: '2px 10px', borderRadius: 99,
          }}>
            
          </span>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {navItems.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 14px', borderRadius: 12,
                  textDecoration: 'none', fontSize: 13,
                  fontWeight: isActive ? 700 : 400,
                  background: isActive ? goldFaint : 'transparent',
                  color: isActive ? gold : 'rgba(245,230,200,0.65)',
                  border: isActive ? `1px solid ${goldBorder}` : '1px solid transparent',
                  transition: 'all 0.2s',
                  borderLeft: isActive ? `3px solid ${gold}` : '3px solid transparent',
                }}
                onMouseEnter={e => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                    e.currentTarget.style.color = '#f5e6c8';
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'rgba(245,230,200,0.65)';
                  }
                }}
              >
                <span style={{ fontSize: 16 }}>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div style={{ padding: '12px 10px', borderTop: `1px solid ${goldBorder}` }}>
          <button
            onClick={logout}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 14px', borderRadius: 12,
              background: 'transparent', border: `1px solid transparent`,
              color: 'rgba(245,230,200,0.5)', fontSize: 13,
              cursor: 'pointer', transition: 'all 0.2s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(239,68,68,0.1)';
              e.currentTarget.style.color = '#fca5a5';
              e.currentTarget.style.border = '1px solid rgba(239,68,68,0.2)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'rgba(245,230,200,0.5)';
              e.currentTarget.style.border = '1px solid transparent';
            }}
          >
            <FiLogOut style={{ marginRight: 10 }} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
      

     
      <div style={{ marginLeft: 224, flex: 1, display: 'flex', flexDirection: 'column' }}>

        {/* Top Header */}
        <header style={{
          background: '#fff',
          borderBottom: `2px solid ${gold}`,
          padding: '14px 24px',
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky', top: 0, zIndex: 30,
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Gold accent bar */}
            <div style={{ width: 4, height: 28, background: gold, borderRadius: 99 }} />
            <div>
              <h1 style={{ fontWeight: 800, fontSize: 15, color: darkGreen, margin: 0 }}>
                Barangay Sta. Catalina
              </h1>
              <p style={{ fontSize: 11, color: '#888', margin: 0 }}>Admin Portal</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 12, color: '#999' }}>
              {new Date().toLocaleDateString('en-PH', {
                weekday: 'long', year: 'numeric',
                month: 'long', day: 'numeric'
              })}
            </span>
            {/* Admin badge */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: darkGreen, padding: '6px 12px',
              borderRadius: 99,
            }}>
              <div style={{
                width: 24, height: 24, borderRadius: '50%',
                background: gold, display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 800, color: darkGreen,
              }}>
                {admin?.name?.charAt(0)}
              </div>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#f5e6c8' }}>
                {admin?.name}
              </span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main style={{ flex: 1, padding: 24 }}>
          {children}
        </main>

        {/* Footer */}
        <footer style={{
          textAlign: 'center', padding: '10px',
          borderTop: `1px solid #e5e7eb`,
          fontSize: 11, color: '#bbb',
        }}>
          © 2026 Barangay Sta. Catalina Admin Portal
        </footer>
      </div>
    </div>
  );
}