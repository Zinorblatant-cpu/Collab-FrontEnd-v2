import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthProvider } from '../contexts/AuthContext';
import { ThemeProvider } from '../contexts/ThemeContext';
import ConfigPage from '../pages/ConfigPage';
import * as api from '../services/api';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

const COURSES = [
  { id: 'c1', title: 'Curso Existente', description: 'Desc', lessons: [{ id: 'l1', title: 'Aula 1', type: 'video', orderIndex: 0 }] },
];
const LESSONS = [
  { id: 'l1', title: 'Aula 1', type: 'video', description: 'desc', youtubeUrl: 'https://youtube.com/watch?v=x' },
];

function Wrapper() {
  localStorage.setItem('collab_token', 'tok');
  localStorage.setItem('collab_user', JSON.stringify({ email: 'admin@test.com', roles: ['admin'] }));
  return (
    <MemoryRouter>
      <ThemeProvider>
        <AuthProvider>
          <ConfigPage />
        </AuthProvider>
      </ThemeProvider>
    </MemoryRouter>
  );
}

describe('ConfigPage', () => {
  beforeEach(() => { localStorage.clear(); vi.clearAllMocks(); mockNavigate.mockClear(); });

  it('renders course list', async () => {
    api.getCourses.mockResolvedValue(COURSES);
    render(<Wrapper />);
    await waitFor(() => expect(screen.getByText('Curso Existente')).toBeTruthy());
  });

  it('shows error when getCourses fails', async () => {
    api.getCourses.mockRejectedValue(new Error('fail'));
    render(<Wrapper />);
    await waitFor(() => expect(screen.getByTestId('error-msg')).toBeTruthy());
  });

  it('creates a new course', async () => {
    api.getCourses.mockResolvedValue([]);
    api.createCourse.mockResolvedValue({ id: 'c2', title: 'Novo Curso X', description: '', lessons: [] });
    render(<Wrapper />);
    await waitFor(() => screen.getByPlaceholderText('Ex: Introdução ao React'));
    await userEvent.type(screen.getByPlaceholderText('Ex: Introdução ao React'), 'Novo Curso X');
    await userEvent.click(screen.getByRole('button', { name: /criar curso/i }));
    await waitFor(() => expect(screen.getByTestId('success-msg')).toBeTruthy());
    expect(screen.getByText('Novo Curso X')).toBeTruthy();
  });

  it('shows error when createCourse fails', async () => {
    api.getCourses.mockResolvedValue([]);
    api.createCourse.mockRejectedValue(new Error('Erro servidor'));
    render(<Wrapper />);
    await waitFor(() => screen.getByPlaceholderText('Ex: Introdução ao React'));
    await userEvent.type(screen.getByPlaceholderText('Ex: Introdução ao React'), 'Curso X');
    await userEvent.click(screen.getByRole('button', { name: /criar curso/i }));
    await waitFor(() => expect(screen.getByTestId('error-msg')).toBeTruthy());
  });

  it('deletes a course after confirm', async () => {
    api.getCourses.mockResolvedValue(COURSES);
    api.deleteCourse.mockResolvedValue({});
    window.confirm = vi.fn().mockReturnValue(true);
    render(<Wrapper />);
    await waitFor(() => screen.getByText('Curso Existente'));
    await userEvent.click(screen.getByTestId('delete-course-c1'));
    await waitFor(() => expect(screen.getByTestId('success-msg')).toBeTruthy());
  });

  it('does not delete course when confirm is cancelled', async () => {
    api.getCourses.mockResolvedValue(COURSES);
    window.confirm = vi.fn().mockReturnValue(false);
    render(<Wrapper />);
    await waitFor(() => screen.getByText('Curso Existente'));
    await userEvent.click(screen.getByTestId('delete-course-c1'));
    expect(api.deleteCourse).not.toHaveBeenCalled();
  });

  it('opens course manager on Gerenciar click', async () => {
    api.getCourses.mockResolvedValue(COURSES);
    api.getLessonsForCourse.mockResolvedValue(LESSONS);
    render(<Wrapper />);
    await waitFor(() => screen.getByText('Curso Existente'));
    await userEvent.click(screen.getByText('Gerenciar'));
    await waitFor(() => expect(screen.getByText('Adicionar Conteúdo')).toBeTruthy());
  });

  it('adds a video lesson', async () => {
    api.getCourses.mockResolvedValue(COURSES);
    api.getLessonsForCourse.mockResolvedValue([]);
    api.addLesson.mockResolvedValue({ id: 'l2', title: 'Nova Aula', type: 'video', description: '', youtubeUrl: 'https://youtube.com/watch?v=y' });
    render(<Wrapper />);
    await waitFor(() => screen.getByText('Gerenciar'));
    await userEvent.click(screen.getByText('Gerenciar'));
    await waitFor(() => screen.getByPlaceholderText('Título *'));
    await userEvent.type(screen.getByPlaceholderText('Título *'), 'Nova Aula');
    await userEvent.type(screen.getByPlaceholderText('URL do YouTube *'), 'https://youtube.com/watch?v=y');
    await userEvent.click(screen.getByRole('button', { name: /adicionar/i }));
    await waitFor(() => expect(screen.getByTestId('success-msg')).toBeTruthy());
  });

  it('switches to text section type', async () => {
    api.getCourses.mockResolvedValue(COURSES);
    api.getLessonsForCourse.mockResolvedValue([]);
    render(<Wrapper />);
    await waitFor(() => screen.getByText('Gerenciar'));
    await userEvent.click(screen.getByText('Gerenciar'));
    await waitFor(() => screen.getByText('Seção de Texto'));
    await userEvent.click(screen.getByText('Seção de Texto'));
    expect(screen.getByPlaceholderText('Conteúdo em Markdown...')).toBeTruthy();
  });

  it('navigates back to course list on back button', async () => {
    api.getCourses.mockResolvedValue(COURSES);
    api.getLessonsForCourse.mockResolvedValue([]);
    render(<Wrapper />);
    await waitFor(() => screen.getByText('Gerenciar'));
    await userEvent.click(screen.getByText('Gerenciar'));
    await waitFor(() => screen.getByTestId('back-btn'));
    await userEvent.click(screen.getByTestId('back-btn'));
    await waitFor(() => expect(screen.getByText('Configurações')).toBeTruthy());
  });

  it('deletes a lesson after confirm', async () => {
    api.getCourses.mockResolvedValue(COURSES);
    api.getLessonsForCourse.mockResolvedValue(LESSONS);
    api.deleteLesson.mockResolvedValue({});
    window.confirm = vi.fn().mockReturnValue(true);
    render(<Wrapper />);
    await waitFor(() => screen.getByText('Gerenciar'));
    await userEvent.click(screen.getByText('Gerenciar'));
    await waitFor(() => screen.getByText('Aula 1'));
    await userEvent.click(screen.getByTestId('delete-lesson-l1'));
    await waitFor(() => expect(screen.getByTestId('success-msg')).toBeTruthy());
  });
});
