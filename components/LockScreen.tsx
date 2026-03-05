import React, { useState } from 'react';
import { KeyRound, Loader2 } from 'lucide-react';

interface LockScreenProps {
  onUnlock: (key: string) => Promise<boolean>;
}

export const LockScreen: React.FC<LockScreenProps> = ({ onUnlock }) => {
  const [key, setKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!key.trim()) {
      setError('请输入卡密');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const success = await onUnlock(key.trim());
      if (!success) {
        setError('卡密无效或已被使用');
      }
    } catch (err: any) {
      setError(err.message || '验证失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-kid-bg flex items-center justify-center p-4 font-sans relative">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl border-2 border-white ring-4 ring-kid-sky/10 z-10">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <KeyRound className="w-8 h-8 text-kid-sky" />
          </div>
          <h1 className="text-2xl font-black text-gray-800 mb-2">输入卡密解锁</h1>
          <p className="text-gray-500 text-sm">请输入您的专属卡密以继续使用</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="text"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="请联系管理员LMXD56领取卡密"
              className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3 text-center text-lg font-bold text-gray-800 focus:outline-none focus:border-kid-sky focus:bg-white transition-all placeholder:text-gray-400 placeholder:font-normal placeholder:text-sm"
              disabled={loading}
            />
            {error && (
              <p className="text-red-500 text-sm mt-2 text-center font-medium">{error}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-kid-sky hover:bg-blue-500 text-white font-bold py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              '立即解锁'
            )}
          </button>
        </form>
      </div>
      
      <div className="absolute bottom-8 left-0 w-full text-center pointer-events-none">
        <p className="text-gray-400 text-sm font-medium tracking-widest">辣妈行动VIP会员专属</p>
      </div>
    </div>
  );
};
