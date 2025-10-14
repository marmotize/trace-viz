import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const repoRoot = fileURLToPath(new URL('../..', import.meta.url));

const packagesToBuild = [
  '@trace-viz/core',
  '@trace-viz/react',
  '@trace-viz/version-detector-jsonata',
] as const;

async function ensurePackageBuilds() {
  const args = [
    '--dir',
    repoRoot,
    '-r',
    ...packagesToBuild.flatMap((pkg) => ['--filter', pkg]),
    'build',
  ];

  process.stdout.write(
    `Building trace-viz packages for e2e tests: ${packagesToBuild.join(', ')}\n`,
  );

  await new Promise<void>((resolve, reject) => {
    const child = spawn('pnpm', args, {
      stdio: 'inherit',
    });

    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`pnpm build exited with code ${code ?? 'null'}`));
      }
    });
  });
}

export default async function globalSetup() {
  await ensurePackageBuilds();
}
