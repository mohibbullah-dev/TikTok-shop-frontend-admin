// frontend-admin/src/pages/merchants/Notices.jsx
//
// VERIFIED BACKEND ENDPOINTS:
// POST   /api/notices         body:{merchantId,type,title,content,userManagement} → superAdmin+merchantAdmin
// GET    /api/notices?merchantId=&page=&limit=  → {notices,total,pages}           → superAdmin+merchantAdmin
// PUT    /api/notices/:id     body: any Notice fields                             → superAdmin+merchantAdmin
// DELETE /api/notices/:id                                                         → superAdmin only
//
// Notice MODEL (exact fields):
//   merchant: { storeName, merchantId }  ← populated
//   type: String (default 'Type 1')
//   userManagement: String (default 'System')
//   title: String (required)
//   content: String
//   sendEmail: Boolean
//   isSeen: Boolean
//   seenAt: Date | null
//   createdAt, updatedAt
//
// sendNotice body → merchantId (the string merchantId OR 24-char _id), type, title, content, userManagement
//
// ROLES:
//   superAdmin    — full CRUD including delete
//   merchantAdmin — can send + view their merchants, NO delete

// import { useState, useEffect } from 'react'
// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
// import { useSelector } from 'react-redux'
// import { toast } from 'react-toastify'
// import API from '../../api/axios'

// // ─── Shared atoms ─────────────────────────────────────────────
// const Modal = ({ open, onClose, title, children, wide }) => {
//   if (!open) return null
//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
//       <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
//       <div
//         className={`relative bg-white rounded-2xl w-full max-h-[90vh] overflow-y-auto
//           ${wide ? 'max-w-2xl' : 'max-w-lg'}`}
//         style={{ boxShadow: '0 25px 60px rgba(0,0,0,0.25)' }}
//       >
//         <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
//           <p className="font-bold text-gray-800 text-sm">{title}</p>
//           <button
//             onClick={onClose}
//             className="w-8 h-8 rounded-xl bg-gray-100 flex items-center
//               justify-center text-gray-400 hover:bg-gray-200 transition-all"
//           >✕</button>
//         </div>
//         <div className="p-6">{children}</div>
//       </div>
//     </div>
//   )
// }

// const Field = ({ label, required, children }) => (
//   <div>
//     <label className="block text-gray-500 text-xs font-semibold mb-1.5">
//       {label}{required && <span className="text-red-400 ml-0.5">*</span>}
//     </label>
//     {children}
//   </div>
// )

// const Input = (props) => (
//   <input
//     className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm
//       text-gray-700 outline-none focus:border-pink-400 bg-gray-50
//       focus:bg-white transition-all"
//     {...props}
//   />
// )

// const Textarea = (props) => (
//   <textarea
//     className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm
//       text-gray-700 outline-none focus:border-pink-400 bg-gray-50
//       focus:bg-white transition-all resize-none"
//     rows={4}
//     {...props}
//   />
// )

// const NOTICE_TYPES = ['Type 1', 'Type 2', 'Type 3', 'System', 'Promotion', 'Warning']

// const EMPTY_FORM = {
//   merchantId: '', type: 'Type 1',
//   title: '', content: '', userManagement: 'System',
// }

// export default function Notices() {
//   const queryClient  = useQueryClient()
//   const { user }     = useSelector(s => s.auth)
//   const isSuperAdmin = user?.role === 'superAdmin'

//   const [page,     setPage]     = useState(1)
//   const [search,   setSearch]   = useState('')
//   const [modal,    setModal]    = useState(null)   // 'send' | 'edit' | 'view'
//   const [form,     setForm]     = useState(EMPTY_FORM)
//   const [editId,   setEditId]   = useState(null)
//   const [viewItem, setViewItem] = useState(null)
//   const limit = 12

//   useEffect(() => setPage(1), [search])

//   // ── Fetch: GET /api/notices?merchantId=&page=&limit= ──────
//   const { data, isLoading, isFetching } = useQuery({
//     queryKey: ['notices', page, search],
//     queryFn: async () => {
//       const params = new URLSearchParams({ page, limit })
//       if (search.trim()) params.set('merchantId', search.trim())
//       const { data } = await API.get(`/notices?${params}`)
//       return data
//     },
//     keepPreviousData: true,
//   })

//   const notices    = data?.notices || []
//   const total      = data?.total   || 0
//   const totalPages = data?.pages   || 1

//   const invalidate = () => queryClient.invalidateQueries(['notices'])

//   // ── Send: POST /api/notices ───────────────────────────────
//   const send = useMutation({
//     mutationFn: (body) => API.post('/notices', body),
//     onSuccess: () => { invalidate(); toast.success('Notice sent! ✅'); closeModal() },
//     onError:   (e) => toast.error(e.response?.data?.message || 'Failed to send'),
//   })

//   // ── Update: PUT /api/notices/:id ─────────────────────────
//   const update = useMutation({
//     mutationFn: ({ id, body }) => API.put(`/notices/${id}`, body),
//     onSuccess: () => { invalidate(); toast.success('Notice updated!'); closeModal() },
//     onError:   (e) => toast.error(e.response?.data?.message || 'Update failed'),
//   })

