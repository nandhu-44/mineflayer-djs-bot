import { SlashCommandBuilder } from "discord.js";
import { Command } from "../../structures/Command.js";
import { getBot } from "../../mc/bot.js";

export default new Command({
  category: "mc",
  data: new SlashCommandBuilder().setName("back").setDescription(
    "Execute /back",
  ),
  async execute(interaction) {
    const bot = getBot();
    bot.chat("/back");
    interaction.reply({ content: "Going back...", ephemeral: true });
  },
});
