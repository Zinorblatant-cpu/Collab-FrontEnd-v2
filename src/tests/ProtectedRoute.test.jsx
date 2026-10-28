import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, it, expect, beforeEach } from 'vitest';
import { AuthProvider } from '../contexts/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';

function Wrapper({ token, user }) {
  if (token) {
    localStorage.setItem('collab_token', token);
    localStorage.setItem('collab_user', JSON.stringify(user));
  }
  return (
    <MemoryRouter initialEntries={['/protected']}>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<div>login page</div>} />
          <Route element={<ProtectedRoute />}>
            <Route path="/protected" element={<div>protected content</div>} />
          </Route>
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );
}

describe('ProtectedRoute', () => {
  beforeEach(() => localStorage.clear());

  it('redirects to /login when unauthenticated', () => {
    render(<Wrapper />);
    expect(screen.getByText('login page')).toBeTruthy();
  });

  it('renders outlet when authenticated', () => {
    render(<Wrapper token="tok" user={{ email: 'a@b.com', roles: ['user'] }} />);
    expect(screen.getByText('protected content')).toBeTruthy();
  });
});
