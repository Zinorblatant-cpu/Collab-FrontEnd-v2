import { useState, useEffect } from 'react';
import { getCourses, createCourse, deleteCourse, getLessonsForCourse, addLesson, deleteLesson } from '../services/api';
import Layout from '../components/Layout';

const IconTrash = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
  </svg>
);
const IconBack = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
);
const IconPlus = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
const IconVideo = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="6 3 20 12 6 21 6 3"/>
  </svg>
);
const IconText = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
  </svg>
);

const inputClass = "w-full px-3.5 py-2.5 rounded-lg bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors text-sm";
const cardClass  = "bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-sm";

export default function ConfigPage() {
  const [courses, setCourses]       = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [activeCourse, setActiveCourse] = useState(null);
  const [lessons, setLessons]       = useState([]);
  const [loadingLessons, setLoadingLessons] = useState(false);
  const [error, setError]           = useState('');
  const [success, setSuccess]       = useState('');

  const [courseTitle, setCourseTitle] = useState('');
  const [courseDesc, setCourseDesc]   = useState('');
  const [creating, setCreating]       = useState(false);

  const [lessonType, setLessonType]     = useState('video');
  const [lessonTitle, setLessonTitle]   = useState('');
  const [lessonDesc, setLessonDesc]     = useState('');
  const [lessonUrl, setLessonUrl]       = useState('');
  const [lessonContent, setLessonContent] = useState('');
  const [addingLesson, setAddingLesson] = useState(false);

  function flash(type, msg) {
    if (type === 'success') { setSuccess(msg); setError(''); }
    else { setError(msg); setSuccess(''); }
    setTimeout(() => { setSuccess(''); setError(''); }, 4000);
  }

  useEffect(() => {
    getCourses()
      .then(data => { setCourses(data); })
      .catch(() => flash('error', 'Erro ao carregar cursos.'))
      .finally(() => setLoadingCourses(false));
  }, []);

  async function openCourse(course) {
    setActiveCourse(course);
    setLoadingLessons(true);
    setError(''); setSuccess('');
    try {
      setLessons(await getLessonsForCourse(course.id));
    } catch {
      flash('error', 'Erro ao carregar aulas.');
    } finally {
      setLoadingLessons(false);
    }
  }

  function closeCourse() {
    setActiveCourse(null); setLessons([]);
    setLessonType('video'); setLessonTitle(''); setLessonDesc(''); setLessonUrl(''); setLessonContent('');
    setError(''); setSuccess('');
  }

  async function handleCreateCourse(e) {
    e.preventDefault();
    setCreating(true); setError(''); setSuccess('');
    try {
      const c = await createCourse(courseTitle.trim(), courseDesc.trim() || undefined);
      setCourses(prev => [...prev, { ...c, lessons: [] }]);
      setCourseTitle(''); setCourseDesc('');
      flash('success', `Curso "${c.title}" criado.`);
    } catch (err) {
      flash('error', err.message || 'Erro ao criar curso.');
    } finally {
      setCreating(false);
    }
  }

  async function handleDeleteCourse(course) {
    if (!window.confirm(`Deletar "${course.title}" e todas as suas aulas?`)) return;
    try {
      await deleteCourse(course.id);
      setCourses(prev => prev.filter(c => c.id !== course.id));
      flash('success', `"${course.title}" deletado.`);
    } catch (err) {
      flash('error', err.message || 'Erro ao deletar.');
    }
  }

  async function handleAddLesson(e) {
    e.preventDefault();
    setAddingLesson(true); setError(''); setSuccess('');
    try {
      const lesson = await addLesson(activeCourse.id, {
        title:       lessonTitle.trim(),
        description: lessonDesc.trim() || undefined,
        type:        lessonType,
        youtubeUrl:  lessonType === 'video'   ? lessonUrl.trim() : undefined,
        content:     lessonType === 'section' ? lessonContent.trim() || undefined : undefined,
        orderIndex:  lessons.length,
      });
      setLessons(prev => [...prev, lesson]);
      setLessonTitle(''); setLessonDesc(''); setLessonUrl(''); setLessonContent('');
      flash('success', `"${lesson.title}" adicionado.`);
    } catch (err) {
      flash('error', err.message || 'Erro ao adicionar aula.');
    } finally {
      setAddingLesson(false);
    }
  }

  async function handleDeleteLesson(lesson) {
    if (!window.confirm(`Remover "${lesson.title}"?`)) return;
    try {
      await deleteLesson(lesson.id);
      setLessons(prev => prev.filter(l => l.id !== lesson.id));
      flash('success', `"${lesson.title}" removido.`);
    } catch (err) {
      flash('error', err.message || 'Erro ao remover.');
    }
  }

  return (
    <Layout>
      <div className="p-6 md:p-10 max-w-3xl mx-auto">

        {/* Feedback */}
        {error   && <div data-testid="error-msg"   className="mb-5 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">{error}</div>}
        {success && <div data-testid="success-msg" className="mb-5 p-3 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 text-sm">{success}</div>}

        {activeCourse ? (
          /* ── GERENCIAR AULAS ── */
          <>
            <div className="flex items-center gap-3 mb-8">
              <button onClick={closeCourse} data-testid="back-btn" className="p-2 rounded-lg text-slate-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors">
                <IconBack />
              </button>
              <div>
                <p className="text-xs text-slate-400 dark:text-zinc-500">Configurações / Cursos</p>
                <h1 className="text-2xl font-black text-slate-900 dark:text-white">{activeCourse.title}</h1>
              </div>
            </div>

            {/* Formulário de nova aula */}
            <section className={`${cardClass} p-5 mb-8`}>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Adicionar Conteúdo</h2>

              {/* Toggle tipo */}
              <div className="flex gap-2 mb-4">
                {['video', 'section'].map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setLessonType(t)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-colors ${
                      lessonType === t
                        ? 'bg-amber-500 text-black'
                        : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-700'
                    }`}
                  >
                    {t === 'video' ? <><IconVideo /> Vídeo</> : <><IconText /> Seção de Texto</>}
                  </button>
                ))}
              </div>

              <form onSubmit={handleAddLesson} className="space-y-3">
                <input type="text" value={lessonTitle} onChange={e => setLessonTitle(e.target.value)} placeholder="Título *" required className={inputClass} />
                <input type="text" value={lessonDesc}  onChange={e => setLessonDesc(e.target.value)}  placeholder="Descrição (opcional)" className={inputClass} />
                {lessonType === 'video' && (
                  <input type="url" value={lessonUrl} onChange={e => setLessonUrl(e.target.value)} placeholder="URL do YouTube *" required className={inputClass} />
                )}
                {lessonType === 'section' && (
                  <textarea value={lessonContent} onChange={e => setLessonContent(e.target.value)} placeholder="Conteúdo em Markdown..." rows={6}
                    className={`${inputClass} resize-none`} />
                )}
                <button type="submit" disabled={addingLesson || !lessonTitle.trim()}
                  className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-semibold rounded-lg transition-colors text-sm">
                  <IconPlus />
                  {addingLesson ? 'Adicionando...' : 'Adicionar'}
                </button>
              </form>
            </section>

            {/* Lista de aulas */}
            <section>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
                Conteúdo{' '}<span className="text-slate-400 dark:text-zinc-500 font-normal">({lessons.length} {lessons.length === 1 ? 'item' : 'itens'})</span>
              </h2>
              {loadingLessons ? (
                <p className="text-sm text-slate-400 dark:text-zinc-500">Carregando...</p>
              ) : lessons.length === 0 ? (
                <p className="text-sm text-slate-400 dark:text-zinc-500">Nenhum conteúdo ainda.</p>
              ) : (
                <ul className="space-y-2">
                  {lessons.map((lesson, i) => (
                    <li key={lesson.id} className={`${cardClass} p-4 flex items-start justify-between gap-4`}>
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-xs text-slate-400 dark:text-zinc-500 w-5 text-right flex-shrink-0">{i + 1}</span>
                        <span className={`flex-shrink-0 ${lesson.type === 'video' ? 'text-amber-500' : 'text-violet-500'}`}>
                          {lesson.type === 'video' ? <IconVideo /> : <IconText />}
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{lesson.title}</p>
                          {lesson.description && <p className="text-xs text-slate-400 dark:text-zinc-500 truncate">{lesson.description}</p>}
                        </div>
                      </div>
                      <button onClick={() => handleDeleteLesson(lesson)}
                        data-testid={`delete-lesson-${lesson.id}`}
                        className="flex-shrink-0 p-2 rounded-lg bg-slate-100 dark:bg-zinc-800 hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-500 transition-colors">
                        <IconTrash />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        ) : (
          /* ── LISTA DE CURSOS ── */
          <>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-8">Configurações</h1>

            <section className={`${cardClass} p-5 mb-8`}>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Novo Curso</h2>
              <form onSubmit={handleCreateCourse} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-zinc-400 mb-1">Título *</label>
                  <input type="text" value={courseTitle} onChange={e => setCourseTitle(e.target.value)} placeholder="Ex: Introdução ao React" required className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-zinc-400 mb-1">Descrição <span className="text-slate-400">(opcional)</span></label>
                  <textarea value={courseDesc} onChange={e => setCourseDesc(e.target.value)} placeholder="Descreva o conteúdo..." rows={3}
                    className={`${inputClass} resize-none`} />
                </div>
                <button type="submit" disabled={creating || !courseTitle.trim()}
                  className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-semibold rounded-lg transition-colors text-sm">
                  <IconPlus />
                  {creating ? 'Criando...' : 'Criar Curso'}
                </button>
              </form>
            </section>

            <section>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
                Cursos <span className="text-slate-400 dark:text-zinc-500 font-normal">({courses.length})</span>
              </h2>
              {loadingCourses ? (
                <p className="text-sm text-slate-400 dark:text-zinc-500">Carregando...</p>
              ) : courses.length === 0 ? (
                <p className="text-sm text-slate-400 dark:text-zinc-500">Nenhum curso cadastrado.</p>
              ) : (
                <ul className="space-y-3">
                  {courses.map(course => (
                    <li key={course.id} className={`${cardClass} p-4 flex items-start justify-between gap-4`}>
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900 dark:text-white truncate">{course.title}</p>
                        {course.description && <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5 line-clamp-2">{course.description}</p>}
                        <p className="text-xs text-slate-400 dark:text-zinc-500 mt-1">{course.lessons.length} {course.lessons.length === 1 ? 'aula' : 'aulas'}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button onClick={() => openCourse(course)}
                          className="px-3 py-1.5 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 text-xs font-medium rounded-lg transition-colors">
                          Gerenciar
                        </button>
                        <button onClick={() => handleDeleteCourse(course)}
                          data-testid={`delete-course-${course.id}`}
                          className="p-1.5 rounded-lg bg-slate-100 dark:bg-zinc-800 hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-500 transition-colors">
                          <IconTrash />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        )}
      </div>
    </Layout>
  );
}
