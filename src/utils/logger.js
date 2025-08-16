import chalk from "chalk";

const ts = () => chalk.gray(new Date().toISOString());

export const logger = {
  info: (...a) => console.log(ts(), chalk.cyan("[INFO]"), ...a),
  warn: (...a) => console.warn(ts(), chalk.yellow("[WARN]"), ...a),
  error: (...a) => console.error(ts(), chalk.red("[ERROR]"), ...a),
  success: (...a) => console.log(ts(), chalk.green("[OK]"), ...a),
  debug: (...a) => {
    if (process.env.DEBUG) console.log(ts(), chalk.magenta("[DEBUG]"), ...a);
  },
};
