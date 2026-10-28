import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getCourses } from '../services/api';
import Layout from '../components/Layout';

const IconPlay = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="6 3 20 12 6 21 6 3"/>
  </svg>
);
const IconBook = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20"/>
  </svg>
);

const CARD_COLORS = [
  'from-amber-500 to-orange-500',
  'from-violet-500 to-purple-600',
  'from-emerald-500 to-teal-600',
  'from-sky-500 to-blue-600',
  'from-rose-500 to-pink-600',
  'from-indigo-500 to-blue-500',
];

export default function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  const firstName = user?.email?.split('@')[0] ?? 'Usuário';

  useEffect(() => {
    getCourses()
      .then(setCourses)
      .catch(() => setError('Erro ao carregar cursos.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout>
      <div className="p-6 md:p-10 max-w-5xl mx-auto">

        {/* Saudação */}
        <div className="mb-8">
          <p className="text-xs font-semibold text-amber-500 uppercase tracking-widest mb-1">Bem-vindo de volta</p>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white">
            Olá, <span className="text-amber-500">{firstName}</span>!
          </h1>
          <p className="text-slate-500 dark:text-zinc-400 mt-2 text-sm">
            Continue de onde parou ou explore novos cursos.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
          {[
            { label: 'Cursos disponíveis', value: courses.length, icon: <IconBook /> },
            { label: 'Total de aulas',     value: courses.reduce((s, c) => s + c.lessons.length, 0), icon: <IconPlay /> },
            { label: 'Seu papel',          value: user?.roles?.[0] ?? 'user', icon: null, capitalize: true },
          ].map(item => (
            <div key={item.label}
              className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm"
            >
              <p className="text-xs text-slate-500 dark:text-zinc-400 mb-1">{item.label}</p>
              <p className={`text-2xl font-black text-slate-900 dark:text-white ${item.capitalize ? 'capitalize' : ''}`}>
                {loading ? '—' : item.value}
              </p>
            </div>
          ))}
        </div>

        {/* Título seção */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Cursos disponíveis</h2>
          {courses.length > 0 && (
            <span className="text-xs text-slate-400 dark:text-zinc-500">{courses.length} curso{courses.length !== 1 ? 's' : ''}</span>
          )}
        </div>

        {error && (
          <div data-testid="error-msg" className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden animate-pulse">
                <div className="h-28 bg-slate-200 dark:bg-zinc-800" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-slate-200 dark:bg-zinc-700 rounded w-3/4" />
                  <div className="h-3 bg-slate-100 dark:bg-zinc-800 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-20 text-slate-400 dark:text-zinc-600">
            <IconBook />
            <p className="mt-3 text-sm">Nenhum curso disponível ainda.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map((course, i) => (
              <div
                key={course.id}
                className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md dark:hover:border-zinc-700 transition-all group"
              >
                <div className={`h-28 bg-gradient-to-br ${CARD_COLORS[i % CARD_COLORS.length]} flex items-end p-4`}>
                  <span className="text-white/90 text-xs font-semibold bg-black/20 px-2 py-0.5 rounded-full">
                    {course.lessons.length} {course.lessons.length === 1 ? 'aula' : 'aulas'}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm leading-snug mb-1 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                    {course.title}
                  </h3>
                  {course.description && (
                    <p className="text-xs text-slate-500 dark:text-zinc-400 line-clamp-2 mb-3">{course.description}</p>
                  )}
                  <button
                    onClick={() => navigate('/class')}
                    className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors"
                  >
                    <IconPlay />
                    Acessar curso
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
