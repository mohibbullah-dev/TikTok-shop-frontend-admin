// // frontend-admin/src/pages/chat/AdminChat.jsx
// //
// // Built against YOUR EXISTING backend exactly:
// //
// // ChatRoom fields used:
// //   roomId (format: "room_${merchantUserId}")
// //   merchant  → populated: { storeName, merchantId }
// //   merchantUser → populated: { username, avatar }
// //   assignedAgent → populated: { username, avatar }
// //   lastMessage, lastMessageTime
// //   unreadCount   ← badge on inbox items
// //   status        ← 'waiting' | 'active' | 'closed'
// //   isMerchantOnline ← green dot
// //   isBlacklisted ← blocked indicator
// //
// // ChatMessage fields used:
// //   senderRole ('merchant' | 'superAdmin' | 'merchantAdmin')
// //   senderName, senderAvatar
// //   message, messageType ('text' | 'image'), imageUrl
// //   isRead, createdAt
// //
// // REST endpoints (your existing chat.route.js):
// //   GET  /api/chat/rooms                    → inbox (superAdmin + merchantAdmin)
// //   GET  /api/chat/rooms/unclaimed          → waiting rooms tab
// //   GET  /api/chat/rooms/blacklist          → blacklist tab
// //   GET  /api/chat/messages/:roomId         → history
// //   PUT  /api/chat/rooms/:roomId/assign     → claim chat
// //   PUT  /api/chat/rooms/:roomId/close      → close room
// //   PUT  /api/chat/rooms/:roomId/read       → mark read
// //   PUT  /api/chat/rooms/:roomId/blacklist  → toggle blacklist
// //   PUT  /api/chat/rooms/auto-assign        → auto-claim all waiting
// //
// // Socket events (your existing server.js inline):
// //   EMIT:   agent_online  { userId, role }    ← admin connects
// //           join_room     { roomId }
// //           send_message  { roomId, message, messageType, imageUrl, senderName, senderAvatar }
// //           typing        { roomId, isTyping }
// //           mark_read     { roomId }
// //   LISTEN: new_message         full message object
// //           typing_indicator    { userId, isTyping }
// //           messages_read       { roomId }
// //           user_online         { userId, role }   ← merchant came online
// //           user_offline        { userId }          ← merchant went offline
// //           agent_assigned      { roomId, agentName } ← auto-assign result
// //           auto_assigned       { count }
// //
// // ROLE GATES:
// //   superAdmin   → all rooms, can blacklist
// //   merchantAdmin → only their referred merchants, cannot blacklist
// //   dispatchAdmin → blocked by ProtectedRoute in App.jsx

// import { useState, useEffect, useRef, useCallback } from 'react'
// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
// import { useSelector } from 'react-redux'
// import { toast } from 'react-toastify'
// import { io } from 'socket.io-client'
// import API from '../../api/axios'

// // ─── Avatar ───────────────────────────────────────────────────
// const Avatar = ({ name, size = 9, color = '#f02d65' }) => (
//   <div
//     className={`w-${size} h-${size} rounded-full flex-shrink-0
//       flex items-center justify-center text-white font-bold text-sm`}
//     style={{ background: `linear-gradient(135deg,${color},#ff6035)` }}
//   >
//     {name?.[0]?.toUpperCase() || '?'}
//   </div>
// )

// // ─── Status badge ──────────────────────────────────────────────
// const StatusBadge = ({ status }) => {
//   const map = {
//     waiting: { bg: '#fef3c7', color: '#92400e', label: '⏳ Waiting' },
//     active:  { bg: '#dcfce7', color: '#166534', label: '● Active'  },
//     closed:  { bg: '#f3f4f6', color: '#6b7280', label: '✕ Closed' },
//   }
//   const s = map[status] || map.waiting
//   return (
//     <span className="px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap"
//       style={{ background: s.bg, color: s.color }}>
//       {s.label}
//     </span>
//   )
// }

// export default function AdminChat() {
//   const queryClient = useQueryClient()
//   const { user }    = useSelector(s => s.auth)
//   const isSuperAdmin = user?.role === 'superAdmin'

//   // ── State ──────────────────────────────────────────────────
//   const [activeRoom,     setActiveRoom]     = useState(null)
//   const [messages,       setMessages]       = useState([])
//   const [newMessage,     setNewMessage]     = useState('')
//   const [merchantTyping, setMerchantTyping] = useState(false)
//   const [uploading,      setUploading]      = useState(false)
//   const [inboxTab,       setInboxTab]       = useState('all')
//   // 'all' | 'waiting' | 'active' | 'closed' | 'blacklist'

//   const messagesEndRef = useRef(null)
//   const typingTimeout  = useRef(null)
//   const fileRef        = useRef(null)
//   const inputRef       = useRef(null)
//   const socketRef      = useRef(null)
//   const activeRoomRef  = useRef(null)

//   // Keep ref synced for use inside socket callbacks
//   useEffect(() => { activeRoomRef.current = activeRoom }, [activeRoom])

//   // ── FETCH: rooms based on tab ──────────────────────────────
//   const roomsQuery = useQuery({
//     queryKey: ['adminChatRooms', inboxTab],
//     queryFn: async () => {
//       if (inboxTab === 'blacklist') {
//         const { data } = await API.get('/chat/rooms/blacklist')
//         return data
//       }
//       if (inboxTab === 'waiting') {
//         const { data } = await API.get('/chat/rooms/unclaimed')
//         return data
//       }
//       // 'all', 'active', 'closed'
//       const params = new URLSearchParams({ limit: 50 })
//       if (inboxTab !== 'all') params.set('status', inboxTab)
//       const { data } = await API.get(`/chat/rooms?${params}`)
//       return data
//     },
//     refetchInterval: 30000,
//   })

//   // ── FETCH: message history ─────────────────────────────────
//   const historyQuery = useQuery({
//     queryKey: ['adminChatMessages', activeRoom?.roomId],
//     queryFn: async () => {
//       const { data } = await API.get(`/chat/messages/${activeRoom.roomId}`)
//       return data
//     },
//     enabled: !!activeRoom?.roomId,
//   })

//   useEffect(() => {
//     if (historyQuery.data?.messages) setMessages(historyQuery.data.messages)
//   }, [historyQuery.data])

//   // ── MUTATIONS ───────────────────────────────────────────────
//   // PUT /api/chat/rooms/:roomId/assign
//   const assignMutation = useMutation({
//     mutationFn: (roomId) => API.put(`/chat/rooms/${roomId}/assign`),
//     onSuccess: () => {
//       queryClient.invalidateQueries(['adminChatRooms'])
//       setActiveRoom(r => r ? { ...r, status: 'active', assignedAgent: { username: user.username } } : r)
//       toast.success('You claimed this chat')
//     },
//     onError: () => toast.error('Failed to claim chat'),
//   })

//   // PUT /api/chat/rooms/:roomId/close
//   const closeMutation = useMutation({
//     mutationFn: (roomId) => API.put(`/chat/rooms/${roomId}/close`),
//     onSuccess: () => {
//       toast.success('Chat closed')
//       queryClient.invalidateQueries(['adminChatRooms'])
//       setActiveRoom(r => r ? { ...r, status: 'closed' } : r)
//     },
//     onError: () => toast.error('Failed to close'),
//   })

//   // PUT /api/chat/rooms/:roomId/blacklist  (superAdmin only)
//   const blacklistMutation = useMutation({
//     mutationFn: (roomId) => API.put(`/chat/rooms/${roomId}/blacklist`),
//     onSuccess: (res) => {
//       toast.success(res.data.message)
//       queryClient.invalidateQueries(['adminChatRooms'])
//       setActiveRoom(r => r ? { ...r, isBlacklisted: res.data.isBlacklisted, status: 'closed' } : r)
//     },
//     onError: () => toast.error('Failed to update blacklist'),
//   })

//   // PUT /api/chat/rooms/:roomId/read
//   const markReadMutation = useMutation({
//     mutationFn: (roomId) => API.put(`/chat/rooms/${roomId}/read`),
//     onSuccess: () => queryClient.invalidateQueries(['adminChatRooms']),
//   })

//   // PUT /api/chat/rooms/auto-assign
//   const autoAssignMutation = useMutation({
//     mutationFn: () => API.put('/chat/rooms/auto-assign'),
//     onSuccess: (res) => {
//       toast.success(res.data.message)
//       queryClient.invalidateQueries(['adminChatRooms'])
//     },
//     onError: () => toast.error('Auto-assign failed'),
//   })

//   // ── Socket.io ──────────────────────────────────────────────
//   useEffect(() => {
//     const socket = io(
//       import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000',
//       { transports: ['websocket'] }
//     )
//     socketRef.current = socket

//     socket.on('connect', () => {
//       // Admin uses 'agent_online' event (not 'user_online')
//       socket.emit('agent_online', { userId: user._id, role: user.role })
//     })

//     // New message in any room
//     socket.on('new_message', (msg) => {
//       if (msg.roomId === activeRoomRef.current?.roomId) {
//         setMessages(prev => {
//           if (prev.find(m => m._id === msg._id)) return prev
//           return [...prev, msg]
//         })
//         markReadMutation.mutate(msg.roomId)
//       }
//       queryClient.invalidateQueries(['adminChatRooms'])
//     })

//     // Merchant is typing
//     socket.on('typing_indicator', ({ isTyping }) => setMerchantTyping(isTyping))

//     // Merchant read our messages
//     socket.on('messages_read', ({ roomId }) => {
//       if (roomId === activeRoomRef.current?.roomId) {
//         setMessages(prev => prev.map(m =>
//           m.senderRole !== 'merchant' ? { ...m, isRead: true } : m
//         ))
//       }
//     })

//     // Merchant came online
//     socket.on('user_online', ({ userId }) => {
//       setActiveRoom(r => {
//         if (r?.merchantUser?._id === userId) return { ...r, isMerchantOnline: true }
//         return r
//       })
//       queryClient.invalidateQueries(['adminChatRooms'])
//     })

//     // Merchant went offline
//     socket.on('user_offline', ({ userId }) => {
//       setActiveRoom(r => {
//         if (r?.merchantUser?._id === userId) return { ...r, isMerchantOnline: false }
//         return r
//       })
//     })

//     // Auto assign result
//     socket.on('auto_assigned', ({ count }) => {
//       if (count > 0) toast.info(`${count} chat(s) auto-assigned to you`)
//       queryClient.invalidateQueries(['adminChatRooms'])
//     })

//     return () => { socket.disconnect(); socketRef.current = null }
//   }, [user._id, user.role])

//   // ── Open room ──────────────────────────────────────────────
//   const openRoom = useCallback((room) => {
//     if (activeRoomRef.current?.roomId && socketRef.current) {
//       socketRef.current.emit('leave_room', { roomId: activeRoomRef.current.roomId })
//     }
//     setActiveRoom(room)
//     setMessages([])
//     setMerchantTyping(false)
//     if (socketRef.current) {
//       socketRef.current.emit('join_room', { roomId: room.roomId })
//     }
//     markReadMutation.mutate(room.roomId)
//   }, [])

//   // ── Auto scroll ────────────────────────────────────────────
//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
//   }, [messages, merchantTyping])

//   // ── Send message ───────────────────────────────────────────
//   const sendMessage = () => {
//     if (!newMessage.trim() || !socketRef.current || !activeRoom) return
//     socketRef.current.emit('send_message', {
//       roomId:       activeRoom.roomId,
//       message:      newMessage.trim(),
//       messageType:  'text',
//       imageUrl:     '',
//       senderName:   user.username,
//       senderAvatar: user.avatar || '',
//     })
//     setNewMessage('')
//     clearTimeout(typingTimeout.current)
//     socketRef.current.emit('typing', { roomId: activeRoom.roomId, isTyping: false })
//     inputRef.current?.focus()
//   }

//   const handleInput = (e) => {
//     setNewMessage(e.target.value)
//     if (!socketRef.current || !activeRoom) return
//     socketRef.current.emit('typing', { roomId: activeRoom.roomId, isTyping: true })
//     clearTimeout(typingTimeout.current)
//     typingTimeout.current = setTimeout(() => {
//       socketRef.current?.emit('typing', { roomId: activeRoom.roomId, isTyping: false })
//     }, 2000)
//   }

//   const handleKey = (e) => {
//     if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
//   }

//   // ── Send image ─────────────────────────────────────────────
//   const handleImage = async (e) => {
//     const file = e.target.files[0]
//     if (!file || !socketRef.current || !activeRoom) return
//     setUploading(true)
//     try {
//       const fd = new FormData()
//       fd.append('file', file)
//       const { data } = await API.post('/upload/single?folder=chat', fd, {
//         headers: { 'Content-Type': 'multipart/form-data' },
//       })
//       socketRef.current.emit('send_message', {
//         roomId: activeRoom.roomId, message: '',
//         messageType: 'image', imageUrl: data.url,
//         senderName: user.username, senderAvatar: user.avatar || '',
//       })
//     } catch { toast.error('Image upload failed') }
//     finally { setUploading(false); e.target.value = '' }
//   }

//   const rooms = roomsQuery.data?.rooms || []

//   // ─────────────────────────────────────────────────────────────
//   // RENDER
//   // ─────────────────────────────────────────────────────────────
//   return (
//     <div className="flex h-[calc(100vh-72px)] rounded-2xl overflow-hidden"
//       style={{ boxShadow: '0 1px 12px rgba(0,0,0,0.07)' }}>

//       {/* ══════════ LEFT — Inbox ══════════ */}
//       <div className="w-72 flex-shrink-0 bg-white flex flex-col border-r border-gray-100">

//         {/* Header */}
//         <div className="px-4 pt-4 pb-3 border-b border-gray-100">
//           <div className="flex items-center justify-between mb-3">
//             <div>
//               <h2 className="font-extrabold text-gray-800 text-sm">Customer Service</h2>
//               <p className="text-gray-400 text-xs mt-0.5">
//                 {rooms.length} conversation{rooms.length !== 1 ? 's' : ''}
//               </p>
//             </div>
//             {/* Auto-assign button */}
//             <button
//               onClick={() => autoAssignMutation.mutate()}
//               disabled={autoAssignMutation.isPending}
//               title="Auto-claim all waiting chats"
//               className="w-8 h-8 rounded-xl flex items-center justify-center
//                 text-sm transition-all hover:scale-110 disabled:opacity-50"
//               style={{ background: '#fdf2f8' }}
//             >
//               ⚡
//             </button>
//           </div>

//           {/* Tab filters — matches your demo's 4-tab layout */}
//           <div className="flex gap-1 flex-wrap">
//             {[
//               { key: 'all',       label: 'All'      },
//               { key: 'waiting',   label: '⏳ New'    },
//               { key: 'active',    label: '● Live'   },
//               { key: 'closed',    label: '✕ Done'  },
//               // Only superAdmin sees blacklist tab
//               ...(isSuperAdmin
//                 ? [{ key: 'blacklist', label: '🚫 Blocked' }]
//                 : []
//               ),
//             ].map(f => (
//               <button key={f.key}
//                 onClick={() => setInboxTab(f.key)}
//                 className="px-2.5 py-1.5 rounded-lg text-[10px] font-semibold
//                   transition-all flex-shrink-0"
//                 style={inboxTab === f.key
//                   ? { background: '#f02d65', color: 'white' }
//                   : { background: '#f3f4f6', color: '#6b7280' }
//                 }
//               >
//                 {f.label}
//               </button>
//             ))}
//           </div>
//         </div>

//         {/* Room list */}
//         <div className="flex-1 overflow-y-auto">
//           {roomsQuery.isLoading && (
//             <div className="flex items-center justify-center py-12">
//               <svg className="animate-spin w-6 h-6" style={{ color: '#f02d65' }}
//                 fill="none" viewBox="0 0 24 24">
//                 <circle className="opacity-25" cx="12" cy="12" r="10"
//                   stroke="currentColor" strokeWidth="4"/>
//                 <path className="opacity-75" fill="currentColor"
//                   d="M4 12a8 8 0 018-8v8H4z"/>
//               </svg>
//             </div>
//           )}

