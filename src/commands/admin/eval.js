import { SlashCommandBuilder } from 'discord.js';
import util from 'util';
import { Command } from '../../structures/Command.js';

export default new Command({
  data: new SlashCommandBuilder()
    .setName('eval')
    .setDescription('Evaluate JavaScript code (owner only)')
    .addStringOption(o => o.setName('code').setDescription('Code to eval').setRequired(true)),
  ownerOnly: true,
  cooldown: 2,
  defer: true,
  async execute(interaction, context) {
    const code = interaction.options.getString('code');
    try {
      const sanitized = code.replace(/process\.env/gi, 'env');
      // eslint-disable-next-line no-eval
      let result = await eval(`(async()=>{${sanitized}\n})()`);
      if (typeof result !== 'string') result = util.inspect(result, { depth: 1 });
      if (result.length > 1900) result = result.slice(0, 1900) + '...';
      await interaction.editReply({ content: '```js\n' + result + '\n```' });
    } catch (e) {
      let msg = (e && e.stack) ? e.stack : String(e);
      if (msg.length > 1900) msg = msg.slice(0, 1900) + '...';
      await interaction.editReply({ content: 'Error:\n```js\n' + msg + '\n```' });
    }
  }
});