//   // ── Delete: DELETE /api/notices/:id (superAdmin only) ────
//   const remove = useMutation({
//     mutationFn: (id) => API.delete(`/notices/${id}`),
//     onSuccess: () => { invalidate(); toast.success('Notice deleted') },
//     onError:   (e) => toast.error(e.response?.data?.message || 'Delete failed'),
//   })

//   // ── Modal helpers ─────────────────────────────────────────
//   const openSend = () => { setForm(EMPTY_FORM); setEditId(null); setModal('send') }
//   const openEdit = (n) => {
//     setForm({
//       merchantId:    n.merchant?.merchantId || '',
//       type:          n.type          || 'Type 1',
//       title:         n.title         || '',
//       content:       n.content       || '',
//       userManagement:n.userManagement|| 'System',
//     })
//     setEditId(n._id); setModal('edit')
//   }
//   const openView = (n) => { setViewItem(n); setModal('view') }
//   const closeModal = () => {
//     setModal(null); setEditId(null); setForm(EMPTY_FORM); setViewItem(null)
//   }

//   const setF = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }))

//   const handleSubmit = () => {
//     if (!form.merchantId.trim()) return toast.error('Merchant ID is required')
//     if (!form.title.trim())      return toast.error('Title is required')
//     const body = {
//       merchantId:    form.merchantId.trim(),
//       type:          form.type,
//       title:         form.title.trim(),
//       content:       form.content.trim(),
//       userManagement:form.userManagement.trim() || 'System',
//     }
//     if (modal === 'edit' && editId) update.mutate({ id: editId, body })
//     else send.mutate(body)
//   }

//   const isSaving = send.isPending || update.isPending

//   // Pagination
//   const getPageNums = () => {
//     if (totalPages <= 5) return [...Array(totalPages)].map((_, i) => i + 1)
//     if (page <= 3)              return [1,2,3,4,5]
//     if (page >= totalPages - 2) return [totalPages-4,totalPages-3,totalPages-2,totalPages-1,totalPages]
//     return [page-2,page-1,page,page+1,page+2]
//   }

//   return (
//     <div className="space-y-4">

//       {/* ── Header ── */}
//       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
//         <div>
//           <h1 className="text-xl font-extrabold text-gray-800 tracking-tight">
//             Merchant Notices
//           </h1>
//           <p className="text-gray-400 text-sm mt-0.5">{total} total notices</p>
//         </div>
//         <div className="flex items-center gap-2">
//           <button
//             onClick={invalidate}
//             className="flex items-center gap-2 px-3 py-2.5 rounded-xl border
//               border-gray-200 text-gray-500 hover:bg-gray-50 text-sm transition-all"
//           >
//             <svg className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`}
//               fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
//               <polyline points="23 4 23 10 17 10"/>
//               <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/>
//             </svg>
//           </button>
//           <button
//             onClick={openSend}
//             className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm
//               font-bold text-white transition-all hover:scale-105 active:scale-95"
//             style={{
//               background: 'linear-gradient(135deg,#f02d65,#ff6035)',
//               boxShadow: '0 4px 12px rgba(240,45,101,0.35)',
//             }}
//           >
//             <span className="text-base leading-none">+</span>
//             Send Notice
//           </button>
//         </div>
//       </div>

//       {/* ── Search bar ── */}
//       <div
//         className="bg-white rounded-2xl p-4"
//         style={{ boxShadow: '0 1px 12px rgba(0,0,0,0.07)' }}
//       >
//         <div className="relative max-w-sm">
//           <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
//             fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
//             <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
//           </svg>
//           <input
//             value={search}
//             onChange={e => setSearch(e.target.value)}
//             placeholder="Filter by Merchant ID..."
//             className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200
//               text-sm outline-none focus:border-pink-400 bg-gray-50
//               focus:bg-white transition-all"
//           />
//         </div>
//       </div>

//       {/* ── Loading skeleton ── */}
//       {isLoading && (
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
//           {[...Array(6)].map((_, i) => (
//             <div key={i} className="bg-white rounded-2xl p-5 animate-pulse"
//               style={{ boxShadow: '0 1px 12px rgba(0,0,0,0.07)' }}>
//               <div className="h-3 bg-gray-100 rounded w-1/2 mb-3"/>
//               <div className="h-4 bg-gray-100 rounded w-3/4 mb-2"/>
//               <div className="h-3 bg-gray-100 rounded w-full mb-1"/>
//               <div className="h-3 bg-gray-100 rounded w-2/3"/>
//             </div>
//           ))}
//         </div>
//       )}

//       {/* ── Empty state ── */}
//       {!isLoading && notices.length === 0 && (
//         <div
//           className="bg-white rounded-2xl py-20 flex flex-col items-center gap-4"
//           style={{ boxShadow: '0 1px 12px rgba(0,0,0,0.07)' }}
//         >
//           <span className="text-6xl">📢</span>
//           <p className="text-gray-400 text-sm font-medium">No notices found</p>
//           <button
//             onClick={openSend}
//             className="px-6 py-2.5 rounded-xl text-white text-sm font-bold
//               transition-all hover:scale-105"
//             style={{ background: 'linear-gradient(135deg,#f02d65,#ff6035)' }}
//           >
//             Send First Notice
//           </button>
//         </div>
//       )}

