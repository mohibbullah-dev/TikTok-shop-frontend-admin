// import { useState, useEffect } from 'react'
// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
// import { toast } from 'react-toastify'
// import { useNavigate } from 'react-router-dom'
// import { useSelector } from 'react-redux'
// import API from '../../api/axios'

// // ─── Reusable UI components ───────────────────────────────────

// const Badge = ({ color, children }) => (
//   <span className="px-2 py-0.5 rounded-full text-[10px] font-bold"
//     style={{ background: color + '20', color }}>
//     {children}
//   </span>
// )

// const Modal = ({ open, onClose, title, children, width = 'max-w-md' }) => {
//   if (!open) return null
//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
//       <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"
//         onClick={onClose}/>
//       <div className={`relative bg-white rounded-2xl w-full ${width} max-h-[90vh] overflow-y-auto`}
//         style={{ boxShadow: '0 25px 50px rgba(0,0,0,0.25)' }}>
//         <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
//           <p className="font-bold text-gray-800 text-sm">{title}</p>
//           <button onClick={onClose}
//             className="w-8 h-8 rounded-md bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-all text-sm">
//             ✕
//           </button>
//         </div>
//         <div className="p-6">{children}</div>
//       </div>
//     </div>
//   )
// }

// const Field = ({ label, value, mono }) => (
//   <div className="py-2.5 flex items-start justify-between gap-4 border-b border-gray-50 last:border-0">
//     <span className="text-gray-400 text-xs flex-shrink-0">{label}</span>
//     <span className={`text-gray-800 text-xs font-semibold text-right ${mono ? 'font-mono' : ''}`}>
//       {value || '—'}
//     </span>
//   </div>
// )

// const FormInput = ({ label, ...props }) => (
//   <div>
//     {label && <label className="text-gray-600 text-xs font-medium block mb-1.5">{label}</label>}
//     <input
//       className="w-full px-4 py-2.5 rounded-md border border-gray-200 text-gray-700 text-sm outline-none focus:border-pink-400 transition-all bg-gray-50 focus:bg-white"
//       {...props}
//     />
//   </div>
// )

// const ActionBtn = ({ onClick, color, title, children, disabled }) => (
//   <button onClick={onClick} disabled={disabled} title={title}
//     className="w-7 h-7 rounded-sm flex items-center justify-center text-sm transition-all hover:scale-110 active:scale-95 disabled:opacity-40"
//     style={{ background: color + '18', color }}>
//     {children}
//   </button>
// )

// const VipBadge = ({ level = 0 }) => {
//   const colors = ['#9ca3af','#cd7f32','#aaaaaa','#f59e0b','#06b6d4','#9c27b0','#f02d65']
//   return (
//     <span className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white"
//       style={{ background: colors[level] || '#9ca3af' }}>
//       VIP{level}
//     </span>
//   )
// }

// // ─── Main component ───────────────────────────────────────────
// export default function MerchantList() {
//   const queryClient = useQueryClient()
//   const navigate    = useNavigate()
//   const { user }    = useSelector(s => s.auth)
//   const isSuperAdmin    = user?.role === 'superAdmin'
//   const isMerchantAdmin = user?.role === 'merchantAdmin'

//   // ── Filters ────────────────────────────────────────────────
//   const [search,   setSearch]   = useState('')
//   const [status,   setStatus]   = useState('')
//   const [vipLevel, setVipLevel] = useState('')
//   const [page,     setPage]     = useState(1)
//   const limit = 10

//   useEffect(() => setPage(1), [search, status, vipLevel])

//   // ── Modal state ────────────────────────────────────────────
//   const [modal,    setModal]    = useState(null) // 'funds'|'recharge'|'edit'|'detail'|'bankcard'
//   const [selected, setSelected] = useState(null)

//   // Modal forms
//   const [fundAmount, setFundAmount] = useState('')
//   const [fundType,   setFundType]   = useState('add')
//   const [fundNote,   setFundNote]   = useState('')
//   const [rcAmount,   setRcAmount]   = useState('')
//   const [editForm,   setEditForm]   = useState({})

//   const openModal = (type, merchant) => {
//     setSelected(merchant)
//     setModal(type)
//     if (type === 'edit') setEditForm({
//       storeName:   merchant.storeName   || '',
//       storePhone:  merchant.storePhone  || '',
//       creditScore: merchant.creditScore ?? 100,
//       vipLevel:    merchant.vipLevel    ?? 0,
//     })
//   }
//   const closeModal = () => { setModal(null); setSelected(null) }

//   // ── Fetch ──────────────────────────────────────────────────
//   const { data, isLoading, isFetching } = useQuery({
//     queryKey: ['merchants', page, search, status, vipLevel],
//     queryFn: async () => {
//       const p = new URLSearchParams({ page, limit,
//         ...(search   && { search }),
//         ...(status   && { status }),
//         ...(vipLevel && { vipLevel }),
//       })
//       const { data } = await API.get(`/merchants?${p}`)
//       return data
//     },
//     keepPreviousData: true,
//   })

//   const merchants  = data?.merchants || []
//   const total      = data?.total     || 0
//   const totalPages = Math.ceil(total / limit)

//   // ── Mutations ──────────────────────────────────────────────
//   const invalidate = () => queryClient.invalidateQueries(['merchants'])

//   const toggleWithdrawal = useMutation({
//     mutationFn: (m) => API.put(`/merchants/${m._id}/withdrawal-status`),
//     onSuccess: () => { invalidate(); toast.success('Updated!') },
//     onError:   (e) => toast.error(e.response?.data?.message || 'Failed'),
//   })

//   const adjustFunds = useMutation({
//   mutationFn: () => API.post(
//   `/merchants/${selected._id}/${fundType === 'add' ? 'add-funds' : 'deduct-funds'}`,
//   { amount: parseFloat(fundAmount), note: fundNote }
// ),
//     onSuccess: () => {
//       invalidate()
//       toast.success(`Funds ${fundType === 'add' ? 'added' : 'deducted'}!`)
//       setFundAmount(''); setFundNote(''); closeModal()
//     },
//     onError: (e) => toast.error(e.response?.data?.message || 'Failed'),
//   })

//   const manualRecharge = useMutation({
//     mutationFn: () => API.post(`/merchants/${selected._id}/manual-recharge`, {
//       amount: parseFloat(rcAmount)
//     }),
//     onSuccess: () => {
//       invalidate()
//       toast.success('Recharge successful!')
//       setRcAmount(''); closeModal()
//     },
//     onError: (e) => toast.error(e.response?.data?.message || 'Failed'),
//   })

//   const editMerchant = useMutation({
//     mutationFn: () => API.put(`/merchants/${selected._id}`, editForm),
//     onSuccess: () => {
//       invalidate(); toast.success('Saved!'); closeModal()
//     },
//     onError: (e) => toast.error(e.response?.data?.message || 'Failed'),
//   })

//   // ── Pagination helper ──────────────────────────────────────
//   const getPageNums = () => {
//     if (totalPages <= 5) return [...Array(totalPages)].map((_,i)=>i+1)
//     if (page <= 3)            return [1,2,3,4,5]
//     if (page >= totalPages-2) return [totalPages-4,totalPages-3,totalPages-2,totalPages-1,totalPages]
//     return [page-2,page-1,page,page+1,page+2]
//   }

//   return (
//     <div className="space-y-4">

//       {/* ── Header ── */}
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-xl font-extrabold text-gray-800 tracking-tight">
//             Merchant List
//           </h1>
//           <p className="text-gray-400 text-sm mt-0.5">
//             {total} merchants registered
//           </p>
//         </div>
//       </div>

//       {/* ── Filter bar ── */}
//       <div className="bg-white rounded-2xl p-4 flex flex-col sm:flex-row gap-3"
//         style={{ boxShadow: '0 1px 12px rgba(0,0,0,0.07)' }}>

//         {/* Search */}
//         <div className="relative flex-1 min-w-0">
//           <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
//             fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
//             <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
//           </svg>
//           <input value={search} onChange={e => setSearch(e.target.value)}
//             placeholder="Search name, ID, email..."
//             className="w-full pl-9 pr-4 py-2.5 rounded-md border border-gray-200 text-sm outline-none focus:border-pink-400 bg-gray-50 focus:bg-white transition-all"
//           />
//         </div>