//           {!roomsQuery.isLoading && rooms.length === 0 && (
//             <div className="text-center py-16 px-4">
//               <p className="text-4xl mb-2">💬</p>
//               <p className="text-gray-400 text-sm font-medium">No conversations</p>
//               <p className="text-gray-300 text-xs mt-1">
//                 Merchants appear here when they open chat
//               </p>
//             </div>
//           )}

//           {rooms.map(room => {
//             const isSelected = activeRoom?.roomId === room.roomId
//             return (
//               <button key={room._id}
//                 onClick={() => openRoom(room)}
//                 className="w-full px-4 py-3 flex items-start gap-3 text-left
//                   transition-all hover:bg-gray-50 border-b border-gray-50"
//                 style={isSelected ? { background: '#fdf2f8' } : {}}
//               >
//                 {/* Avatar + online dot */}
//                 <div className="relative flex-shrink-0">
//                   <Avatar
//                     name={room.merchant?.storeName}
//                     size={10}
//                     color={isSelected ? '#f02d65' : '#9ca3af'}
//                   />
//                   {room.isMerchantOnline && (
//                     <div className="absolute bottom-0 right-0 w-2.5 h-2.5
//                       rounded-full bg-green-400 ring-2 ring-white"/>
//                   )}
//                   {room.isBlacklisted && (
//                     <div className="absolute -top-1 -right-1 text-[10px]">🚫</div>
//                   )}
//                 </div>

//                 <div className="flex-1 min-w-0">
//                   <div className="flex items-center justify-between gap-1 mb-0.5">
//                     <p className="text-gray-800 text-xs font-bold truncate">
//                       {room.merchant?.storeName || 'Unknown Store'}
//                     </p>
//                     <StatusBadge status={room.status}/>
//                   </div>
//                   <p className="text-gray-400 text-[10px] truncate mb-1">
//                     {room.lastMessage || 'No messages yet'}
//                   </p>
//                   <div className="flex items-center justify-between">
//                     <p className="text-gray-300 text-[9px]">
//                       {room.lastMessageTime
//                         ? new Date(room.lastMessageTime).toLocaleTimeString([], {
//                             hour: '2-digit', minute: '2-digit'
//                           })
//                         : '—'
//                       }
//                     </p>
//                     {/* unreadCount from ChatRoom model */}
//                     {room.unreadCount > 0 && (
//                       <span className="min-w-[18px] h-[18px] rounded-full text-[9px]
//                         font-bold flex items-center justify-center px-1"
//                         style={{ background: '#f02d65', color: 'white' }}>
//                         {room.unreadCount > 9 ? '9+' : room.unreadCount}
//                       </span>
//                     )}
//                   </div>
//                 </div>
//               </button>
//             )
//           })}
//         </div>
//       </div>

//       {/* ══════════ RIGHT — Conversation ══════════ */}
//       <div className="flex-1 flex flex-col bg-gray-50 min-w-0">

//         {!activeRoom && (
//           <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center p-8">
//             <div className="w-20 h-20 rounded-full flex items-center justify-center text-4xl"
//               style={{ background: '#fdf2f8' }}>
//               💬
//             </div>
//             <div>
//               <p className="text-gray-600 font-bold text-base">Select a conversation</p>
//               <p className="text-gray-400 text-sm mt-1">
//                 Click any merchant from the left to reply
//               </p>
//             </div>
//           </div>
//         )}

//         {activeRoom && (
//           <>
//             {/* Chat top bar */}
//             <div className="bg-white px-5 py-3 border-b border-gray-100
//               flex items-center justify-between flex-shrink-0"
//               style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>

//               <div className="flex items-center gap-3">
//                 <div className="relative">
//                   <Avatar name={activeRoom.merchant?.storeName} size={10}/>
//                   {activeRoom.isMerchantOnline && (
//                     <div className="absolute bottom-0 right-0 w-2.5 h-2.5
//                       rounded-full bg-green-400 ring-2 ring-white"/>
//                   )}
//                 </div>
//                 <div>
//                   <div className="flex items-center gap-2">
//                     <p className="text-gray-800 font-bold text-sm">
//                       {activeRoom.merchant?.storeName || 'Unknown Store'}
//                     </p>
//                     <StatusBadge status={activeRoom.status}/>
//                     {activeRoom.isBlacklisted && (
//                       <span className="px-2 py-0.5 rounded-full text-[10px] font-bold"
//                         style={{ background: '#fee2e2', color: '#991b1b' }}>
//                         🚫 Blocked
//                       </span>
//                     )}
//                   </div>
//                   <p className="text-gray-400 text-xs">
//                     ID: {activeRoom.merchant?.merchantId}
//                     {' · '}
//                     {activeRoom.isMerchantOnline ? '🟢 Online' : '⚫ Offline'}
//                     {activeRoom.assignedAgent && (
//                       <span> · Agent: {activeRoom.assignedAgent.username}</span>
//                     )}
//                   </p>
//                 </div>
//               </div>

//               {/* Action buttons */}
//               <div className="flex items-center gap-2 flex-shrink-0">
//                 {/* Claim chat (if waiting) */}
//                 {activeRoom.status === 'waiting' && (
//                   <button
//                     onClick={() => assignMutation.mutate(activeRoom.roomId)}
//                     disabled={assignMutation.isPending}
//                     className="px-3 py-1.5 rounded-xl text-xs font-semibold text-white
//                       transition-all hover:scale-105 disabled:opacity-50"
//                     style={{ background: 'linear-gradient(135deg,#22c55e,#16a34a)' }}
//                   >
//                     ✋ Claim Chat
//                   </button>
//                 )}
//                 {/* Close */}
//                 {activeRoom.status !== 'closed' && (
//                   <button
//                     onClick={() => {
//                       if (window.confirm('Close this chat?'))
//                         closeMutation.mutate(activeRoom.roomId)
//                     }}
//                     disabled={closeMutation.isPending}
//                     className="px-3 py-1.5 rounded-xl text-xs font-semibold
//                       transition-all hover:scale-105 disabled:opacity-50"
//                     style={{ background: '#f3f4f6', color: '#6b7280' }}
//                   >
//                     ✕ Close
//                   </button>
//                 )}
//                 {/* Blacklist — superAdmin only */}
//                 {isSuperAdmin && (
//                   <button
//                     onClick={() => {
//                       const msg = activeRoom.isBlacklisted
//                         ? 'Remove this merchant from blacklist?'
//                         : 'Block this merchant from chat?'
//                       if (window.confirm(msg))
//                         blacklistMutation.mutate(activeRoom.roomId)
//                     }}
//                     disabled={blacklistMutation.isPending}
//                     className="px-3 py-1.5 rounded-xl text-xs font-semibold
//                       transition-all hover:scale-105 disabled:opacity-50"
//                     style={activeRoom.isBlacklisted
//                       ? { background: '#dcfce7', color: '#166534' }
//                       : { background: '#fee2e2', color: '#991b1b' }
//                     }
//                   >
//                     {activeRoom.isBlacklisted ? '✓ Unblock' : '🚫 Block'}
//                   </button>
//                 )}
//               </div>
//             </div>

//             {/* Messages */}
//             <div className="flex-1 overflow-y-auto p-5 space-y-3">
//               {historyQuery.isLoading && (
//                 <div className="flex items-center justify-center py-12">
//                   <svg className="animate-spin w-6 h-6" style={{ color: '#f02d65' }}
//                     fill="none" viewBox="0 0 24 24">
//                     <circle className="opacity-25" cx="12" cy="12" r="10"
//                       stroke="currentColor" strokeWidth="4"/>
//                     <path className="opacity-75" fill="currentColor"
//                       d="M4 12a8 8 0 018-8v8H4z"/>
//                   </svg>
//                 </div>
//               )}

//               {!historyQuery.isLoading && messages.length === 0 && (
//                 <div className="text-center py-12">
//                   <p className="text-4xl mb-3">💬</p>
//                   <p className="text-gray-400 text-sm font-medium">No messages yet</p>
//                   <p className="text-gray-300 text-xs mt-1">
//                     Claim and greet the merchant to start
//                   </p>
//                 </div>
//               )}

//               {messages.map((msg, i) => {
//                 const isAdmin = msg.senderRole !== 'merchant'
//                 return (
//                   <div key={msg._id || i}
//                     className={`flex items-end gap-2 ${isAdmin ? 'flex-row-reverse' : 'flex-row'}`}>

//                     <Avatar name={msg.senderName} size={8}
//                       color={isAdmin ? '#6366f1' : '#f02d65'}/>

//                     <div className={`max-w-[65%] flex flex-col gap-1 ${isAdmin ? 'items-end' : 'items-start'}`}>
//                       <p className="text-gray-400 text-[10px] px-1">
//                         {msg.senderName} · {isAdmin ? 'Support' : 'Merchant'}
//                       </p>

//                       {msg.messageType === 'image' ? (
//                         <img src={msg.imageUrl} alt="shared"
//                           className="rounded-2xl max-w-[240px] cursor-pointer"
//                           style={{ border: '1px solid #e5e7eb' }}
//                           onClick={() => window.open(msg.imageUrl, '_blank')}
//                         />
//                       ) : (
//                         <div className="px-4 py-2.5 rounded-2xl text-sm leading-relaxed"
//                           style={isAdmin
//                             ? { background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
//                                 color: 'white', borderBottomRightRadius: 4 }
//                             : { background: 'white', color: '#374151',
//                                 borderBottomLeftRadius: 4,
//                                 boxShadow: '0 1px 8px rgba(0,0,0,0.08)' }
//                           }>
//                           {msg.message}
//                         </div>
//                       )}

//                       <div className={`flex items-center gap-1 px-1 ${isAdmin ? 'flex-row-reverse' : ''}`}>
//                         <p className="text-gray-300 text-[10px]">
//                           {new Date(msg.createdAt).toLocaleTimeString([], {
//                             hour: '2-digit', minute: '2-digit'
//                           })}
//                         </p>
//                         {isAdmin && (
//                           <span className="text-[10px]"
//                             style={{ color: msg.isRead ? '#22c55e' : '#d1d5db' }}>
//                             {msg.isRead ? '✓✓' : '✓'}
//                           </span>
//                         )}
//                       </div>
//                     </div>
//                   </div>
//                 )
//               })}

//               {merchantTyping && (
//                 <div className="flex items-end gap-2">
//                   <Avatar name={activeRoom.merchant?.storeName} size={8}/>
//                   <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-3
//                     flex items-center gap-1.5"
//                     style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.08)' }}>
//                     {[0,1,2].map(i => (
//                       <div key={i} className="w-1.5 h-1.5 rounded-full bg-gray-400"
//                         style={{ animation: `bounce 1.2s ease-in-out ${i*0.2}s infinite` }}/>
//                     ))}
//                   </div>
//                 </div>
//               )}

//               <div ref={messagesEndRef}/>
//             </div>

//             {/* Input bar */}
//             <div className="bg-white border-t border-gray-100 p-4 flex-shrink-0"
//               style={{ boxShadow: '0 -4px 20px rgba(0,0,0,0.04)' }}>

//               {activeRoom.status === 'closed' ? (
//                 <p className="text-center text-gray-400 text-sm py-1">
//                   This conversation is closed
//                 </p>
//               ) : (
//                 <div className="space-y-2">
//                   {/* Quick reply chips */}
//                   <div className="flex gap-2 overflow-x-auto pb-1">
//                     {[
//                       'Hello! How can I help?',
//                       'Please wait a moment...',
//                       'Issue resolved ✓',
//                       'Please contact your merchantAdmin.',
//                     ].map(q => (
//                       <button key={q}
//                         onClick={() => setNewMessage(q)}
//                         className="whitespace-nowrap px-3 py-1.5 rounded-lg text-[10px]
//                           font-semibold transition-all hover:scale-105 flex-shrink-0"
//                         style={{ background: '#f3f4f6', color: '#6b7280' }}>
//                         {q}
//                       </button>
//                     ))}
//                   </div>

//                   <div className="flex items-center gap-2">
//                     {/* Image upload */}
//                     <input type="file" ref={fileRef} accept="image/*"
//                       className="hidden" onChange={handleImage}/>
//                     <button onClick={() => fileRef.current?.click()}
//                       disabled={uploading}
//                       className="w-9 h-9 rounded-xl flex items-center justify-center
//                         text-gray-400 hover:bg-gray-100 transition-all flex-shrink-0">
//                       {uploading
//                         ? <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
//                             <circle className="opacity-25" cx="12" cy="12" r="10"
//                               stroke="currentColor" strokeWidth="4"/>
//                             <path className="opacity-75" fill="currentColor"
//                               d="M4 12a8 8 0 018-8v8H4z"/>
//                           </svg>
//                         : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24"
//                             stroke="currentColor" strokeWidth="2">
//                             <rect x="3" y="3" width="18" height="18" rx="2"/>
//                             <circle cx="8.5" cy="8.5" r="1.5"/>
//                             <polyline points="21,15 16,10 5,21"/>
//                           </svg>
//                       }
//                     </button>

//                     <input ref={inputRef} value={newMessage}
//                       onChange={handleInput} onKeyDown={handleKey}
//                       placeholder="Type your reply... (Enter to send)"
//                       className="flex-1 bg-gray-100 rounded-xl px-4 py-2.5 text-sm
//                         outline-none focus:bg-white focus:ring-2 transition-all"
//                       style={{ '--tw-ring-color': '#f02d65' }}
//                     />

//                     <button onClick={sendMessage} disabled={!newMessage.trim()}
//                       className="w-10 h-10 rounded-xl flex items-center justify-center
//                         text-white transition-all flex-shrink-0
//                         disabled:opacity-40 hover:scale-110 active:scale-95"
//                       style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
//                       <svg className="w-4 h-4 rotate-90" fill="currentColor" viewBox="0 0 24 24">
//                         <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
//                       </svg>
//                     </button>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </>
//         )}
//       </div>

//       <style>{`
//         @keyframes bounce {
//           0%, 80%, 100% { transform: translateY(0); }
//           40%            { transform: translateY(-6px); }
//         }
//       `}</style>
//     </div>
//   )
// }

///////////// ========================== lates version (by gemeni pro) ============================/////////////////////////
// import { useState, useEffect, useRef, useCallback } from "react";
// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { useSelector } from "react-redux";
// import { toast } from "react-toastify";
// import { io } from "socket.io-client";
// import API from "../../api/axios";

// // ── Icons ─────────────────────────────────────────────────────
// import {
//   Send,
//   Image as ImageIcon,
//   CheckCircle2,
//   ShieldAlert,
//   Zap,
//   X,
//   UserX,
//   Loader2,
//   MessageSquare,
//   Clock,
//   ArrowLeft,
//   RefreshCcw,
// } from "lucide-react";

// // ── Avatar Component ──────────────────────────────────────────
// const Avatar = ({ name, role }) => {
//   const isSupport = role !== "merchant";
//   return (
//     <div
//       className="shadow-sm"
//       style={{
//         width: "40px",
//         height: "40px",
//         borderRadius: "4px",
//         flexShrink: 0,
//         display: "flex",
//         alignItems: "center",
//         justifyContent: "center",
//         color: "white",
//         fontWeight: "bold",
//         fontSize: "14px",
//         backgroundColor: isSupport ? "#0f172a" : "#14b8a6", // Slate-900 for Admin, Teal-500 for Merchant
//       }}
//     >
//       {name?.[0]?.toUpperCase() || "?"}
//     </div>
//   );
// };

// // ── Status Badge Component ────────────────────────────────────
// const StatusBadge = ({ status }) => {
//   const map = {
//     waiting: {
//       bg: "#fffbeb",
//       text: "#d97706",
//       border: "#fde68a",
//       label: "Waiting",
//     },
//     active: {
//       bg: "#ecfdf5",
//       text: "#059669",
//       border: "#a7f3d0",
//       label: "Active",
//     },
//     closed: {
//       bg: "#f3f4f6",
//       text: "#6b7280",
//       border: "#e5e7eb",
//       label: "Closed",
//     },
//   };
//   const s = map[status] || map.waiting;
//   return (
//     <span
//       style={{
//         padding: "2px 8px",
//         borderRadius: "4px",
//         fontSize: "10px",
//         fontWeight: "bold",
//         border: `1px solid ${s.border}`,
//         backgroundColor: s.bg,
//         color: s.text,
//       }}
//     >
//       {s.label}
//     </span>
//   );
// };

