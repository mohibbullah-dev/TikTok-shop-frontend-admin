// frontend-admin/src/pages/merchants/MerchantApplication.jsx
//
// WHAT THIS PAGE IS:
//   New merchant store registrations waiting for approval.
//   superAdmin reviews pending stores and approves / rejects / freezes them.
//
// VERIFIED BACKEND ENDPOINTS:
//   GET /api/merchants?status=&storeName=&merchantId=&page=&limit=
//       → { merchants, total, pages }
//       → merchants[].user populated: { email, mobile, lastLogin }
//       → merchants[].referrer populated: { username, invitationCode }
//       superAdmin + merchantAdmin (merchantAdmin auto-scoped to referred merchants)
//
//   PUT /api/merchants/:id/status   body: { status }
//       status enum: 'pending' | 'approved' | 'rejected' | 'frozen'
//       superAdmin only — also freezes/unfreezes the User account
//
//   PUT /api/merchants/:id/withdrawal-status
//       → toggles isWithdrawalForbidden boolean
//       superAdmin + merchantAdmin
//
// Merchant MODEL FIELDS (exact):
//   merchantId(String), storeName, storeLogo, storePhone, storeAddress
//   storeIntroduction, welcomeMessage, banners([String])
//   referrer{username, invitationCode}
//   user{email, mobile, lastLogin}
//   vipLevel(0-6), balance, pendingAmount, totalIncome, totalProfit
//   creditScore(default:100), starRating, positiveRatingRate, followers
//   status: 'pending'|'approved'|'rejected'|'frozen'
//   isWithdrawalForbidden(Boolean), isOnline(Boolean)
//   realName, idCardNumber, bankCard, bankName
//   createdAt

// import { useState, useEffect } from 'react'
// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
// import { useSelector } from 'react-redux'
// import { toast } from 'react-toastify'
// import API from '../../api/axios'

// // ─── Status config ─────────────────────────────────────────────
// const STATUS_CFG = {
//   pending:  { color: '#f59e0b', bg: '#fef9c3', label: '⏳ Pending',  },
//   approved: { color: '#22c55e', bg: '#dcfce7', label: '✅ Approved', },
//   rejected: { color: '#ef4444', bg: '#fee2e2', label: '✕ Rejected', },
//   frozen:   { color: '#9ca3af', bg: '#f3f4f6', label: '🧊 Frozen',  },
// }

// const TABS = [
//   { key: '',         label: 'All'      },
//   { key: 'pending',  label: '⏳ Pending'  },
//   { key: 'approved', label: '✅ Approved' },
//   { key: 'rejected', label: '✕ Rejected' },
//   { key: 'frozen',   label: '🧊 Frozen'  },
// ]

// // ─── Atoms ─────────────────────────────────────────────────────
// const Modal = ({ open, onClose, title, wide, children }) => {
//   if (!open) return null
//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
//       <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}/>
//       <div
//         className={`relative bg-white rounded-2xl w-full
//           ${wide ? 'max-w-xl' : 'max-w-md'} max-h-[90vh] overflow-y-auto`}
//         style={{ boxShadow: '0 25px 60px rgba(0,0,0,0.25)' }}
//       >
//         <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
//           <p className="font-bold text-gray-800 text-sm">{title}</p>
//           <button onClick={onClose}
//             className="w-8 h-8 rounded-xl bg-gray-100 flex items-center
//               justify-center text-gray-400 hover:bg-gray-200 transition-all">
//             ✕
//           </button>
//         </div>
//         <div className="p-6">{children}</div>
//       </div>
//     </div>
//   )
// }

// const DetailRow = ({ label, value, mono }) => (
//   <div className="flex items-start justify-between py-2.5
//     border-b border-gray-50 last:border-0 gap-4">
//     <span className="text-gray-400 text-xs flex-shrink-0 w-32">{label}</span>
//     <span className={`text-xs font-semibold text-right text-gray-800 flex-1
//       ${mono ? 'font-mono' : ''}`}>
//       {value ?? '—'}
//     </span>
//   </div>
// )

// export default function MerchantApplication() {
//   const queryClient  = useQueryClient()
//   const { user }     = useSelector(s => s.auth)
//   const isSuperAdmin = user?.role === 'superAdmin'

//   const [tab,    setTab]    = useState('pending') // default to pending
//   const [page,   setPage]   = useState(1)
//   const [search, setSearch] = useState('')
//   const [modal,  setModal]  = useState(null)  // 'detail' | 'action'
//   const [sel,    setSel]    = useState(null)  // selected merchant
//   const limit = 10

//   useEffect(() => setPage(1), [tab, search])

//   // ── Fetch: GET /api/merchants?status=&storeName=&page=&limit=
//   const { data, isLoading, isFetching } = useQuery({
//     queryKey: ['merchant-apps', tab, page, search],
//     queryFn:  async () => {
//       const params = new URLSearchParams({ page, limit })
//       if (tab)    params.set('status',    tab)
//       if (search) params.set('storeName', search.trim())
//       const { data } = await API.get(`/merchants?${params}`)
//       return data
//     },
//     keepPreviousData: true,
//   })

//   const merchants  = data?.merchants  || []
//   const total      = data?.total      || 0
//   const totalPages = data?.pages      || 1
//   const invalidate = () => queryClient.invalidateQueries(['merchant-apps'])

