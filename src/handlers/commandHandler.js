import { readdirSync } from 'fs';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const loadCommands = async (client) => {
  const commandsPath = resolve(dirname(__dirname), 'commands');
  const categories = readdirSync(commandsPath);

  for (const category of categories) {
    const categoryPath = resolve(commandsPath, category);
    const commandFiles = readdirSync(categoryPath).filter((file) => file.endsWith('.js'));

    for (const file of commandFiles) {
      try {
        const filePath = resolve(categoryPath, file);
        const module = await import(`file://${filePath}`);
        const command = module.default || module.command;

        if (command.data && command.execute) {
          client.commands.set(command.data.name, command);
          console.log(`[COMMAND LOADED]`.data, `${command.data.name} (${category})`);
        } else {
          console.warn(`[COMMAND SKIPPED]`.warn, `${file} - Missing data or execute function`);
        }
      } catch (error) {
        console.error(`[COMMAND ERROR]`.error, `Failed to load ${file}:`, error.message);
      }
    }
  }
};