//         {/* Status */}
//         <select value={status} onChange={e => setStatus(e.target.value)}
//           className="px-3 py-2.5 rounded-md border border-gray-200 text-sm text-gray-600 outline-none focus:border-pink-400 bg-gray-50 min-w-[120px]">
//           <option value="">All Status</option>
//           <option value="active">Active</option>
//           <option value="inactive">Inactive</option>
//         </select>

//         {/* VIP */}
//         <select value={vipLevel} onChange={e => setVipLevel(e.target.value)}
//           className="px-3 py-2.5 rounded-md border border-gray-200 text-sm text-gray-600 outline-none focus:border-pink-400 bg-gray-50 min-w-[100px]">
//           <option value="">All VIP</option>
//           {[0,1,2,3,4,5,6].map(v => (
//             <option key={v} value={v}>VIP{v}</option>
//           ))}
//         </select>

//         {/* Refresh */}
//         <button onClick={() => invalidate()}
//           className="px-4 py-2.5 rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50 text-sm flex items-center gap-2 transition-all">
//           <svg className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`}
//             fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
//             <polyline points="23 4 23 10 17 10"/>
//             <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/>
//           </svg>
//           <span className="hidden sm:inline">Refresh</span>
//         </button>
//       </div>

//       {/* ── Table ── */}
//       <div className="bg-white rounded-2xl overflow-hidden"
//         style={{ boxShadow: '0 1px 12px rgba(0,0,0,0.07)' }}>
//         <div className="overflow-x-auto">
//           <table className="w-full" style={{ minWidth: 960 }}>
//             <thead style={{ background: '#f8fafc' }}>
//               <tr>
//                 {['#','Merchant','Balance','VIP','Status','Withdrawal','Credit','Joined','Actions'].map(h => (
//                   <th key={h} className="px-4 py-3 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">
//                     {h}
//                   </th>
//                 ))}
//               </tr>
//             </thead>

//             <tbody>
//               {isLoading ? (
//                 [...Array(8)].map((_, i) => (
//                   <tr key={i} className="border-t border-gray-50">
//                     {[...Array(9)].map((_, j) => (
//                       <td key={j} className="px-4 py-4">
//                         <div className="h-3 bg-gray-100 rounded animate-pulse"
//                           style={{ width: `${50 + Math.random()*40}%` }}/>
//                       </td>
//                     ))}
//                   </tr>
//                 ))
//               ) : merchants.length === 0 ? (
//                 <tr>
//                   <td colSpan={9} className="text-center py-20">
//                     <div className="flex flex-col items-center gap-3">
//                       <span className="text-6xl">🏪</span>
//                       <p className="text-gray-400 text-sm font-medium">No merchants found</p>
//                       <p className="text-gray-300 text-xs">Try adjusting your filters</p>
//                     </div>
//                   </td>
//                 </tr>
//               ) : merchants.map((m, i) => (
//                 <tr key={m._id}
//                   className="border-t border-gray-50 hover:bg-slate-50/60 transition-colors group">

//                   {/* # */}
//                   <td className="px-4 py-3.5">
//                     <span className="text-gray-400 text-xs">
//                       {(page - 1) * limit + i + 1}
//                     </span>
//                   </td>

//                   {/* Merchant */}
//                   <td className="px-4 py-3.5">
//                     <div className="flex items-center gap-3">
//                       <div className="w-9 h-9 rounded-md overflow-hidden bg-gray-100 flex-shrink-0 flex items-center justify-center">
//                         {m.storeLogo
//                           ? <img src={m.storeLogo} alt="" className="w-full h-full object-cover"/>
//                           : <span>🏪</span>}
//                       </div>
//                       <div className="min-w-0">
//                         <p className="text-gray-800 text-sm font-semibold leading-tight truncate max-w-[160px]">
//                           {m.storeName}
//                         </p>
//                         <p className="text-gray-400 text-[10px]">ID: {m.merchantId}</p>
//                         <p className="text-gray-400 text-[10px] truncate max-w-[160px]">
//                           {m.user?.email}
//                         </p>
//                       </div>
//                     </div>
//                   </td>

//                   {/* Balance */}
//                   <td className="px-4 py-3.5">
//                     <p className="text-gray-800 text-sm font-bold">
//                       ${(m.balance || 0).toFixed(2)}
//                     </p>
//                     {(m.pendingAmount || 0) > 0 && (
//                       <p className="text-orange-400 text-[10px]">
//                         +${m.pendingAmount.toFixed(2)} pending
//                       </p>
//                     )}
//                   </td>

//                   {/* VIP */}
//                   <td className="px-4 py-3.5">
//                     <VipBadge level={m.vipLevel}/>
//                   </td>

//                   {/* Status */}
//                   <td className="px-4 py-3.5">
//                     <Badge color={m.isActive ? '#22c55e' : '#ef4444'}>
//                       {m.isActive ? 'Active' : 'Inactive'}
//                     </Badge>
//                   </td>

//                   {/* Withdrawal */}
//                   <td className="px-4 py-3.5">
//                     <Badge color={m.withdrawalForbidden ? '#ef4444' : '#22c55e'}>
//                       {m.withdrawalForbidden ? 'Forbidden' : 'Allowed'}
//                     </Badge>
//                   </td>

//                   {/* Credit */}
//                   <td className="px-4 py-3.5">
//                     <div className="flex items-center gap-2">
//                       <div className="w-14 h-1.5 bg-gray-100 rounded-full overflow-hidden flex-shrink-0">
//                         <div className="h-full rounded-full transition-all"
//                           style={{
//                             width: `${m.creditScore || 0}%`,
//                             background: (m.creditScore||0) >= 80 ? '#22c55e' : '#f59e0b'
//                           }}/>
//                       </div>
//                       <span className="text-gray-600 text-xs font-semibold">
//                         {m.creditScore ?? 100}
//                       </span>
//                     </div>
//                   </td>

//                   {/* Joined */}
//                   <td className="px-4 py-3.5">
//                     <span className="text-gray-500 text-xs whitespace-nowrap">
//                       {new Date(m.createdAt).toLocaleDateString('en-US',{
//                         month:'short', day:'numeric', year:'2-digit'
//                       })}
//                     </span>
//                   </td>

//                   {/* Actions */}
//                   <td className="px-4 py-3.5">
//                     <div className="flex items-center gap-1">
//                       {/* Detail */}
//                       <ActionBtn color="#6366f1" title="View Details"
//                         onClick={() => openModal('detail', m)}>
//                         👁️
//                       </ActionBtn>

//                       {/* Fund details */}
//                       <ActionBtn color="#06b6d4" title="Fund Details"
//                         onClick={() => navigate(`/merchants/funds?merchantId=${m._id}&name=${encodeURIComponent(m.storeName)}`)}>
//                         📋
//                       </ActionBtn>

//                       {/* Bank card */}
//                       <ActionBtn color="#8b5cf6" title="Bank Cards"
//                         onClick={() => openModal('bankcard', m)}>
//                         🏦
//                       </ActionBtn>

//                       {(isSuperAdmin || isMerchantAdmin) && (
//                         <ActionBtn
//                           color={m.withdrawalForbidden ? '#22c55e' : '#f59e0b'}
//                           title={m.withdrawalForbidden ? 'Allow Withdrawal' : 'Forbid Withdrawal'}
//                           onClick={() => toggleWithdrawal.mutate(m)}>
//                           {m.withdrawalForbidden ? '✅' : '🚫'}
//                         </ActionBtn>
//                       )}

//                       {isSuperAdmin && (<>
//                         <ActionBtn color="#22c55e" title="Add Funds"
//                           onClick={() => { setFundType('add'); openModal('funds', m) }}>
//                           ➕
//                         </ActionBtn>
//                         <ActionBtn color="#ef4444" title="Deduct Funds"
//                           onClick={() => { setFundType('deduct'); openModal('funds', m) }}>
//                           ➖
//                         </ActionBtn>
//                         <ActionBtn color="#f02d65" title="Manual Recharge"
//                           onClick={() => openModal('recharge', m)}>
//                           💳
//                         </ActionBtn>
//                         <ActionBtn color="#f59e0b" title="Edit"
//                           onClick={() => openModal('edit', m)}>
//                           ✏️
//                         </ActionBtn>
//                       </>)}
//                     </div>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>

