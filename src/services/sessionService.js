export async function getSession(kv, userId) {
  try {
    const sessionData = await kv.get(`session:${userId}`);
    if (sessionData) {
      return JSON.parse(sessionData);
    }
    return null;
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
}

export async function updateSession(kv, userId, sessionData) {
  try {
    // Устанавливаем время жизни сессии на 1 час
    const expiresAt = Date.now() + (60 * 60 * 1000);
    
    await kv.put(`session:${userId}`, JSON.stringify({
      ...sessionData,
      updatedAt: Date.now(),
      expiresAt
    }), {
      expirationTtl: 3600 // 1 час в секундах
    });
    
    return true;
  } catch (error) {
    console.error('Error updating session:', error);
    return false;
  }
}

export async function clearSession(kv, userId) {
  try {
    await kv.delete(`session:${userId}`);
    return true;
  } catch (error) {
    console.error('Error clearing session:', error);
    return false;
  }
}

export async function isSessionValid(session) {
  if (!session) return false;
  
  // Проверяем, не истекла ли сессия
  if (session.expiresAt && Date.now() > session.expiresAt) {
    return false;
  }
  
  return true;
}