//       {/* ── Notice cards ── */}
//       {!isLoading && notices.length > 0 && (
//         <>
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
//             {notices.map((n) => (
//               <div
//                 key={n._id}
//                 className="bg-white rounded-2xl p-5 flex flex-col transition-all hover:shadow-md"
//                 style={{ boxShadow: '0 1px 12px rgba(0,0,0,0.07)' }}
//               >
//                 {/* Top row: badges + actions */}
//                 <div className="flex items-start justify-between gap-2 mb-3">
//                   <div className="flex items-center gap-1.5 flex-wrap">
//                     <span className="px-2.5 py-1 rounded-full text-[10px] font-bold"
//                       style={{ background: '#f0f9ff', color: '#0ea5e9' }}>
//                       {n.type || 'Type 1'}
//                     </span>
//                     <span className="px-2.5 py-1 rounded-full text-[10px] font-bold"
//                       style={n.isSeen
//                         ? { background: '#f0fdf4', color: '#22c55e' }
//                         : { background: '#fffbeb', color: '#f59e0b' }}>
//                       {n.isSeen ? '✓ Seen' : '● Unread'}
//                     </span>
//                   </div>
//                   <div className="flex items-center gap-1 flex-shrink-0">
//                     <button onClick={() => openView(n)} title="View"
//                       className="w-7 h-7 rounded-lg flex items-center justify-center
//                         text-xs transition-all hover:scale-110"
//                       style={{ background: '#6366f118', color: '#6366f1' }}>
//                       👁️
//                     </button>
//                     <button onClick={() => openEdit(n)} title="Edit"
//                       className="w-7 h-7 rounded-lg flex items-center justify-center
//                         text-xs transition-all hover:scale-110"
//                       style={{ background: '#f59e0b18', color: '#f59e0b' }}>
//                       ✏️
//                     </button>
//                     {isSuperAdmin && (
//                       <button
//                         onClick={() => window.confirm('Delete this notice?') && remove.mutate(n._id)}
//                         disabled={remove.isPending}
//                         title="Delete"
//                         className="w-7 h-7 rounded-lg flex items-center justify-center
//                           text-xs transition-all hover:scale-110 disabled:opacity-50"
//                         style={{ background: '#ef444418', color: '#ef4444' }}>
//                         ✕
//                       </button>
//                     )}
//                   </div>
//                 </div>

//                 {/* Merchant */}
//                 <div className="flex items-center gap-2 mb-3">
//                   <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center
//                     justify-center text-xs flex-shrink-0">🏪</div>
//                   <div className="min-w-0">
//                     <p className="text-gray-700 text-xs font-semibold truncate">
//                       {n.merchant?.storeName || '—'}
//                     </p>
//                     <p className="text-gray-400 text-[10px]">
//                       {n.merchant?.merchantId}
//                     </p>
//                   </div>
//                 </div>

//                 {/* Title + content */}
//                 <p className="text-gray-800 text-sm font-bold line-clamp-1 mb-1">
//                   {n.title}
//                 </p>
//                 <p className="text-gray-400 text-xs line-clamp-2 flex-1">
//                   {n.content || 'No content'}
//                 </p>

//                 {/* Footer */}
//                 <div className="flex items-center justify-between mt-3 pt-3
//                   border-t border-gray-50">
//                   <p className="text-gray-400 text-[10px]">
//                     {new Date(n.createdAt).toLocaleDateString('en-US', {
//                       month: 'short', day: 'numeric', year: '2-digit'
//                     })}
//                   </p>
//                   <p className="text-gray-400 text-[10px]">
//                     by {n.userManagement || 'System'}
//                   </p>
//                 </div>
//               </div>
//             ))}
//           </div>

//           {/* Pagination */}
//           {totalPages > 1 && (
//             <div
//               className="bg-white rounded-2xl flex items-center justify-between
//                 px-5 py-3 flex-wrap gap-2"
//               style={{ boxShadow: '0 1px 12px rgba(0,0,0,0.07)' }}
//             >
//               <p className="text-gray-400 text-xs">
//                 {(page-1)*limit+1}–{Math.min(page*limit,total)} of {total}
//               </p>
//               <div className="flex items-center gap-1">
//                 <button onClick={()=>setPage(1)} disabled={page===1}
//                   className="w-8 h-8 rounded-lg text-gray-400 hover:bg-gray-100 disabled:opacity-30 text-sm">«</button>
//                 <button onClick={()=>setPage(p=>p-1)} disabled={page===1}
//                   className="w-8 h-8 rounded-lg text-gray-400 hover:bg-gray-100 disabled:opacity-30 text-sm">‹</button>
//                 {getPageNums().map(n=>(
//                   <button key={n} onClick={()=>setPage(n)}
//                     className="w-8 h-8 rounded-lg text-xs font-semibold transition-all"
//                     style={n===page?{background:'#f02d65',color:'white'}:{color:'#6b7280'}}>
//                     {n}
//                   </button>
//                 ))}
//                 <button onClick={()=>setPage(p=>p+1)} disabled={page===totalPages}
//                   className="w-8 h-8 rounded-lg text-gray-400 hover:bg-gray-100 disabled:opacity-30 text-sm">›</button>
//                 <button onClick={()=>setPage(totalPages)} disabled={page===totalPages}
//                   className="w-8 h-8 rounded-lg text-gray-400 hover:bg-gray-100 disabled:opacity-30 text-sm">»</button>
//               </div>
//             </div>
//           )}
//         </>
//       )}

