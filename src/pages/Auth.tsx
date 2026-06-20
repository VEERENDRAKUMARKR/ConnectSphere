import React, { useState } from 'react';
import { useStore } from '../store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Video, Mail, Lock, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Auth() {
  const setToken = useStore(state => state.setToken);
  const setUser = useStore(state => state.setUser);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(true); // Default to register for new SaaS
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const name = formData.get('name') as string;

    const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
    const body = isRegister ? { email, password, name } : { email, password };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      setToken(data.token);
      localStorage.setItem('token', data.token);
      
      setUser({
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role || 'Super Admin',
        avatar: data.user.avatarUrl || `https://i.pravatar.cc/150?u=${data.user.id}`
      });

      navigate('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0F172A] p-4 relative overflow-hidden font-sans text-foreground">
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-indigo-600/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-600/20 blur-[120px] rounded-full pointer-events-none" />
      
      <Card className="w-full max-w-md relative z-10 border-white/10 bg-[#1E293B]/80 backdrop-blur-xl shadow-2xl">
        <CardHeader className="space-y-4 items-center">
          <div className="w-16 h-16 bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Video className="w-8 h-8 text-white" />
          </div>
          <div className="text-center">
            <CardTitle className="text-2xl font-semibold tracking-tight text-white font-sans">
              ConnectSphere AI
            </CardTitle>
            <CardDescription className="text-slate-400 mt-2 text-sm">
              Enterprise Communication Platform
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-md text-red-400 text-sm">{error}</div>}
            
            {isRegister && (
              <div className="space-y-2">
                <div className="relative">
                  <User className="absolute left-3 top-3 h-5 w-5 text-slate-500" />
                  <Input name="name" required placeholder="Full Name" className="pl-10 bg-[#0F172A]/50 border-white/10 focus:border-indigo-500/50 text-white placeholder:text-slate-600" />
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-500" />
                <Input name="email" required type="email" placeholder="work@company.com" className="pl-10 bg-[#0F172A]/50 border-white/10 focus:border-indigo-500/50 text-white placeholder:text-slate-600" defaultValue={!isRegister ? "admin@connectsphere.ai" : ""} />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-500" />
                <Input name="password" required type="password" placeholder="••••••••" className="pl-10 bg-[#0F172A]/50 border-white/10 focus:border-indigo-500/50 text-white placeholder:text-slate-600" defaultValue={!isRegister ? "password123" : ""} />
              </div>
            </div>
            
            <Button type="submit" className="w-full h-12 text-base font-semibold shadow-lg shadow-indigo-500/25 transition-all bg-indigo-600 hover:bg-indigo-500 text-white" disabled={loading}>
              {loading ? 'Authenticating...' : (isRegister ? 'Create Workspace' : 'Sign In')}
            </Button>
          </form>
          <div className="mt-6 text-center text-sm text-slate-400">
            {isRegister ? "Already have an account? " : "Need an account? "}
            <button onClick={() => setIsRegister(!isRegister)} className="text-indigo-400 hover:underline font-medium">
              {isRegister ? "Sign in" : "Create Workspace"}
            </button>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center text-xs text-slate-500">
          Protected by Enterprise SSO & End-to-End Encryption
        </CardFooter>
      </Card>
    </div>
  );
}
