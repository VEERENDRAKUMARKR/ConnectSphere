import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import ChatArea from '../components/ChatArea';
import { useStore } from '../store';
import { Navigate, useNavigate } from 'react-router-dom';
import { Video, Home, MessageSquare, Calendar, Users, Settings } from 'lucide-react';
import { socket } from '../lib/socket';

export default function Dashboard() {
  const { token, user, setUser, setWorkspaces, logout } = useStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(!user && !!token);

  useEffect(() => {
    if (!token) {
      navigate('/auth');
      return;
    }

    if (!user) {
      setLoading(true);
      fetch('/api/app/state', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => {
        if (!res.ok) throw new Error('Unauthorized');
        return res.json();
      })
      .then(data => {
        setUser(data.user);
        setWorkspaces(data.workspaces);
        
        // Connect socket explicitly
        socket.auth = { token };
        socket.connect();
      })
      .catch((err) => {
        console.error(err);
        logout();
        navigate('/auth');
      })
      .finally(() => {
        setLoading(false);
      });
    } else {
      // Connect socket if not connected
      if (!socket.connected) {
        socket.auth = { token };
        socket.connect();
      }
    }
  }, [token, user, navigate, setUser, setWorkspaces, logout]);

  if (!token) {
    return <Navigate to="/auth" />;
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0F172A]">
        <div className="w-16 h-16 bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] rounded-2xl flex items-center justify-center animate-pulse">
            <Video className="w-8 h-8 text-white" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground font-sans">
      {/* App Rail */}
      <nav className="w-16 z-20 flex flex-col items-center py-4 bg-[#0A0F1D] border-r border-white/5 space-y-6">
        <div className="w-10 h-10 bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 mb-2">
          <Video className="w-6 h-6 text-white" />
        </div>
        <div className="flex flex-col space-y-4">
          <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center text-indigo-400 border border-white/10">
            <Home className="w-5 h-5" />
          </div>
          <div className="w-10 h-10 hover:bg-white/5 rounded-lg flex items-center justify-center text-slate-400 transition-colors cursor-pointer">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div className="w-10 h-10 hover:bg-white/5 rounded-lg flex items-center justify-center text-slate-400 transition-colors cursor-pointer">
            <Calendar className="w-5 h-5" />
          </div>
          <div className="w-10 h-10 hover:bg-white/5 rounded-lg flex items-center justify-center text-slate-400 transition-colors cursor-pointer" onClick={logout}>
            <Settings className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-auto flex flex-col space-y-4 pb-4">
          <div className="w-10 h-10 bg-indigo-500/10 border border-indigo-500/20 rounded-full flex items-center justify-center text-xs font-bold text-indigo-400 cursor-pointer">
            {user?.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
          </div>
        </div>
      </nav>
      <Sidebar />
      <ChatArea />
    </div>
  );
}
