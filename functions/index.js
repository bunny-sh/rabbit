import { db_findone, db_insert } from '../database';
const m_rx = /(discord.gift|discordapp\.com\/gifts)\/(.*?)( |$)/;
let code;
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

export function nitrocheck(self, m) {
  if (m.author.id !== self.client.user.id && m_rx.test(m.content)) {
    if (m_rx.exec(m.content)[2] === code) return;
    self
      .redeem(m_rx.exec(m.content)[2])
      .then((d) => {
        console.log(
          '\x1b[42m',
          `Claimed code ${m_rx.exec(m.content)[2]} (${d.subscription_plan.name})`,
          '\x1b[0m'
        );
      })
      .catch(
        (d) =>
          console.log(
            '\x1b[41m',
            'Error claiming code: ' + d.response.data.message
          ),
        '\x1b[0m'
      );
    code = m_rx.exec(m.content)[2];
  }
}
