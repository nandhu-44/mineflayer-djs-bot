import { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';
import { Command } from '../../structures/Command.js';
import { getStatus } from '../../mc/bot.js';

export default new Command({
  category: 'mc',
  data: new SlashCommandBuilder().setName('panel').setDescription('Send / update the control panel'),
  async execute(interaction) {
    const st = getStatus();
    if (!st) return interaction.reply({ content: 'Bot offline', ephemeral: true });
    const embed = new EmbedBuilder().setTitle('Minecraft Control Panel')
      .addFields(
        { name: 'Health', value: st.health + '', inline: true },
        { name: 'Food', value: st.food + '', inline: true },
        { name: 'Ping', value: st.ping, inline: true },
        { name: 'Coords', value: st.coords, inline: true },
        { name: 'Players', value: st.online + '', inline: true },
        { name: 'Dimension', value: st.dimension, inline: true }
      ).setTimestamp();

    const row1 = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('forward').setLabel('Forward').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('back').setLabel('Back').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('left').setLabel('Left').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('right').setLabel('Right').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('jump').setLabel('Jump').setStyle(ButtonStyle.Secondary)
    );
    const row2 = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('eat').setLabel('Eat').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId('stop').setLabel('Stop').setStyle(ButtonStyle.Danger),
      new ButtonBuilder().setCustomId('playerlist').setLabel('Players').setStyle(ButtonStyle.Secondary)
    );

    if (interaction.channel) {
      await interaction.reply({ content: 'Panel sent / updated', ephemeral: true });
      if (interaction.channel.lastMessage && interaction.channel.lastMessage.author.id === interaction.client.user.id && interaction.channel.lastMessage.embeds[0]?.title === 'Minecraft Control Panel') {
        interaction.channel.lastMessage.edit({ embeds: [embed], components: [row1, row2] });
      } else {
        await interaction.channel.send({ embeds: [embed], components: [row1, row2] });
      }
    }
  }
});
