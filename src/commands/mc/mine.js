import { SlashCommandBuilder } from 'discord.js';
import { Command } from '../../structures/Command.js';
import { getBot } from '../../mc/bot.js';

export default new Command({
  category: 'mc',
  data: new SlashCommandBuilder().setName('mine').setDescription('Mine nearest block of a given type')
    .addStringOption(o => o.setName('block').setDescription('Block name (e.g. oak_log)').setRequired(true)),
  async execute(interaction) {
    const name = interaction.options.getString('block');
    const bot = getBot();
    const mcDataModule = await import('minecraft-data');
    const mcData = mcDataModule.default(bot.version);
    const blockId = mcData.blocksByName[name]?.id;
    if (!blockId) return interaction.reply({ content: 'Unknown block', ephemeral: true });
    const block = bot.findBlock({ matching: blockId, maxDistance: 64 });
    if (!block) return interaction.reply({ content: 'No block nearby', ephemeral: true });
    try { await bot.tool.equipForBlock(block); } catch {}
    try {
      const { GoalBlock } = bot.pathfinder.goals;
      await bot.pathfinder.goto(new GoalBlock(block.position.x, block.position.y, block.position.z));
    } catch (e) { /* ignore navigation error before dig */ }
    try {
      await bot.dig(block);
      interaction.reply({ content: `Mined ${name}`, ephemeral: true });
    } catch (e) {
      interaction.reply({ content: 'Failed to mine: ' + e.message, ephemeral: true });
    }
  }
});