//         {/* Pagination */}
//         {totalPages > 1 && (
//           <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
//             <p className="text-gray-400 text-xs">
//               Showing {(page-1)*limit+1}–{Math.min(page*limit,total)} of {total}
//             </p>
//             <div className="flex items-center gap-1">
//               <button onClick={() => setPage(1)} disabled={page===1}
//                 className="w-8 h-8 rounded-sm text-gray-400 hover:bg-gray-100 disabled:opacity-30 transition-all text-sm">
//                 «
//               </button>
//               <button onClick={() => setPage(p => p-1)} disabled={page===1}
//                 className="w-8 h-8 rounded-sm text-gray-400 hover:bg-gray-100 disabled:opacity-30 transition-all text-sm">
//                 ‹
//               </button>
//               {getPageNums().map(n => (
//                 <button key={n} onClick={() => setPage(n)}
//                   className="w-8 h-8 rounded-sm text-xs font-semibold transition-all"
//                   style={n === page
//                     ? { background:'#f02d65', color:'white' }
//                     : { color:'#6b7280' }}>
//                   {n}
//                 </button>
//               ))}
//               <button onClick={() => setPage(p => p+1)} disabled={page===totalPages}
//                 className="w-8 h-8 rounded-sm text-gray-400 hover:bg-gray-100 disabled:opacity-30 transition-all text-sm">
//                 ›
//               </button>
//               <button onClick={() => setPage(totalPages)} disabled={page===totalPages}
//                 className="w-8 h-8 rounded-sm text-gray-400 hover:bg-gray-100 disabled:opacity-30 transition-all text-sm">
//                 »
//               </button>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* ════════════ MODALS ════════════ */}

//       {/* Detail */}
//       <Modal open={modal==='detail'} onClose={closeModal}
//         title={`👁️ ${selected?.storeName}`} width="max-w-lg">
//         <div className="space-y-0">
//           <Field label="Store Name"    value={selected?.storeName}/>
//           <Field label="Merchant ID"   value={selected?.merchantId}/>
//           <Field label="Email"         value={selected?.user?.email}/>
//           <Field label="Phone"         value={selected?.storePhone}/>
//           <Field label="VIP Level"     value={`VIP${selected?.vipLevel ?? 0}`}/>
//           <Field label="Balance"       value={`$${(selected?.balance||0).toFixed(2)}`}/>
//           <Field label="Total Profit"  value={`$${(selected?.totalProfit||0).toFixed(2)}`}/>
//           <Field label="Credit Score"  value={`${selected?.creditScore ?? 100}/100`}/>
//           <Field label="Star Rating"   value={`${(selected?.starRating||0).toFixed(1)} / 5.0`}/>
//           <Field label="Status"        value={selected?.isActive ? 'Active' : 'Inactive'}/>
//           <Field label="Withdrawal"    value={selected?.withdrawalForbidden ? 'Forbidden' : 'Allowed'}/>
//           <Field label="Invitation By" value={selected?.invitedBy || 'Direct'}/>
//           <Field label="Joined"        value={selected?.createdAt
//             ? new Date(selected.createdAt).toLocaleString() : ''}/>
//           <Field label="Address"       value={selected?.storeAddress}/>
//         </div>
//         <div className="pt-4">
//           <button onClick={closeModal}
//             className="w-full py-2.5 rounded-md border border-gray-200 text-gray-500 text-sm hover:bg-gray-50 transition-all">
//             Close
//           </button>
//         </div>
//       </Modal>

//       {/* Add / Deduct Funds */}
//       <Modal open={modal==='funds'} onClose={closeModal}
//         title={`${fundType==='add'?'➕ Add':'➖ Deduct'} Funds — ${selected?.storeName}`}>
//         <div className="space-y-4">
//           {/* Balance */}
//           <div className="p-3 rounded-md" style={{ background:'#f8fafc' }}>
//             <p className="text-gray-500 text-xs">Current Balance</p>
//             <p className="text-gray-800 font-extrabold text-xl">
//               ${(selected?.balance||0).toFixed(2)}
//             </p>
//           </div>
//           {/* Type toggle */}
//           <div className="grid grid-cols-2 gap-2">
//             {['add','deduct'].map(t => (
//               <button key={t} onClick={() => setFundType(t)}
//                 className="py-2.5 rounded-md font-semibold text-sm transition-all"
//                 style={fundType===t
//                   ? { background: t==='add'?'#22c55e':'#ef4444', color:'white' }
//                   : { background:'#f3f4f6', color:'#6b7280' }}>
//                 {t==='add' ? '➕ Add Funds' : '➖ Deduct'}
//               </button>
//             ))}
//           </div>
//           <FormInput label="Amount (USD)" type="number" min="0.01" step="0.01"
//             placeholder="0.00" value={fundAmount}
//             onChange={e => setFundAmount(e.target.value)}/>
//           <FormInput label="Note (optional)" placeholder="Reason..."
//             value={fundNote} onChange={e => setFundNote(e.target.value)}/>
//           <div className="flex gap-3 pt-1">
//             <button onClick={closeModal}
//               className="flex-1 py-2.5 rounded-md border border-gray-200 text-gray-500 text-sm hover:bg-gray-50 transition-all">
//               Cancel
//             </button>
//             <button
//               onClick={() => adjustFunds.mutate()}
//               disabled={!fundAmount || adjustFunds.isPending}
//               className="flex-1 py-2.5 rounded-md text-white font-bold text-sm transition-all disabled:opacity-50"
//               style={{ background: fundType==='add'?'#22c55e':'#ef4444' }}>
//               {adjustFunds.isPending ? 'Processing...'
//                 : `Confirm ${fundType==='add'?'Add':'Deduct'}`}
//             </button>
//           </div>
//         </div>
//       </Modal>

//       {/* Manual Recharge */}
//       <Modal open={modal==='recharge'} onClose={closeModal}
//         title={`💳 Manual Recharge — ${selected?.storeName}`}>
//         <div className="space-y-4">
//           <div className="p-3 rounded-md" style={{ background:'#f8fafc' }}>
//             <p className="text-gray-500 text-xs">Current Balance</p>
//             <p className="text-gray-800 font-extrabold text-xl">
//               ${(selected?.balance||0).toFixed(2)}
//             </p>
//           </div>
//           <FormInput label="Recharge Amount (USD)" type="number"
//             min="1" step="0.01" placeholder="0.00"
//             value={rcAmount} onChange={e => setRcAmount(e.target.value)}/>
//           <div className="p-3 rounded-md border border-yellow-200"
//             style={{ background:'#fefce8' }}>
//             <p className="text-yellow-700 text-xs">
//               ⚠️ This directly adds funds and creates a recharge record.
//             </p>
//           </div>
//           <div className="flex gap-3 pt-1">
//             <button onClick={closeModal}
//               className="flex-1 py-2.5 rounded-md border border-gray-200 text-gray-500 text-sm hover:bg-gray-50 transition-all">
//               Cancel
//             </button>
//             <button
//               onClick={() => manualRecharge.mutate()}
//               disabled={!rcAmount || manualRecharge.isPending}
//               className="flex-1 py-2.5 rounded-md text-white font-bold text-sm transition-all disabled:opacity-50"
//               style={{ background:'linear-gradient(135deg,#f02d65,#ff6035)',
//                 boxShadow:'0 4px 12px rgba(240,45,101,0.35)' }}>
//               {manualRecharge.isPending ? 'Processing...' : 'Confirm Recharge'}
//             </button>
//           </div>
//         </div>
//       </Modal>

