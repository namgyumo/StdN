import { clearSessionCookie, json } from '../../_lib/auth';

export const onRequestPost: PagesFunction = async () =>
  json({ ok: true }, 200, { 'set-cookie': clearSessionCookie() });

export const onRequest: PagesFunction = async () =>
  json({ ok: false, error: 'method_not_allowed' }, 405);
