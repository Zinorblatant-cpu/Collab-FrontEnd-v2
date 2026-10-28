import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { registerWithEmail, loginWithEmail } from '../services/api';

const IconSun = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
  </svg>
);
const IconMoon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
  </svg>
);

export default function SignupPage() {
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [confirm, setConfirm]     = useState('');
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (password !== confirm) {
      setError('As senhas não coincidem.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await registerWithEmail(email, password);
      const data = await loginWithEmail(email, password);
      login(data);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Erro ao criar conta.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-zinc-950 transition-colors duration-200">

      {/* ── PAINEL DA MARCA ── */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-zinc-900 to-zinc-950 dark:from-zinc-800 dark:to-zinc-900 flex-col justify-between p-12 relative overflow-hidden border-r border-amber-500/20">
        <div className="absolute inset-0"
          style={{ backgroundImage: 'linear-gradient(135deg, rgba(245,158,11,0.05) 25%, transparent 25%), linear-gradient(225deg, rgba(245,158,11,0.05) 25%, transparent 25%)', backgroundSize: '40px 40px' }}
        />
        <div className="relative">
          <span className="text-3xl font-black text-white tracking-tight">COLL<span className="text-amber-500">AB</span></span>
        </div>
        <div className="relative space-y-4">
          <div className="w-12 h-1 bg-amber-500 rounded-full" />
          <h1 className="text-4xl font-black text-white leading-tight">
            Comece sua<br/>jornada hoje.
          </h1>
          <p className="text-zinc-400 text-base max-w-xs">
            Crie sua conta gratuita e tenha acesso a todos os cursos da plataforma.
          </p>
        </div>
        <div className="relative">
          <div className="bg-zinc-800 dark:bg-zinc-900 rounded-xl p-4 border border-zinc-700">
            <p className="text-xs text-zinc-400 mb-1">Plataforma Collab</p>
            <p className="text-sm text-white font-medium">"O melhor investimento é em conhecimento."</p>
          </div>
        </div>
      </div>

      {/* ── FORMULÁRIO ── */}
      <div className="flex-1 flex flex-col">
        <div className="flex justify-end p-4">
          <button
            onClick={toggleTheme}
            data-testid="theme-toggle"
            className="p-2 rounded-lg text-slate-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
          >
            {theme === 'dark' ? <IconSun /> : <IconMoon />}
          </button>
        </div>

        <div className="flex-1 flex items-center justify-center px-6 pb-10">
          <div className="w-full max-w-sm">

            <div className="mb-8">
              <span className="lg:hidden text-2xl font-black text-slate-900 dark:text-white">COLL<span className="text-amber-500">AB</span></span>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-2">Criar conta</h2>
              <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">Rápido e gratuito.</p>
            </div>

            {error && (
              <div data-testid="error-msg" className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-zinc-300 mb-1.5">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                  className="w-full px-3.5 py-2.5 rounded-lg bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-zinc-300 mb-1.5">Senha</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  required
                  className="w-full px-3.5 py-2.5 rounded-lg bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-zinc-300 mb-1.5">Confirmar Senha</label>
                <input
                  type="password"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  placeholder="Repita a senha"
                  required
                  className="w-full px-3.5 py-2.5 rounded-lg bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 disabled:opacity-60 disabled:cursor-not-allowed text-black font-semibold rounded-lg transition-colors text-sm"
              >
                {loading ? 'Criando conta...' : 'Criar conta'}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500 dark:text-zinc-400">
              Já tem uma conta?{' '}
              <Link to="/login" className="text-amber-600 dark:text-amber-400 font-semibold hover:underline">
                Entrar
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
