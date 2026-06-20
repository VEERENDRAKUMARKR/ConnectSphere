import { Hash, MessageSquare, Video, FileText, ChevronDown, UserPlus, Settings, PieChart, Users } from 'lucide-react';
import { useStore } from '../store';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function Sidebar() {
  const { workspaces, activeWorkspaceId, activeChannel, setActiveChannel } = useStore();

  const activeWorkspace = workspaces.find((w) => w.id === activeWorkspaceId);

  if (!activeWorkspace) {
    return <div className="w-64 h-full bg-[#1E293B]/50 border-r border-white/5 flex flex-col p-4 animate-pulse"></div>;
  }

  const textChannels = activeWorkspace.channels.filter(c => !c.isPrivate);
  const users = activeWorkspace.users.map(u => u.user);

  return (
    <div className="w-64 h-full bg-[#1E293B]/50 border-r border-white/5 flex flex-col">
      <div className="h-16 flex items-center px-6 border-b border-white/5 justify-between">
        <span className="font-semibold text-sm tracking-wide uppercase text-slate-300 truncate pr-2">{activeWorkspace.name}</span>
        <div className="w-6 h-6 rounded bg-slate-700/50 flex flex-shrink-0 items-center justify-center cursor-pointer">
          <ChevronDown className="w-4 h-4 text-slate-300" />
        </div>
      </div>

      <ScrollArea className="flex-1 w-full">
        <div className="p-4 space-y-8">
          
          <section>
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4">Channels</h3>
            <ul className="space-y-1">
              {textChannels.map((channel) => (
                <li
                  key={channel.id}
                  onClick={() => setActiveChannel(channel.id)}
                  className={cn(
                    "flex items-center px-3 py-2 rounded-md text-sm cursor-pointer transition-colors border-l-2",
                    activeChannel === channel.id
                      ? "bg-indigo-500/10 text-indigo-400 font-medium border-indigo-500"
                      : "border-transparent text-slate-400 hover:bg-white/5"
                  )}
                >
                  <span className={cn("mr-2", activeChannel === channel.id ? "opacity-60" : "opacity-30")}>#</span> {channel.name}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4">Direct Messages</h3>
            <ul className="space-y-1">
              {users.map((member) => (
                <li
                  key={member.id}
                  onClick={() => setActiveChannel(`dm-${member.id}`)}
                  className={cn(
                    "flex items-center px-3 py-2 rounded-md text-sm cursor-pointer transition-colors border-l-2",
                    activeChannel === `dm-${member.id}`
                      ? "bg-indigo-500/10 text-indigo-400 font-medium border-indigo-500"
                      : "border-transparent text-slate-400 hover:bg-white/5"
                  )}
                >
                  <div className="relative mr-2">
                    <Avatar className="w-5 h-5">
                      <AvatarImage src={member.avatarUrl || `https://i.pravatar.cc/150?u=${member.id}`} />
                      <AvatarFallback>{member.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className={cn(
                      "absolute bottom-[-2px] right-[-2px] w-2.5 h-2.5 rounded-full border-2 border-[#1E293B]",
                      member.status === 'ONLINE' ? "bg-emerald-500" : member.status === 'BUSY' ? "bg-red-500" : "bg-slate-500"
                    )} />
                  </div>
                  <span className="truncate">{member.name}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4">Upcoming Meetings</h3>
            <div className="space-y-3">
              <div className="p-3 bg-[#1E293B] rounded-lg border border-white/5">
                <div className="text-xs text-indigo-400 mb-1 font-semibold">14:00 - 15:00</div>
                <div className="text-sm font-medium">Weekly Architecture Review</div>
                <div className="flex mt-2 -space-x-2">
                  <div className="w-5 h-5 rounded-full border border-[#0F172A] bg-blue-500"></div>
                  <div className="w-5 h-5 rounded-full border border-[#0F172A] bg-purple-500"></div>
                  <div className="w-5 h-5 rounded-full border border-[#0F172A] bg-emerald-500"></div>
                  <div className="w-5 h-5 rounded-full border border-[#0F172A] bg-slate-700 flex items-center justify-center text-[8px]">+4</div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </ScrollArea>

      <div className="p-4 mt-auto border-t border-white/5">
        <div className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 p-3 rounded-lg border border-indigo-500/30">
          <div className="text-[10px] font-bold text-indigo-300 uppercase">Cloud Status</div>
          <div className="flex items-center mt-1">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse mr-2"></div>
            <span className="text-xs text-slate-300">AWS - us-east-1 Active</span>
          </div>
        </div>
      </div>
    </div>
  );
}
