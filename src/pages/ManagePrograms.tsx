import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Edit2, Trash2, Image as ImageIcon, Save, X, FileText } from 'lucide-react';
import { useCMSData } from '../lib/store';
import { useAuth } from '../App';
import { cn } from '../lib/utils';
import { academyPrograms } from '../data/programs';
import Layout from '../components/ui/Layout';

export default function ManagePrograms() {
  const { user } = useAuth();
  const { data: programs, addItems, updateItem, deleteItem } = useCMSData('programs', academyPrograms);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    ageRange: '',
    description: '',
    image: '',
    type: 'main',
    descriptionDetail: '',
    targets: 'Koordinasi Motorik Dasar, Penguasaan Bola (Ball Mastery), Pemahaman Posisi',
    sessionsPerWeek: '3 Sesi',
    totalPlayers: '45 Aktif',
    coach: 'Tim Coach A',
    kurikulumText: '',
    materiText: '',
    jadwalText: '',
    statistikText: '',
    videoText: '',
    progressText: '',
    absensiText: ''
  });

  const [formTab, setFormTab] = useState('basic');

  const handleAddStart = () => {
    setIsAdding(true);
    setIsEditing(null);
    setFormTab('basic');
    setFormData({
      title: '',
      ageRange: '',
      description: '',
      image: '',
      type: 'main',
      descriptionDetail: '',
      targets: 'Kekuatan, Ketangkasan, Taktik',
      sessionsPerWeek: '3 Sesi',
      totalPlayers: '45 Aktif',
      coach: 'Tim Coach A',
      kurikulumText: '',
      materiText: '',
      jadwalText: '',
      statistikText: '',
      videoText: '',
      progressText: '',
      absensiText: ''
    });
  };

  const handleEditStart = (program: any) => {
    setIsEditing(program.id);
    setIsAdding(false);
    setFormTab('basic');
    setFormData({
      title: program.title || '',
      ageRange: program.ageRange || '',
      description: program.description || '',
      image: program.image || '',
      type: program.type || 'main',
      descriptionDetail: program.descriptionDetail || '',
      targets: program.targets || 'Kekuatan, Ketangkasan, Taktik',
      sessionsPerWeek: program.sessionsPerWeek || '3 Sesi',
      totalPlayers: program.totalPlayers || '45 Aktif',
      coach: program.coach || 'Tim Coach A',
      kurikulumText: program.kurikulumText || '',
      materiText: program.materiText || '',
      jadwalText: program.jadwalText || '',
      statistikText: program.statistikText || '',
      videoText: program.videoText || '',
      progressText: program.progressText || '',
      absensiText: program.absensiText || ''
    });
  };

  const handleCancel = () => {
    setIsAdding(false);
    setIsEditing(null);
  };

  const handleSave = async () => {
    if (!formData.title || !formData.ageRange || !formData.image) {
      alert("Harap lengkapi semua data penting (Judul, Umur, Gambar).");
      return;
    }
    
    if (isAdding) {
      const newProgram = {
        ...formData,
        id: formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.random().toString(36).substr(2, 5)
      };
      await addItems(newProgram);
      setIsAdding(false);
    } else if (isEditing) {
      await updateItem(isEditing, formData);
      setIsEditing(null);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (window.confirm(`Hapus program "${title}"?`)) {
      await deleteItem(id);
    }
  };

  return (
    <Layout>
      <div className="flex flex-col gap-8 pb-16 w-full max-w-7xl mx-auto px-4 md:px-8 mt-4 animate-in fade-in zoom-in duration-1000">
        
        {/* HEADER */}
        <div className="border-b border-white/5 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
               <span className="w-4 h-1 bg-purple-500 rounded-full" />
               <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50">Manajemen Konten</span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-display font-black tracking-tight leading-none uppercase text-white">
              Program <span className="text-purple-400">Unggulan</span>
            </h1>
            <p className="text-sm font-medium text-white/40 mt-3 flex items-center gap-2">
              Kelola program utama dan kelas spesialis akademi
            </p>
          </div>
          {user?.role === 'admin' && (
            <button 
              onClick={handleAddStart}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-3 rounded-xl flex items-center gap-2 transition-all font-bold text-xs shadow-[0_4px_20px_rgba(5,150,105,0.3)] uppercase tracking-widest"
            >
              <Plus className="w-4 h-4" /> Tambah Program
            </button>
          )}
        </div>

        {/* FORM MODAL */}
        <AnimatePresence>
          {(isAdding || isEditing) && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-[#0c162d]/90 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-2xl relative overflow-hidden"
            >
              <button 
                onClick={handleCancel}
                className="absolute top-4 right-4 p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors z-10"
              >
                <X className="w-5 h-5 text-white/50" />
              </button>
              
              <h2 className="text-xl font-display font-black mb-6 uppercase tracking-widest text-[#fdc700]">
                {isAdding ? 'Tambah Program Baru' : 'Edit Program'}
              </h2>

              <div className="flex gap-4 mb-6 border-b border-white/5 pb-2">
                <button type="button" onClick={() => setFormTab('basic')} className={cn("text-[10px] font-bold uppercase tracking-widest pb-2 border-b-2 transition-colors", formTab === 'basic' ? "border-purple-500 text-purple-400" : "border-transparent text-white/40")}>Info Utama</button>
                <button type="button" onClick={() => setFormTab('overview')} className={cn("text-[10px] font-bold uppercase tracking-widest pb-2 border-b-2 transition-colors", formTab === 'overview' ? "border-purple-500 text-purple-400" : "border-transparent text-white/40")}>Overview & Statistik</button>
                <button type="button" onClick={() => setFormTab('contents')} className={cn("text-[10px] font-bold uppercase tracking-widest pb-2 border-b-2 transition-colors", formTab === 'contents' ? "border-purple-500 text-purple-400" : "border-transparent text-white/40")}>Isi Sub-Menu</button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                {formTab === 'basic' && (
                  <>
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest font-bold text-white/40 mb-2">Judul Program</label>
                      <input 
                        type="text" 
                        value={formData.title} 
                        onChange={e => setFormData({...formData, title: e.target.value})} 
                        placeholder="Contoh: Tactical Class"
                        className="w-full bg-[#080d19] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest font-bold text-white/40 mb-2">Target Umur</label>
                      <input 
                        type="text" 
                        value={formData.ageRange} 
                        onChange={e => setFormData({...formData, ageRange: e.target.value})} 
                        placeholder="Contoh: U12-U17"
                        className="w-full bg-[#080d19] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-[10px] uppercase tracking-widest font-bold text-white/40 mb-2">Deskripsi Singkat (Tampil di Landing Page)</label>
                      <textarea 
                        value={formData.description} 
                        onChange={e => setFormData({...formData, description: e.target.value})} 
                        placeholder="Tulis deskripsi program..."
                        className="w-full bg-[#080d19] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors min-h-[80px]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest font-bold text-white/40 mb-2">Tipe Program</label>
                      <select 
                        value={formData.type} 
                        onChange={e => setFormData({...formData, type: e.target.value})} 
                        className="w-full bg-[#080d19] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors appearance-none"
                      >
                        <option value="main">Program Utama (Jalur Pembinaan)</option>
                        <option value="special">Program Spesialis (Advanced)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest font-bold text-white/40 mb-2">URL Gambar Cover</label>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          value={formData.image} 
                          onChange={e => setFormData({...formData, image: e.target.value})} 
                          placeholder="https://..."
                          className="flex-1 bg-[#080d19] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
                        />
                        {formData.image && (
                          <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-white/10">
                            <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {formTab === 'overview' && (
                  <>
                    <div className="md:col-span-2">
                      <label className="block text-[10px] uppercase tracking-widest font-bold text-white/40 mb-2">Deskripsi Detail (Tab Overview)</label>
                      <textarea 
                        value={formData.descriptionDetail} 
                        onChange={e => setFormData({...formData, descriptionDetail: e.target.value})} 
                        placeholder="Tulis penjelasan mendalam..."
                        className="w-full bg-[#080d19] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors min-h-[100px]"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-[10px] uppercase tracking-widest font-bold text-white/40 mb-2">Target Spesifik (Pisahkan dengan koma)</label>
                      <input 
                        type="text" 
                        value={formData.targets} 
                        onChange={e => setFormData({...formData, targets: e.target.value})} 
                        placeholder="Contoh: Ketahanan, Taktik, Kecepatan"
                        className="w-full bg-[#080d19] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest font-bold text-white/40 mb-2">Sesi / Minggu</label>
                      <input 
                        type="text" 
                        value={formData.sessionsPerWeek} 
                        onChange={e => setFormData({...formData, sessionsPerWeek: e.target.value})} 
                        placeholder="Contoh: 3 Sesi"
                        className="w-full bg-[#080d19] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest font-bold text-white/40 mb-2">Total Pemain</label>
                      <input 
                        type="text" 
                        value={formData.totalPlayers} 
                        onChange={e => setFormData({...formData, totalPlayers: e.target.value})} 
                        placeholder="Contoh: 45 Aktif"
                        className="w-full bg-[#080d19] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest font-bold text-white/40 mb-2">Pelatih Utama</label>
                      <input 
                        type="text" 
                        value={formData.coach} 
                        onChange={e => setFormData({...formData, coach: e.target.value})} 
                        placeholder="Contoh: Coach Ahmad"
                        className="w-full bg-[#080d19] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
                      />
                    </div>
                  </>
                )}

                {formTab === 'contents' && (
                  <>
                    <div className="md:col-span-2">
                       <p className="text-white/40 text-xs mb-4">Isi teks berikut untuk menampilkan konten kustom pada setiap sub-menu di halaman detail program. Jika dikosongkan, akan menampilkan status "Sistem Sedang Diintegrasikan".</p>
                    </div>
                    {[
                      { label: 'Konten Kurikulum', field: 'kurikulumText' },
                      { label: 'Konten Materi Latihan', field: 'materiText' },
                      { label: 'Konten Jadwal', field: 'jadwalText' },
                      { label: 'Konten Statistik', field: 'statistikText' },
                      { label: 'Konten Highlight (Video URL)', field: 'videoText' },
                      { label: 'Konten Progress', field: 'progressText' },
                      { label: 'Konten Absensi', field: 'absensiText' }
                    ].map(item => (
                      <div key={item.field} className="md:col-span-2">
                        <label className="block text-[10px] uppercase tracking-widest font-bold text-white/40 mb-2">{item.label}</label>
                        <textarea 
                          value={(formData as any)[item.field]} 
                          onChange={e => setFormData({...formData, [item.field]: e.target.value})} 
                          placeholder={`Tulis ${item.label}...`}
                          className="w-full bg-[#080d19] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors min-h-[60px]"
                        />
                      </div>
                    ))}
                  </>
                )}
              </div>
              
              <div className="mt-8 flex items-center justify-end gap-3">
                <button 
                  onClick={handleCancel}
                  className="px-6 py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-widest transition-colors"
                >
                  Batal
                </button>
                <button 
                  onClick={handleSave}
                  className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition-all font-bold text-xs shadow-[0_4px_20px_rgba(147,51,234,0.3)] uppercase tracking-widest"
                >
                  <Save className="w-4 h-4" /> Simpan Program
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* LIST DAFTAR PROGRAM */}
        <div className="space-y-12">
          {/* Main Programs */}
          <div>
            <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
              <span className="w-2 h-6 bg-[var(--color-primary)] rounded-full"></span>
              Jalur Pembinaan Utama
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {programs.filter((p: any) => p.type === 'main').map((program: any) => (
                <ProgramCard key={program.id} program={program} onEdit={handleEditStart} onDelete={handleDelete} />
              ))}
            </div>
          </div>

          {/* Special Programs */}
          <div>
            <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
              <span className="w-2 h-6 bg-purple-500 rounded-full"></span>
              Program Spesialis & Advanced
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {programs.filter((p: any) => p.type === 'special').map((program: any) => (
                <ProgramCard key={program.id} program={program} onEdit={handleEditStart} onDelete={handleDelete} />
              ))}
            </div>
          </div>
        </div>

      </div>
    </Layout>
  );
}

function ProgramCard({ program, onEdit, onDelete }: { key?: any, program: any, onEdit: (p: any) => void, onDelete: (id: string, title: string) => void | Promise<void> }) {
  const { user } = useAuth();
  return (
    <div className="bg-[#0c162d]/80 backdrop-blur-xl border border-white/5 group overflow-hidden rounded-3xl relative">
      {user?.role === 'admin' && (
        <div className="absolute top-2 right-2 z-20 flex flex-col gap-2">
          <button 
            onClick={() => onEdit(program)}
            className="w-8 h-8 rounded-full bg-blue-500/20 backdrop-blur-md border border-blue-500/50 flex items-center justify-center text-blue-400 hover:bg-blue-500 hover:text-white transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button 
            onClick={() => onDelete(program.id, program.title)}
            className="w-8 h-8 rounded-full bg-red-500/20 backdrop-blur-md border border-red-500/50 flex items-center justify-center text-red-400 hover:bg-red-500 hover:text-white transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <div className="h-40 overflow-hidden relative">
        {program.image ? (
          <img src={program.image} alt={program.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
        ) : (
          <div className="w-full h-full bg-white/5 flex items-center justify-center">
            <ImageIcon className="w-8 h-8 text-white/20" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0c162d] via-black/20 to-transparent" />
        <span className={cn(
          "absolute top-4 left-4 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg",
          program.type === 'main' ? "bg-[var(--color-primary)] text-black" : "bg-purple-500 text-white"
        )}>
          {program.ageRange}
        </span>
      </div>
      <div className="p-5">
        <h3 className="text-lg font-display font-bold mb-2 text-white">{program.title}</h3>
        <p className="text-xs text-white/50 leading-relaxed line-clamp-2">{program.description}</p>
      </div>
    </div>
  );
}
