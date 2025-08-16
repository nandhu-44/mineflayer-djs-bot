import fs from 'fs';
import path from 'path';
import dotenv from '@dotenvx/dotenvx';
import { logger } from './logger.js';

dotenv.config();

const root = process.cwd();
const configPath = path.join(root, 'src', 'config', 'config.json');

let fileConfig = {};
if (fs.existsSync(configPath)) {
  try {
    fileConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  } catch (e) {
    logger.error('Failed to parse config.json:', e);
  }
}

export const config = {
  discord: {
    token: process.env.DISCORD_TOKEN || fileConfig.discord?.token,
    clientId: process.env.DISCORD_CLIENT_ID || fileConfig.discord?.clientId,
    guildId: process.env.DISCORD_GUILD_ID || fileConfig.discord?.guildId,
  controlChannelId: process.env.DISCORD_CONTROL_CHANNEL_ID || fileConfig.discord?.controlChannelId,
  ownerId: process.env.DISCORD_OWNER_ID || fileConfig.discord?.ownerId
  },
  minecraft: {
    host: process.env.MC_HOST || fileConfig.minecraft?.host || 'localhost',
    port: Number(process.env.MC_PORT || fileConfig.minecraft?.port || 25565),
    username: process.env.MC_USERNAME || fileConfig.minecraft?.username,
    password: process.env.MC_PASSWORD || fileConfig.minecraft?.password || null,
    auth: process.env.MC_AUTH || fileConfig.minecraft?.auth || 'offline',
    version: process.env.MC_VERSION || fileConfig.minecraft?.version || undefined,
    loginCommandDelayMs: Number(process.env.MC_LOGIN_COMMAND_DELAY_MS || fileConfig.minecraft?.loginCommandDelayMs || 3000)
  },
  intervals: {
    statusUpdate: Number(process.env.STATUS_UPDATE_INTERVAL_MS || fileConfig.intervals?.statusUpdate || 5000)
  },
  features: {
    statusMode: process.env.STATUS_MODE || fileConfig.features?.statusMode || 'edit', // edit | send | off
  suppressProtocolSpam: /^(1|true|yes)$/i.test(process.env.SUPPRESS_PROTOCOL_SPAM || ''),
  enableViewer: /^(1|true|yes)$/i.test(process.env.ENABLE_VIEWER || fileConfig.features?.enableViewer || ''),
  enableWebServer: /^(1|true|yes)$/i.test(process.env.ENABLE_WEB_SERVER || fileConfig.features?.enableWebServer || ''),
  viewerPort: Number(process.env.VIEWER_PORT || fileConfig.features?.viewerPort || 3002),
  webServerPort: Number(process.env.WEB_SERVER_PORT || fileConfig.features?.webServerPort || 3001)
  }
};

export function validateConfig() {
  const missing = [];
  if (!config.discord.token) missing.push('DISCORD_TOKEN');
  if (!config.discord.clientId) missing.push('DISCORD_CLIENT_ID');
  if (!config.discord.guildId) missing.push('DISCORD_GUILD_ID');
  if (!config.discord.controlChannelId) missing.push('DISCORD_CONTROL_CHANNEL_ID');
  if (!config.minecraft.username) missing.push('MC_USERNAME');
  if (missing.length) {
    logger.warn('Missing required config values:', missing.join(', '));
  }
}
