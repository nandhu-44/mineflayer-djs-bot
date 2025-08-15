import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { Command } from '../../structures/Command.js';
import { getStatus } from '../../mc/bot.js';

export default new Command({
  category: 'mc',
  data: new SlashCommandBuilder().setName('status').setDescription('Show live Minecraft bot status'),
  async execute(interaction) {
    const st = getStatus();
    if (!st) return interaction.reply({ content: 'Bot offline', ephemeral: true });
    const embed = new EmbedBuilder().setTitle('Minecraft Bot Status')
      .addFields(
        { name: 'Health', value: st.health + '', inline: true },
        { name: 'Food', value: st.food + '', inline: true },
        { name: 'Ping', value: st.ping, inline: true },
        { name: 'Coords', value: st.coords, inline: true },
        { name: 'Dimension', value: st.dimension, inline: true },
        { name: 'Online Players', value: st.online + '', inline: true }
      )
      .setTimestamp();
    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
});
