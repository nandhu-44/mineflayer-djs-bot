import { SlashCommandBuilder } from 'discord.js';
import { Command } from '../../structures/Command.js';
import { getBot } from '../../mc/bot.js';

export default new Command({
  category: 'mc',
  data: new SlashCommandBuilder()
    .setName('tpa')
    .setDescription('Send /tpa to a player')
    .addStringOption(o => o.setName('player').setDescription('Target player').setRequired(true)),
  async execute(interaction) {
    const bot = getBot();
    const player = interaction.options.getString('player');
    bot.chat(`/tpa ${player}`);
    await interaction.reply({ content: `Sent /tpa to ${player}`, ephemeral: true });
  }
});