//       {/* ══ Send / Edit Modal ════════════════════════════════ */}
//       <Modal
//         open={modal === 'send' || modal === 'edit'}
//         onClose={closeModal}
//         title={modal === 'edit' ? '✏️ Edit Notice' : '📢 Send Notice'}
//       >
//         <div className="space-y-4">
//           <Field label="Merchant ID" required>
//             <Input
//               placeholder="e.g. MCH123456"
//               value={form.merchantId}
//               onChange={setF('merchantId')}
//               disabled={modal === 'edit'}
//             />
//             <p className="text-gray-400 text-[10px] mt-1">
//               The merchant's unique ID string (not MongoDB _id)
//             </p>
//           </Field>

//           <div className="grid grid-cols-2 gap-3">
//             <Field label="Notice Type">
//               <select
//                 value={form.type}
//                 onChange={setF('type')}
//                 className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm
//                   text-gray-700 outline-none focus:border-pink-400 bg-gray-50
//                   focus:bg-white transition-all"
//               >
//                 {NOTICE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
//               </select>
//             </Field>
//             <Field label="Sender Tag">
//               <Input
//                 placeholder="System"
//                 value={form.userManagement}
//                 onChange={setF('userManagement')}
//               />
//             </Field>
//           </div>

//           <Field label="Title" required>
//             <Input
//               placeholder="Notice title..."
//               value={form.title}
//               onChange={setF('title')}
//             />
//           </Field>

//           <Field label="Content">
//             <Textarea
//               placeholder="Write content here..."
//               value={form.content}
//               onChange={setF('content')}
//             />
//           </Field>

//           {/* Live preview */}
//           {(form.title || form.content) && (
//             <div className="rounded-xl p-4"
//               style={{ background:'#f8fafc', border:'1px solid #e2e8f0' }}>
//               <p className="text-gray-400 text-[10px] uppercase tracking-wide mb-2">Preview</p>
//               <p className="text-gray-800 text-sm font-bold mb-1">{form.title || 'Title'}</p>
//               <p className="text-gray-500 text-xs">{form.content || '—'}</p>
//               <div className="flex items-center gap-2 mt-2">
//                 <span className="px-2 py-0.5 rounded-full text-[10px]"
//                   style={{ background:'#f0f9ff', color:'#0ea5e9' }}>{form.type}</span>
//                 <span className="text-gray-400 text-[10px]">
//                   by {form.userManagement || 'System'}
//                 </span>
//               </div>
//             </div>
//           )}

//           <div className="grid grid-cols-2 gap-3 pt-1">
//             <button onClick={closeModal}
//               className="py-3 rounded-xl border border-gray-200 text-gray-500
//                 text-sm hover:bg-gray-50 transition-all">
//               Cancel
//             </button>
//             <button onClick={handleSubmit} disabled={isSaving}
//               className="py-3 rounded-xl text-white font-bold text-sm transition-all
//                 hover:scale-105 active:scale-95 disabled:opacity-50"
//               style={{
//                 background:'linear-gradient(135deg,#f02d65,#ff6035)',
//                 boxShadow:'0 4px 12px rgba(240,45,101,0.3)',
//               }}>
//               {isSaving ? 'Sending...' : modal === 'edit' ? 'Update' : 'Send Notice'}
//             </button>
//           </div>
//         </div>
//       </Modal>

//       {/* ══ View Detail Modal ════════════════════════════════ */}
//       <Modal open={modal === 'view'} onClose={closeModal} title="📢 Notice Detail" wide>
//         {viewItem && (
//           <div className="space-y-4">
//             <div className="flex items-center gap-2 flex-wrap">
//               <span className="px-3 py-1.5 rounded-full text-xs font-bold"
//                 style={{ background:'#f0f9ff', color:'#0ea5e9' }}>
//                 {viewItem.type}
//               </span>
//               <span className="px-3 py-1.5 rounded-full text-xs font-bold"
//                 style={viewItem.isSeen
//                   ? { background:'#f0fdf4', color:'#22c55e' }
//                   : { background:'#fffbeb', color:'#f59e0b' }}>
//                 {viewItem.isSeen ? '✓ Seen' : '● Unread'}
//               </span>
//             </div>

//             <div className="flex items-center gap-3 p-3 rounded-xl"
//               style={{ background:'#f8fafc', border:'1px solid #e2e8f0' }}>
//               <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center
//                 justify-center text-xl flex-shrink-0">🏪</div>
//               <div>
//                 <p className="text-gray-800 text-sm font-bold">
//                   {viewItem.merchant?.storeName || '—'}
//                 </p>
//                 <p className="text-gray-400 text-xs">
//                   ID: {viewItem.merchant?.merchantId}
//                 </p>
//               </div>
//             </div>

//             <div>
//               <p className="text-gray-400 text-[10px] uppercase tracking-wide mb-1">Title</p>
//               <p className="text-gray-800 text-base font-bold">{viewItem.title}</p>
//             </div>

//             <div>
//               <p className="text-gray-400 text-[10px] uppercase tracking-wide mb-1">Content</p>
//               <div className="rounded-xl p-4 text-gray-600 text-sm leading-relaxed"
//                 style={{ background:'#f8fafc', border:'1px solid #e2e8f0', whiteSpace:'pre-wrap' }}>
//                 {viewItem.content || 'No content'}
//               </div>
//             </div>