// export default function AdminChat() {
//   const queryClient = useQueryClient();
//   const { user } = useSelector((s) => s.auth);
//   const isSuperAdmin = user?.role === "superAdmin";

//   // ── State ──────────────────────────────────────────────────
//   const [activeRoom, setActiveRoom] = useState(null);
//   const [messages, setMessages] = useState([]);
//   const [newMessage, setNewMessage] = useState("");
//   const [merchantTyping, setMerchantTyping] = useState(false);
//   const [uploading, setUploading] = useState(false);
//   const [inboxTab, setInboxTab] = useState("all");

//   // Mobile responsive state: true means show inbox list, false means show chat window
//   const [showInboxOnMobile, setShowInboxOnMobile] = useState(true);

//   const messagesEndRef = useRef(null);
//   const typingTimeout = useRef(null);
//   const fileRef = useRef(null);
//   const inputRef = useRef(null);
//   const socketRef = useRef(null);
//   const activeRoomRef = useRef(null);

//   useEffect(() => {
//     activeRoomRef.current = activeRoom;
//   }, [activeRoom]);

//   // ── FETCH: Rooms ───────────────────────────────────────────
//   const roomsQuery = useQuery({
//     queryKey: ["adminChatRooms", inboxTab],
//     queryFn: async () => {
//       if (inboxTab === "blacklist") {
//         const { data } = await API.get("/chat/rooms/blacklist");
//         return data;
//       }
//       if (inboxTab === "waiting") {
//         const { data } = await API.get("/chat/rooms/unclaimed");
//         return data;
//       }
//       const params = new URLSearchParams({ limit: 50 });
//       if (inboxTab !== "all") params.set("status", inboxTab);
//       const { data } = await API.get(`/chat/rooms?${params}`);
//       return data;
//     },
//     refetchInterval: 30000,
//   });

//   // ── FETCH: Message History ─────────────────────────────────
//   const historyQuery = useQuery({
//     queryKey: ["adminChatMessages", activeRoom?.roomId],
//     queryFn: async () => {
//       const { data } = await API.get(`/chat/messages/${activeRoom.roomId}`);
//       return data;
//     },
//     enabled: !!activeRoom?.roomId,
//   });

//   useEffect(() => {
//     if (historyQuery.data?.messages) setMessages(historyQuery.data.messages);
//   }, [historyQuery.data]);

//   // ── MUTATIONS ───────────────────────────────────────────────
//   const assignMutation = useMutation({
//     mutationFn: (roomId) => API.put(`/chat/rooms/${roomId}/assign`),
//     onSuccess: () => {
//       queryClient.invalidateQueries(["adminChatRooms"]);
//       setActiveRoom((r) =>
//         r
//           ? {
//               ...r,
//               status: "active",
//               assignedAgent: { username: user.username },
//             }
//           : r,
//       );
//       toast.success("You claimed this chat");
//     },
//   });

//   const closeMutation = useMutation({
//     mutationFn: (roomId) => API.put(`/chat/rooms/${roomId}/close`),
//     onSuccess: () => {
//       toast.success("Chat closed");
//       queryClient.invalidateQueries(["adminChatRooms"]);
//       setActiveRoom((r) => (r ? { ...r, status: "closed" } : r));
//     },
//   });

//   const blacklistMutation = useMutation({
//     mutationFn: (roomId) => API.put(`/chat/rooms/${roomId}/blacklist`),
//     onSuccess: (res) => {
//       toast.success(res.data.message);
//       queryClient.invalidateQueries(["adminChatRooms"]);
//       setActiveRoom((r) =>
//         r
//           ? { ...r, isBlacklisted: res.data.isBlacklisted, status: "closed" }
//           : r,
//       );
//     },
//   });

//   const markReadMutation = useMutation({
//     mutationFn: (roomId) => API.put(`/chat/rooms/${roomId}/read`),
//     onSuccess: () => queryClient.invalidateQueries(["adminChatRooms"]),
//   });

//   const autoAssignMutation = useMutation({
//     mutationFn: () => API.put("/chat/rooms/auto-assign"),
//     onSuccess: (res) => {
//       toast.success(res.data.message);
//       queryClient.invalidateQueries(["adminChatRooms"]);
//     },
//   });

//   // ── Socket.io Setup ─────────────────────────────────────────
//   useEffect(() => {
//     const socket = io(
//       import.meta.env.VITE_SOCKET_URL || "http://localhost:5000",
//     );
//     socketRef.current = socket;

//     socket.on("connect", () => {
//       socket.emit("agent_online", { userId: user._id, role: user.role });
//     });

//     // ==========================================
//     // CRITICAL FIX: Two-Way Message Handling
//     // ==========================================
//     socket.on("new_message", (msg) => {
//       // 1. IF the message belongs to the room the admin is CURRENTLY looking at:
//       if (msg.roomId === activeRoomRef.current?.roomId) {
//         setMessages((prev) => {
//           if (prev.find((m) => m._id === msg._id)) return prev;
//           return [...prev, msg];
//         });
//         markReadMutation.mutate(msg.roomId);
//         scrollToBottom();
//       }

//       // 2. REGARDLESS of what room is open, update the sidebar list!
//       // This is what makes the incoming message show up on the Admin side when they aren't explicitly inside the chat yet.
//       queryClient.invalidateQueries(["adminChatRooms"]);
//     });

//     socket.on("typing_indicator", ({ isTyping }) =>
//       setMerchantTyping(isTyping),
//     );

//     socket.on("messages_read", ({ roomId }) => {
//       if (roomId === activeRoomRef.current?.roomId) {
//         setMessages((prev) =>
//           prev.map((m) =>
//             m.senderRole !== "merchant" ? { ...m, isRead: true } : m,
//           ),
//         );
//       }
//     });

//     socket.on("user_online", ({ userId }) => {
//       setActiveRoom((r) => {
//         if (r?.merchantUser?._id === userId)
//           return { ...r, isMerchantOnline: true };
//         return r;
//       });
//       queryClient.invalidateQueries(["adminChatRooms"]);
//     });

//     socket.on("user_offline", ({ userId }) => {
//       setActiveRoom((r) => {
//         if (r?.merchantUser?._id === userId)
//           return { ...r, isMerchantOnline: false };
//         return r;
//       });
//     });

//     socket.on("auto_assigned", ({ count }) => {
//       if (count > 0) toast.info(`${count} chat(s) auto-assigned to you`);
//       queryClient.invalidateQueries(["adminChatRooms"]);
//     });

//     return () => {
//       socket.disconnect();
//       socketRef.current = null;
//     };
//   }, [user._id, user.role, queryClient, markReadMutation]);

//   // ── Handlers ────────────────────────────────────────────────
//   const openRoom = useCallback((room) => {
//     if (activeRoomRef.current?.roomId && socketRef.current) {
//       socketRef.current.emit("leave_room", {
//         roomId: activeRoomRef.current.roomId,
//       });
//     }
//     setActiveRoom(room);
//     setMessages([]);
//     setMerchantTyping(false);
//     setShowInboxOnMobile(false);
//     if (socketRef.current) {
//       socketRef.current.emit("join_room", { roomId: room.roomId });
//     }
//     markReadMutation.mutate(room.roomId);
//   }, []);

//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages, merchantTyping]);

//   const sendMessage = () => {
//     if (!newMessage.trim() || !socketRef.current || !activeRoom) return;

//     // Create an optimistic local message so it feels instant
//     const tempMsg = {
//       _id: Date.now().toString(),
//       roomId: activeRoom.roomId,
//       message: newMessage.trim(),
//       messageType: "text",
//       senderRole: user.role,
//       senderName: user.username,
//       senderAvatar: user.avatar || "",
//       createdAt: new Date().toISOString(),
//     };

//     setMessages((prev) => [...prev, tempMsg]);
//     scrollToBottom();

//     socketRef.current.emit("send_message", tempMsg);
//     setNewMessage("");
//     clearTimeout(typingTimeout.current);
//     socketRef.current.emit("typing", {
//       roomId: activeRoom.roomId,
//       isTyping: false,
//     });
//     inputRef.current?.focus();
//   };

//   const handleInput = (e) => {
//     setNewMessage(e.target.value);
//     if (!socketRef.current || !activeRoom) return;
//     socketRef.current.emit("typing", {
//       roomId: activeRoom.roomId,
//       isTyping: true,
//     });
//     clearTimeout(typingTimeout.current);
//     typingTimeout.current = setTimeout(() => {
//       socketRef.current?.emit("typing", {
//         roomId: activeRoom.roomId,
//         isTyping: false,
//       });
//     }, 2000);
//   };

//   const handleKey = (e) => {
//     if (e.key === "Enter" && !e.shiftKey) {
//       e.preventDefault();
//       sendMessage();
//     }
//   };

//   const handleImage = async (e) => {
//     const file = e.target.files[0];
//     if (!file || !socketRef.current || !activeRoom) return;
//     setUploading(true);
//     try {
//       const fd = new FormData();
//       fd.append("file", file);
//       const { data } = await API.post("/upload/single?folder=chat", fd, {
//         headers: { "Content-Type": "multipart/form-data" },
//       });
//       socketRef.current.emit("send_message", {
//         roomId: activeRoom.roomId,
//         message: "",
//         messageType: "image",
//         imageUrl: data.url,
//         senderName: user.username,
//         senderRole: user.role,
//         senderAvatar: user.avatar || "",
//       });
//     } catch {
//       toast.error("Image upload failed");
//     } finally {
//       setUploading(false);
//       e.target.value = "";
//     }
//   };

//   const rooms = roomsQuery.data?.rooms || [];

//   return (
//     // OUTermost Container - Fixed Height to prevent full-page scroll
//     <div
//       className="bg-gray-50 flex flex-col w-full overflow-hidden"
//       style={{
//         padding: "20px",
//         height: "calc(100vh - 64px)",
//         minHeight: "600px",
//       }}
//     >
//       {/* ── HEADER ── */}
//       <div style={{ marginBottom: "16px", flexShrink: 0 }}>
//         <h1
//           className="font-bold text-gray-800"
//           style={{ fontSize: "20px", margin: 0 }}
//         >
//           Customer Service
//         </h1>
//         <p
//           className="text-gray-500"
//           style={{ fontSize: "13px", marginTop: "4px" }}
//         >
//           Respond to merchant inquiries and resolve platform issues in
//           real-time.
//         </p>
//       </div>

//       {/* ── MAIN CHAT CONTAINER (Strict Flex bounds) ── */}
//       <div
//         className="bg-white border border-gray-200 rounded-sm shadow-sm relative flex"
//         style={{ flex: 1, overflow: "hidden" }} // This overflow: hidden is the key to stopping parent scroll
//       >
//         {/* ══════════ LEFT — Inbox Sidebar ══════════ */}
//         <div
//           className={`flex-col border-r border-gray-200 bg-gray-50 z-20 transition-transform duration-300 absolute md:relative ${showInboxOnMobile ? "flex translate-x-0 w-full" : "hidden md:flex -translate-x-full md:translate-x-0"}`}
//           style={{
//             width: showInboxOnMobile ? "100%" : "340px",
//             flexShrink: 0,
//             height: "100%",
//           }}
//         >
//           <div
//             className="border-b border-gray-200 bg-white"
//             style={{ padding: "16px", flexShrink: 0 }}
//           >
//             <div
//               className="flex items-center justify-between"
//               style={{ marginBottom: "16px" }}
//             >
//               <h2
//                 className="font-bold text-gray-800"
//                 style={{ fontSize: "14px" }}
//               >
//                 Active Tickets ({rooms.length})
//               </h2>
//               <button
//                 onClick={() => autoAssignMutation.mutate()}
//                 disabled={autoAssignMutation.isPending}
//                 title="Auto-claim all waiting chats"
//                 className="bg-slate-800 hover:bg-slate-900 text-white rounded-sm transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center"
//                 style={{ width: "32px", height: "32px" }}
//               >
//                 <Zap size={16} />
//               </button>
//             </div>

//             {/* Inbox Tabs */}
//             <div
//               className="flex overflow-x-auto custom-scrollbar"
//               style={{ gap: "8px", paddingBottom: "4px" }}
//             >
//               {[
//                 { key: "all", label: "All" },
//                 { key: "waiting", label: "New" },
//                 { key: "active", label: "Live" },
//                 { key: "closed", label: "Done" },
//                 ...(isSuperAdmin
//                   ? [{ key: "blacklist", label: "Blocked" }]
//                   : []),
//               ].map((f) => (
//                 <button
//                   key={f.key}
//                   onClick={() => setInboxTab(f.key)}
//                   className={`rounded-sm font-bold transition-colors whitespace-nowrap border ${
//                     inboxTab === f.key
//                       ? "bg-teal-500 text-white border-teal-500 shadow-sm"
//                       : "bg-gray-100 text-gray-600 border-transparent hover:bg-gray-200"
//                   }`}
//                   style={{ padding: "6px 12px", fontSize: "11px" }}
//                 >
//                   {f.label}
//                 </button>
//               ))}
//             </div>
//           </div>

//           {/* Room List - SCROLLABLE */}
//           <div
//             className="bg-white custom-scrollbar"
//             style={{ flex: 1, overflowY: "auto" }}
//           >
//             {roomsQuery.isLoading ? (
//               <div
//                 className="flex items-center justify-center"
//                 style={{ padding: "48px" }}
//               >
//                 <Loader2 size={24} className="text-teal-500 animate-spin" />
//               </div>
//             ) : rooms.length === 0 ? (
//               <div className="text-center" style={{ padding: "64px 16px" }}>
//                 <MessageSquare
//                   size={40}
//                   className="text-gray-300 mx-auto"
//                   style={{ marginBottom: "12px" }}
//                 />
//                 <p
//                   className="text-gray-500 font-bold"
//                   style={{ fontSize: "13px" }}
//                 >
//                   No active conversations
//                 </p>
//               </div>
//             ) : (
//               rooms.map((room) => {
//                 const isSelected = activeRoom?.roomId === room.roomId;
//                 return (
//                   <button
//                     key={room._id}
//                     onClick={() => openRoom(room)}
//                     className={`w-full flex items-start text-left transition-colors border-b border-gray-100 ${
//                       isSelected ? "bg-teal-50/50" : "hover:bg-gray-50"
//                     }`}
//                     style={{
//                       padding: "16px",
//                       gap: "12px",
//                       borderLeft: `4px solid ${isSelected ? "#14b8a6" : "transparent"}`,
//                     }}
//                   >
//                     <div className="relative flex-shrink-0">
//                       <Avatar name={room.merchant?.storeName} role="merchant" />
//                       {room.isMerchantOnline && (
//                         <div
//                           className="absolute rounded-full bg-emerald-500 border-2 border-white"
//                           style={{
//                             bottom: "-4px",
//                             right: "-4px",
//                             width: "14px",
//                             height: "14px",
//                           }}
//                         />
//                       )}
//                     </div>
//                     <div className="flex-1 min-w-0">
//                       <div
//                         className="flex items-center justify-between"
//                         style={{ marginBottom: "4px" }}
//                       >
//                         <p
//                           className="text-gray-800 font-bold truncate"
//                           style={{ fontSize: "13px", paddingRight: "8px" }}
//                         >
//                           {room.merchant?.storeName || "Unknown Store"}
//                         </p>
//                         <StatusBadge status={room.status} />
//                       </div>
//                       <p
//                         className="text-gray-500 truncate"
//                         style={{ fontSize: "12px", marginBottom: "8px" }}
//                       >
//                         {room.lastMessage || "Started a new conversation..."}
//                       </p>
//                       <div className="flex items-center justify-between">
//                         <p
//                           className="text-gray-400 flex items-center"
//                           style={{ fontSize: "10px", gap: "4px" }}
//                         >
//                           <Clock size={12} />
//                           {room.lastMessageTime
//                             ? new Date(room.lastMessageTime).toLocaleTimeString(
//                                 [],
//                                 { hour: "2-digit", minute: "2-digit" },
//                               )
//                             : "—"}
//                         </p>
//                         {room.unreadCount > 0 && (
//                           <span
//                             className="rounded-full bg-red-500 text-white font-bold flex items-center justify-center"
//                             style={{
//                               width: "18px",
//                               height: "18px",
//                               fontSize: "10px",
//                             }}
//                           >
//                             {room.unreadCount > 9 ? "9+" : room.unreadCount}
//                           </span>
//                         )}
//                       </div>
//                     </div>
//                   </button>
//                 );
//               })
//             )}
//           </div>
//         </div>

