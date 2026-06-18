import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';

/* ─── helpers ────────────────────────────────────────────────────── */
const fmtTime = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor((now - d) / 86400000);
  if (diffDays === 0) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7)  return d.toLocaleDateString([], { weekday: 'short' });
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

const avatarLetters = (name) => {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  return parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : name[0].toUpperCase();
};

const POLL_INTERVAL = 4000; // ms

/* ─── component ──────────────────────────────────────────────────── */
export default function Messages() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Conversation list
  const [conversations, setConversations] = useState([]);
  const [convsLoading, setConvsLoading] = useState(true);

  // Active thread
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages]     = useState([]);
  const [msgLoading, setMsgLoading] = useState(false);

  // New conversation picker
  const [showNewChat, setShowNewChat] = useState(false);
  const [users, setUsers]             = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userSearch, setUserSearch]   = useState('');

  // Compose
  const [draft, setDraft]     = useState('');
  const [sending, setSending] = useState(false);

  // mobile: show thread pane
  const [mobileThread, setMobileThread] = useState(false);

  const bottomRef  = useRef(null);
  const inputRef   = useRef(null);
  const pollRef    = useRef(null);

  /* ── redirect if not logged in ── */
  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);

  /* ── load conversations ── */
  const loadConversations = useCallback(async () => {
    try {
      const res = await api.get('/api/messages/conversations');
      if (res?.success) setConversations(res.data || []);
    } catch { /* ignore */ }
  }, []);

  /* ── open or create conversation ── */
  const openOrCreateConversation = useCallback(async (recipientId) => {
    try {
      const res = await api.post('/api/messages/conversations', { recipientId });
      if (res?.success && res.data) {
        setActiveConv(res.data);
        setMobileThread(true);
        // refresh conversation list
        await loadConversations();
      }
    } catch (e) {
      console.error('Failed to open conversation', e);
    }
  }, [loadConversations]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setConvsLoading(true);
    loadConversations().finally(() => setConvsLoading(false));
  }, [loadConversations]);

  /* ── handle ?recipient= query param (deep link from consultant profile) ── */
  useEffect(() => {
    const recipientId = searchParams.get('recipient');
    if (recipientId && user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      openOrCreateConversation(recipientId);
    }
  }, [searchParams, user, openOrCreateConversation]);

  /* ── load messages for active conversation ── */
  const loadMessages = useCallback(async (convId) => {
    if (!convId) return;
    try {
      const res = await api.get(`/api/messages/conversations/${convId}/messages`);
      if (res?.success) {
        setMessages(res.data || []);
      }
    } catch { /* ignore */ }
  }, []);

  /* ── poll messages ── */
  useEffect(() => {
    if (pollRef.current) clearInterval(pollRef.current);
    if (!activeConv) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMsgLoading(true);
    loadMessages(activeConv.id).finally(() => setMsgLoading(false));

    pollRef.current = setInterval(() => {
      loadMessages(activeConv.id);
      loadConversations();
    }, POLL_INTERVAL);

    return () => clearInterval(pollRef.current);
  }, [activeConv, loadMessages, loadConversations]);

  /* ── auto-scroll to bottom ── */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  /* ── focus input on conversation open ── */
  useEffect(() => {
    if (activeConv) setTimeout(() => inputRef.current?.focus(), 100);
  }, [activeConv]);

  /* ── select existing conversation ── */
  const selectConversation = (conv) => {
    setActiveConv(conv);
    setMobileThread(true);
    setDraft('');
  };

  /* ── send message ── */
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!draft.trim() || !activeConv || sending) return;
    const text = draft.trim();
    setDraft('');
    setSending(true);
    try {
      const res = await api.post(`/api/messages/conversations/${activeConv.id}/messages`, { textContent: text });
      if (res?.success) {
        setMessages((prev) => [...prev, res.data]);
        // refresh sidebar last message
        loadConversations();
      }
    } catch { /* ignore */ } finally {
      setSending(false);
    }
  };

  /* ── load user directory ── */
  const loadUsers = async () => {
    setUsersLoading(true);
    try {
      const res = await api.get('/api/messages/users');
      if (res?.success) setUsers(res.data || []);
    } catch { /* ignore */ } finally {
      setUsersLoading(false);
    }
  };

  const handleNewChat = () => {
    setShowNewChat(true);
    setUserSearch('');
    loadUsers();
  };

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(userSearch.toLowerCase())
  );

  /* ── key handler ── */
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(e);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop py-6">
      <h1 className="font-headline-lg text-headline-lg font-bold text-primary mb-6 flex items-center gap-2">
        <span className="material-symbols-outlined text-secondary text-[30px]">chat</span>
        Messages
      </h1>

      {/* ── Main Layout ── */}
      <div className="flex h-[calc(100vh-210px)] min-h-[480px] bg-surface-container-low border border-outline-variant/30 rounded-2xl overflow-hidden shadow-sm">

        {/* ── LEFT: Conversations Sidebar ── */}
        <div className={`${mobileThread ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-[320px] md:min-w-[280px] border-r border-outline-variant/20`}>
          {/* Sidebar header */}
          <div className="flex justify-between items-center px-4 py-4 border-b border-outline-variant/20 bg-surface shrink-0">
            <span className="font-bold text-primary text-body-md">Conversations</span>
            <button
              id="new-chat-btn"
              onClick={handleNewChat}
              className="flex items-center gap-1 text-secondary font-bold text-body-sm hover:bg-secondary/10 px-3 py-1.5 rounded-full transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">edit</span>
              New
            </button>
          </div>

          {/* Conversation list */}
          <div className="flex-1 overflow-y-auto">
            {convsLoading ? (
              <div className="flex items-center justify-center py-16 gap-2 text-on-surface-variant">
                <div className="w-5 h-5 border-2 border-secondary border-t-transparent rounded-full animate-spin" />
                <span className="text-body-sm">Loading…</span>
              </div>
            ) : conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3 px-6 text-center">
                <span className="material-symbols-outlined text-[48px] text-on-surface-variant/40">chat_bubble</span>
                <p className="text-body-sm text-on-surface-variant font-medium">No conversations yet.</p>
                <button
                  onClick={handleNewChat}
                  className="bg-secondary text-white font-bold text-body-sm px-4 py-2 rounded-full hover:bg-secondary/90 transition-colors mt-1"
                >
                  Start a Conversation
                </button>
              </div>
            ) : (
              conversations.map((conv) => {
                const isActive = activeConv?.id === conv.id;
                const isUnread = conv.lastMessage && !conv.lastMessage.isRead && conv.lastMessage.senderId !== user.userId;
                return (
                  <button
                    key={conv.id}
                    id={`conv-${conv.id}`}
                    onClick={() => selectConversation(conv)}
                    className={`w-full text-left flex items-start gap-3 px-4 py-3.5 border-b border-outline-variant/15 transition-colors hover:bg-surface-container ${isActive ? 'bg-surface-container' : ''}`}
                  >
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-secondary/30 to-primary/30 flex items-center justify-center text-primary font-bold text-body-sm shrink-0">
                      {avatarLetters(conv.otherUser?.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-0.5">
                        <span className={`text-body-sm font-${isUnread ? 'extrabold' : 'semibold'} text-primary truncate`}>
                          {conv.otherUser?.name || 'Unknown'}
                        </span>
                        <span className="text-[11px] text-on-surface-variant/60 shrink-0 ml-2">
                          {fmtTime(conv.lastMessage?.createdAt || conv.createdAt)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <p className={`text-xs truncate flex-1 ${isUnread ? 'text-primary font-semibold' : 'text-on-surface-variant/70'}`}>
                          {conv.lastMessage?.textContent || 'No messages yet'}
                        </p>
                        {isUnread && (
                          <span className="w-2 h-2 rounded-full bg-secondary shrink-0" />
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* ── RIGHT: Message Thread ── */}
        <div className={`${!mobileThread ? 'hidden md:flex' : 'flex'} flex-col flex-1 min-w-0`}>
          {!activeConv ? (
            /* Empty state */
            <div className="flex flex-col items-center justify-center flex-1 gap-4 text-center px-6">
              <span className="material-symbols-outlined text-[64px] text-secondary/40">forum</span>
              <p className="font-bold text-primary text-body-lg">Select a conversation</p>
              <p className="text-body-sm text-on-surface-variant">Choose one from the left, or start a new chat.</p>
              <button
                onClick={handleNewChat}
                className="bg-secondary text-white font-bold text-body-sm px-5 py-2.5 rounded-full hover:bg-secondary/90 transition-colors shadow"
              >
                New Conversation
              </button>
            </div>
          ) : (
            <>
              {/* Thread Header */}
              <div className="flex items-center gap-3 px-4 py-3.5 border-b border-outline-variant/20 bg-surface shrink-0">
                <button
                  className="md:hidden text-primary mr-1 hover:bg-surface-container-low p-1 rounded-lg"
                  onClick={() => { setMobileThread(false); setActiveConv(null); }}
                >
                  <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-secondary/30 to-primary/30 flex items-center justify-center text-primary font-bold text-body-sm shrink-0">
                  {avatarLetters(activeConv.otherUser?.name)}
                </div>
                <div>
                  <p className="font-bold text-primary text-body-sm">{activeConv.otherUser?.name || 'Unknown'}</p>
                  <p className="text-[11px] text-on-surface-variant/60 capitalize">{activeConv.otherUser?.role || 'user'}</p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2 bg-surface/50">
                {msgLoading && messages.length === 0 ? (
                  <div className="flex items-center justify-center py-12 gap-2 text-on-surface-variant">
                    <div className="w-5 h-5 border-2 border-secondary border-t-transparent rounded-full animate-spin" />
                    <span className="text-body-sm">Loading messages…</span>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center gap-2">
                    <span className="material-symbols-outlined text-[40px] text-on-surface-variant/30">chat_bubble_outline</span>
                    <p className="text-body-sm text-on-surface-variant font-medium">No messages yet. Say hello! 👋</p>
                  </div>
                ) : (
                  messages.map((msg, idx) => {
                    const isMine = msg.senderId === user.userId;
                    const prevMsg = messages[idx - 1];
                    const showDate = !prevMsg || new Date(msg.createdAt).toDateString() !== new Date(prevMsg.createdAt).toDateString();
                    return (
                      <div key={msg.id}>
                        {showDate && (
                          <div className="flex items-center gap-3 py-2">
                            <div className="flex-1 h-px bg-outline-variant/20" />
                            <span className="text-[11px] text-on-surface-variant/50 font-medium">
                              {new Date(msg.createdAt).toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}
                            </span>
                            <div className="flex-1 h-px bg-outline-variant/20" />
                          </div>
                        )}
                        <div className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                          <div
                            className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-body-sm shadow-sm ${
                              isMine
                                ? 'bg-secondary text-white rounded-br-sm'
                                : 'bg-surface-container text-on-surface rounded-bl-sm border border-outline-variant/20'
                            }`}
                          >
                            <p className="whitespace-pre-wrap leading-relaxed">{msg.textContent}</p>
                            <p className={`text-[10px] mt-1 ${isMine ? 'text-white/60 text-right' : 'text-on-surface-variant/50'}`}>
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              {isMine && (
                                <span className="ml-1 material-symbols-outlined text-[12px]">
                                  {msg.isRead ? 'done_all' : 'done'}
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={bottomRef} />
              </div>

              {/* Compose */}
              <form onSubmit={sendMessage} className="flex items-end gap-3 px-4 py-3 border-t border-outline-variant/20 bg-surface shrink-0">
                <textarea
                  ref={inputRef}
                  id="message-input"
                  rows={1}
                  value={draft}
                  onChange={(e) => {
                    setDraft(e.target.value);
                    e.target.style.height = 'auto';
                    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message… (Enter to send)"
                  className="flex-1 resize-none bg-surface-container border border-outline-variant/30 rounded-xl px-4 py-2.5 text-body-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-secondary/40 transition-shadow overflow-hidden"
                  style={{ maxHeight: '120px' }}
                />
                <button
                  id="send-message-btn"
                  type="submit"
                  disabled={!draft.trim() || sending}
                  className="w-10 h-10 flex items-center justify-center bg-secondary text-white rounded-full hover:bg-secondary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
                >
                  {sending
                    ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    : <span className="material-symbols-outlined text-[20px]">send</span>
                  }
                </button>
              </form>
            </>
          )}
        </div>
      </div>

      {/* ── New Chat Modal ── */}
      {showNewChat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-surface w-full max-w-md rounded-2xl shadow-2xl border border-outline-variant/30 overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center px-5 py-4 border-b border-outline-variant/20">
              <h2 className="font-bold text-primary text-body-md">Start a Conversation</h2>
              <button
                onClick={() => setShowNewChat(false)}
                className="text-on-surface-variant hover:text-primary hover:bg-surface-container-low p-1.5 rounded-full transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Search */}
            <div className="px-5 pt-4 pb-2">
              <div className="flex items-center gap-2 bg-surface-container border border-outline-variant/30 rounded-xl px-3 py-2">
                <span className="material-symbols-outlined text-on-surface-variant text-[20px]">search</span>
                <input
                  id="user-search-input"
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Search by name…"
                  className="flex-1 bg-transparent text-body-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none"
                  autoFocus
                />
              </div>
            </div>

            {/* User List */}
            <div className="overflow-y-auto max-h-72 px-2 pb-4">
              {usersLoading ? (
                <div className="flex items-center justify-center py-10 gap-2 text-on-surface-variant">
                  <div className="w-5 h-5 border-2 border-secondary border-t-transparent rounded-full animate-spin" />
                  <span className="text-body-sm">Loading users…</span>
                </div>
              ) : filteredUsers.length === 0 ? (
                <p className="text-center text-body-sm text-on-surface-variant py-8">No users found.</p>
              ) : (
                filteredUsers.map((u) => (
                  <button
                    key={u.id}
                    id={`user-${u.id}`}
                    onClick={async () => {
                      setShowNewChat(false);
                      await openOrCreateConversation(u.id);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-surface-container-low transition-colors text-left"
                  >
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-secondary/30 to-primary/30 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                      {avatarLetters(u.name)}
                    </div>
                    <div>
                      <p className="font-bold text-primary text-body-sm">{u.name}</p>
                      <p className="text-xs text-on-surface-variant/60 capitalize">{u.role}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
