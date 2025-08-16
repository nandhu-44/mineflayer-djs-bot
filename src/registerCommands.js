import { REST, Routes } from "discord.js";
import { readdirSync } from "fs";
import path from "path";
import { config } from "./utils/config.js";
import { logger } from "./utils/logger.js";

const root = process.cwd();
const commandsRoot = path.join(root, "src", "commands");

async function loadCommands() {
  const commands = [];
  for (const dir of readdirSync(commandsRoot)) {
    const dirPath = path.join(commandsRoot, dir);
    for (const file of readdirSync(dirPath).filter((f) => f.endsWith(".js"))) {
      const full = path.join(dirPath, file);
      const cmd = (await import(pathToFileURL(full).href)).default;
      if (cmd?.data) commands.push(cmd.data.toJSON());
    }
  }
  return commands;
}

function pathToFileURL(p) {
  let resolved = path.resolve(p).replace(/\\/g, "/");
  if (!resolved.startsWith("/")) resolved = "/" + resolved;
  return new URL("file://" + resolved);
}

(async () => {
  const rest = new REST({ version: "10" }).setToken(config.discord.token);
  const body = await loadCommands();
  try {
    logger.info(`Registering ${body.length} slash commands ...`);
    await rest.put(
      Routes.applicationGuildCommands(
        config.discord.clientId,
        config.discord.guildId,
      ),
      { body },
    );
    logger.success("Slash commands registered");
  } catch (e) {
    logger.error("Failed to register commands", e);
  }
})();
