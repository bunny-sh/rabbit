import { time } from 'console';

export function format_message(m) {
  try {
    if (m.member) {
      const message = {
        TYPE: 'client',
        message_info: {
          content: m.content,
          is_tts: m.tts,
          timestamp: new Date().toLocaleString(),
          attachments: m.attachments,
          is_pinned: m.pinned,
          mentions: m.mentions,
          mention_everyone: m.mention_everyone,
          referenced_message: m.referenced_message,
          id: m.id,
        },
        user_info: {
          ...m.author,
        },
        member_info: {
          ...m.member,
        },
        channel_info: {
          id: m.channel_id,
        },
        guild_info: {
          id: m.guild_id,
        },
      };
      return message;
    } else {
      return { message: 'invalid' };
    }
  } catch (e) {
    console.error(e);
    return { message: 'invalid' };
  }
}
