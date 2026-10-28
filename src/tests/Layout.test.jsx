import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthProvider } from '../contexts/AuthContext';
import { ThemeProvider } from '../contexts/ThemeContext';
import Layout from '../components/Layout';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

function Wrapper({ token, user, children }) {
  if (token) {
    localStorage.setItem('collab_token', token);
    localStorage.setItem('collab_user', JSON.stringify(user));
  }
  return (
    <MemoryRouter>
      <ThemeProvider>
        <AuthProvider>
          <Layout>{children}</Layout>
        </AuthProvider>
      </ThemeProvider>
    </MemoryRouter>
  );
}

describe('Layout', () => {
  beforeEach(() => { localStorage.clear(); mockNavigate.mockClear(); document.documentElement.classList.add('dark'); });

  it('renders brand name in the DOM', () => {
    render(<Wrapper token="t" user={{ email: 'a@b.com', roles: ['user'] }}><div>content</div></Wrapper>);
    expect(document.body.innerHTML).toMatch(/COLL/);
    expect(document.body.innerHTML).toMatch(/AB/);
  });

  it('renders nav links for regular user', () => {
    render(<Wrapper token="t" user={{ email: 'a@b.com', roles: ['user'] }}><div /></Wrapper>);
    expect(screen.getAllByText('Início').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Aulas').length).toBeGreaterThan(0);
    expect(screen.queryByText('Config')).toBeNull();
  });

  it('renders Config link for admin', () => {
    render(<Wrapper token="t" user={{ email: 'a@b.com', roles: ['admin'] }}><div /></Wrapper>);
    expect(screen.getAllByText('Config').length).toBeGreaterThan(0);
  });

  it('shows user email in sidebar', () => {
    render(<Wrapper token="t" user={{ email: 'test@test.com', roles: ['user'] }}><div /></Wrapper>);
    expect(screen.getByText('test@test.com')).toBeTruthy();
  });

  it('theme toggle button exists', () => {
    render(<Wrapper token="t" user={{ email: 'a@b.com', roles: ['user'] }}><div /></Wrapper>);
    expect(screen.getByTestId('theme-toggle')).toBeTruthy();
  });

  it('clicking theme toggle changes theme', async () => {
    render(<Wrapper token="t" user={{ email: 'a@b.com', roles: ['user'] }}><div /></Wrapper>);
    await userEvent.click(screen.getByTestId('theme-toggle'));
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('logout navigates to /login', async () => {
    render(<Wrapper token="t" user={{ email: 'a@b.com', roles: ['user'] }}><div /></Wrapper>);
    await userEvent.click(screen.getByTestId('logout-btn'));
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('renders children', () => {
    render(<Wrapper token="t" user={{ email: 'a@b.com', roles: ['user'] }}><div>my content</div></Wrapper>);
    expect(screen.getByText('my content')).toBeTruthy();
  });
});
