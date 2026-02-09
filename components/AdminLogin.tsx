
import React, { useState } from 'react';

interface AdminLoginProps {
  onLoginSuccess: (mode?: 'admin' | 'theme') => void;
  onCancel: () => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess, onCancel }) => {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Admin credentials
    if (user === '30157230' && pass === '27684001') {
      onLoginSuccess('admin');
    } 
    // Theme credentials
    else if (user === '27684001' && pass === '30157230') {
      onLoginSuccess('theme');
    }
    else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-xl z-[100] flex items-center justify-center p-6">
      <div className={`bg-white w-full max-w-md rounded-[3.5rem] p-12 shadow-[0_35px_60px_-15px_rgba(0,0,0,0.5)] transition-all duration-300 border-4 ${error ? 'shake border-red-600' : 'border-slate-200'}`}>
        <div className="text-center mb-10">
          <div className="w-24 h-24 bg-slate-900 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-2xl border-4 border-slate-800">
            <span className="material-icons-round text-white text-5xl">lock_person</span>
          </div>
          <h2 className="text-3xl font-display text-slate-900 uppercase tracking-tight">Acceso Privado</h2>
          <p className="text-slate-600 text-xs font-black uppercase tracking-[0.3em] mt-3">Seguridad del Sistema</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-8">
          <div>
            <label className="block text-xs font-black text-slate-800 uppercase mb-3 ml-2 tracking-widest">Usuario ID</label>
            <input 
              type="text" 
              className="w-full bg-slate-100 border-2 border-slate-200 rounded-2xl px-6 py-4.5 text-base font-bold text-slate-900 focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all outline-none"
              value={user}
              onChange={(e) => setUser(e.target.value)}
              placeholder="ID Usuario"
            />
          </div>
          <div>
            <label className="block text-xs font-black text-slate-800 uppercase mb-3 ml-2 tracking-widest">Contraseña</label>
            <input 
              type="password" 
              className="w-full bg-slate-100 border-2 border-slate-200 rounded-2xl px-6 py-4.5 text-base font-bold text-slate-900 focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all outline-none"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <div className="pt-4 flex flex-col gap-4">
            <button 
              type="submit"
              className="w-full bg-slate-900 text-white font-black py-5 rounded-2xl shadow-2xl hover:bg-primary hover:scale-[1.02] active:scale-[0.98] transition-all uppercase tracking-widest text-sm border-2 border-transparent"
            >
              Entrar al Panel
            </button>
            <button 
              type="button"
              onClick={onCancel}
              className="w-full bg-slate-100 text-slate-900 font-black py-4 rounded-2xl hover:bg-slate-200 transition-all uppercase tracking-widest text-xs border-2 border-slate-300"
            >
              Cerrar
            </button>
          </div>
        </form>
      </div>
      <style>{`
        .shake { animation: shake 0.5s linear; }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-15px); }
          75% { transform: translateX(15px); }
        }
      `}</style>
    </div>
  );
};

export default AdminLogin;
