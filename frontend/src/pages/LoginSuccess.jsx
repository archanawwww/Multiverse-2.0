import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Headphones } from 'lucide-react';

const LoginSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  useEffect(() => {
    // Backend redirects with tokens in the URL hash
    const hash = location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');
    const expiresIn = parseInt(params.get('expires_in') || '3600', 10);

    if (accessToken) {
      login(accessToken, refreshToken, expiresIn);
      navigate('/dashboard');
    } else {
      console.error('[LoginSuccess] No access token found in URL');
      navigate('/');
    }
  }, [location, login, navigate]);

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white gap-6">
      <div className="relative w-20 h-20">
        <div className="absolute inset-0 rounded-full border-2 border-white/20 animate-ping" />
        <div className="absolute inset-0 rounded-full border-2 border-white/50 border-t-transparent animate-spin" />
        <div className="absolute inset-4 rounded-full bg-white/5 flex items-center justify-center backdrop-blur-sm">
          <Headphones size={24} className="text-white" />
        </div>
      </div>
      <p className="text-sm text-white/60 tracking-[0.2em] uppercase font-medium">Connecting to EchoVerse...</p>
    </div>
  );
};

export default LoginSuccess;
