import { Events } from "discord.js";
import { logger } from "../utils/logger.js";
import { config } from "../utils/config.js";
import { getStatus } from "../mc/bot.js";

export default {
  name: Events.ClientReady,
  once: true,
  async execute(client, context) {
    logger.success(`Discord logged in as ${client.user.tag}`);
    const channelId = config.discord.controlChannelId;
    try {
      context.relayChannel = await client.channels.fetch(channelId);
      const mode = context.config.features?.statusMode;
      let statusMessage = null;
      if (mode === "edit") {
        statusMessage = await context.relayChannel.send(
          "⏳ Initializing status ...",
        );
      } else if (mode !== "off") {
        await context.relayChannel.send(
          "✅ Discord bot ready. Starting status loop.",
        );
      }
      setInterval(async () => {
        if (mode === "off") return;
        const st = getStatus();
        if (!st) return;
        const content =
          `Status | HP:${st.health} Food:${st.food} Ping:${st.ping} Pos:${st.coords}`;
        if (mode === "edit") {
          if (!statusMessage) {
            statusMessage = await context.relayChannel.send(content).catch(() =>
              null
            );
          } else {
            statusMessage.edit(content).catch(() => {});
          }
        } else if (mode === "send") {
          context.relayChannel.send({ content }).catch(() => {});
        }
      }, context.config.intervals.statusUpdate);
    } catch (e) {
      logger.error("Failed to fetch control channel:", e.message);
    }
  },
};
