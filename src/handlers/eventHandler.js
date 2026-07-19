import { readdirSync } from 'fs';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const loadEvents = async (client) => {
  const eventsPath = resolve(dirname(__dirname), 'events');
  const eventFiles = readdirSync(eventsPath).filter((file) => file.endsWith('.js'));

  for (const file of eventFiles) {
    try {
      const filePath = resolve(eventsPath, file);
      const module = await import(`file://${filePath}`);
      const event = module.default || module.event;

      if (event.name && event.execute) {
        if (event.once) {
          client.once(event.name, (...args) => event.execute(...args, client));
        } else {
          client.on(event.name, (...args) => event.execute(...args, client));
        }
        console.log(`[EVENT LOADED]`.data, event.name);
      } else {
        console.warn(`[EVENT SKIPPED]`.warn, `${file} - Missing name or execute function`);
      }
    } catch (error) {
      console.error(`[EVENT ERROR]`.error, `Failed to load ${file}:`, error.message);
    }
  }
};
