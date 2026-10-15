"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getPusherClient } from "@/lib/pusher";
import LeaderboardSection from "@/components/LeaderboardSection";

function CommunityHubInner() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialTab = searchParams.get("tab") === "leaderboard" ? "leaderboard" : "chat";
  const initialUserId = searchParams.get("user");

  // Main Community Tabs: "chat" | "leaderboard"
  const [activeTab, setActiveTab] = useState(initialUserId ? "chat" : initialTab);

  // Chat State
  const [activeChannel, setActiveChannel] = useState("global"); // "global" or partnerUserId
  const [activePartner, setActivePartner] = useState(null); // { _id, name, username, image, isVerified }
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [sending, setSending] = useState(false);
  const [userSearchResults, setUserSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchingUsers, setSearchingUsers] = useState(false);
  const [showAttachCampaign, setShowAttachCampaign] = useState(false);
  const [userFundraisers, setUserFundraisers] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isScrolledUp, setIsScrolledUp] = useState(false);

  const chatContainerRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Robust Auto-slide down mechanism: scrolls container to the bottom smoothly on its own
  const slideToBottom = (behavior = "smooth") => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior,
      });
    }
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  // Detect if user has scrolled up to show the "Down to latest" arrow button
  const handleScroll = () => {
    if (!chatContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    const distanceToBottom = scrollHeight - (scrollTop + clientHeight);
    setIsScrolledUp(distanceToBottom > 80);
  };

  // Only scroll down when switching channels or opening the tab (never auto-scroll on incoming messages)
  useEffect(() => {
    if (activeTab === "chat") {
      const t = setTimeout(() => slideToBottom("auto"), 150);
      return () => clearTimeout(t);
    }
  }, [activeChannel, activeTab]);

  // Load conversations list
  const loadConversations = async () => {
    if (status !== "authenticated") return;
    try {
      const res = await fetch("/api/chat/conversations");
      const data = await res.json();
      if (data.success) {
        setConversations(data.conversations || []);
      }
    } catch (err) {
      console.error("Error loading conversations:", err);
    }
  };

  useEffect(() => {
    loadConversations();
  }, [status]);

  // If URL has ?user=..., set active partner and open chat
  useEffect(() => {
    if (initialUserId && initialUserId !== "global") {
      async function fetchPartnerInfo() {
        try {
          const res = await fetch(`/api/users/${initialUserId}`);
          const data = await res.json();
          if (data.success && data.user) {
            setActivePartner(data.user);
            setActiveChannel(data.user._id);
            setActiveTab("chat");
          }
        } catch (err) {
          console.error("Failed to load partner user", err);
        }
      }
      fetchPartnerInfo();
    }
  }, [initialUserId]);

  // Load active user's fundraisers for campaign sharing
  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/fundraisers/mine")
        .then((r) => r.json())
        .then((d) => {
          if (d.success) setUserFundraisers(d.fundraisers || []);
        })
        .catch(() => {});
    }
  }, [status]);

  // Compute canonical conversationId
  const getConversationId = () => {
    if (activeChannel === "global") return "global";
    if (!session?.user?.id && !session?.user?._id) return "global";
    const currentId = session.user.id || session.user._id;
    return [currentId.toString(), activeChannel.toString()].sort().join("_");
  };

  // Fetch messages for active conversation
  const loadMessages = async () => {
    try {
      setLoadingMessages(true);
      const convId = getConversationId();
      const res = await fetch(`/api/chat/messages?conversationId=${convId}`);
      const data = await res.json();
      if (data.success) {
        setMessages(data.messages || []);
      }
    } catch (err) {
      console.error("Failed to load messages", err);
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    if (activeTab === "chat") {
      loadMessages();
    }
  }, [activeChannel, session, activeTab]);

  // Real-time updates with Pusher + Polling fallback
  useEffect(() => {
    if (activeTab !== "chat") return;
    const convId = getConversationId();
    const channelName = `chat-${convId}`;
    const pusher = getPusherClient();

    let channel = null;
    let fallbackInterval = null;

    if (pusher) {
      channel = pusher.subscribe(channelName);
      channel.bind("new-message", (newMsg) => {
        setMessages((prev) => {
          if (prev.some((m) => m._id === newMsg._id)) return prev;
          return [...prev, newMsg];
        });
        loadConversations();
      });
    } else {
      fallbackInterval = setInterval(() => {
        const currentConv = getConversationId();
        fetch(`/api/chat/messages?conversationId=${currentConv}`)
          .then((r) => r.json())
          .then((d) => {
            if (d.success) {
              setMessages(d.messages || []);
            }
          })
          .catch(() => {});
      }, 3000);
    }

    return () => {
      if (pusher && channel) {
        channel.unbind_all();
        pusher.unsubscribe(channelName);
      }
      if (fallbackInterval) {
        clearInterval(fallbackInterval);
      }
    };
  }, [activeChannel, session, activeTab]);

  // Handle user search in sidebar
  useEffect(() => {
    if (!searchQuery.trim()) {
      setUserSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setSearchingUsers(true);
      try {
        const res = await fetch(`/api/chat/conversations?search=${encodeURIComponent(searchQuery)}`);
        const data = await res.json();
        if (data.success) {
          setUserSearchResults(data.users || []);
        }
      } catch (err) {
        console.error("Search users error:", err);
      } finally {
        setSearchingUsers(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Send message
  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!inputText.trim() && !selectedCampaign) return;
    if (status !== "authenticated") {
      router.push("/login");
      return;
    }

    setSending(true);
    try {
      const payload = {
        text: inputText.trim(),
        recipientId: activeChannel === "global" ? "global" : activeChannel,
        campaignId: selectedCampaign?._id || null,
      };

      const res = await fetch("/api/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success && data.message) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === data.message._id)) return prev;
          return [...prev, data.message];
        });
        setInputText("");
        setSelectedCampaign(null);
        setShowAttachCampaign(false);
        loadConversations();
        slideToBottom("smooth");
      }
    } catch (err) {
      console.error("Error sending message:", err);
    } finally {
      setSending(false);
    }
  };

  const selectUserForDM = (user) => {
    setActivePartner(user);
    setActiveChannel(user._id);
    setSearchQuery("");
    setUserSearchResults([]);
    setMobileSidebarOpen(false);
    setActiveTab("chat");
  };

  const selectGlobalChannel = () => {
    setActiveChannel("global");
    setActivePartner(null);
    setMobileSidebarOpen(false);
    setActiveTab("chat");
  };

  return (
    <div className="h-[calc(100dvh-64px)] sm:h-[calc(100dvh-72px)] -mt-5 sm:-mt-7 bg-(--app-bg) text-(--app-text) flex flex-col overflow-hidden">
      {/* Top Section Nav / Switcher */}
      <div className="shrink-0 px-3 sm:px-8 py-2 sm:py-2.5 bg-white border-b-2 sm:border-b-3 border-black flex items-center justify-between gap-2 z-30 shadow-solid-sm">
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl sm:rounded-2xl border-2 border-black bg-[#22c55e] flex items-center justify-center text-base sm:text-lg shadow-solid-sm shrink-0">
            ✨
          </span>
          <div>
            <h1 className="font-editorial text-sm sm:text-xl font-black text-slate-950 leading-tight">
              Community
            </h1>
            <p className="text-[10px] text-slate-500 font-bold hidden sm:block">
              Connect, debate causes, and celebrate top benefactors
            </p>
          </div>
        </div>

        {/* Section Pill Switcher */}
        <div className="flex items-center bg-slate-100 p-0.5 sm:p-1 rounded-xl sm:rounded-2xl border-2 border-black shadow-solid-sm">
          <button
            onClick={() => setActiveTab("chat")}
            className={`px-3 sm:px-5 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "chat"
                ? "bg-[#e2ff3d] text-slate-950 border border-black shadow-solid-sm"
                : "text-slate-600 hover:text-black"
            }`}
          >
            <span>💬</span>
            <span className="sm:hidden">Chat</span>
            <span className="hidden sm:inline">Live Lounge & DMs</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse border border-black" />
          </button>
          <button
            onClick={() => setActiveTab("leaderboard")}
            className={`px-3 sm:px-5 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "leaderboard"
                ? "bg-[#22c55e] text-slate-950 border border-black shadow-solid-sm"
                : "text-slate-600 hover:text-black"
            }`}
          >
            <span>🏆</span>
            <span className="sm:hidden">Rankings</span>
            <span className="hidden sm:inline">Hall of Fame</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          SECTION 1: COMMUNITY LOUNGE & DIRECT MESSAGES
         ========================================================================= */}
      {activeTab === "chat" ? (
        <div className="flex-1 min-h-0 flex overflow-hidden relative">
          {/* Mobile Backdrop Overlay */}
          {mobileSidebarOpen && (
            <div
              onClick={() => setMobileSidebarOpen(false)}
              className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-xs transition-opacity"
            />
          )}

          {/* Sidebar */}
          <aside
            className={`fixed inset-y-0 left-0 z-50 w-72 sm:w-80 bg-white border-r-3 border-black flex flex-col transition-transform duration-300 md:static md:translate-x-0 ${
              mobileSidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
            }`}
          >
            {/* Sidebar Header */}
            <div className="p-3 sm:p-4 border-b-2 border-black flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl border-2 border-black bg-[#e2ff3d] flex items-center justify-center font-black shadow-solid-sm text-sm">
                  💬
                </span>
                <div>
                  <h2 className="font-editorial text-sm sm:text-base font-black text-slate-950 leading-tight">
                    Chat Channels
                  </h2>
                  <p className="text-[9px] sm:text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                    Community Discourse
                  </p>
                </div>
              </div>
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="md:hidden p-1.5 rounded-lg border-2 border-black hover:bg-slate-200 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* User Search Bar */}
            <div className="p-3 border-b-2 border-slate-200">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search user to direct message..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-xs font-bold pl-8 pr-3 py-2 rounded-xl border-2 border-black bg-white focus:outline-none focus:ring-2 focus:ring-[#22c55e] placeholder:text-slate-400"
                />
                <span className="absolute left-2.5 top-2.5 text-xs text-slate-400">🔍</span>
              </div>

              {/* Search Dropdown Results */}
              {searchQuery && (
                <div className="mt-2 bg-white rounded-xl border-2 border-black p-1 shadow-solid-sm max-h-48 overflow-y-auto">
                  {searchingUsers ? (
                    <p className="text-[11px] font-bold text-slate-400 p-2 text-center">Searching...</p>
                  ) : userSearchResults.length === 0 ? (
                    <p className="text-[11px] font-bold text-slate-400 p-2 text-center">No users found</p>
                  ) : (
                    userSearchResults.map((u) => (
                      <button
                        key={u._id}
                        onClick={() => selectUserForDM(u)}
                        className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-100 transition-colors text-left"
                      >
                        <img
                          src={u.image || "/default-avatar.png"}
                          alt={u.name}
                          className="w-7 h-7 rounded-full border border-black object-cover"
                        />
                        <div className="truncate">
                          <p className="text-xs font-black text-slate-950 truncate">{u.name}</p>
                          {u.username && (
                            <p className="text-[10px] text-slate-500 font-bold">@{u.username}</p>
                          )}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Sidebar Channels List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-4">
              <div>
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider px-2">
                  PUBLIC LOUNGE
                </span>
                <div className="mt-1">
                  <button
                    onClick={selectGlobalChannel}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl border-2 border-black transition-all cursor-pointer ${
                      activeChannel === "global"
                        ? "bg-[#22c55e] text-slate-950 shadow-solid-sm"
                        : "bg-white hover:bg-slate-100 text-slate-800"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-base">🌍</span>
                      <div className="text-left">
                        <p className="text-xs font-black">#monetra-lounge</p>
                        <p className="text-[10px] opacity-75 font-bold">Open to all donors & creators</p>
                      </div>
                    </div>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse border border-black" />
                  </button>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between px-2">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                    DIRECT MESSAGES
                  </span>
                </div>

                <div className="mt-1 space-y-1.5">
                  {status !== "authenticated" ? (
                    <div className="p-4 rounded-xl border-2 border-dashed border-slate-300 text-center">
                      <p className="text-xs font-bold text-slate-500">Sign in to start private 1-on-1 chats.</p>
                      <button
                        onClick={() => router.push("/login")}
                        className="mt-2 text-xs font-black text-emerald-600 hover:underline cursor-pointer"
                      >
                        Login here →
                      </button>
                    </div>
                  ) : conversations.length === 0 ? (
                    <p className="text-xs text-slate-400 font-medium px-2 py-3">
                      No direct messages yet. Search above or message someone from the Leaderboard tab!
                    </p>
                  ) : (
                    conversations.map((conv) => {
                      const partner = conv.otherUser;
                      if (!partner) return null;
                      const isSelected = activeChannel === partner._id;

                      return (
                        <button
                          key={conv.conversationId}
                          onClick={() => selectUserForDM(partner)}
                          className={`w-full flex items-center justify-between p-2.5 rounded-xl border-2 border-black transition-all cursor-pointer text-left ${
                            isSelected
                              ? "bg-[#e2ff3d] text-slate-950 shadow-solid-sm"
                              : "bg-white hover:bg-slate-100 text-slate-800"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <img
                              src={partner.image || "/default-avatar.png"}
                              alt={partner.name}
                              className="w-8 h-8 rounded-full border-2 border-black object-cover shrink-0"
                            />
                            <div className="truncate">
                              <p className="text-xs font-black text-slate-950 truncate">
                                {partner.name}
                              </p>
                              <p className="text-[10px] text-slate-500 font-medium truncate">
                                {conv.lastMessage?.text || "Started conversation"}
                              </p>
                            </div>
                          </div>

                          {conv.unreadCount > 0 && (
                            <span className="ml-2 w-5 h-5 rounded-full bg-red-500 text-white border border-black text-[10px] font-black flex items-center justify-center shrink-0">
                              {conv.unreadCount}
                            </span>
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar Footer */}
            {session?.user && (
              <div className="p-3 border-t-2 border-black bg-slate-50 flex items-center justify-between">
                <Link
                  href="/profile"
                  className="flex items-center gap-2 hover:opacity-80 transition-opacity truncate"
                >
                  <img
                    src={session.user.image || "/default-avatar.png"}
                    alt={session.user.name}
                    className="w-8 h-8 rounded-full border-2 border-black object-cover shrink-0"
                  />
                  <div className="truncate">
                    <p className="text-xs font-black text-slate-950 truncate">{session.user.name}</p>
                    <p className="text-[10px] text-emerald-700 font-bold">● Online</p>
                  </div>
                </Link>
                <button
                  onClick={() => setActiveTab("leaderboard")}
                  className="p-1.5 rounded-xl border-2 border-black bg-white hover:bg-slate-100 text-xs shadow-solid-sm cursor-pointer"
                  title="View Leaderboard"
                >
                  🏆
                </button>
              </div>
            )}
          </aside>

          {/* Right Main Chat Area */}
          <section className="flex-1 min-h-0 flex flex-col h-full bg-(--app-bg) overflow-hidden relative">
            {/* Chat Area Header */}
            <div className="shrink-0 px-3 py-2 sm:p-4 bg-white border-b-2 sm:border-b-3 border-black flex items-center justify-between z-10 gap-2">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <button
                  onClick={() => setMobileSidebarOpen(true)}
                  className="md:hidden px-2.5 py-1.5 rounded-xl border-2 border-black hover:bg-slate-100 font-black text-xs shrink-0 flex items-center gap-1 bg-white shadow-solid-sm cursor-pointer"
                >
                  <span>☰</span>
                  <span className="text-[10px]">Chats</span>
                </button>

                {activeChannel === "global" ? (
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <span className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl border-2 border-black bg-[#22c55e] flex items-center justify-center text-base sm:text-xl shadow-solid-sm shrink-0">
                      🌍
                    </span>
                    <div className="min-w-0">
                      <h2 className="font-editorial text-sm sm:text-lg font-black text-slate-950 flex items-center gap-1.5 truncate">
                        <span>#monetra-lounge</span>
                        <span className="text-[9px] bg-slate-100 border border-black px-1.5 py-0.2 rounded-full font-black text-slate-700 shrink-0">
                          Public
                        </span>
                      </h2>
                      <p className="text-[10px] text-slate-500 font-medium truncate hidden sm:block">
                        Open discussion on active causes, donor appreciation, and community stories.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <img
                      src={activePartner?.image || "/default-avatar.png"}
                      alt={activePartner?.name || "User"}
                      className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-black object-cover shadow-solid-sm shrink-0"
                    />
                    <div className="min-w-0">
                      <h2 className="font-editorial text-sm sm:text-lg font-black text-slate-950 flex items-center gap-1.5 truncate">
                        <span className="truncate">{activePartner?.name || "Direct Message"}</span>
                        {activePartner?.isVerified && (
                          <span className="text-[9px] bg-[#22c55e] border border-black px-1.5 py-0.2 rounded-full font-black text-slate-950 shrink-0">
                            ✓
                          </span>
                        )}
                      </h2>
                      {activePartner?._id && (
                        <Link
                          href={`/profile/${activePartner._id}`}
                          className="text-[10px] text-emerald-700 font-bold hover:underline truncate block"
                        >
                          View Profile →
                        </Link>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => slideToBottom("smooth")}
                  className="text-xs font-black bg-white hover:bg-slate-100 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl border border-black shadow-solid-sm transition-all cursor-pointer flex items-center gap-1"
                  title="Scroll to latest"
                >
                  <span className="text-xs font-black">↓</span>
                  <span className="hidden sm:inline">Latest</span>
                </button>
              </div>
            </div>

            {/* Message Stream */}
            <div
              ref={chatContainerRef}
              onScroll={handleScroll}
              className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-6 space-y-3 sm:space-y-4 scroll-smooth"
            >
              {loadingMessages ? (
                <div className="flex items-center justify-center h-full">
                  <div className="inline-flex items-center gap-3 bg-white border-2 border-black px-6 py-3 rounded-full shadow-solid">
                    <svg className="animate-spin w-5 h-5 text-slate-950" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    <span className="font-editorial text-xs font-bold text-slate-950">
                      Loading conversation...
                    </span>
                  </div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center max-w-sm mx-auto px-4">
                  <span className="text-3xl sm:text-4xl mb-2 sm:mb-3">💬</span>
                  <h3 className="font-editorial text-lg sm:text-xl font-black text-slate-950">
                    {activeChannel === "global" ? "Welcome to The Lounge!" : "No messages yet"}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-1">
                    {activeChannel === "global"
                      ? "Say hi or share an inspiring cause with fellow community donors and organizers!"
                      : "Start a conversation to collaborate on causes or ask questions."}
                  </p>
                </div>
              ) : (
                messages.map((msg) => {
                  const senderId = msg.sender?._id || msg.sender;
                  const currentUserId = session?.user?.id || session?.user?._id;
                  const isOwnMessage =
                    session?.user?.email &&
                    (senderId === currentUserId || msg.sender?.email === session?.user?.email);

                  return (
                    <div
                      key={msg._id}
                      className={`flex gap-2 sm:gap-3 max-w-[90%] sm:max-w-2xl ${
                        isOwnMessage ? "ml-auto flex-row-reverse" : "mr-auto"
                      }`}
                    >
                      <Link
                        href={`/profile/${senderId}`}
                        className="shrink-0 hover:scale-105 transition-transform"
                      >
                        <img
                          src={msg.sender?.image || "/default-avatar.png"}
                          alt={msg.sender?.name || "User"}
                          className="w-7 h-7 sm:w-9 sm:h-9 rounded-full border-2 border-black object-cover shadow-solid-sm"
                        />
                      </Link>

                      <div className={`space-y-1 min-w-0 ${isOwnMessage ? "items-end" : "items-start"}`}>
                        <div className={`flex items-center gap-1.5 sm:gap-2 flex-wrap ${isOwnMessage ? "justify-end" : "justify-start"}`}>
                          <Link
                            href={`/profile/${senderId}`}
                            className="text-[11px] sm:text-xs font-black text-slate-950 hover:underline truncate max-w-[130px] sm:max-w-none"
                          >
                            {msg.sender?.name || "Member"}
                          </Link>
                          {msg.sender?.role === "admin" && (
                            <span className="text-[8px] sm:text-[9px] font-black bg-amber-400 text-slate-950 border border-black px-1.5 py-0.2 rounded-full">
                              ADMIN
                            </span>
                          )}
                          <span className="text-[9px] sm:text-[10px] text-slate-400 font-medium">
                            {new Date(msg.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>

                        <div
                          className={`p-2.5 sm:p-3.5 rounded-2xl border-2 border-black shadow-solid-sm text-xs sm:text-sm font-medium leading-relaxed ${
                            isOwnMessage
                              ? "bg-[#e2ff3d] text-slate-950 rounded-tr-none"
                              : "bg-white text-slate-900 rounded-tl-none"
                          }`}
                        >
                          <p className="whitespace-pre-wrap break-words">{msg.text}</p>

                          {msg.campaignRef && (
                            <div className="mt-2.5 p-2 sm:p-3 bg-white text-slate-950 rounded-xl border-2 border-black shadow-solid-sm">
                              <div className="flex gap-2.5 items-center">
                                {msg.campaignRef.coverImage && (
                                  <img
                                    src={msg.campaignRef.coverImage}
                                    alt={msg.campaignRef.title}
                                    className="w-11 h-11 sm:w-14 sm:h-14 rounded-lg border border-black object-cover shrink-0"
                                  />
                                )}
                                <div className="flex-1 min-w-0">
                                  <span className="text-[8px] sm:text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full bg-slate-100 border border-black">
                                    {msg.campaignRef.category}
                                  </span>
                                  <h4 className="font-editorial text-[11px] sm:text-xs font-black truncate mt-0.5">
                                    {msg.campaignRef.title}
                                  </h4>
                                  <p className="text-[9px] sm:text-[10px] text-emerald-700 font-black mt-0.5">
                                    ₹{(msg.campaignRef.currentAmount || 0).toLocaleString()} raised
                                  </p>
                                </div>
                              </div>
                              <Link
                                href={`/fundraiser/${msg.campaignRef._id}`}
                                className="mt-2 block text-center rounded-lg bg-slate-950 text-white hover:bg-slate-800 text-[10px] sm:text-[11px] font-black py-1.5 border border-black transition-all"
                              >
                                View Cause →
                              </Link>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Floating Arrow to glide down to latest chat */}
            {isScrolledUp && (
              <button
                type="button"
                onClick={() => slideToBottom("smooth")}
                className="absolute bottom-20 sm:bottom-24 right-3 sm:right-6 z-30 inline-flex items-center gap-1.5 sm:gap-2 bg-[#e2ff3d] hover:bg-[#d4ff00] text-slate-950 border-2 border-black px-3 py-1.5 sm:px-4 sm:py-2 rounded-full font-black text-[11px] sm:text-xs shadow-solid hover:translate-y-0.5 transition-all cursor-pointer animate-bounce"
                title="Get down to keep up with chat"
              >
                <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-slate-950 text-[#e2ff3d] flex items-center justify-center text-[10px] sm:text-xs font-black">
                  ↓
                </span>
                <span>Latest chat</span>
              </button>
            )}

            {/* Chat Input Bar */}
            <div className="shrink-0 p-2 sm:p-4 bg-white border-t-2 sm:border-t-3 border-black sticky bottom-0 z-20 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
              {selectedCampaign && (
                <div className="mb-1.5 inline-flex items-center gap-1.5 bg-[#e2ff3d] border-2 border-black rounded-xl px-2.5 py-1 text-[11px] sm:text-xs font-black shadow-solid-sm max-w-full truncate">
                  <span className="truncate">📌 {selectedCampaign.title}</span>
                  <button
                    onClick={() => setSelectedCampaign(null)}
                    className="hover:text-red-600 font-black ml-1 cursor-pointer shrink-0"
                  >
                    ✕
                  </button>
                </div>
              )}

              {showAttachCampaign && (
                <div className="mb-2 p-2.5 sm:p-3 bg-slate-50 border-2 border-black rounded-2xl shadow-solid-sm max-h-48 overflow-y-auto">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[11px] sm:text-xs font-black text-slate-950 uppercase tracking-wider">
                      Attach a Campaign:
                    </span>
                    <button
                      onClick={() => setShowAttachCampaign(false)}
                      className="text-xs font-black text-slate-500 hover:text-black cursor-pointer"
                    >
                      ✕ Close
                    </button>
                  </div>

                  {userFundraisers.length === 0 ? (
                    <p className="text-xs text-slate-500 font-medium py-2">
                      You haven't created any fundraisers yet. Explore causes on Monetra!
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {userFundraisers.map((f) => (
                        <button
                          key={f._id}
                          onClick={() => {
                            setSelectedCampaign(f);
                            setShowAttachCampaign(false);
                          }}
                          className="flex items-center gap-2 p-2 rounded-xl border border-black bg-white hover:bg-[#e2ff3d] transition-colors text-left"
                        >
                          <img
                            src={f.coverImage || "/placeholder-cause.jpg"}
                            alt={f.title}
                            className="w-8 h-8 rounded-lg border border-black object-cover shrink-0"
                          />
                          <div className="truncate">
                            <p className="text-xs font-black truncate text-slate-950">{f.title}</p>
                            <p className="text-[10px] text-emerald-700 font-bold">
                              ₹{(f.currentAmount || 0).toLocaleString()}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {status !== "authenticated" ? (
                <div className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-slate-100 border-2 border-black text-xs font-bold text-slate-700 gap-2">
                  <span className="truncate">Sign in to participate in the Lounge.</span>
                  <button
                    onClick={() => router.push("/login")}
                    className="rounded-xl bg-[#22c55e] text-slate-950 font-black px-3.5 py-1.5 sm:px-4 sm:py-2 border-2 border-black shadow-solid-sm cursor-pointer hover:bg-[#16a34a] text-xs shrink-0"
                  >
                    Sign In
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSendMessage} className="flex items-center gap-1.5 sm:gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAttachCampaign(!showAttachCampaign)}
                    className={`p-2 sm:p-3 rounded-xl sm:rounded-2xl border-2 border-black transition-all cursor-pointer shadow-solid-sm hover:translate-y-0.5 text-xs sm:text-sm shrink-0 ${
                      showAttachCampaign ? "bg-[#e2ff3d]" : "bg-slate-100 hover:bg-slate-200"
                    }`}
                    title="Attach a campaign"
                  >
                    📌
                  </button>

                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={
                      activeChannel === "global"
                        ? "Message #monetra-lounge..."
                        : `Message ${activePartner?.name || "user"}...`
                    }
                    className="flex-1 min-w-0 bg-slate-50 border-2 border-black rounded-xl sm:rounded-2xl px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-bold text-slate-950 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#22c55e]"
                  />

                  <button
                    type="submit"
                    disabled={sending || (!inputText.trim() && !selectedCampaign)}
                    className="rounded-xl sm:rounded-2xl bg-[#22c55e] hover:bg-[#16a34a] disabled:opacity-50 text-slate-950 font-black px-3.5 sm:px-6 py-2 sm:py-3 border-2 border-black shadow-solid-sm sm:shadow-solid hover:translate-y-0.5 transition-all cursor-pointer flex items-center gap-1 shrink-0 text-xs sm:text-sm"
                  >
                    <span>Send</span>
                    <span className="hidden sm:inline">↵</span>
                  </button>
                </form>
              )}
            </div>
          </section>
        </div>
      ) : (
        /* =========================================================================
            SECTION 2: COMMUNITY LEADERBOARD & DIRECTORY
         ========================================================================= */
        <div className="flex-1 min-h-0 overflow-y-auto w-full">
          <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-10 w-full">
            <LeaderboardSection
              onSelectUserToMessage={(userId) => {
                setActiveChannel(userId);
                setActiveTab("chat");
                // Fetch user info for DM header
                fetch(`/api/users/${userId}`)
                  .then((r) => r.json())
                  .then((d) => {
                    if (d.success && d.user) setActivePartner(d.user);
                  })
                  .catch(() => {});
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default function CommunityPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-(--app-bg) flex items-center justify-center font-editorial font-bold">
          Loading Community Hub...
        </div>
      }
    >
      <CommunityHubInner />
    </Suspense>
  );
}