//       {/* Edit Merchant */}
//       <Modal open={modal==='edit'} onClose={closeModal}
//         title={`✏️ Edit — ${selected?.storeName}`}>
//         <div className="space-y-4">
//           <FormInput label="Store Name" value={editForm.storeName||''}
//             onChange={e => setEditForm({...editForm, storeName:e.target.value})}/>
//           <FormInput label="Store Phone" value={editForm.storePhone||''}
//             onChange={e => setEditForm({...editForm, storePhone:e.target.value})}/>
//           {/* Credit score slider */}
//           <div>
//             <label className="text-gray-600 text-xs font-medium block mb-1.5">
//               Credit Score — <span className="font-bold text-gray-800">
//                 {editForm.creditScore ?? 100}
//               </span>
//             </label>
//             <input type="range" min="0" max="100"
//               value={editForm.creditScore ?? 100}
//               onChange={e => setEditForm({...editForm, creditScore:parseInt(e.target.value)})}
//               className="w-full h-2 rounded-full appearance-none cursor-pointer"
//               style={{ accentColor:'#f02d65' }}
//             />
//             <div className="flex justify-between text-[10px] text-gray-300 mt-1">
//               <span>0</span><span>50</span><span>100</span>
//             </div>
//           </div>
//           {/* VIP level */}
//           <div>
//             <label className="text-gray-600 text-xs font-medium block mb-1.5">VIP Level</label>
//             <div className="grid grid-cols-7 gap-1.5">
//               {[0,1,2,3,4,5,6].map(v => {
//                 const colors = ['#9ca3af','#cd7f32','#aaa','#f59e0b','#06b6d4','#9c27b0','#f02d65']
//                 const sel = editForm.vipLevel === v
//                 return (
//                   <button key={v} onClick={() => setEditForm({...editForm,vipLevel:v})}
//                     className="py-2 rounded-md text-xs font-bold transition-all"
//                     style={sel
//                       ? { background:colors[v], color:'white' }
//                       : { background:'#f3f4f6', color:'#6b7280' }}>
//                     {v}
//                   </button>
//                 )
//               })}
//             </div>
//           </div>
//           <div className="flex gap-3 pt-1">
//             <button onClick={closeModal}
//               className="flex-1 py-2.5 rounded-md border border-gray-200 text-gray-500 text-sm hover:bg-gray-50 transition-all">
//               Cancel
//             </button>
//             <button
//               onClick={() => editMerchant.mutate()}
//               disabled={editMerchant.isPending}
//               className="flex-1 py-2.5 rounded-md text-white font-bold text-sm transition-all disabled:opacity-50"
//               style={{ background:'#8b5cf6',
//                 boxShadow:'0 4px 12px rgba(139,92,246,0.35)' }}>
//               {editMerchant.isPending ? 'Saving...' : 'Save Changes'}
//             </button>
//           </div>
//         </div>
//       </Modal>

//       {/* Bank Cards */}
//       <Modal open={modal==='bankcard'} onClose={closeModal}
//         title={`🏦 Bank Cards — ${selected?.storeName}`}>
//         <div className="space-y-3">
//           {selected?.bankCards?.length > 0
//             ? selected.bankCards.map((c, i) => (
//               <div key={i} className="p-4 rounded-md"
//                 style={{ background:'#f8fafc', border:'1px solid #e2e8f0' }}>
//                 <p className="text-gray-800 font-bold text-sm">{c.bankName}</p>
//                 <p className="text-gray-500 text-xs mt-1">
//                   Account: {c.accountName}
//                 </p>
//                 <p className="text-gray-600 text-xs font-mono tracking-widest mt-1">
//                   {c.cardNumber}
//                 </p>
//               </div>
//             ))
//             : (
//               <div className="text-center py-10">
//                 <span className="text-5xl">🏦</span>
//                 <p className="text-gray-400 text-sm mt-3">No bank cards added</p>
//               </div>
//             )
//           }
//           <button onClick={closeModal}
//             className="w-full py-2.5 rounded-md border border-gray-200 text-gray-500 text-sm hover:bg-gray-50 transition-all">
//             Close
//           </button>
//         </div>
//       </Modal>

//     </div>
//   )
// }

///////////////////////// ========================= soconde version (notebookLM) ======================= //////////////////////

// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { useSelector } from "react-redux";
// import axios from "../../api/axios";

// export default function MerchantList() {
//   const { user } = useSelector((state) => state.auth);
//   const navigate = useNavigate();

//   const [merchants, setMerchants] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [total, setTotal] = useState(0);

//   // Search/Filter State
//   const [filters, setFilters] = useState({
//     merchantId: "",
//     storeName: "",
//     status: "",
//     withdrawalStatus: "",
//   });
//   const [page, setPage] = useState(1);
//   const [limit, setLimit] = useState(10);

//   // Modal States
//   const [modalConfig, setModalConfig] = useState({ isOpen: false, type: null, merchant: null });
//   const [amountInput, setAmountInput] = useState("");
//   const [statusSelect, setStatusSelect] = useState("");

//   const fetchMerchants = async () => {
//     try {
//       setLoading(true);
//       const queryParams = new URLSearchParams({
//         page,
//         limit,
//         ...(filters.merchantId && { merchantId: filters.merchantId }),
//         ...(filters.storeName && { storeName: filters.storeName }),
//         ...(filters.status && { status: filters.status }),
//         ...(filters.withdrawalStatus && { withdrawalStatus: filters.withdrawalStatus }),
//       });

//       const res = await axios.get(`/api/merchants?${queryParams}`);
//       setMerchants(res.data.merchants || []);
//       setTotal(res.data.total || 0);
//     } catch (err) {
//       console.error("Failed to fetch merchants", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchMerchants();
//     // eslint-disable-next-line
//   }, [page, limit]);

//   const handleSearch = (e) => {
//     e.preventDefault();
//     setPage(1);
//     fetchMerchants();
//   };

//   const handleReset = () => {
//     setFilters({ merchantId: "", storeName: "", status: "", withdrawalStatus: "" });
//     setPage(1);
//     fetchMerchants();
//   };

//   // ─── ACTION HANDLERS (Mapped to Backend) ─────────────────────────

//   const toggleWithdrawal = async (id) => {
//     try {
//       await axios.put(`/api/merchants/${id}/withdrawal-status`);
//       fetchMerchants();
//     } catch (err) {
//       alert("Failed to toggle withdrawal status");
//     }
//   };

//   const handleModalSubmit = async () => {
//     const { type, merchant } = modalConfig;
//     try {
//       if (type === "add" || type === "deduct") {
//         await axios.post(`/api/merchants/${merchant._id}/adjust-funds`, {
//           amount: Number(amountInput),
//           type,
//           note: `Admin ${type} via table action`,
//         });
//       } else if (type === "recharge") {
//         await axios.post(`/api/merchants/${merchant._id}/manual-recharge`, {
//           amount: Number(amountInput),
//         });
//       } else if (type === "edit") {
//         await axios.put(`/api/merchants/${merchant._id}/status`, {
//           status: statusSelect,
//         });
//       }
//       setModalConfig({ isOpen: false, type: null, merchant: null });
//       setAmountInput("");
//       fetchMerchants();
//     } catch (err) {
//       alert(err.response?.data?.message || "Action failed");
//     }
//   };

//   const openModal = (type, merchant) => {
//     setModalConfig({ isOpen: true, type, merchant });
//     setStatusSelect(merchant.status);
//     setAmountInput("");
//   };

//   return (
//     <div className="bg-white min-h-[calc(100vh-100px)] flex flex-col">
//       {/* ─── DEMO-STYLE FILTER AREA ─────────────────────────────── */}
//       <div className="p-4 border-b border-gray-100">
//         <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
//           <div className="flex items-center gap-2">
//             <span className="text-[13px] text-gray-600 w-24 text-right shrink-0">Merchant ID</span>
//             <input
//               type="text"
//               placeholder="Merchant ID"
//               value={filters.merchantId}
//               onChange={(e) => setFilters({ ...filters, merchantId: e.target.value })}
//               className="border border-gray-300 rounded-[2px] px-2 py-1.5 text-[13px] w-full focus:border-orange-400 outline-none"
//             />
//           </div>
//           <div className="flex items-center gap-2">
//             <span className="text-[13px] text-gray-600 w-24 text-right shrink-0">Merchant Name</span>
//             <input
//               type="text"
//               placeholder="Merchant Name"
//               value={filters.storeName}
//               onChange={(e) => setFilters({ ...filters, storeName: e.target.value })}
//               className="border border-gray-300 rounded-[2px] px-2 py-1.5 text-[13px] w-full focus:border-orange-400 outline-none"
//             />
//           </div>
//           <div className="flex items-center gap-2">
//             <span className="text-[13px] text-gray-600 w-24 text-right shrink-0">Withdrawal Status</span>
//             <select
//               value={filters.withdrawalStatus}
//               onChange={(e) => setFilters({ ...filters, withdrawalStatus: e.target.value })}
//               className="border border-gray-300 rounded-[2px] px-2 py-1.5 text-[13px] w-full focus:border-orange-400 outline-none bg-white"
//             >
//               <option value="">Choose</option>
//               <option value="allowed">Allowed</option>
//               <option value="forbidden">Forbidden</option>
//             </select>
//           </div>
//           <div className="flex items-center gap-2">
//             <span className="text-[13px] text-gray-600 w-24 text-right shrink-0">Status</span>
//             <select
//               value={filters.status}
//               onChange={(e) => setFilters({ ...filters, status: e.target.value })}
//               className="border border-gray-300 rounded-[2px] px-2 py-1.5 text-[13px] w-full focus:border-orange-400 outline-none bg-white"
//             >
//               <option value="">Choose</option>
//               <option value="pending">Pending</option>
//               <option value="approved">Approved</option>
//               <option value="frozen">Frozen</option>
//             </select>
//           </div>

