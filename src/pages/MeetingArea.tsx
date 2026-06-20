import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Video, VideoOff, MonitorUp, PhoneOff, Settings, CheckCircle2, Copy } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function MeetingArea() {
  const { meetingId } = useParams();
  const navigate = useNavigate();
  const { user, videoOn, audioOn, screenSharing, toggleVideo, toggleAudio, toggleScreenShare, leaveMeeting } = useStore();
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  // Mock participants
  const participants = [
    { id: 'me', name: `${user?.name} (You)`, isSpeaking: true, role: 'CTO' },
    { id: 'usr2', name: 'Marcus Thorne', isSpeaking: false, role: 'Architect' },
    { id: 'usr3', name: 'Elena Rodriguez', isSpeaking: false, role: 'Security' },
  ];

  useEffect(() => {
    async function startMedia() {
      try {
        const _stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setStream(_stream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = _stream;
        }
      } catch (err) {
        console.warn('Could not access camera/mic. Using mock UI instead.', err);
      }
    }
    startMedia();
    
    return () => {
      stream?.getTracks().forEach(track => track.stop());
    };
  }, []);

  useEffect(() => {
    if (stream) {
      stream.getVideoTracks().forEach(t => t.enabled = videoOn);
      stream.getAudioTracks().forEach(t => t.enabled = audioOn);
    }
  }, [videoOn, audioOn, stream]);

  const handleLeave = () => {
    leaveMeeting();
    stream?.getTracks().forEach(track => track.stop());
    navigate('/');
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground font-sans">
      <main className="flex-1 flex flex-col relative bg-[#0F172A]">
        {/* Header */}
        <header className="h-16 flex items-center px-8 border-b border-white/5 bg-[#0F172A]/80 backdrop-blur-md z-10">
          <div className="flex flex-col">
            <h1 className="text-lg font-semibold flex items-center">
              Internal Q3 Strategy Session
              <span className="ml-3 px-2 py-0.5 bg-red-500/20 text-red-500 text-[10px] uppercase font-bold rounded border border-red-500/20 tracking-wider">Rec</span>
            </h1>
            <p className="text-xs text-slate-500 font-mono tracking-tight">ID: {meetingId} &bull; 1080p WebRTC Session &bull; 00:42:18</p>
          </div>
          <div className="ml-auto flex items-center space-x-3">
            <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition-colors shadow-lg shadow-indigo-500/20">
              Invite Participants
            </button>
            <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center border border-white/10 cursor-pointer hover:bg-white/10 transition">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            </div>
          </div>
        </header>

        {/* Main Grid */}
        <div className="flex-1 p-6 grid grid-cols-2 grid-rows-2 gap-4">
          {participants.map((p, idx) => (
             <div key={p.id} className={`relative rounded-2xl overflow-hidden border bg-slate-800 ${p.isSpeaking ? 'border-2 border-indigo-500 shadow-2xl' : 'border-white/5 opacity-90'}`}>
                {p.id === 'me' && stream && videoOn ? (
                 <video 
                    ref={localVideoRef} 
                    autoPlay 
                    playsInline 
                    muted 
                    className="w-full h-full object-cover transform scale-x-[-1]" 
                 />
               ) : (
                 <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('https://i.pravatar.cc/800?u=${p.id}')`, opacity: 0.8 }}></div>
               )}
               
               <div className="absolute bottom-4 left-4 flex items-center px-3 py-1.5 bg-black/40 backdrop-blur-md rounded-lg text-xs font-medium border border-white/10">
                 {p.isSpeaking && <div className="w-2 h-2 rounded-full bg-indigo-500 mr-2"></div>}
                 {p.name} ({p.role})
               </div>
               
               {p.id === 'me' && (
                 <div className="absolute top-4 right-4">
                    <div className="bg-indigo-600 p-1.5 rounded-full">
                      {!audioOn ? <MicOff className="w-3 h-3 text-white" /> : <Mic className="w-3 h-3 text-white" />}
                    </div>
                 </div>
               )}
            </div>
          ))}

          {/* Screen Share Placeholder */}
          <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-dashed border-slate-700 flex flex-col items-center justify-center text-slate-500">
            <div className="p-4 rounded-full bg-slate-800 mb-3">
              <MonitorUp className="w-8 h-8 opacity-50" />
            </div>
            <span className="text-xs font-medium uppercase tracking-widest">{screenSharing ? 'You are sharing your screen' : 'Presentation Feed Empty'}</span>
          </div>
        </div>

        {/* Control Dock */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center px-6 py-4 bg-[#1E293B]/90 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-2xl space-x-6 z-50">
          <div className="flex space-x-4 pr-6 border-r border-white/10">
            <button onClick={toggleAudio} className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all shadow-inner ${audioOn ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-red-500/20 text-red-500 hover:bg-red-500/30'}`}>
              {audioOn ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
            </button>
            <button onClick={toggleVideo} className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all shadow-inner ${videoOn ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-red-500/20 text-red-500 hover:bg-red-500/30'}`}>
              {videoOn ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
            </button>
          </div>
          <div className="flex space-x-4 px-6 border-r border-white/10">
            <button onClick={toggleScreenShare} className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${screenSharing ? 'bg-indigo-600 text-white' : 'bg-slate-700 hover:bg-indigo-600 text-white'}`}>
              <MonitorUp className="w-6 h-6" />
            </button>
            <button className="w-12 h-12 rounded-xl bg-slate-700 hover:bg-indigo-600 flex items-center justify-center text-white transition-all">
              <Settings className="w-6 h-6" />
            </button>
          </div>
          <button onClick={handleLeave} className="px-8 h-12 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold transition-all shadow-lg shadow-red-500/20">
            End Call
          </button>
        </div>
      </main>

      {/* Right Sidebar: AI Assistant */}
      <aside className="w-80 bg-[#1E293B] border-l border-white/5 flex flex-col z-20">
        <div className="flex border-b border-white/5">
          <button className="flex-1 py-4 text-xs font-bold text-indigo-400 border-b-2 border-indigo-500 uppercase tracking-wider">AI Assistant</button>
          <button className="flex-1 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider hover:text-slate-300">Chat & Participants</button>
        </div>
        <div className="flex-1 p-5 overflow-hidden flex flex-col space-y-6">
          {/* AI Intelligence Box */}
          <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4">
            <div className="flex items-center text-xs font-bold text-indigo-400 mb-3">
              <CheckCircle2 className="w-4 h-4 mr-2" />
              LIVE SUMMARY
            </div>
            <p className="text-sm leading-relaxed text-slate-300">
              Sarah is discussing the migration plan for <span className="text-white font-medium">Cluster-7</span>. Key concerns raised: <span className="text-indigo-400 italic">Data consistency latency</span> and <span className="text-indigo-400 italic">S3 replication costs</span>.
            </p>
          </div>

          {/* Transcription Feed */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-indigo-400 uppercase">Sarah Jenkins &bull; 14:12</span>
              <p className="text-sm text-slate-400">The Kubernetes manifests are now updated for the new ingress controller. Elena, can you check the policy?</p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-emerald-400 uppercase">Elena Rodriguez &bull; 14:14</span>
              <p className="text-sm text-slate-400">On it. I'll need the IAM role ARN to finalize the AWS OIDC configuration.</p>
            </div>
            <div className="p-3 bg-white/5 rounded-lg border border-white/5">
              <div className="flex items-center text-[10px] font-bold text-slate-500 mb-2 uppercase">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                AI Action Item Generated
              </div>
              <p className="text-xs text-indigo-200 font-medium">Elena to review IAM policies for ingress by EOD.</p>
            </div>
          </div>

          {/* AI Prompt Bar */}
          <div className="mt-auto pt-4 border-t border-white/5">
            <div className="relative">
              <input type="text" placeholder="Ask AI meeting assistant..." className="w-full bg-[#0F172A] border border-white/10 rounded-lg py-3 px-4 text-xs text-white focus:outline-none focus:border-indigo-500/50" />
              <div className="absolute right-3 top-2">
                <div className="p-1.5 bg-indigo-600 rounded-md shadow-lg shadow-indigo-600/20 cursor-pointer">
                   <Mic className="w-3 h-3 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