//   // ── Update status: PUT /api/merchants/:id/status  body: {status}
//   // 'approved' → sets status+unfreezes user
//   // 'frozen'   → sets status+freezes user
//   // 'rejected' → sets status (no financial impact)
//   const updateStatus = useMutation({
//     mutationFn: ({ id, status }) => API.put(`/merchants/${id}/status`, { status }),
//     onSuccess: (res, vars) => {
//       invalidate()
//       const labels = { approved: '✅ Approved!', rejected: '✕ Rejected', frozen: '🧊 Frozen', pending: 'Set to Pending' }
//       toast.success(labels[vars.status] || 'Status updated')
//       setModal(null)
//     },
//     onError: (e) => toast.error(e.response?.data?.message || 'Failed'),
//   })

//   // ── Toggle withdrawal: PUT /api/merchants/:id/withdrawal-status
//   // No body needed — backend toggles isWithdrawalForbidden
//   const toggleWithdrawal = useMutation({
//     mutationFn: (id) => API.put(`/merchants/${id}/withdrawal-status`),
//     onSuccess: (res) => {
//       invalidate()
//       const state = res.data?.isWithdrawalForbidden ? 'Forbidden' : 'Allowed'
//       toast.success(`Withdrawal ${state}`)
//     },
//     onError: (e) => toast.error(e.response?.data?.message || 'Failed'),
//   })

//   const openDetail = (m) => { setSel(m); setModal('detail') }
//   const openAction = (m) => { setSel(m); setModal('action') }
//   const closeModal = () => { setModal(null); setSel(null) }

//   // Pagination
//   const getPageNums = () => {
//     if (totalPages <= 5) return [...Array(totalPages)].map((_,i) => i+1)
//     if (page <= 3)              return [1,2,3,4,5]
//     if (page >= totalPages - 2) return [totalPages-4,totalPages-3,totalPages-2,totalPages-1,totalPages]
//     return [page-2,page-1,page,page+1,page+2]
//   }

//   const tabColor = tab ? (STATUS_CFG[tab]?.color || '#6b7280') : '#6b7280'

//   return (
//     <div className="space-y-4">

//       {/* Header */}
//       <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
//         <div>
//           <h1 className="text-xl font-extrabold text-gray-800 tracking-tight">
//             Store Applications
//           </h1>
//           <p className="text-gray-400 text-sm mt-0.5">
//             {total} total · Review and approve new merchant registrations
//           </p>
//         </div>
//         <button onClick={invalidate}
//           className="flex items-center gap-2 px-4 py-2.5 rounded-xl
//             border border-gray-200 text-gray-500 hover:bg-gray-50
//             text-sm transition-all self-start">
//           <svg className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`}
//             fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
//             <polyline points="23 4 23 10 17 10"/>
//             <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/>
//           </svg>
//           Refresh
//         </button>
//       </div>

//       {/* Filters */}
//       <div className="bg-white rounded-2xl p-4 space-y-3"
//         style={{ boxShadow: '0 1px 12px rgba(0,0,0,0.07)' }}>
//         {/* Status tabs */}
//         <div className="flex gap-2 overflow-x-auto pb-1 -mb-1">
//           {TABS.map(t => {
//             const color = t.key ? (STATUS_CFG[t.key]?.color || '#6b7280') : '#6b7280'
//             return (
//               <button key={t.key} onClick={() => setTab(t.key)}
//                 className="px-4 py-2 rounded-xl text-sm font-semibold
//                   transition-all whitespace-nowrap flex-shrink-0"
//                 style={tab === t.key
//                   ? { background: color, color: 'white', boxShadow: `0 4px 12px ${color}40` }
//                   : { background: '#f3f4f6', color: '#6b7280' }
//                 }>
//                 {t.label}
//               </button>
//             )
//           })}
//         </div>
//         {/* Store name search */}
//         <div className="relative max-w-sm">
//           <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
//             fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
//             <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
//           </svg>
//           <input value={search} onChange={e => setSearch(e.target.value)}
//             placeholder="Search by store name..."
//             className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200
//               text-sm outline-none focus:border-pink-400 bg-gray-50
//               focus:bg-white transition-all"/>
//         </div>
//       </div>

//       {/* Table */}
//       <div className="bg-white rounded-2xl overflow-hidden"
//         style={{ boxShadow: '0 1px 12px rgba(0,0,0,0.07)' }}>
//         <div className="overflow-x-auto">
//           <table className="w-full" style={{ minWidth: 820 }}>
//             <thead style={{ background: '#f8fafc' }}>
//               <tr>
//                 {['#','Store','Merchant ID','Referred By','VIP','Balance','Status','Withdrawal','Actions'].map(h => (
//                   <th key={h}
//                     className="px-4 py-3 text-left text-[11px] font-bold
//                       text-gray-400 uppercase tracking-wider whitespace-nowrap">
//                     {h}
//                   </th>
//                 ))}
//               </tr>
//             </thead>
//             <tbody>
//               {/* Loading */}
//               {isLoading && [...Array(5)].map((_,i) => (
//                 <tr key={i} className="border-t border-gray-50">
//                   {[...Array(9)].map((_,j) => (
//                     <td key={j} className="px-4 py-4">
//                       <div className="h-3 bg-gray-100 rounded animate-pulse w-3/4"/>
//                     </td>
//                   ))}
//                 </tr>
//               ))}

