// Сервис социальных функций

export class SocialService {
  constructor(db) {
    this.db = db;
  }

  // Рейтинг пользователей
  async getLeaderboard(limit = 10, period = 'all') {
    try {
      let query = '';
      let params = [];

      switch (period) {
        case 'week':
          query = `
            SELECT u.id, u.first_name, u.username, u.level, u.experience_points,
                   COUNT(p.id) as lessons_completed,
                   AVG(p.score) as average_score
            FROM users u
            LEFT JOIN progress p ON u.id = p.user_id 
            WHERE p.completed_at >= datetime('now', '-7 days')
            GROUP BY u.id
            ORDER BY u.experience_points DESC, average_score DESC
            LIMIT ?
          `;
          params = [limit];
          break;
        case 'month':
          query = `
            SELECT u.id, u.first_name, u.username, u.level, u.experience_points,
                   COUNT(p.id) as lessons_completed,
                   AVG(p.score) as average_score
            FROM users u
            LEFT JOIN progress p ON u.id = p.user_id 
            WHERE p.completed_at >= datetime('now', '-30 days')
            GROUP BY u.id
            ORDER BY u.experience_points DESC, average_score DESC
            LIMIT ?
          `;
          params = [limit];
          break;
        default: // all time
          query = `
            SELECT u.id, u.first_name, u.username, u.level, u.experience_points,
                   COUNT(p.id) as lessons_completed,
                   AVG(p.score) as average_score
            FROM users u
            LEFT JOIN progress p ON u.id = p.user_id 
            GROUP BY u.id
            ORDER BY u.experience_points DESC, average_score DESC
            LIMIT ?
          `;
          params = [limit];
      }

      const result = await this.db.prepare(query).bind(...params).all();
      return result.results.map((user, index) => ({
        ...user,
        rank: index + 1
      }));
    } catch (error) {
      console.error('Error getting leaderboard:', error);
      return [];
    }
  }

  // Получить позицию пользователя в рейтинге
  async getUserRank(userId) {
    try {
      const query = `
        SELECT rank FROM (
          SELECT u.id, ROW_NUMBER() OVER (ORDER BY u.experience_points DESC, 
            (SELECT AVG(score) FROM progress WHERE user_id = u.id) DESC) as rank
          FROM users u
        ) ranked
        WHERE id = ?
      `;
      
      const result = await this.db.prepare(query).bind(userId).first();
      return result ? result.rank : null;
    } catch (error) {
      console.error('Error getting user rank:', error);
      return null;
    }
  }

  // Создать соревнование
  async createCompetition(name, description, startDate, endDate, rules) {
    try {
      const query = `
        INSERT INTO competitions (name, description, start_date, end_date, rules, status)
        VALUES (?, ?, ?, ?, ?, 'active')
      `;
      
      const result = await this.db.prepare(query).bind(
        name, description, startDate, endDate, JSON.stringify(rules)
      ).run();
      
      return result.meta.last_row_id;
    } catch (error) {
      console.error('Error creating competition:', error);
      throw error;
    }
  }

  // Присоединиться к соревнованию
  async joinCompetition(userId, competitionId) {
    try {
      const query = `
        INSERT INTO competition_participants (user_id, competition_id, joined_at)
        VALUES (?, ?, CURRENT_TIMESTAMP)
      `;
      
      await this.db.prepare(query).bind(userId, competitionId).run();
      return true;
    } catch (error) {
      console.error('Error joining competition:', error);
      return false;
    }
  }

  // Получить активные соревнования
  async getActiveCompetitions() {
    try {
      const query = `
        SELECT c.*, COUNT(cp.user_id) as participants_count
        FROM competitions c
        LEFT JOIN competition_participants cp ON c.id = cp.competition_id
        WHERE c.status = 'active' AND c.end_date > CURRENT_TIMESTAMP
        GROUP BY c.id
        ORDER BY c.start_date DESC
      `;
      
      const result = await this.db.prepare(query).all();
      return result.results;
    } catch (error) {
      console.error('Error getting active competitions:', error);
      return [];
    }
  }

  // Получить результаты соревнования
  async getCompetitionResults(competitionId) {
    try {
      const query = `
        SELECT u.first_name, u.username, cp.points, cp.lessons_completed,
               ROW_NUMBER() OVER (ORDER BY cp.points DESC) as rank
        FROM competition_participants cp
        JOIN users u ON cp.user_id = u.id
        WHERE cp.competition_id = ?
        ORDER BY cp.points DESC
      `;
      
      const result = await this.db.prepare(query).bind(competitionId).all();
      return result.results;
    } catch (error) {
      console.error('Error getting competition results:', error);
      return [];
    }
  }

  // Создать группу обучения
  async createStudyGroup(name, description, maxMembers, category) {
    try {
      const query = `
        INSERT INTO study_groups (name, description, max_members, category, created_at)
        VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
      `;
      
      const result = await this.db.prepare(query).bind(
        name, description, maxMembers, category
      ).run();
      
      return result.meta.last_row_id;
    } catch (error) {
      console.error('Error creating study group:', error);
      throw error;
    }
  }

