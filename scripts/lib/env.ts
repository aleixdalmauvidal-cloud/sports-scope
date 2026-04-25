export function requiredEnv(key: string): string {
  const val = process.env[key]?.trim();
  if (!val) {
    console.error(`[env] Missing required env var: ${key}`);
    process.exit(1);
  }
  return val;
}
