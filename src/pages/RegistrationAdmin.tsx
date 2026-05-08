import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Filter, CheckCircle2, XCircle, Trash2, Edit2, Download, QrCode, UserPlus, Clock, CreditCard, ChevronRight, Users } from 'lucide-react';
import { useCMSData } from '../lib/store';
import { cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/ui/Layout';
import { useAuth } from '../App';

export default function RegistrationAdmin() {
  const { data: registrations, updateItem, deleteItem } = useCMSData('registrations', []);
  const { addItems: addPlayer } = useCMSData('players', []);
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterAge, setFilterAge] = useState('All');

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
    if(window.confirm(`Terima pendaftaran ${regFullName} dan masukkan ke daftar pemain?`)) {
      // Move to players
      await addPlayer({
        name: regFullName,
        photo: reg.photoUrl || reg.photourl || '',
        category: reg.ageCategory || reg.agecategory || '',
        position: reg.position_main || reg.position || '',
        position_detail: reg.position_detail || '',
        height: parseInt(reg.height || 0) || 0,
        weight: parseInt(reg.weight || 0) || 0,
        overall: 50, // default
        status: 'Active',
        kk_url: reg.kk_url || '',
        akta_url: reg.akta_url || '',
        kia_url: reg.kia_url || '',
        has_medical_history: reg.has_medical_history || reg.has_medical_history === 'Ya',
        medical_history: reg.medical_history || '',
        allergy_history: reg.allergy_history || '',
        injury_history: reg.injury_history || '',
        medication_notes: reg.medication_notes || '',
        health_notes: reg.health_notes || ''
      });
      // Mark as accepted
      updateItem(reg.id, { status: 'Diterima' });
      alert(`Berhasil! ${regFullName} telah ditambahkan ke database Pemain.`);
    }
  };

  const handleReject = (reg: any) => {
    const regFullName = reg.fullName || reg.fullname || '';
    if(window.confirm(`Tolak pendaftaran ${regFullName}?`)) {
      updateItem(reg.id, { status: 'Ditolak' });
    }
  };

  const handleDelete = (reg: any) => {
    const regFullName = reg.fullName || reg.fullname || '';
    if(window.confirm(`Hapus data pendaftaran ${regFullName} secara permanen?`)) {
      deleteItem(reg.id);
    }
  };

  const handlePaymentStatus = (reg: any, newStatus: string) => {
    updateItem(reg.id, { status: newStatus });
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
      <div className="bg-[#0c162d]/90 backdrop-blur-xl border border-white/5 rounded-3xl shadow-2xl overflow-hidden">
         <div className="overflow-x-auto">
           <table className="w-full text-left border-collapse min-w-[800px]">
             <thead>
               <tr className="border-b border-white/10 bg-[#080d19]/50">
                 <th className="p-5 text-[10px] font-black uppercase tracking-widest text-white/40">Calon Siswa</th>
                 <th className="p-5 text-[10px] font-black uppercase tracking-widest text-white/40">Kontak Wali</th>
                 <th className="p-5 text-[10px] font-black uppercase tracking-widest text-white/40">Program</th>
                 <th className="p-5 text-[10px] font-black uppercase tracking-widest text-white/40">Status Pendaftaran</th>
                 <th className="p-5 text-[10px] font-black uppercase tracking-widest text-white/40 text-right">Aksi</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-white/5">
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

                  return (
                  <tr key={reg.id || i} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="p-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                           <UserPlus className="w-5 h-5 text-white/30" />
                        </div>
                        <div>
                          <p className="font-bold text-sm text-white mb-0.5 tracking-tight">{regFullName}</p>
                          <p className="text-[10px] text-white/50 uppercase tracking-widest font-mono mb-1">{regId} • {regGender}</p>
                          {(reg.previousSSB || reg.previousssb) === 'Ya' && (
                             <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 text-[9px] font-black uppercase tracking-widest border border-blue-500/20">Eks. {reg.previousSSBName || reg.previousssbname}</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-5">
                       <p className="font-bold text-xs text-white uppercase">{regParentName}</p>
                       <p className="text-[10px] text-white/50 font-mono mt-0.5">{regPhone}</p>
                    </td>
                    <td className="p-5">
                       <div className="flex items-center gap-2 mb-1">
                          <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 text-[10px] font-black uppercase tracking-widest border border-blue-500/20">{regAge}</span>
                          <span className="px-2 py-0.5 rounded-md bg-white/5 text-white/60 text-[10px] font-bold uppercase tracking-widest border border-white/10">{regPosition}</span>
                       </div>
                       <p className="text-[10px] text-white/40 truncate max-w-[150px]">{regSchedule}</p>
                    </td>
                    <td className="p-5">
                       {/* Dropdown status for payment */}
                       {(!isAdmin || ['Diterima', 'Ditolak'].includes(regStatus)) ? (
                         <div className={cn(
                           "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[10px] font-black uppercase tracking-widest",
                           regStatus === 'Diterima' ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : 
                           regStatus === 'Ditolak' ? "bg-red-500/10 border-red-500/30 text-red-400" :
                           "bg-slate-500/10 border-slate-500/30 text-slate-400"
                         )}>
                            {regStatus === 'Diterima' ? <CheckCircle2 className="w-3 h-3" /> : regStatus === 'Ditolak' ? <XCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                            {regStatus}
                         </div>
                       ) : (
                         <select 
                           value={regStatus} 
                           onChange={e => handlePaymentStatus(reg, e.target.value)}
                           className={cn(
                             "px-3 py-1.5 rounded-lg border text-[10px] font-black uppercase tracking-widest focus:outline-none appearance-none cursor-pointer",
                             regStatus === 'Belum Bayar' ? "bg-slate-500/10 border-slate-500/30 text-slate-400" :
                             regStatus === 'DP' ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-500" :
                             "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                           )}
                         >
                           <option value="Belum Bayar">Belum Bayar</option>
                           <option value="DP">Cicilan / DP</option>
                           <option value="Lunas">Lunas</option>
                         </select>
                       )}
                    </td>
                    <td className="p-5 text-right flex justify-end gap-2">
                       {isAdmin && !['Diterima', 'Ditolak'].includes(regStatus) && (
                         <>
                           <button onClick={() => handleApprove(reg)} className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-black transition-colors" title="Terima & Masukkan ke Pemain">
                             <CheckCircle2 className="w-4 h-4" />
                           </button>
                           <button onClick={() => handleReject(reg)} className="p-2 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-black transition-colors" title="Tolak">
                             <XCircle className="w-4 h-4" />
                           </button>
                         </>
                       )}
                       {isAdmin && (
                        <button onClick={() => handleDelete(reg)} className="p-2 rounded-xl bg-white/5 text-white/50 hover:bg-red-500 hover:text-white transition-colors" title="Hapus Permanen">
                          <Trash2 className="w-4 h-4" />
                        </button>
                       )}
                    </td>
                  </tr>
                )}) : (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-white/40 font-medium">
                      Belum ada data pendaftar yang sesuai.
                    </td>
                  </tr>
                )}
             </tbody>
           </table>
         </div>
      </div>
    </div>
    </Layout>
  );
}
