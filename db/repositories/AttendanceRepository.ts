import { getDB } from '../database';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

export interface Attendance {
  id: string;
  member_id: string;
  check_in_at: string;
  method: 'biometric' | 'manual';
  sync_status: string;
  // joined:
  member_name?: string;
  member_number?: string;
  photo_uri?: string;
}

export const AttendanceRepository = {
  getTodayCount: (): number => {
    const db = getDB();
    const result = db.getFirstSync(`
      SELECT COUNT(*) as count FROM attendance
      WHERE date(check_in_at) = date('now')
    `) as { count: number };
    return result?.count ?? 0;
  },

  getToday: (): Attendance[] => {
    const db = getDB();
    return db.getAllSync(`
      SELECT a.*, m.full_name as member_name, m.member_number, m.photo_uri
      FROM attendance a
      JOIN members m ON a.member_id = m.id
      WHERE date(a.check_in_at) = date('now')
      ORDER BY a.check_in_at DESC
    `) as Attendance[];
  },

  getByMember: (memberId: string): Attendance[] => {
    const db = getDB();
    return db.getAllSync(
      `SELECT * FROM attendance WHERE member_id = ? ORDER BY check_in_at DESC LIMIT 60`,
      [memberId]
    ) as Attendance[];
  },

  hasCheckedInToday: (memberId: string): boolean => {
    const db = getDB();
    const result = db.getFirstSync(`
      SELECT COUNT(*) as count FROM attendance
      WHERE member_id = ? AND date(check_in_at) = date('now')
    `, [memberId]) as { count: number };
    return (result?.count ?? 0) > 0;
  },

  markAttendance: (memberId: string, method: 'biometric' | 'manual'): Attendance => {
    const db = getDB();
    const id = uuidv4();
    const now = new Date().toISOString();
    db.runSync(
      `INSERT INTO attendance (id, member_id, check_in_at, method, sync_status)
       VALUES (?, ?, ?, ?, 'pending')`,
      [id, memberId, now, method]
    );
    return db.getFirstSync(
      `SELECT a.*, m.full_name as member_name, m.member_number, m.photo_uri
       FROM attendance a JOIN members m ON a.member_id = m.id
       WHERE a.id = ?`,
      [id]
    ) as Attendance;
  },

  getMonthlyByMember: (memberId: string): { date: string; count: number }[] => {
    const db = getDB();
    return db.getAllSync(`
      SELECT date(check_in_at) as date, COUNT(*) as count
      FROM attendance WHERE member_id = ?
        AND check_in_at >= date('now', '-30 days')
      GROUP BY date(check_in_at)
    `, [memberId]) as { date: string; count: number }[];
  },
};
