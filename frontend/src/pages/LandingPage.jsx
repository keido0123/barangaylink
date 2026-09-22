import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../utils/axios';
import { useAuth } from '../context/AuthContext';


const colors = {
  gold: '#C9A227',
  goldLight: '#E8C547',
  goldDark: '#8B6914',
  green: '#2D5A27',
  greenDark: '#1A3A18',
  greenLight: '#3D7A35',
  red: '#8B1A1A',
  redDark: '#5C0F0F',
  cream: '#F5E6C8',
  creamLight: '#FDF3DC',
  dark: '#2C2C2C',
  white: '#FFFFFF',
};

export default function LandingPage() {
  const { user, admin, loading: authLoading, logout } = useAuth();
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    api.get('/announcements').then(r => setAnnouncements(r.data)).catch(() => {});
  }, []);

  return (
    <div style={{ minHeight: '100vh', position: 'relative', fontFamily: 'Inter, sans-serif' }}>

      <div style={{
        position: 'fixed', inset: 0,
        backgroundImage: "url('/catalina.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        zIndex: 0,
      }} />

     
      <div style={{
        position: 'fixed', inset: 0, zIndex: 1,
        background: `linear-gradient(160deg, 
          rgba(16, 27, 15, 0.88) 0%, 
          rgba(36, 36, 36, 0.8) 40%,
          rgba(9, 0, 0, 0.88) 100%)`,
      }} />

      {/* Main Content */}
      <div style={{ position: 'relative', zIndex: 2, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

       
        <header style={{
          background: `rgba(26,58,24,0.95)`,
          borderBottom: `2px solid ${colors.gold}`,
          padding: '12px 20px',
          position: 'sticky', top: 0, zIndex: 50,
        }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

            {/* Logo + Name */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <img src="/logo.png" alt="Logo" style={{
                width: 52, height: 52, borderRadius: '50%', objectFit: 'cover',
                border: `2px solid ${colors.gold}`, boxShadow: `0 0 12px rgba(201,162,39,0.4)`
              }} />
              <div>
                <div style={{ color: colors.cream, fontWeight: 700, fontSize: 15 }}>Barangay Sta. Catalina</div>
                <div style={{ color: colors.gold, fontSize: 11 }}>Lubao, Pampanga</div>
              </div>
            </div>

            {/* Nav Buttons */}
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {!authLoading && admin && (
                <>
                  <Link to="/admin/dashboard" style={{
                    padding: '7px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                    background: colors.gold, color: colors.greenDark, textDecoration: 'none',
                  }}>Admin Panel</Link>
                  <button onClick={logout} style={{
                    padding: '7px 16px', borderRadius: 8, fontSize: 13, cursor: 'pointer',
                    background: 'transparent', border: `1px solid ${colors.gold}`, color: colors.cream,
                  }}>Logout</button>
                </>
              )}
              {!authLoading && !admin && user && (
                <>
                  <Link to="/dashboard" style={{
                    padding: '7px 16px', borderRadius: 8, fontSize: 13,
                    border: `1px solid ${colors.gold}`, color: colors.cream, textDecoration: 'none',
                  }}>My Dashboard</Link>
                  <button onClick={logout} style={{
                    padding: '7px 16px', borderRadius: 8, fontSize: 13, cursor: 'pointer',
                    background: 'transparent', border: `1px solid rgba(201,162,39,0.5)`, color: colors.cream,
                  }}>Logout</button>
                </>
              )}
              {!authLoading && !user && !admin && (
                <>
                  <Link to="/login" style={{
                    padding: '7px 16px', borderRadius: 8, fontSize: 13,
                    border: `1px solid ${colors.gold}`, color: colors.cream, textDecoration: 'none',
                  }}>Login</Link>
                  <Link to="/register" style={{
                    padding: '7px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                    background: colors.gold, color: colors.greenDark, textDecoration: 'none',
                  }}>Register</Link>
                </>
              )}
            </div>
          </div>
        </header>


        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 16px' }}>
          <div style={{
            background: 'rgba(26,58,24,0.70)',
            backdropFilter: 'blur(16px)',
            border: `1px solid rgba(201,162,39,0.45)`,
            borderRadius: 24,
            padding: '40px 32px',
            maxWidth: 680,
            width: '100%',
            textAlign: 'center',
            boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
          }}>

            
            <img src="/logo.png" alt="Sta. Catalina Logo" style={{
              width: 150, height: 150, borderRadius: '50%', objectFit: 'cover',
              margin: '0 auto 24px', display: 'block',
              border: `4px solid ${colors.gold}`,
              boxShadow: `0 0 30px rgba(201,162,39,0.5)`,
            }} />

            {/* Title */}
            <h2 style={{ color: colors.cream, fontSize: 32, fontWeight: 800, marginBottom: 6 }}>Welcome to</h2>
            <h3 style={{ color: colors.gold, fontSize: 26, fontWeight: 700, marginBottom: 16 }}>
              Sta. Catalina E-Services
            </h3>
            <p style={{ color: 'rgba(245,230,200,0.85)', fontSize: 14, marginBottom: 32, lineHeight: 1.7 }}>
              Request barangay documents online, track your requests in real-time,
              and report community issues — all from the comfort of your home.
            </p>

            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 32 }}>
              {[
                { icon: '📄', label: 'Clearance' },
                { icon: '🏠', label: 'Residency' },
                { icon: '💚', label: 'Indigency' },
                { icon: '🗳️', label: "Voter's Cert" },
              ].map(item => (
                <div key={item.label} style={{
                  background: 'rgba(201,162,39,0.15)',
                  border: `1px solid rgba(201,162,39,0.35)`,
                  borderRadius: 14, padding: '14px 8px', textAlign: 'center',
                }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>{item.icon}</div>
                  <div style={{ color: colors.cream, fontSize: 11, fontWeight: 500 }}>{item.label}</div>
                </div>
              ))}
            </div>


            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              {!authLoading && admin ? (
                <Link to="/admin/dashboard" style={{
                  padding: '13px 32px', borderRadius: 12, fontWeight: 700, fontSize: 15,
                  background: colors.gold, color: colors.greenDark, textDecoration: 'none',
                  boxShadow: `0 4px 15px rgba(201,162,39,0.4)`,
                }}>Go to Admin Panel</Link>
              ) : !authLoading && user ? (
                <Link to="/dashboard" style={{
                  padding: '13px 32px', borderRadius: 12, fontWeight: 700, fontSize: 15,
                  background: colors.gold, color: colors.greenDark, textDecoration: 'none',
                  boxShadow: `0 4px 15px rgba(201,162,39,0.4)`,
                }}>Go to Dashboard</Link>
              ) : (
                <Link to="/register" style={{
                  padding: '13px 32px', borderRadius: 12, fontWeight: 700, fontSize: 15,
                  background: colors.gold, color: colors.greenDark, textDecoration: 'none',
                  boxShadow: `0 4px 15px rgba(201,162,39,0.4)`,
                }}>Get Started</Link>
              )}
              <Link to="/track" style={{
                padding: '13px 32px', borderRadius: 12, fontWeight: 600, fontSize: 15,
                background: 'rgba(201,162,39,0.18)',
                border: `1px solid rgba(201,162,39,0.45)`,
                color: colors.cream, textDecoration: 'none',
              }}>Track Request</Link>
            </div>
          </div>

        
          {announcements.length > 0 && (
            <div style={{ marginTop: 32, maxWidth: 680, width: '100%' }}>
              <h4 style={{ color: colors.cream, fontWeight: 700, fontSize: 18, marginBottom: 12 }}>
                📢 Latest Announcements
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {announcements.slice(0, 3).map(ann => (
                  <div key={ann.id} style={{
                    background: 'rgba(26,58,24,0.75)',
                    backdropFilter: 'blur(8px)',
                    borderRadius: 14, padding: '14px 16px',
                    borderLeft: `4px solid ${ann.priority === 'Emergency' ? '#ef4444' : ann.priority === 'Urgent' ? colors.gold : colors.green}`,
                    border: `1px solid ${ann.priority === 'Emergency' ? '#ef4444' : ann.priority === 'Urgent' ? colors.gold : 'rgba(201,162,39,0.25)'}`,
                    textAlign: 'left',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <span style={{
                        fontSize: 11, padding: '2px 10px', borderRadius: 999, fontWeight: 600,
                        background: ann.priority === 'Emergency' ? 'rgba(239,68,68,0.25)' : ann.priority === 'Urgent' ? 'rgba(201,162,39,0.25)' : 'rgba(45,90,39,0.4)',
                        color: ann.priority === 'Emergency' ? '#fca5a5' : ann.priority === 'Urgent' ? colors.gold : '#86efac',
                      }}>{ann.priority}</span>
                      <span style={{ color: colors.cream, fontWeight: 600, fontSize: 14 }}>{ann.title}</span>
                    </div>
                    <p style={{ color: 'rgba(245,230,200,0.75)', fontSize: 12, lineHeight: 1.6 }}>{ann.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>

    
        <footer style={{
          textAlign: 'center', padding: '16px',
          borderTop: `1px solid rgba(201,162,39,0.25)`,
          color: 'rgb(255, 255, 255)', fontSize: 12,
        }}>
          © 2026 Barangay Sta. Catalina, Lubao, Pampanga. All rights reserved.
        </footer>
      </div>
    </div>
  );
}