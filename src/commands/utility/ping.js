import { SlashCommandBuilder } from "discord.js";
import { Command } from "../../structures/Command.js";

export default new Command({
  category: "utility",
  data: new SlashCommandBuilder().setName("ping").setDescription(
    "Check bot latency",
  ),
  async execute(interaction) {
    const sent = Date.now();
    await interaction.reply({ content: "Pinging...", ephemeral: true });
    const diff = Date.now() - sent;
    await interaction.editReply(`Pong! ${diff}ms`);
  },
});
