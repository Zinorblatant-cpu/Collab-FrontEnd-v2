import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach } from 'vitest';
import { ThemeProvider, useTheme } from '../contexts/ThemeContext';

function ThemeConsumer() {
  const { theme, toggleTheme } = useTheme();
  return (
    <>
      <span data-testid="theme">{theme}</span>
      <button onClick={toggleTheme}>toggle</button>
    </>
  );
}

describe('ThemeContext', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
  });

  it('defaults to dark when localStorage is empty', () => {
    render(<ThemeProvider><ThemeConsumer /></ThemeProvider>);
    expect(screen.getByTestId('theme').textContent).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('reads saved theme from localStorage', () => {
    localStorage.setItem('collab_theme', 'light');
    render(<ThemeProvider><ThemeConsumer /></ThemeProvider>);
    expect(screen.getByTestId('theme').textContent).toBe('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('toggles from dark to light', async () => {
    render(<ThemeProvider><ThemeConsumer /></ThemeProvider>);
    await userEvent.click(screen.getByRole('button'));
    expect(screen.getByTestId('theme').textContent).toBe('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(localStorage.getItem('collab_theme')).toBe('light');
  });

  it('toggles from light to dark', async () => {
    localStorage.setItem('collab_theme', 'light');
    render(<ThemeProvider><ThemeConsumer /></ThemeProvider>);
    await userEvent.click(screen.getByRole('button'));
    expect(screen.getByTestId('theme').textContent).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('useTheme throws outside provider', () => {
    const original = console.error;
    console.error = () => {};
    expect(() => render(<ThemeConsumer />)).toThrow('useTheme must be used inside ThemeProvider');
    console.error = original;
  });
});
