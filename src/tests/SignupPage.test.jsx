import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthProvider } from '../contexts/AuthContext';
import { ThemeProvider } from '../contexts/ThemeContext';
import SignupPage from '../pages/SignupPage';
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
          <SignupPage />
        </AuthProvider>
      </ThemeProvider>
    </MemoryRouter>
  );
}

describe('SignupPage', () => {
  beforeEach(() => { localStorage.clear(); mockNavigate.mockClear(); vi.clearAllMocks(); });

  it('renders signup form', () => {
    render(<Wrapper />);
    expect(screen.getByPlaceholderText('seu@email.com')).toBeTruthy();
    expect(screen.getByPlaceholderText('Mínimo 8 caracteres')).toBeTruthy();
    expect(screen.getByPlaceholderText('Repita a senha')).toBeTruthy();
  });

  it('shows error when passwords do not match', async () => {
    render(<Wrapper />);
    await userEvent.type(screen.getByPlaceholderText('seu@email.com'), 'a@b.com');
    await userEvent.type(screen.getByPlaceholderText('Mínimo 8 caracteres'), 'password1');
    await userEvent.type(screen.getByPlaceholderText('Repita a senha'), 'password2');
    await userEvent.click(screen.getByRole('button', { name: /criar conta/i }));
    expect(screen.getByTestId('error-msg').textContent).toContain('senhas não coincidem');
  });

  it('registers, logs in and navigates to / on success', async () => {
    api.registerWithEmail.mockResolvedValue({});
    api.loginWithEmail.mockResolvedValue({ token: 'tok', user: { email: 'a@b.com', roles: ['user'] } });
    render(<Wrapper />);
    await userEvent.type(screen.getByPlaceholderText('seu@email.com'), 'a@b.com');
    await userEvent.type(screen.getByPlaceholderText('Mínimo 8 caracteres'), 'password123');
    await userEvent.type(screen.getByPlaceholderText('Repita a senha'), 'password123');
    await userEvent.click(screen.getByRole('button', { name: /criar conta/i }));
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/'));
  });

  it('shows error on registration failure', async () => {
    api.registerWithEmail.mockRejectedValue(new Error('Email já cadastrado'));
    render(<Wrapper />);
    await userEvent.type(screen.getByPlaceholderText('seu@email.com'), 'a@b.com');
    await userEvent.type(screen.getByPlaceholderText('Mínimo 8 caracteres'), 'password123');
    await userEvent.type(screen.getByPlaceholderText('Repita a senha'), 'password123');
    await userEvent.click(screen.getByRole('button', { name: /criar conta/i }));
    await waitFor(() => expect(screen.getByTestId('error-msg').textContent).toContain('Email já cadastrado'));
  });

  it('shows loading state during submission', async () => {
    api.registerWithEmail.mockImplementation(() => new Promise(() => {}));
    render(<Wrapper />);
    await userEvent.type(screen.getByPlaceholderText('seu@email.com'), 'a@b.com');
    await userEvent.type(screen.getByPlaceholderText('Mínimo 8 caracteres'), 'password123');
    await userEvent.type(screen.getByPlaceholderText('Repita a senha'), 'password123');
    await userEvent.click(screen.getByRole('button', { name: /criar conta/i }));
    expect(screen.getByRole('button', { name: /criando conta/i })).toBeTruthy();
  });

  it('theme toggle works', async () => {
    document.documentElement.classList.add('dark');
    render(<Wrapper />);
    await userEvent.click(screen.getByTestId('theme-toggle'));
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });
});
