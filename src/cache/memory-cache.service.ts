import { Injectable } from '@nestjs/common';

interface Entry {
  value: unknown;
  expires: number;
}

const MAX_ENTRIES = 1000;

@Injectable()
export class MemoryCacheService {
  private readonly store = new Map<string, Entry>();
  private readonly pending = new Map<string, Promise<unknown>>();
  private version = 0;

  async remember<T>(key: string, ttlMs: number, load: () => Promise<T>): Promise<T> {
    const hit = this.store.get(key);
    if (hit && hit.expires > Date.now()) return hit.value as T;

    // If someone is already loading this key, wait for them instead of asking the database again
    const inflight = this.pending.get(key);
    if (inflight) return inflight as Promise<T>;

    const startedAt = this.version;
    const promise = load()
      .then((value) => {
        if (startedAt === this.version) this.set(key, value, ttlMs);
        return value;
      })
      .finally(() => {
        if (this.pending.get(key) === promise) this.pending.delete(key);
      });
    this.pending.set(key, promise);
    return promise;
  }

  clearPrefix(prefix: string) {
    this.version++;
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) this.store.delete(key);
    }
    for (const key of this.pending.keys()) {
      if (key.startsWith(prefix)) this.pending.delete(key);
    }
  }

  private set(key: string, value: unknown, ttlMs: number) {
    if (this.store.size >= MAX_ENTRIES) {
      const oldest = this.store.keys().next().value;
      if (oldest !== undefined) this.store.delete(oldest);
    }
    this.store.set(key, { value, expires: Date.now() + ttlMs });
  }
}