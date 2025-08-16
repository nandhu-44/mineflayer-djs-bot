#!/usr/bin/env node

import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { spawnSync } from 'child_process';
import os from 'os';

const PROCESS_NAME = 'mineflayer-bot';
const LOG_DIR = 'logs';
const INDICATOR_FILE = 'service-status.txt';

function run(cmd, args = [], opts = {}) {
	const res = spawnSync(cmd, args, { stdio: 'inherit', shell: true, ...opts });
	return res.status === 0;
}

function runOrFail(cmd, args = [], msg) {
	if (!run(cmd, args)) {
		console.error(msg || `Command failed: ${cmd} ${args.join(' ')}`);
		process.exit(1);
	}
}

function havePm2() {
	const res = spawnSync('pm2', ['-v'], { stdio: 'ignore', shell: true });
	return res.status === 0;
}

function registerCommands() {
	console.log('[setup] Registering slash commands...');
	runOrFail('npm', ['run', 'register'], '[setup] Command registration failed');
}

function writeIndicator(mode, action='start') {
	const content = [
		`timestamp: ${new Date().toISOString()}`,
		`action: ${action}`,
		`mode: ${mode}`,
		`host: ${os.hostname()}`,
		`pm2: ${mode === 'pm2' ? 'yes' : 'no'}`,
		`processName: ${PROCESS_NAME}`,
		`logsDir: ${LOG_DIR}`,
		`stdout: ${LOG_DIR}/${PROCESS_NAME}-out.log`,
		`stderr: ${LOG_DIR}/${PROCESS_NAME}-err.log`,
		'view live logs: pm2 logs ' + PROCESS_NAME,
		'tail file logs: Get-Content -Path logs/' + PROCESS_NAME + '-out.log -Wait',
		'stop: npm run service:stop',
		'remove from pm2: pm2 delete ' + PROCESS_NAME,
		'enable boot: pm2 startup && pm2 save'
	].join('\n');
	writeFileSync(INDICATOR_FILE, content);
	console.log('[setup] Wrote ' + INDICATOR_FILE);
}

function startWithPm2() {
	console.log('[setup] Starting (PM2)...');
	// If already exists, restart; else start
		if (!existsSync(LOG_DIR)) mkdirSync(LOG_DIR, { recursive: true });
		const list = spawnSync('pm2', ['list'], { encoding: 'utf8', shell: true });
	if (list.stdout && list.stdout.includes(PROCESS_NAME)) {
			runOrFail('pm2', ['restart', PROCESS_NAME], '[setup] pm2 restart failed');
			writeIndicator('pm2','restart');
	} else {
			runOrFail('pm2', [
				'start', 'src/index.js',
				'--name', PROCESS_NAME,
				'--update-env',
				'--output', `${LOG_DIR}/${PROCESS_NAME}-out.log`,
				'--error', `${LOG_DIR}/${PROCESS_NAME}-err.log`
			], '[setup] pm2 start failed');
			writeIndicator('pm2','start');
	}
	// Save process list so startup works if user later does pm2 startup
	run('pm2', ['save']);
	console.log('[setup] To enable autostart on boot run: pm2 startup (follow instructions)');
	console.log('[setup] Done. Use "pm2 logs', PROCESS_NAME, '" to watch output.');
}

function fallbackDirect() {
	console.log('[setup] PM2 not available and install failed/skipped -> running directly (blocking)...');
		if (!existsSync(LOG_DIR)) mkdirSync(LOG_DIR, { recursive: true });
		writeIndicator('direct');
	runOrFail('node', ['src/index.js']);
}

function ensurePm2() {
	if (havePm2()) return true;
	console.log('[setup] PM2 not found. Attempting global install...');
	const ok = run('npm', ['install', '-g', 'pm2']);
	if (!ok) {
		console.warn('[setup] Failed to install PM2 globally. Will fallback to direct run.');
		return false;
	}
	return havePm2();
}

// Optional: simple stop flag logic when running via direct fallback (PM2 users can pm2 stop)
// Could implement a watchdog here if desired; keeping minimal per user request.

function main() {
	if (!existsSync('package.json')) {
		console.error('[setup] package.json not found in current directory. Run this inside the project root.');
		process.exit(1);
	}
	registerCommands();
	const pm2Ready = ensurePm2();
	if (pm2Ready) startWithPm2(); else fallbackDirect();
}

main();
