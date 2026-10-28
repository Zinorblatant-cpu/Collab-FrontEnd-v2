import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthProvider } from '../contexts/AuthContext';
import { ThemeProvider } from '../contexts/ThemeContext';
import ClassPage from '../pages/ClassPage';
import * as api from '../services/api';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

const COURSES = [
  {
    id: 'c1', title: 'Curso Teste',
    lessons: [
      { id: 'l1', title: 'Aula Vídeo',   type: 'video',   orderIndex: 0 },
      { id: 'l2', title: 'Seção Texto',   type: 'section', orderIndex: 1 },
    ],
  },
];
const VIDEO_LESSON = { id: 'l1', courseTitle: 'Curso Teste', title: 'Aula Vídeo', type: 'video', youtubeUrl: 'https://www.youtube.com/watch?v=abc123', description: 'Desc aula' };
const TEXT_LESSON  = { id: 'l2', courseTitle: 'Curso Teste', title: 'Seção Texto', type: 'section', content: '## Conteúdo\nTexto aqui', description: '' };

function Wrapper() {
  localStorage.setItem('collab_token', 'tok');
  localStorage.setItem('collab_user', JSON.stringify({ email: 'a@b.com', roles: ['user'] }));
  return (
    <MemoryRouter>
      <ThemeProvider>
        <AuthProvider>
          <ClassPage />
        </AuthProvider>
      </ThemeProvider>
    </MemoryRouter>
  );
}

describe('ClassPage', () => {
  beforeEach(() => { localStorage.clear(); vi.clearAllMocks(); mockNavigate.mockClear(); });

  it('renders course list in sidebar', async () => {
    api.getCourses.mockResolvedValue(COURSES);
    render(<Wrapper />);
    await waitFor(() => expect(screen.getByText('Curso Teste')).toBeTruthy());
  });

  it('shows empty state before selecting lesson', async () => {
    api.getCourses.mockResolvedValue(COURSES);
    render(<Wrapper />);
    await waitFor(() => screen.getByText('Curso Teste'));
    expect(screen.getByText(/Selecione uma aula/)).toBeTruthy();
  });

  it('loads and displays video lesson with iframe', async () => {
    api.getCourses.mockResolvedValue(COURSES);
    api.getLesson.mockResolvedValue(VIDEO_LESSON);
    render(<Wrapper />);
    await waitFor(() => screen.getByText('Aula Vídeo'));
    await userEvent.click(screen.getByText('Aula Vídeo'));
    await waitFor(() => expect(screen.getByText('Aula Vídeo', { selector: 'h1' })).toBeTruthy());
    expect(document.querySelector('iframe')).toBeTruthy();
  });

  it('loads and displays text/markdown lesson without iframe', async () => {
    api.getCourses.mockResolvedValue(COURSES);
    api.getLesson.mockResolvedValue(TEXT_LESSON);
    render(<Wrapper />);
    await waitFor(() => screen.getByText('Seção Texto'));
    await userEvent.click(screen.getByText('Seção Texto'));
    await waitFor(() => expect(screen.getByText('Seção Texto', { selector: 'h1' })).toBeTruthy());
    expect(document.querySelector('iframe')).toBeNull();
    expect(screen.getByText('Conteúdo')).toBeTruthy();
  });

  it('shows error when getCourses fails', async () => {
    api.getCourses.mockRejectedValue(new Error('fail'));
    render(<Wrapper />);
    await waitFor(() => expect(screen.getByTestId('error-msg')).toBeTruthy());
  });

  it('shows error when getLesson fails', async () => {
    api.getCourses.mockResolvedValue(COURSES);
    api.getLesson.mockRejectedValue(new Error('fail'));
    render(<Wrapper />);
    await waitFor(() => screen.getByText('Aula Vídeo'));
    await userEvent.click(screen.getByText('Aula Vídeo'));
    await waitFor(() => expect(screen.getByTestId('error-msg')).toBeTruthy());
  });

  it('does not reload same lesson if already selected', async () => {
    api.getCourses.mockResolvedValue(COURSES);
    api.getLesson.mockResolvedValue(VIDEO_LESSON);
    render(<Wrapper />);
    await waitFor(() => screen.getByText('Aula Vídeo'));
    await userEvent.click(screen.getByText('Aula Vídeo'));
    await waitFor(() => screen.getAllByText('Aula Vídeo').length >= 2);
    await userEvent.click(screen.getAllByText('Aula Vídeo')[0]);
    expect(api.getLesson).toHaveBeenCalledTimes(1);
  });

  it('logout navigates to /login', async () => {
    api.getCourses.mockResolvedValue(COURSES);
    render(<Wrapper />);
    await waitFor(() => screen.getByText('Curso Teste'));
    const logoutBtns = document.querySelectorAll('[data-testid="logout-btn"], button[title]');
    const logoutBtn = Array.from(document.querySelectorAll('button')).find(b => b.title === '' && b.querySelector('svg'));
    const allBtns = screen.getAllByRole('button');
    const btn = allBtns.find(b => b.textContent === '');
    await userEvent.click(allBtns[allBtns.length - 1]);
    expect(mockNavigate).toHaveBeenCalled();
  });
});