//         {/* ══════════ RIGHT — Conversation Window ══════════ */}
//         <div
//           className={`flex-col bg-white min-w-0 relative z-10 w-full h-full ${!showInboxOnMobile && activeRoom ? "flex" : "hidden md:flex"}`}
//           style={{ flex: 1 }}
//         >
//           {!activeRoom ? (
//             <div
//               className="flex-col items-center justify-center bg-gray-50/50 text-center"
//               style={{ flex: 1, display: "flex", padding: "24px" }}
//             >
//               <MessageSquare
//                 size={64}
//                 className="text-gray-200"
//                 style={{ marginBottom: "16px" }}
//               />
//               <p
//                 className="text-gray-600 font-bold"
//                 style={{ fontSize: "16px" }}
//               >
//                 Select a conversation
//               </p>
//               <p
//                 className="text-gray-400"
//                 style={{ fontSize: "14px", marginTop: "8px" }}
//               >
//                 Choose a ticket from the left panel to begin support.
//               </p>
//             </div>
//           ) : (
//             <>
//               {/* Chat Header - FIXED */}
//               <div
//                 className="bg-white border-b border-gray-200 flex items-center justify-between shadow-sm z-10"
//                 style={{ padding: "16px 24px", flexShrink: 0 }}
//               >
//                 <div className="flex items-center" style={{ gap: "12px" }}>
//                   {/* Mobile Back Button */}
//                   <button
//                     onClick={() => setShowInboxOnMobile(true)}
//                     className="md:hidden text-gray-500 hover:text-gray-800"
//                     style={{ padding: "8px", marginLeft: "-8px" }}
//                   >
//                     <ArrowLeft size={20} />
//                   </button>

//                   <Avatar
//                     name={activeRoom.merchant?.storeName}
//                     role="merchant"
//                   />
//                   <div className="min-w-0">
//                     <h2
//                       className="text-gray-900 font-bold flex items-center truncate"
//                       style={{
//                         fontSize: "16px",
//                         gap: "8px",
//                         margin: "0 0 2px 0",
//                       }}
//                     >
//                       <span className="truncate">
//                         {activeRoom.merchant?.storeName || "Unknown Store"}
//                       </span>
//                       {activeRoom.isBlacklisted && (
//                         <ShieldAlert
//                           size={16}
//                           className="text-red-500 flex-shrink-0"
//                         />
//                       )}
//                     </h2>
//                     <p
//                       className="text-gray-500 flex items-center"
//                       style={{ fontSize: "12px", gap: "8px" }}
//                     >
//                       <span
//                         className="font-mono bg-gray-100 rounded-sm"
//                         style={{ padding: "2px 6px" }}
//                       >
//                         ID: {activeRoom.merchant?.merchantId}
//                       </span>
//                       <span className="hidden md:inline">•</span>
//                       <span
//                         className={`${activeRoom.isMerchantOnline ? "text-emerald-600 font-bold" : "text-gray-400"} hidden md:inline`}
//                       >
//                         {activeRoom.isMerchantOnline ? "Online Now" : "Offline"}
//                       </span>
//                     </p>
//                   </div>
//                 </div>

//                 {/* Actions */}
//                 <div className="flex items-center" style={{ gap: "8px" }}>
//                   {activeRoom.status === "waiting" && (
//                     <button
//                       onClick={() => assignMutation.mutate(activeRoom.roomId)}
//                       disabled={assignMutation.isPending}
//                       className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-sm font-bold transition-colors shadow-sm disabled:opacity-50 flex items-center whitespace-nowrap"
//                       style={{
//                         padding: "8px 16px",
//                         fontSize: "12px",
//                         gap: "6px",
//                       }}
//                     >
//                       <CheckCircle2 size={16} />{" "}
//                       <span className="hidden sm:inline">Claim Ticket</span>
//                       <span className="sm:hidden">Claim</span>
//                     </button>
//                   )}

//                   {activeRoom.status === "active" && (
//                     <button
//                       onClick={() => {
//                         if (window.confirm("Close this ticket?"))
//                           closeMutation.mutate(activeRoom.roomId);
//                       }}
//                       disabled={closeMutation.isPending}
//                       className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-sm font-bold transition-colors shadow-sm disabled:opacity-50 flex items-center whitespace-nowrap"
//                       style={{
//                         padding: "8px 16px",
//                         fontSize: "12px",
//                         gap: "6px",
//                       }}
//                     >
//                       <X size={16} />{" "}
//                       <span className="hidden sm:inline">Close Ticket</span>
//                       <span className="sm:hidden">Close</span>
//                     </button>
//                   )}

//                   {activeRoom.status === "closed" && (
//                     <button
//                       onClick={() => assignMutation.mutate(activeRoom.roomId)}
//                       disabled={assignMutation.isPending}
//                       className="bg-blue-500 hover:bg-blue-600 text-white rounded-sm font-bold transition-colors shadow-sm disabled:opacity-50 flex items-center whitespace-nowrap"
//                       style={{
//                         padding: "8px 16px",
//                         fontSize: "12px",
//                         gap: "6px",
//                       }}
//                     >
//                       <RefreshCcw size={16} />{" "}
//                       <span className="hidden sm:inline">Reopen Ticket</span>
//                       <span className="sm:hidden">Reopen</span>
//                     </button>
//                   )}

//                   {isSuperAdmin && (
//                     <button
//                       onClick={() => {
//                         const msg = activeRoom.isBlacklisted
//                           ? "Unblock merchant?"
//                           : "Block merchant from chat?";
//                         if (window.confirm(msg))
//                           blacklistMutation.mutate(activeRoom.roomId);
//                       }}
//                       disabled={blacklistMutation.isPending}
//                       className={`${activeRoom.isBlacklisted ? "bg-amber-500 hover:bg-amber-600" : "bg-red-500 hover:bg-red-600"} text-white rounded-sm font-bold transition-colors shadow-sm disabled:opacity-50 flex items-center whitespace-nowrap`}
//                       style={{
//                         padding: "8px 16px",
//                         fontSize: "12px",
//                         gap: "6px",
//                       }}
//                     >
//                       <UserX size={16} />{" "}
//                       <span className="hidden sm:inline">
//                         {activeRoom.isBlacklisted ? "Unblock" : "Block"}
//                       </span>
//                     </button>
//                   )}
//                 </div>
//               </div>

//               {/* Chat Messages - SCROLLABLE */}
//               <div
//                 className="bg-slate-50 flex flex-col custom-scrollbar"
//                 style={{
//                   flex: 1,
//                   overflowY: "auto",
//                   padding: "24px",
//                   gap: "24px",
//                 }}
//               >
//                 {historyQuery.isLoading ? (
//                   <div
//                     className="flex items-center justify-center"
//                     style={{ padding: "48px" }}
//                   >
//                     <Loader2 size={24} className="text-teal-500 animate-spin" />
//                   </div>
//                 ) : messages.length === 0 ? (
//                   <div className="text-center" style={{ padding: "48px" }}>
//                     <span
//                       className="bg-white border border-gray-200 rounded-full color-gray-600 font-bold shadow-sm"
//                       style={{ padding: "8px 16px", fontSize: "13px" }}
//                     >
//                       No messages in this ticket yet.
//                     </span>
//                   </div>
//                 ) : (
//                   messages.map((msg, i) => {
//                     const isAdmin = msg.senderRole !== "merchant";

//                     return (
//                       <div
//                         key={msg._id || i}
//                         className={`flex items-end w-full ${isAdmin ? "justify-end" : "justify-start"}`}
//                         style={{ gap: "12px" }}
//                       >
//                         {/* Merchant Avatar (Left) */}
//                         {!isAdmin && (
//                           <Avatar name={msg.senderName} role={msg.senderRole} />
//                         )}

//                         <div
//                           className={`flex flex-col ${isAdmin ? "items-end" : "items-start"}`}
//                           style={{ gap: "4px", maxWidth: "75%" }}
//                         >
//                           <span
//                             className="text-gray-400 font-bold uppercase tracking-wider"
//                             style={{ fontSize: "10px", padding: "0 4px" }}
//                           >
//                             {isAdmin ? "You" : "Merchant"}
//                           </span>

//                           {msg.messageType === "image" ? (
//                             <img
//                               src={msg.imageUrl}
//                               alt="attachment"
//                               className="rounded-sm border border-gray-200 cursor-pointer hover:opacity-90 shadow-sm"
//                               style={{ maxWidth: "300px" }}
//                               onClick={() =>
//                                 window.open(msg.imageUrl, "_blank")
//                               }
//                             />
//                           ) : (
//                             <div
//                               className={`leading-relaxed shadow-sm ${
//                                 isAdmin
//                                   ? "bg-slate-900 text-white rounded-l-lg rounded-tr-lg" // Admin message
//                                   : "bg-white border border-gray-200 text-gray-800 rounded-r-lg rounded-tl-lg" // Merchant message
//                               }`}
//                               style={{
//                                 padding: "12px 20px",
//                                 fontSize: "14px",
//                                 wordBreak: "break-word",
//                               }}
//                             >
//                               {msg.message}
//                             </div>
//                           )}

//                           <div
//                             className={`flex items-center ${isAdmin ? "flex-row-reverse" : ""}`}
//                             style={{
//                               gap: "6px",
//                               padding: "0 4px",
//                               marginTop: "2px",
//                             }}
//                           >
//                             <span
//                               className="text-gray-400 font-medium"
//                               style={{ fontSize: "11px" }}
//                             >
//                               {new Date(msg.createdAt).toLocaleTimeString([], {
//                                 hour: "2-digit",
//                                 minute: "2-digit",
//                               })}
//                             </span>
//                             {isAdmin && (
//                               <span
//                                 className={`font-bold ${msg.isRead ? "text-teal-500" : "text-gray-300"}`}
//                                 style={{ fontSize: "11px" }}
//                               >
//                                 {msg.isRead ? "Read" : "Sent"}
//                               </span>
//                             )}
//                           </div>
//                         </div>

//                         {/* Admin Avatar (Right) */}
//                         {isAdmin && (
//                           <div className="hidden md:block">
//                             <Avatar
//                               name={msg.senderName}
//                               role={msg.senderRole}
//                             />
//                           </div>
//                         )}
//                       </div>
//                     );
//                   })
//                 )}

//                 {/* Typing Indicator */}
//                 {merchantTyping && (
//                   <div
//                     className="flex items-end justify-start w-full"
//                     style={{ gap: "12px" }}
//                   >
//                     <Avatar
//                       name={activeRoom.merchant?.storeName}
//                       role="merchant"
//                     />
//                     <div
//                       className="bg-white border border-gray-200 rounded-r-lg rounded-tl-lg flex items-center shadow-sm"
//                       style={{ padding: "16px 20px", gap: "6px" }}
//                     >
//                       <div
//                         className="rounded-full bg-gray-400 animate-bounce"
//                         style={{
//                           width: "8px",
//                           height: "8px",
//                           animationDelay: "0ms",
//                         }}
//                       />
//                       <div
//                         className="rounded-full bg-gray-400 animate-bounce"
//                         style={{
//                           width: "8px",
//                           height: "8px",
//                           animationDelay: "150ms",
//                         }}
//                       />
//                       <div
//                         className="rounded-full bg-gray-400 animate-bounce"
//                         style={{
//                           width: "8px",
//                           height: "8px",
//                           animationDelay: "300ms",
//                         }}
//                       />
//                     </div>
//                   </div>
//                 )}

//                 {/* Auto Scroll Anchor */}
//                 <div ref={messagesEndRef} style={{ height: "1px" }} />
//               </div>

//               {/* Input Area - FIXED */}
//               <div
//                 className="bg-white border-t border-gray-200 z-10"
//                 style={{ padding: "20px 24px", flexShrink: 0 }}
//               >
//                 {activeRoom.status === "closed" ? (
//                   <div
//                     className="bg-gray-50 border border-gray-200 rounded-sm text-center text-gray-500 font-bold"
//                     style={{ padding: "16px", fontSize: "14px" }}
//                   >
//                     This ticket is closed. Click "Reopen Ticket" above to send
//                     messages.
//                   </div>
//                 ) : (
//                   <div className="flex flex-col" style={{ gap: "12px" }}>
//                     {/* Quick Replies */}
//                     <div
//                       className="flex overflow-x-auto custom-scrollbar"
//                       style={{ gap: "8px", paddingBottom: "8px" }}
//                     >
//                       {[
//                         "Hello! How can I help you today?",
//                         "Please wait a moment while I check on this.",
//                         "Issue resolved. Let me know if you need anything else.",
//                         "Please upload a screenshot of your transaction.",
//                       ].map((q) => (
//                         <button
//                           key={q}
//                           onClick={() => setNewMessage(q)}
//                           className="bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-sm font-bold transition-colors whitespace-nowrap flex-shrink-0"
//                           style={{ padding: "6px 16px", fontSize: "12px" }}
//                         >
//                           {q}
//                         </button>
//                       ))}
//                     </div>

//                     <div
//                       className="flex items-end relative"
//                       style={{ gap: "12px" }}
//                     >
//                       <textarea
//                         ref={inputRef}
//                         value={newMessage}
//                         onChange={handleInput}
//                         onKeyDown={handleKey}
//                         placeholder="Type your message here... (Press Enter to send)"
//                         className="flex-1 bg-white border border-gray-300 rounded-sm text-gray-800 outline-none focus:border-teal-500 transition-all resize-none shadow-inner w-full"
//                         style={{
//                           padding: "16px",
//                           paddingRight: "130px",
//                           fontSize: "14px",
//                         }}
//                         rows={2}
//                       />

//                       <div
//                         className="absolute flex items-center"
//                         style={{ bottom: "12px", right: "12px", gap: "8px" }}
//                       >
//                         <input
//                           type="file"
//                           ref={fileRef}
//                           accept="image/*"
//                           className="hidden"
//                           onChange={handleImage}
//                         />
//                         <button
//                           onClick={() => fileRef.current?.click()}
//                           disabled={uploading}
//                           title="Upload Image"
//                           className="rounded-sm bg-gray-100 hover:bg-gray-200 border border-gray-200 text-gray-600 flex items-center justify-center transition-colors"
//                           style={{ width: "40px", height: "40px" }}
//                         >
//                           {uploading ? (
//                             <Loader2 size={20} className="animate-spin" />
//                           ) : (
//                             <ImageIcon size={20} />
//                           )}
//                         </button>

//                         <button
//                           onClick={sendMessage}
//                           disabled={!newMessage.trim()}
//                           className="rounded-sm bg-teal-500 hover:bg-teal-600 text-white border-none font-bold flex items-center cursor-pointer transition-colors shadow-sm disabled:opacity-50"
//                           style={{
//                             padding: "0 24px",
//                             height: "40px",
//                             fontSize: "14px",
//                             gap: "8px",
//                           }}
//                         >
//                           <Send size={16} />{" "}
//                           <span className="hidden sm:inline">Send</span>
//                         </button>
//                       </div>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

/////////////////// =============== latest version (by gemeni) ====================///////////////
// import { useState, useEffect, useRef, useCallback } from "react";
// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { useSelector } from "react-redux";
// import { toast } from "react-toastify";
// import { io } from "socket.io-client";
// import API from "../../api/axios";

// // ── Icons ─────────────────────────────────────────────────────
// import {
//   Send,
//   Image as ImageIcon,
//   CheckCircle2,
//   ShieldAlert,
//   Zap,
//   X,
//   UserX,
//   Loader2,
//   MessageSquare,
//   Clock,
//   ArrowLeft,
//   RefreshCcw,
// } from "lucide-react";

// // ── Avatar Component ──────────────────────────────────────────
// const Avatar = ({ name, role }) => {
//   const isSupport = role !== "merchant";
//   return (
//     <div
//       className="shadow-sm"
//       style={{
//         width: "40px",
//         height: "40px",
//         borderRadius: "4px",
//         flexShrink: 0,
//         display: "flex",
//         alignItems: "center",
//         justifyContent: "center",
//         color: "white",
//         fontWeight: "bold",
//         fontSize: "14px",
//         backgroundColor: isSupport ? "#0f172a" : "#14b8a6", // Slate-900 for Admin, Teal-500 for Merchant
//       }}
//     >
//       {name?.[0]?.toUpperCase() || "?"}
//     </div>
//   );
// };

