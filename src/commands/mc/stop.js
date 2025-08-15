import { SlashCommandBuilder } from 'discord.js';
import { Command } from '../../structures/Command.js';
import { getBot } from '../../mc/bot.js';

export default new Command({
  category: 'mc',
  data: new SlashCommandBuilder().setName('stopmc').setDescription('Stop pathfinding and movement'),
  async execute(interaction) {
    const bot = getBot();
    try { bot.pathfinder.setGoal(null); } catch {}
    ['forward','back','left','right','jump'].forEach(d => bot.setControlState(d,false));
    interaction.reply({ content: 'Stopped all actions', ephemeral: true });
  }
});
