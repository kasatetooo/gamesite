import { randomUUID } from 'node:crypto';
import { eq } from 'drizzle-orm';
import { db } from '../../db/index.js';
import { gameVisitors } from '../../db/schema.js';
export default async (req: Request) => {
  if (!['GET', 'POST'].includes(req.method)) return new Response('Method not allowed', { status: 405 });
  if (req.method === 'POST' && req.headers.get('origin') !== new URL(req.url).origin) return new Response('Forbidden', { status: 403 });
  const cookie = req.headers.get('cookie')?.match(/(?:^|;\s*)game_visitor=([a-f0-9-]{36})(?:;|$)/)?.[1];
  const id = cookie && /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/.test(cookie) ? cookie : randomUUID();
  const headers = { 'Cache-Control': 'no-store', 'Set-Cookie': `game_visitor=${id}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=34560000` };
  try {
    await db.insert(gameVisitors).values({ id }).onConflictDoNothing();
    if (req.method === 'POST') await db.update(gameVisitors).set({ snowNoticeSeen: true }).where(eq(gameVisitors.id, id));
    const [visitor] = await db.select().from(gameVisitors).where(eq(gameVisitors.id, id));
    return Response.json({ seen: visitor.snowNoticeSeen }, { headers });
  } catch {
    return Response.json({ error: 'Could not save your notice preference. Please retry.' }, { status: 503, headers });
  }
};
