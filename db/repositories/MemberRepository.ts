import { getDB } from '../database';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

export interface Member {
  id: string;
  member_number: string;
  full_name: string;
  phone: string;
  age: number | null;
  gender: string | null;
  photo_uri: string | null;
  plan_id: string | null;
  joining_date: string;
  next_due_date: string;
  status: 'active' | 'inactive';
  sync_status: string;
  updated_at: string;
  // joined from plans:
  plan_name?: string;
  plan_type?: string;
  plan_price?: number;
  duration_days?: number;
  // joined from payments:
  payment_status?: 'paid' | 'due' | 'overdue';
}

export const MemberRepository = {
  getAll: (): Member[] => {
    const db = getDB();
    return db.getAllSync(`
      SELECT m.*,
             p.name as plan_name, p.type as plan_type, p.price as plan_price, p.duration_days,
             COALESCE(
               CASE
                 WHEN date(m.next_due_date) < date('now') THEN 'overdue'
                 WHEN date(m.next_due_date) <= date('now', '+7 days') THEN 'due'
                 ELSE 'paid'
               END, 'due'
             ) as payment_status
      FROM members m
      LEFT JOIN plans p ON m.plan_id = p.id
      WHERE m.status = 'active'
      ORDER BY m.member_number ASC
    `) as Member[];
  },

  getById: (id: string): Member | null => {
    const db = getDB();
    return db.getFirstSync(`
      SELECT m.*,
             p.name as plan_name, p.type as plan_type, p.price as plan_price, p.duration_days,
             COALESCE(
               CASE
                 WHEN date(m.next_due_date) < date('now') THEN 'overdue'
                 WHEN date(m.next_due_date) <= date('now', '+7 days') THEN 'due'
                 ELSE 'paid'
               END, 'due'
             ) as payment_status
      FROM members m
      LEFT JOIN plans p ON m.plan_id = p.id
      WHERE m.id = ?
    `, [id]) as Member | null;
  },

  getCount: (): number => {
    const db = getDB();
    const result = db.getFirstSync(`SELECT COUNT(*) as count FROM members WHERE status='active'`) as { count: number };
    return result?.count ?? 0;
  },

  insert: (member: Omit<Member, 'id' | 'member_number' | 'sync_status' | 'updated_at'>): Member => {
    const db = getDB();
    const id = uuidv4();
    const now = new Date().toISOString();
    const count = MemberRepository.getCount();
    const member_number = `G${String(count + 1).padStart(3, '0')}`;
    db.runSync(
      `INSERT INTO members (id, member_number, full_name, phone, age, gender, photo_uri, plan_id, joining_date, next_due_date, status, sync_status, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)`,
      [id, member_number, member.full_name, member.phone, member.age ?? null, member.gender ?? null,
       member.photo_uri ?? null, member.plan_id ?? null, member.joining_date, member.next_due_date,
       member.status, now]
    );
    return MemberRepository.getById(id)!;
  },

  update: (id: string, data: Partial<Member>): void => {
    const db = getDB();
    const now = new Date().toISOString();
    db.runSync(
      `UPDATE members SET full_name=?, phone=?, age=?, gender=?, photo_uri=?, plan_id=?, joining_date=?, next_due_date=?, status=?, sync_status='pending', updated_at=? WHERE id=?`,
      [data.full_name!, data.phone!, data.age ?? null, data.gender ?? null, data.photo_uri ?? null,
       data.plan_id ?? null, data.joining_date!, data.next_due_date!, data.status ?? 'active', now, id]
    );
  },

  softDelete: (id: string): void => {
    const db = getDB();
    db.runSync(`UPDATE members SET status='inactive', sync_status='pending', updated_at=? WHERE id=?`, [
      new Date().toISOString(), id,
    ]);
  },

  search: (query: string): Member[] => {
    const db = getDB();
    const q = `%${query}%`;
    return db.getAllSync(`
      SELECT m.*, p.name as plan_name, p.type as plan_type, p.price as plan_price, p.duration_days,
             COALESCE(
               CASE
                 WHEN date(m.next_due_date) < date('now') THEN 'overdue'
                 WHEN date(m.next_due_date) <= date('now', '+7 days') THEN 'due'
                 ELSE 'paid'
               END, 'due'
             ) as payment_status
      FROM members m
      LEFT JOIN plans p ON m.plan_id = p.id
      WHERE m.status='active' AND (m.full_name LIKE ? OR m.phone LIKE ? OR m.member_number LIKE ?)
      ORDER BY m.member_number ASC
    `, [q, q, q]) as Member[];
  },
};
