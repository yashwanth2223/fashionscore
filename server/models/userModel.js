import bcrypt from 'bcrypt';
import { pool } from '../db/db.js';

class User {
  // Register a new user
  static async register(email, password, name) {
    try {
      // Hash the password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      
      // Insert the user into the database
      const [result] = await pool.query(
        'INSERT INTO users (email, password, name) VALUES (?, ?, ?)',
        [email, hashedPassword, name]
      );
      
      return { id: result.insertId, email, name };
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }
  
  // Login user
  static async login(email, password) {
    try {
      // Get the user from the database
      const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
      
      if (users.length === 0) {
        return null; // User not found
      }
      
      const user = users[0];
      
      // Compare the passwords
      const passwordMatch = await bcrypt.compare(password, user.password);
      
      if (!passwordMatch) {
        return null; // Password does not match
      }
      
      // Return user data without password
      const { password: _, ...userData } = user;
      return userData;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }
  
  // Get user by ID
  static async getById(id) {
    try {
      const [users] = await pool.query('SELECT id, email, name, created_at FROM users WHERE id = ?', [id]);
      
      if (users.length === 0) {
        return null;
      }
      
      return users[0];
    } catch (error) {
      console.error('Get user by ID error:', error);
      throw error;
    }
  }
  
  // Get user upload count
  static async getUploadCount(userId) {
    try {
      const [result] = await pool.query(
        'SELECT COUNT(*) as count FROM outfit_uploads WHERE user_id = ?',
        [userId]
      );
      return result[0].count;
    } catch (error) {
      console.error('Get upload count error:', error);
      throw error;
    }
  }
  
  // Store outfit upload for a user
  static async saveOutfitUpload(userId, imagePath, score, feedback) {
    try {
      const [result] = await pool.query(
        'INSERT INTO outfit_uploads (user_id, image_path, score, feedback) VALUES (?, ?, ?, ?)',
        [userId, imagePath, score, feedback]
      );
      return result.insertId;
    } catch (error) {
      console.error('Save outfit upload error:', error);
      throw error;
    }
  }
  
  // Get outfit uploads for a user
  static async getUserOutfits(userId) {
    try {
      const [outfits] = await pool.query(
        'SELECT * FROM outfit_uploads WHERE user_id = ? ORDER BY created_at DESC',
        [userId]
      );
      return outfits;
    } catch (error) {
      console.error('Get user outfits error:', error);
      throw error;
    }
  }
  
  // Delete user account and store data in deleted_accounts_data
  static async deleteAccount(userId, reason = '') {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      // Get user data before deletion
      const [users] = await connection.query(
        'SELECT * FROM users WHERE id = ?',
        [userId]
      );
      
      if (users.length === 0) {
        throw new Error('User not found');
      }
      
      const user = users[0];
      
      // Get outfit count
      const [countResult] = await connection.query(
        'SELECT COUNT(*) as count FROM outfit_uploads WHERE user_id = ?',
        [userId]
      );
      const outfitCount = countResult[0].count;
      
      // Store deleted account data
      await connection.query(
        `INSERT INTO deleted_accounts_data 
         (email, name, account_created_at, outfit_count, deletion_reason) 
         VALUES (?, ?, ?, ?, ?)`,
        [user.email, user.name, user.created_at, outfitCount, reason]
      );
      
      // Delete the user (outfit_uploads will be deleted via CASCADE)
      await connection.query('DELETE FROM users WHERE id = ?', [userId]);
      
      await connection.commit();
      return true;
      
    } catch (error) {
      await connection.rollback();
      console.error('Delete account error:', error);
      throw error;
    } finally {
      connection.release();
    }
  }
  
  // Delete a single outfit by ID and ensure it belongs to the user
  static async deleteOutfit(outfitId, userId) {
    try {
      const [result] = await pool.query(
        'DELETE FROM outfit_uploads WHERE id = ? AND user_id = ?',
        [outfitId, userId]
      );
      
      if (result.affectedRows === 0) {
        throw new Error('Outfit not found or does not belong to this user');
      }
      
      return true;
    } catch (error) {
      console.error('Delete outfit error:', error);
      throw error;
    }
  }
  
  // Get a single outfit by ID and ensure it belongs to the user
  static async getSingleOutfit(outfitId, userId) {
    try {
      const [outfits] = await pool.query(
        'SELECT * FROM outfit_uploads WHERE id = ? AND user_id = ?',
        [outfitId, userId]
      );
      
      if (outfits.length === 0) {
        return null;
      }
      
      return outfits[0];
    } catch (error) {
      console.error('Get single outfit error:', error);
      throw error;
    }
  }
}

export default User; 