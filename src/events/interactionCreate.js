import { Collection, EmbedBuilder, Events } from "discord.js";
import { logger } from "../utils/logger.js";
import { getBot, getStatus } from "../mc/bot.js";

const cooldowns = new Collection();

export default {
  name: Events.InteractionCreate,
  async execute(interaction, context) {
    const ownerId = context.config?.discord?.ownerId;
    if (ownerId && interaction.user?.id !== ownerId) {
      if (interaction.isChatInputCommand()) {
        return interaction.reply({
          content: "Not authorized.",
          ephemeral: true,
        }).catch(() => {});
      }
      return;
    }
    if (interaction.isButton()) {
      const bot = getBot();
      const id = interaction.customId;
      if (!bot) {
        return interaction.reply({ content: "Bot offline", ephemeral: true });
      }
      const moveDirs = ["forward", "back", "left", "right", "jump"];
      if (moveDirs.includes(id)) {
        bot.setControlState(id, true);
        setTimeout(
          () => bot.setControlState(id, false),
          id === "jump" ? 500 : 1000,
        );
        return interaction.reply({ content: `Moving ${id}`, ephemeral: true });
      }
      if (id === "stop") {
        moveDirs.forEach((d) => bot.setControlState(d, false));
        return interaction.reply({
          content: "Stopped movement",
          ephemeral: true,
        });
      }
      if (id === "eat") {
        try {
          const food = bot.inventory?.items()?.find((i) =>
            /bread|apple|carrot|potato|beef|pork|chicken|mutton|fish|stew/i
              .test(i.name)
          );
          if (!food) {
            return interaction.reply({
              content: "No food found",
              ephemeral: true,
            });
          }
          await bot.equip(food, "hand");
          await bot.consume();
          return interaction.reply({ content: "Ate food", ephemeral: true });
        } catch (e) {
          logger.error("Eat error", e);
          return interaction.reply({
            content: "Failed to eat",
            ephemeral: true,
          });
        }
      }
      if (id === "playerlist") {
        const players = Object.values(bot.players).map((p) => p.username)
          .filter((u) => u && u !== bot.username);
        const embed = new EmbedBuilder().setTitle("Online Players")
          .addFields(
            { name: "Count", value: String(players.length), inline: true },
            {
              name: "Players",
              value: players.length ? players.join(", ") : "None",
              inline: false,
            },
          ).setTimestamp();
        return interaction.reply({ embeds: [embed], ephemeral: true });
      }
      return;
    }

    if (!interaction.isChatInputCommand()) return;
    const command = context.commands.get(interaction.commandName);
    if (!command) return;
    if (
      command.ownerOnly &&
      interaction.user.id !== context.config.discord.ownerId
    ) {
      return interaction.reply({
        content: "Owner only command.",
        ephemeral: true,
      });
    }

    if (command.defer) await interaction.deferReply({ ephemeral: true });

    if (command.cooldown) {
      if (!cooldowns.has(command.data.name)) {
        cooldowns.set(command.data.name, new Collection());
      }
      const now = Date.now();
      const timestamps = cooldowns.get(command.data.name);
      const cooldownAmount = command.cooldown * 1000;
      if (timestamps.has(interaction.user.id)) {
        const expiration = timestamps.get(interaction.user.id) + cooldownAmount;
        if (now < expiration) {
          const left = ((expiration - now) / 1000).toFixed(1);
          return interaction.reply({
            content: `Cooldown: ${left}s left`,
            ephemeral: true,
          });
        }
      }
      timestamps.set(interaction.user.id, now);
      setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);
    }

    try {
      await command.execute(interaction, context);
    } catch (e) {
      logger.error(e);
      if (interaction.deferred || interaction.replied) {
        interaction.followUp({
          content: "Error executing command",
          ephemeral: true,
        }).catch(() => {});
      } else {
        interaction.reply({
          content: "Error executing command",
          ephemeral: true,
        }).catch(() => {});
      }
    }
  },
};