  // Присоединиться к группе
  async joinStudyGroup(userId, groupId) {
    try {
      // Проверяем, не превышено ли количество участников
      const groupQuery = `
        SELECT g.max_members, COUNT(sgm.user_id) as current_members
        FROM study_groups g
        LEFT JOIN study_group_members sgm ON g.id = sgm.group_id
        WHERE g.id = ?
        GROUP BY g.id
      `;
      
      const group = await this.db.prepare(groupQuery).bind(groupId).first();
      
      if (group && group.current_members >= group.max_members) {
        throw new Error('Group is full');
      }
      
      const query = `
        INSERT INTO study_group_members (user_id, group_id, joined_at)
        VALUES (?, ?, CURRENT_TIMESTAMP)
      `;
      
      await this.db.prepare(query).bind(userId, groupId).run();
      return true;
    } catch (error) {
      console.error('Error joining study group:', error);
      throw error;
    }
  }

  // Получить группы пользователя
  async getUserStudyGroups(userId) {
    try {
      const query = `
        SELECT g.*, sgm.joined_at, COUNT(sgm2.user_id) as member_count
        FROM study_groups g
        JOIN study_group_members sgm ON g.id = sgm.group_id
        LEFT JOIN study_group_members sgm2 ON g.id = sgm2.group_id
        WHERE sgm.user_id = ?
        GROUP BY g.id
        ORDER BY sgm.joined_at DESC
      `;
      
      const result = await this.db.prepare(query).bind(userId).all();
      return result.results;
    } catch (error) {
      console.error('Error getting user study groups:', error);
      return [];
    }
  }

  // Получить доступные группы
  async getAvailableStudyGroups(category = null) {
    try {
      let query = `
        SELECT g.*, COUNT(sgm.user_id) as member_count,
               (g.max_members - COUNT(sgm.user_id)) as available_slots
        FROM study_groups g
        LEFT JOIN study_group_members sgm ON g.id = sgm.group_id
        WHERE g.max_members > (
          SELECT COUNT(*) FROM study_group_members WHERE group_id = g.id
        )
      `;
      
      const params = [];
      if (category) {
        query += ' AND g.category = ?';
        params.push(category);
      }
      
      query += ' GROUP BY g.id ORDER BY g.created_at DESC';
      
      const result = await this.db.prepare(query).bind(...params).all();
      return result.results;
    } catch (error) {
      console.error('Error getting available study groups:', error);
      return [];
    }
  }

  // Отправить сообщение в группу
  async sendGroupMessage(groupId, userId, message) {
    try {
      const query = `
        INSERT INTO group_messages (group_id, user_id, message, sent_at)
        VALUES (?, ?, ?, CURRENT_TIMESTAMP)
      `;
      
      await this.db.prepare(query).bind(groupId, userId, message).run();
      return true;
    } catch (error) {
      console.error('Error sending group message:', error);
      return false;
    }
  }

  // Получить сообщения группы
  async getGroupMessages(groupId, limit = 50) {
    try {
      const query = `
        SELECT gm.*, u.first_name, u.username
        FROM group_messages gm
        JOIN users u ON gm.user_id = u.id
        WHERE gm.group_id = ?
        ORDER BY gm.sent_at DESC
        LIMIT ?
      `;
      
      const result = await this.db.prepare(query).bind(groupId, limit).all();
      return result.results.reverse(); // Возвращаем в хронологическом порядке
    } catch (error) {
      console.error('Error getting group messages:', error);
      return [];
    }
  }

  // Получить друзей пользователя (по общим группам)
  async getUserFriends(userId) {
    try {
      const query = `
        SELECT DISTINCT u.id, u.first_name, u.username, u.level,
               COUNT(sgm2.group_id) as common_groups
        FROM users u
        JOIN study_group_members sgm1 ON u.id = sgm1.user_id
        JOIN study_group_members sgm2 ON sgm1.group_id = sgm2.group_id
        WHERE sgm2.user_id = ? AND u.id != ?
        GROUP BY u.id
        ORDER BY common_groups DESC, u.experience_points DESC
      `;
      
      const result = await this.db.prepare(query).bind(userId, userId).all();
      return result.results;
    } catch (error) {
      console.error('Error getting user friends:', error);
      return [];
    }
  }

  // Сравнить прогресс с другом
  async compareWithFriend(userId, friendId) {
    try {
      const query = `
        SELECT 
          u1.first_name as user_name, u1.level as user_level, u1.experience_points as user_xp,
          u2.first_name as friend_name, u2.level as friend_level, u2.experience_points as friend_xp,
          (SELECT COUNT(*) FROM progress WHERE user_id = u1.id) as user_lessons,
          (SELECT COUNT(*) FROM progress WHERE user_id = u2.id) as friend_lessons,
          (SELECT AVG(score) FROM progress WHERE user_id = u1.id) as user_avg_score,
          (SELECT AVG(score) FROM progress WHERE user_id = u2.id) as friend_avg_score
        FROM users u1, users u2
        WHERE u1.id = ? AND u2.id = ?
      `;
      
      const result = await this.db.prepare(query).bind(userId, friendId).first();
      return result;
    } catch (error) {
      console.error('Error comparing with friend:', error);
      return null;
    }
  }
}

export function createSocialService(db) {
  return new SocialService(db);
}
