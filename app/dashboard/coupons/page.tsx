'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

interface Coupon {
  id: string;
  code: string;
  discountType: string;
  discountValue: number;
  maxUses: number | null;
  usedCount: number;
  expiresAt: string | null;
  isActive: boolean;
  createdAt: string;
}

export default function UserCouponsPage() {
  const router = useRouter();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'percent' as 'percent' | 'fixed',
    discountValue: 10,
    maxUses: 0,
    expiresAt: '',
    isActive: true
  });

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const res = await fetch('/api/auth/me', { credentials: 'include' });
      if (!res.ok) {
        router.push('/login');
        return;
      }
      const data = await res.json();
      if (!data.user) {
        router.push('/login');
        return;
      }
      fetchCoupons();
    } catch {
      router.push('/login');
    }
  }

  async function fetchCoupons() {
    try {
      const res = await fetch('/api/user/coupons', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setCoupons(data.coupons || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch('/api/user/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setShowForm(false);
        setFormData({
          code: '',
          discountType: 'percent',
          discountValue: 5,
          maxUses: 0,
          expiresAt: '',
          isActive: true
        });
        fetchCoupons();
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Czy na pewno chcesz usunąć ten kupon?')) return;
    try {
      const res = await fetch(`/api/user/coupons?id=${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (res.ok) fetchCoupons();
    } catch (err) {
      console.error(err);
    }
  }

  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Ładowanie...</div>;

  return (
    <div className="min-h-screen py-32 px-4 bg-slate-950 text-white">
      <div className="container mx-auto max-w-4xl">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-black tracking-tighter">Moje Kody Rabatowe</h1>
            <p className="text-gray-400 mt-2 font-medium">Twój program partnerski - zarabiaj na poleceniach</p>
          </div>
          <button 
            onClick={() => setShowForm(!showForm)}
            className="px-6 py-3 bg-blue-600 rounded-xl font-black text-sm hover:bg-blue-500 transition-all"
          >
            {showForm ? 'Anuluj' : '+ Nowy Kupon'}
          </button>
        </div>

        <AnimatePresence>
          {showForm && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="glass-dark p-8 rounded-2xl border border-blue-500/20 mb-10"
            >
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-black text-gray-500 mb-2 uppercase tracking-widest">Kod kuponu</label>
                    <input
                      type="text"
                      value={formData.code}
                      onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})}
                      className="w-full p-4 bg-slate-950/50 border border-slate-800 rounded-xl focus:border-blue-500 outline-none font-black text-lg"
                      placeholder=" np. SUMMER2024"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-gray-500 mb-2 uppercase tracking-widest">Rodzaj zniżki</label>
                    <select
                      value={formData.discountType}
                      onChange={e => setFormData({...formData, discountType: e.target.value as 'percent' | 'fixed'})}
                      className="w-full p-4 bg-slate-950/50 border border-slate-800 rounded-xl focus:border-blue-500 outline-none"
                    >
                      <option value="percent">Procent (%)</option>
                      <option value="fixed">Stała kwota (PLN)</option>
                    </select>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-xs font-black text-gray-500 mb-2 uppercase tracking-widest">Wartość</label>
                    <input
                      type="number"
                      value={formData.discountValue}
                      onChange={e => setFormData({...formData, discountValue: parseFloat(e.target.value)})}
                      className="w-full p-4 bg-slate-950/50 border border-slate-800 rounded-xl focus:border-blue-500 outline-none"
                      min="1"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-gray-500 mb-2 uppercase tracking-widest">Max. użyć (0 = bez limitu)</label>
                    <input
                      type="number"
                      value={formData.maxUses}
                      onChange={e => setFormData({...formData, maxUses: parseInt(e.target.value)})}
                      className="w-full p-4 bg-slate-950/50 border border-slate-800 rounded-xl focus:border-blue-500 outline-none"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-gray-500 mb-2 uppercase tracking-widest">Data ważności</label>
                    <input
                      type="date"
                      value={formData.expiresAt}
                      onChange={e => setFormData({...formData, expiresAt: e.target.value})}
                      className="w-full p-4 bg-slate-950/50 border border-slate-800 rounded-xl focus:border-blue-500 outline-none"
                    />
                  </div>
                </div>

                <button type="submit" className="w-full py-4 bg-blue-600 text-white rounded-xl font-black hover:bg-blue-500 transition-all">
                  Utwórz Kupon
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-4">
          {coupons.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              <p className="text-xl font-bold">Nie masz jeszcze żadnych kuponów</p>
              <p className="mt-2">Utwórz swój pierwszy kupon i zacznij zarabiać!</p>
            </div>
          ) : (
            coupons.map(coupon => (
              <motion.div 
                key={coupon.id}
                className="glass-dark p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className="text-3xl font-black text-blue-400">{coupon.code}</div>
                  <div className="text-gray-400">
                    <span className="font-bold text-white">{coupon.discountType === 'percent' ? `${coupon.discountValue}%` : `${coupon.discountValue} PLN`}</span>
                    {' '}znizki
                  </div>
                </div>
                <div className="flex items-center gap-6 text-sm text-gray-500">
                  <span>Użyto: {coupon.usedCount}{coupon.maxUses ? `/${coupon.maxUses}` : ''}</span>
                  <span>{coupon.expiresAt ? `Do: ${new Date(coupon.expiresAt).toLocaleDateString('pl-PL')}` : 'Bez terminu'}</span>
                  <span className={coupon.isActive ? 'text-green-400' : 'text-red-400'}>
                    {coupon.isActive ? 'AKTYWNY' : 'NIEAKTYWNY'}
                  </span>
                  <button 
                    onClick={() => handleDelete(coupon.id)}
                    className="text-red-400 hover:text-red-300 font-bold"
                  >
                    USUŃ
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>

        <div className="mt-12 p-6 bg-blue-900/20 rounded-2xl border border-blue-500/20">
          <h3 className="text-xl font-black text-blue-400 mb-4">📊 Jak to działa?</h3>
          <ul className="space-y-2 text-gray-300">
            <li>• Stwórz swój unikalny kod rabatowy (10% zniżki)</li>
            <li>• Podziel się nim ze znajomymi</li>
            <li>• Gdy ktoś kupi kurs z Twoim kodem:</li>
            <li className="ml-4">- Ty dostajesz <span className="text-green-400 font-bold">20%</span> prowizji</li>
            <li className="ml-4">- Mentor dostaje <span className="text-yellow-400 font-bold">75%</span></li>
            <li className="ml-4">- Platforma bierze <span className="text-gray-500 font-bold">5%</span></li>
          </ul>
        </div>
      </div>
    </div>
  );
}