// // ── Status Badge Component ────────────────────────────────────
// const StatusBadge = ({ status }) => {
//   const map = {
//     waiting: {
//       bg: "#fffbeb",
//       text: "#d97706",
//       border: "#fde68a",
//       label: "Waiting",
//     },
//     active: {
//       bg: "#ecfdf5",
//       text: "#059669",
//       border: "#a7f3d0",
//       label: "Active",
//     },
//     closed: {
//       bg: "#f3f4f6",
//       text: "#6b7280",
//       border: "#e5e7eb",
//       label: "Closed",
//     },
//   };
//   const s = map[status] || map.waiting;
//   return (
//     <span
//       style={{
//         padding: "2px 8px",
//         borderRadius: "4px",
//         fontSize: "10px",
//         fontWeight: "bold",
//         border: `1px solid ${s.border}`,
//         backgroundColor: s.bg,
//         color: s.text,
//       }}
//     >
//       {s.label}
//     </span>
//   );
// };

// export default function AdminChat() {
//   const queryClient = useQueryClient();
//   const { user } = useSelector((s) => s.auth);
//   const isSuperAdmin = user?.role === "superAdmin";

//   // ── State ──────────────────────────────────────────────────
//   const [activeRoom, setActiveRoom] = useState(null);
//   const [messages, setMessages] = useState([]);
//   const [newMessage, setNewMessage] = useState("");
//   const [merchantTyping, setMerchantTyping] = useState(false);
//   const [uploading, setUploading] = useState(false);
//   const [inboxTab, setInboxTab] = useState("all");

//   // Mobile responsive state: true means show inbox list, false means show chat window
//   const [showInboxOnMobile, setShowInboxOnMobile] = useState(true);

//   const messagesEndRef = useRef(null);
//   const typingTimeout = useRef(null);
//   const fileRef = useRef(null);
//   const inputRef = useRef(null);
//   const socketRef = useRef(null);
//   const activeRoomRef = useRef(null);
//   const roomsRef = useRef([]); // Track all visible rooms

//   useEffect(() => {
//     activeRoomRef.current = activeRoom;
//   }, [activeRoom]);

//   // ── FETCH: Rooms ───────────────────────────────────────────
//   const roomsQuery = useQuery({
//     queryKey: ["adminChatRooms", inboxTab],
//     queryFn: async () => {
//       if (inboxTab === "blacklist") {
//         const { data } = await API.get("/chat/rooms/blacklist");
//         return data;
//       }
//       if (inboxTab === "waiting") {
//         const { data } = await API.get("/chat/rooms/unclaimed");
//         return data;
//       }
//       // FIXED TYPO HERE (new URLSearchParams instead of newSearchParams)
//       const params = new URLSearchParams({ limit: 50 });
//       if (inboxTab !== "all") params.set("status", inboxTab);
//       const { data } = await API.get(`/chat/rooms?${params}`);
//       return data;
//     },
//     refetchInterval: 30000,
//   });

//   const rooms = roomsQuery.data?.rooms || [];

//   // ── FETCH: Message History ─────────────────────────────────
//   const historyQuery = useQuery({
//     queryKey: ["adminChatMessages", activeRoom?.roomId],
//     queryFn: async () => {
//       const { data } = await API.get(`/chat/messages/${activeRoom.roomId}`);
//       return data;
//     },
//     enabled: !!activeRoom?.roomId,
//   });

//   useEffect(() => {
//     if (historyQuery.data?.messages) setMessages(historyQuery.data.messages);
//   }, [historyQuery.data]);

//   // ── MUTATIONS ───────────────────────────────────────────────
//   const assignMutation = useMutation({
//     mutationFn: (roomId) => API.put(`/chat/rooms/${roomId}/assign`),
//     onSuccess: () => {
//       queryClient.invalidateQueries(["adminChatRooms"]);
//       setActiveRoom((r) =>
//         r
//           ? {
//               ...r,
//               status: "active",
//               assignedAgent: { username: user.username },
//             }
//           : r,
//       );
//       toast.success("You claimed this chat");
//     },
//   });

//   const closeMutation = useMutation({
//     mutationFn: (roomId) => API.put(`/chat/rooms/${roomId}/close`),
//     onSuccess: () => {
//       toast.success("Chat closed");
//       queryClient.invalidateQueries(["adminChatRooms"]);
//       setActiveRoom((r) => (r ? { ...r, status: "closed" } : r));
//     },
//   });

//   const blacklistMutation = useMutation({
//     mutationFn: (roomId) => API.put(`/chat/rooms/${roomId}/blacklist`),
//     onSuccess: (res) => {
//       toast.success(res.data.message);
//       queryClient.invalidateQueries(["adminChatRooms"]);
//       setActiveRoom((r) =>
//         r
//           ? { ...r, isBlacklisted: res.data.isBlacklisted, status: "closed" }
//           : r,
//       );
//     },
//   });

//   const markReadMutation = useMutation({
//     mutationFn: (roomId) => API.put(`/chat/rooms/${roomId}/read`),
//     onSuccess: () => queryClient.invalidateQueries(["adminChatRooms"]),
//   });

//   const autoAssignMutation = useMutation({
//     mutationFn: () => API.put("/chat/rooms/auto-assign"),
//     onSuccess: (res) => {
//       toast.success(res.data.message);
//       queryClient.invalidateQueries(["adminChatRooms"]);
//     },
//   });

//   // ── Socket Setup ─────────────────────────────────────────
//   useEffect(() => {
//     const socket = io(
//       import.meta.env.VITE_SOCKET_URL || "http://localhost:5000",
//     );
//     socketRef.current = socket;

//     socket.on("connect", () => {
//       socket.emit("agent_online", { userId: user._id, role: user.role });
//       // Bulk join all current rooms on connect
//       roomsRef.current.forEach((r) =>
//         socket.emit("join_room", { roomId: r.roomId }),
//       );
//     });

//     socket.on("new_message", (msg) => {
//       // Notification Logic
//       if (msg.senderRole === "merchant") {
//         const matchingRoom = roomsRef.current.find(
//           (r) => r.roomId === msg.roomId,
//         );
//         const name =
//           matchingRoom?.merchant?.storeName || msg.senderName || "Merchant";
//         if (msg.roomId !== activeRoomRef.current?.roomId) {
//           toast.info(`New message from ${name}`);
//         }
//       }

//       // Append to active chat
//       if (msg.roomId === activeRoomRef.current?.roomId) {
//         setMessages((prev) => {
//           if (prev.find((m) => m._id === msg._id)) return prev;
//           return [...prev, msg];
//         });
//         markReadMutation.mutate(msg.roomId);
//         setTimeout(
//           () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }),
//           100,
//         );
//       }
//       queryClient.invalidateQueries(["adminChatRooms"]);
//     });

//     socket.on("typing_indicator", ({ isTyping }) =>
//       setMerchantTyping(isTyping),
//     );

//     socket.on("messages_read", ({ roomId }) => {
//       if (roomId === activeRoomRef.current?.roomId) {
//         setMessages((prev) =>
//           prev.map((m) =>
//             m.senderRole !== "merchant" ? { ...m, isRead: true } : m,
//           ),
//         );
//       }
//     });

//     // CRITICAL FIX: Direct Query Manipulation for Instant Online/Offline Status!
//     socket.on("user_online", ({ userId }) => {
//       setActiveRoom((r) =>
//         r?.merchantUser?._id === userId ? { ...r, isMerchantOnline: true } : r,
//       );
//       queryClient.setQueryData(["adminChatRooms", inboxTab], (old) => {
//         if (!old) return old;
//         return {
//           ...old,
//           rooms: old.rooms.map((r) =>
//             r.merchantUser?._id === userId
//               ? { ...r, isMerchantOnline: true }
//               : r,
//           ),
//         };
//       });
//     });

//     socket.on("user_offline", ({ userId }) => {
//       setActiveRoom((r) =>
//         r?.merchantUser?._id === userId ? { ...r, isMerchantOnline: false } : r,
//       );
//       queryClient.setQueryData(["adminChatRooms", inboxTab], (old) => {
//         if (!old) return old;
//         return {
//           ...old,
//           rooms: old.rooms.map((r) =>
//             r.merchantUser?._id === userId
//               ? { ...r, isMerchantOnline: false }
//               : r,
//           ),
//         };
//       });
//     });

//     socket.on("auto_assigned", ({ count }) => {
//       if (count > 0) toast.info(`${count} chat(s) auto-assigned to you`);
//       queryClient.invalidateQueries(["adminChatRooms"]);
//     });

//     return () => {
//       socket.disconnect();
//       socketRef.current = null;
//     };
//   }, [user._id, user.role, queryClient, markReadMutation, inboxTab]);

//   // Keep ref synced and join new rooms automatically
//   useEffect(() => {
//     roomsRef.current = rooms;
//     if (socketRef.current && socketRef.current.connected) {
//       rooms.forEach((r) =>
//         socketRef.current.emit("join_room", { roomId: r.roomId }),
//       );
//     }
//   }, [rooms]);

//   const openRoom = useCallback(
//     (room) => {
//       setActiveRoom(room);
//       setMessages([]);
//       setMerchantTyping(false);
//       setShowInboxOnMobile(false);
//       markReadMutation.mutate(room.roomId);
//     },
//     [markReadMutation],
//   );

//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages, merchantTyping]);

//   const sendMessage = () => {
//     if (!newMessage.trim() || !socketRef.current || !activeRoom) return;

//     const tempMsg = {
//       _id: Date.now().toString(),
//       roomId: activeRoom.roomId,
//       message: newMessage.trim(),
//       messageType: "text",
//       senderRole: user.role,
//       senderName: user.username,
//       senderAvatar: user.avatar || "",
//       createdAt: new Date().toISOString(),
//     };

//     setMessages((prev) => [...prev, tempMsg]);
//     scrollToBottom();

//     socketRef.current.emit("send_message", tempMsg);
//     setNewMessage("");
//     clearTimeout(typingTimeout.current);
//     socketRef.current.emit("typing", {
//       roomId: activeRoom.roomId,
//       isTyping: false,
//     });
//     inputRef.current?.focus();
//   };

//   const scrollToBottom = () => {
//     setTimeout(() => {
//       messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//     }, 100);
//   };

//   const handleInput = (e) => {
//     setNewMessage(e.target.value);
//     if (!socketRef.current || !activeRoom) return;
//     socketRef.current.emit("typing", {
//       roomId: activeRoom.roomId,
//       isTyping: true,
//     });
//     clearTimeout(typingTimeout.current);
//     typingTimeout.current = setTimeout(() => {
//       socketRef.current?.emit("typing", {
//         roomId: activeRoom.roomId,
//         isTyping: false,
//       });
//     }, 2000);
//   };

//   const handleKey = (e) => {
//     if (e.key === "Enter" && !e.shiftKey) {
//       e.preventDefault();
//       sendMessage();
//     }
//   };

//   const handleImage = async (e) => {
//     const file = e.target.files[0];
//     if (!file || !socketRef.current || !activeRoom) return;
//     setUploading(true);
//     try {
//       const fd = new FormData();
//       fd.append("file", file);
//       const { data } = await API.post("/upload/single?folder=chat", fd, {
//         headers: { "Content-Type": "multipart/form-data" },
//       });

//       const imgMsg = {
//         _id: Date.now().toString(),
//         roomId: activeRoom.roomId,
//         message: "",
//         messageType: "image",
//         imageUrl: data.url,
//         senderRole: user.role,
//         senderName: user.username,
//         senderAvatar: user.avatar || "",
//         createdAt: new Date().toISOString(),
//       };

//       setMessages((prev) => [...prev, imgMsg]);
//       scrollToBottom();
//       socketRef.current.emit("send_message", imgMsg);
//     } catch {
//       toast.error("Image upload failed");
//     } finally {
//       setUploading(false);
//       e.target.value = "";
//     }
//   };

//   return (
//     <div
//       className="bg-gray-50 flex flex-col w-full overflow-hidden"
//       style={{
//         padding: "20px",
//         height: "calc(100vh - 64px)",
//         minHeight: "600px",
//       }}
//     >
//       {/* ── HEADER ── */}
//       <div style={{ marginBottom: "16px", flexShrink: 0 }}>
//         <h1
//           className="font-bold text-gray-800"
//           style={{ fontSize: "20px", margin: 0 }}
//         >
//           Customer Service
//         </h1>
//         <p
//           className="text-gray-500"
//           style={{ fontSize: "13px", marginTop: "4px" }}
//         >
//           Respond to merchant inquiries and resolve platform issues in
//           real-time.
//         </p>
//       </div>

//       {/* ── MAIN CHAT CONTAINER (Strict Flex bounds) ── */}
//       <div
//         className="bg-white border border-gray-200 rounded-sm shadow-sm relative flex"
//         style={{ flex: 1, overflow: "hidden" }}
//       >
//         {/* ══════════ LEFT — Inbox Sidebar ══════════ */}
//         <div
//           className={`flex-col border-r border-gray-200 bg-gray-50 z-20 transition-transform duration-300 absolute md:relative ${showInboxOnMobile ? "flex translate-x-0 w-full" : "hidden md:flex -translate-x-full md:translate-x-0"}`}
//           style={{
//             width: showInboxOnMobile ? "100%" : "340px",
//             flexShrink: 0,
//             height: "100%",
//           }}
//         >
//           <div
//             className="border-b border-gray-200 bg-white"
//             style={{ padding: "16px", flexShrink: 0 }}
//           >
//             <div
//               className="flex items-center justify-between"
//               style={{ marginBottom: "16px" }}
//             >
//               <h2
//                 className="font-bold text-gray-800"
//                 style={{ fontSize: "14px" }}
//               >
//                 Active Tickets ({rooms.length})
//               </h2>
//               <button
//                 onClick={() => autoAssignMutation.mutate()}
//                 disabled={autoAssignMutation.isPending}
//                 title="Auto-claim all waiting chats"
//                 className="bg-slate-800 hover:bg-slate-900 text-white rounded-sm transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center"
//                 style={{ width: "32px", height: "32px" }}
//               >
//                 <Zap size={16} />
//               </button>
//             </div>

//             <div
//               className="flex overflow-x-auto custom-scrollbar"
//               style={{ gap: "8px", paddingBottom: "4px" }}
//             >
//               {[
//                 { key: "all", label: "All" },
//                 { key: "waiting", label: "New" },
//                 { key: "active", label: "Live" },
//                 { key: "closed", label: "Done" },
//                 ...(isSuperAdmin
//                   ? [{ key: "blacklist", label: "Blocked" }]
//                   : []),
//               ].map((f) => (
//                 <button
//                   key={f.key}
//                   onClick={() => setInboxTab(f.key)}
//                   className={`rounded-sm font-bold transition-colors whitespace-nowrap border ${inboxTab === f.key ? "bg-teal-500 text-white border-teal-500 shadow-sm" : "bg-gray-100 text-gray-600 border-transparent hover:bg-gray-200"}`}
//                   style={{ padding: "6px 12px", fontSize: "11px" }}
//                 >
//                   {f.label}
//                 </button>
//               ))}
//             </div>
//           </div>

