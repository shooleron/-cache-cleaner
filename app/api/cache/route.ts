import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import os from 'os';

const execAsync = promisify(exec);
const home = os.homedir();

export interface CacheTarget {
  id: string;
  label: string;
  path?: string;
  command?: string;
}

const TARGETS: CacheTarget[] = [
  { id: 'userCaches', label: 'App Caches', path: `${home}/Library/Caches` },
  { id: 'userLogs', label: 'User Logs', path: `${home}/Library/Logs` },
  { id: 'trash', label: 'Trash', path: `${home}/.Trash` },
  { id: 'npm', label: 'npm Cache', command: 'npm cache clean --force' },
  { id: 'dns', label: 'DNS Cache', command: 'dscacheutil -flushcache && killall -HUP mDNSResponder' },
];

async function getSize(dirPath: string): Promise<string> {
  try {
    const { stdout } = await execAsync(`du -sh "${dirPath}" 2>/dev/null`);
    return stdout.split('\t')[0].trim();
  } catch {
    return '0B';
  }
}

// GET - scan cache sizes
export async function GET() {
  const results = await Promise.all(
    TARGETS.map(async (target) => {
      let size = '-';
      if (target.path) {
        size = await getSize(target.path);
      }
      return { id: target.id, label: target.label, size };
    })
  );
  return NextResponse.json({ targets: results });
}

// POST - clean selected caches
export async function POST(request: NextRequest) {
  const { ids }: { ids: string[] } = await request.json();

  const results = await Promise.all(
    ids.map(async (id) => {
      const target = TARGETS.find((t) => t.id === id);
      if (!target) return { id, success: false, message: 'Unknown target' };

      try {
        if (target.path) {
          await execAsync(`rm -rf "${target.path}/"* 2>/dev/null; true`);
          return { id, success: true, message: `${target.label} cleaned` };
        } else if (target.command) {
          await execAsync(target.command);
          return { id, success: true, message: `${target.label} cleaned` };
        }
        return { id, success: false, message: 'No action defined' };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        return { id, success: false, message: msg };
      }
    })
  );

  return NextResponse.json({ results });
}
