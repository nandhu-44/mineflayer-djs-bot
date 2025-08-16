import { SlashCommandBuilder } from "discord.js";
import { Command } from "../../structures/Command.js";
import { spawn } from "child_process";

export default new Command({
  data: new SlashCommandBuilder()
    .setName("exec")
    .setDescription("Execute a shell command (owner only)")
    .addStringOption((o) =>
      o.setName("cmd").setDescription("Command").setRequired(true)
    ),
  ownerOnly: true,
  cooldown: 3,
  defer: true,
  async execute(interaction) {
    const cmd = interaction.options.getString("cmd");
    const child = spawn(cmd, { shell: true });
    let stdout = "", stderr = "";
    child.stdout.on("data", (d) => {
      stdout += d.toString();
    });
    child.stderr.on("data", (d) => {
      stderr += d.toString();
    });
    child.on("close", async (code) => {
      let out = "";
      if (stdout) out += `STDOUT:\n${stdout}\n`;
      if (stderr) out += `STDERR:\n${stderr}\n`;
      out += `Exit code: ${code}`;
      if (!out.trim()) out = "No output";
      if (out.length > 1900) out = out.slice(0, 1900) + "...";
      await interaction.editReply({ content: "```txt\n" + out + "\n```" });
    });
  },
});
