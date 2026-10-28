import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, beforeEach } from 'vitest';
import { ThemeProvider } from '../contexts/ThemeContext';
import SalePage from '../pages/SalePage';

function Wrapper() {
  return (
    <MemoryRouter>
      <ThemeProvider>
        <SalePage />
      </ThemeProvider>
    </MemoryRouter>
  );
}

describe('SalePage', () => {
  beforeEach(() => { localStorage.clear(); document.documentElement.classList.add('dark'); });

  it('renders brand name in DOM', () => {
    render(<Wrapper />);
    expect(document.body.innerHTML).toMatch(/COLL/);
  });

  it('renders hero headline', () => {
    render(<Wrapper />);
    expect(screen.getByText(/Aprenda/)).toBeTruthy();
  });

  it('renders feature items', () => {
    render(<Wrapper />);
    expect(screen.getByText('Vídeo-aulas')).toBeTruthy();
    expect(screen.getByText('Modo Claro/Escuro')).toBeTruthy();
  });

  it('renders CTA links', () => {
    render(<Wrapper />);
    const links = screen.getAllByText(/Criar conta grátis/);
    expect(links.length).toBeGreaterThan(0);
  });

  it('renders Entrar link', () => {
    render(<Wrapper />);
    expect(screen.getByText('Entrar')).toBeTruthy();
  });

  it('theme toggle changes theme', async () => {
    render(<Wrapper />);
    await userEvent.click(screen.getByTestId('theme-toggle'));
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('renders footer', () => {
    render(<Wrapper />);
    expect(screen.getByText(/Todos os direitos reservados/)).toBeTruthy();
  });
});
