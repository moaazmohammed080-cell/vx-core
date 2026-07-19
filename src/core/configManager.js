export class ConfigManager {
  constructor() {
    this.settings = new Map();
  }

  set(key, value) {
    this.settings.set(key, value);
    return this;
  }

  get(key, defaultValue = null) {
    return this.settings.get(key) || defaultValue;
  }

  has(key) {
    return this.settings.has(key);
  }

  delete(key) {
    return this.settings.delete(key);
  }

  clear() {
    this.settings.clear();
  }

  getAll() {
    return Object.fromEntries(this.settings);
  }

  setMultiple(obj) {
    Object.entries(obj).forEach(([key, value]) => {
      this.set(key, value);
    });
    return this;
  }
}

export const configManager = new ConfigManager();
