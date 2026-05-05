import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CreditCard, 
  TrendingUp, 
  TrendingDown, 
  Search, 
  Filter, 
  Download, 
  Plus,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  DollarSign,
  Edit2,
  Trash2,
  Save,
  BarChart2
} from 'lucide-react';
import Layout from '../components/ui/Layout';
import { cn, formatCurrency } from '../lib/utils';
import { useCMSData } from '../lib/store';
import { Modal } from '../components/ui/Modal';
import { ConfirmModal } from '../components/ui/ConfirmModal';

const initialTransactions = [
  { id: 'TX-001', player: 'Alvaro Morata', date: '2026-04-20', amount: 850000, type: 'Registration', status: 'Paid' },
  { id: 'TX-002', player: 'Kevin De Bruyne', date: '2026-04-18', amount: 500000, type: 'Monthly SPP', status: 'Paid' },
  { id: 'TX-003', player: 'Erling Haaland', date: '2026-04-15', amount: 1200000, type: 'Uniform Kit', status: 'Pending' },
  { id: 'TX-004', player: 'Virgil Van Dijk', date: '2026-04-12', amount: 500000, type: 'Monthly SPP', status: 'Paid' },
  { id: 'TX-005', player: 'Pedri Gonzalez', date: '2026-04-10', amount: 500000, type: 'Monthly SPP', status: 'Late' },
];

