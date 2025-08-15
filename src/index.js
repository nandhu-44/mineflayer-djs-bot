import { Client, Collection, GatewayIntentBits } from 'discord.js';
import express from 'express';
import { readdirSync } from 'fs';
import path from 'path';
import { logger } from './utils/logger.js';
import { config, validateConfig } from './utils/config.js';
import { createMinecraftBot } from './mc/bot.js';

validateConfig();

const root = process.cwd();
const commandsRoot = path.join(root, 'src', 'commands');
const eventsRoot = path.join(root, 'src', 'events');

function pathToFileURL(p) {
  let resolved = path.resolve(p).replace(/\\/g, '/');
  if (!resolved.startsWith('/')) resolved = '/' + resolved;
  return new URL('file://' + resolved);
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

const context = {
  commands: new Collection(),
  relayChannel: null,
  config
};

function loadCommands() {
  for (const dir of readdirSync(commandsRoot)) {
    const folder = path.join(commandsRoot, dir);
    for (const file of readdirSync(folder).filter(f => f.endsWith('.js'))) {
      const full = path.join(folder, file);
      import(pathToFileURL(full).href).then(mod => {
        const cmd = mod.default;
        if (cmd?.data?.name) {
          context.commands.set(cmd.data.name, cmd);
          logger.info('Loaded command', cmd.data.name);
        }
      });
    }
  }
}

function loadEvents() {
  for (const file of readdirSync(eventsRoot).filter(f => f.endsWith('.js'))) {
    const full = path.join(eventsRoot, file);
    import(pathToFileURL(full).href).then(mod => {
      const evt = mod.default;
      if (evt.once) {
        client.once(evt.name, (...args) => evt.execute(...args, context));
      } else {
        client.on(evt.name, (...args) => evt.execute(...args, context));
      }
      logger.info('Loaded event', evt.name);
    });
  }
}

loadCommands();
loadEvents();

client.login(config.discord.token).then(() => {
  createMinecraftBot(context);
  if (config.features.enableWebServer) {
    const app = express();
    app.get('/', (_, res) => res.send('Bot online'));
    const port = config.features.webServerPort;
    app.listen(port, () => logger.info(`Express status server on :${port}`));
  }
});
