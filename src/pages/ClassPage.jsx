import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { getCourses, getLesson } from '../services/api';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

function toEmbedUrl(url) {
  const match = url?.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : null;
}

const IconMenu = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
);
const IconClose = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const IconChevron = ({ open }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);
const IconVideo = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="6 3 20 12 6 21 6 3"/>
  </svg>
);
const IconText = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
  </svg>
);
const IconHome = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
  </svg>
);
const IconLogout = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);
const IconSun = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
  </svg>
);
const IconMoon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
  </svg>
);

const mdComponents = {
  h1: ({ children }) => <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 mt-6 first:mt-0">{children}</h1>,
  h2: ({ children }) => <h2 className="text-xl font-bold text-slate-800 dark:text-zinc-100 mb-3 mt-6 first:mt-0 pb-2 border-b border-slate-200 dark:border-zinc-700">{children}</h2>,
  h3: ({ children }) => <h3 className="text-lg font-semibold text-slate-800 dark:text-zinc-200 mb-2 mt-4">{children}</h3>,
  p:  ({ children }) => <p className="text-slate-700 dark:text-zinc-300 leading-relaxed mb-4 text-base">{children}</p>,
  strong: ({ children }) => <strong className="text-slate-900 dark:text-white font-bold">{children}</strong>,
  em: ({ children }) => <em className="italic text-slate-700 dark:text-zinc-300">{children}</em>,
  ul: ({ children }) => <ul className="list-disc list-outside ml-5 mb-4 space-y-1 text-slate-700 dark:text-zinc-300">{children}</ul>,
  ol: ({ children }) => <ol className="list-decimal list-outside ml-5 mb-4 space-y-1 text-slate-700 dark:text-zinc-300">{children}</ol>,
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  a:  ({ href, children }) => <a href={href} className="text-amber-600 dark:text-amber-400 underline hover:text-amber-700 dark:hover:text-amber-300" target="_blank" rel="noopener noreferrer">{children}</a>,
  blockquote: ({ children }) => <blockquote className="border-l-4 border-amber-500 pl-4 py-1 pr-3 rounded-r bg-amber-50 dark:bg-amber-900/10 text-slate-600 dark:text-zinc-400 italic mb-4">{children}</blockquote>,
  code: ({ inline, children }) => inline
    ? <code className="bg-slate-100 dark:bg-zinc-800 text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded text-sm font-mono">{children}</code>
    : <code className="block bg-slate-900 dark:bg-zinc-950 text-amber-300 p-4 rounded-lg text-sm font-mono overflow-x-auto">{children}</code>,
  pre: ({ children }) => <pre className="bg-slate-900 dark:bg-zinc-950 rounded-xl mb-4 overflow-x-auto">{children}</pre>,
  hr: () => <hr className="border-slate-200 dark:border-zinc-700 my-6" />,
  table: ({ children }) => <div className="overflow-x-auto mb-4"><table className="w-full text-sm text-slate-700 dark:text-zinc-300 border-collapse">{children}</table></div>,
  th: ({ children }) => <th className="border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 px-3 py-2 text-left font-semibold">{children}</th>,
  td: ({ children }) => <td className="border border-slate-200 dark:border-zinc-700 px-3 py-2">{children}</td>,
};

