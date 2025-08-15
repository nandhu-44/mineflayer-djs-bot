import mineflayer from "mineflayer";
import mcDataLoader from "minecraft-data";
import pathfinderPkg from "mineflayer-pathfinder";
const { pathfinder, Movements, goals } = pathfinderPkg;
import * as collectBlockNS from "mineflayer-collectblock";
import * as toolNS from "mineflayer-tool";
import * as pvpNS from "mineflayer-pvp";
import { mineflayer as mineflayerViewer } from "prismarine-viewer";
import { config } from "../utils/config.js";
import { logger } from "../utils/logger.js";

let mcBot;

export function createMinecraftBot(discordContext) {
  mcBot = mineflayer.createBot({
    host: config.minecraft.host,
    port: config.minecraft.port,
    username: config.minecraft.username,
    password: config.minecraft.password || undefined,
  auth: config.minecraft.auth,
  version: config.minecraft.version,
  });

  const safeLoad = (candidate, label) => {
    const fn = (candidate && typeof candidate === 'function') ? candidate
      : (candidate?.plugin && typeof candidate.plugin === 'function') ? candidate.plugin
      : null;
    if (fn) {
      try { mcBot.loadPlugin(fn); } catch (e) { logger.warn(`Failed loading plugin ${label}:`, e.message); }
    } else {
      logger.warn(`Plugin ${label} not a function; skipped.`);
    }
  };

  safeLoad(pathfinder, 'pathfinder');
  safeLoad(collectBlockNS, 'collectblock');
  safeLoad(toolNS, 'tool');
  safeLoad(pvpNS, 'pvp');

  mcBot.once("login", () => {
    logger.success(`Minecraft bot logged in as ${mcBot.username}`);
    try {
      mcBot.mcData = mcDataLoader(mcBot.version);
    } catch (e) {
      logger.warn(
        "Failed to load minecraft-data for version",
        mcBot.version,
        e.message
      );
    }
    setTimeout(() => {
      if (config.minecraft.password) {
        mcBot.chat(`/login ${config.minecraft.password}`);
        logger.info("Sent /login command");
      }
    }, config.minecraft.loginCommandDelayMs);
    if (config.features.enableViewer) {
      try {
        const port = config.features.viewerPort;
        mineflayerViewer(mcBot, { port, firstPerson: false });
        logger.info(`Started web viewer on http://localhost:${port}`);
      } catch (e) {
        logger.warn("Could not start viewer:", e.message);
      }
    }
  });

  mcBot.on("messagestr", (message, position, jsonMsg) => {
    if (!discordContext?.relayChannel) return;
    if (/\b(teleport|tpa|tpahere|tpaccept)\b/i.test(message)) {
      discordContext.relayChannel.send(`🧭 ${message}`);
    }
  });

  mcBot.on("chat", (username, message) => {
    if (username === mcBot.username) return;
    discordContext?.relayChannel?.send(`💬 **${username}:** ${message}`);
  });

  mcBot.on("kicked", (reason, loggedIn) => {
    logger.error("Kicked:", reason);
    discordContext?.relayChannel?.send(`⛔ Kicked: ${reason}`);
  });

  mcBot.on("end", () => {
    logger.warn("Bot disconnected. Reconnecting in 5s...");
    discordContext?.relayChannel?.send("🔁 Disconnected. Reconnecting...");
    setTimeout(() => createMinecraftBot(discordContext), 5000);
  });

  mcBot.on("error", (err) => {
    logger.error("Minecraft error", err);
  });

  if (config.features?.suppressProtocolSpam) {
    const warn = console.warn;
    console.warn = (...args) => {
      if (typeof args[0] === 'string' && /Chunk size is .* only .* was read/.test(args[0])) return; // drop
      warn(...args);
    };
  }

  const autoEatLoop = () => {
    if (!mcBot) return;
    try {
      if (mcBot.food !== undefined && mcBot.food < 14) {
        const food = mcBot.inventory
          ?.items()
          ?.find((i) =>
            /bread|apple|carrot|potato|beef|pork|chicken|mutton|fish|stew/i.test(
              i.name
            )
          );
        if (food) {
          mcBot
            .equip(food, "hand")
            .then(() => mcBot.consume().catch(() => {}))
            .catch(() => {});
        }
      }
    } catch {}
    setTimeout(autoEatLoop, 5000);
  };
  setTimeout(autoEatLoop, 7000);

  return mcBot;
}

export function getBot() {
  return mcBot;
}
export { goals };
export function getStatus() {
  if (!mcBot) return null;
  const pos = mcBot.entity?.position;
  return {
    health: mcBot.health?.toFixed(1),
    food: mcBot.food?.toFixed(1),
    ping: mcBot.player ? `${Math.round(mcBot.player.ping)}ms` : "N/A",
    coords: pos
      ? `X:${pos.x.toFixed(1)} Y:${pos.y.toFixed(1)} Z:${pos.z.toFixed(1)}`
      : "N/A",
    dimension: mcBot.game?.dimension || "N/A",
    online: Object.keys(mcBot.players || {}).length,
    username: mcBot.username,
  };
}
