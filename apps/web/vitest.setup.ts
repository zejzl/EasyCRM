// An in-memory localStorage for the persisted auth store. Node has no usable one without --localstorage-file.
class MemoryStorage {
  private items = new Map<string, string>();
  get length() {
    return this.items.size;
  }
  clear() {
    this.items.clear();
  }
  getItem(key: string) {
    return this.items.has(key) ? (this.items.get(key) as string) : null;
  }
  key(i: number) {
    return Array.from(this.items.keys())[i] ?? null;
  }
  removeItem(key: string) {
    this.items.delete(key);
  }
  setItem(key: string, value: string) {
    this.items.set(key, String(value));
  }
}

Object.defineProperty(globalThis, 'localStorage', { value: new MemoryStorage(), configurable: true, writable: true });
