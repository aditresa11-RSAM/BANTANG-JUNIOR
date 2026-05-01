import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, ChevronLeft, Upload, CheckCircle2, User, Phone, MapPin, Calendar, Clock, Trophy } from 'lucide-react';
import { differenceInYears } from 'date-fns';
import { useCMSData } from '../lib/store';

export default function RegistrationPublic() {
  const [step, setStep] = useState(1);
  const totalSteps = 4;
  
  const [formData, setFormData] = useState({
    fullName: '',
    birthPlace: '',
    birthDate: '',
    gender: 'Laki-laki',
    height: '',
    weight: '',
    position: 'Midfielder',
    
    parentName: '',
    phone: '',
    address: '',
    
    ageCategory: '', // will be auto calculated
    schedule: 'Minggu (07.00 - 10.00)',
    location: 'Lapangan Tenjojaya',
    
    photoUrl: '',
    documentUrl: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const { addItems } = useCMSData('registrations', []);

  // Auto calculate age and category
  const handleDateChange = (e: any) => {
    const bdate = e.target.value;
    setFormData(prev => {
      const next = { ...prev, birthDate: bdate };
      if (bdate) {
        const age = differenceInYears(new Date(), new Date(bdate));
        if (age <= 8) next.ageCategory = 'U8';
        else if (age <= 10) next.ageCategory = 'U10';
        else if (age <= 12) next.ageCategory = 'U12';
        else if (age <= 14) next.ageCategory = 'U14';
        else if (age <= 16) next.ageCategory = 'U16';
        else next.ageCategory = 'U17';
      }
      return next;
    });
  };

  const nextStep = () => setStep(p => Math.min(p + 1, totalSteps));
  const prevStep = () => setStep(p => Math.max(p - 1, 1));

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Simulate API call to save registration
      const registrationId = `SSB-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
      const savedData = {
        ...formData,
        registrationId,
        status: 'Belum Bayar',
        registrationDate: new Date().toISOString()
      };
      
      await addItems(savedData);
      
      setIsSubmitting(false);
      setIsSuccess(true);
      
    } catch (err) {
      console.error("Error saving registration", err);
      setIsSubmitting(false);
      alert('Terjadi kesalahan saat mendaftar.');
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#080d19] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#0c162d] p-8 rounded-[2rem] border border-emerald-500/30 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-400 to-emerald-600" />
          <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6 relative">
            <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full animate-pulse" />
            <CheckCircle2 className="w-12 h-12 text-emerald-400 relative z-10" />
          </div>
          <h2 className="text-3xl font-display font-black text-white mb-2 tracking-tight">Pendaftaran Berhasil!</h2>
          <p className="text-white/60 text-sm mb-8 leading-relaxed">
            Terima kasih telah mendaftar di SSB BANTANG JUNIOR. Tim kami akan segera menghubungi Anda melalui WhatsApp untuk proses selanjutnya.
          </p>
          <button 
            onClick={() => window.location.href = '/'}
            className="w-full py-4 bg-[var(--color-primary)] text-black font-black uppercase tracking-[0.2em] rounded-xl hover:bg-yellow-400 transition-all hover:scale-[1.02] active:scale-95 shadow-[0_0_20px_rgba(250,204,21,0.3)] text-xs"
          >
            Kembali ke Beranda
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080d19] text-white flex flex-col font-sans overflow-x-hidden">
      {/* HEADER NAVBAR (Simplfied) */}
      <header className="fixed top-0 inset-x-0 z-50 bg-[#080d19]/80 backdrop-blur-md border-b border-white/5 py-4 px-6 md:px-10 flex items-center justify-between">
         <div className="flex items-center gap-3">
           <div className="w-10 h-10 rounded-xl bg-yellow-400 flex items-center justify-center shadow-lg">
             <Trophy className="text-black w-6 h-6" />
           </div>
           <div className="flex flex-col">
             <span className="font-display font-black text-white text-xs tracking-widest leading-none">BANTANG</span>
             <span className="font-display font-bold text-yellow-400 text-[10px] tracking-[0.2em] leading-tight">JUNIOR</span>
           </div>
         </div>
         <a href="/" className="text-xs font-bold text-white/50 hover:text-white uppercase tracking-widest transition-colors">Batal</a>
      </header>

      {/* HERO SECTION */}
      <div className="relative pt-32 pb-24 px-6 lg:pt-40 lg:pb-32 border-b border-white/10">
        <div className="absolute inset-0 z-0">
          <img src="https://images.unsplash.com/photo-1543351611-58f69d7c1781?q=80&w=2000&auto=format&fit=crop" className="w-full h-full object-cover opacity-10" alt="Training" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#080d19]/30 via-[#080d19] to-[#080d19]" />
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-6 shadow-xl">
            <span className="w-2.5 h-2.5 rounded-full bg-[#fdc700] animate-pulse" />
            <span className="text-xs font-black uppercase tracking-widest text-[#fdc700]">Tahun Ajaran 2026/2027</span>
          </div>
          <h1 className="text-4xl lg:text-6xl font-display font-black uppercase tracking-tight leading-none mb-6">
            Pendaftaran <span className="text-[#fdc700]">Siswa Baru</span><br/>
            SSB BANTANG JUNIOR
          </h1>
          <p className="text-sm md:text-base text-white/60 max-w-2xl mx-auto mb-6 font-medium leading-relaxed">
            "Melahirkan pemain, membentuk karakter, menginspirasi prestasi." Bergabunglah bersama akademi sepakbola modern untuk anak usia <span className="text-white font-bold px-2 py-1 bg-white/10 rounded-md">6 - 17 Tahun</span>
          </p>
        </div>
      </div>

      {/* FORM SECTION */}
      <div className="relative z-20 max-w-3xl mx-auto w-full px-4 -mt-16 pb-24">
        <div className="bg-[#0c162d] border border-white/10 rounded-[2.5rem] p-6 md:p-10 shadow-2xl backdrop-blur-xl">
          
          {/* STEPPER */}
          <div className="flex items-center justify-between mb-12 relative px-2">
             <div className="absolute left-6 right-6 top-1/2 h-0.5 bg-white/5 -z-10 -translate-y-1/2 rounded-full" />
             <div className="absolute left-6 top-1/2 h-0.5 bg-gradient-to-r from-blue-600 to-blue-400 -z-10 -translate-y-1/2 transition-all duration-700 ease-out rounded-full" style={{ width: `calc(${((step-1)/(totalSteps-1))*100}% - 3rem)` }} />
             
             {[1,2,3,4].map(s => (
               <div key={s} className="flex flex-col items-center gap-3">
                 <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm transition-all duration-500 shadow-xl ${step >= s ? 'bg-blue-500 text-white shadow-[0_0_20px_rgba(59,130,246,0.3)] scale-110' : 'bg-[#1a233a] text-white/30 border border-white/5'}`}>
                   {s}
                 </div>
                 <span className={`text-[9px] uppercase tracking-[0.2em] hidden md:block transition-colors duration-500 ${step >= s ? 'text-blue-400 font-bold' : 'text-white/20'}`}>
                   {s === 1 ? 'Data Diri' : s === 2 ? 'Data Wali' : s === 3 ? 'Program' : 'Review'}
                 </span>
               </div>
             ))}
          </div>

          <form onSubmit={step === 4 ? handleSubmit : (e) => { e.preventDefault(); nextStep(); }}>
            <AnimatePresence mode="wait">
              
              {/* STEP 1: DATA PRIBADI */}
              {step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }} transition={{ duration: 0.3 }}>
                  <div className="flex items-center gap-3 mb-8 pb-4 border-b border-white/5">
                    <div className="p-3 bg-blue-500/10 rounded-xl">
                      <User className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <h2 className="text-xl font-display font-black uppercase tracking-tight text-white mb-1">Data Siswa</h2>
                      <p className="text-xs font-bold text-white/40 uppercase tracking-widest">Informasi dasar calon pemain</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Nama Lengkap Siswa</label>
                      <input required value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} type="text" className="w-full bg-[#080d19] border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-blue-500 transition-all shadow-inner" placeholder="Sesuai Akta Kelahiran" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Tempat Lahir</label>
                      <input required value={formData.birthPlace} onChange={e => setFormData({...formData, birthPlace: e.target.value})} type="text" className="w-full bg-[#080d19] border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-blue-500 transition-all shadow-inner" placeholder="Kota" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Tanggal Lahir</label>
                      <input required value={formData.birthDate} onChange={handleDateChange} type="date" className="w-full bg-[#080d19] border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-blue-500 transition-all shadow-inner [color-scheme:dark]" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Jenis Kelamin</label>
                      <select required value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})} className="w-full bg-[#080d19] border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-blue-500 transition-all shadow-inner appearance-none relative">
                        <option value="Laki-laki">Laki-laki</option>
                        <option value="Perempuan">Perempuan</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Tinggi (cm)</label>
                        <input required value={formData.height} onChange={e => setFormData({...formData, height: e.target.value})} type="number" className="w-full bg-[#080d19] border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-blue-500 transition-all shadow-inner text-center font-mono" placeholder="150" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Berat (kg)</label>
                        <input required value={formData.weight} onChange={e => setFormData({...formData, weight: e.target.value})} type="number" className="w-full bg-[#080d19] border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-blue-500 transition-all shadow-inner text-center font-mono" placeholder="45" />
                      </div>
                    </div>
                    <div className="md:col-span-2 mt-2">
                       <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-3">Posisi Utama</label>
                       <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                         {['GK', 'Defender', 'Midfielder', 'Forward'].map(pos => (
                           <button type="button" key={pos} onClick={() => setFormData({...formData, position: pos})}
                             className={`p-4 rounded-2xl border text-xs font-black uppercase tracking-widest transition-all duration-300 ${formData.position === pos ? 'bg-blue-500/10 border-blue-500 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.2)] scale-[1.02]' : 'bg-[#080d19] border-white/5 text-white/40 hover:bg-white/5 hover:text-white/60'}`}
                           >
                              {pos}
                           </button>
                         ))}
                       </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 2: DATA WALI */}
              {step === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }} transition={{ duration: 0.3 }}>
                  <div className="flex items-center gap-3 mb-8 pb-4 border-b border-white/5">
                    <div className="p-3 bg-fuchsia-500/10 rounded-xl">
                      <Phone className="w-5 h-5 text-fuchsia-400" />
                    </div>
                    <div>
                      <h2 className="text-xl font-display font-black uppercase tracking-tight text-white mb-1">Data Wali</h2>
                      <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest">Informasi kontak orang tua/wali</h3>
                    </div>
                  </div>
                  <div className="space-y-5">
                    <div>
                      <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Nama Orang Tua / Wali</label>
                      <input required value={formData.parentName} onChange={e => setFormData({...formData, parentName: e.target.value})} type="text" className="w-full bg-[#080d19] border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-fuchsia-500 transition-all shadow-inner" placeholder="Nama ayah/ibu/wali" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Nomor WhatsApp Aktif</label>
                      <input required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} type="tel" className="w-full bg-[#080d19] border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-fuchsia-500 transition-all font-mono shadow-inner" placeholder="0812xxxxxxxx" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Alamat Lengkap</label>
                      <textarea required value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} rows={4} className="w-full bg-[#080d19] border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-fuchsia-500 transition-all resize-none shadow-inner" placeholder="Alamat domisili saat ini..." />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 3: AKADEMI */}
              {step === 3 && (
                <motion.div key="step3" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }} transition={{ duration: 0.3 }}>
                  <div className="flex items-center gap-3 mb-8 pb-4 border-b border-white/5">
                    <div className="p-3 bg-emerald-500/10 rounded-xl">
                      <Calendar className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <h2 className="text-xl font-display font-black uppercase tracking-tight text-white mb-1">Akademi</h2>
                      <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest">Pemilihan program dan jadwal</h3>
                    </div>
                  </div>
                  <div className="space-y-8">
                    <div>
                       <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-3">Kategori Kelompok Umur (Auto)</label>
                       <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-6 flex items-center justify-between shadow-inner">
                          <div>
                            <span className="block text-[10px] font-bold uppercase tracking-widest text-emerald-400 mb-1">Plotting Siswa</span>
                            <span className="text-xs text-white/50">{formData.birthDate ? `Berdasarkan kelahiran tahun ${formData.birthDate.split('-')[0]}` : 'Masukkan tanggal lahir di step 1 untuk kalkulasi otomatis'}</span>
                          </div>
                          <span className="text-4xl font-display font-black text-white drop-shadow-[0_0_15px_rgba(52,211,153,0.3)]">{formData.ageCategory || '??'}</span>
                       </div>
                    </div>
                    
                    <div>
                       <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-3">Pilih Sesi Latihan</label>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         {['Minggu (07.00 - 10.00)', 'Selasa & Kamis (17.00)'].map(jadwal => (
                            <label key={jadwal} className={`relative flex flex-col p-5 rounded-2xl border cursor-pointer transition-all duration-300 ${formData.schedule === jadwal ? 'bg-emerald-500/10 border-emerald-500 shadow-[0_0_20px_rgba(52,211,153,0.1)]' : 'bg-[#080d19] border-white/10 hover:border-white/30'}`}>
                              <input type="radio" name="schedule" value={jadwal} checked={formData.schedule === jadwal} onChange={e => setFormData({...formData, schedule: e.target.value})} className="sr-only" />
                              <div className="flex justify-between items-start mb-2">
                                <span className={`text-base font-black tracking-tight ${formData.schedule === jadwal ? 'text-emerald-400' : 'text-white'}`}>{jadwal.split('(')[0].trim()}</span>
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${formData.schedule === jadwal ? 'border-emerald-400 bg-emerald-400' : 'border-white/20'}`}>
                                  {formData.schedule === jadwal && <CheckCircle2 className="w-3 h-3 text-black" />}
                                </div>
                              </div>
                              <span className="text-xs font-bold text-white/40 flex items-center gap-1.5 mt-auto pt-2 border-t border-white/5"><Clock className="w-3 h-3"/> {jadwal.split('(')[1]?.replace(')', '') || jadwal}</span>
                            </label>
                         ))}
                       </div>
                    </div>

                    <div>
                       <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-3">Lokasi Latihan</label>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         {['Lapangan Tenjojaya', 'Mini Soccer Zains'].map(loc => (
                            <label key={loc} className={`relative flex flex-col p-5 rounded-2xl border cursor-pointer transition-all duration-300 ${formData.location === loc ? 'bg-emerald-500/10 border-emerald-500 shadow-[0_0_20px_rgba(52,211,153,0.1)]' : 'bg-[#080d19] border-white/10 hover:border-white/30'}`}>
                              <input type="radio" name="location" value={loc} checked={formData.location === loc} onChange={e => setFormData({...formData, location: e.target.value})} className="sr-only" />
                              <div className="flex justify-between items-start mb-2">
                                <span className={`text-base font-black tracking-tight ${formData.location === loc ? 'text-emerald-400' : 'text-white'}`}>{loc}</span>
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${formData.location === loc ? 'border-emerald-400 bg-emerald-400' : 'border-white/20'}`}>
                                  {formData.location === loc && <CheckCircle2 className="w-3 h-3 text-black" />}
                                </div>
                              </div>
                              <span className="text-[10px] uppercase tracking-widest font-bold text-white/40 flex items-center gap-1.5 mt-auto pt-2 border-t border-white/5"><MapPin className="w-3 h-3"/> Standard Stadium</span>
                            </label>
                         ))}
                       </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 4: REVIEW */}
              {step === 4 && (
                <motion.div key="step4" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }} transition={{ duration: 0.3 }}>
                  <div className="flex items-center gap-3 mb-8 pb-4 border-b border-white/5">
                    <div className="p-3 bg-[#fdc700]/10 rounded-xl">
                      <CheckCircle2 className="w-5 h-5 text-[#fdc700]" />
                    </div>
                    <div>
                      <h2 className="text-xl font-display font-black uppercase tracking-tight text-white mb-1">Review Final</h2>
                      <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest">Pastikan data sudah benar sebelum submit</h3>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {/* Review Cards */}
                    <div className="bg-[#080d19] rounded-2xl p-6 border border-white/5 hover:border-white/10 transition-colors">
                      <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/5">
                        <h3 className="text-[10px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-2"><User className="w-3 h-3"/> Data Siswa</h3>
                        <button type="button" onClick={() => setStep(1)} className="text-[10px] uppercase font-bold text-white/30 hover:text-white">Edit</button>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div><p className="text-white/30 text-[9px] uppercase font-bold tracking-wider mb-1">Nama Lengkap</p><p className="font-bold text-sm tracking-tight">{formData.fullName || '-'}</p></div>
                        <div><p className="text-white/30 text-[9px] uppercase font-bold tracking-wider mb-1">Kategori (Posisi)</p><p className="font-bold text-sm tracking-tight">{formData.ageCategory || '-'} • {formData.position}</p></div>
                        <div className="col-span-2"><p className="text-white/30 text-[9px] uppercase font-bold tracking-wider mb-1">Tempat, Tanggal Lahir</p><p className="font-bold text-sm tracking-tight">{formData.birthPlace || '-'}, {formData.birthDate ? new Date(formData.birthDate).toLocaleDateString('id-ID') : '-'}</p></div>
                      </div>
                    </div>
                    
                    <div className="bg-[#080d19] rounded-2xl p-6 border border-white/5 hover:border-white/10 transition-colors">
                      <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/5">
                        <h3 className="text-[10px] font-black text-fuchsia-400 uppercase tracking-widest flex items-center gap-2"><Phone className="w-3 h-3"/> Data Wali</h3>
                        <button type="button" onClick={() => setStep(2)} className="text-[10px] uppercase font-bold text-white/30 hover:text-white">Edit</button>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div><p className="text-white/30 text-[9px] uppercase font-bold tracking-wider mb-1">Nama Wali</p><p className="font-bold text-sm tracking-tight">{formData.parentName || '-'}</p></div>
                        <div><p className="text-white/30 text-[9px] uppercase font-bold tracking-wider mb-1">WhatsApp</p><p className="font-bold text-sm tracking-tight font-mono">{formData.phone || '-'}</p></div>
                      </div>
                    </div>
                    
                    <div className="bg-[#080d19] rounded-2xl p-6 border border-white/5 hover:border-white/10 transition-colors">
                      <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/5">
                         <h3 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2"><Calendar className="w-3 h-3"/> Program Akademi</h3>
                         <button type="button" onClick={() => setStep(3)} className="text-[10px] uppercase font-bold text-white/30 hover:text-white">Edit</button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div><p className="text-white/30 text-[9px] uppercase font-bold tracking-wider mb-1">Jadwal</p><p className="font-bold text-sm tracking-tight">{formData.schedule}</p></div>
                        <div><p className="text-white/30 text-[9px] uppercase font-bold tracking-wider mb-1">Lokasi Latihan</p><p className="font-bold text-sm tracking-tight">{formData.location}</p></div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation Actions */}
            <div className="mt-12 pt-6 border-t border-white/5 flex items-center justify-between gap-4">
              {step > 1 ? (
                <button type="button" onClick={prevStep} className="px-5 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold uppercase tracking-widest text-[10px] transition-colors flex items-center gap-2">
                  <ChevronLeft className="w-4 h-4" /> Batal
                </button>
              ) : <div></div>}
              
              <button 
                type="submit" 
                disabled={isSubmitting}
                className={`flex-1 sm:flex-none px-8 py-3.5 rounded-xl font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-3 transition-all duration-300 transform hover:translate-y-[-2px] active:translate-y-[0px] ${step === 4 ? 'bg-[#fdc700] text-black shadow-[0_10px_20px_rgba(253,199,0,0.3)] hover:shadow-[0_15px_30px_rgba(253,199,0,0.4)] hover:bg-yellow-400' : 'bg-blue-600 text-white shadow-[0_10px_20px_rgba(37,99,235,0.2)] hover:bg-blue-500 hover:shadow-[0_15px_30px_rgba(37,99,235,0.3)]'}`}
              >
                {step === 4 ? (isSubmitting ? 'MEMPROSES...' : 'DAFTAR SEKARANG') : 'LANJUTKAN'} 
                {step !== 4 && <ChevronRight className="w-4 h-4" />}
                {step === 4 && !isSubmitting && <CheckCircle2 className="w-4 h-4" />}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
