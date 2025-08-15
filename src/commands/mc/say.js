import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { Command } from '../../structures/Command.js';
import { getBot } from '../../mc/bot.js';

export default new Command({
  category: 'mc',
  data: new SlashCommandBuilder()
    .setName('say')
    .setDescription('Send a chat message as the Minecraft bot')
    .addStringOption(o => o.setName('message').setDescription('Message').setRequired(true)),
  async execute(interaction) {
    const bot = getBot();
    if (!bot) return interaction.reply({ content: 'Minecraft bot not ready', ephemeral: true });
    const msg = interaction.options.getString('message');
    bot.chat(msg);
    await interaction.reply({ content: `Sent: ${msg}`, ephemeral: true });
  }
});
