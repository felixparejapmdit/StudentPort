import fs from 'fs/promises';
import path from 'path';

export class JsonRepository {
  constructor(filePath) {
    this.filePath = filePath;
  }

  async read() {
    try {
      const data = await fs.readFile(this.filePath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      if (error.code === 'ENOENT') {
        return [];
      }
      throw error;
    }
  }

  async write(data) {
    const dir = path.dirname(this.filePath);
    try {
      await fs.access(dir);
    } catch {
      await fs.mkdir(dir, { recursive: true });
    }
    await fs.writeFile(this.filePath, JSON.stringify(data, null, 2), 'utf-8');
  }

  async getAll() {
    return await this.read();
  }

  async save(item) {
    const data = await this.read();
    const index = data.findIndex(i => i.id === item.id);
    if (index !== -1) {
      data[index] = item;
    } else {
      data.push(item);
    }
    await this.write(data);
    return item;
  }

  async delete(id) {
    const data = await this.read();
    const newData = data.filter(i => i.id !== id);
    await this.write(newData);
  }
}