//             <div className="grid grid-cols-2 gap-3 text-xs">
//               {[
//                 { label:'Sent By',    value: viewItem.userManagement || 'System' },
//                 { label:'Sent On',    value: new Date(viewItem.createdAt).toLocaleString() },
//               ].map(r => (
//                 <div key={r.label} className="rounded-xl p-3"
//                   style={{ background:'#f8fafc', border:'1px solid #e2e8f0' }}>
//                   <p className="text-gray-400 mb-0.5">{r.label}</p>
//                   <p className="text-gray-700 font-semibold">{r.value}</p>
//                 </div>
//               ))}
//               {viewItem.seenAt && (
//                 <div className="col-span-2 rounded-xl p-3"
//                   style={{ background:'#f0fdf4', border:'1px solid #bbf7d0' }}>
//                   <p className="text-gray-400 mb-0.5">Read At</p>
//                   <p className="text-green-700 font-semibold">
//                     {new Date(viewItem.seenAt).toLocaleString()}
//                   </p>
//                 </div>
//               )}
//             </div>

//             <button onClick={closeModal}
//               className="w-full py-3 rounded-xl border border-gray-200
//                 text-gray-500 text-sm hover:bg-gray-50 transition-all">
//               Close
//             </button>
//           </div>
//         )}
//       </Modal>
//     </div>
//   )
// }

/////////////////////// =================== latest version (by gemeni) ========================= //////////////////////////
import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import API from "../../api/axios";

// ── Icons ─────────────────────────────────────────────────────
import { RefreshCcw, Loader2, Plus, Edit, Trash2, Search } from "lucide-react";

// ── Reusable UI components ────────────────────────────────────
const ActionBtn = ({ onClick, color, label, disabled, icon: Icon }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="rounded text-[12px] font-medium transition-all hover:opacity-90 hover:-translate-y-[1px] disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap flex items-center justify-center gap-1.5 shadow-sm"
    style={{ backgroundColor: color, color: "white", padding: "6px 10px" }}
  >
    {Icon && <Icon className="w-3.5 h-3.5" />}
    {label && <span>{label}</span>}
  </button>
);

const FormInput = ({ label, type = "text", ...props }) => (
  <div className="flex items-center gap-4 mb-4">
    <label className="text-gray-600 text-[13px] font-bold w-32 text-right flex-shrink-0">
      {label}:
    </label>
    <input
      style={{ padding: "6px 10px" }}
      type={type}
      className="flex-1 rounded-sm border border-gray-300 text-gray-800 text-[13px] focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all bg-white"
      {...props}
    />
  </div>
);

const FormSelect = ({ label, children, ...props }) => (
  <div className="flex items-center gap-4 mb-4">
    <label className="text-gray-600 text-[13px] font-bold w-32 text-right flex-shrink-0">
      {label}:
    </label>
    <select
      style={{ padding: "6px 10px" }}
      className="flex-1 rounded-sm border border-gray-300 text-gray-800 text-[13px] focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all bg-white"
      {...props}
    >
      {children}
    </select>
  </div>
);

// ── NEW: Draggable Modal Component ────────────────────────────
const DraggableModal = ({
  open,
  onClose,
  title,
  children,
  width = "max-w-2xl",
}) => {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [rel, setRel] = useState({ x: 0, y: 0 });

  // Reset position when modal opens
  useEffect(() => {
    if (open) setPos({ x: 0, y: 0 });
  }, [open]);

  // Handle window dragging events
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      setPos({ x: e.clientX - rel.x, y: e.clientY - rel.y });
    };
    const handleMouseUp = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, rel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-hidden pointer-events-auto">
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div
        style={{ transform: `translate(${pos.x}px, ${pos.y}px)` }}
        className={`relative bg-white rounded-sm w-full ${width} flex flex-col shadow-2xl overflow-hidden`}
      >
        {/* DRAGGABLE HEADER */}
        <div
          style={{ padding: "12px 20px" }}
          className="flex items-center justify-between bg-slate-800 text-white cursor-move select-none"
          onMouseDown={(e) => {
            if (e.button !== 0) return; // Only left click
            setIsDragging(true);
            setRel({ x: e.clientX - pos.x, y: e.clientY - pos.y });
          }}
        >
          <h3 className="font-bold text-[14px]">{title}</h3>
          <button
            onMouseDown={(e) => e.stopPropagation()} // Prevent drag when clicking close
            onClick={onClose}
            className="text-gray-300 hover:text-white transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* MODAL BODY */}
        <div
          style={{ padding: "20px" }}
          className="overflow-y-auto max-h-[80vh] custom-scrollbar bg-gray-50/30"
        >
          {children}
        </div>
      </div>
    </div>
  );
};

const EMPTY_FORM = {
  merchantId: "",
  type: "Announcement", // Updated default
  userManagement: "System",
  title: "",
  content: "",
  sendEmail: false,
};