//           <div
//             className="bg-white custom-scrollbar"
//             style={{ flex: 1, overflowY: "auto" }}
//           >
//             {roomsQuery.isLoading ? (
//               <div
//                 className="flex items-center justify-center"
//                 style={{ padding: "48px" }}
//               >
//                 <Loader2 size={24} className="text-teal-500 animate-spin" />
//               </div>
//             ) : rooms.length === 0 ? (
//               <div className="text-center" style={{ padding: "64px 16px" }}>
//                 <MessageSquare
//                   size={40}
//                   className="text-gray-300 mx-auto"
//                   style={{ marginBottom: "12px" }}
//                 />
//                 <p
//                   className="text-gray-500 font-bold"
//                   style={{ fontSize: "13px" }}
//                 >
//                   No active conversations
//                 </p>
//               </div>
//             ) : (
//               rooms.map((room) => {
//                 const isSelected = activeRoom?.roomId === room.roomId;
//                 return (
//                   <button
//                     key={room._id}
//                     onClick={() => openRoom(room)}
//                     className={`w-full flex items-start text-left transition-colors border-b border-gray-100 ${isSelected ? "bg-teal-50/50" : "hover:bg-gray-50"}`}
//                     style={{
//                       padding: "16px",
//                       gap: "12px",
//                       borderLeft: `4px solid ${isSelected ? "#14b8a6" : "transparent"}`,
//                     }}
//                   >
//                     <div className="relative flex-shrink-0">
//                       <Avatar name={room.merchant?.storeName} role="merchant" />
//                       {room.isMerchantOnline && (
//                         <div
//                           className="absolute rounded-full bg-emerald-500 border-2 border-white"
//                           style={{
//                             bottom: "-4px",
//                             right: "-4px",
//                             width: "14px",
//                             height: "14px",
//                           }}
//                         />
//                       )}
//                     </div>
//                     <div className="flex-1 min-w-0">
//                       <div
//                         className="flex items-center justify-between"
//                         style={{ marginBottom: "4px" }}
//                       >
//                         <p
//                           className="text-gray-800 font-bold truncate"
//                           style={{ fontSize: "13px", paddingRight: "8px" }}
//                         >
//                           {room.merchant?.storeName || "Unknown Store"}
//                         </p>
//                         <StatusBadge status={room.status} />
//                       </div>
//                       <p
//                         className="text-gray-500 truncate"
//                         style={{ fontSize: "12px", marginBottom: "8px" }}
//                       >
//                         {room.lastMessage || "Started a new conversation..."}
//                       </p>
//                       <div className="flex items-center justify-between">
//                         <p
//                           className="text-gray-400 flex items-center"
//                           style={{ fontSize: "10px", gap: "4px" }}
//                         >
//                           <Clock size={12} />
//                           {room.lastMessageTime
//                             ? new Date(room.lastMessageTime).toLocaleTimeString(
//                                 [],
//                                 { hour: "2-digit", minute: "2-digit" },
//                               )
//                             : "—"}
//                         </p>
//                         {room.unreadCount > 0 && (
//                           <span
//                             className="rounded-full bg-red-500 text-white font-bold flex items-center justify-center"
//                             style={{
//                               width: "18px",
//                               height: "18px",
//                               fontSize: "10px",
//                             }}
//                           >
//                             {room.unreadCount > 9 ? "9+" : room.unreadCount}
//                           </span>
//                         )}
//                       </div>
//                     </div>
//                   </button>
//                 );
//               })
//             )}
//           </div>
//         </div>

//         {/* ══════════ RIGHT — Conversation Window ══════════ */}
//         <div
//           className={`flex-col bg-white min-w-0 relative z-10 w-full h-full ${!showInboxOnMobile && activeRoom ? "flex" : "hidden md:flex"}`}
//           style={{ flex: 1 }}
//         >
//           {!activeRoom ? (
//             <div
//               className="flex-col items-center justify-center bg-gray-50/50 text-center"
//               style={{ flex: 1, display: "flex", padding: "24px" }}
//             >
//               <MessageSquare
//                 size={64}
//                 className="text-gray-200"
//                 style={{ marginBottom: "16px" }}
//               />
//               <p
//                 className="text-gray-600 font-bold"
//                 style={{ fontSize: "16px" }}
//               >
//                 Select a conversation
//               </p>
//               <p
//                 className="text-gray-400"
//                 style={{ fontSize: "14px", marginTop: "8px" }}
//               >
//                 Choose a ticket from the left panel to begin support.
//               </p>
//             </div>
//           ) : (
//             <>
//               <div
//                 className="bg-white border-b border-gray-200 flex items-center justify-between shadow-sm z-10"
//                 style={{ padding: "16px 24px", flexShrink: 0 }}
//               >
//                 <div className="flex items-center" style={{ gap: "12px" }}>
//                   <button
//                     onClick={() => setShowInboxOnMobile(true)}
//                     className="md:hidden text-gray-500 hover:text-gray-800"
//                     style={{ padding: "8px", marginLeft: "-8px" }}
//                   >
//                     <ArrowLeft size={20} />
//                   </button>

//                   <Avatar
//                     name={activeRoom.merchant?.storeName}
//                     role="merchant"
//                   />
//                   <div className="min-w-0">
//                     <h2
//                       className="text-gray-900 font-bold flex items-center truncate"
//                       style={{
//                         fontSize: "16px",
//                         gap: "8px",
//                         margin: "0 0 2px 0",
//                       }}
//                     >
//                       <span className="truncate">
//                         {activeRoom.merchant?.storeName || "Unknown Store"}
//                       </span>
//                       {activeRoom.isBlacklisted && (
//                         <ShieldAlert
//                           size={16}
//                           className="text-red-500 flex-shrink-0"
//                         />
//                       )}
//                     </h2>
//                     <p
//                       className="text-gray-500 flex items-center"
//                       style={{ fontSize: "12px", gap: "8px" }}
//                     >
//                       <span
//                         className="font-mono bg-gray-100 rounded-sm"
//                         style={{ padding: "2px 6px" }}
//                       >
//                         ID: {activeRoom.merchant?.merchantId}
//                       </span>
//                       <span className="hidden md:inline">•</span>
//                       <span
//                         className={`${activeRoom.isMerchantOnline ? "text-emerald-600 font-bold" : "text-gray-400"} hidden md:inline`}
//                       >
//                         {activeRoom.isMerchantOnline ? "Online Now" : "Offline"}
//                       </span>
//                     </p>
//                   </div>
//                 </div>

//                 <div className="flex items-center" style={{ gap: "8px" }}>
//                   {activeRoom.status === "waiting" && (
//                     <button
//                       onClick={() => assignMutation.mutate(activeRoom.roomId)}
//                       disabled={assignMutation.isPending}
//                       className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-sm font-bold transition-colors shadow-sm disabled:opacity-50 flex items-center whitespace-nowrap"
//                       style={{
//                         padding: "8px 16px",
//                         fontSize: "12px",
//                         gap: "6px",
//                       }}
//                     >
//                       <CheckCircle2 size={16} />{" "}
//                       <span className="hidden sm:inline">Claim Ticket</span>
//                       <span className="sm:hidden">Claim</span>
//                     </button>
//                   )}
//                   {activeRoom.status === "active" && (
//                     <button
//                       onClick={() => {
//                         if (window.confirm("Close this ticket?"))
//                           closeMutation.mutate(activeRoom.roomId);
//                       }}
//                       disabled={closeMutation.isPending}
//                       className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-sm font-bold transition-colors shadow-sm disabled:opacity-50 flex items-center whitespace-nowrap"
//                       style={{
//                         padding: "8px 16px",
//                         fontSize: "12px",
//                         gap: "6px",
//                       }}
//                     >
//                       <X size={16} />{" "}
//                       <span className="hidden sm:inline">Close Ticket</span>
//                       <span className="sm:hidden">Close</span>
//                     </button>
//                   )}
//                   {activeRoom.status === "closed" && (
//                     <button
//                       onClick={() => assignMutation.mutate(activeRoom.roomId)}
//                       disabled={assignMutation.isPending}
//                       className="bg-blue-500 hover:bg-blue-600 text-white rounded-sm font-bold transition-colors shadow-sm disabled:opacity-50 flex items-center whitespace-nowrap"
//                       style={{
//                         padding: "8px 16px",
//                         fontSize: "12px",
//                         gap: "6px",
//                       }}
//                     >
//                       <RefreshCcw size={16} />{" "}
//                       <span className="hidden sm:inline">Reopen Ticket</span>
//                       <span className="sm:hidden">Reopen</span>
//                     </button>
//                   )}
//                   {isSuperAdmin && (
//                     <button
//                       onClick={() => {
//                         const msg = activeRoom.isBlacklisted
//                           ? "Unblock merchant?"
//                           : "Block merchant from chat?";
//                         if (window.confirm(msg))
//                           blacklistMutation.mutate(activeRoom.roomId);
//                       }}
//                       disabled={blacklistMutation.isPending}
//                       className={`${activeRoom.isBlacklisted ? "bg-amber-500 hover:bg-amber-600" : "bg-red-500 hover:bg-red-600"} text-white rounded-sm font-bold transition-colors shadow-sm disabled:opacity-50 flex items-center whitespace-nowrap`}
//                       style={{
//                         padding: "8px 16px",
//                         fontSize: "12px",
//                         gap: "6px",
//                       }}
//                     >
//                       <UserX size={16} />{" "}
//                       <span className="hidden sm:inline">
//                         {activeRoom.isBlacklisted ? "Unblock" : "Block"}
//                       </span>
//                     </button>
//                   )}
//                 </div>
//               </div>

//               <div
//                 className="bg-slate-50 flex flex-col custom-scrollbar"
//                 style={{
//                   flex: 1,
//                   overflowY: "auto",
//                   padding: "24px",
//                   gap: "24px",
//                 }}
//               >
//                 {historyQuery.isLoading ? (
//                   <div
//                     className="flex items-center justify-center"
//                     style={{ padding: "48px" }}
//                   >
//                     <Loader2 size={24} className="text-teal-500 animate-spin" />
//                   </div>
//                 ) : messages.length === 0 ? (
//                   <div className="text-center" style={{ padding: "48px" }}>
//                     <span
//                       className="bg-white border border-gray-200 rounded-full color-gray-600 font-bold shadow-sm"
//                       style={{ padding: "8px 16px", fontSize: "13px" }}
//                     >
//                       No messages in this ticket yet.
//                     </span>
//                   </div>
//                 ) : (
//                   messages.map((msg, i) => {
//                     const isAdmin = msg.senderRole !== "merchant";
//                     return (
//                       <div
//                         key={msg._id || i}
//                         className={`flex items-end w-full ${isAdmin ? "justify-end" : "justify-start"}`}
//                         style={{ gap: "12px" }}
//                       >
//                         {!isAdmin && (
//                           <Avatar name={msg.senderName} role={msg.senderRole} />
//                         )}
//                         <div
//                           className={`flex flex-col ${isAdmin ? "items-end" : "items-start"}`}
//                           style={{ gap: "4px", maxWidth: "75%" }}
//                         >
//                           <span
//                             className="text-gray-400 font-bold uppercase tracking-wider"
//                             style={{ fontSize: "10px", padding: "0 4px" }}
//                           >
//                             {isAdmin ? "You" : "Merchant"}
//                           </span>
//                           {msg.messageType === "image" ? (
//                             <img
//                               src={msg.imageUrl}
//                               alt="attachment"
//                               className="rounded-sm border border-gray-200 cursor-pointer hover:opacity-90 shadow-sm"
//                               style={{ maxWidth: "300px" }}
//                               onClick={() =>
//                                 window.open(msg.imageUrl, "_blank")
//                               }
//                             />
//                           ) : (
//                             <div
//                               className={`leading-relaxed shadow-sm ${isAdmin ? "bg-slate-900 text-white rounded-l-lg rounded-tr-lg" : "bg-white border border-gray-200 text-gray-800 rounded-r-lg rounded-tl-lg"}`}
//                               style={{
//                                 padding: "12px 20px",
//                                 fontSize: "14px",
//                                 wordBreak: "break-word",
//                               }}
//                             >
//                               {msg.message}
//                             </div>
//                           )}
//                           <div
//                             className={`flex items-center ${isAdmin ? "flex-row-reverse" : ""}`}
//                             style={{
//                               gap: "6px",
//                               padding: "0 4px",
//                               marginTop: "2px",
//                             }}
//                           >
//                             <span
//                               className="text-gray-400 font-medium"
//                               style={{ fontSize: "11px" }}
//                             >
//                               {new Date(msg.createdAt).toLocaleTimeString([], {
//                                 hour: "2-digit",
//                                 minute: "2-digit",
//                               })}
//                             </span>
//                             {isAdmin && (
//                               <span
//                                 className={`font-bold ${msg.isRead ? "text-teal-500" : "text-gray-300"}`}
//                                 style={{ fontSize: "11px" }}
//                               >
//                                 {msg.isRead ? "Read" : "Sent"}
//                               </span>
//                             )}
//                           </div>
//                         </div>
//                         {isAdmin && (
//                           <div className="hidden md:block">
//                             <Avatar
//                               name={msg.senderName}
//                               role={msg.senderRole}
//                             />
//                           </div>
//                         )}
//                       </div>
//                     );
//                   })
//                 )}
//                 {merchantTyping && (
//                   <div
//                     className="flex items-end justify-start w-full"
//                     style={{ gap: "12px" }}
//                   >
//                     <Avatar
//                       name={activeRoom.merchant?.storeName}
//                       role="merchant"
//                     />
//                     <div
//                       className="bg-white border border-gray-200 rounded-r-lg rounded-tl-lg flex items-center shadow-sm"
//                       style={{ padding: "16px 20px", gap: "6px" }}
//                     >
//                       <div
//                         className="rounded-full bg-gray-400 animate-bounce"
//                         style={{
//                           width: "8px",
//                           height: "8px",
//                           animationDelay: "0ms",
//                         }}
//                       />
//                       <div
//                         className="rounded-full bg-gray-400 animate-bounce"
//                         style={{
//                           width: "8px",
//                           height: "8px",
//                           animationDelay: "150ms",
//                         }}
//                       />
//                       <div
//                         className="rounded-full bg-gray-400 animate-bounce"
//                         style={{
//                           width: "8px",
//                           height: "8px",
//                           animationDelay: "300ms",
//                         }}
//                       />
//                     </div>
//                   </div>
//                 )}
//                 <div ref={messagesEndRef} style={{ height: "1px" }} />
//               </div>

//               <div
//                 className="bg-white border-t border-gray-200 z-10"
//                 style={{ padding: "20px 24px", flexShrink: 0 }}
//               >
//                 {activeRoom.status === "closed" ? (
//                   <div
//                     className="bg-gray-50 border border-gray-200 rounded-sm text-center text-gray-500 font-bold"
//                     style={{ padding: "16px", fontSize: "14px" }}
//                   >
//                     This ticket is closed. Click "Reopen Ticket" above to send
//                     messages.
//                   </div>
//                 ) : (
//                   <div className="flex flex-col" style={{ gap: "12px" }}>
//                     <div
//                       className="flex overflow-x-auto custom-scrollbar"
//                       style={{ gap: "8px", paddingBottom: "8px" }}
//                     >
//                       {[
//                         "Hello! How can I help you today?",
//                         "Please wait a moment while I check on this.",
//                         "Issue resolved. Let me know if you need anything else.",
//                         "Please upload a screenshot of your transaction.",
//                       ].map((q) => (
//                         <button
//                           key={q}
//                           onClick={() => setNewMessage(q)}
//                           className="bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-sm font-bold transition-colors whitespace-nowrap flex-shrink-0"
//                           style={{ padding: "6px 16px", fontSize: "12px" }}
//                         >
//                           {q}
//                         </button>
//                       ))}
//                     </div>

//                     <div
//                       className="flex items-end relative"
//                       style={{ gap: "12px" }}
//                     >
//                       <textarea
//                         ref={inputRef}
//                         value={newMessage}
//                         onChange={handleInput}
//                         onKeyDown={handleKey}
//                         placeholder="Type your message here... (Press Enter to send)"
//                         className="flex-1 bg-white border border-gray-300 rounded-sm text-gray-800 outline-none focus:border-teal-500 transition-all resize-none shadow-inner w-full"
//                         style={{
//                           padding: "16px",
//                           paddingRight: "130px",
//                           fontSize: "14px",
//                         }}
//                         rows={2}
//                       />