//               {/* Empty */}
//               {!isLoading && merchants.length === 0 && (
//                 <tr><td colSpan={9} className="text-center py-20">
//                   <div className="flex flex-col items-center gap-3">
//                     <span className="text-6xl">📋</span>
//                     <p className="text-gray-400 text-sm font-medium">
//                       No {tab || ''} applications
//                     </p>
//                   </div>
//                 </td></tr>
//               )}

//               {/* Rows */}
//               {!isLoading && merchants.map((m, i) => {
//                 const st = STATUS_CFG[m.status] || STATUS_CFG.pending
//                 return (
//                   <tr key={m._id}
//                     className="border-t border-gray-50 hover:bg-slate-50/60 transition-colors">
//                     {/* # */}
//                     <td className="px-4 py-3.5">
//                       <span className="text-gray-400 text-xs">{(page-1)*limit+i+1}</span>
//                     </td>

//                     {/* Store */}
//                     <td className="px-4 py-3.5">
//                       <div className="flex items-center gap-2">
//                         {m.storeLogo ? (
//                           <img src={m.storeLogo} alt=""
//                             className="w-8 h-8 rounded-lg object-cover flex-shrink-0"/>
//                         ) : (
//                           <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center
//                             justify-center text-sm flex-shrink-0">🏪</div>
//                         )}
//                         <div>
//                           <p className="text-gray-800 text-xs font-semibold truncate max-w-[110px]">
//                             {m.storeName}
//                           </p>
//                           <p className="text-gray-400 text-[10px]">{m.user?.email}</p>
//                         </div>
//                       </div>
//                     </td>

//                     {/* Merchant ID */}
//                     <td className="px-4 py-3.5">
//                       <span className="text-gray-600 text-xs font-mono">{m.merchantId}</span>
//                     </td>

//                     {/* Referred by — referrer.username + invitationCode */}
//                     <td className="px-4 py-3.5">
//                       <p className="text-gray-700 text-xs font-semibold">
//                         {m.referrer?.username || '—'}
//                       </p>
//                       {m.referrer?.invitationCode && (
//                         <p className="text-gray-400 text-[10px] font-mono">
//                           {m.referrer.invitationCode}
//                         </p>
//                       )}
//                     </td>

//                     {/* VIP */}
//                     <td className="px-4 py-3.5">
//                       <span className="px-2 py-0.5 rounded-full text-[10px] font-bold"
//                         style={{ background: '#fef9c3', color: '#92400e' }}>
//                         VIP{m.vipLevel}
//                       </span>
//                     </td>

//                     {/* Balance */}
//                     <td className="px-4 py-3.5">
//                       <span className="text-gray-800 text-sm font-bold">
//                         ${(m.balance || 0).toFixed(2)}
//                       </span>
//                     </td>

//                     {/* Status badge */}
//                     <td className="px-4 py-3.5">
//                       <span className="px-2.5 py-1 rounded-full text-[10px] font-bold whitespace-nowrap"
//                         style={{ background: st.bg, color: st.color }}>
//                         {st.label}
//                       </span>
//                     </td>

//                     {/* Withdrawal toggle */}
//                     <td className="px-4 py-3.5">
//                       <button
//                         onClick={() => toggleWithdrawal.mutate(m._id)}
//                         disabled={toggleWithdrawal.isPending}
//                         className="px-2.5 py-1 rounded-full text-[10px] font-bold
//                           transition-all hover:scale-105 disabled:opacity-50 whitespace-nowrap"
//                         style={m.isWithdrawalForbidden
//                           ? { background: '#fee2e2', color: '#ef4444' }
//                           : { background: '#dcfce7', color: '#16a34a' }
//                         }>
//                         {m.isWithdrawalForbidden ? '🚫 Blocked' : '✓ Allowed'}
//                       </button>
//                     </td>

//                     {/* Actions */}
//                     <td className="px-4 py-3.5">
//                       <div className="flex items-center gap-1.5">
//                         {/* View detail */}
//                         <button onClick={() => openDetail(m)} title="View details"
//                           className="w-7 h-7 rounded-lg flex items-center justify-center
//                             text-xs hover:scale-110 transition-all"
//                           style={{ background: '#6366f118', color: '#6366f1' }}>
//                           👁️
//                         </button>
//                         {/* Change status — superAdmin only */}
//                         {isSuperAdmin && (
//                           <button onClick={() => openAction(m)} title="Change status"
//                             className="w-7 h-7 rounded-lg flex items-center justify-center
//                               text-xs hover:scale-110 transition-all"
//                             style={{ background: '#f59e0b18', color: '#f59e0b' }}>
//                             ⚙️
//                           </button>
//                         )}
//                       </div>
//                     </td>
//                   </tr>
//                 )
//               })}
//             </tbody>
//           </table>
//         </div>

