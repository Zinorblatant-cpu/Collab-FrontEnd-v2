import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach } from 'vitest';
import { AuthProvider, useAuth } from '../contexts/AuthContext';

function AuthConsumer() {
  const { user, token, isAuthenticated, login, logout } = useAuth();
  return (
    <>
      <span data-testid="auth">{String(isAuthenticated)}</span>
      <span data-testid="email">{user?.email ?? 'none'}</span>
      <span data-testid="token">{token ?? 'none'}</span>
      <button onClick={() => login({ token: 'tok123', user: { email: 'a@b.com', roles: ['user'] } })}>login</button>
      <button onClick={logout}>logout</button>
    </>
  );
}

describe('AuthContext', () => {
  beforeEach(() => localStorage.clear());

  it('starts unauthenticated with empty localStorage', () => {
    render(<AuthProvider><AuthConsumer /></AuthProvider>);
    expect(screen.getByTestId('auth').textContent).toBe('false');
    expect(screen.getByTestId('email').textContent).toBe('none');
  });

  it('login stores token and user', async () => {
    render(<AuthProvider><AuthConsumer /></AuthProvider>);
    await userEvent.click(screen.getByText('login'));
    expect(screen.getByTestId('auth').textContent).toBe('true');
    expect(screen.getByTestId('email').textContent).toBe('a@b.com');
    expect(screen.getByTestId('token').textContent).toBe('tok123');
    expect(localStorage.getItem('collab_token')).toBe('tok123');
  });

  it('logout clears token and user', async () => {
    render(<AuthProvider><AuthConsumer /></AuthProvider>);
    await userEvent.click(screen.getByText('login'));
    await userEvent.click(screen.getByText('logout'));
    expect(screen.getByTestId('auth').textContent).toBe('false');
    expect(screen.getByTestId('email').textContent).toBe('none');
    expect(localStorage.getItem('collab_token')).toBeNull();
  });

  it('restores session from localStorage', () => {
    localStorage.setItem('collab_token', 'saved-tok');
    localStorage.setItem('collab_user', JSON.stringify({ email: 'c@d.com', roles: ['user'] }));
    render(<AuthProvider><AuthConsumer /></AuthProvider>);
    expect(screen.getByTestId('auth').textContent).toBe('true');
    expect(screen.getByTestId('email').textContent).toBe('c@d.com');
  });

  it('clears corrupted user from localStorage', () => {
    localStorage.setItem('collab_user', 'invalid-json{{{');
    render(<AuthProvider><AuthConsumer /></AuthProvider>);
    expect(screen.getByTestId('auth').textContent).toBe('false');
    expect(localStorage.getItem('collab_user')).toBeNull();
  });

  it('clears session if user present but token missing', () => {
    localStorage.setItem('collab_user', JSON.stringify({ email: 'x@y.com', roles: [] }));
    render(<AuthProvider><AuthConsumer /></AuthProvider>);
    expect(screen.getByTestId('auth').textContent).toBe('false');
  });

  it('useAuth throws outside provider', () => {
    const original = console.error;
    console.error = () => {};
    expect(() => render(<AuthConsumer />)).toThrow('useAuth must be used inside AuthProvider');
    console.error = original;
  });
});