//                       <div
//                         className="absolute flex items-center"
//                         style={{ bottom: "12px", right: "12px", gap: "8px" }}
//                       >
//                         <input
//                           type="file"
//                           ref={fileRef}
//                           accept="image/*"
//                           className="hidden"
//                           onChange={handleImage}
//                         />
//                         <button
//                           onClick={() => fileRef.current?.click()}
//                           disabled={uploading}
//                           title="Upload Image"
//                           className="rounded-sm bg-gray-100 hover:bg-gray-200 border border-gray-200 text-gray-600 flex items-center justify-center transition-colors"
//                           style={{ width: "40px", height: "40px" }}
//                         >
//                           {uploading ? (
//                             <Loader2 size={20} className="animate-spin" />
//                           ) : (
//                             <ImageIcon size={20} />
//                           )}
//                         </button>
//                         <button
//                           onClick={sendMessage}
//                           disabled={!newMessage.trim()}
//                           className="rounded-sm bg-teal-500 hover:bg-teal-600 text-white border-none font-bold flex items-center cursor-pointer transition-colors shadow-sm disabled:opacity-50"
//                           style={{
//                             padding: "0 24px",
//                             height: "40px",
//                             fontSize: "14px",
//                             gap: "8px",
//                           }}
//                         >
//                           <Send size={16} />{" "}
//                           <span className="hidden sm:inline">Send</span>
//                         </button>
//                       </div>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

///////////////////// =================== latest version (by claud io) ========================== ////////////////

import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { io } from "socket.io-client";
import API from "../../api/axios";

// ── Icons ─────────────────────────────────────────────────────
import {
  Send,
  Image as ImageIcon,
  CheckCircle2,
  ShieldAlert,
  Zap,
  X,
  UserX,
  Loader2,
  MessageSquare,
  Clock,
  ArrowLeft,
  RefreshCcw,
} from "lucide-react";

// ── Avatar Component ──────────────────────────────────────────
const Avatar = ({ name, role }) => {
  const isSupport = role !== "merchant";
  return (
    <div
      className="shadow-sm"
      style={{
        width: "40px",
        height: "40px",
        borderRadius: "4px",
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        fontWeight: "bold",
        fontSize: "14px",
        backgroundColor: isSupport ? "#0f172a" : "#14b8a6",
      }}
    >
      {name?.[0]?.toUpperCase() || "?"}
    </div>
  );
};

// ── Status Badge Component ────────────────────────────────────
const StatusBadge = ({ status }) => {
  const map = {
    waiting: {
      bg: "#fffbeb",
      text: "#d97706",
      border: "#fde68a",
      label: "Waiting",
    },
    active: {
      bg: "#ecfdf5",
      text: "#059669",
      border: "#a7f3d0",
      label: "Active",
    },
    closed: {
      bg: "#f3f4f6",
      text: "#6b7280",
      border: "#e5e7eb",
      label: "Closed",
    },
  };
  const s = map[status] || map.waiting;
  return (
    <span
      style={{
        padding: "2px 8px",
        borderRadius: "4px",
        fontSize: "10px",
        fontWeight: "bold",
        border: `1px solid ${s.border}`,
        backgroundColor: s.bg,
        color: s.text,
      }}
    >
      {s.label}
    </span>
  );
};

