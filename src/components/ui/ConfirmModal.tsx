import React from 'react';
import { Modal } from './Modal';
import { AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  message: string;
}

export function ConfirmModal({ isOpen, onClose, onConfirm, message }: ConfirmModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Konfirmasi">
      <div className="text-center py-2">
        <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
        <p className="text-white/80 mb-6">{message}</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-colors">Batal</button>
          <button onClick={() => { onConfirm(); onClose(); }} className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-red-500/25">Hapus</button>
        </div>
      </div>
    </Modal>
  );
}
