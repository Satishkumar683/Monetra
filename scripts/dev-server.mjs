import { spawn } from 'child_process';

const child = spawn(
  'node',
  ['--max-http-header-size=262144', './node_modules/next/dist/bin/next', 'dev', '-p', '3000'],
  {
    stdio: ['ignore', 'inherit', 'inherit'],
    shell: false,
    env: process.env,
  }
);

child.on('exit', (code) => {
  process.exit(code ?? 0);
});

process.on('SIGTERM', () => child.kill('SIGTERM'));
process.on('SIGINT', () => child.kill('SIGINT'));
