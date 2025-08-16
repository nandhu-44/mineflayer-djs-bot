import { SlashCommandBuilder } from "discord.js";
import { Command } from "../../structures/Command.js";
import { getBot } from "../../mc/bot.js";

export default new Command({
  category: "mc",
  data: new SlashCommandBuilder().setName("collect").setDescription(
    "Collect nearest dropped item by name",
  )
    .addStringOption((o) =>
      o.setName("item").setDescription("Item name contains").setRequired(true)
    ),
  async execute(interaction) {
    const query = interaction.options.getString("item").toLowerCase();
    const bot = getBot();
    const entity = Object.values(bot.entities).find((e) =>
      e.name === "item" && e.metadata &&
      (bot.mcData?.items?.[e.metadata[7]?.itemId]?.name || "").includes(query)
    );
    if (!entity) {
      return interaction.reply({
        content: "No matching dropped item nearby",
        ephemeral: true,
      });
    }
    try {
      const { GoalBlock } = bot.pathfinder.goals;
      await bot.pathfinder.goto(
        new GoalBlock(entity.position.x, entity.position.y, entity.position.z),
      );
      interaction.reply({
        content: "Collected (or moved to) item",
        ephemeral: true,
      });
    } catch (e) {
      interaction.reply({ content: "Failed: " + e.message, ephemeral: true });
    }
  },
});
