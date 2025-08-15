import { SlashCommandBuilder } from 'discord.js';
import { Command } from '../../structures/Command.js';
import { getBot } from '../../mc/bot.js';

export default new Command({
  category: 'mc',
  data: new SlashCommandBuilder().setName('home').setDescription('Execute /home'),
  async execute(interaction) {
    const bot = getBot();
    bot.chat('/home');
    interaction.reply({ content: 'Teleporting home...', ephemeral: true });
  }
});
