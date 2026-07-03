import { Hono } from 'hono';
import { exec } from 'child_process';

export default new Hono().post('/', async (c) => {
  const body = await c.req.json();

  if (body.password === 'rimonrimonrimon') {
    // Run build script
    exec(`bash ./bash/cicd.sh`, (error, stdout, stderr) => {
      if (error) {
        console.error('❌ Build error:', error.message);
        return;
      }
      if (stderr) {
        console.error('⚠️ Build stderr:', stderr);
      }
      console.log('✅ Build output:', stdout);
    });

    return c.text(`🚀 Build triggered`);
  }

  return c.text('ℹ️ Event ignored');
});