export default function AdminChat() {
  const queryClient = useQueryClient();
  const { user } = useSelector((s) => s.auth);
  const isSuperAdmin = user?.role === "superAdmin";

  // ── State ──────────────────────────────────────────────────
  const [activeRoom, setActiveRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [merchantTyping, setMerchantTyping] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [inboxTab, setInboxTab] = useState("all");
  const [showInboxOnMobile, setShowInboxOnMobile] = useState(true);

  const messagesEndRef = useRef(null);
  const typingTimeout = useRef(null);
  const fileRef = useRef(null);
  const inputRef = useRef(null);
  const socketRef = useRef(null);
  const activeRoomRef = useRef(null);
  const roomsRef = useRef([]);

  useEffect(() => {
    activeRoomRef.current = activeRoom;
  }, [activeRoom]);

  // ── FETCH: Rooms ───────────────────────────────────────────
  const roomsQuery = useQuery({
    queryKey: ["adminChatRooms", inboxTab],
    queryFn: async () => {
      if (inboxTab === "blacklist") {
        const { data } = await API.get("/chat/rooms/blacklist");
        return data;
      }
      if (inboxTab === "waiting") {
        const { data } = await API.get("/chat/rooms/unclaimed");
        return data;
      }
      const params = new URLSearchParams({ limit: 50 });
      if (inboxTab !== "all") params.set("status", inboxTab);
      const { data } = await API.get(`/chat/rooms?${params}`);
      return data;
    },
    refetchInterval: 30000,
  });

  const rooms = roomsQuery.data?.rooms || [];

  // ── FETCH: Message History ─────────────────────────────────
  const historyQuery = useQuery({
    queryKey: ["adminChatMessages", activeRoom?.roomId],
    queryFn: async () => {
      const { data } = await API.get(`/chat/messages/${activeRoom.roomId}`);
      return data;
    },
    enabled: !!activeRoom?.roomId,
  });

  useEffect(() => {
    if (historyQuery.data?.messages) setMessages(historyQuery.data.messages);
  }, [historyQuery.data]);

  // ── MUTATIONS ───────────────────────────────────────────────
  const assignMutation = useMutation({
    mutationFn: (roomId) => API.put(`/chat/rooms/${roomId}/assign`),
    onSuccess: () => {
      queryClient.invalidateQueries(["adminChatRooms"]);
      setActiveRoom((r) =>
        r
          ? {
              ...r,
              status: "active",
              assignedAgent: { username: user.username },
            }
          : r,
      );
      toast.success("You claimed this chat");
    },
  });

  const closeMutation = useMutation({
    mutationFn: (roomId) => API.put(`/chat/rooms/${roomId}/close`),
    onSuccess: () => {
      toast.success("Chat closed");
      queryClient.invalidateQueries(["adminChatRooms"]);
      setActiveRoom((r) => (r ? { ...r, status: "closed" } : r));
    },
  });

  const blacklistMutation = useMutation({
    mutationFn: (roomId) => API.put(`/chat/rooms/${roomId}/blacklist`),
    onSuccess: (res) => {
      toast.success(res.data.message);
      queryClient.invalidateQueries(["adminChatRooms"]);
      setActiveRoom((r) =>
        r
          ? { ...r, isBlacklisted: res.data.isBlacklisted, status: "closed" }
          : r,
      );
    },
  });

  const markReadMutation = useMutation({
    mutationFn: (roomId) => API.put(`/chat/rooms/${roomId}/read`),
    onSuccess: () => queryClient.invalidateQueries(["adminChatRooms"]),
  });

  // FIX: was API.put — correct method is POST
  const autoAssignMutation = useMutation({
    mutationFn: () => API.post("/chat/rooms/auto-assign"),
    onSuccess: (res) => {
      toast.success(res.data.message);
      queryClient.invalidateQueries(["adminChatRooms"]);
    },
  });

  // ── Socket Setup ─────────────────────────────────────────
  useEffect(() => {
    const socket = io(
      import.meta.env.VITE_SOCKET_URL || "http://localhost:5000",
    );
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("agent_online", { userId: user._id, role: user.role });
      // Re-join all known rooms after reconnect
      roomsRef.current.forEach((r) =>
        socket.emit("join_room", { roomId: r.roomId }),
      );
    });

    // ── FIX: new_message handler ──────────────────────────────────────────
    // The server now broadcasts the DB-saved message to io.to(roomId).
    // This means both admin and merchant get the exact same event.
    // We only need to handle it here on the admin side.
    socket.on("new_message", (msg) => {
      // Show toast notification when merchant sends a message to a non-active room
      if (msg.senderRole === "merchant") {
        const matchingRoom = roomsRef.current.find(
          (r) => r.roomId === msg.roomId,
        );
        const name =
          matchingRoom?.merchant?.storeName || msg.senderName || "Merchant";
        if (msg.roomId !== activeRoomRef.current?.roomId) {
          toast.info(`💬 New message from ${name}`);
        }
      }

      // Append message if this room is currently open
      if (msg.roomId === activeRoomRef.current?.roomId) {
        setMessages((prev) => {
          // Deduplicate: avoid double-render for the optimistic message we added locally
          // Match by _id (real DB id) OR by temp id stored before save
          if (prev.find((m) => m._id === msg._id)) return prev;
          // Also replace any temp message (temp ids are Date.now() strings ~13 digits)
          // with the real saved version by matching roomId + message + senderRole within ~2s
          const isTempMatch = prev.find(
            (m) =>
              String(m._id).length === 13 &&
              m.roomId === msg.roomId &&
              m.senderRole === msg.senderRole &&
              m.message === msg.message,
          );
          if (isTempMatch) {
            return prev.map((m) => (m._id === isTempMatch._id ? msg : m));
          }
          return [...prev, msg];
        });
        markReadMutation.mutate(msg.roomId);
        // Emit socket event so merchant side sees "Read" tick
        socket.emit("messages_read", {
          roomId: msg.roomId,
          readerRole: user.role,
        });
        setTimeout(
          () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }),
          100,
        );
      }

      // Always refresh the room list so lastMessage / unreadCount updates
      queryClient.invalidateQueries(["adminChatRooms"]);
    });

    // FIX: new_merchant_message — for admins NOT currently in that room
    // (e.g. on another page or another tab is open)
    socket.on("new_merchant_message", ({ roomId, senderName, message }) => {
      // Only show extra notification if NOT already shown by new_message above
      // (new_message fires first since we're joined to the room)
      // This handles the case where the admin is NOT in the room socket channel
      const inRoom = roomsRef.current.find((r) => r.roomId === roomId);
      if (!inRoom) {
        toast.info(`💬 New message from ${senderName || "Merchant"}`);
        queryClient.invalidateQueries(["adminChatRooms"]);
      }
    });

    socket.on("typing_indicator", ({ isTyping, role }) => {
      // Only show typing bubble if it's the merchant typing
      if (role === "merchant") setMerchantTyping(isTyping);
    });

    socket.on("messages_read", ({ roomId }) => {
      if (roomId === activeRoomRef.current?.roomId) {
        setMessages((prev) =>
          prev.map((m) =>
            m.senderRole !== "merchant" ? { ...m, isRead: true } : m,
          ),
        );
      }
    });

    socket.on("user_online", ({ userId }) => {
      setActiveRoom((r) =>
        r?.merchantUser?._id === userId ? { ...r, isMerchantOnline: true } : r,
      );
      queryClient.setQueryData(["adminChatRooms", inboxTab], (old) => {
        if (!old) return old;
        return {
          ...old,
          rooms: old.rooms.map((r) =>
            r.merchantUser?._id === userId
              ? { ...r, isMerchantOnline: true }
              : r,
          ),
        };
      });
    });

    socket.on("user_offline", ({ userId }) => {
      setActiveRoom((r) =>
        r?.merchantUser?._id === userId ? { ...r, isMerchantOnline: false } : r,
      );
      queryClient.setQueryData(["adminChatRooms", inboxTab], (old) => {
        if (!old) return old;
        return {
          ...old,
          rooms: old.rooms.map((r) =>
            r.merchantUser?._id === userId
              ? { ...r, isMerchantOnline: false }
              : r,
          ),
        };
      });
    });

    socket.on("auto_assigned", ({ count }) => {
      if (count > 0) toast.info(`${count} chat(s) auto-assigned to you`);
      queryClient.invalidateQueries(["adminChatRooms"]);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user._id, user.role, queryClient, inboxTab]); // removed markReadMutation from deps to avoid re-connect loop

  // Keep ref synced and join new rooms automatically
  useEffect(() => {
    roomsRef.current = rooms;
    if (socketRef.current && socketRef.current.connected) {
      rooms.forEach((r) =>
        socketRef.current.emit("join_room", { roomId: r.roomId }),
      );
    }
  }, [rooms]);

  const openRoom = useCallback(
    (room) => {
      setActiveRoom(room);
      setMessages([]);
      setMerchantTyping(false);
      setShowInboxOnMobile(false);
      markReadMutation.mutate(room.roomId);
      // Join this room's socket channel immediately
      if (socketRef.current?.connected) {
        socketRef.current.emit("join_room", { roomId: room.roomId });
      }
    },
    [markReadMutation],
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, merchantTyping]);

  const sendMessage = () => {
    if (!newMessage.trim() || !socketRef.current || !activeRoom) return;

    const tempMsg = {
      _id: Date.now().toString(), // temp id — replaced by DB id from new_message broadcast
      roomId: activeRoom.roomId,
      message: newMessage.trim(),
      messageType: "text",
      senderRole: user.role,
      senderName: user.username,
      // FIX: include sender id so backend can persist correctly
      sender: user._id,
      senderId: user._id,
      senderAvatar: user.avatar || "",
      createdAt: new Date().toISOString(),
    };

    // Optimistic render
    setMessages((prev) => [...prev, tempMsg]);
    scrollToBottom();

    socketRef.current.emit("send_message", tempMsg);
    setNewMessage("");
    clearTimeout(typingTimeout.current);
    socketRef.current.emit("typing", {
      roomId: activeRoom.roomId,
      isTyping: false,
      role: user.role,
    });
    inputRef.current?.focus();
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleInput = (e) => {
    setNewMessage(e.target.value);
    if (!socketRef.current || !activeRoom) return;
    socketRef.current.emit("typing", {
      roomId: activeRoom.roomId,
      isTyping: true,
      role: user.role,
    });
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socketRef.current?.emit("typing", {
        roomId: activeRoom.roomId,
        isTyping: false,
        role: user.role,
      });
    }, 2000);
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleImage = async (e) => {
    const file = e.target.files[0];
    if (!file || !socketRef.current || !activeRoom) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const { data } = await API.post("/upload/single?folder=chat", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const imgMsg = {
        _id: Date.now().toString(),
        roomId: activeRoom.roomId,
        message: "",
        messageType: "image",
        imageUrl: data.url,
        senderRole: user.role,
        senderName: user.username,
        sender: user._id,
        senderId: user._id,
        senderAvatar: user.avatar || "",
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, imgMsg]);
      scrollToBottom();
      socketRef.current.emit("send_message", imgMsg);
    } catch {
      toast.error("Image upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  // ── RENDER (unchanged from original) ──────────────────────
  return (
    <div
      className="bg-gray-50 flex flex-col w-full overflow-hidden"
      style={{
        padding: "20px",
        height: "calc(100vh - 64px)",
        minHeight: "600px",
      }}
    >
      {/* ── HEADER ── */}
      <div style={{ marginBottom: "16px", flexShrink: 0 }}>
        <h1
          className="font-bold text-gray-800"
          style={{ fontSize: "20px", margin: 0 }}
        >
          Customer Service
        </h1>
        <p
          className="text-gray-500"
          style={{ fontSize: "13px", marginTop: "4px" }}
        >
          Respond to merchant inquiries and resolve platform issues in
          real-time.
        </p>
      </div>

      {/* ── MAIN CHAT CONTAINER ── */}
      <div
        className="bg-white border border-gray-200 rounded-sm shadow-sm relative flex"
        style={{ flex: 1, overflow: "hidden" }}
      >
        {/* ══════════ LEFT — Inbox Sidebar ══════════ */}
        <div
          className={`flex-col border-r border-gray-200 bg-gray-50 z-20 transition-transform duration-300 absolute md:relative ${showInboxOnMobile ? "flex translate-x-0 w-full" : "hidden md:flex -translate-x-full md:translate-x-0"}`}
          style={{
            width: showInboxOnMobile ? "100%" : "340px",
            flexShrink: 0,
            height: "100%",
          }}
        >
          <div
            className="border-b border-gray-200 bg-white"
            style={{ padding: "16px", flexShrink: 0 }}
          >
            <div
              className="flex items-center justify-between"
              style={{ marginBottom: "16px" }}
            >
              <h2
                className="font-bold text-gray-800"
                style={{ fontSize: "14px" }}
              >
                Active Tickets ({rooms.length})
              </h2>
              <button
                onClick={() => autoAssignMutation.mutate()}
                disabled={autoAssignMutation.isPending}
                title="Auto-claim all waiting chats"
                className="bg-slate-800 hover:bg-slate-900 text-white rounded-sm transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center"
                style={{ width: "32px", height: "32px" }}
              >
                <Zap size={16} />
              </button>
            </div>

            <div
              className="flex overflow-x-auto custom-scrollbar"
              style={{ gap: "8px", paddingBottom: "4px" }}
            >
              {[
                { key: "all", label: "All" },
                { key: "waiting", label: "New" },
                { key: "active", label: "Live" },
                { key: "closed", label: "Done" },
                ...(isSuperAdmin
                  ? [{ key: "blacklist", label: "Blocked" }]
                  : []),
              ].map((f) => (
                <button
                  key={f.key}
                  onClick={() => setInboxTab(f.key)}
                  className={`rounded-sm font-bold transition-colors whitespace-nowrap border ${inboxTab === f.key ? "bg-teal-500 text-white border-teal-500 shadow-sm" : "bg-gray-100 text-gray-600 border-transparent hover:bg-gray-200"}`}
                  style={{ padding: "6px 12px", fontSize: "11px" }}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div
            className="bg-white custom-scrollbar"
            style={{ flex: 1, overflowY: "auto" }}
          >
            {roomsQuery.isLoading ? (
              <div
                className="flex items-center justify-center"
                style={{ padding: "48px" }}
              >
                <Loader2 size={24} className="text-teal-500 animate-spin" />
              </div>
            ) : rooms.length === 0 ? (
              <div className="text-center" style={{ padding: "64px 16px" }}>
                <MessageSquare
                  size={40}
                  className="text-gray-300 mx-auto"
                  style={{ marginBottom: "12px" }}
                />
                <p
                  className="text-gray-500 font-bold"
                  style={{ fontSize: "13px" }}
                >
                  No active conversations
                </p>
              </div>
            ) : (
              rooms.map((room) => {
                const isSelected = activeRoom?.roomId === room.roomId;
                return (
                  <button
                    key={room._id}
                    onClick={() => openRoom(room)}
                    className={`w-full flex items-start text-left transition-colors border-b border-gray-100 ${isSelected ? "bg-teal-50/50" : "hover:bg-gray-50"}`}
                    style={{
                      padding: "16px",
                      gap: "12px",
                      borderLeft: `4px solid ${isSelected ? "#14b8a6" : "transparent"}`,
                    }}
                  >
                    <div className="relative flex-shrink-0">
                      <Avatar name={room.merchant?.storeName} role="merchant" />
                      {room.isMerchantOnline && (
                        <div
                          className="absolute rounded-full bg-emerald-500 border-2 border-white"
                          style={{
                            bottom: "-4px",
                            right: "-4px",
                            width: "14px",
                            height: "14px",
                          }}
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div
                        className="flex items-center justify-between"
                        style={{ marginBottom: "4px" }}
                      >
                        <p
                          className="text-gray-800 font-bold truncate"
                          style={{ fontSize: "13px", paddingRight: "8px" }}
                        >
                          {room.merchant?.storeName || "Unknown Store"}
                        </p>
                        <StatusBadge status={room.status} />
                      </div>
                      <p
                        className="text-gray-500 truncate"
                        style={{ fontSize: "12px", marginBottom: "8px" }}
                      >
                        {room.lastMessage || "Started a new conversation..."}
                      </p>
                      <div className="flex items-center justify-between">
                        <p
                          className="text-gray-400 flex items-center"
                          style={{ fontSize: "10px", gap: "4px" }}
                        >
                          <Clock size={12} />
                          {room.lastMessageTime
                            ? new Date(room.lastMessageTime).toLocaleTimeString(
                                [],
                                { hour: "2-digit", minute: "2-digit" },
                              )
                            : "—"}
                        </p>
                        {room.unreadCount > 0 && (
                          <span
                            className="rounded-full bg-red-500 text-white font-bold flex items-center justify-center"
                            style={{
                              width: "18px",
                              height: "18px",
                              fontSize: "10px",
                            }}
                          >
                            {room.unreadCount > 9 ? "9+" : room.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* ══════════ RIGHT — Conversation Window ══════════ */}
        <div
          className={`flex-col bg-white min-w-0 relative z-10 w-full h-full ${!showInboxOnMobile && activeRoom ? "flex" : "hidden md:flex"}`}
          style={{ flex: 1 }}
        >
          {!activeRoom ? (
            <div
              className="flex-col items-center justify-center bg-gray-50/50 text-center"
              style={{ flex: 1, display: "flex", padding: "24px" }}
            >
              <MessageSquare
                size={64}
                className="text-gray-200"
                style={{ marginBottom: "16px" }}
              />
              <p
                className="text-gray-600 font-bold"
                style={{ fontSize: "16px" }}
              >
                Select a conversation
              </p>
              <p
                className="text-gray-400"
                style={{ fontSize: "14px", marginTop: "8px" }}
              >
                Choose a ticket from the left panel to begin support.
              </p>
            </div>
          ) : (
            <>
              <div
                className="bg-white border-b border-gray-200 flex items-center justify-between shadow-sm z-10"
                style={{ padding: "16px 24px", flexShrink: 0 }}
              >
                <div className="flex items-center" style={{ gap: "12px" }}>
                  <button
                    onClick={() => setShowInboxOnMobile(true)}
                    className="md:hidden text-gray-500 hover:text-gray-800"
                    style={{ padding: "8px", marginLeft: "-8px" }}
                  >
                    <ArrowLeft size={20} />
                  </button>

                  <Avatar
                    name={activeRoom.merchant?.storeName}
                    role="merchant"
                  />
                  <div className="min-w-0">
                    <h2
                      className="text-gray-900 font-bold flex items-center truncate"
                      style={{
                        fontSize: "16px",
                        gap: "8px",
                        margin: "0 0 2px 0",
                      }}
                    >
                      <span className="truncate">
                        {activeRoom.merchant?.storeName || "Unknown Store"}
                      </span>
                      {activeRoom.isBlacklisted && (
                        <ShieldAlert
                          size={16}
                          className="text-red-500 flex-shrink-0"
                        />
                      )}
                    </h2>
                    <p
                      className="text-gray-500 flex items-center"
                      style={{ fontSize: "12px", gap: "8px" }}
                    >
                      <span
                        className="font-mono bg-gray-100 rounded-sm"
                        style={{ padding: "2px 6px" }}
                      >
                        ID: {activeRoom.merchant?.merchantId}
                      </span>
                      <span className="hidden md:inline">•</span>
                      <span
                        className={`${activeRoom.isMerchantOnline ? "text-emerald-600 font-bold" : "text-gray-400"} hidden md:inline`}
                      >
                        {activeRoom.isMerchantOnline ? "Online Now" : "Offline"}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center" style={{ gap: "8px" }}>
                  {activeRoom.status === "waiting" && (
                    <button
                      onClick={() => assignMutation.mutate(activeRoom.roomId)}
                      disabled={assignMutation.isPending}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-sm font-bold transition-colors shadow-sm disabled:opacity-50 flex items-center whitespace-nowrap"
                      style={{
                        padding: "8px 16px",
                        fontSize: "12px",
                        gap: "6px",
                      }}
                    >
                      <CheckCircle2 size={16} />
                      <span className="hidden sm:inline">Claim Ticket</span>
                      <span className="sm:hidden">Claim</span>
                    </button>
                  )}
                  {activeRoom.status === "active" && (
                    <button
                      onClick={() => {
                        if (window.confirm("Close this ticket?"))
                          closeMutation.mutate(activeRoom.roomId);
                      }}
                      disabled={closeMutation.isPending}
                      className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-sm font-bold transition-colors shadow-sm disabled:opacity-50 flex items-center whitespace-nowrap"
                      style={{
                        padding: "8px 16px",
                        fontSize: "12px",
                        gap: "6px",
                      }}
                    >
                      <X size={16} />
                      <span className="hidden sm:inline">Close Ticket</span>
                      <span className="sm:hidden">Close</span>
                    </button>
                  )}
                  {activeRoom.status === "closed" && (
                    <button
                      onClick={() => assignMutation.mutate(activeRoom.roomId)}
                      disabled={assignMutation.isPending}
                      className="bg-blue-500 hover:bg-blue-600 text-white rounded-sm font-bold transition-colors shadow-sm disabled:opacity-50 flex items-center whitespace-nowrap"
                      style={{
                        padding: "8px 16px",
                        fontSize: "12px",
                        gap: "6px",
                      }}
                    >
                      <RefreshCcw size={16} />
                      <span className="hidden sm:inline">Reopen Ticket</span>
                      <span className="sm:hidden">Reopen</span>
                    </button>
                  )}
                  {isSuperAdmin && (
                    <button
                      onClick={() => {
                        const msg = activeRoom.isBlacklisted
                          ? "Unblock merchant?"
                          : "Block merchant from chat?";
                        if (window.confirm(msg))
                          blacklistMutation.mutate(activeRoom.roomId);
                      }}
                      disabled={blacklistMutation.isPending}
                      className={`${activeRoom.isBlacklisted ? "bg-amber-500 hover:bg-amber-600" : "bg-red-500 hover:bg-red-600"} text-white rounded-sm font-bold transition-colors shadow-sm disabled:opacity-50 flex items-center whitespace-nowrap`}
                      style={{
                        padding: "8px 16px",
                        fontSize: "12px",
                        gap: "6px",
                      }}
                    >
                      <UserX size={16} />
                      <span className="hidden sm:inline">
                        {activeRoom.isBlacklisted ? "Unblock" : "Block"}
                      </span>
                    </button>
                  )}
                </div>
              </div>

              <div
                className="bg-slate-50 flex flex-col custom-scrollbar"
                style={{
                  flex: 1,
                  overflowY: "auto",
                  padding: "24px",
                  gap: "24px",
                }}
              >
                {historyQuery.isLoading ? (
                  <div
                    className="flex items-center justify-center"
                    style={{ padding: "48px" }}
                  >
                    <Loader2 size={24} className="text-teal-500 animate-spin" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center" style={{ padding: "48px" }}>
                    <span
                      className="bg-white border border-gray-200 rounded-full color-gray-600 font-bold shadow-sm"
                      style={{ padding: "8px 16px", fontSize: "13px" }}
                    >
                      No messages in this ticket yet.
                    </span>
                  </div>
                ) : (
                  messages.map((msg, i) => {
                    const isAdmin = msg.senderRole !== "merchant";
                    return (
                      <div
                        key={msg._id || i}
                        className={`flex items-end w-full ${isAdmin ? "justify-end" : "justify-start"}`}
                        style={{ gap: "12px" }}
                      >
                        {!isAdmin && (
                          <Avatar name={msg.senderName} role={msg.senderRole} />
                        )}
                        <div
                          className={`flex flex-col ${isAdmin ? "items-end" : "items-start"}`}
                          style={{ gap: "4px", maxWidth: "75%" }}
                        >
                          <span
                            className="text-gray-400 font-bold uppercase tracking-wider"
                            style={{ fontSize: "10px", padding: "0 4px" }}
                          >
                            {isAdmin ? "You" : "Merchant"}
                          </span>
                          {msg.messageType === "image" ? (
                            <img
                              src={msg.imageUrl}
                              alt="attachment"
                              className="rounded-sm border border-gray-200 cursor-pointer hover:opacity-90 shadow-sm"
                              style={{ maxWidth: "300px" }}
                              onClick={() =>
                                window.open(msg.imageUrl, "_blank")
                              }
                            />
                          ) : (
                            <div
                              className={`leading-relaxed shadow-sm ${isAdmin ? "bg-slate-900 text-white rounded-l-lg rounded-tr-lg" : "bg-white border border-gray-200 text-gray-800 rounded-r-lg rounded-tl-lg"}`}
                              style={{
                                padding: "12px 20px",
                                fontSize: "14px",
                                wordBreak: "break-word",
                              }}
                            >
                              {msg.message}
                            </div>
                          )}
                          <div
                            className={`flex items-center ${isAdmin ? "flex-row-reverse" : ""}`}
                            style={{
                              gap: "6px",
                              padding: "0 4px",
                              marginTop: "2px",
                            }}
                          >
                            <span
                              className="text-gray-400 font-medium"
                              style={{ fontSize: "11px" }}
                            >
                              {new Date(msg.createdAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                            {isAdmin && (
                              <span
                                className={`font-bold ${msg.isRead ? "text-teal-500" : "text-gray-300"}`}
                                style={{ fontSize: "11px" }}
                              >
                                {msg.isRead ? "Read" : "Sent"}
                              </span>
                            )}
                          </div>
                        </div>
                        {isAdmin && (
                          <div className="hidden md:block">
                            <Avatar
                              name={msg.senderName}
                              role={msg.senderRole}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
                {merchantTyping && (
                  <div
                    className="flex items-end justify-start w-full"
                    style={{ gap: "12px" }}
                  >
                    <Avatar
                      name={activeRoom.merchant?.storeName}
                      role="merchant"
                    />
                    <div
                      className="bg-white border border-gray-200 rounded-r-lg rounded-tl-lg flex items-center shadow-sm"
                      style={{ padding: "16px 20px", gap: "6px" }}
                    >
                      <div
                        className="rounded-full bg-gray-400 animate-bounce"
                        style={{
                          width: "8px",
                          height: "8px",
                          animationDelay: "0ms",
                        }}
                      />
                      <div
                        className="rounded-full bg-gray-400 animate-bounce"
                        style={{
                          width: "8px",
                          height: "8px",
                          animationDelay: "150ms",
                        }}
                      />
                      <div
                        className="rounded-full bg-gray-400 animate-bounce"
                        style={{
                          width: "8px",
                          height: "8px",
                          animationDelay: "300ms",
                        }}
                      />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} style={{ height: "1px" }} />
              </div>

              <div
                className="bg-white border-t border-gray-200 z-10"
                style={{ padding: "20px 24px", flexShrink: 0 }}
              >
                {activeRoom.status === "closed" ? (
                  <div
                    className="bg-gray-50 border border-gray-200 rounded-sm text-center text-gray-500 font-bold"
                    style={{ padding: "16px", fontSize: "14px" }}
                  >
                    This ticket is closed. Click "Reopen Ticket" above to send
                    messages.
                  </div>
                ) : (
                  <div className="flex flex-col" style={{ gap: "12px" }}>
                    <div
                      className="flex overflow-x-auto custom-scrollbar"
                      style={{ gap: "8px", paddingBottom: "8px" }}
                    >
                      {[
                        "Hello! How can I help you today?",
                        "Please wait a moment while I check on this.",
                        "Issue resolved. Let me know if you need anything else.",
                        "Please upload a screenshot of your transaction.",
                      ].map((q) => (
                        <button
                          key={q}
                          onClick={() => setNewMessage(q)}
                          className="bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-sm font-bold transition-colors whitespace-nowrap flex-shrink-0"
                          style={{ padding: "6px 16px", fontSize: "12px" }}
                        >
                          {q}
                        </button>
                      ))}
                    </div>

                    <div
                      className="flex items-end relative"
                      style={{ gap: "12px" }}
                    >
                      <textarea
                        ref={inputRef}
                        value={newMessage}
                        onChange={handleInput}
                        onKeyDown={handleKey}
                        placeholder="Type your message here... (Press Enter to send)"
                        className="flex-1 bg-white border border-gray-300 rounded-sm text-gray-800 outline-none focus:border-teal-500 transition-all resize-none shadow-inner w-full"
                        style={{
                          padding: "16px",
                          paddingRight: "130px",
                          fontSize: "14px",
                        }}
                        rows={2}
                      />
                      <div
                        className="absolute flex items-center"
                        style={{ bottom: "12px", right: "12px", gap: "8px" }}
                      >
                        <input
                          type="file"
                          ref={fileRef}
                          accept="image/*"
                          className="hidden"
                          onChange={handleImage}
                        />
                        <button
                          onClick={() => fileRef.current?.click()}
                          disabled={uploading}
                          title="Upload Image"
                          className="rounded-sm bg-gray-100 hover:bg-gray-200 border border-gray-200 text-gray-600 flex items-center justify-center transition-colors"
                          style={{ width: "40px", height: "40px" }}
                        >
                          {uploading ? (
                            <Loader2 size={20} className="animate-spin" />
                          ) : (
                            <ImageIcon size={20} />
                          )}
                        </button>
                        <button
                          onClick={sendMessage}
                          disabled={!newMessage.trim()}
                          className="rounded-sm bg-teal-500 hover:bg-teal-600 text-white border-none font-bold flex items-center cursor-pointer transition-colors shadow-sm disabled:opacity-50"
                          style={{
                            padding: "0 24px",
                            height: "40px",
                            fontSize: "14px",
                            gap: "8px",
                          }}
                        >
                          <Send size={16} />
                          <span className="hidden sm:inline">Send</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
