'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [formData, setFormData] = useState({
    name: '',
    nickname: '',
    avatar: ''
  });
  const [avatarPreview, setAvatarPreview] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  
  // Cropper states
  const [showCropper, setShowCropper] = useState(false);
  const [cropperImage, setCropperImage] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cropPosition, setCropPosition] = useState({ x: 0, y: 0, scale: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (showCropper && cropperImage && canvasRef.current) {
      drawCropperPreview();
    }
  }, [showCropper, cropperImage, cropPosition]);

  function drawCropperPreview() {
    const canvas = canvasRef.current;
    if (!canvas || !cropperImage) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const img = new Image();
    img.onload = () => {
      // Set canvas size
      const size = 280;
      canvas.width = size;
      canvas.height = size;
      
      // Clear canvas
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, size, size);
      
      // Create circular clipping path
      ctx.beginPath();
      ctx.arc(size/2, size/2, size/2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      
      // Calculate scaled dimensions
      const imgSize = Math.min(img.width, img.height);
      const scale = cropPosition.scale * (size / imgSize);
      const scaledWidth = img.width * scale;
      const scaledHeight = img.height * scale;
      
      // Draw image centered and positioned
      const x = (size - scaledWidth) / 2 + cropPosition.x;
      const y = (size - scaledHeight) / 2 + cropPosition.y;
      
      ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
    };
    img.src = cropperImage;
  }

  async function fetchProfile() {
    try {
      const res = await fetch('/api/user/profile', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setUser(data.user);
          setFormData({
            name: data.user.name || '',
            nickname: data.user.nickname || '',
            avatar: data.user.avatar || ''
          });
          setAvatarPreview(data.user.avatar || '');
        } else {
          router.push('/login');
        }
      } else {
        router.push('/login');
      }
    } catch (err) {
      console.error(err);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    setMessage({ type: '', text: '' });
    
    try {
      const res = await fetch('/api/user/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'update',
          ...formData
        })
      });

      if (res.ok) {
        setMessage({ type: 'success', text: 'Profil zaktualizowany pomyślnie!' });
        fetchProfile();
      } else {
        const data = await res.json();
        setMessage({ type: 'error', text: data.error || 'Błąd podczas aktualizacji profilu.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Błąd połączenia z serwerem.' });
    } finally {
      setIsSaving(false);
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setCropperImage(result);
      setCropPosition({ x: 0, y: 0, scale: 1 });
      setShowCropper(true);
    };
    reader.readAsDataURL(file);
  }

  function handleMouseDown(e: React.MouseEvent) {
    setIsDragging(true);
    setDragStart({ x: e.clientX - cropPosition.x, y: e.clientY - cropPosition.y });
  }

  function handleMouseMove(e: React.MouseEvent) {
    if (!isDragging) return;
    setCropPosition(prev => ({
      ...prev,
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    }));
  }

  function handleMouseUp() {
    setIsDragging(false);
  }

  function handleZoom(delta: number) {
    setCropPosition(prev => ({
      ...prev,
      scale: Math.max(0.5, Math.min(3, prev.scale + delta))
    }));
  }

  async function handleCropSave() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    setIsUploading(true);
    try {
      // Convert canvas to blob
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b!), 'image/jpeg', 0.9);
      });
      
      const formDataUpload = new FormData();
      formDataUpload.append('avatar', blob, 'avatar.jpg');
      
      const res = await fetch('/api/user/avatar', {
        method: 'POST',
        credentials: 'include',
        body: formDataUpload
      });
      
      if (res.ok) {
        const data = await res.json();
        setFormData(prev => ({ ...prev, avatar: data.avatar }));
        setAvatarPreview(data.avatar);
        setMessage({ type: 'success', text: 'Zdjęcie profilowe zaktualizowane!' });
        setShowCropper(false);
        setCropperImage(null);
      } else {
        const data = await res.json();
        setMessage({ type: 'error', text: data.error || 'Błąd podczas przesyłania zdjęcia.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Błąd połączenia z serwerem.' });
    } finally {
      setIsUploading(false);
    }
  }

  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Ładowanie...</div>;

  return (
    <div className="min-h-screen py-32 px-4 bg-gradient-to-br from-slate-950 via-blue-950/20 to-slate-950">
      <div className="container mx-auto max-w-2xl">
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-4xl font-black text-white">Twój Profil</h1>
          <Link href="/dashboard" className="btn btn-outline text-sm">Powrót</Link>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-dark p-10 rounded-2xl border border-slate-700/50"
        >
          {message.text && (
            <div className={`p-4 rounded-xl mb-6 text-sm ${message.type === 'success' ? 'bg-green-500/20 text-green-300 border border-green-500/50' : 'bg-red-500/20 text-red-300 border border-red-500/50'}`}>
              {message.text}
            </div>
          )}

          <div className="flex flex-col items-center mb-10">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 p-1 mb-4 relative group">
              {avatarPreview && avatarPreview.startsWith('/') ? (
                <img 
                  src={avatarPreview} 
                  alt="Avatar" 
                  className="w-full h-full rounded-full object-cover bg-slate-900"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-4xl">
                  {formData.avatar || '👤'}
                </div>
              )}
              <label className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <span className="text-white text-xs font-bold">{isUploading ? '...' : 'Zmień'}</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileSelect} 
                  className="hidden"
                  disabled={isUploading}
                />
              </label>
            </div>
            <p className="text-gray-400 text-sm">{user?.email}</p>
            <div className="mt-2">
              <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded ${user?.isVerified ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'}`}>
                {user?.role === 'mentor' ? (user?.isVerified ? 'Weryfikowany Mentor' : 'Oczekiwanie na weryfikację') : user?.role === 'admin' ? 'Administrator' : 'Uczeń'}
              </span>
            </div>
          </div>

          <form onSubmit={handleUpdate} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest">Imię i Nazwisko</label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full p-4 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white focus:ring-2 focus:ring-cyan-400 outline-none transition-all"
                required
              />
            </div>

            <div>
              <label htmlFor="nickname" className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest">Pseudonim (Nickname)</label>
              <input
                id="nickname"
                type="text"
                value={formData.nickname}
                onChange={e => setFormData({...formData, nickname: e.target.value})}
                className="w-full p-4 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white focus:ring-2 focus:ring-cyan-400 outline-none transition-all"
                placeholder="Twój pseudonim..."
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest">Avatar</label>
              <label className="flex items-center justify-center w-full p-4 bg-slate-900/50 border border-slate-700/50 rounded-xl text-gray-400 cursor-pointer hover:border-cyan-400/50 transition-all">
                <span>📁 Wybierz zdjęcie z komputera</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileSelect} 
                  className="hidden"
                  disabled={isUploading}
                />
              </label>
              <p className="text-gray-500 text-xs mt-1">Kliknij aby wybrać zdjęcie - możesz je przyciąć przed zapisem</p>
            </div>

            <button 
              type="submit" 
              disabled={isSaving}
              className="w-full btn btn-primary py-4 disabled:opacity-50 focus:ring-2 focus:ring-cyan-400"
            >
              {isSaving ? 'Zapisywanie...' : 'Zapisz Zmiany'}
            </button>
          </form>
        </motion.div>
      </div>

      {/* Cropper Modal */}
      {showCropper && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-700 max-w-md w-full mx-4">
            <h3 className="text-xl font-black text-white mb-4 text-center">Przycięcie zdjęcia</h3>
            
            <div className="flex justify-center mb-4">
              <canvas 
                ref={canvasRef}
                className="rounded-full cursor-move border-2 border-cyan-400/30"
                style={{ width: 280, height: 280 }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              />
            </div>
            
            <div className="flex justify-center gap-4 mb-4">
              <button 
                type="button"
                onClick={() => handleZoom(-0.2)}
                className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700"
              >
                ➖ Pomniejsz
              </button>
              <button 
                type="button"
                onClick={() => handleZoom(0.2)}
                className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700"
              >
                ➕ Powiększ
              </button>
            </div>
            
            <p className="text-gray-400 text-xs text-center mb-4">
              Przeciągnij zdjęcie aby wycentrować
            </p>
            
            <div className="flex gap-3">
              <button 
                type="button"
                onClick={() => { setShowCropper(false); setCropperImage(null); }}
                className="flex-1 py-3 bg-slate-800 text-white rounded-xl hover:bg-slate-700"
              >
                Anuluj
              </button>
              <button 
                type="button"
                onClick={handleCropSave}
                disabled={isUploading}
                className="flex-1 py-3 bg-cyan-600 text-white rounded-xl hover:bg-cyan-500 disabled:opacity-50"
              >
                {isUploading ? 'Zapisywanie...' : 'Zapisz'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