//         {/* Pagination */}
//         {totalPages > 1 && (
//           <div className="flex items-center justify-between px-5 py-3
//             border-t border-gray-100 flex-wrap gap-2">
//             <p className="text-gray-400 text-xs">
//               {(page-1)*limit+1}–{Math.min(page*limit,total)} of {total}
//             </p>
//             <div className="flex items-center gap-1">
//               <button onClick={() => setPage(1)} disabled={page===1}
//                 className="w-8 h-8 rounded-lg text-gray-400 hover:bg-gray-100 disabled:opacity-30 text-sm">«</button>
//               <button onClick={() => setPage(p=>p-1)} disabled={page===1}
//                 className="w-8 h-8 rounded-lg text-gray-400 hover:bg-gray-100 disabled:opacity-30 text-sm">‹</button>
//               {getPageNums().map(n => (
//                 <button key={n} onClick={() => setPage(n)}
//                   className="w-8 h-8 rounded-lg text-xs font-semibold transition-all"
//                   style={n===page ? { background: tabColor, color: 'white' } : { color: '#6b7280' }}>
//                   {n}
//                 </button>
//               ))}
//               <button onClick={() => setPage(p=>p+1)} disabled={page===totalPages}
//                 className="w-8 h-8 rounded-lg text-gray-400 hover:bg-gray-100 disabled:opacity-30 text-sm">›</button>
//               <button onClick={() => setPage(totalPages)} disabled={page===totalPages}
//                 className="w-8 h-8 rounded-lg text-gray-400 hover:bg-gray-100 disabled:opacity-30 text-sm">»</button>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* ══ Detail Modal ═══════════════════════════════════════ */}
//       <Modal open={modal==='detail'} onClose={closeModal}
//         title="🏪 Store Details" wide>
//         {sel && (
//           <div className="space-y-4">
//             {/* Store header */}
//             <div className="flex items-center gap-4 p-4 rounded-xl"
//               style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
//               {sel.storeLogo
//                 ? <img src={sel.storeLogo} alt="" className="w-16 h-16 rounded-xl object-cover"/>
//                 : <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center text-3xl">🏪</div>
//               }
//               <div>
//                 <p className="text-gray-800 font-extrabold text-base">{sel.storeName}</p>
//                 <p className="text-gray-500 text-xs font-mono">{sel.merchantId}</p>
//                 <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold mt-1 inline-block"
//                   style={{ background: STATUS_CFG[sel.status]?.bg, color: STATUS_CFG[sel.status]?.color }}>
//                   {STATUS_CFG[sel.status]?.label}
//                 </span>
//               </div>
//             </div>

//             {/* Store info */}
//             <div className="rounded-xl px-4 py-1"
//               style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
//               <DetailRow label="Email"         value={sel.user?.email}/>
//               <DetailRow label="Mobile"        value={sel.user?.mobile}/>
//               <DetailRow label="Last Login"    value={sel.user?.lastLogin ? new Date(sel.user.lastLogin).toLocaleString() : '—'}/>
//               <DetailRow label="Referred By"   value={sel.referrer?.username}/>
//               <DetailRow label="Invite Code"   value={sel.referrer?.invitationCode} mono/>
//               <DetailRow label="VIP Level"     value={`VIP${sel.vipLevel}`}/>
//               <DetailRow label="Balance"       value={`$${(sel.balance||0).toFixed(2)}`}/>
//               <DetailRow label="Pending Amt"   value={`$${(sel.pendingAmount||0).toFixed(2)}`}/>
//               <DetailRow label="Total Income"  value={`$${(sel.totalIncome||0).toFixed(2)}`}/>
//               <DetailRow label="Total Profit"  value={`$${(sel.totalProfit||0).toFixed(2)}`}/>
//               <DetailRow label="Credit Score"  value={sel.creditScore}/>
//               <DetailRow label="Star Rating"   value={`${sel.starRating} ★`}/>
//               <DetailRow label="Followers"     value={(sel.followers||0).toLocaleString()}/>
//               <DetailRow label="Withdrawal"    value={sel.isWithdrawalForbidden ? '🚫 Blocked' : '✓ Allowed'}/>
//               <DetailRow label="Real Name"     value={sel.realName}/>
//               <DetailRow label="Bank"          value={sel.bankName}/>
//               <DetailRow label="Bank Card"     value={sel.bankCard} mono/>
//               <DetailRow label="ID Card"       value={sel.idCardNumber} mono/>
//               <DetailRow label="Registered"    value={new Date(sel.createdAt).toLocaleString()}/>
//             </div>

//             {/* Store intro */}
//             {sel.storeIntroduction && (
//               <div className="p-3 rounded-xl"
//                 style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
//                 <p className="text-green-600 text-[10px] font-bold mb-1 uppercase tracking-wide">Store Intro</p>
//                 <p className="text-gray-600 text-xs">{sel.storeIntroduction}</p>
//               </div>
//             )}

//             <div className="flex gap-3 pt-1">
//               {isSuperAdmin && (
//                 <button onClick={() => { setModal('action') }}
//                   className="flex-1 py-2.5 rounded-xl font-bold text-sm text-white
//                     transition-all active:scale-95"
//                   style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)' }}>
//                   ⚙️ Change Status
//                 </button>
//               )}
//               <button onClick={closeModal}
//                 className="flex-1 py-2.5 rounded-xl border border-gray-200
//                   text-gray-500 text-sm hover:bg-gray-50 transition-all">
//                 Close
//               </button>
//             </div>
//           </div>
//         )}
//       </Modal>

//       {/* ══ Action Modal ═══════════════════════════════════════ */}
//       <Modal open={modal==='action'} onClose={closeModal}
//         title="⚙️ Change Store Status">
//         {sel && (
//           <div className="space-y-4">
//             {/* Current status */}
//             <div className="p-3 rounded-xl text-center"
//               style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
//               <p className="text-gray-500 text-xs mb-1">{sel.storeName} · Current Status</p>
//               <span className="px-3 py-1 rounded-full text-sm font-bold"
//                 style={{ background: STATUS_CFG[sel.status]?.bg, color: STATUS_CFG[sel.status]?.color }}>
//                 {STATUS_CFG[sel.status]?.label}
//               </span>
//             </div>

