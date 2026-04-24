const SESSION_KEY = 'abec-session';

export function clearLoginSession(): void {
  sessionStorage.removeItem(SESSION_KEY);
}

export function saveLoginSession(): void {
  sessionStorage.setItem(SESSION_KEY, '1');
}

export function hasLoginSession(): boolean {
  return typeof sessionStorage !== 'undefined' && sessionStorage.getItem(SESSION_KEY) === '1';
}
