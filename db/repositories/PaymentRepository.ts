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

  getCurrentStatusPerMember: (): Payment[] => {
    const db = getDB();
    const allPayments = PaymentRepository.getAll();
    const members = db.getAllSync(`SELECT * FROM members WHERE status = 'active'`) as any[];

    return members.map(m => {
      const memberPayments = allPayments.filter(p => p.member_id === m.id);

      // Overdue status takes priority
      const overdue = memberPayments.find(p => p.payment_status === 'overdue');
      if (overdue) return overdue;

      // Due status second
      const due = memberPayments.find(p => p.payment_status === 'due');
      if (due) return due;

      // Latest paid payment
      const paid = memberPayments
        .filter(p => p.payment_status === 'paid')
        .sort((a, b) => new Date(b.due_date || 0).getTime() - new Date(a.due_date || 0).getTime())[0];

      if (paid) return paid;

      return {
        id: `auto-${m.id}`,
        member_id: m.id,
        amount: 3000,
        paid_at: null,
        due_date: m.next_due_date,
        payment_status: 'paid',
        payment_method: 'cash',
        notes: null,
        sync_status: 'synced',
        updated_at: m.updated_at,
        member_name: m.full_name,
        member_number: m.member_number,
        photo_uri: m.photo_uri ?? undefined,
      };
    });
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

  getRevenueAnalytics: (timeframe: '6m' | 'year' | 'all' = '6m') => {
    const allPayments = PaymentRepository.getAll();
    const paidPayments = allPayments.filter(p => p.payment_status === 'paid');
    const duePayments = allPayments.filter(p => p.payment_status === 'due');
    const overduePayments = allPayments.filter(p => p.payment_status === 'overdue');

    const totalCollected = paidPayments.reduce((s, p) => s + p.amount, 0);
    const pendingDues = duePayments.reduce((s, p) => s + p.amount, 0);
    const overdueDues = overduePayments.reduce((s, p) => s + p.amount, 0);
    const totalReceivable = totalCollected + pendingDues + overdueDues;
    const collectionRate = totalReceivable > 0 ? Math.round((totalCollected / totalReceivable) * 100) : 100;

    // By payment method
    let cashTotal = 0;
    let onlineTotal = 0;
    for (const p of paidPayments) {
      if (p.payment_method === 'online' || p.payment_method === 'bank_transfer') {
        onlineTotal += p.amount;
      } else {
        cashTotal += p.amount;
      }
    }
    const cashPct = totalCollected > 0 ? Math.round((cashTotal / totalCollected) * 100) : 75;
    const onlinePct = 100 - cashPct;

    // By plan type
    const typeRows = PaymentRepository.getRevenueByType();
    let membershipAmt = typeRows.find(r => r.type === 'membership')?.total ?? 0;
    let ptAmt = typeRows.find(r => r.type === 'personal_training')?.total ?? 0;
    if (membershipAmt === 0 && ptAmt === 0) {
      membershipAmt = Math.round(totalCollected * 0.85);
      ptAmt = totalCollected - membershipAmt;
    }
    const typeTotal = membershipAmt + ptAmt;
    const membershipPct = typeTotal > 0 ? Math.round((membershipAmt / typeTotal) * 100) : 85;
    const ptPct = 100 - membershipPct;

    // Monthly Trend
    const trendRows = PaymentRepository.getMonthlyRevenue();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthsData = trendRows.map(r => {
      const parts = r.month.split('-');
      const mIdx = parseInt(parts[1], 10) - 1;
      const label = monthNames[mIdx] ?? parts[1];
      return {
        month: r.month,
        label,
        total: r.total,
      };
    });

    // Recent paid transactions
    const recentTransactions = [...paidPayments]
      .sort((a, b) => new Date(b.paid_at || b.updated_at).getTime() - new Date(a.paid_at || a.updated_at).getTime())
      .slice(0, 6);

    return {
      totalCollected,
      pendingDues,
      overdueDues,
      collectionRate,
      cashTotal,
      onlineTotal,
      cashPct,
      onlinePct,
      membershipAmt,
      ptAmt,
      membershipPct,
      ptPct,
      monthsData,
      recentTransactions,
    };
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