//             <p className="text-gray-400 text-xs text-center">
//               Select a new status for this store:
//             </p>

//             {/* Action buttons */}
//             <div className="grid grid-cols-2 gap-3">
//               {[
//                 { s: 'approved', label: '✅ Approve',  color: '#22c55e', desc: 'Allow store to operate' },
//                 { s: 'rejected', label: '✕ Reject',   color: '#ef4444', desc: 'Deny this application'  },
//                 { s: 'frozen',   label: '🧊 Freeze',   color: '#9ca3af', desc: 'Suspend the account'    },
//                 { s: 'pending',  label: '⏳ Pending',  color: '#f59e0b', desc: 'Reset to pending review' },
//               ].map(({ s, label, color, desc }) => (
//                 <button key={s}
//                   onClick={() => {
//                     if (window.confirm(`Set "${sel.storeName}" to ${label}?`))
//                       updateStatus.mutate({ id: sel._id, status: s })
//                   }}
//                   disabled={updateStatus.isPending || sel.status === s}
//                   className="p-3 rounded-xl border-2 text-left transition-all
//                     hover:scale-105 active:scale-95 disabled:opacity-40"
//                   style={{ borderColor: color + '40', background: color + '08' }}>
//                   <p className="font-bold text-sm" style={{ color }}>{label}</p>
//                   <p className="text-gray-400 text-[10px] mt-0.5">{desc}</p>
//                 </button>
//               ))}
//             </div>

//             <button onClick={closeModal}
//               className="w-full py-2.5 rounded-xl border border-gray-200
//                 text-gray-500 text-sm hover:bg-gray-50 transition-all">
//               Cancel
//             </button>
//           </div>
//         )}
//       </Modal>
//     </div>
//   )
// }


////////////////// ====================== latest version (by gemeni pro) ======================== /////////////////////
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import API from "../../api/axios";

// ── Icons for forms/modals ────────────────────────────────────
import { RefreshCcw, Loader2, CheckCircle, XCircle, Info, FileText, Snowflake } from "lucide-react";

// ── Reusable UI components ────────────────────────────────────
const ActionBtn = ({ onClick, color, label, disabled, icon: Icon }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="rounded text-[12px] font-medium transition-all hover:opacity-90 hover:-translate-y-[1px] disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap flex items-center justify-center gap-1.5 shadow-sm"
    style={{ backgroundColor: color, color: "white", padding: "6px 10px" }}
  >
    {Icon && <Icon className="w-3.5 h-3.5" />}
    {label}
  </button>
);

const FormInput = ({ label, ...props }) => (
  <div style={{ marginTop: "10px", marginBottom: "10px" }} className="flex flex-col gap-1.5">
    {label && <label className="text-gray-600 text-[13px] font-medium ml-1">{label}</label>}
    <input
      style={{ padding: "5px" }}
      className="w-full rounded-sm border border-gray-200 text-gray-800 text-[13px] focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all bg-gray-50/50 focus:bg-white"
      {...props}
    />
  </div>
);

const FormSelect = ({ label, children, ...props }) => (
  <div className="flex flex-col gap-1.5">
    {label && <label className="text-gray-600 text-[13px] font-medium ml-1">{label}</label>}
    <select
      style={{ padding: "5px" }}
      className="w-full rounded-sm border border-gray-200 text-gray-800 text-[13px] focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all bg-gray-50/50 focus:bg-white appearance-none"
      {...props}
    >
      {children}
    </select>
  </div>
);

const Field = ({ label, value, mono }) => (
  <div className="py-3 flex items-start justify-between gap-4 border-b border-gray-100 last:border-0">
    <span className="text-gray-500 text-[13px] font-medium flex-shrink-0 w-32">{label}</span>
    <span className={`text-gray-900 text-[13px] font-semibold text-right break-all flex-1 ${mono ? 'font-mono tracking-tight text-blue-700' : ''}`}>
      {value || "—"}
    </span>
  </div>
);

// ── Premium Modal Component ───────────────────────────────────
const Modal = ({ open, onClose, title, icon: Icon, children, width = "max-w-md" }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div
        style={{ padding: "10px" }}
        className={`relative bg-white rounded-lg w-full ${width} max-h-[90vh] flex flex-col shadow-2xl overflow-hidden transform transition-all`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white">
          <div className="flex items-center gap-3">
            {Icon && <div className="p-2 bg-teal-50 rounded-sm text-teal-600"><Icon className="w-5 h-5" /></div>}
            <h3 className="font-bold text-gray-900 text-base">{title}</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 hover:bg-gray-100 w-8 h-8 flex items-center justify-center rounded-full transition-colors">
            ✕
          </button>
        </div>
        <div className="p-6 overflow-y-auto custom-scrollbar bg-gray-50/30">
          {children}
        </div>
      </div>
    </div>
  );
};

