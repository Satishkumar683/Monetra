"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getPusherClient } from "@/lib/pusher";

function ChatInner() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialUserId = searchParams.get("user");

  // State
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

  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of message list
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

  // If URL has ?user=..., set active partner and channel
  useEffect(() => {
    if (initialUserId && initialUserId !== "global") {
      async function fetchPartnerInfo() {
        try {
          const res = await fetch(`/api/users/${initialUserId}`);
          const data = await res.json();
          if (data.success && data.user) {
            setActivePartner(data.user);
            setActiveChannel(data.user._id);
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

  // Compute canonical conversationId for messages API
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
    loadMessages();
  }, [activeChannel, session]);

  // Real-time updates with Pusher + Polling fallback
  useEffect(() => {
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
      // Pusher not configured; fallback to polling every 3 seconds
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
  }, [activeChannel, session]);

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
  };

  const selectGlobalChannel = () => {
    setActiveChannel("global");
    setActivePartner(null);
    setMobileSidebarOpen(false);
  };

  return (
    <div className="h-[calc(100vh-73px)] bg-(--app-bg) text-(--app-text) flex overflow-hidden">
      {/* =========================================================================
          LEFT SIDEBAR: CHANNELS & DMS
         ========================================================================= */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-80 bg-white border-r-3 border-black flex flex-col transition-transform duration-300 md:static md:translate-x-0 ${
          mobileSidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b-2 border-black flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl border-2 border-black bg-[#e2ff3d] flex items-center justify-center font-black shadow-solid-sm text-sm">
              💬
            </span>
            <div>
              <h2 className="font-editorial text-lg font-black text-slate-950 leading-tight">
                Community Hub
              </h2>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                Live Discourse & DMs
              </p>
            </div>
          </div>
          <button
            onClick={() => setMobileSidebarOpen(false)}
            className="md:hidden p-1.5 rounded-lg border-2 border-black hover:bg-slate-200"
          >
            ✕
          </button>
        </div>

        {/* User Search Bar */}
        <div className="p-3 border-b-2 border-slate-200">
          <div className="relative">
            <input
              type="text"
              placeholder="Search donor or creator to DM..."
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

        {/* Sidebar Channel List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          {/* Public Channels */}
          <div>
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider px-2">
              PUBLIC CHANNELS
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
                    <p className="text-[10px] opacity-75 font-bold">Open to all community members</p>
                  </div>
                </div>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse border border-black" />
              </button>
            </div>
          </div>

          {/* Direct Messages */}
          <div>
            <div className="flex items-center justify-between px-2">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                DIRECT MESSAGES
              </span>
            </div>

            <div className="mt-1 space-y-1.5">
              {status !== "authenticated" ? (
                <div className="p-4 rounded-xl border-2 border-dashed border-slate-300 text-center">
                  <p className="text-xs font-bold text-slate-500">Sign in to start private 1-on-1 chats with donors and creators.</p>
                  <button
                    onClick={() => router.push("/login")}
                    className="mt-2 text-xs font-black text-emerald-600 hover:underline"
                  >
                    Login here →
                  </button>
                </div>
              ) : conversations.length === 0 ? (
                <p className="text-xs text-slate-400 font-medium px-2 py-3">
                  No direct conversations yet. Search for someone above or visit a cause to message the creator!
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

        {/* Sidebar Footer: Current User Badge */}
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
            <Link
              href="/leaderboard"
              className="p-1.5 rounded-xl border-2 border-black bg-white hover:bg-slate-100 text-xs shadow-solid-sm"
              title="Community Leaderboard"
            >
              🏆
            </Link>
          </div>
        )}
      </aside>

      {/* =========================================================================
          RIGHT MAIN CHAT PANE
         ========================================================================= */}
      <section className="flex-1 flex flex-col h-full bg-(--app-bg) overflow-hidden">
        {/* Chat Header */}
        <div className="p-4 bg-white border-b-3 border-black flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="md:hidden p-2 rounded-xl border-2 border-black hover:bg-slate-100 font-black text-xs"
            >
              ☰ Channels
            </button>

            {activeChannel === "global" ? (
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-2xl border-2 border-black bg-[#22c55e] flex items-center justify-center text-xl shadow-solid-sm">
                  🌍
                </span>
                <div>
                  <h1 className="font-editorial text-lg sm:text-xl font-black text-slate-950 flex items-center gap-2">
                    # The Monetra Lounge
                    <span className="text-[10px] bg-slate-100 border border-black px-2 py-0.5 rounded-full font-black text-slate-700">
                      Public
                    </span>
                  </h1>
                  <p className="text-xs text-slate-500 font-medium">
                    Connect, discuss fundraising causes, celebrate impact, and share verified stories.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <img
                  src={activePartner?.image || "/default-avatar.png"}
                  alt={activePartner?.name || "User"}
                  className="w-10 h-10 rounded-full border-2 border-black object-cover shadow-solid-sm"
                />
                <div>
                  <h1 className="font-editorial text-lg sm:text-xl font-black text-slate-950 flex items-center gap-2">
                    {activePartner?.name || "Direct Message"}
                    {activePartner?.isVerified && (
                      <span className="text-[10px] bg-[#22c55e] border border-black px-2 py-0.5 rounded-full font-black text-slate-950">
                        ✓ Verified
                      </span>
                    )}
                  </h1>
                  {activePartner?._id && (
                    <Link
                      href={`/profile/${activePartner._id}`}
                      className="text-xs text-emerald-700 font-bold hover:underline"
                    >
                      View Full Profile & Impact →
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/donate"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-black bg-[#e2ff3d] hover:bg-[#d4ff00] px-3.5 py-2 rounded-xl border-2 border-black shadow-solid-sm transition-all"
            >
              <span>Explore Causes ✦</span>
            </Link>
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {loadingMessages ? (
            <div className="flex items-center justify-center h-full">
              <div className="inline-flex items-center gap-3 bg-white border-2 border-black px-6 py-3 rounded-full shadow-solid">
                <svg className="animate-spin w-5 h-5 text-slate-950" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                <span className="font-editorial text-xs font-bold text-slate-950">
                  Retrieving messages...
                </span>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center max-w-sm mx-auto">
              <span className="text-4xl mb-3">💬</span>
              <h3 className="font-editorial text-xl font-black text-slate-950">
                {activeChannel === "global" ? "Welcome to The Lounge!" : "No messages yet"}
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-1">
                {activeChannel === "global"
                  ? "Be the first to share an inspiring update, ask about urgent medical causes, or connect with fellow community patrons!"
                  : "Say hello and start collaborating with this donor or campaign creator."}
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
                  className={`flex gap-3 max-w-2xl ${
                    isOwnMessage ? "ml-auto flex-row-reverse" : "mr-auto"
                  }`}
                >
                  {/* Sender Avatar */}
                  <Link
                    href={`/profile/${senderId}`}
                    className="shrink-0 hover:scale-105 transition-transform"
                    title={`View ${msg.sender?.name}'s profile`}
                  >
                    <img
                      src={msg.sender?.image || "/default-avatar.png"}
                      alt={msg.sender?.name || "User"}
                      className="w-9 h-9 rounded-full border-2 border-black object-cover shadow-solid-sm"
                    />
                  </Link>

                  {/* Message Bubble */}
                  <div className={`space-y-1 ${isOwnMessage ? "items-end" : "items-start"}`}>
                    <div className={`flex items-center gap-2 ${isOwnMessage ? "justify-end" : "justify-start"}`}>
                      <Link
                        href={`/profile/${senderId}`}
                        className="text-xs font-black text-slate-950 hover:underline"
                      >
                        {msg.sender?.name || "Community Member"}
                      </Link>
                      {msg.sender?.role === "admin" && (
                        <span className="text-[9px] font-black bg-amber-400 text-slate-950 border border-black px-1.5 py-0.2 rounded-full">
                          ADMIN
                        </span>
                      )}
                      <span className="text-[10px] text-slate-400 font-medium">
                        {new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    <div
                      className={`p-3.5 rounded-2xl border-2 border-black shadow-solid-sm text-sm font-medium leading-relaxed ${
                        isOwnMessage
                          ? "bg-[#e2ff3d] text-slate-950 rounded-tr-none"
                          : "bg-white text-slate-900 rounded-tl-none"
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words">{msg.text}</p>

                      {/* Attached Campaign Preview Card */}
                      {msg.campaignRef && (
                        <div className="mt-3 p-3 bg-white text-slate-950 rounded-xl border-2 border-black shadow-solid-sm">
                          <div className="flex gap-3 items-center">
                            {msg.campaignRef.coverImage && (
                              <img
                                src={msg.campaignRef.coverImage}
                                alt={msg.campaignRef.title}
                                className="w-14 h-14 rounded-lg border border-black object-cover shrink-0"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-slate-100 border border-black">
                                {msg.campaignRef.category}
                              </span>
                              <h4 className="font-editorial text-xs font-black truncate mt-1">
                                {msg.campaignRef.title}
                              </h4>
                              <p className="text-[10px] text-emerald-700 font-black mt-0.5">
                                ₹{(msg.campaignRef.currentAmount || 0).toLocaleString()} raised of ₹{(msg.campaignRef.targetAmount || 0).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <Link
                            href={`/fundraiser/${msg.campaignRef._id}`}
                            className="mt-2 block text-center rounded-lg bg-slate-950 text-white hover:bg-slate-800 text-[11px] font-black py-1.5 border border-black transition-all"
                          >
                            Support this cause →
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

        {/* Input Bar */}
        <div className="p-3 sm:p-4 bg-white border-t-3 border-black">
          {/* Selected Attached Campaign Chip */}
          {selectedCampaign && (
            <div className="mb-2 inline-flex items-center gap-2 bg-[#e2ff3d] border-2 border-black rounded-xl px-3 py-1.5 text-xs font-black shadow-solid-sm">
              <span>📌 Attached Cause: {selectedCampaign.title}</span>
              <button
                onClick={() => setSelectedCampaign(null)}
                className="hover:text-red-600 font-black ml-1 cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

          {/* Campaign Selector Modal/Dropdown */}
          {showAttachCampaign && (
            <div className="mb-3 p-3 bg-slate-50 border-2 border-black rounded-2xl shadow-solid-sm max-h-48 overflow-y-auto">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-black text-slate-950 uppercase tracking-wider">
                  Select a Campaign to Share:
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
                  You have not created any campaigns yet. Visit causes to explore!
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
                        className="w-8 h-8 rounded-lg border border-black object-cover"
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
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-100 border-2 border-black text-xs font-bold text-slate-700">
              <span>Sign in with Google or Email to participate in live conversations.</span>
              <button
                onClick={() => router.push("/login")}
                className="rounded-xl bg-[#22c55e] text-slate-950 font-black px-4 py-2 border-2 border-black shadow-solid-sm cursor-pointer hover:bg-[#16a34a]"
              >
                Sign In
              </button>
            </div>
          ) : (
            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowAttachCampaign(!showAttachCampaign)}
                className={`p-3 rounded-2xl border-2 border-black transition-all cursor-pointer shadow-solid-sm hover:translate-y-0.5 ${
                  showAttachCampaign ? "bg-[#e2ff3d]" : "bg-slate-100 hover:bg-slate-200"
                }`}
                title="Attach a campaign to share"
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
                className="flex-1 bg-slate-50 border-2 border-black rounded-2xl px-4 py-3 text-sm font-bold text-slate-950 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#22c55e]"
              />

              <button
                type="submit"
                disabled={sending || (!inputText.trim() && !selectedCampaign)}
                className="rounded-2xl bg-[#22c55e] hover:bg-[#16a34a] disabled:opacity-50 text-slate-950 font-black px-6 py-3 border-2 border-black shadow-solid hover:translate-y-0.5 transition-all cursor-pointer flex items-center gap-1.5 shrink-0 text-sm"
              >
                <span>Send</span>
                <span>↵</span>
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-(--app-bg) flex items-center justify-center font-editorial font-bold">
          Loading Community Hub...
        </div>
      }
    >
      <ChatInner />
    </Suspense>
  );
}