export default function Financials() {
  const { data: transactions, addItems, updateItem, deleteItem } = useCMSData('financials', initialTransactions);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, id: '', player: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    player: '', date: new Date().toISOString().split('T')[0], amount: 0, type: 'Monthly SPP', status: 'Paid'
  });

  const filteredTransactions = transactions.filter((tx: any) => 
    (tx.player || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (tx.id || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalRevenue = transactions
    .filter((tx: any) => tx.status === 'Paid')
    .reduce((acc: number, tx: any) => acc + tx.amount, 0);

  const totalLate = transactions
    .filter((tx: any) => tx.status === 'Late')
    .reduce((acc: number, tx: any) => acc + tx.amount, 0);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({ player: '', date: new Date().toISOString().split('T')[0], amount: 0, type: 'Monthly SPP', status: 'Paid' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: any) => {
    setEditingItem(item);
    setFormData(item);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      updateItem(editingItem.id, formData);
    } else {
      const id = `TX-${Math.floor(100 + Math.random() * 900)}`;
      addItems({ ...formData, id });
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string, player: string) => {
    setDeleteConfirm({ isOpen: true, id, player });
  };

  return (
    <Layout>
      <div className="space-y-10 animate-in fade-in duration-500">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-display font-bold text-glow uppercase tracking-tight">MANAGEMENT KEUANGAN</h1>
            <p className="text-white/40 text-sm">CMS Admin: Monitor pendapatan, pengeluaran, dan status pembayaran.</p>
          </div>
          <div className="flex items-center gap-3">
             <button onClick={handleOpenAdd} className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)] !py-2 px-6 rounded-xl flex items-center gap-2 transition-all font-semibold uppercase tracking-wider text-xs">
                <Plus className="w-4 h-4" /> Tambah Transaksi
             </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           <div className="glass-card p-8 border-l-4 border-l-emerald-500 shadow-lg">
              <p className="text-[10px] uppercase font-black text-white/40 tracking-widest mb-2">Total Pendapatan (Paid)</p>
              <h2 className="text-4xl font-display font-black text-emerald-400">{formatCurrency(totalRevenue)}</h2>
              <div className="mt-4 flex items-center gap-2 text-xs text-green-500">
                <TrendingUp className="w-4 h-4" /> Up-to-date realtime
              </div>
           </div>
           <div className="glass-card p-8 border-l-4 border-l-red-500 shadow-lg">
              <p className="text-[10px] uppercase font-black text-white/40 tracking-widest mb-2">Total Tunggakan (Late)</p>
              <h2 className="text-4xl font-display font-black text-red-500">{formatCurrency(totalLate)}</h2>
              <div className="mt-4 flex items-center gap-2 text-xs text-red-400">
                <AlertCircle className="w-4 h-4" /> Segera ingatkan wali murid
              </div>
           </div>
           <div className="glass-card p-8 border-l-4 border-l-[var(--color-primary)] shadow-lg">
              <p className="text-[10px] uppercase font-black text-white/40 tracking-widest mb-2">Estimasi Kas</p>
              <h2 className="text-4xl font-display font-black text-[var(--color-primary)]">{formatCurrency(totalRevenue + totalLate)}</h2>
              <div className="mt-4 flex items-center gap-2 text-xs text-[var(--color-primary)]">
                <BarChart2 className="w-4 h-4" /> Total piutang + pendapatan
              </div>
           </div>
        </div>

        {/* Filters and Table */}
        <div className="space-y-6">
           <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 w-full md:w-auto">
                 {['Semua', 'Berhasil', 'Menunggu', 'Terlambat'].map(tab => (
                   <button key={tab} className={cn("flex-1 md:flex-none px-6 py-2 rounded-lg text-xs font-bold transition-all", tab === 'Semua' ? "bg-white/10 text-white" : "text-white/40")}>
                     {tab}
                   </button>
                 ))}
              </div>
              <div className="relative w-full md:w-80">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                 <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Cari ID atau nama..." className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 text-sm outline-none text-white focus:border-[var(--color-primary)] transition-all" />
              </div>
           </div>

           <div className="glass-card overflow-hidden">
              <div className="overflow-x-auto">
                 <table className="w-full text-left">
                    <thead>
                       <tr className="border-b border-white/5 bg-white/[0.02]">
                          <th className="px-6 py-4 text-[10px] font-black text-white/30 uppercase tracking-widest">Transaction</th>
                          <th className="px-6 py-4 text-[10px] font-black text-white/30 uppercase tracking-widest">Player</th>
                          <th className="px-6 py-4 text-[10px] font-black text-white/30 uppercase tracking-widest">Type</th>
                          <th className="px-6 py-4 text-[10px] font-black text-white/30 uppercase tracking-widest text-right">Amount</th>
                          <th className="px-6 py-4 text-[10px] font-black text-white/30 uppercase tracking-widest">Status</th>
                          <th className="px-6 py-4 text-[10px] font-black text-white/30 uppercase tracking-widest text-right">Aksi</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                       {filteredTransactions.map((tx: any) => (
                         <tr key={tx.id} className="hover:bg-white/[0.01] transition-all group">
                            <td className="px-6 py-4">
                               <p className="font-mono text-xs text-white/60">{tx.id}</p>
                               <p className="text-[10px] text-white/20 uppercase tracking-widest">{tx.date}</p>
                            </td>
                            <td className="px-6 py-4 font-bold text-sm tracking-tight text-white">{tx.player}</td>
                            <td className="px-6 py-4">
                               <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{tx.type}</span>
                            </td>
                            <td className="px-6 py-4 text-right font-display font-bold text-white">
                               {formatCurrency(tx.amount)}
                            </td>
                            <td className="px-6 py-4">
                               <div className={cn(
                                 "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest",
                                 tx.status === 'Paid' ? "bg-green-500/10 text-green-400" :
                                 tx.status === 'Pending' ? "bg-yellow-500/10 text-yellow-500" : "bg-red-500/10 text-red-500"
                               )}>
                                 {tx.status === 'Paid' ? <CheckCircle2 className="w-3 h-3" /> :
                                  tx.status === 'Pending' ? <Clock className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                                 {tx.status}
                               </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                               <div className="flex items-center justify-end gap-2">
                                  <button onClick={() => handleOpenEdit(tx)} className="p-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white transition-all"><Edit2 className="w-4 h-4"/></button>
                                  <button onClick={() => handleDelete(tx.id, tx.player)} className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all"><Trash2 className="w-4 h-4"/></button>
                               </div>
                            </td>
                         </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </div>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? "Edit Transaksi" : "Tambah Transaksi Baru"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            <div>
              <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-1.5 block">Nama Pemain</label>
              <input type="text" required value={formData.player} onChange={(e) => setFormData({...formData, player: e.target.value})} className="w-full bg-surface-raised border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-[var(--color-primary)]" placeholder="Nama Lengkap Pemain" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-1.5 block">Jumlah (IDR)</label>
                <input type="number" required value={formData.amount} onChange={(e) => setFormData({...formData, amount: Number(e.target.value)})} className="w-full bg-surface-raised border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-[var(--color-primary)]" />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-1.5 block">Tanggal</label>
                <input type="date" required value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} className="w-full bg-surface-raised border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-[var(--color-primary)] [color-scheme:dark]" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-1.5 block">Kategori Biaya</label>
                <select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})} className="w-full bg-surface-raised border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-[var(--color-primary)]">
                  <option value="Registration">Registration</option>
                  <option value="Monthly SPP">Monthly SPP</option>
                  <option value="Uniform Kit">Uniform Kit</option>
                  <option value="Tournament Fee">Tournament Fee</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-1.5 block">Status</label>
                <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="w-full bg-surface-raised border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-[var(--color-primary)]">
                  <option value="Paid">Paid</option>
                  <option value="Pending">Pending</option>
                  <option value="Late">Late</option>
                </select>
              </div>
            </div>
          </div>

          <div className="pt-6 flex gap-3">
             <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 rounded-xl border border-white/10 text-white font-bold text-sm hover:bg-white/5 transition-colors">
               Batal
             </button>
             <button type="submit" className="flex-1 py-3 rounded-xl bg-[var(--color-primary)] text-black font-bold text-sm hover:shadow-[0_0_20px_var(--color-primary-glow)] transition-all">
               <Save className="w-4 h-4" /> Simpan
             </button>
          </div>
        </form>
      </Modal>

      <ConfirmModal 
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, id: '', player: '' })}
        onConfirm={() => deleteItem(deleteConfirm.id)}
        message={`Yakin ingin menghapus transaksi untuk "${deleteConfirm.player}"?`}
      />
    </Layout>
  );
}