//           <div className="flex items-center gap-2 lg:col-start-5 justify-end">
//             <button type="submit" className="bg-[#00c08b] text-white px-5 py-1.5 text-[13px] rounded-[2px] hover:bg-opacity-90">
//               Submit
//             </button>
//             <button type="button" onClick={handleReset} className="bg-white border border-gray-300 text-gray-700 px-5 py-1.5 text-[13px] rounded-[2px] hover:bg-gray-50">
//               Reset
//             </button>
//           </div>
//         </form>
//       </div>

//       {/* ─── TABLE TOOLBAR ─────────────────────────────────────── */}
//       <div className="p-4 flex justify-between items-center border-b border-gray-100">
//         <div className="flex gap-2">
//           <button onClick={fetchMerchants} className="bg-[#34495e] text-white p-1.5 rounded-[2px] hover:bg-opacity-90">
//             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
//           </button>
//           {user?.role === "superAdmin" && (
//             <button className="bg-[#00c08b] text-white px-3 py-1.5 text-[13px] rounded-[2px] flex items-center gap-1 hover:bg-opacity-90">
//                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
//                Edit
//             </button>
//           )}
//         </div>
//       </div>

//       {/* ─── DATA TABLE (Exact Grid Match) ─────────────────────── */}
//       <div className="flex-1 overflow-x-auto custom-scrollbar p-4">
//         <table className="w-full text-left border-collapse min-w-[1200px]">
//           <thead>
//             <tr className="bg-[#f8f9fb] text-[13px] text-gray-700 font-semibold border-y border-gray-200">
//               <th className="p-3 w-10 text-center"><input type="checkbox" className="w-3.5 h-3.5" /></th>
//               <th className="p-3">Merchant ID</th>
//               <th className="p-3">Merchant Name</th>
//               <th className="p-3 text-center">Merchant Logo</th>
//               <th className="p-3 text-center">在线状态 (Status)</th>
//               <th className="p-3 text-center">Referrer</th>
//               <th className="p-3">Operate</th>
//             </tr>
//           </thead>
//           <tbody>
//             {loading ? (
//               <tr><td colSpan="7" className="text-center p-8 text-gray-400">Loading...</td></tr>
//             ) : merchants.length === 0 ? (
//               <tr><td colSpan="7" className="text-center p-8 text-gray-400">No merchants found</td></tr>
//             ) : (
//               merchants.map((m) => (
//                 <tr key={m._id} className="border-b border-gray-100 hover:bg-gray-50 text-[13px] text-gray-600 transition-colors">
//                   <td className="p-3 text-center"><input type="checkbox" className="w-3.5 h-3.5" /></td>
//                   <td className="p-3">{m.merchantId}</td>
//                   <td className="p-3 font-medium text-gray-800">{m.storeName}</td>
//                   <td className="p-3 text-center">
//                     <img
//                       src={m.storeLogo || "https://ui-avatars.com/api/?name=Store&background=random"}
//                       alt="logo"
//                       className="w-8 h-8 rounded-sm object-cover mx-auto"
//                     />
//                   </td>
//                   <td className="p-3 text-center">
//                     <span className={m.isOnline ? "text-blue-500 font-medium" : "text-gray-400"}>
//                       {m.isOnline ? "Online" : "离线 (Offline)"}
//                     </span>
//                   </td>
//                   <td className="p-3 text-center text-gray-500">
//                     {m.referrer?.username || "-"} ({m.referrer?.invitationCode || "-"})
//                   </td>

//                   {/* EXPLICIT DEMO ACTION BUTTONS */}
//                   <td className="p-3">
//                     <div className="flex flex-wrap items-center gap-1.5">
//                       <button className="bg-[#00c08b] text-white px-2 py-1 text-[11px] rounded-[2px]">Contact Merchant</button>

//                       <button
//                         onClick={() => toggleWithdrawal(m._id)}
//                         className={`${m.isWithdrawalForbidden ? 'bg-[#ff5b5b]' : 'bg-[#00c08b]'} text-white px-2 py-1 text-[11px] rounded-[2px]`}
//                       >
//                         {m.isWithdrawalForbidden ? "Withdrawal is forbidden" : "Withdrawal Allowed"}
//                       </button>

//                       {user?.role === "superAdmin" && (
//                         <>
//                           <button onClick={() => openModal('add', m)} className="bg-[#34495e] text-white px-2 py-1 text-[11px] rounded-[2px]">Add funds</button>
//                           <button onClick={() => openModal('recharge', m)} className="bg-[#409EFF] text-white px-2 py-1 text-[11px] rounded-[2px]">Recharge</button>
//                           <button onClick={() => openModal('deduct', m)} className="bg-[#ff7b52] text-white px-2 py-1 text-[11px] rounded-[2px]">Deduction</button>
//                         </>
//                       )}

//                       <button onClick={() => navigate(`/merchants/funds?merchantId=${m.merchantId}`)} className="bg-[#409EFF] text-white px-2 py-1 text-[11px] rounded-[2px]">Fund Details</button>
//                       <button className="bg-[#34495e] text-white px-2 py-1 text-[11px] rounded-[2px]">Bank Card</button>
//                       <button className="bg-[#34495e] text-white px-2 py-1 text-[11px] rounded-[2px]">Identity Information</button>
//                       <button className="bg-[#409EFF] text-white px-2 py-1 text-[11px] rounded-[2px]">Number of Off-Shelf</button>

//                       {user?.role === "superAdmin" && (
//                         <button onClick={() => openModal('edit', m)} className="bg-[#00c08b] text-white px-2 py-1 text-[11px] rounded-[2px] flex items-center gap-1">
//                           <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg> Edit
//                         </button>
//                       )}
//                     </div>
//                   </td>
//                 </tr>
//               ))
//             )}
//           </tbody>
//         </table>
//       </div>

//       {/* ─── PAGINATION ────────────────────────────────────────── */}
//       <div className="p-4 border-t border-gray-100 flex justify-between items-center text-[13px] text-gray-600">
//         <div>
//           Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} rows
//           <select value={limit} onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }} className="ml-2 border border-gray-300 rounded-[2px] px-1 py-0.5 outline-none bg-white">
//             <option value="10">10</option>
//             <option value="20">20</option>
//             <option value="50">50</option>
//           </select> rows per page
//         </div>
//         <div className="flex items-center">
//           <button disabled={page === 1} onClick={() => setPage(page - 1)} className="px-3 py-1 border border-gray-300 rounded-l-[2px] hover:bg-gray-50 disabled:opacity-50">Previous Page</button>
//           <div className="px-4 py-1 bg-[#34495e] text-white border-y border-[#34495e]">{page}</div>
//           <button disabled={page * limit >= total} onClick={() => setPage(page + 1)} className="px-3 py-1 border border-gray-300 rounded-r-[2px] hover:bg-gray-50 disabled:opacity-50">Next Page</button>
//         </div>
//       </div>

//       {/* ─── ACTION MODAL ─────────────────────────────────────── */}
//       {modalConfig.isOpen && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
//           <div className="bg-white rounded-[4px] shadow-lg w-[400px] overflow-hidden">
//             <div className="bg-[#34495e] text-white px-4 py-3 flex justify-between items-center">
//               <h3 className="text-[14px] font-medium capitalize">
//                 {modalConfig.type === 'edit' ? 'Edit Merchant Status' : `${modalConfig.type} Funds: ${modalConfig.merchant?.storeName}`}
//               </h3>
//               <button onClick={() => setModalConfig({ isOpen: false, type: null, merchant: null })} className="text-white hover:text-gray-300">
//                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
//               </button>
//             </div>