export default function ClassPage() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [courses, setCourses]         = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [expanded, setExpanded]       = useState(null);
  const [selectedLesson, setSelected] = useState(null);
  const [loadingLesson, setLoadingLesson] = useState(false);
  const [panelOpen, setPanelOpen]     = useState(false);
  const [error, setError]             = useState('');

  const isAdmin = user?.roles?.includes('admin');
  const avatarLetter = user?.email?.[0]?.toUpperCase() ?? '?';

  useEffect(() => {
    getCourses()
      .then(data => { setCourses(data); if (data.length > 0) setExpanded(data[0].id); })
      .catch(() => setError('Erro ao carregar cursos.'))
      .finally(() => setLoadingCourses(false));
  }, []);

  async function handleSelectLesson(id) {
    if (selectedLesson?.id === id) return;
    setLoadingLesson(true);
    setPanelOpen(false);
    setError('');
    try {
      const lesson = await getLesson(id);
      setSelected(lesson);
    } catch {
      setError('Erro ao carregar aula.');
    } finally {
      setLoadingLesson(false);
    }
  }

  function handleLogout() { logout(); navigate('/login'); }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Header sidebar */}
      <div className="p-4 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between">
        <span className="font-black text-lg text-slate-900 dark:text-white tracking-tight">
          COLL<span className="text-amber-500">AB</span>
        </span>
        <button onClick={() => setPanelOpen(false)} className="md:hidden p-1 text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200">
          <IconClose />
        </button>
      </div>

      {/* Course tree */}
      <div className="flex-1 overflow-y-auto p-2">
        <p className="text-xs font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider px-2 py-2">Cursos</p>
        {loadingCourses ? (
          <p className="text-sm text-slate-400 dark:text-zinc-500 px-2 py-3">Carregando...</p>
        ) : courses.length === 0 ? (
          <p className="text-sm text-slate-400 dark:text-zinc-500 px-2 py-3">Nenhum curso disponível.</p>
        ) : courses.map(course => (
          <div key={course.id}>
            <button
              onClick={() => setExpanded(expanded === course.id ? null : course.id)}
              className="w-full flex items-center justify-between gap-2 px-2 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <span className="truncate text-left">{course.title}</span>
              <IconChevron open={expanded === course.id} />
            </button>
            {expanded === course.id && (
              <ul className="ml-2 mb-1 border-l-2 border-slate-100 dark:border-zinc-800 pl-2 space-y-0.5">
                {course.lessons.map(lesson => (
                  <li key={lesson.id}>
                    <button
                      onClick={() => handleSelectLesson(lesson.id)}
                      className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg text-xs transition-colors text-left ${
                        selectedLesson?.id === lesson.id
                          ? 'bg-amber-500 text-black font-semibold'
                          : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
                      }`}
                    >
                      <span className="flex-shrink-0 opacity-60">
                        {lesson.type === 'section' ? <IconText /> : <IconVideo />}
                      </span>
                      <span className="truncate">{lesson.title}</span>
                    </button>
                  </li>
                ))}
                {course.lessons.length === 0 && (
                  <li className="px-2 py-1.5 text-xs text-slate-400 dark:text-zinc-600">Sem aulas ainda.</li>
                )}
              </ul>
            )}
          </div>
        ))}
      </div>

      {/* Bottom actions */}
      <div className="p-3 border-t border-slate-200 dark:border-zinc-800 space-y-1">
        <button onClick={toggleTheme}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors">
          {theme === 'dark' ? <IconSun /> : <IconMoon />}
          {theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}
        </button>
        <button onClick={() => navigate('/')}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors">
          <IconHome /> Início
        </button>
        <div className="flex items-center gap-2 px-3 py-2">
          <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center text-black text-xs font-bold flex-shrink-0">{avatarLetter}</div>
          <span className="text-xs text-slate-500 dark:text-zinc-500 truncate flex-1">{user?.email}</span>
          <button onClick={handleLogout} className="text-slate-400 dark:text-zinc-500 hover:text-red-500 flex-shrink-0"><IconLogout /></button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex transition-colors duration-200">

      {/* Backdrop mobile */}
      {panelOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setPanelOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-screen w-72 md:w-64 z-40
        bg-white dark:bg-zinc-900 border-r border-slate-200 dark:border-zinc-800
        transform transition-transform duration-300 ease-in-out
        ${panelOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
      `}>
        <SidebarContent />
      </aside>

      {/* Mobile top bar */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-14 bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between px-4 z-20">
        <button onClick={() => setPanelOpen(true)} className="flex items-center gap-2 text-slate-700 dark:text-zinc-300">
          <IconMenu />
          <span className="text-sm font-medium">Aulas</span>
        </button>
        <span className="font-black text-slate-900 dark:text-white">COLL<span className="text-amber-500">AB</span></span>
        <button onClick={handleLogout} className="text-slate-400 dark:text-zinc-500 hover:text-red-500 p-1"><IconLogout /></button>
      </header>

      {/* Conteúdo */}
      <main className="flex-1 md:ml-64 pt-14 md:pt-0 overflow-y-auto">
        <div className="p-6 md:p-10 max-w-4xl mx-auto">

          {error && (
            <div data-testid="error-msg" className="mb-6 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          {!selectedLesson && !loadingLesson && (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-300 dark:text-zinc-700">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="6 3 20 12 6 21 6 3"/>
              </svg>
              <p className="mt-4 text-base text-slate-400 dark:text-zinc-500">
                {typeof window !== 'undefined' && window.innerWidth < 768
                  ? 'Toque em "Aulas" para navegar'
                  : 'Selecione uma aula para começar'}
              </p>
            </div>
          )}

          {loadingLesson && (
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {selectedLesson && !loadingLesson && (
            <div>
              {/* Breadcrumb */}
              <p className="text-xs text-amber-500 dark:text-amber-400 font-semibold uppercase tracking-widest mb-2">
                {selectedLesson.courseTitle}
              </p>

              {/* Título */}
              <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white leading-tight mb-8">
                {selectedLesson.title}
              </h1>

              {selectedLesson.type === 'video' ? (
                <>
                  <div className="relative w-full rounded-xl overflow-hidden bg-black shadow-lg" style={{ paddingTop: '56.25%' }}>
                    {toEmbedUrl(selectedLesson.youtubeUrl) ? (
                      <iframe
                        className="absolute inset-0 w-full h-full"
                        src={toEmbedUrl(selectedLesson.youtubeUrl)}
                        title={selectedLesson.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-zinc-500 text-sm">
                        URL de vídeo inválida
                      </div>
                    )}
                  </div>
                  {selectedLesson.description && (
                    <div className="mt-6 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm">
                      <p className="text-xs font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-2">Sobre esta aula</p>
                      <p className="text-slate-700 dark:text-zinc-300 text-sm leading-relaxed">{selectedLesson.description}</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-6 md:p-10 shadow-sm">
                  <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
                    {selectedLesson.content || '*Sem conteúdo.*'}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
