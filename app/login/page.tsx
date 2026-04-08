'use client';

export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
        scopes: 'openid email profile',
        queryParams: { access_type: 'offline', prompt: 'consent' },
      },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="login-root">
      {/* Left decorative panel */}
      <div className="login-left-panel">
        <div className="login-brand">
          <div className="login-brand-icon">A</div>
          <span className="login-brand-name">אטלייה</span>
        </div>
        <div className="login-tagline">
          <h2>ניהול עסקי חכם<br />בעברית</h2>
          <p>מערכת all-in-one לניהול פרויקטים, CRM, ואוטומציות לצוותים ישראלים</p>
        </div>
        <div className="login-feature-list">
          <div className="login-feature-item">
            <div className="login-feature-icon">📋</div>
            <div>
              <div className="login-feature-title">ניהול משימות ופרויקטים</div>
              <div className="login-feature-desc">טבלה, קנבן, רודמאפ ויומן</div>
            </div>
          </div>
          <div className="login-feature-item">
            <div className="login-feature-icon">💼</div>
            <div>
              <div className="login-feature-title">CRM מכירות</div>
              <div className="login-feature-desc">אנשי קשר, עסקאות ופייפליין</div>
            </div>
          </div>
          <div className="login-feature-item">
            <div className="login-feature-icon">⚡</div>
            <div>
              <div className="login-feature-title">אוטומציות</div>
              <div className="login-feature-desc">כללי אוטומציה ללא קוד</div>
            </div>
          </div>
          <div className="login-feature-item">
            <div className="login-feature-icon">🤖</div>
            <div>
              <div className="login-feature-title">AI אסיסטנט</div>
              <div className="login-feature-desc">מופעל על ידי Claude</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right login card */}
      <div className="login-right-panel">
        <div className="login-card">
          <div className="login-card-logo">
            <div className="login-card-icon">A</div>
            <span>אטלייה</span>
          </div>

          <h1 className="login-card-title">ברוכים הבאים</h1>
          <p className="login-card-subtitle">התחברו כדי לגשת לסביבת העבודה שלכם</p>

          {error && (
            <div className="login-error-msg">
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>warning</span>
              <span>{error}</span>
            </div>
          )}

          <button
            className="google-btn"
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            {loading ? (
              <div className="login-spinner" />
            ) : (
              <svg viewBox="0 0 24 24" width="20" height="20" style={{ flexShrink: 0 }}>
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            <span>{loading ? 'מתחבר...' : 'המשך עם Google'}</span>
          </button>

          <p className="login-security-note">
            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>lock</span>
            הכניסה מאובטחת דרך Google OAuth 2.0
          </p>
        </div>
      </div>

      <style>{`
        .login-root {
          min-height: 100vh;
          display: flex;
          flex-direction: row-reverse;
          font-family: 'Inter', sans-serif;
          direction: rtl;
        }

        /* Left decorative panel */
        .login-left-panel {
          flex: 1;
          background: linear-gradient(145deg, #5a45cb 0%, #3b28a8 60%, #2d1f8c 100%);
          padding: 48px;
          display: flex;
          flex-direction: column;
          gap: 40px;
          position: relative;
          overflow: hidden;
        }
        .login-left-panel::before {
          content: '';
          position: absolute;
          top: -80px;
          left: -80px;
          width: 300px;
          height: 300px;
          border-radius: 50%;
          background: rgba(255,255,255,0.05);
        }
        .login-left-panel::after {
          content: '';
          position: absolute;
          bottom: -60px;
          right: -60px;
          width: 240px;
          height: 240px;
          border-radius: 50%;
          background: rgba(255,255,255,0.04);
        }

        .login-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-direction: row-reverse;
        }
        .login-brand-icon {
          width: 40px;
          height: 40px;
          background: white;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          font-weight: 900;
          color: #5a45cb;
          font-family: 'Manrope', sans-serif;
        }
        .login-brand-name {
          font-family: 'Manrope', sans-serif;
          font-size: 22px;
          font-weight: 800;
          color: white;
        }

        .login-tagline { flex: 1; }
        .login-tagline h2 {
          font-family: 'Manrope', sans-serif;
          font-size: 36px;
          font-weight: 900;
          color: white;
          line-height: 1.2;
          margin-bottom: 16px;
          text-align: right;
        }
        .login-tagline p {
          font-size: 15px;
          color: rgba(255,255,255,0.7);
          line-height: 1.6;
          text-align: right;
          max-width: 380px;
        }

        .login-feature-list { display: flex; flex-direction: column; gap: 16px; }
        .login-feature-item {
          display: flex;
          flex-direction: row-reverse;
          align-items: center;
          gap: 14px;
          background: rgba(255,255,255,0.08);
          border-radius: 14px;
          padding: 14px 16px;
          border: 1px solid rgba(255,255,255,0.1);
        }
        .login-feature-icon {
          font-size: 22px;
          flex-shrink: 0;
          width: 40px;
          height: 40px;
          background: rgba(255,255,255,0.12);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .login-feature-title {
          font-family: 'Manrope', sans-serif;
          font-size: 14px;
          font-weight: 700;
          color: white;
          text-align: right;
        }
        .login-feature-desc {
          font-size: 12px;
          color: rgba(255,255,255,0.6);
          text-align: right;
          margin-top: 2px;
        }

        /* Right login card */
        .login-right-panel {
          width: 440px;
          flex-shrink: 0;
          background: #f8f9fb;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 32px;
        }

        .login-card {
          width: 100%;
          max-width: 360px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0;
        }

        .login-card-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 36px;
          flex-direction: row-reverse;
        }
        .login-card-icon {
          width: 44px;
          height: 44px;
          background: #5a45cb;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
          font-weight: 900;
          color: white;
          font-family: 'Manrope', sans-serif;
          box-shadow: 0 4px 14px rgba(90,69,203,0.4);
        }
        .login-card-logo span {
          font-family: 'Manrope', sans-serif;
          font-size: 20px;
          font-weight: 800;
          color: #191c1e;
        }

        .login-card-title {
          font-family: 'Manrope', sans-serif;
          font-size: 26px;
          font-weight: 900;
          color: #191c1e;
          text-align: center;
          margin-bottom: 8px;
        }
        .login-card-subtitle {
          font-size: 14px;
          color: #474554;
          text-align: center;
          margin-bottom: 32px;
          line-height: 1.5;
        }

        .login-error-msg {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-direction: row-reverse;
          width: 100%;
          background: #ffdad6;
          border: 1px solid #ff897d;
          border-radius: 10px;
          padding: 12px 14px;
          color: #93000a;
          font-size: 13px;
          margin-bottom: 16px;
          text-align: right;
        }

        .google-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 14px 20px;
          background: white;
          border: 1px solid #e0e0e0;
          border-radius: 999px;
          font-size: 15px;
          font-weight: 600;
          color: #333;
          cursor: pointer;
          transition: all 0.2s;
          font-family: 'Inter', sans-serif;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }
        .google-btn:hover:not(:disabled) {
          background: #fafafa;
          box-shadow: 0 4px 16px rgba(0,0,0,0.12);
          transform: translateY(-1px);
        }
        .google-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .login-spinner {
          width: 20px;
          height: 20px;
          border: 2px solid #e0e0e0;
          border-top-color: #5a45cb;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .login-security-note {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 12px;
          color: #787585;
          margin-top: 20px;
          text-align: center;
        }

        @media (max-width: 768px) {
          .login-root { flex-direction: column; }
          .login-left-panel { padding: 32px 24px; gap: 24px; }
          .login-tagline h2 { font-size: 26px; }
          .login-right-panel { width: 100%; padding: 32px 24px; }
        }
      `}</style>
    </div>
  );
}
