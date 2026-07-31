const ADMIN_TOKEN = process.env.ADMIN_TOKEN || '';

export function verifyAdminToken(token) {
  return Boolean(ADMIN_TOKEN && token === ADMIN_TOKEN);
}
