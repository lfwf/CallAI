const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'change-me';

export function verifyAdminAccount(username, password) {
  return Boolean(username === ADMIN_USERNAME && password === ADMIN_PASSWORD);
}

export function createAdminSession() {
  return {
    authenticated: true,
    createdAt: new Date().toISOString()
  };
}
