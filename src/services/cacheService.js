// Сервис кэширования

export class CacheService {
  constructor(env) {
    this.kv = env.LESSON_CACHE;
    this.defaultTTL = 3600; // 1 час
  }

  async get(key) {
    try {
      const value = await this.kv.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  async set(key, value, ttl = this.defaultTTL) {
    try {
      await this.kv.put(key, JSON.stringify(value), { expirationTtl: ttl });
      return true;
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  }

  async delete(key) {
    try {
      await this.kv.delete(key);
      return true;
    } catch (error) {
      console.error('Cache delete error:', error);
      return false;
    }
  }

  // Кэширование уроков
  async getLesson(lessonId) {
    return await this.get(`lesson:${lessonId}`);
  }

  async setLesson(lessonId, lessonData) {
    return await this.set(`lesson:${lessonId}`, lessonData, 7200); // 2 часа
  }

  // Кэширование пользователей
  async getUser(userId) {
    return await this.get(`user:${userId}`);
  }

  async setUser(userId, userData) {
    return await this.set(`user:${userId}`, userData, 1800); // 30 минут
  }

  // Кэширование AI-анализа
  async getAIAnalysis(text, question) {
    const key = `ai:${this.hashString(text + JSON.stringify(question))}`;
    return await this.get(key);
  }

  async setAIAnalysis(text, question, analysis) {
    const key = `ai:${this.hashString(text + JSON.stringify(question))}`;
    return await this.set(key, analysis, 3600); // 1 час
  }

  private hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36);
  }
}

export function createCacheService(env) {
  return new CacheService(env);
}
