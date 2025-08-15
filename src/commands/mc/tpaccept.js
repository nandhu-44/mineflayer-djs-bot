import { SlashCommandBuilder } from 'discord.js';
import { Command } from '../../structures/Command.js';
import { getBot } from '../../mc/bot.js';

export default new Command({
  category: 'mc',
  data: new SlashCommandBuilder().setName('tpaccept').setDescription('Accept a teleport request'),
  async execute(interaction) {
    const bot = getBot();
    bot.chat('/tpaccept');
    await interaction.reply({ content: 'Accepted teleport request', ephemeral: true });
  }
});
