import { db_findone, db_insert } from '../database';

/**
 * make a entry to the database users
 * @param {object} user
 * @returns {bool} boolean
 */

export async function insert_user(user) {
  const data = {
    ...user,
  };

  try {
    const result = await db_findone('users', { id: user.id });
    if (result === false) {
      db_insert('users', data);
      return true;
    } else {
      return false;
    }
  } catch (e) {
    console.error(e);
    return false;
  }
}
