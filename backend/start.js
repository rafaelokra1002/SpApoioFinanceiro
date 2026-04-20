const { execSync } = require('child_process');
try {
  execSync('npx prisma migrate deploy', { stdio: 'inherit' });
} catch (e) {
  console.log('Migration skipped:', e.message);
}
require('./dist/server.js');
