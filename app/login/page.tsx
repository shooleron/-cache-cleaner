'use client';

import React, { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const supabase = createClient();

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
        scopes: 'openid email profile https://www.googleapis.com/auth/drive.readonly',
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
          hd: '*', // מאפשר כל Google Workspace domain
        },
      },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        {/* Logo */}
        <div className="login-logo">
          <div className="login-logo-icon">T</div>
          <span className="login-logo-text">TaskFlow</span>
        </div>

        <h1 className="login-title">ברוכים הבאים</h1>
        <p className="login-subtitle">
          התחבר עם חשבון Google שלך כדי לגשת לסביבת העבודה
        </p>

        {error && (
          <div className="login-error">
            <span>⚠️ {error}</span>
          </div>
        )}

        <button
          className="google-login-btn"
          onClick={handleGoogleLogin}
          disabled={loading}
        >
          {loading ? (
            <div className="login-spinner" />
          ) : (
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          )}
          <span>{loading ? 'מתחבר...' : 'המשך עם Google'}</span>
        </button>

        <p className="login-note">
          🔒 הכניסה מאובטחת דרך Google Workspace שלכם
        </p>

        <div className="login-features">
          <div className="login-feature">📋 ניהול משימות ופרויקטים</div>
          <div className="login-feature">📁 חיבור ישיר ל-Google Drive</div>
          <div className="login-feature">👥 שיתוף עם כל הצוות</div>
        </div>
      </div>

      <style>{`
        .login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #0f1117 0%, #1a1f35 50%, #0f1117 100%);
          padding: 20px;
        }
        .login-card {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          backdrop-filter: blur(20px);
          border-radius: 20px;
          padding: 48px 40px;
          width: 100%;
          max-width: 420px;
          text-align: center;
          box-shadow: 0 20px 60px rgba(0,0,0,0.5);
        }
        .login-logo {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin-bottom: 32px;
        }
        .login-logo-icon {
          width: 40px;
          height: 40px;
          background: #0073ea;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 20px;
          font-weight: 800;
          box-shadow: 0 0 20px rgba(0,115,234,0.5);
        }
        .login-logo-text {
          font-size: 24px;
          font-weight: 800;
          color: white;
          letter-spacing: -0.5px;
        }
        .login-title {
          font-size: 26px;
          font-weight: 700;
          color: white;
          margin-bottom: 10px;
        }
        .login-subtitle {
          font-size: 14px;
          color: rgba(255,255,255,0.6);
          margin-bottom: 28px;
          line-height: 1.6;
        }
        .login-error {
          background: rgba(226,68,92,0.15);
          border: 1px solid rgba(226,68,92,0.4);
          border-radius: 10px;
          padding: 12px;
          color: #ff6b81;
          font-size: 13px;
          margin-bottom: 16px;
        }
        .google-login-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          width: 100%;
          padding: 14px 24px;
          background: white;
          border: none;
          border-radius: 12px;
          font-size: 15px;
          font-weight: 600;
          color: #333;
          cursor: pointer;
          transition: all 0.2s;
          font-family: 'Inter', sans-serif;
          box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        }
        .google-login-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.3);
        }
        .google-login-btn:disabled { opacity: 0.7; cursor: not-allowed; }
        .login-spinner {
          width: 20px;
          height: 20px;
          border: 2px solid #ddd;
          border-top-color: #0073ea;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .login-note {
          font-size: 12px;
          color: rgba(255,255,255,0.4);
          margin-top: 16px;
        }
        .login-features {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-top: 32px;
          border-top: 1px solid rgba(255,255,255,0.1);
          padding-top: 24px;
        }
        .login-feature {
          font-size: 13px;
          color: rgba(255,255,255,0.5);
          text-align: right;
        }
      `}</style>
    </div>
  );
}
