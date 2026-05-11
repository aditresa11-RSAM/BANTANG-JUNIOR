import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CreditCard, TrendingUp, TrendingDown, Search, Filter, Download, Plus,
  ArrowUpRight, Clock, CheckCircle2, AlertCircle, FileText, DollarSign,
  Edit2, Trash2, Save, BarChart2, Briefcase, ChevronDown, Wallet, ArrowDownRight, Upload, Activity,
  Users, UserPlus, Shirt, Trophy, Bus, Star, Flag, Box
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';
import Layout from '../components/ui/Layout';
import { cn, formatCurrency } from '../lib/utils';
import { useCMSData } from '../lib/store';
import { Modal } from '../components/ui/Modal';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { toast } from 'sonner';
import { SearchableDropdown } from '../components/ui/SearchableDropdown';

const initialTransactions = [
  { id: 'TX-001', player_id: '1', title: '', amount: 850000, type: 'Income', category: 'Uang Pendaftaran', date: '2026-05-01', status: 'Lunas', method: 'Transfer Bank', notes: 'Lunas semester 1' },
  { id: 'TX-002', player_id: '2', title: '', amount: 500000, type: 'Income', category: 'SPP Bulanan', date: '2026-05-03', status: 'Lunas', method: 'QRIS', notes: '' },
  { id: 'TX-003', player_id: '', title: 'Pemeliharaan Lapangan', amount: 1200000, type: 'Expense', category: 'Sewa Lapangan', date: '2026-05-05', status: 'Lunas', method: 'Transfer Bank', notes: 'Sewa lap bulan Mei' },
  { id: 'TX-004', player_id: '', title: 'Honor Pelatih (U-12)', amount: 2500000, type: 'Expense', category: 'Honor Pelatih', date: '2026-05-06', status: 'Lunas', method: 'Transfer Bank', notes: 'Honor 2 pelatih' },
  { id: 'TX-005', player_id: '3', title: '', amount: 500000, type: 'Income', category: 'SPP Bulanan', date: '2026-05-08', status: 'Terlambat', method: '-', notes: 'Belum bayar bulan ini' },
  { id: 'TX-006', player_id: '4', title: '', amount: 1500000, type: 'Income', category: 'Turnamen', date: '2026-05-08', status: 'Menunggu', method: 'Transfer Bank', notes: 'Upload bukti belum divalidasi' },
];

const CATEGORY_OPTIONS = [
  { value: 'Uang Pendaftaran', label: 'Uang Pendaftaran', icon: <UserPlus className="w-4 h-4" /> },
  { value: 'SPP Bulanan', label: 'SPP Bulanan', icon: <Box className="w-4 h-4" /> },
  { value: 'Uniform Kit', label: 'Uniform Kit', icon: <Shirt className="w-4 h-4" /> },
  { value: 'Iuran Anggota', label: 'Iuran Anggota', icon: <Users className="w-4 h-4" /> },
  { value: 'Iuran Pertandingan Persahabatan', label: 'Iuran Pertandingan Persahabatan', icon: <Flag className="w-4 h-4" /> },
  { value: 'Sponsorship', label: 'Sponsorship', icon: <Star className="w-4 h-4" /> },
  { value: 'Turnamen', label: 'Turnamen', icon: <Trophy className="w-4 h-4" /> },
  { value: 'Transportasi', label: 'Transportasi', icon: <Bus className="w-4 h-4" /> },
  // Additional common expenses
  { value: 'Honor Pelatih', label: 'Honor Pelatih', icon: <Briefcase className="w-4 h-4" /> },
  { value: 'Sewa Lapangan', label: 'Sewa Lapangan', icon: <Box className="w-4 h-4" /> },
  { value: 'Lainnya', label: 'Lainnya', icon: <CreditCard className="w-4 h-4" /> },
];

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#06b6d4', '#f43f5e'];

