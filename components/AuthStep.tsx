
import React, { useState } from 'react';
import { auth } from '../firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

interface AuthStepProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const AuthStep: React.FC<AuthStepProps> = ({ onSuccess, onCancel }) => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      onSuccess();
    } catch (err: any) {
      console.error('Auth error:', err);
      if (err.code === 'auth/operation-not-allowed') {
        setError('El inicio de sesión con Google no está habilitado en la consola de Firebase.');
      } else if (err.code === 'auth/popup-blocked') {
        setError('El navegador bloqueó la ventana emergente. Por favor, permite las ventanas emergentes.');
      } else if (err.code === 'auth/popup-closed-by-user') {
        setError('La ventana de inicio de sesión fue cerrada antes de completar el proceso.');
      } else {
        setError(err.message || 'Error en la autenticación con Google');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="material-icons-round text-3xl text-primary">person</span>
        </div>
        <h2 className="font-display text-3xl text-primary mb-2">
          Bienvenido
        </h2>
        <p className="text-slate-500 text-sm">
          Inicia sesión con tu cuenta de Google para gestionar tus pedidos y ver tu historial.
        </p>
      </div>

      <div className="space-y-4">
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-50 text-slate-700 font-bold py-4 rounded-xl border-2 border-slate-100 transition-all active:scale-95 disabled:opacity-50"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
          {loading ? 'Conectando...' : 'Continuar con Google'}
        </button>

        {error && (
          <div className="p-3 bg-red-50 text-red-600 text-[10px] font-bold rounded-xl border border-red-100 text-center uppercase tracking-wider flex items-center justify-center gap-2">
            <span className="material-icons-round text-sm">error_outline</span>
            {error}
          </div>
        )}
      </div>

      <div className="mt-8 pt-6 border-t border-slate-100 text-center">
        <button
          onClick={onCancel}
          className="text-slate-400 text-[10px] font-black uppercase tracking-widest hover:text-slate-600 transition-colors"
        >
          Volver al Inicio
        </button>
      </div>
    </div>
  );
};

export default AuthStep;
