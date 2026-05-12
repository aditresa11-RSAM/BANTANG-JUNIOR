import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Filter, CheckCircle2, XCircle, Trash2, Edit2, Download, QrCode, UserPlus, Clock, CreditCard, ChevronRight, Users, FileText, Maximize2, AlertCircle, Eye } from 'lucide-react';
import { useCMSData } from '../lib/store';
import { cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/ui/Layout';
import { useAuth } from '../App';
import { toast } from 'sonner';

export default function RegistrationAdmin() {
  const { data: registrations, updateItem, deleteItem } = useCMSData('registrations', []);
  const { addItems: addPlayer } = useCMSData('players', []);
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterAge, setFilterAge] = useState('All');
  
  const [selectedDocReg, setSelectedDocReg] = useState<any>(null);
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [docModalTab, setDocModalTab] = useState<'profil' | 'medis' | 'dokumen'>('profil');

  const handleOpenDocs = (reg: any) => {
    setSelectedDocReg(reg);
    setDocModalTab('profil');
    setIsDocModalOpen(true);
  };
  
  const handleDownloadDoc = (url: string, filename: string) => {
     if (!url) return;
     window.open(url, '_blank');
  };

  // Filtering
  const filteredData = useMemo(() => {
    return registrations.filter(reg => {
      const regFullName = reg.fullName || reg.fullname || '';
      const regId = reg.registrationId || reg.registrationid || '';
      const regStatus = reg.status || '';
      const regAge = reg.ageCategory || reg.agecategory || '';
      const matchSearch = (regFullName || '').toLowerCase().includes(searchTerm.toLowerCase()) || (regId || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = filterStatus === 'All' || regStatus === filterStatus;
      const matchAge = filterAge === 'All' || regAge === filterAge;
      return matchSearch && matchStatus && matchAge;
    });
  }, [registrations, searchTerm, filterStatus, filterAge]);

  const handleApprove = async (reg: any) => {
    const regFullName = reg.fullName || reg.fullname || '';
    const getVal = (primary: string, secondary: string) => reg[primary] !== undefined ? reg[primary] : reg[secondary];
    
    // Document Validation
    const kkUrl = getVal('kk_url', 'kk_url') || '';
    const aktaUrl = getVal('akta_url', 'akta_url') || '';
    
    if (!kkUrl || !aktaUrl) {
        toast.error("Dokumen siswa belum lengkap. Harap periksa Kartu Keluarga dan Akta Kelahiran terlebih dahulu.", { duration: 5000 });
        return;
    }
    
    const loadingToast = toast.loading(`Memproses pendaftaran ${regFullName}...`);
    
    try {
      // Extract data with fallback for lowercase keys (Supabase often lowercases columns)
      
      // Move to players
      const newPlayerData = {
        name: regFullName,
        photo: getVal('photoUrl', 'photourl') || '',
        category: getVal('ageCategory', 'agecategory') || 'U12',
        position: getVal('position_main', 'position_main') || getVal('position', 'position') || 'Midfielder',
        position_detail: getVal('position_detail', 'position_detail') || '',
        dob: getVal('birthDate', 'birthdate') || '',
        birthplace: getVal('birthPlace', 'birthplace') || '',
        gender: getVal('gender', 'gender') || 'Laki-laki',
        height: parseInt(getVal('height', 'height') || 0) || 150,
        weight: parseInt(getVal('weight', 'weight') || 0) || 45,
        overall: 60, // Better default starting rating
        dribbling: 60,
        passing: 60,
        shooting: 60,
        stamina: 60,
        pace: 60,
        vision: 60,
        teamwork: 60,
        tactical: 60,
        jersey: Math.floor(Math.random() * 99) + 1, // temporary random jersey
        status: 'Active',
        kk_url: getVal('kk_url', 'kk_url') || '',
        akta_url: getVal('akta_url', 'akta_url') || '',
        kia_url: getVal('kia_url', 'kia_url') || '',
        parent_name: getVal('parentName', 'parentname') || '',
        parent_phone: getVal('phone', 'phone') || '',
        address: getVal('address', 'address') || '',
        has_medical_history: reg.has_medical_history === true || reg.has_medical_history === 'Ya',
        medical_history: getVal('medical_history', 'medical_history') || '',
        allergy_history: getVal('allergy_history', 'allergy_history') || '',
        injury_history: getVal('injury_history', 'injury_history') || '',
        medication_notes: getVal('medication_notes', 'medication_notes') || '',
        health_notes: getVal('health_notes', 'health_notes') || '',
        registration_id: getVal('registrationId', 'registrationid') || ''
      };

      await addPlayer(newPlayerData);
      
      // Mark as accepted
      await updateItem(reg.id, { status: 'Diterima' });
      
      toast.success(`Berhasil! ${regFullName} telah ditambahkan ke database Pemain.`, { id: loadingToast });
    } catch (error) {
      console.error("Gagal menerima pendaftaran:", error);
      toast.error("Terjadi kesalahan saat memproses pendaftaran.", { id: loadingToast });
    }
  };

  const handleReject = (reg: any) => {
    const regFullName = reg.fullName || reg.fullname || '';
    updateItem(reg.id, { status: 'Ditolak' });
    toast.error(`Pendaftaran ${regFullName} ditolak.`);
  };

  const handleDelete = (reg: any) => {
    const regFullName = reg.fullName || reg.fullname || '';
    deleteItem(reg.id);
    toast.info(`Data pendaftaran ${regFullName} dihapus.`);
  };

  const handlePaymentStatus = (reg: any, newStatus: string) => {
    updateItem(reg.id, { status: newStatus });
    toast.success(`Status pendaftaran diperbarui menjadi ${newStatus}`);
  };

  return (
    <Layout>
    <div className="flex flex-col gap-8 pb-16 w-full max-w-7xl mx-auto px-4 md:px-8 mt-4 animate-in fade-in zoom-in duration-1000">
      
      {/* HEADER */}
      <div className="border-b border-white/5 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
             <span className="w-4 h-1 bg-blue-500 rounded-full" />
             <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50">Admin Workspace</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-display font-black tracking-tight leading-none uppercase text-white">
            Pendaftaran <span className="text-[#fdc700]">Siswa Baru</span>
          </h1>
          <p className="text-sm font-medium text-white/40 mt-3 flex items-center gap-2">
            Verifikasi dan periksa data calon pemain akademi
          </p>
        </div>
        <div className="flex items-center gap-3">
           <button onClick={() => navigate('/register-player')} className="bg-white/5 hover:bg-white/10 text-white px-5 py-3 rounded-xl flex items-center gap-2 transition-all font-bold text-xs border border-white/10 uppercase tracking-widest">
             <UserPlus className="w-4 h-4" /> DAFTAR SISWA BARU
           </button>
           {isAdmin && (
             <button className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-3 rounded-xl flex items-center gap-2 transition-all font-bold text-xs shadow-[0_4px_20px_rgba(5,150,105,0.3)] uppercase tracking-widest">
               <Download className="w-4 h-4" /> Export CSV
             </button>
           )}
        </div>
      </div>

      {/* DASHBOARD STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Pendaftar', value: registrations.length, icon: Users, color: 'blue' },
          { label: 'Menunggu Verifikasi', value: registrations.filter(r => r.status === 'Belum Bayar' || r.status === 'DP').length, icon: Clock, color: 'yellow' },
          { label: 'Diterima', value: registrations.filter(r => r.status === 'Diterima').length, icon: CheckCircle2, color: 'emerald' },
          { label: 'Ditolak', value: registrations.filter(r => r.status === 'Ditolak').length, icon: XCircle, color: 'red' },
        ].map((stat, i) => {
          const Icon = stat.icon;
          const colors: any = {
            blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
            yellow: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
            emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
            red: 'text-red-400 bg-red-500/10 border-red-500/20',
          };
          return (
            <div key={i} className="bg-[#0c162d]/80 backdrop-blur-xl border border-white/5 p-6 rounded-3xl shadow-xl flex flex-col justify-between relative overflow-hidden group">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-white/50">{stat.label}</span>
                <div className={`p-2 rounded-xl border ${colors[stat.color]}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <h2 className="text-4xl font-display font-black text-white">{stat.value}</h2>
            </div>
          );
        })}
      </div>

      {/* TOOLBAR CONTROLS */}
      <div className="bg-[#0c162d]/80 backdrop-blur-xl border border-white/5 p-4 rounded-3xl shadow-lg flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
           <input 
             type="text" 
             placeholder="Cari nama atau No. Registrasi..." 
             className="w-full pl-12 pr-4 py-3 bg-[#080d19] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
             value={searchTerm}
             onChange={e => setSearchTerm(e.target.value)}
           />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 bg-[#080d19] border border-white/10 rounded-xl px-3 flex-1 md:w-auto">
            <Filter className="w-4 h-4 text-white/40 shrink-0" />
            <select 
              value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
              className="py-3 bg-transparent text-white text-xs font-bold uppercase tracking-widest focus:outline-none w-full appearance-none pr-4"
            >
              <option value="All">Semua Status</option>
              <option value="Belum Bayar">Belum Bayar</option>
              <option value="DP">DP</option>
              <option value="Lunas">Lunas</option>
              <option value="Diterima">Diterima</option>
              <option value="Ditolak">Ditolak</option>
            </select>
          </div>
          <div className="flex items-center gap-2 bg-[#080d19] border border-white/10 rounded-xl px-3 flex-1 md:w-auto">
             <select 
                value={filterAge} onChange={e => setFilterAge(e.target.value)}
                className="py-3 bg-transparent text-white text-xs font-bold uppercase tracking-widest focus:outline-none w-full appearance-none pr-4"
              >
                <option value="All">Semua Umur</option>
                <option value="U8">U8</option>
                <option value="U10">U10</option>
                <option value="U12">U12</option>
                <option value="U14">U14</option>
                <option value="U16">U16</option>
                <option value="U17">U17</option>
             </select>
          </div>
        </div>
      </div>

      {/* DATA TABLE */}
      <div className="bg-[#0c162d]/90 backdrop-blur-xl border border-white/5 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.5)] overflow-hidden">
         <table className="w-full text-center border-collapse">
           <thead className="hidden lg:table-header-group border-b border-white/10 bg-[#080d19]/80">
             <tr>
               <th className="p-5 text-[11px] font-black uppercase tracking-widest text-white/50 align-middle">Calon Siswa</th>
               <th className="p-5 text-[11px] font-black uppercase tracking-widest text-white/50 align-middle">Kontak Wali</th>
               <th className="p-5 text-[11px] font-black uppercase tracking-widest text-white/50 align-middle">Program</th>
               <th className="p-5 text-[11px] font-black uppercase tracking-widest text-white/50 align-middle">Status</th>
               <th className="p-5 text-[11px] font-black uppercase tracking-widest text-white/50 align-middle">Dokumen</th>
               <th className="p-5 text-[11px] font-black uppercase tracking-widest text-white/50 align-middle">Aksi</th>
             </tr>
           </thead>
           <tbody className="flex flex-col lg:table-row-group gap-4 lg:gap-0 p-4 lg:p-0">
              {filteredData.length > 0 ? filteredData.map((reg, i) => {
                const regFullName = reg.fullName || reg.fullname || '';
                const regId = reg.registrationId || reg.registrationid || '';
                const regGender = reg.gender || '';
                const regParentName = reg.parentName || reg.parentname || '';
                const regPhone = reg.phone || '';
                const regAge = reg.ageCategory || reg.agecategory || '';
                const regPosition = reg.position || '';
                const regSchedule = reg.schedule || '';
                const regStatus = reg.status || '';

                // Document Status
                const kk = reg.kk_url || '';
                const akta = reg.akta_url || '';
                const hasAllRequired = kk && akta;
                const hasAny = kk || akta || reg.kia_url;
                
                let docStatusObj = { text: '⚠ Belum Lengkap', color: 'text-rose-400 bg-rose-500/10 border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.15)]' };
                if (hasAllRequired) {
                  // if it has all, but maybe admin hasn't clicked accept yet
                  docStatusObj = regStatus === 'Diterima' ? { text: '✓ Lengkap', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.15)]' } : { text: '⚠ Verifikasi', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.15)]' };
                } else if (hasAny) {
                  docStatusObj = { text: '⚠ Belum Lengkap', color: 'text-rose-400 bg-rose-500/10 border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.15)]' };
                }

                return (
                <tr key={reg.id || i} className="flex flex-col lg:table-row bg-[#0a0f1c] lg:bg-transparent border border-white/5 lg:border-t-0 lg:border-b lg:border-white/5 rounded-[2rem] lg:rounded-none overflow-hidden hover:bg-white/[0.03] transition-all duration-300 group">
                  <td className="p-6 lg:p-5 align-middle border-b border-white/5 lg:border-0 relative">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="w-16 h-16 lg:w-12 lg:h-12 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(59,130,246,0.15)]">
                         <UserPlus className="w-6 h-6 lg:w-5 lg:h-5 text-blue-400" />
                      </div>
                      <div className="flex flex-col items-center">
                        <button onClick={() => handleOpenDocs(reg)} className="font-black text-base lg:text-sm text-cyan-400 hover:text-cyan-300 transition-colors mb-0.5 tracking-tight text-center">{regFullName}</button>
                        <p className="text-[10px] text-white/40 uppercase tracking-widest font-mono mb-2 w-full text-center">{regId}</p>
                        <div className="flex bg-[#080d19] items-center justify-center gap-2 p-1 rounded-full border border-white/5">
                           <span className="px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-[9px] font-black uppercase tracking-widest">{regGender}</span>
                           {(reg.previousSSB || reg.previousssb) === 'Ya' && (
                              <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-[9px] font-black uppercase tracking-widest">Eks. {reg.previousSSBName || reg.previousssbname}</span>
                           )}
                        </div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="p-5 align-middle border-b border-white/5 lg:border-0">
                     <div className="flex flex-col items-center justify-center gap-1.5">
                        <span className="lg:hidden text-[9px] font-black uppercase tracking-widest text-white/30">Kontak Wali</span>
                        <p className="font-bold text-xs lg:text-[13px] text-white uppercase text-center">{regParentName}</p>
                        <p className="text-[11px] text-white/50 font-mono bg-white/[0.03] px-2.5 py-1 rounded-lg border border-white/5">{regPhone}</p>
                     </div>
                  </td>
                  
                  <td className="p-5 align-middle border-b border-white/5 lg:border-0">
                     <div className="flex flex-col items-center justify-center gap-2">
                        <span className="lg:hidden text-[9px] font-black uppercase tracking-widest text-white/30">Program</span>
                        <div className="flex items-center justify-center gap-2">
                           <span className="px-3 py-1.5 rounded-xl bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase tracking-widest transform transition-all group-hover:scale-105 border border-indigo-500/20">{regAge}</span>
                           <span className="px-3 py-1.5 rounded-xl bg-white/5 text-white/70 text-[10px] font-bold uppercase tracking-widest border border-white/10">{regPosition}</span>
                        </div>
                        <p className="text-[10px] text-white/40 truncate max-w-[180px] text-center">{regSchedule}</p>
                     </div>
                  </td>
                  
                  <td className="p-5 align-middle border-b border-white/5 lg:border-0">
                     <div className="flex flex-col items-center justify-center gap-2">
                        <span className="lg:hidden text-[9px] font-black uppercase tracking-widest text-white/30">Status Pendaftaran</span>
                        {(!isAdmin || ['Diterima', 'Ditolak'].includes(regStatus)) ? (
                          <div className={cn(
                            "inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border",
                            regStatus === 'Diterima' ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]" : 
                            regStatus === 'Ditolak' ? "bg-red-500/10 border-red-500/30 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.15)]" :
                            "bg-slate-500/10 border-slate-500/30 text-slate-400"
                          )}>
                             {regStatus === 'Diterima' ? <CheckCircle2 className="w-4 h-4" /> : regStatus === 'Ditolak' ? <XCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                             {regStatus}
                          </div>
                        ) : (
                          <select 
                            value={regStatus} 
                            onChange={e => handlePaymentStatus(reg, e.target.value)}
                            className={cn(
                              "px-4 py-2 text-center rounded-xl border text-[10px] font-black uppercase tracking-widest focus:outline-none appearance-none cursor-pointer transition-all",
                              regStatus === 'Belum Bayar' ? "bg-slate-500/10 border-slate-500/30 text-slate-400" :
                              regStatus === 'DP' ? "bg-amber-500/10 border-amber-500/30 text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.15)]" :
                              "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                            )}
                          >
                            <option value="Belum Bayar">Belum Bayar</option>
                            <option value="DP">Cicilan / DP</option>
                            <option value="Lunas">Lunas</option>
                          </select>
                        )}
                     </div>
                  </td>
                  
                  <td className="p-5 align-middle border-b border-white/5 lg:border-0">
                     <div className="flex flex-col items-center justify-center gap-2">
                        <span className="lg:hidden text-[9px] font-black uppercase tracking-widest text-white/30">Dokumen</span>
                        <div className={cn(
                          "inline-flex items-center justify-center px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all",
                          docStatusObj.color
                        )}>
                           {docStatusObj.text}
                        </div>
                     </div>
                  </td>
                  
                  <td className="p-5 align-middle lg:bg-transparent bg-white/[0.01]">
                     <div className="flex items-center justify-center gap-3 flex-wrap">
                        <button onClick={() => handleOpenDocs(reg)} className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500 hover:text-black transition-all border border-cyan-500/20 shadow-inner group-hover:shadow-[0_0_15px_rgba(34,211,238,0.3)]" title="Lihat Detail">
                          <Eye className="w-4 h-4" /> <span className="text-[10px] font-black uppercase tracking-widest leading-none">Detail</span>
                        </button>
                        
                       {isAdmin && !['Diterima', 'Ditolak'].includes(regStatus) && (
                         <>
                           <button onClick={() => handleApprove(reg)} className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-black hover:scale-110 transition-all border border-emerald-500/20" title="Terima & Masukkan ke Pemain">
                             <CheckCircle2 className="w-5 h-5" />
                           </button>
                           <button onClick={() => handleReject(reg)} className="flex items-center justify-center w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white hover:scale-110 transition-all border border-rose-500/20" title="Tolak">
                             <XCircle className="w-5 h-5" />
                           </button>
                         </>
                       )}
                       {isAdmin && (
                        <button onClick={() => handleDelete(reg)} className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 text-white/40 hover:bg-rose-500 hover:text-white hover:scale-110 transition-all border border-white/10" title="Hapus Permanen">
                          <Trash2 className="w-4 h-4" />
                        </button>
                       )}
                     </div>
                  </td>
                </tr>
                )}) : (
                <tr className="block lg:table-row">
                  <td colSpan={6} className="block lg:table-cell p-12 text-center text-white/40 font-medium">
                    Belum ada data pendaftar yang sesuai.
                  </td>
                </tr>
              )}
           </tbody>
         </table>
      </div>
      
      {/* DOCUMENT PREVIEW MODAL */}
      <AnimatePresence>
        {isDocModalOpen && selectedDocReg && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 pb-20 sm:pb-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsDocModalOpen(false)}
              className="absolute inset-0 bg-[#0a0f1c]/90 backdrop-blur-2xl"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl bg-gradient-to-br from-[#0c162d] to-[#0a0f1c] border border-cyan-500/30 rounded-[2rem] shadow-[0_0_50px_rgba(6,182,212,0.15)] flex flex-col overflow-hidden max-h-full"
            >
              {/* Header */}
              <div className="flex flex-col border-b border-white/10 shrink-0 bg-white/[0.01]">
                <div className="flex items-center justify-between p-6">
                  <div>
                     <h3 className="text-xl font-display font-black text-white uppercase tracking-tight flex items-center gap-3">
                       <UserPlus className="w-5 h-5 text-cyan-400" /> Detail Pendaftaran Siswa
                     </h3>
                     <p className="text-sm text-cyan-400/60 font-bold mt-1">{selectedDocReg.fullName || selectedDocReg.fullname}</p>
                  </div>
                  <button onClick={() => setIsDocModalOpen(false)} className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:bg-white/10 hover:text-white transition-all">
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>
                
                {/* Tabs */}
                <div className="flex items-center px-6 gap-6">
                   <button 
                     onClick={() => setDocModalTab('profil')} 
                     className={cn("pb-4 text-xs font-black uppercase tracking-widest border-b-2 transition-all", docModalTab === 'profil' ? "text-cyan-400 border-cyan-400" : "text-white/40 border-transparent hover:text-white/70")}
                   >Data Profil</button>
                   <button 
                     onClick={() => setDocModalTab('medis')} 
                     className={cn("pb-4 text-xs font-black uppercase tracking-widest border-b-2 transition-all", docModalTab === 'medis' ? "text-rose-400 border-rose-400" : "text-white/40 border-transparent hover:text-white/70")}
                   >Riwayat Medis</button>
                   <button 
                     onClick={() => setDocModalTab('dokumen')} 
                     className={cn("pb-4 text-xs font-black uppercase tracking-widest border-b-2 transition-all", docModalTab === 'dokumen' ? "text-amber-400 border-amber-400" : "text-white/40 border-transparent hover:text-white/70")}
                   >Dokumen Siswa</button>
                </div>
              </div>
              
              {/* Content */}
              <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                {docModalTab === 'profil' && (
                   <div className="space-y-8">
                     <div className="flex items-center gap-6">
                        <div className="w-24 h-24 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shrink-0">
                           {selectedDocReg.photoUrl || selectedDocReg.photourl ? (
                             <img src={selectedDocReg.photoUrl || selectedDocReg.photourl} alt="Profile" className="w-full h-full object-cover rounded-2xl" />
                           ) : (
                             <UserPlus className="w-10 h-10 text-cyan-400/50" />
                           )}
                        </div>
                        <div>
                           <p className="text-2xl font-black text-white">{selectedDocReg.fullName || selectedDocReg.fullname}</p>
                           <p className="text-cyan-400 font-mono text-sm mt-1">{selectedDocReg.registrationId || selectedDocReg.registrationid}</p>
                           <div className="flex gap-2 mt-3">
                             <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-white/70">{selectedDocReg.gender}</span>
                             <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-xs font-bold text-cyan-400">{selectedDocReg.ageCategory || selectedDocReg.agecategory}</span>
                             <span className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-xs font-bold text-indigo-400">{selectedDocReg.position_main || selectedDocReg.position}</span>
                           </div>
                        </div>
                     </div>
                     
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                           <h4 className="text-[10px] uppercase font-black tracking-widest text-white/40 mb-4 border-b border-white/10 pb-2">Data Diri</h4>
                           <div className="space-y-4">
                             <div>
                               <p className="text-[10px] text-white/40 mb-1">Tempat, Tanggal Lahir</p>
                               <p className="text-sm text-white font-medium">{selectedDocReg.birthPlace || selectedDocReg.birthplace}, {new Date(selectedDocReg.birthDate || selectedDocReg.birthdate).toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})}</p>
                             </div>
                             <div>
                               <p className="text-[10px] text-white/40 mb-1">Sekolah</p>
                               <p className="text-sm text-white font-medium">{selectedDocReg.school || '-'}</p>
                             </div>
                             <div>
                               <p className="text-[10px] text-white/40 mb-1">Alamat Lengkap</p>
                               <p className="text-sm text-white font-medium">{selectedDocReg.address}</p>
                             </div>
                           </div>
                        </div>
                        
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                           <h4 className="text-[10px] uppercase font-black tracking-widest text-white/40 mb-4 border-b border-white/10 pb-2">Kontak & Program</h4>
                           <div className="space-y-4">
                             <div>
                               <p className="text-[10px] text-white/40 mb-1">Nama Wali</p>
                               <p className="text-sm text-white font-medium">{selectedDocReg.parentName || selectedDocReg.parentname} ({selectedDocReg.parentRelation || 'Wali'})</p>
                             </div>
                             <div>
                               <p className="text-[10px] text-white/40 mb-1">No. WhatsApp</p>
                               <p className="text-sm text-white font-medium font-mono bg-black/20 inline-block px-2 py-0.5 rounded">{selectedDocReg.phone || selectedDocReg.parent_phone}</p>
                             </div>
                             <div>
                               <p className="text-[10px] text-white/40 mb-1">Jadwal Latihan</p>
                               <p className="text-sm text-white font-medium">{selectedDocReg.schedule}</p>
                             </div>
                             <div>
                               <p className="text-[10px] text-white/40 mb-1">Posisi Spesifik</p>
                               <p className="text-sm text-white font-medium">{selectedDocReg.position_detail || '-'}</p>
                             </div>
                           </div>
                        </div>
                     </div>
                   </div>
                )}
                
                {docModalTab === 'medis' && (
                   <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                         <div className="bg-[#080d19] border border-white/10 rounded-2xl p-5 flex flex-col items-center justify-center text-center">
                            <span className="text-[10px] uppercase font-black tracking-widest text-white/40 mb-2">Tinggi Badan</span>
                            <div className="flex items-baseline gap-1">
                               <span className="text-3xl font-black text-rose-400">{selectedDocReg.height || '-'}</span>
                               <span className="text-sm text-rose-400/50 font-bold">cm</span>
                            </div>
                         </div>
                         <div className="bg-[#080d19] border border-white/10 rounded-2xl p-5 flex flex-col items-center justify-center text-center">
                            <span className="text-[10px] uppercase font-black tracking-widest text-white/40 mb-2">Berat Badan</span>
                            <div className="flex items-baseline gap-1">
                               <span className="text-3xl font-black text-rose-400">{selectedDocReg.weight || '-'}</span>
                               <span className="text-sm text-rose-400/50 font-bold">kg</span>
                            </div>
                         </div>
                      </div>
                      
                      <div className="bg-rose-500/5 border border-rose-500/20 rounded-2xl p-6 space-y-6">
                         <div className="flex items-center gap-3 border-b border-rose-500/10 pb-4">
                            <AlertCircle className="w-5 h-5 text-rose-500" />
                            <h4 className="text-sm font-black uppercase tracking-widest text-rose-400">Riwayat Kesehatan Dasar</h4>
                         </div>
                         
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <div>
                             <p className="text-[10px] uppercase font-bold tracking-widest text-white/40 mb-1">Riwayat Penyakit</p>
                             <div className="bg-black/20 border border-white/5 rounded-xl p-4 min-h-[80px]">
                               {selectedDocReg.medical_history || '-'}
                             </div>
                           </div>
                           <div>
                             <p className="text-[10px] uppercase font-bold tracking-widest text-white/40 mb-1">Riwayat Alergi</p>
                             <div className="bg-black/20 border border-white/5 rounded-xl p-4 min-h-[80px]">
                               {selectedDocReg.allergy_history || '-'}
                             </div>
                           </div>
                           <div>
                             <p className="text-[10px] uppercase font-bold tracking-widest text-white/40 mb-1">Pernah Cedera Berat?</p>
                             <div className="bg-black/20 border border-white/5 rounded-xl p-4 min-h-[80px]">
                               {selectedDocReg.injury_history || '-'}
                             </div>
                           </div>
                           <div>
                             <p className="text-[10px] uppercase font-bold tracking-widest text-white/40 mb-1">Catatan Tambahan (Obat/Asma dll)</p>
                             <div className="bg-black/20 border border-white/5 rounded-xl p-4 min-h-[80px]">
                               {selectedDocReg.medication_notes || selectedDocReg.health_notes || '-'}
                             </div>
                           </div>
                         </div>
                      </div>
                   </div>
                )}
                
                {docModalTab === 'dokumen' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                   {[
                     { title: "Kartu Keluarga", url: selectedDocReg.kk_url, req: true },
                     { title: "Akta Kelahiran", url: selectedDocReg.akta_url, req: true },
                     { title: "KIA (Opsional)", url: selectedDocReg.kia_url, req: false }
                   ].map((doc, idx) => (
                     <div key={idx} className="bg-[#080d19] border border-white/5 rounded-2xl flex flex-col overflow-hidden group hover:border-cyan-500/30 transition-all duration-300">
                        <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                           <div>
                             <p className="text-xs font-black text-white uppercase tracking-widest">{doc.title}</p>
                             {doc.req ? <span className="text-[9px] text-red-400 uppercase font-black tracking-widest">Wajib</span> : <span className="text-[9px] text-white/40 uppercase font-black tracking-widest">Opsional</span>}
                           </div>
                           {doc.url ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <AlertCircle className="w-5 h-5 text-red-400/50" />}
                        </div>
                        
                        <div className="flex-1 min-h-[200px] bg-black/40 relative flex items-center justify-center p-4">
                           {doc.url ? (
                             doc.url.toLowerCase().endsWith('.pdf') ? (
                               <div className="text-center">
                                  <FileText className="w-12 h-12 text-blue-400 mx-auto mb-3 opacity-50" />
                                  <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Dokumen PDF</p>
                               </div>
                             ) : (
                               <img src={doc.url} alt={doc.title} className="max-w-full max-h-[200px] object-contain rounded-xl shadow-lg border border-white/10" />
                             )
                           ) : (
                             <div className="text-center text-white/20">
                               <FileText className="w-10 h-10 mx-auto mb-2 opacity-20" />
                               <span className="text-[10px] uppercase font-black tracking-widest">Tidak Ada File</span>
                             </div>
                           )}
                           
                           {/* Hover Actions */}
                           {doc.url && (
                             <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-sm">
                                <button onClick={() => window.open(doc.url, '_blank')} className="w-12 h-12 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center hover:bg-cyan-500 hover:text-black hover:scale-110 transition-all">
                                  <Maximize2 className="w-5 h-5" />
                                </button>
                                <button onClick={() => handleDownloadDoc(doc.url, `${doc.title}.pdf`)} className="w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white hover:text-black hover:scale-110 transition-all">
                                  <Download className="w-5 h-5" />
                                </button>
                             </div>
                           )}
                        </div>
                        
                        {doc.url && (
                        <div className="p-3 bg-white/[0.02] border-t border-white/5 flex items-center justify-between lg:hidden">
                            <button onClick={() => window.open(doc.url, '_blank')} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 text-[10px] font-black uppercase tracking-widest border border-cyan-500/20">
                              <Maximize2 className="w-3 h-3" /> Fullscreen
                            </button>
                            <button onClick={() => handleDownloadDoc(doc.url, `${doc.title}`)} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 text-white text-[10px] font-black uppercase tracking-widest border border-white/10">
                              <Download className="w-3 h-3" /> Download
                            </button>
                        </div>
                        )}
                     </div>
                   ))}
                </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
    </Layout>
  );
}
