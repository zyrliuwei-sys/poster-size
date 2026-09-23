import { createClient } from '@libsql/client';

const c = createClient({ url: 'file:data/local.db' });
const u = await c.execute('select id, email, email_verified from "user"');
console.log('users:', JSON.stringify(u.rows));
const r = await c.execute('select name from role');
console.log('roles:', JSON.stringify(r.rows));