// ── Main component ────────────────────────────────────────────
export default function MerchantNotice() {
  const queryClient = useQueryClient();
  const { user } = useSelector((s) => s.auth);
  const isSuperAdmin = user?.role === "superAdmin";

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [modal, setModal] = useState(null); // 'add' | 'edit'
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);

  // Searchable Merchant Dropdown States
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // ── Main Table Fetch Logic ──────────────────────────────────
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["notices", page, limit],
    queryFn: async () => {
      const p = new URLSearchParams({ page, limit });
      const { data } = await API.get(`/notices?${p.toString()}`);
      return data;
    },
    keepPreviousData: true,
  });

  const notices = data?.notices || [];
  const total = data?.total || 0;
  const totalPages = data?.pages || Math.ceil(total / limit) || 1;
  const invalidate = () => queryClient.invalidateQueries(["notices"]);

  // ── Merchant Search API (For the Add Notice Modal) ──────────
  const { data: searchResults } = useQuery({
    queryKey: ["merchantSearch", searchQuery],
    queryFn: async () => {
      if (!searchQuery) return [];
      const { data } = await API.get(
        `/merchants?storeName=${searchQuery}&limit=10`,
      );
      return data.merchants || [];
    },
    enabled: !!searchQuery && showDropdown,
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ── Mutations ──────────────────────────────────────────────
  const createNotice = useMutation({
    mutationFn: (body) => API.post("/notices", body),
    onSuccess: () => {
      invalidate();
      toast.success("Notice sent successfully!");
      closeModal();
    },
    onError: (e) =>
      toast.error(e.response?.data?.message || "Failed to send notice"),
  });

  const updateNotice = useMutation({
    mutationFn: ({ id, body }) => API.put(`/notices/${id}`, body),
    onSuccess: () => {
      invalidate();
      toast.success("Notice updated successfully!");
      closeModal();
    },
    onError: (e) =>
      toast.error(e.response?.data?.message || "Failed to update notice"),
  });

  const deleteNotice = useMutation({
    mutationFn: (id) => API.delete(`/notices/${id}`),
    onSuccess: () => {
      invalidate();
      toast.success("Notice deleted.");
    },
    onError: (e) =>
      toast.error(e.response?.data?.message || "Failed to delete notice"),
  });

  // ── Modal Handlers ─────────────────────────────────────────
  const openAdd = () => {
    setForm(EMPTY_FORM);
    setSearchQuery("");
    setEditId(null);
    setModal("add");
  };

  const openEdit = (n) => {
    setForm({
      merchantId: n.merchant?.merchantId || "",
      type: n.type || "Announcement",
      userManagement: n.userManagement || "System",
      title: n.title || "",
      content: n.content || "",
      sendEmail: n.sendEmail || false,
    });
    setSearchQuery(n.merchant?.storeName || n.merchant?.merchantId || "");
    setEditId(n._id);
    setModal("edit");
  };

  const closeModal = () => {
    setModal(null);
    setEditId(null);
    setForm(EMPTY_FORM);
    setSearchQuery("");
    setShowDropdown(false);
  };

  const handleSubmit = () => {
    if (!form.merchantId || !form.title) {
      return toast.error("Please select a Merchant and enter a Title.");
    }

    if (modal === "edit" && editId) {
      updateNotice.mutate({ id: editId, body: form });
    } else {
      createNotice.mutate(form);
    }
  };

  const getPageNums = () => {
    if (totalPages <= 5) return [...Array(totalPages)].map((_, i) => i + 1);
    if (page <= 3) return [1, 2, 3, 4, 5];
    if (page >= totalPages - 2)
      return [
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    return [page - 2, page - 1, page, page + 1, page + 2];
  };

  return (
    <div
      style={{ padding: "20px" }}
      className="p-20 md:p-6 bg-gray-50 min-h-screen w-full max-w-full overflow-hidden"
    >
      {/* ── HEADER ── */}
      <div className="mb-4 flex justify-between items-end">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Merchant Notice</h1>
          <p className="text-[13px] text-gray-500 mt-1">
            {total.toLocaleString()} notices · Broadcast important system
            messages directly to merchants.
          </p>
        </div>
      </div>

      {/* ── TOP ACTION BAR ── */}
      <div
        style={{ padding: "10px" }}
        className="bg-white border border-gray-100 rounded-sm mb-4 w-full flex gap-2 shadow-sm"
      >
        <button
          onClick={invalidate}
          style={{ padding: "6px 12px" }}
          className="bg-slate-700 hover:bg-slate-800 text-white rounded-sm transition-colors flex items-center justify-center shadow-sm"
          title="Refresh Table"
        >
          <RefreshCcw
            className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`}
          />
        </button>
        <ActionBtn color="#059669" label="Add" icon={Plus} onClick={openAdd} />
        <ActionBtn
          color="#3b82f6"
          label="Edit"
          icon={Edit}
          onClick={() =>
            toast.info(
              "Please select the green edit icon inside the specific table row.",
            )
          }
        />
      </div>

      {/* ── DATA TABLE ── */}
      <div
        style={{ padding: "5px" }}
        className="bg-white border border-gray-100 rounded-sm flex flex-col w-full overflow-hidden shadow-sm"
      >
        <div className="w-full overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[1100px]">
            <thead>
              <tr className="border-b border-gray-200 text-gray-700 text-[12px] font-bold bg-gray-50/50">
                <th
                  style={{ padding: "12px 15px" }}
                  className="text-center w-10"
                >
                  <input type="checkbox" className="rounded border-gray-300" />
                </th>
                <th style={{ padding: "12px 15px" }}>Id</th>
                <th style={{ padding: "12px 15px" }}>Merchant.mer_name</th>
                <th style={{ padding: "12px 15px" }} className="text-center">
                  Type
                </th>
                <th style={{ padding: "12px 15px" }} className="text-center">
                  User Management
                </th>
                <th style={{ padding: "12px 15px" }}>Title</th>
                <th style={{ padding: "12px 15px" }}>Creation Time</th>
                <th style={{ padding: "12px 15px" }} className="text-center">
                  Is_see
                </th>
                <th style={{ padding: "12px 15px" }}>See_time</th>
                <th style={{ padding: "12px 15px" }} className="text-center">
                  Operate
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="10" className="py-24 text-center">
                    <div className="flex flex-col py-10 items-center justify-center gap-3">
                      <Loader2 className="w-8 h-8 text-teal-500 animate-spin mx-auto mb-2" />
                      <p className="text-gray-500 text-[13px]">
                        Loading notices...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : notices.length === 0 ? (
                <tr>
                  <td
                    colSpan="10"
                    className="text-center py-20 text-gray-500 text-[13px]"
                  >
                    No notices found.
                  </td>
                </tr>
              ) : (
                notices.map((n) => (
                  <tr
                    key={n._id}
                    className="border-b border-gray-50 hover:bg-slate-50/50 transition-colors"
                  >
                    <td
                      style={{ padding: "12px 15px" }}
                      className="text-center"
                    >
                      <input
                        type="checkbox"
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td
                      style={{ padding: "12px 15px" }}
                      className="text-[13px] text-gray-600 font-mono"
                    >
                      {n._id.slice(-4).toUpperCase()}
                    </td>
                    <td
                      style={{ padding: "12px 15px" }}
                      className="text-[13px] text-gray-800 font-bold"
                    >
                      {n.merchant?.storeName || "—"}
                    </td>
                    <td
                      style={{ padding: "12px 15px" }}
                      className="text-center text-[12px] font-bold text-indigo-600"
                    >
                      {n.type}
                    </td>
                    <td
                      style={{ padding: "12px 15px" }}
                      className="text-center text-[13px] text-gray-600"
                    >
                      {n.userManagement}
                    </td>
                    <td
                      style={{ padding: "12px 15px" }}
                      className="text-[13px] text-gray-800 font-medium max-w-[250px] truncate"
                      title={n.title}
                    >
                      {n.title}
                    </td>
                    <td
                      style={{ padding: "12px 15px" }}
                      className="text-[13px] text-gray-600"
                    >
                      {new Date(n.createdAt).toLocaleString("en-CA")}
                    </td>
                    <td
                      style={{ padding: "12px 15px" }}
                      className="text-center"
                    >
                      <span
                        className={`text-[12px] font-bold ${n.isSeen ? "text-emerald-500" : "text-gray-400"}`}
                      >
                        {n.isSeen ? "Is_see 1" : "Is_see 0"}
                      </span>
                    </td>
                    <td
                      style={{ padding: "12px 15px" }}
                      className="text-[13px] text-gray-600"
                    >
                      {n.seenAt
                        ? new Date(n.seenAt).toLocaleString("en-CA")
                        : "None"}
                    </td>
                    <td
                      style={{ padding: "12px 15px" }}
                      className="text-center"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEdit(n)}
                          className="w-7 h-7 bg-emerald-500 hover:bg-emerald-600 text-white rounded-sm flex items-center justify-center transition-colors shadow-sm"
                          title="Edit Notice"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        {isSuperAdmin && (
                          <button
                            onClick={() =>
                              window.confirm("Delete this notice?") &&
                              deleteNotice.mutate(n._id)
                            }
                            className="w-7 h-7 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-sm flex items-center justify-center transition-colors border border-red-100"
                            title="Delete Notice"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div
          style={{ padding: "5px" }}
          className="flex flex-col sm:flex-row items-center justify-between p-5 border-t border-gray-100 bg-gray-50/50"
        >
          <div className="text-[13px] text-gray-500 flex items-center gap-2 font-medium">
            Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)}{" "}
            of {total} rows
            <select
              style={{ padding: "5px" }}
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className="ml-2 border border-gray-200 rounded-sm px-2 py-1 focus:outline-none focus:border-teal-500 bg-white font-semibold text-gray-700"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              style={{ padding: "5px" }}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-1.5 border border-gray-200 rounded-sm text-[13px] font-semibold bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors shadow-sm"
            >
              Prev
            </button>
            {getPageNums().map((n, idx) =>
              n === "..." ? (
                <span key={`dots-${idx}`} className="px-2 text-gray-400">
                  ...
                </span>
              ) : (
                <button
                  style={{ padding: "5px" }}
                  key={n}
                  onClick={() => setPage(n)}
                  className={`min-w-[36px] px-2 py-1.5 rounded-sm text-[13px] font-bold transition-colors shadow-sm ${n === page ? "bg-slate-800 text-white border border-slate-800" : "bg-white border border-gray-200 hover:bg-gray-50 text-gray-700"}`}
                >
                  {n}
                </button>
              ),
            )}
            <button
              style={{ padding: "5px" }}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || totalPages === 0}
              className="px-4 py-1.5 border border-gray-200 rounded-sm text-[13px] font-semibold bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors shadow-sm"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* ════════════ DRAGGABLE ADD/EDIT MODAL ════════════ */}
      <DraggableModal
        open={modal}
        onClose={closeModal}
        title={modal === "edit" ? "Edit Notice" : "Add Notice"}
      >
        <div className="flex flex-col gap-2">
          {/* SEARCHABLE MERCHANT ID FIELD */}
          <div
            className="flex items-start gap-4 mb-4 relative"
            ref={dropdownRef}
          >
            <label className="text-gray-600 text-[13px] font-bold w-32 text-right flex-shrink-0 pt-2">
              Mer_id:
            </label>
            <div className="flex-1 relative">
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  style={{ padding: "6px 10px 6px 32px" }}
                  type="text"
                  placeholder="Search by Store Name or Merchant ID..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowDropdown(true);
                  }}
                  onFocus={() => setShowDropdown(true)}
                  disabled={modal === "edit"}
                  className="w-full rounded-sm border border-gray-300 text-gray-800 text-[13px] focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>

              {/* AUTO-COMPLETE DROPDOWN */}
              {showDropdown && searchResults && searchResults.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-sm shadow-xl max-h-48 overflow-y-auto">
                  {searchResults.map((m) => (
                    <div
                      key={m._id}
                      onClick={() => {
                        setForm({ ...form, merchantId: m.merchantId });
                        setSearchQuery(`${m.storeName} (${m.merchantId})`);
                        setShowDropdown(false);
                      }}
                      className="p-2.5 hover:bg-teal-50 cursor-pointer border-b border-gray-50 last:border-0 transition-colors"
                    >
                      <p className="text-[13px] font-bold text-gray-800">
                        {m.storeName}
                      </p>
                      <p className="text-[11px] text-gray-500 font-mono">
                        ID: {m.merchantId}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <FormSelect
            label="Type"
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
          >
            <option value="Announcement">Announcement</option>
            <option value="System Update">System Update</option>
            <option value="Alert">Alert / Warning</option>
            <option value="General">General / Other</option>
          </FormSelect>

          <FormInput
            label="User Management"
            value={form.userManagement}
            onChange={(e) =>
              setForm({ ...form, userManagement: e.target.value })
            }
          />

          <FormInput
            label="Title"
            placeholder="Enter Notice Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />

          <div className="flex items-center gap-4 mb-4">
            <label className="text-gray-600 text-[13px] font-bold w-32 text-right flex-shrink-0">
              Send email?: <br />
              <span className="text-[10px] text-gray-400 font-normal"></span>
            </label>
            <div className="flex items-center gap-4 text-[13px] text-gray-800 font-medium">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="email"
                  checked={!form.sendEmail}
                  onChange={() => setForm({ ...form, sendEmail: false })}
                  className="accent-teal-500 w-4 h-4"
                />
                No
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="email"
                  checked={form.sendEmail}
                  onChange={() => setForm({ ...form, sendEmail: true })}
                  className="accent-teal-500 w-4 h-4"
                />
                Yes
              </label>
            </div>
          </div>

          <div className="flex items-start gap-4 mb-4">
            <label className="text-gray-600 text-[13px] font-bold w-32 text-right flex-shrink-0 pt-2">
              Content:
            </label>
            <div className="flex-1 border border-gray-300 rounded-sm bg-white overflow-hidden focus-within:border-teal-500 focus-within:ring-1 focus-within:ring-teal-500 transition-all">
              {/* Fake WYSIWYG Toolbar matching Demo */}
              <div className="bg-gray-50 border-b border-gray-200 px-2 py-1.5 flex gap-1 flex-wrap items-center text-gray-500">
                <span className="px-2 py-1 hover:bg-gray-200 cursor-pointer rounded-sm font-black text-[12px] text-gray-700">
                  B
                </span>
                <span className="px-2 py-1 hover:bg-gray-200 cursor-pointer rounded-sm italic text-[12px] text-gray-700">
                  I
                </span>
                <span className="px-2 py-1 hover:bg-gray-200 cursor-pointer rounded-sm underline text-[12px] text-gray-700">
                  U
                </span>
                <span className="px-2 py-1 hover:bg-gray-200 cursor-pointer rounded-sm line-through text-[12px] text-gray-700">
                  S
                </span>
                <div className="w-px h-4 bg-gray-300 mx-1"></div>
                <span className="px-2 py-1 hover:bg-gray-200 cursor-pointer rounded-sm text-[12px] font-medium bg-yellow-200 text-yellow-900">
                  A
                </span>
                <div className="w-px h-4 bg-gray-300 mx-1"></div>
                <span className="px-2 py-1 hover:bg-gray-200 cursor-pointer rounded-sm text-[12px] font-medium">
                  Helvetica ▼
                </span>
                <span className="px-2 py-1 hover:bg-gray-200 cursor-pointer rounded-sm text-[12px] font-medium">
                  14 ▼
                </span>
              </div>
              <textarea
                style={{ padding: "10px" }}
                rows={6}
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                className="w-full text-[13px] text-gray-800 outline-none resize-none"
                placeholder="Enter HTML or plain text here..."
              />
            </div>
          </div>

          {/* Action Button */}
          <div className="flex justify-center mt-2 border-t border-gray-100 pt-5">
            <button
              style={{ padding: "8px 40px" }}
              onClick={handleSubmit}
              disabled={createNotice.isPending || updateNotice.isPending}
              className="bg-slate-700 hover:bg-slate-800 text-white rounded-sm font-bold text-[13px] transition-colors shadow-sm disabled:opacity-50"
            >
              {createNotice.isPending || updateNotice.isPending
                ? "Processing..."
                : "OK"}
            </button>
          </div>
        </div>
      </DraggableModal>
    </div>
  );
}
