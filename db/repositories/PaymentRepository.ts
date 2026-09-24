import { getDB } from '../database';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

export interface Payment {
  id: string;
  member_id: string;
  amount: number;
  paid_at: string | null;
  due_date: string;
  payment_status: 'paid' | 'due' | 'overdue';
  payment_method: string;
  notes: string | null;
  sync_status: string;
  updated_at: string;
  // joined:
  member_name?: string;
  member_number?: string;
  photo_uri?: string;
}

export const PaymentRepository = {
  getByMember: (memberId: string): Payment[] => {
    const db = getDB();
    return db.getAllSync(
      `SELECT * FROM payments WHERE member_id = ? ORDER BY due_date DESC`,
      [memberId]
    ) as Payment[];
  },

  getAll: (): Payment[] => {
    const db = getDB();
    return db.getAllSync(`
      SELECT pay.*, m.full_name as member_name, m.member_number, m.photo_uri
      FROM payments pay
      JOIN members m ON pay.member_id = m.id
      WHERE m.status = 'active'
      ORDER BY pay.due_date ASC
    `) as Payment[];
  },

  getByStatus: (status: 'paid' | 'due' | 'overdue'): Payment[] => {
    const db = getDB();
    return db.getAllSync(`
      SELECT pay.*, m.full_name as member_name, m.member_number, m.photo_uri
      FROM payments pay
      JOIN members m ON pay.member_id = m.id
      WHERE pay.payment_status = ? AND m.status = 'active'
      ORDER BY pay.due_date ASC
    `, [status]) as Payment[];
  },

  getMonthlyRevenue: (): { month: string; total: number }[] => {
    const db = getDB();
    return db.getAllSync(`
      SELECT strftime('%Y-%m', paid_at) as month, SUM(amount) as total
      FROM payments
      WHERE payment_status = 'paid' AND paid_at IS NOT NULL
        AND paid_at >= date('now', '-6 months')
      GROUP BY month
      ORDER BY month ASC
    `) as { month: string; total: number }[];
  },

  getCurrentMonthRevenue: (): number => {
    const db = getDB();
    const result = db.getFirstSync(`
      SELECT COALESCE(SUM(amount), 0) as total FROM payments
      WHERE payment_status='paid'
        AND strftime('%Y-%m', paid_at) = strftime('%Y-%m', 'now')
    `) as { total: number };
    return result?.total ?? 0;
  },

  getRevenueByType: (): { type: string; total: number }[] => {
    const db = getDB();
    return db.getAllSync(`
      SELECT p.type, COALESCE(SUM(pay.amount), 0) as total
      FROM payments pay
      JOIN members m ON pay.member_id = m.id
      JOIN plans p ON m.plan_id = p.id
      WHERE pay.payment_status='paid'
        AND strftime('%Y-%m', pay.paid_at) = strftime('%Y-%m', 'now')
      GROUP BY p.type
    `) as { type: string; total: number }[];
  },

  getTotalPaidByMember: (memberId: string): number => {
    const db = getDB();
    const result = db.getFirstSync(
      `SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE member_id=? AND payment_status='paid'`,
      [memberId]
    ) as { total: number };
    return result?.total ?? 0;
  },

  markPaid: (paymentId: string, method: string = 'cash'): void => {
    const db = getDB();
    const now = new Date().toISOString();

    // 1. Fetch current payment info
    const payment = db.getFirstSync(`SELECT * FROM payments WHERE id=?`, [paymentId]) as Payment | null;

    // 2. Mark payment as paid
    db.runSync(
      `UPDATE payments SET payment_status='paid', paid_at=?, payment_method=?, sync_status='pending', updated_at=? WHERE id=?`,
      [now, method, now, paymentId]
    );

    // 3. Update member's next due date so payment_status switches to 'paid'
    if (payment && payment.member_id) {
      const member = db.getFirstSync(
        `SELECT m.*, p.duration_days FROM members m LEFT JOIN plans p ON m.plan_id = p.id WHERE m.id=?`,
        [payment.member_id]
      ) as any;

      if (member) {
        const duration = member.duration_days || 30;
        const nextDate = new Date();
        nextDate.setDate(nextDate.getDate() + duration);
        const nextDueDateStr = nextDate.toISOString().split('T')[0];

        db.runSync(
          `UPDATE members SET next_due_date=?, sync_status='pending', updated_at=? WHERE id=?`,
          [nextDueDateStr, now, member.id]
        );
      }
    }
  },

  insert: (payment: Omit<Payment, 'id' | 'sync_status' | 'updated_at'>): void => {
    const db = getDB();
    const id = uuidv4();
    const now = new Date().toISOString();
    db.runSync(
      `INSERT INTO payments (id, member_id, amount, paid_at, due_date, payment_status, payment_method, notes, sync_status, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)`,
      [id, payment.member_id, payment.amount, payment.paid_at ?? null,
       payment.due_date, payment.payment_status, payment.payment_method ?? 'cash',
       payment.notes ?? null, now]
    );
  },

  refreshOverdueStatuses: (): void => {
    const db = getDB();
    db.runSync(`
      UPDATE payments SET payment_status='overdue', sync_status='pending', updated_at=datetime('now')
      WHERE payment_status='due' AND date(due_date) < date('now')
    `);
  },
};
