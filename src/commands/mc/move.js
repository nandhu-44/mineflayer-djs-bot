import { SlashCommandBuilder } from 'discord.js';
import { Command } from '../../structures/Command.js';
import { getBot } from '../../mc/bot.js';

const directions = ['forward','back','left','right','jump'];

export default new Command({
  category: 'mc',
  data: new SlashCommandBuilder()
    .setName('move')
    .setDescription('Move the bot in a direction for a duration')
    .addStringOption(o => o.setName('direction').setDescription('Direction').addChoices(
      ...directions.map(d => ({ name: d, value: d }))
    ).setRequired(true))
    .addIntegerOption(o => o.setName('ms').setDescription('Milliseconds (default 1000)').setMinValue(100).setMaxValue(10000)),
  async execute(interaction) {
    const dir = interaction.options.getString('direction');
    const ms = interaction.options.getInteger('ms') || 1000;
    const bot = getBot();
    bot.setControlState(dir, true);
    setTimeout(() => bot.setControlState(dir, false), ms);
    await interaction.reply({ content: `Moving ${dir} for ${ms}ms`, ephemeral: true });
  }
});
