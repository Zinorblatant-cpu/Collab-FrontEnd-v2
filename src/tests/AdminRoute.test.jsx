import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, it, expect, beforeEach } from 'vitest';
import { AuthProvider } from '../contexts/AuthContext';
import AdminRoute from '../components/AdminRoute';

function Wrapper({ token, user }) {
  if (token) {
    localStorage.setItem('collab_token', token);
    localStorage.setItem('collab_user', JSON.stringify(user));
  }
  return (
    <MemoryRouter initialEntries={['/admin']}>
      <AuthProvider>
        <Routes>
          <Route path="/login"  element={<div>login page</div>} />
          <Route path="/"       element={<div>home page</div>} />
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<div>admin content</div>} />
          </Route>
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );
}

describe('AdminRoute', () => {
  beforeEach(() => localStorage.clear());

  it('redirects to /login when unauthenticated', () => {
    render(<Wrapper />);
    expect(screen.getByText('login page')).toBeTruthy();
  });

  it('redirects to / when authenticated but not admin', () => {
    render(<Wrapper token="tok" user={{ email: 'a@b.com', roles: ['user'] }} />);
    expect(screen.getByText('home page')).toBeTruthy();
  });

  it('renders outlet when authenticated as admin', () => {
    render(<Wrapper token="tok" user={{ email: 'a@b.com', roles: ['admin', 'user'] }} />);
    expect(screen.getByText('admin content')).toBeTruthy();
  });
});
