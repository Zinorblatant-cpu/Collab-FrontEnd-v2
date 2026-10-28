import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthProvider } from '../contexts/AuthContext';
import { ThemeProvider } from '../contexts/ThemeContext';
import LoginPage from '../pages/LoginPage';
import * as api from '../services/api';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

function Wrapper() {
  return (
    <MemoryRouter>
      <ThemeProvider>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </ThemeProvider>
    </MemoryRouter>
  );
}

describe('LoginPage', () => {
  beforeEach(() => { localStorage.clear(); mockNavigate.mockClear(); vi.clearAllMocks(); });

  it('renders login form', () => {
    render(<Wrapper />);
    expect(screen.getByPlaceholderText('seu@email.com')).toBeTruthy();
    expect(screen.getByPlaceholderText('Mínimo 8 caracteres')).toBeTruthy();
    expect(screen.getByRole('button', { name: /entrar/i })).toBeTruthy();
  });

  it('submits and navigates to / on success', async () => {
    api.loginWithEmail.mockResolvedValue({ token: 'tok', user: { email: 'a@b.com', roles: ['user'] } });
    render(<Wrapper />);
    await userEvent.type(screen.getByPlaceholderText('seu@email.com'), 'a@b.com');
    await userEvent.type(screen.getByPlaceholderText('Mínimo 8 caracteres'), 'password123');
    await userEvent.click(screen.getByRole('button', { name: /entrar/i }));
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/'));
  });

  it('shows error message on login failure', async () => {
    api.loginWithEmail.mockRejectedValue(new Error('Credenciais inválidas'));
    render(<Wrapper />);
    await userEvent.type(screen.getByPlaceholderText('seu@email.com'), 'a@b.com');
    await userEvent.type(screen.getByPlaceholderText('Mínimo 8 caracteres'), 'wrongpass');
    await userEvent.click(screen.getByRole('button', { name: /entrar/i }));
    await waitFor(() => expect(screen.getByTestId('error-msg')).toBeTruthy());
    expect(screen.getByTestId('error-msg').textContent).toContain('Credenciais inválidas');
  });

  it('shows loading state during submission', async () => {
    api.loginWithEmail.mockImplementation(() => new Promise(() => {}));
    render(<Wrapper />);
    await userEvent.type(screen.getByPlaceholderText('seu@email.com'), 'a@b.com');
    await userEvent.type(screen.getByPlaceholderText('Mínimo 8 caracteres'), 'password123');
    await userEvent.click(screen.getByRole('button', { name: /entrar/i }));
    expect(screen.getByRole('button', { name: /entrando/i })).toBeTruthy();
  });

  it('theme toggle changes theme', async () => {
    render(<Wrapper />);
    const btn = screen.getByTestId('theme-toggle');
    document.documentElement.classList.add('dark');
    await userEvent.click(btn);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('toggles password visibility', async () => {
    render(<Wrapper />);
    const input = screen.getByPlaceholderText('Mínimo 8 caracteres');
    expect(input.type).toBe('password');
    const toggleBtn = input.parentElement.querySelector('button');
    await userEvent.click(toggleBtn);
    expect(input.type).toBe('text');
    await userEvent.click(toggleBtn);
    expect(input.type).toBe('password');
  });
});
