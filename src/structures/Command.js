export class Command {
  constructor(options) {
    this.data = options.data; // SlashCommandBuilder instance
    this.execute = options.execute; // async (interaction, context)
    this.category = options.category || 'general';
    this.cooldown = options.cooldown || 0; // seconds
    this.defer = options.defer || false;
    this.permissions = options.permissions || [];
  }
}
