import { SlashCommandBuilder } from 'discord.js';
import { Command } from '../../structures/Command.js';
import { getBot } from '../../mc/bot.js';
import { goals } from '../../mc/bot.js';

export default new Command({
  category: 'mc',
  data: new SlashCommandBuilder().setName('follow').setDescription('Follow a player continuously')
    .addStringOption(o => o.setName('player').setDescription('Player name').setRequired(true)),
  async execute(interaction) {
    const playerName = interaction.options.getString('player');
    const bot = getBot();
    const target = bot.players[playerName]?.entity;
    if (!target) return interaction.reply({ content: 'Player not found / not in range', ephemeral: true });
    const { pathfinder } = bot;
    const mcData = await import('minecraft-data');
    const data = mcData.default(bot.version);
    const movements = new pathfinder.Movements(bot, data);
    movements.scafoldingBlocks = [];
    pathfinder.setMovements(movements);
    pathfinder.setGoal(new goals.GoalFollow(target, 1), true);
    interaction.reply({ content: `Following ${playerName}`, ephemeral: true });
  }
});
