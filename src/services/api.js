import { logger } from './logger';

async function request(path, options = {}) {
  const { headers: optHeaders = {}, ...restOptions } = options;
  const method  = restOptions.method ?? 'GET';
  const start   = Date.now();

  logger.debug(`API → ${method} ${path}`);

  let response;
  try {
    response = await fetch(path, {
      headers: { 'Content-Type': 'application/json', ...optHeaders },
      ...restOptions,
    });
  } catch (networkErr) {
    logger.error(`API network error: ${method} ${path}`, { error: networkErr.message });
    throw new Error('Sem conexão com o servidor.');
  }

  const ms = Date.now() - start;
  let body;
  try {
    body = await response.json();
  } catch {
    logger.error(`API parse error: ${method} ${path}`, { status: response.status, ms });
    throw new Error('Resposta inválida do servidor.');
  }

  if (!body.success) {
    const err   = new Error(body.error?.message || 'Request failed');
    err.code    = body.error?.code;
    err.details = body.error?.details;
    err.status  = response.status;
    const level = response.status >= 500 ? 'error' : 'warn';
    logger[level](`API ← ${method} ${path} ${response.status} (${ms}ms)`, { code: err.code });
    throw err;
  }

  logger.debug(`API ← ${method} ${path} ${response.status} (${ms}ms)`);
  return body.data;
}

function requestWithAuth(path, options = {}) {
  const token = localStorage.getItem('collab_token');
  return request(path, {
    ...options,
    headers: { Authorization: `Bearer ${token}`, ...options.headers },
  });
}

export function loginWithEmail(email, password) {
  return request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
}

export function registerWithEmail(email, password) {
  return request('/users', { method: 'POST', body: JSON.stringify({ email, password }) });
}

export function getProfile(email) {
  return requestWithAuth(`/users/profile?email=${encodeURIComponent(email)}`);
}

export function getCourses() {
  return requestWithAuth('/courses');
}

export function createCourse(title, description) {
  return requestWithAuth('/courses', { method: 'POST', body: JSON.stringify({ title, description }) });
}

export function deleteCourse(courseId) {
  return requestWithAuth(`/courses/${courseId}`, { method: 'DELETE' });
}

export function getLessonsForCourse(courseId) {
  return requestWithAuth(`/courses/${courseId}/lessons`);
}

export function addLesson(courseId, data) {
  return requestWithAuth(`/courses/${courseId}/lessons`, { method: 'POST', body: JSON.stringify(data) });
}

export function deleteLesson(lessonId) {
  return requestWithAuth(`/lessons/${lessonId}`, { method: 'DELETE' });
}

export function getLesson(lessonId) {
  return requestWithAuth(`/lessons/${lessonId}`);
}
