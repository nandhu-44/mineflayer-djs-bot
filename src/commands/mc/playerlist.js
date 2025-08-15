import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { Command } from '../../structures/Command.js';
import { getBot } from '../../mc/bot.js';

export default new Command({
  category: 'mc',
  data: new SlashCommandBuilder().setName('playerlist').setDescription('List online players'),
  async execute(interaction) {
    const bot = getBot();
    const players = Object.values(bot.players).map(p => p.username).filter(u => u && u !== bot.username);
    const embed = new EmbedBuilder().setTitle('Online Players')
      .addFields(
        { name: 'Count', value: String(players.length), inline: true },
        { name: 'Players', value: players.length ? players.join(', ') : 'None', inline: false }
      );
    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
});