export default function Financials() {
  const { data: transactions, addItems, updateItem, deleteItem } = useCMSData('financials', initialTransactions);
  const { data: players } = useCMSData('players', []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, id: '', title: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTab, setFilterTab] = useState('Semua');
  
  const [formData, setFormData] = useState({
    type: 'Income', player_id: '', title: '', amount: 0, category: 'SPP Bulanan', custom_category: '', 
    date: new Date().toISOString().split('T')[0], status: 'Lunas', method: 'Transfer Bank', notes: ''
  });

  // Calculate Metrics
  const totalIncome = transactions.filter((t: any) => t.type === 'Income' && t.status === 'Lunas').reduce((a: number, b: any) => a + Number(b.amount || 0), 0);
  const totalExpense = transactions.filter((t: any) => t.type === 'Expense').reduce((a: number, b: any) => a + Number(b.amount || 0), 0);
  const totalBalance = totalIncome - totalExpense;
  const totalTunggakan = transactions.filter((t: any) => t.type === 'Income' && t.status === 'Terlambat').reduce((a: number, b: any) => a + Number(b.amount || 0), 0);
  const tunggakanCount = transactions.filter((t: any) => t.type === 'Income' && t.status === 'Terlambat').length;
  
  // Charts Data
  const chartData = useMemo(() => {
    // Group transactions by date for Area Chart
    const dates = [...new Set(transactions.map((t: any) => t.date))].sort();
    return dates.map(date => {
      const txOnDate = transactions.filter((t: any) => t.date === date);
      const inc: number = txOnDate.filter((t: any) => t.type === 'Income' && t.status === 'Lunas').reduce((a: number, b: any) => a + Number(b.amount), 0);
      const exp: number = txOnDate.filter((t: any) => t.type === 'Expense').reduce((a: number, b: any) => a + Number(b.amount), 0);
      return {
        date: new Date(date as string).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
        Pendapatan: inc,
        Pengeluaran: exp
      };
    }).slice(-15); // Last 15 days
  }, [transactions]);

  const pieData = useMemo(() => {
    // Collect all expenses across all categories, grouping dynamically
    const expenseDataMap: Record<string, number> = {};
    transactions.filter((t: any) => t.type === 'Expense').forEach((t: any) => {
        expenseDataMap[t.category] = (expenseDataMap[t.category] || 0) + Number(t.amount);
    });
    return Object.entries(expenseDataMap).map(([name, value]) => ({ name, value }));
  }, [transactions]);

  const filteredTransactions = transactions.filter((tx: any) => {
      const matchedPlayer = players.find((p: any) => p.id === tx.player_id);
      const playerName = matchedPlayer ? matchedPlayer.name : (tx.student_name || '');
      const matchesSearch = playerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            (tx.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (tx.id || '').toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;
    
    if (filterTab === 'Semua') return true;
    if (filterTab === 'Pemasukan') return tx.type === 'Income';
    if (filterTab === 'Pengeluaran') return tx.type === 'Expense';
    if (filterTab === 'Tunggakan') return tx.status === 'Terlambat';
    if (filterTab === 'Pending') return tx.status === 'Menunggu' || tx.status === 'Cicilan';
    
    return true;
  }).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({ 
      type: 'Income', player_id: '', title: '', amount: 0, category: 'SPP Bulanan', custom_category: '',
      date: new Date().toISOString().split('T')[0], status: 'Lunas', method: 'Transfer Bank', notes: '' 
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: any) => {
    // Check if category is standard
    const isStandard = CATEGORY_OPTIONS.some(o => o.value === item.category);
    
    setEditingItem(item);
    setFormData({
      ...item,
      category: isStandard ? item.category : 'Lainnya',
      custom_category: isStandard ? '' : item.category,
      player_id: item.player_id || 'non-siswa'
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const loadingToast = toast.loading(editingItem ? "Memperbarui transaksi..." : "Menyimpan transaksi...");
    
    try {
      // Ensure numeric amount
      const finalCategory = formData.category === 'Lainnya' && formData.custom_category ? formData.custom_category : formData.category;
      
      const dataToSave = {
        ...formData,
        category: finalCategory,
        amount: Number(formData.amount),
        player_id: formData.type === 'Income' ? (formData.player_id === 'non-siswa' ? '' : formData.player_id) : '',
        // Clean up unneeded fields
        custom_category: undefined
      };

      if (editingItem) {
        await updateItem(editingItem.id, dataToSave);
        toast.success("Transaksi berhasil diperbarui!", { id: loadingToast });
      } else {
        const id = `TX-${new Date().getFullYear().toString().substring(2)}${Math.floor(1000 + Math.random() * 9000)}`;
        await addItems({ ...dataToSave, id });
        toast.success("Transaksi berhasil disimpan!", { id: loadingToast });
        
        // Reset form to default
        setFormData({ 
          type: 'Income', player_id: '', title: '', amount: 0, category: 'SPP Bulanan', custom_category: '', 
          date: new Date().toISOString().split('T')[0], status: 'Lunas', method: 'Transfer Bank', notes: '' 
        });
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error("Gagal menyimpan transaksi", error);
      toast.error("Terjadi kesalahan saat menyimpan data.", { id: loadingToast });
      setIsModalOpen(false);
    }
  };

  const handleDelete = (id: string, name: string) => {
    setDeleteConfirm({ isOpen: true, id, title: name });
  };

  return (
    <Layout>
      <div className="space-y-8 pb-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-display font-black text-white uppercase tracking-tight flex items-center gap-4">
              Manajemen <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500">Keuangan</span>
            </h1>
            <p className="text-white/50 text-sm mt-2 font-medium">Monitoring arus kas, tunggakan siswa, dan operasional akademi.</p>
          </div>
          <div className="flex items-center gap-3">
             <button className="bg-[#0a0f1c] border border-white/10 hover:border-white/30 text-white p-3 rounded-xl flex items-center gap-2 transition-all font-bold text-xs uppercase tracking-widest hidden sm:flex">
                <Download className="w-4 h-4" /> Laporan
             </button>
             <button onClick={handleOpenAdd} className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:shadow-[0_0_40px_rgba(16,185,129,0.5)] p-3 px-6 rounded-xl flex items-center gap-2 transition-all font-black uppercase tracking-widest text-xs">
                <Plus className="w-4 h-4" /> Transaksi
             </button>
          </div>
        </div>

        {/* Top Summaries */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
           {/* Pendapatan */}
           <div className="bg-[#0a0f1c] bg-opacity-70 backdrop-blur-xl border border-white/10 rounded-3xl p-6 relative overflow-hidden group shadow-2xl">
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 group-hover:scale-110 transition-all duration-500">
                <TrendingUp className="w-20 h-20 text-emerald-400" />
              </div>
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                <ArrowUpRight className="w-5 h-5 text-emerald-400" />
              </div>
              <p className="text-[10px] uppercase font-black text-white/40 tracking-[0.2em] mb-1">Total Pendapatan</p>
              <h2 className="text-3xl font-display font-black text-white truncate" title={formatCurrency(totalIncome)}>{formatCurrency(totalIncome)}</h2>
              <div className="mt-4 flex items-center gap-2 text-xs font-bold text-emerald-400">
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">Realtime</span>
              </div>
           </div>

           {/* Pengeluaran */}
           <div className="bg-[#0a0f1c] bg-opacity-70 backdrop-blur-xl border border-white/10 rounded-3xl p-6 relative overflow-hidden group shadow-2xl">
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 group-hover:scale-110 transition-all duration-500">
                <TrendingDown className="w-20 h-20 text-rose-400" />
              </div>
              <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center mb-4 border border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.2)]">
                <ArrowDownRight className="w-5 h-5 text-rose-400" />
              </div>
              <p className="text-[10px] uppercase font-black text-white/40 tracking-[0.2em] mb-1">Total Pengeluaran</p>
              <h2 className="text-3xl font-display font-black text-white truncate" title={formatCurrency(totalExpense)}>{formatCurrency(totalExpense)}</h2>
              <div className="mt-4 flex items-center gap-2 text-xs font-bold text-rose-400">
                <span className="px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20">Semua Waktu</span>
              </div>
           </div>

           {/* Kas */}
           <div className="bg-[#0a0f1c] bg-opacity-70 backdrop-blur-xl border border-white/10 rounded-3xl p-6 relative overflow-hidden group shadow-2xl">
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 group-hover:scale-110 transition-all duration-500">
                <Wallet className="w-20 h-20 text-blue-400" />
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center mb-4 border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                <DollarSign className="w-5 h-5 text-blue-400" />
              </div>
              <p className="text-[10px] uppercase font-black text-white/40 tracking-[0.2em] mb-1">Saldo Kas Saat Ini</p>
              <h2 className="text-3xl font-display font-black text-white truncate" title={formatCurrency(totalBalance)}>{formatCurrency(totalBalance)}</h2>
              <div className="mt-4 flex items-center gap-2 text-xs font-bold text-blue-400">
                <span className="px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20">Masih Tersedia</span>
              </div>
           </div>

           {/* Tunggakan */}
           <div className="bg-gradient-to-br from-[#1a0f14] to-[#0a0f1c] border border-orange-500/20 rounded-3xl p-6 relative overflow-hidden group shadow-[0_0_30px_rgba(249,115,22,0.05)]">
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 group-hover:scale-110 transition-all duration-500">
                <AlertCircle className="w-20 h-20 text-orange-400" />
              </div>
              <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center mb-4 border border-orange-500/20 shadow-[0_0_15px_rgba(249,115,22,0.2)]">
                <AlertCircle className="w-5 h-5 text-orange-400" />
              </div>
              <p className="text-[10px] uppercase font-black text-orange-300/60 tracking-[0.2em] mb-1">Total Tunggakan</p>
              <h2 className="text-3xl font-display font-black text-orange-400 truncate" title={formatCurrency(totalTunggakan)}>{formatCurrency(totalTunggakan)}</h2>
              <div className="mt-4 flex items-center gap-2 text-xs font-bold text-orange-400/80">
                <span className="px-2 py-0.5 rounded-full bg-orange-500/10 border border-orange-500/20">{tunggakanCount} Transaksi / Siswa</span>
              </div>
           </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           {/* Area Chart */}
           <div className="lg:col-span-2 bg-[#0a0f1c]/70 backdrop-blur-xl border border-white/5 rounded-[2rem] p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-8">
                 <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                   <Activity className="w-4 h-4 text-emerald-400" /> Arus Keuangan
                 </h3>
              </div>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorInc" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                    <XAxis dataKey="date" stroke="#ffffff30" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#ffffff30" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(value) => `Rp ${value / 1000}k`} />
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '1rem', color: '#fff', fontSize: '12px' }}
                      itemStyle={{ fontWeight: 'bold' }}
                      formatter={(val: number) => formatCurrency(val)}
                    />
                    <Area type="monotone" dataKey="Pendapatan" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorInc)" />
                    <Area type="monotone" dataKey="Pengeluaran" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorExp)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
           </div>

           {/* Pie Chart */}
           <div className="bg-[#0a0f1c]/70 backdrop-blur-xl border border-white/5 rounded-[2rem] p-6 shadow-2xl flex flex-col">
              <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2 mb-6">
                <PieChart className="w-4 h-4 text-blue-400" /> Rasio Pengeluaran
              </h3>
              <div className="flex-1 min-h-[250px] relative">
                {pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip 
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem', color: '#fff', fontSize: '12px' }}
                        formatter={(val: number) => formatCurrency(val)}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-white/30 text-xs">Belum ada data pengeluaran</div>
                )}
              </div>
              <div className="mt-4 space-y-2">
                {pieData.map((entry, index) => (
                  <div key={index} className="flex flex-col text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                        <span className="text-white/60 font-medium truncate max-w-[120px]">{entry.name}</span>
                      </div>
                      <span className="text-white font-bold">{formatCurrency(entry.value)}</span>
                    </div>
                  </div>
                ))}
              </div>
           </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-[#0a0f1c]/70 backdrop-blur-xl border border-white/5 rounded-[2rem] overflow-hidden shadow-2xl">
           <div className="p-6 border-b border-white/5">
             <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex flex-wrap gap-2">
                   {['Semua', 'Pemasukan', 'Pengeluaran', 'Tunggakan', 'Pending'].map(tab => (
                     <button 
                       key={tab} 
                       onClick={() => setFilterTab(tab)}
                       className={cn(
                         "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300", 
                         filterTab === tab 
                           ? tab === 'Pemasukan' ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                           : tab === 'Pengeluaran' ? "bg-rose-500/10 text-rose-400 border border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.1)]"
                           : tab === 'Tunggakan' ? "bg-orange-500/10 text-orange-400 border border-orange-500/20 shadow-[0_0_15px_rgba(249,115,22,0.1)]"
                           : "bg-blue-500/20 text-blue-400 border border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.2)]"
                           : "bg-[#080d19] border border-white/5 text-white/40 hover:bg-white/10 hover:text-white"
                       )}>
                       {tab}
                     </button>
                   ))}
                </div>
                <div className="relative w-full md:w-72">
                   <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                   <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Cari ID, nama siswa..." className="w-full bg-[#080d19] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm outline-none text-white focus:border-[var(--color-primary)] transition-all shadow-inner" />
                </div>
             </div>
           </div>

           <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                 <thead>
                    <tr className="bg-white/[0.02]">
                       <th className="px-6 py-5 text-[10px] font-black text-white/30 uppercase tracking-widest whitespace-nowrap">ID / Tanggal</th>
                       <th className="px-6 py-5 text-[10px] font-black text-white/30 uppercase tracking-widest">Detail Keterangan</th>
                       <th className="px-6 py-5 text-[10px] font-black text-white/30 uppercase tracking-widest">Kategori</th>
                       <th className="px-6 py-5 text-[10px] font-black text-white/30 uppercase tracking-widest">Status / Metode</th>
                       <th className="px-6 py-5 text-[10px] font-black text-white/30 uppercase tracking-widest text-right">Nominal</th>
                       <th className="px-6 py-5 text-[10px] font-black text-white/30 uppercase tracking-widest text-right">Aksi</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-white/5">
                    {filteredTransactions.map((tx: any) => {
                      const matchedPlayer = players.find((p: any) => p.id === tx.player_id);
                      const displayPlayerName = matchedPlayer ? matchedPlayer.name : (tx.student_name || 'Tanpa Nama');
                      
                      return (
                      <tr key={tx.id} className="hover:bg-white/[0.03] transition-colors group">
                         <td className="px-6 py-4 align-top">
                            <p className="font-mono text-xs text-white/70 font-bold tracking-wider">{tx.id}</p>
                            <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1">
                               {new Date(tx.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </p>
                         </td>
                         <td className="px-6 py-4 align-top max-w-[200px]">
                            <div className="flex items-start gap-3">
                              <div className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 shadow-inner",
                                tx.type === 'Income' ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                              )}>
                                {tx.type === 'Income' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                              </div>
                              <div>
                                <p className="font-bold text-sm tracking-tight text-white mb-0.5 whitespace-nowrap overflow-hidden text-ellipsis">
                                  {tx.type === 'Income' ? displayPlayerName : (tx.title || 'Pengeluaran')}
                                </p>
                                {tx.notes && <p className="text-[10px] text-white/50 leading-relaxed line-clamp-2">{tx.notes}</p>}
                                {tx.type === 'Income' && !matchedPlayer && !tx.student_name && <span className="text-[10px] text-rose-400 font-bold uppercase tracking-widest inline-block mt-1 bg-red-900/40 px-1 border border-red-500/20 rounded">No Student</span>}
                              </div>
                            </div>
                         </td>
                         <td className="px-6 py-4 align-top">
                            <span className="inline-block bg-[#080d19] border border-white/5 rounded-lg px-3 py-1.5 text-[10px] font-black text-white/60 uppercase tracking-widest whitespace-nowrap shadow-inner">
                              {tx.category}
                            </span>
                         </td>
                         <td className="px-6 py-4 align-top">
                            <div className="flex flex-col items-start gap-1.5">
                               <div className={cn(
                                 "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[10px] font-black uppercase tracking-widest shadow-inner",
                                 tx.status === 'Lunas' ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" :
                                 tx.status === 'Terlambat' ? "bg-orange-500/10 border-orange-500/30 text-orange-400" :
                                 tx.status === 'Menunggu' ? "bg-yellow-500/10 border-yellow-500/30 text-amber-400" :
                                 "bg-blue-500/10 border-blue-500/30 text-blue-400"
                               )}>
                                 {tx.status === 'Lunas' ? <CheckCircle2 className="w-3 h-3" /> :
                                  tx.status === 'Menunggu' ? <Clock className="w-3 h-3" /> :
                                  tx.status === 'Terlambat' ? <AlertCircle className="w-3 h-3" /> : <CreditCard className="w-3 h-3" />}
                                 {tx.status}
                               </div>
                               <span className="text-[9px] text-white/40 uppercase tracking-widest font-bold ml-1">{tx.method || '-'}</span>
                            </div>
                         </td>
                         <td className="px-6 py-4 text-right align-top">
                            <p className={cn(
                              "font-display font-black text-lg whitespace-nowrap",
                              tx.type === 'Income' ? "text-emerald-400" : "text-rose-400"
                            )}>
                               {tx.type === 'Income' ? '+' : '-'}{formatCurrency(tx.amount)}
                            </p>
                         </td>
                         <td className="px-6 py-4 text-right align-top">
                            <div className="flex items-center justify-end gap-2">
                               <button onClick={() => handleOpenEdit(tx)} className="p-2 rounded-xl bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white transition-all border border-blue-500/20" title="Edit">
                                 <Edit2 className="w-4 h-4"/>
                               </button>
                               <button onClick={() => handleDelete(tx.id, tx.type === 'Income' ? displayPlayerName : tx.title)} className="p-2 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white transition-all border border-rose-500/20" title="Hapus">
                                 <Trash2 className="w-4 h-4"/>
                               </button>
                            </div>
                         </td>
                      </tr>
                    )})}
                    {filteredTransactions.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-white/40">
                          <div className="flex flex-col items-center justify-center gap-3">
                            <Search className="w-8 h-8 text-white/20" />
                            <p className="text-sm font-bold">Tidak ada transaksi ditemukan.</p>
                          </div>
                        </td>
                      </tr>
                    )}
                 </tbody>
              </table>
           </div>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? "Edit Transaksi" : "Tambah Transaksi Baru"}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex gap-4 p-1.5 bg-[#080d19] border border-white/5 rounded-2xl shadow-inner">
            <button
              type="button"
              onClick={() => setFormData({...formData, type: 'Income', category: 'Iuran Bulanan'})}
              className={cn(
                "flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2",
                formData.type === 'Income' ? "bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]" : "text-white/40 hover:text-white hover:bg-white/5"
              )}
            >
              <TrendingUp className="w-4 h-4" /> Pemasukan Siswa
            </button>
            <button
              type="button"
              onClick={() => setFormData({...formData, type: 'Expense', category: 'Pengeluaran Operasional'})}
              className={cn(
                "flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2",
                formData.type === 'Expense' ? "bg-rose-500/20 border border-rose-500/30 text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.2)]" : "text-white/40 hover:text-white hover:bg-white/5"
              )}
            >
              <TrendingDown className="w-4 h-4" /> Pengeluaran
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-2">
              <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold block">{formData.type === 'Income' ? 'Pilih Pemain (Siswa)' : 'Judul Pengeluaran'}</label>
              {formData.type === 'Income' ? (
                <SearchableDropdown
                   options={[
                     { value: 'non-siswa', label: 'Non-Siswa / Umum' },
                     ...players.map((p: any) => ({ value: p.id, label: `${p.name} - ${p.category || 'Pemain'}` }))
                   ]}
                   value={formData.player_id}
                   onChange={(val) => setFormData({...formData, player_id: val})}
                   placeholder="-- Cari & Pilih Pemain --"
                   searchPlaceholder="Cari nama pemain..."
                />
              ) : (
                <input type="text" required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full bg-[#080d19] border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-blue-500 shadow-inner" placeholder="Misal: Pembelian bola latihan" />
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold block">Kategori Biaya</label>
              <SearchableDropdown
                options={CATEGORY_OPTIONS}
                value={formData.category}
                onChange={(val) => setFormData({...formData, category: val, custom_category: ''})}
                placeholder="Pilih Kategori"
              />
              {formData.category === 'Lainnya' && (
                <div className="mt-2">
                  <input type="text" required placeholder="Tuliskan kategori biaya..." value={formData.custom_category || ''} onChange={(e) => setFormData({...formData, custom_category: e.target.value})} className="w-full bg-[#080d19] border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-blue-500 shadow-inner" />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold block">Nominal (Rp)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 font-bold">Rp</span>
                <input type="number" required min="1" value={formData.amount === 0 ? '' : formData.amount} onChange={(e) => setFormData({...formData, amount: parseInt(e.target.value) || 0})} className="w-full bg-[#080d19] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-blue-500 shadow-inner font-mono font-bold" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold block">Tanggal Transaksi</label>
              <input type="date" required value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} className="w-full bg-[#080d19] border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-blue-500 [color-scheme:dark] shadow-inner" />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold block">Metode Pembayaran</label>
              <select value={formData.method} onChange={(e) => setFormData({...formData, method: e.target.value})} className="w-full bg-[#080d19] border border-white/10 rounded-xl py-3 px-4 text-sm text-white outline-none focus:border-blue-500 appearance-none shadow-inner">
                <option value="Transfer Bank">Transfer Bank</option>
                <option value="Cash">Cash (Tunai)</option>
                <option value="QRIS">QRIS</option>
                <option value="E-Wallet">E-Wallet (OVO/Dana/Gopay)</option>
                <option value="-">-</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold block">Status Transaksi</label>
              <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="w-full bg-[#080d19] border border-white/10 rounded-xl py-3 px-4 text-sm text-white outline-none focus:border-blue-500 appearance-none shadow-inner">
                <option value="Lunas">Lunas / Selesai</option>
                <option value="Menunggu">Menunggu Verifikasi</option>
                <option value="Terlambat">Tunggakan (Belum Bayar)</option>
                <option value="Cicilan">Cicilan</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold block">Upload Bukti (Opsional)</label>
              <div className="w-full bg-[#080d19] border border-white/10 border-dashed rounded-xl py-3 px-4 flex items-center justify-center gap-2 cursor-pointer hover:bg-white/5 transition-colors group">
                 <Upload className="w-4 h-4 text-white/40 group-hover:text-blue-400" />
                 <span className="text-xs text-white/40 group-hover:text-blue-400 font-bold">Upload PDF / JPG</span>
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold block">Catatan Tambahan</label>
              <textarea value={formData.notes || ''} onChange={(e) => setFormData({...formData, notes: e.target.value})} rows={2} className="w-full bg-[#080d19] border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-blue-500 resize-none shadow-inner" placeholder="Tambahkan keterangan..." />
            </div>
          </div>

          <div className="pt-8 mt-6 border-t border-white/5 flex gap-3">
             <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3.5 rounded-xl border border-white/10 text-white font-bold text-xs uppercase tracking-widest hover:bg-white/10 transition-colors">
               Batal
             </button>
             <button type="submit" className="flex-1 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-widest shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] transition-all flex items-center justify-center gap-2">
               <Save className="w-4 h-4" /> Simpan Transaksi
             </button>
          </div>
        </form>
      </Modal>

      <ConfirmModal 
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, id: '', title: '' })}
        onConfirm={() => deleteItem(deleteConfirm.id)}
        message={`Yakin ingin menghapus transaksi "${deleteConfirm.title || deleteConfirm.id}"? Transaksi yang dihapus akan mempengaruhi laporan kas.`}
      />
    </Layout>
  );
}
