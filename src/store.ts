import { create } from 'zustand';

interface User {
  id: string;
  name: string;
  avatar: string;
  role: string;
  email: string;
}

interface Message {
  id: string;
  senderId: string;
  roomId?: string;
  content: string;
  timestamp: string;
  user?: {
    id: string;
    name: string;
    avatarUrl: string;
  }
}

interface Channel {
  id: string;
  name: string;
  isPrivate: boolean;
  messages: Message[];
}

interface Workspace {
  id: string;
  name: string;
  organization: {
    id: string;
    name: string;
  };
  channels: Channel[];
  users: Array<{
    user: {
      id: string;
      name: string;
      avatarUrl?: string;
      status: string;
      role: string;
    }
  }>;
}

interface AppState {
  token: string | null;
  user: User | null;
  workspaces: Workspace[];
  activeWorkspaceId: string | null;
  activeChannel: string;
  inMeeting: boolean;
  meetingId: string | null;
  videoOn: boolean;
  audioOn: boolean;
  screenSharing: boolean;
  isSidebarOpen: boolean;
  
  setToken: (token: string | null) => void;
  setUser: (user: User | null) => void;
  setWorkspaces: (workspaces: Workspace[]) => void;
  setActiveWorkspaceId: (id: string) => void;
  setActiveChannel: (channel: string) => void;
  addMessage: (channelId: string, msg: Message) => void;
  joinMeeting: (id: string) => void;
  leaveMeeting: () => void;
  toggleVideo: () => void;
  toggleAudio: () => void;
  toggleScreenShare: () => void;
  setSidebarOpen: (open: boolean) => void;
  logout: () => void;
}

export const useStore = create<AppState>((set) => ({
  token: localStorage.getItem('token') || null,
  user: null,
  workspaces: [],
  activeWorkspaceId: null,
  activeChannel: '', // will be set dynamically
  inMeeting: false,
  meetingId: null,
  videoOn: true,
  audioOn: true,
  screenSharing: false,
  isSidebarOpen: true,

  setToken: (token) => set({ token }),
  setUser: (user) => set({ user }),
  setWorkspaces: (workspaces) => {
    const ws = workspaces.map((w: any) => w.workspace);
    set({ workspaces: ws });
    if (ws.length > 0) {
      set({ activeWorkspaceId: ws[0].id });
      if (ws[0].channels.length > 0) {
        set({ activeChannel: ws[0].channels[0].id });
      }
    }
  },
  setActiveWorkspaceId: (activeWorkspaceId) => set({ activeWorkspaceId }),
  setActiveChannel: (activeChannel) => set({ activeChannel }),
  
  addMessage: (channelId, msg) => set((state) => {
    // We update the specific channel's messages array
    const newWorkspaces = state.workspaces.map(ws => {
      return {
        ...ws,
        channels: ws.channels.map(ch => {
          if (ch.id === channelId) {
            return {
              ...ch,
              messages: [...ch.messages, msg]
            };
          }
          return ch;
        })
      };
    });
    return { workspaces: newWorkspaces };
  }),

  joinMeeting: (meetingId) => set({ inMeeting: true, meetingId }),
  leaveMeeting: () => set({ inMeeting: false, meetingId: null, screenSharing: false }),
  toggleVideo: () => set((state) => ({ videoOn: !state.videoOn })),
  toggleAudio: () => set((state) => ({ audioOn: !state.audioOn })),
  toggleScreenShare: () => set((state) => ({ screenSharing: !state.screenSharing })),
  setSidebarOpen: (isSidebarOpen) => set({ isSidebarOpen }),
  
  logout: () => {
    localStorage.removeItem('token');
    set({ token: null, user: null, workspaces: [], activeWorkspaceId: null, activeChannel: '' });
  }
}));
