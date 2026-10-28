import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

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

const FEATURES = [
  { title: 'Vídeo-aulas',        desc: 'Assista aulas no YouTube integrado à plataforma, sem distrações.' },
  { title: 'Seções de Texto',    desc: 'Conteúdo em Markdown com formatação rica, código e links.' },
  { title: 'Acesso Protegido',   desc: 'Conteúdo exclusivo para alunos cadastrados com autenticação segura.' },
  { title: 'Modo Claro/Escuro',  desc: 'Estude no conforto visual que preferir, qualquer hora do dia.' },
  { title: 'Multi-dispositivo',  desc: 'Interface responsiva que funciona em celular, tablet e desktop.' },
  { title: 'Gestão de Cursos',   desc: 'Administradores criam e organizam cursos e aulas facilmente.' },
];

export default function SalePage() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 transition-colors duration-200">

      {/* Navbar */}
      <nav className="sticky top-0 z-40 bg-white/80 dark:bg-zinc-900/80 backdrop-blur border-b border-slate-200 dark:border-zinc-800">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <span className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
            COLL<span className="text-amber-500">AB</span>
          </span>
          <div className="flex items-center gap-3">
            <button onClick={toggleTheme} data-testid="theme-toggle"
              className="p-2 rounded-lg text-slate-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors">
              {theme === 'dark' ? <IconSun /> : <IconMoon />}
            </button>
            <Link to="/login"
              className="text-sm font-medium text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors">
              Entrar
            </Link>
            <Link to="/signup"
              className="text-sm font-semibold bg-amber-500 hover:bg-amber-400 text-black px-4 py-1.5 rounded-lg transition-colors">
              Começar grátis
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-24 pb-20 text-center">
        <div className="inline-block bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-semibold px-3 py-1 rounded-full mb-6">
          Plataforma de ensino online
        </div>
        <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white leading-tight mb-6">
          Aprenda.<br />
          <span className="text-amber-500">Evolua.</span><br />
          Conecte.
        </h1>
        <p className="text-lg text-slate-500 dark:text-zinc-400 max-w-xl mx-auto mb-10">
          Acesse cursos em vídeo e material de texto, tudo em uma única plataforma moderna e fácil de usar.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/signup"
            className="w-full sm:w-auto px-8 py-3.5 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl text-base transition-colors shadow-lg shadow-amber-500/25">
            Criar conta grátis
          </Link>
          <Link to="/login"
            className="w-full sm:w-auto px-8 py-3.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 font-semibold rounded-xl text-base hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors">
            Já tenho conta
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <div className="max-w-4xl mx-auto px-6 py-12 grid grid-cols-3 gap-8 text-center">
          {[['500+', 'Alunos'], ['20+', 'Cursos'], ['100%', 'Online']].map(([n, l]) => (
            <div key={l}>
              <p className="text-4xl font-black text-amber-500">{n}</p>
              <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">{l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-3">
            Tudo que você precisa
          </h2>
          <p className="text-slate-500 dark:text-zinc-400 max-w-md mx-auto text-sm">
            Uma plataforma completa para professores e alunos.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map(f => (
            <div key={f.title}
              className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-5 hover:border-amber-500/50 dark:hover:border-amber-500/30 transition-colors shadow-sm">
              <div className="w-8 h-1 bg-amber-500 rounded-full mb-3" />
              <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-1">{f.title}</h3>
              <p className="text-slate-500 dark:text-zinc-400 text-xs leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-6 pb-24">
        <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-10 text-center shadow-xl shadow-amber-500/20">
          <h2 className="text-3xl font-black text-black mb-3">Comece hoje mesmo</h2>
          <p className="text-black/70 mb-6 text-sm">Cadastre-se e tenha acesso imediato a todos os cursos.</p>
          <Link to="/signup"
            className="inline-block px-8 py-3.5 bg-black text-white font-bold rounded-xl hover:bg-zinc-800 transition-colors">
            Criar conta grátis
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-zinc-800 py-6 text-center">
        <span className="text-xs text-slate-400 dark:text-zinc-600">
          © {new Date().getFullYear()} COLL<span className="text-amber-500">AB</span> — Todos os direitos reservados
        </span>
      </footer>
    </div>
  );
}
