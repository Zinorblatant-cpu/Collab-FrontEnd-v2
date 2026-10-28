import '@testing-library/jest-dom';
import { vi } from 'vitest';

Object.defineProperty(window, 'localStorage', {
  value: (() => {
    let store = {};
    return {
      getItem: (k) => store[k] ?? null,
      setItem: (k, v) => { store[k] = String(v); },
      removeItem: (k) => { delete store[k]; },
      clear: () => { store = {}; },
    };
  })(),
  writable: true,
});

vi.mock('../services/api', () => ({
  loginWithEmail:       vi.fn(),
  registerWithEmail:    vi.fn(),
  getProfile:           vi.fn(),
  getCourses:           vi.fn(),
  createCourse:         vi.fn(),
  deleteCourse:         vi.fn(),
  getLessonsForCourse:  vi.fn(),
  addLesson:            vi.fn(),
  deleteLesson:         vi.fn(),
  getLesson:            vi.fn(),
}));
