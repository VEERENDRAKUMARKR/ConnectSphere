import { useState, useEffect, useRef } from 'react';
import { useStore } from '../store';
import { socket } from '../lib/socket';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, Hash, Phone, Video, Info, Paperclip, Smile, MoreVertical } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ChatArea() {
  const { user, workspaces, activeWorkspaceId, activeChannel, addMessage, joinMeeting } = useStore();
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    socket.on('message:receive', (msg) => {
      addMessage(msg.channelId, msg);
    });
    return () => {
      socket.off('message:receive');
    };
  }, [addMessage]);
  
  useEffect(() => {
    if (activeChannel) {
      socket.emit('channel:join', activeChannel);
    }
  }, [activeChannel]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [workspaces, activeChannel]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !user || !activeChannel) return;
    
    const msg = {
      id: crypto.randomUUID(),
      senderId: user.id,
      roomId: activeChannel, // Keep compatibility internally
      content: input,
      timestamp: new Date().toISOString(),
      user: {
        id: user.id,
        name: user.name,
        avatarUrl: user.avatar
      }
    };
    
    // Add explicitly to keep UX smooth
    addMessage(activeChannel, msg);
    socket.emit('message:send', { channelId: activeChannel, ...msg });
    setInput('');
  };

  const startMeeting = () => {
    const meetingId = `meet-${activeChannel}-${Date.now()}`;
    joinMeeting(meetingId);
    navigate(`/meeting/${meetingId}`);
  };

  const activeWorkspace = workspaces.find(w => w.id === activeWorkspaceId);
  const isDm = activeChannel?.startsWith('dm-');
  
  let displayName = activeChannel;
  let channelMessages: any[] = [];
  
  if (activeWorkspace) {
    if (isDm) {
      const dmId = activeChannel.split('dm-')[1];
      const member = activeWorkspace.users.find(u => u.user.id === dmId);
      if (member) {
        displayName = member.user.name;
        // Mock DMs messages for now as we didn't model them differently in API completely for UI
        channelMessages = []; 
      }
    } else {
      const ch = activeWorkspace.channels.find(c => c.id === activeChannel);
      if (ch) {
        displayName = ch.name;
        channelMessages = ch.messages || [];
      }
    }
  }

  if (!activeChannel) {
    return <div className="flex-1 flex flex-col h-full bg-[#0F172A] items-center justify-center text-slate-500">Select a channel</div>;
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0F172A] relative text-foreground">
      {/* Header */}
      <div className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-[#0F172A]/80 backdrop-blur-md z-10 sticky top-0">
        <div className="flex items-center gap-2">
          {isDm ? (
             <div className="flex items-center gap-2">
               <Avatar className="w-6 h-6">
                 <AvatarImage src={`https://i.pravatar.cc/150?u=${activeChannel}`} />
                 <AvatarFallback>U</AvatarFallback>
               </Avatar>
               <h3 className="font-semibold text-foreground tracking-wide">{displayName}</h3>
             </div>
          ) : (
             <div className="flex items-center gap-2">
               <Hash className="w-5 h-5 text-indigo-400" />
               <h3 className="font-semibold text-foreground tracking-wide">{displayName}</h3>
             </div>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={startMeeting} className="text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10">
            <Phone className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={startMeeting} className="text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10">
            <Video className="w-5 h-5 text-indigo-400" />
          </Button>
          <div className="w-px h-6 bg-white/10 mx-1" />
          <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white hover:bg-white/5">
            <Info className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6" ref={scrollRef}>
        <div className="text-center py-8">
          {isDm ? (
             <Avatar className="w-20 h-20 mx-auto mb-4 border border-white/5 shadow-2xl">
               <AvatarImage src={`https://i.pravatar.cc/150?u=${activeChannel}`} />
               <AvatarFallback className="bg-[#1E293B] text-indigo-400 text-xl">{displayName[0]}</AvatarFallback>
             </Avatar>
          ) : (
            <div className="w-16 h-16 bg-[#1E293B] rounded-full flex items-center justify-center mx-auto mb-4 border border-white/5 shadow-2xl">
              <Hash className="w-8 h-8 text-indigo-400" />
            </div>
          )}
          <h2 className="text-xl font-semibold mb-2">Welcome to {isDm ? displayName : `#${displayName}`}!</h2>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            This is the start of the {isDm ? `direct message history with ${displayName}` : `#${displayName} channel`}. Messages are end-to-end encrypted.
          </p>
        </div>

        {channelMessages.map((msg, i) => {
          const isMe = (msg.senderId || msg.user?.id) === user?.id;
          const prevSenderId = i > 0 ? (channelMessages[i - 1].senderId || channelMessages[i - 1].user?.id) : null;
          const currentSenderId = msg.senderId || msg.user?.id;
          const showAvatar = i === 0 || prevSenderId !== currentSenderId;
          const senderName = isMe ? 'You' : (msg.user?.name || 'User');
          const senderAvatar = msg.user?.avatarUrl || `https://i.pravatar.cc/150?u=${currentSenderId}`;
          
          return (
            <div key={msg.id} className={`flex gap-3 max-w-3xl ${isMe ? 'ml-auto flex-row-reverse' : ''}`}>
              {showAvatar ? (
                 <Avatar className="w-8 h-8 mt-1 border border-white/10 shadow-lg">
                   <AvatarImage src={senderAvatar} />
                   <AvatarFallback className="bg-indigo-500/20 text-indigo-400">{isMe ? 'ME' : 'U'}</AvatarFallback>
                 </Avatar>
              ) : (
                 <div className="w-8" />
              )}
              
              <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                {showAvatar && (
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-slate-300 uppercase">{senderName}</span>
                    <span className="text-xs text-slate-500 font-mono">{new Date(msg.timestamp || msg.createdAt || new Date()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                )}
                <div className={`px-4 py-2.5 rounded-2xl text-sm shadow-md ${
                  isMe 
                    ? 'bg-indigo-600/90 text-white rounded-tr-sm border border-indigo-500/50' 
                    : 'bg-[#1E293B] border border-white/5 rounded-tl-sm text-slate-200'
                }`}>
                  {msg.content}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Input */}
      <div className="p-4 bg-[#0F172A] border-t border-white/5">
        <form onSubmit={handleSend} className="max-w-4xl mx-auto relative flex items-end gap-2 bg-[#1E293B]/50 border border-white/10 rounded-xl p-2 focus-within:ring-1 focus-within:ring-indigo-500 shadow-xl transition-all">
          <div className="flex items-center gap-1 pb-1 px-1">
            <Button type="button" variant="ghost" size="icon" className="w-8 h-8 text-slate-400 hover:text-white hover:bg-white/5 rounded-full">
              <Paperclip className="w-4 h-4" />
            </Button>
          </div>
          <Input 
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={`Message ${isDm ? displayName : '#' + displayName}`}
            className="border-0 focus-visible:ring-0 bg-transparent px-2 h-10 resize-none flex-1 shadow-none text-slate-200 placeholder:text-slate-500"
          />
          <div className="flex items-center gap-1 pb-1">
             <Button type="button" variant="ghost" size="icon" className="w-8 h-8 text-slate-400 hover:text-white hover:bg-white/5 rounded-full hidden sm:inline-flex">
              <Smile className="w-4 h-4" />
            </Button>
            <Button type="submit" disabled={!input.trim()} size="icon" className="w-8 h-8 rounded-lg ml-1 shrink-0 bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-md disabled:bg-slate-800 disabled:text-slate-500">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </form>
        <div className="text-center mt-3">
          <span className="text-[10px] text-slate-500 flex items-center justify-center gap-1 uppercase tracking-widest font-bold">
             Pro tip: Press <kbd className="px-1.5 py-0.5 border border-white/10 rounded bg-[#1E293B] font-mono text-[9px] text-slate-300">Enter</kbd> to send
          </span>
        </div>
      </div>
    </div>
  );
}