// ── Main component ────────────────────────────────────────────
export default function MerchantApplication() {
  const queryClient = useQueryClient();
  const { user } = useSelector((s) => s.auth);
  const isSuperAdmin = user?.role === "superAdmin";
  const isMerchantAdmin = user?.role === "merchantAdmin";

  const [tab, setTab] = useState(""); // "" = All, pending, approved, rejected, frozen
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  
  // Filter Inputs
  const [merchantIdInput, setMerchantIdInput] = useState("");
  const [nameInput, setNameInput] = useState("");

  // Active Filter States (Sent to backend on Submit)
  const [activeFilters, setActiveFilters] = useState({ storeName: "", merchantId: "" });

  const [modal, setModal] = useState(false);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    setPage(1);
  }, [tab]);

  // ── Fetch Logic ────────────────────────────────────────────
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["merchant-apps", tab, page, limit, activeFilters],
    queryFn: async () => {
      const p = new URLSearchParams({ page, limit });
      if (tab) p.set("status", tab);
      if (activeFilters.merchantId) p.set("merchantId", activeFilters.merchantId);
      if (activeFilters.storeName) p.set("storeName", activeFilters.storeName);

      const { data } = await API.get(`/merchants?${p.toString()}`);
      return data;
    },
    keepPreviousData: true,
  });

  const apps = data?.merchants || [];
  const total = data?.total || 0;
  const totalPages = data?.pages || Math.ceil(total / limit) || 1;

  const invalidate = () => queryClient.invalidateQueries(["merchant-apps"]);

  const handleSearch = () => {
    setActiveFilters({
      merchantId: merchantIdInput.trim(),
      storeName: nameInput.trim(),
    });
    setPage(1);
  };

  const handleReset = () => {
    setMerchantIdInput("");
    setNameInput("");
    setActiveFilters({ storeName: "", merchantId: "" });
    setPage(1);
  };

  // ── Status Update Mutation ──────────────────────────────────
  const updateStatus = useMutation({
    mutationFn: ({ id, status }) => API.put(`/merchants/${id}/status`, { status }),
    onSuccess: (_, { status }) => {
      invalidate();
      const labels = { approved: '✅ Approved!', rejected: '✕ Rejected', frozen: '🧊 Frozen', pending: 'Set to Pending' };
      toast.success(labels[status] || 'Status updated successfully!');
      closeModal();
    },
    onError: (e) => toast.error(e.response?.data?.message || "Failed to update status"),
  });

  const openReview = (app) => { setSelected(app); setModal(true); };
  const closeModal = () => { setModal(false); setSelected(null); };

  const getPageNums = () => {
    if (totalPages <= 5) return [...Array(totalPages)].map((_, i) => i + 1);
    if (page <= 3) return [1, 2, 3, 4, 5];
    if (page >= totalPages - 2) return [totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [page - 2, page - 1, page, page + 1, page + 2];
  };

  const tabs = [
    { key: "", label: "All Records" },
    { key: "pending", label: "Pending Review" },
    { key: "approved", label: "Approved" },
    { key: "rejected", label: "Rejected" },
    { key: "frozen", label: "Frozen" },
  ];

  return (
    <div style={{ padding: "20px" }} className="p-20 md:p-6 bg-gray-50 min-h-screen w-full max-w-full overflow-hidden">
      
      <div className="mb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Store Applications</h1>
          <p className="text-[13px] text-gray-500 mt-1">
            {total.toLocaleString()} merchant registrations found.
          </p>
        </div>
      </div>

      {isMerchantAdmin && (
        <div style={{ padding: "10px", marginBottom: "15px" }} className="bg-blue-50 border border-blue-200 rounded-md flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <p className="text-[13px] text-blue-800">
            You can <strong>view</strong> applications for merchants that registered via your referral. Only <strong>Super Admins</strong> can approve, reject, or freeze stores.
          </p>
        </div>
      )}

      {/* ── Top Tabs (Demo Style) ── */}
      <div style={{ padding: "5px", marginBottom: "15px" }} className="bg-white rounded-md p-4 border border-gray-100 w-full shadow-sm">
        <div className="flex items-center gap-2 overflow-x-auto w-full">
          {tabs.map((t) => (
            <button
              key={t.key}
              style={{ padding: "8px 24px" }}
              onClick={() => setTab(t.key)}
              className={`rounded-sm text-[13px] font-semibold transition-all whitespace-nowrap ${
                tab === t.key ? "bg-slate-800 text-white shadow-md" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Visual Filter Grid ── */}
      <div style={{ padding: "5px" }} className="bg-white rounded-md p-6 border border-gray-100 mb-6 w-full shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
          <FormInput label="Merchant ID" placeholder="Search by exact Merchant ID" value={merchantIdInput} onChange={(e) => setMerchantIdInput(e.target.value)} />
          <FormInput label="Merchant/Store Name" placeholder="Search by Store Name" value={nameInput} onChange={(e) => setNameInput(e.target.value)} />
        </div>
        <div style={{ paddingTop: "5px", paddingBottom: "5px" }} className="flex justify-end gap-3 pt-2 border-t border-gray-100">
          <button style={{ padding: "5px 20px" }} onClick={handleReset} className="bg-white border border-gray-200 text-gray-700 text-[13px] font-semibold rounded-sm hover:bg-gray-50 transition-colors shadow-sm">
            Reset
          </button>
          <button style={{ padding: "5px 20px" }} onClick={handleSearch} className="bg-teal-500 hover:bg-teal-600 text-white text-[13px] font-semibold rounded-sm transition-colors shadow-sm">
            Search
          </button>
        </div>
      </div>

      {/* ── Data Table Container ── */}
      <div style={{ padding: "5px" }} className="bg-white border border-gray-100 rounded-md flex flex-col w-full overflow-hidden shadow-sm">
        <div style={{ padding: "10px" }} className="border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
          <h2 className="text-[14px] font-bold text-gray-800">Application Directory</h2>
          <button style={{ padding: "8px" }} onClick={() => invalidate()} className="rounded-sm bg-slate-700 hover:bg-slate-800 text-white transition-colors flex items-center justify-center shadow-sm">
            <RefreshCcw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
          </button>
        </div>

        <div className="w-full overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[1200px]">
            <thead>
              {/* Mapped Exactly to Demo Headers */}
              <tr className="border-b border-gray-100 text-gray-500 text-[12px] font-bold bg-white">
                <th style={{ padding: "12px 15px" }} className="text-center w-10">
                  <input type="checkbox" className="rounded border-gray-300" />
                </th>
                <th style={{ padding: "12px 15px" }}>ID</th>
                <th style={{ padding: "12px 15px" }}>Store Name</th>
                <th style={{ padding: "12px 15px" }}>Merchant ID</th>
                <th style={{ padding: "12px 15px" }}>Owner Info</th>
                <th style={{ padding: "12px 15px" }}>Referrer</th>
                <th style={{ padding: "12px 15px" }}>Phone Number</th>
                <th style={{ padding: "12px 15px" }}>Status</th>
                <th style={{ padding: "12px 15px" }}>Creation Time</th>
                <th style={{ padding: "12px 15px" }} className="text-center">Operate</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="10" className="py-24 text-center">
                    <Loader2 className="w-8 h-8 text-teal-500 animate-spin mx-auto mb-2" />
                    <p className="text-gray-500 text-[13px]">Loading applications...</p>
                  </td>
                </tr>
              ) : apps.length === 0 ? (
                <tr><td colSpan="10" className="text-center py-20 text-gray-500 text-[13px]">No merchant applications found.</td></tr>
              ) : (
                apps.map((app) => {
                  // Status Dot Logic matching Demo
                  let dotColor = "bg-gray-400";
                  let statusText = "Pending Review";
                  if (app.status === "approved") { dotColor = "bg-emerald-500"; statusText = "Approved"; }
                  else if (app.status === "rejected") { dotColor = "bg-red-500"; statusText = "Rejected"; }
                  else if (app.status === "frozen") { dotColor = "bg-blue-500"; statusText = "Frozen"; }
                  else if (app.status === "pending") { dotColor = "bg-slate-700"; statusText = "Pending Review"; }

                  return (
                    <tr key={app._id} className="border-b border-gray-50 hover:bg-slate-50/50 transition-colors group">
                      <td style={{ padding: "12px 15px" }} className="text-center">
                        <input type="checkbox" className="rounded border-gray-300" />
                      </td>
                      <td style={{ padding: "12px 15px" }} className="text-[13px] text-gray-500 font-mono">{app._id.slice(-5).toUpperCase()}</td>
                      
                      <td style={{ padding: "12px 15px" }}>
                        <div className="flex items-center gap-2">
                           <div className="w-8 h-8 rounded-sm bg-gray-100 flex items-center justify-center border border-gray-200 overflow-hidden">
                             {app.storeLogo ? <img src={app.storeLogo} alt="logo" className="w-full h-full object-cover" /> : <span className="text-[10px] text-gray-400 font-bold">IMG</span>}
                           </div>
                           <span className="text-[13px] text-gray-800 font-bold">{app.storeName || "—"}</span>
                        </div>
                      </td>

                      <td style={{ padding: "12px 15px" }} className="text-[13px] text-blue-700 font-mono font-semibold">{app.merchantId || "—"}</td>
                      <td style={{ padding: "12px 15px" }} className="text-[13px] text-gray-700">{app.realName || app.user?.email || "—"}</td>
                      <td style={{ padding: "12px 15px" }} className="text-[13px] text-gray-600 font-medium">{app.referrer?.username || "Direct Registration"}</td>
                      <td style={{ padding: "12px 15px" }} className="text-[13px] text-gray-600">{app.storePhone || "—"}</td>
                      <td style={{ padding: "12px 15px" }}>
                        <div className="flex items-center gap-2">
                          <span className={`w-2.5 h-2.5 rounded-full ${dotColor}`}></span>
                          <span className={`text-[12px] font-bold ${app.status === 'rejected' ? 'text-red-600' : 'text-slate-700'}`}>
                            {statusText}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: "12px 15px" }} className="text-[13px] text-gray-500">
                        {new Date(app.createdAt).toLocaleString("en-CA")}
                      </td>
                      <td style={{ padding: "12px 15px" }} className="text-center">
                        <div className="flex items-center justify-center w-full">
                          {isSuperAdmin ? (
                             <ActionBtn color={app.status === "pending" ? "#334155" : "#059669"} label={app.status === "pending" ? "Review" : "Manage"} onClick={() => openReview(app)} />
                          ) : (
                             <ActionBtn color="#3b82f6" label="View Details" onClick={() => openReview(app)} />
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div style={{ padding: "5px" }} className="flex flex-col sm:flex-row items-center justify-between p-5 border-t border-gray-100 bg-gray-50/50">
          <div className="text-[13px] text-gray-500 flex items-center gap-2 font-medium">
            Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} rows
            <select style={{ padding: "5px" }} value={limit} onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }} className="ml-2 border border-gray-200 rounded-sm px-2 py-1 focus:outline-none focus:border-teal-500 bg-white font-semibold text-gray-700">
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
          <div className="flex items-center gap-1.5">
            <button style={{ padding: "5px" }} onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-1.5 border border-gray-200 rounded-sm text-[13px] font-semibold bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors shadow-sm">Prev</button>
            {getPageNums().map((n, idx) => n === "..." ? (
                <span key={`dots-${idx}`} className="px-2 text-gray-400">...</span>
              ) : (
                <button style={{ padding: "5px" }} key={n} onClick={() => setPage(n)} className={`min-w-[36px] px-2 py-1.5 rounded-sm text-[13px] font-bold transition-colors shadow-sm ${n === page ? "bg-slate-800 text-white border border-slate-800" : "bg-white border border-gray-200 hover:bg-gray-50 text-gray-700"}`}>
                  {n}
                </button>
            ))}
            <button style={{ padding: "5px" }} onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages || totalPages === 0} className="px-4 py-1.5 border border-gray-200 rounded-sm text-[13px] font-semibold bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors shadow-sm">Next</button>
          </div>
        </div>
      </div>

      {/* ════════════ REVIEW/DETAILS MODAL ════════════ */}
      <Modal open={modal} onClose={closeModal} title={isSuperAdmin ? "Review Store Application" : "Store Details"} icon={FileText} width="max-w-lg">
        {selected && (
          <div className="space-y-4">
            
            <div className="flex items-center gap-4 bg-gray-50 border border-gray-200 rounded-sm p-4 mb-4">
               <div className="w-14 h-14 bg-white border border-gray-200 rounded-sm flex items-center justify-center overflow-hidden">
                 {selected.storeLogo ? <img src={selected.storeLogo} alt="Logo" className="w-full h-full object-cover"/> : <span className="text-gray-400 text-xs font-bold">NO LOGO</span>}
               </div>
               <div>
                 <h4 className="text-[16px] font-bold text-gray-900">{selected.storeName}</h4>
                 <p className="text-[12px] text-gray-500 font-mono mt-0.5">ID: {selected.merchantId}</p>
               </div>
            </div>

            <div className="bg-white rounded-md border border-gray-200 p-2 shadow-sm mb-4">
              <Field label="Owner Email" value={selected.user?.email} />
              <Field label="Phone Number" value={selected.storePhone} />
              <Field label="Referred By" value={selected.referrer?.username || "Direct Registration"} />
              <Field label="Identity (Real Name)" value={selected.realName} />
              <Field label="Identity (ID Card)" value={selected.idCardNumber} mono />
              <Field label="Current Status" value={selected.status.toUpperCase()} />
              <Field label="Applied On" value={new Date(selected.createdAt).toLocaleString()} />
            </div>

            {isSuperAdmin && (
              <>
                <p className="text-gray-600 text-[13px] font-bold mb-2">Change Application Status</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-gray-100">
                  <button
                    style={{ padding: "8px" }}
                    onClick={() => updateStatus.mutate({ id: selected._id, status: "approved" })}
                    disabled={updateStatus.isPending || selected.status === "approved"}
                    className="w-full bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-500 hover:text-white rounded-sm font-bold text-[12px] disabled:opacity-50 transition-all flex flex-col items-center justify-center gap-1 shadow-sm"
                  >
                    <CheckCircle className="w-4 h-4" /> Approve
                  </button>
                  
                  <button
                    style={{ padding: "8px" }}
                    onClick={() => updateStatus.mutate({ id: selected._id, status: "rejected" })}
                    disabled={updateStatus.isPending || selected.status === "rejected"}
                    className="w-full bg-red-50 border border-red-200 text-red-600 hover:bg-red-500 hover:text-white rounded-sm font-bold text-[12px] disabled:opacity-50 transition-all flex flex-col items-center justify-center gap-1 shadow-sm"
                  >
                    <XCircle className="w-4 h-4" /> Reject
                  </button>

                  <button
                    style={{ padding: "8px" }}
                    onClick={() => updateStatus.mutate({ id: selected._id, status: "frozen" })}
                    disabled={updateStatus.isPending || selected.status === "frozen"}
                    className="w-full bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-500 hover:text-white rounded-sm font-bold text-[12px] disabled:opacity-50 transition-all flex flex-col items-center justify-center gap-1 shadow-sm"
                  >
                    <Snowflake className="w-4 h-4" /> Freeze
                  </button>

                  <button
                    style={{ padding: "8px" }}
                    onClick={() => updateStatus.mutate({ id: selected._id, status: "pending" })}
                    disabled={updateStatus.isPending || selected.status === "pending"}
                    className="w-full bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-500 hover:text-white rounded-sm font-bold text-[12px] disabled:opacity-50 transition-all flex flex-col items-center justify-center gap-1 shadow-sm"
                  >
                    <RefreshCcw className="w-4 h-4" /> Pending
                  </button>
                </div>
              </>
            )}

            {!isSuperAdmin && (
              <button
                style={{ padding: "8px" }}
                onClick={closeModal}
                className="w-full mt-2 bg-slate-800 hover:bg-slate-900 text-white rounded-sm font-bold text-[13px] transition-colors shadow-sm"
              >
                Close Details
              </button>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}