//             <div className="p-5">
//               {modalConfig.type === 'edit' ? (
//                 <div className="flex flex-col gap-2">
//                   <label className="text-[13px] text-gray-700">Account Status</label>
//                   <select
//                     value={statusSelect}
//                     onChange={(e) => setStatusSelect(e.target.value)}
//                     className="border border-gray-300 rounded-[2px] px-3 py-2 text-[13px] w-full focus:border-orange-400 outline-none"
//                   >
//                     <option value="pending">Pending</option>
//                     <option value="approved">Approved</option>
//                     <option value="frozen">Frozen</option>
//                   </select>
//                 </div>
//               ) : (
//                 <div className="flex flex-col gap-2">
//                   <label className="text-[13px] text-gray-700">Amount (USD)</label>
//                   <input
//                     type="number"
//                     min="0"
//                     placeholder="Enter amount..."
//                     value={amountInput}
//                     onChange={(e) => setAmountInput(e.target.value)}
//                     className="border border-gray-300 rounded-[2px] px-3 py-2 text-[13px] w-full focus:border-orange-400 outline-none"
//                   />
//                   {modalConfig.type === 'deduct' && (
//                     <span className="text-[11px] text-gray-500 mt-1">
//                       Current Balance: ${modalConfig.merchant?.balance || 0}
//                     </span>
//                   )}
//                 </div>
//               )}
//             </div>

//             <div className="bg-gray-50 px-4 py-3 flex justify-end gap-2 border-t border-gray-200">
//               <button onClick={() => setModalConfig({ isOpen: false, type: null, merchant: null })} className="px-4 py-1.5 text-[13px] border border-gray-300 rounded-[2px] bg-white text-gray-700 hover:bg-gray-50">Cancel</button>
//               <button onClick={handleModalSubmit} className="px-4 py-1.5 text-[13px] bg-[#00c08b] text-white rounded-[2px] hover:bg-opacity-90">Confirm</button>
//             </div>
//           </div>
//         </div>
//       )}

//     </div>
//   );
// }

///////////////////////// ========================= third version (gemeni) ======================= //////////////////////

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import API from "../../api/axios";

// ── Icons for forms/modals ────────────────────────────────────
import {
  RefreshCcw,
  Loader2,
  Wallet,
  CreditCard,
  Banknote,
  Edit,
  Building2,
} from "lucide-react";

