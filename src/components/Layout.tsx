import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, Gamepad2 } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <>
      <div className="animated-bg" />
      <nav className="navbar">
        <div className="navbar-inner">
          <Link to="/" className="navbar-brand">
            <Gamepad2 size={28} />
            Party Game
          </Link>
          {profile && (
            <div className="navbar-user">
              <span className="navbar-username">{profile.display_name}</span>
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.display_name}
                  className="navbar-avatar"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="navbar-avatar flex items-center justify-center" style={{
                  background: 'var(--gradient-primary)',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                }}>
                  {profile.display_name.charAt(0).toUpperCase()}
                </div>
              )}
              <button
                className="btn-icon"
                onClick={handleSignOut}
                title="Esci"
                id="logout-button"
              >
                <LogOut size={18} />
              </button>
            </div>
          )}
        </div>
      </nav>
      <main className="page">
        {children}
      </main>
    </>
  );
}
