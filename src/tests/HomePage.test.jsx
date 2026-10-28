import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthProvider } from '../contexts/AuthContext';
import { ThemeProvider } from '../contexts/ThemeContext';
import HomePage from '../pages/HomePage';
import * as api from '../services/api';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

const COURSES = [
  { id: 'c1', title: 'Curso A', description: 'Desc A', lessons: [{ id: 'l1', title: 'L1', orderIndex: 0 }] },
  { id: 'c2', title: 'Curso B', description: '',        lessons: [] },
];

function Wrapper() {
  localStorage.setItem('collab_token', 'tok');
  localStorage.setItem('collab_user', JSON.stringify({ email: 'myuser@test.com', roles: ['user'] }));
  return (
    <MemoryRouter>
      <ThemeProvider>
        <AuthProvider>
          <HomePage />
        </AuthProvider>
      </ThemeProvider>
    </MemoryRouter>
  );
}

describe('HomePage', () => {
  beforeEach(() => { localStorage.clear(); vi.clearAllMocks(); mockNavigate.mockClear(); });

  it('renders welcome message with username', async () => {
    api.getCourses.mockResolvedValue(COURSES);
    render(<Wrapper />);
    await waitFor(() => expect(screen.getByText('Curso A')).toBeTruthy());
    expect(document.body.textContent).toContain('myuser');
  });

  it('shows courses as cards', async () => {
    api.getCourses.mockResolvedValue(COURSES);
    render(<Wrapper />);
    await waitFor(() => expect(screen.getByText('Curso A')).toBeTruthy());
    expect(screen.getByText('Curso B')).toBeTruthy();
  });

  it('shows error message when getCourses fails', async () => {
    api.getCourses.mockRejectedValue(new Error('fail'));
    render(<Wrapper />);
    await waitFor(() => expect(screen.getByTestId('error-msg')).toBeTruthy());
  });

  it('shows empty state when no courses', async () => {
    api.getCourses.mockResolvedValue([]);
    render(<Wrapper />);
    await waitFor(() => expect(screen.getByText(/Nenhum curso disponível/)).toBeTruthy());
  });

  it('navigates to /class on Acessar', async () => {
    api.getCourses.mockResolvedValue(COURSES);
    render(<Wrapper />);
    await waitFor(() => screen.getAllByText(/Acessar curso/));
    await userEvent.click(screen.getAllByText(/Acessar curso/)[0]);
    expect(mockNavigate).toHaveBeenCalledWith('/class');
  });

  it('shows total lessons count in stats', async () => {
    api.getCourses.mockResolvedValue(COURSES);
    render(<Wrapper />);
    await waitFor(() => screen.getByText('Total de aulas'));
    expect(screen.getByText('1')).toBeTruthy();
  });
});
