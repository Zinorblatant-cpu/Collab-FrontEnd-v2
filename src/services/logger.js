const isDev   = import.meta.env?.DEV ?? false;
const PREFIX  = '[COLLAB]';
const LEVELS  = { error: 0, warn: 1, info: 2, debug: 3 };
const MAX     = isDev ? LEVELS.debug : LEVELS.warn;

function shouldLog(level) { return LEVELS[level] <= MAX; }

function fmt(level, message, ctx) {
  const ts     = new Date().toISOString().slice(11, 23);
  const label  = level.toUpperCase().padEnd(5);
  const ctxStr = ctx && Object.keys(ctx).length ? ' ' + JSON.stringify(ctx) : '';
  return `${PREFIX} [${ts}] [${label}] ${message}${ctxStr}`;
}

function log(level, message, ctx = {}) {
  if (!shouldLog(level)) return;
  const line = fmt(level, message, ctx);
  switch (level) {
    case 'error': console.error(line); break;
    case 'warn':  console.warn(line);  break;
    case 'info':  console.info(line);  break;
    default:      console.debug(line); break;
  }
}

export const logger = {
  error: (msg, ctx) => log('error', msg, ctx),
  warn:  (msg, ctx) => log('warn',  msg, ctx),
  info:  (msg, ctx) => log('info',  msg, ctx),
  debug: (msg, ctx) => log('debug', msg, ctx),
};