// ── Reusable UI components ────────────────────────────────────
const ActionBtn = ({ onClick, color, label, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="rounded text-[12px] font-medium transition-all hover:opacity-90 hover:-translate-y-[1px] disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap "
    style={{ backgroundColor: color, color: "white", padding: "6px 10px" }}
  >
    {label}
  </button>
);

const FormInput = ({ label, ...props }) => (
  <div
    style={{ marginTop: "10px", marginBottom: "10px" }}
    className="flex flex-col gap-1.5"
  >
    {label && (
      <label className="text-gray-600 text-[13px] font-medium ml-1">
        {label}
      </label>
    )}
    <input
      style={{ padding: "5px" }}
      className="w-full px-3.5 py-2 rounded-sm border border-gray-200 text-gray-800 text-[13px] focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all bg-gray-50/50 focus:bg-white"
      {...props}
    />
  </div>
);

const FormSelect = ({ label, children, ...props }) => (
  <div className="flex flex-col gap-1.5">
    {label && (
      <label className="text-gray-600 text-[13px] font-medium ml-1">
        {label}
      </label>
    )}
    <select
      style={{ padding: "5px" }}
      className="w-full px-3.5 py-2 rounded-sm border border-gray-200 text-gray-800 text-[13px] focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all bg-gray-50/50 focus:bg-white appearance-none"
      {...props}
    >
      {children}
    </select>
  </div>
);

const Field = ({ label, value }) => (
  <div className="py-3 flex items-start justify-between gap-4 border-b border-gray-100 last:border-0">
    <span className="text-gray-500 text-[13px] font-medium flex-shrink-0">
      {label}
    </span>
    <span className="text-gray-900 text-[13px] font-semibold text-right">
      {value || "—"}
    </span>
  </div>
);

// ── Upgraded Premium Modal Component ──────────────────────────
const Modal = ({
  open,
  onClose,
  title,
  icon: Icon,
  children,
  width = "max-w-md",
}) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div
        style={{ padding: "10px" }}
        className={`relative bg-white rounded-lg w-full ${width} max-h-[90vh] flex flex-col shadow-2xl overflow-hidden transform transition-all`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="p-2 bg-teal-50 rounded-sm text-teal-600">
                <Icon className="w-5 h-5" />
              </div>
            )}
            <h3 className="font-bold text-gray-900 text-base">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 hover:bg-gray-100 w-8 h-8 flex items-center justify-center rounded-full transition-colors"
          >
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
export default function MerchantList() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const isSuperAdmin = user?.role === "superAdmin";
  const isMerchantAdmin = user?.role === "merchantAdmin";

  // 1. Input States
  const [idInput, setIdInput] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [statusInput, setStatusInput] = useState("");
  const [vipInput, setVipInput] = useState("");

  // 2. Active Filter States (Fixed Logic)
  const [activeFilters, setActiveFilters] = useState({
    search: "",
    status: "",
    vipLevel: "",
  });
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Modal State
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);

  // Modal Forms
  const [fundAmount, setFundAmount] = useState("");
  const [fundType, setFundType] = useState("add");
  const [fundNote, setFundNote] = useState("");
  const [rcAmount, setRcAmount] = useState("");
  const [editForm, setEditForm] = useState({});

  const openModal = (type, merchant) => {
    setSelected(merchant);
    setModal(type);
    if (type === "edit") {
      setEditForm({
        storeName: merchant.storeName || "",
        storePhone: merchant.storePhone || "",
        creditScore: merchant.creditScore ?? 100,
        vipLevel: merchant.vipLevel ?? 0,
      });
    }
  };

  const closeModal = () => {
    setModal(null);
    setSelected(null);
    setFundAmount("");
    setRcAmount("");
    setFundNote("");
  };

  // Fixed Filter Handlers: Merges ID and Name into backend's expected 'search' query
  const handleSubmitFilters = () => {
    setActiveFilters({
      search: idInput.trim() || nameInput.trim(), // Backend typically uses one search param for both
      status: statusInput,
      vipLevel: vipInput,
    });
    setPage(1);
  };

  const handleResetFilters = () => {
    setIdInput("");
    setNameInput("");
    setStatusInput("");
    setVipInput("");
    setActiveFilters({ search: "", status: "", vipLevel: "" });
    setPage(1);
  };

  // Fixed Fetch Logic: Explicitly handle 0 value for vipLevel
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["merchants", page, limit, activeFilters],
    queryFn: async () => {
      const params = { page, limit };
      if (activeFilters.search) params.search = activeFilters.search;
      if (activeFilters.status) params.status = activeFilters.status;
      if (activeFilters.vipLevel !== "")
        params.vipLevel = activeFilters.vipLevel;

      const p = new URLSearchParams(params);
      const { data } = await API.get(`/merchants?${p.toString()}`);
      return data;
    },
    keepPreviousData: true,
  });

  const merchants = data?.merchants || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / limit);

  // Mutations
  const invalidate = () => queryClient.invalidateQueries(["merchants"]);

  const toggleWithdrawal = useMutation({
    mutationFn: (m) => API.put(`/merchants/${m._id}/withdrawal-status`),
    onSuccess: () => {
      invalidate();
      toast.success("Updated!");
    },
    onError: (e) => toast.error(e.response?.data?.message || "Failed"),
  });

  const adjustFunds = useMutation({
    mutationFn: () =>
      API.post(
        `/merchants/${selected._id}/${fundType === "add" ? "add-funds" : "deduct-funds"}`,
        { amount: parseFloat(fundAmount), note: fundNote },
      ),
    onSuccess: () => {
      invalidate();
      toast.success(`Funds ${fundType === "add" ? "added" : "deducted"}!`);
      closeModal();
    },
    onError: (e) => toast.error(e.response?.data?.message || "Failed"),
  });

  const manualRecharge = useMutation({
    mutationFn: () =>
      API.post(`/merchants/${selected._id}/manual-recharge`, {
        amount: parseFloat(rcAmount),
      }),
    onSuccess: () => {
      invalidate();
      toast.success("Recharge successful!");
      closeModal();
    },
    onError: (e) => toast.error(e.response?.data?.message || "Failed"),
  });

  const editMerchant = useMutation({
    mutationFn: () => API.put(`/merchants/${selected._id}`, editForm),
    onSuccess: () => {
      invalidate();
      toast.success("Saved!");
      closeModal();
    },
    onError: (e) => toast.error(e.response?.data?.message || "Failed"),
  });

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
      className="p-20  md:p-6 bg-gray-50 min-h-screen w-full max-w-full overflow-hidden"
    >
      <div className="mb-4">
        <h1 className="text-xl font-bold text-gray-800">Merchant List</h1>
        <p className="text-[13px] text-gray-500 mt-1">
          Manage all store accounts, funds, and permissions.
        </p>
      </div>

      {/* ── Advanced Filter Grid ── */}
      <div
        style={{ padding: "5px" }}
        className="bg-white rounded-md p-6  border border-gray-100 mb-6 w-full"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <FormInput
            label="Merchant ID"
            placeholder="Enter ID"
            value={idInput}
            onChange={(e) => setIdInput(e.target.value)}
          />
          <FormInput
            label="Merchant Name"
            placeholder="Enter Name"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
          />
          <FormSelect
            label="Status"
            value={statusInput}
            onChange={(e) => setStatusInput(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </FormSelect>
          <FormSelect
            label="VIP Level"
            value={vipInput}
            onChange={(e) => setVipInput(e.target.value)}
          >
            <option value="">All Levels</option>
            {[0, 1, 2, 3, 4, 5, 6].map((v) => (
              <option key={v} value={v}>
                VIP {v}
              </option>
            ))}
          </FormSelect>
        </div>

        <div
          style={{ paddingTop: "5px", paddingBottom: "5px" }}
          className="flex justify-end gap-3 pt-4 border-t border-gray-100"
        >
          <button
            style={{ padding: "5px" }}
            onClick={handleResetFilters}
            className="px-6 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-[13px] font-semibold rounded-sm transition-colors "
          >
            Reset
          </button>
          <button
            style={{ padding: "5px" }}
            onClick={handleSubmitFilters}
            className="px-6 py-2 bg-teal-500 hover:bg-teal-600 text-white text-[13px] font-semibold rounded-sm transition-colors "
          >
            Search
          </button>
        </div>
      </div>

      {/* ── Data Table Container ── */}
      <div
        style={{ padding: "5px" }}
        className="bg-white  border border-gray-100 rounded-md flex flex-col w-full overflow-hidden"
      >
        <div
          style={{ padding: "10px" }}
          className="px-5 py-4 border-b border-gray-100 bg-white flex justify-between gap-3 items-center"
        >
          <h2 className="text-[14px] font-bold text-gray-800">
            Merchant Directory
          </h2>
          <button
            onClick={() => invalidate()}
            className="p-2 rounded-sm bg-gray-50 hover:bg-gray-100 text-teal-600 transition-colors border border-gray-200 "
            title="Refresh"
          >
            <RefreshCcw
              className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`}
            />
          </button>
        </div>

        <div className="w-full overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[1400px]">
            <thead>
              <tr className="border-b border-gray-100 text-gray-500 text-[12px] uppercase tracking-wider bg-gray-50/50">
                <th
                  style={{ padding: "5px" }}
                  className="py-4 px-5 text-center w-10"
                >
                  <input type="checkbox" className="rounded border-gray-300" />
                </th>
                <th className="py-4 px-5 font-bold">Merchant ID</th>
                <th className="py-4 px-5 font-bold">Merchant Name</th>
                <th className="py-4 px-5 font-bold text-center">Logo</th>
                <th className="py-4 px-5 font-bold text-center">Status</th>
                <th className="py-4 px-5 font-bold">Referrer</th>
                <th className="py-4 px-5 font-bold">Creation Time</th>
                <th className="py-4 px-5 font-bold text-center">Operations</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="8" className="py-24">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
                      <p className="text-gray-500 text-[13px] font-medium">
                        Loading merchant data...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : merchants.length === 0 ? (
                <tr>
                  <td
                    colSpan="8"
                    className="text-center py-20 text-gray-500 text-[13px]"
                  >
                    No merchants found matching your filters.
                  </td>
                </tr>
              ) : (
                merchants.map((m) => (
                  <tr
                    key={m._id}
                    className="border-b border-gray-50 hover:bg-teal-50/30 transition-colors group"
                  >
                    <td className="py-3 px-5 text-center">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="py-3 px-5 text-[13px] text-gray-600 font-medium">
                      {m.merchantId}
                    </td>
                    <td className="py-3 px-5 text-[13px] text-gray-900 font-bold">
                      {m.storeName}
                    </td>
                    <td className="py-3 px-5">
                      <div className="w-9 h-9 rounded-sm mx-auto overflow-hidden bg-gray-50 flex items-center justify-center border border-gray-200 ">
                        {m.storeLogo ? (
                          <img
                            src={m.storeLogo}
                            alt="logo"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-gray-400 text-[10px] font-bold">
                            IMG
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-5 text-center">
                      <span
                        style={{ padding: "5px" }}
                        className={`text-[12px] px-2.5 py-1 rounded-sm font-bold ${m.isActive ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}
                      >
                        {m.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="py-3 px-5 text-[13px] text-gray-600">
                      {m.invitedBy || "Direct"}
                    </td>
                    <td className="py-3 px-5 text-[13px] text-gray-500">
                      <span className="text-gray-800 font-medium">
                        {new Date(m.createdAt).toLocaleDateString("en-CA")}
                      </span>
                      <br />
                      {new Date(m.createdAt).toLocaleTimeString()}
                    </td>

                    <td className="py-3 px-5">
                      <div className="flex items-center justify-center gap-2 w-max mx-auto opacity-90 group-hover:opacity-100 transition-opacity">
                        <ActionBtn
                          color="#059669"
                          label="Contact Merchant"
                          onClick={() => openModal("detail", m)}
                        />

                        {(isSuperAdmin || isMerchantAdmin) && (
                          <ActionBtn
                            color={
                              m.withdrawalForbidden ? "#dc2626" : "#2563eb"
                            }
                            label={
                              m.withdrawalForbidden
                                ? "Withdrawal forbidden"
                                : "Allow Withdrawal"
                            }
                            onClick={() => toggleWithdrawal.mutate(m)}
                          />
                        )}

                        {isSuperAdmin && (
                          <>
                            <ActionBtn
                              color="#475569"
                              label="Add funds"
                              onClick={() => {
                                setFundType("add");
                                openModal("funds", m);
                              }}
                            />
                            <ActionBtn
                              color="#2563eb"
                              label="Recharge"
                              onClick={() => openModal("recharge", m)}
                            />
                            <ActionBtn
                              color="#dc2626"
                              label="Deduction"
                              onClick={() => {
                                setFundType("deduct");
                                openModal("funds", m);
                              }}
                            />
                          </>
                        )}

                        <ActionBtn
                          color="#2563eb"
                          label="Fund Details"
                          onClick={() =>
                            navigate(
                              `/merchants/funds?merchantId=${m._id}&name=${encodeURIComponent(m.storeName)}`,
                            )
                          }
                        />
                        <ActionBtn
                          color="#475569"
                          label="Bank Card"
                          onClick={() => openModal("bankcard", m)}
                        />

                        {isSuperAdmin && (
                          <ActionBtn
                            color="#059669"
                            label="Edit"
                            onClick={() => openModal("edit", m)}
                          />
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
          <div className="text-[13px] text-gray-500 mb-3 sm:mb-0 flex items-center gap-2 font-medium">
            Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)}{" "}
            of {total} rows
            <select
              style={{ padding: "5px" }}
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className="ml-2 border border-gray-200 rounded-sm px-2 py-1 focus:outline-none focus:border-teal-500 bg-white  font-semibold text-gray-700"
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
              className="px-4 py-1.5 border border-gray-200 rounded-sm text-[13px] font-semibold bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors "
            >
              Prev
            </button>

            {getPageNums().map((n) => (
              <button
                style={{ padding: "5px" }}
                key={n}
                onClick={() => setPage(n)}
                className={`min-w-[36px] px-2 py-1.5 rounded-sm text-[13px] font-bold transition-colors  ${n === page ? "bg-slate-800 text-white border border-slate-800" : "bg-white border border-gray-200 hover:bg-gray-50 text-gray-700"}`}
              >
                {n}
              </button>
            ))}

            <button
              style={{ padding: "5px" }}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || totalPages === 0}
              className="px-4 py-1.5 border border-gray-200 rounded-sm text-[13px] font-semibold bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors "
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* ════════════ PREMIUM MODALS ════════════ */}

      {/* 1. Detail Modal */}
      <Modal
        open={modal === "detail"}
        onClose={closeModal}
        title="Merchant Details"
        icon={Building2}
        width="max-w-lg"
      >
        <div className="bg-white rounded-md border text-[20px] border-gray-100 p-1">
          <Field label="Store Name" value={selected?.storeName} />
          <Field label="Merchant ID" value={selected?.merchantId} />
          <Field label="Email" value={selected?.user?.email} />
          <Field label="Phone" value={selected?.storePhone} />
          <Field label="VIP Level" value={`VIP ${selected?.vipLevel ?? 0}`} />
          <Field
            label="Balance"
            value={`$${(selected?.balance || 0).toFixed(2)}`}
          />
          <Field
            label="Total Profit"
            value={`$${(selected?.totalProfit || 0).toFixed(2)}`}
          />
          <Field
            label="Credit Score"
            value={`${selected?.creditScore ?? 100} / 100`}
          />
          <Field
            label="Status"
            value={selected?.isActive ? "Active" : "Inactive"}
          />
          <Field
            label="Joined"
            value={
              selected?.createdAt
                ? new Date(selected.createdAt).toLocaleString()
                : ""
            }
          />
        </div>
        <button
          style={{ padding: "5px" }}
          onClick={closeModal}
          className="w-full mt-6 py-2.5 bg-gray-900 hover:bg-gray-800 text-white font-semibold text-[13px] rounded-md transition-colors shadow-md"
        >
          Close Window
        </button>
      </Modal>

      {/* 2. Add/Deduct Funds Modal */}
      <Modal
        open={modal === "funds"}
        onClose={closeModal}
        title={`${fundType === "add" ? "Add" : "Deduct"} Funds`}
        icon={Wallet}
      >
        <div className="space-y-5">
          <div
            style={{
              paddingTop: "10px",
              paddingBottom: "10px",
              paddingLeft: "10px",
            }}
            className="bg-gradient-to-br from-slate-800 to-slate-900 p-5 rounded-md shadow-inner text-white"
          >
            <p className="text-[12px] text-slate-300 font-medium mb-1">
              Current Balance for {selected?.storeName}
            </p>
            <p className="text-3xl font-black tracking-tight">
              ${(selected?.balance || 0).toFixed(2)}
            </p>
          </div>
          <FormInput
            type="number"
            min="0.01"
            step="0.01"
            label="Amount (USD)"
            value={fundAmount}
            onChange={(e) => setFundAmount(e.target.value)}
            placeholder="0.00"
          />
          <FormInput
            type="text"
            label="Internal Note (Optional)"
            value={fundNote}
            onChange={(e) => setFundNote(e.target.value)}
            placeholder="Reason for adjustment..."
          />

          <div className="flex gap-3 pt-2">
            <button
              style={{ padding: "5px" }}
              onClick={closeModal}
              className="flex-1 py-2.5 bg-white border border-gray-200 text-gray-700 font-bold text-[13px] rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              style={{ padding: "5px" }}
              onClick={() => adjustFunds.mutate()}
              disabled={!fundAmount || adjustFunds.isPending}
              className={`flex-1 py-2.5 text-white rounded-md font-bold text-[13px] disabled:opacity-50 transition-colors shadow-md ${fundType === "add" ? "bg-emerald-500 hover:bg-emerald-600" : "bg-red-500 hover:bg-red-600"}`}
            >
              {adjustFunds.isPending
                ? "Processing..."
                : `Confirm ${fundType === "add" ? "Addition" : "Deduction"}`}
            </button>
          </div>
        </div>
      </Modal>

      {/* 3. Manual Recharge Modal */}
      <Modal
        open={modal === "recharge"}
        onClose={closeModal}
        title="Manual Recharge"
        icon={CreditCard}
      >
        <div className="space-y-5">
          <div
            style={{ padding: "5px" }}
            className="bg-gradient-to-br from-teal-500 to-emerald-500 p-5 rounded-md shadow-inner text-white"
          >
            <p className="text-[12px] text-teal-100 font-medium mb-1">
              Current Balance for {selected?.storeName}
            </p>
            <p className="text-3xl font-black tracking-tight">
              ${(selected?.balance || 0).toFixed(2)}
            </p>
          </div>
          <FormInput
            type="number"
            min="0.01"
            step="0.01"
            label="Recharge Amount (USD)"
            value={rcAmount}
            onChange={(e) => setRcAmount(e.target.value)}
            placeholder="0.00"
          />

          <div className="flex gap-3 pt-2">
            <button
              style={{ padding: "5px" }}
              onClick={closeModal}
              className="flex-1 py-2.5 bg-white border border-gray-200 text-gray-700 font-bold text-[13px] rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              style={{ padding: "5px" }}
              onClick={() => manualRecharge.mutate()}
              disabled={!rcAmount || manualRecharge.isPending}
              className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-md font-bold text-[13px] disabled:opacity-50 transition-colors shadow-md"
            >
              {manualRecharge.isPending ? "Processing..." : "Confirm Recharge"}
            </button>
          </div>
        </div>
      </Modal>

      {/* 4. Edit Merchant Modal */}
      <Modal
        open={modal === "edit"}
        onClose={closeModal}
        title="Edit Merchant"
        icon={Edit}
      >
        <div className="space-y-4">
          <FormInput
            label="Store Name"
            value={editForm.storeName || ""}
            onChange={(e) =>
              setEditForm({ ...editForm, storeName: e.target.value })
            }
          />
          <FormInput
            label="Store Phone"
            value={editForm.storePhone || ""}
            onChange={(e) =>
              setEditForm({ ...editForm, storePhone: e.target.value })
            }
          />
          <FormInput
            type="number"
            min="0"
            max="100"
            label="Credit Score (0-100)"
            value={editForm.creditScore ?? 100}
            onChange={(e) =>
              setEditForm({
                ...editForm,
                creditScore: parseInt(e.target.value),
              })
            }
          />
          <FormInput
            type="number"
            min="0"
            max="6"
            label="VIP Level (0-6)"
            value={editForm.vipLevel ?? 0}
            onChange={(e) =>
              setEditForm({ ...editForm, vipLevel: parseInt(e.target.value) })
            }
          />

          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <button
              style={{ padding: "5px" }}
              onClick={closeModal}
              className="flex-1 py-2.5 bg-white border border-gray-200 text-gray-700 font-bold text-[13px] rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              style={{ padding: "5px" }}
              onClick={() => editMerchant.mutate()}
              disabled={editMerchant.isPending}
              className="flex-1 py-2.5 bg-teal-500 hover:bg-teal-600 text-white rounded-md font-bold text-[13px] disabled:opacity-50 transition-colors shadow-md"
            >
              {editMerchant.isPending ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </Modal>

      {/* 5. Bank Cards Modal */}
      <Modal
        open={modal === "bankcard"}
        onClose={closeModal}
        title="Bank Cards"
        icon={Banknote}
      >
        <div className="space-y-4">
          {selected?.bankCards?.length > 0 ? (
            selected.bankCards.map((c, i) => (
              <div
                key={i}
                className="p-5 border border-gray-200 rounded-md bg-gradient-to-br from-gray-50 to-white  relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-16 h-16 bg-blue-50 rounded-bl-full -z-0 opacity-50"></div>
                <p className="text-gray-900 font-black text-[15px] relative z-10">
                  {c.bankName}
                </p>
                <p className="text-gray-500 text-[12px] mt-1 relative z-10 font-medium">
                  Account: {c.accountName}
                </p>
                <p className="text-gray-800 text-[14px] font-mono mt-3 tracking-widest relative z-10 bg-white p-2 rounded inline-block border border-gray-100">
                  {c.cardNumber}
                </p>
              </div>
            ))
          ) : (
            <div className="text-center py-10 bg-gray-50 rounded-md border border-dashed border-gray-200">
              <Banknote className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 text-[13px] font-medium">
                No bank cards linked to this merchant.
              </p>
            </div>
          )}
          <button
            style={{ padding: "5px" }}
            onClick={closeModal}
            className="w-full mt-4 py-2.5 bg-gray-900 hover:bg-gray-800 text-white font-semibold text-[13px] rounded-md transition-colors shadow-md"
          >
            Done
          </button>
        </div>
      </Modal>
    </div>
  );
}
