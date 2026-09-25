import { getDB } from './database';
import { PlanRepository } from './repositories/PlanRepository';
import { MemberRepository } from './repositories/MemberRepository';
import { PaymentRepository } from './repositories/PaymentRepository';
import { AttendanceRepository } from './repositories/AttendanceRepository';
import { addDays } from '../utils/helpers';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

const SEED_KEY = 'seed_v2';

export const seedDatabase = async (): Promise<void> => {
  const db = getDB();
  const already = db.getFirstSync(`SELECT value FROM gym_settings WHERE key=?`, [SEED_KEY]) as { value: string } | null;
  if (already) return;

  // Clean slate reset on seed upgrade
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.removeItem('gym_paglu_plans');
      window.localStorage.removeItem('gym_paglu_members');
      window.localStorage.removeItem('gym_paglu_payments');
      window.localStorage.removeItem('gym_paglu_attendance');
      window.localStorage.removeItem('gym_paglu_settings');
      if ((db as any).members) (db as any).members = [];
      if ((db as any).plans) (db as any).plans = [];
      if ((db as any).payments) (db as any).payments = [];
      if ((db as any).attendance) (db as any).attendance = [];
      if ((db as any).gym_settings) (db as any).gym_settings = {};
    } catch (_) {}
  }
  try {
    db.runSync(`DELETE FROM attendance`);
    db.runSync(`DELETE FROM payments`);
    db.runSync(`DELETE FROM members`);
    db.runSync(`DELETE FROM plans`);
  } catch (_) {}

  const now = new Date().toISOString();

  // ── PLANS ──────────────────────────────────────────────────────────────────
  const plans = [
    { name: 'Monthly Membership',   type: 'membership',        duration_days: 30,  price: 3000,  is_active: 1 },
    { name: 'Quarterly Membership', type: 'membership',        duration_days: 90,  price: 8000,  is_active: 1 },
    { name: 'Annual Membership',    type: 'membership',        duration_days: 365, price: 28000, is_active: 1 },
    { name: 'PT Monthly',           type: 'personal_training', duration_days: 30,  price: 5000,  is_active: 1 },
    { name: 'PT Quarterly',         type: 'personal_training', duration_days: 90,  price: 13000, is_active: 1 },
  ] as const;

  const planIds: Record<string, string> = {};
  for (const p of plans) {
    const inserted = PlanRepository.insert(p as any);
    planIds[p.name] = inserted.id;
  }

  // ── MEMBERS ────────────────────────────────────────────────────────────────
  const dummyMembers = [
    { full_name: 'Ali Raza',      phone: '+923001234567', age: 22, gender: 'male',   plan: 'Monthly Membership',   joinDaysAgo: 60,  dueDaysFromNow: 15  },
    { full_name: 'Ayesha Khan',   phone: '+923001234568', age: 19, gender: 'female', plan: 'Monthly Membership',   joinDaysAgo: 45,  dueDaysFromNow: 5   },
    { full_name: 'Hassan Ahmed',  phone: '+923001234569', age: 26, gender: 'male',   plan: 'Quarterly Membership', joinDaysAgo: 100, dueDaysFromNow: -2  },
    { full_name: 'Fatima Noor',   phone: '+923001234570', age: 24, gender: 'female', plan: 'PT Monthly',           joinDaysAgo: 30,  dueDaysFromNow: 10  },
    { full_name: 'Usman Tariq',   phone: '+923001234571', age: 32, gender: 'male',   plan: 'Annual Membership',    joinDaysAgo: 200, dueDaysFromNow: -10 },
    { full_name: 'Sara Ali',      phone: '+923001234572', age: 27, gender: 'female', plan: 'Monthly Membership',   joinDaysAgo: 15,  dueDaysFromNow: 20  },
    { full_name: 'Kamran Ali',    phone: '+923001234573', age: 29, gender: 'male',   plan: 'PT Quarterly',         joinDaysAgo: 80,  dueDaysFromNow: 4   },
    { full_name: 'Nimra Shah',    phone: '+923001234574', age: 25, gender: 'female', plan: 'Monthly Membership',   joinDaysAgo: 20,  dueDaysFromNow: 7   },
    { full_name: 'Zeeshan Malik', phone: '+923001234575', age: 31, gender: 'male',   plan: 'Quarterly Membership', joinDaysAgo: 70,  dueDaysFromNow: 12  },
    { full_name: 'Hina Baig',     phone: '+923001234576', age: 23, gender: 'female', plan: 'PT Monthly',           joinDaysAgo: 25,  dueDaysFromNow: 3   },
    { full_name: 'Bilal Chaudhry',phone: '+923001234577', age: 28, gender: 'male',   plan: 'Monthly Membership',   joinDaysAgo: 55,  dueDaysFromNow: -5  },
    { full_name: 'Sana Qureshi',  phone: '+923001234578', age: 21, gender: 'female', plan: 'Annual Membership',    joinDaysAgo: 180, dueDaysFromNow: 25  },
    { full_name: 'Tariq Mehmood', phone: '+923001234579', age: 35, gender: 'male',   plan: 'Monthly Membership',   joinDaysAgo: 10,  dueDaysFromNow: 18  },
    { full_name: 'Rabia Aziz',    phone: '+923001234580', age: 20, gender: 'female', plan: 'PT Monthly',           joinDaysAgo: 28,  dueDaysFromNow: 2   },
    { full_name: 'Imran Akhtar',  phone: '+923001234581', age: 33, gender: 'male',   plan: 'Quarterly Membership', joinDaysAgo: 90,  dueDaysFromNow: -8  },
    // 3 New Members with DUE payment:
    { full_name: 'Hamza Farooq',  phone: '+923001234582', age: 24, gender: 'male',   plan: 'Monthly Membership',   joinDaysAgo: 27,  dueDaysFromNow: 3   },
    { full_name: 'Mahnoor Javed', phone: '+923001234583', age: 22, gender: 'female', plan: 'PT Monthly',           joinDaysAgo: 26,  dueDaysFromNow: 4   },
    { full_name: 'Danish Rehman', phone: '+923001234584', age: 29, gender: 'male',   plan: 'Quarterly Membership', joinDaysAgo: 85,  dueDaysFromNow: 5   },
    // 3 New Members with OVERDUE payment:
    { full_name: 'Omer Siddiqui', phone: '+923001234585', age: 30, gender: 'male',   plan: 'Monthly Membership',   joinDaysAgo: 34,  dueDaysFromNow: -4  },
    { full_name: 'Komal Waqar',   phone: '+923001234586', age: 25, gender: 'female', plan: 'PT Monthly',           joinDaysAgo: 37,  dueDaysFromNow: -7  },
    { full_name: 'Waleed Hashmi', phone: '+923001234587', age: 27, gender: 'male',   plan: 'Annual Membership',    joinDaysAgo: 380, dueDaysFromNow: -15 },
  ];

  const today = new Date();
  const memberIds: string[] = [];

  for (const m of dummyMembers) {
    const joiningDate = new Date(today);
    joiningDate.setDate(today.getDate() - m.joinDaysAgo);
    const nextDueDate = new Date(today);
    nextDueDate.setDate(today.getDate() + m.dueDaysFromNow);

    const inserted = MemberRepository.insert({
      full_name: m.full_name,
      phone: m.phone,
      age: m.age,
      gender: m.gender,
      photo_uri: null,
      plan_id: planIds[m.plan],
      joining_date: joiningDate.toISOString().split('T')[0],
      next_due_date: nextDueDate.toISOString().split('T')[0],
      status: 'active',
    });
    memberIds.push(inserted.id);

    // Determine payment status
    const planObj = PlanRepository.getById(planIds[m.plan])!;
    let paymentStatus: 'paid' | 'due' | 'overdue';
    if (m.dueDaysFromNow < 0) paymentStatus = 'overdue';
    else if (m.dueDaysFromNow <= 7) paymentStatus = 'due';
    else paymentStatus = 'paid';

    // Current period payment
    const paidAt = paymentStatus === 'paid' ? new Date(joiningDate).toISOString() : null;
    PaymentRepository.insert({
      member_id: inserted.id,
      amount: planObj.price,
      paid_at: paidAt,
      due_date: nextDueDate.toISOString().split('T')[0],
      payment_status: paymentStatus,
      payment_method: 'cash',
      notes: null,
    });

    // Past payment (previous period) — always paid
    const prevDueDate = new Date(joiningDate);
    prevDueDate.setDate(joiningDate.getDate() - planObj.duration_days);
    if (m.joinDaysAgo > planObj.duration_days) {
      const prevPaidAt = new Date(prevDueDate);
      prevPaidAt.setDate(prevDueDate.getDate() - 5);
      PaymentRepository.insert({
        member_id: inserted.id,
        amount: planObj.price,
        paid_at: prevPaidAt.toISOString(),
        due_date: prevDueDate.toISOString().split('T')[0],
        payment_status: 'paid',
        payment_method: 'cash',
        notes: null,
      });
    }
  }

  // ── ATTENDANCE (last 30 days) ───────────────────────────────────────────────
  for (let i = 0; i < memberIds.length; i++) {
    const memberId = memberIds[i];
    for (let day = 29; day >= 0; day--) {
      // ~70% attendance rate, skip some days randomly by index+day pattern
      if ((i + day) % 3 === 0) continue;
      const d = new Date(today);
      d.setDate(today.getDate() - day);
      // Skip future today's manual entries (we want today to be fresh)
      if (day === 0 && i > 7) continue;
      const checkInHour = 6 + Math.floor((i * 7 + day * 3) % 10);
      d.setHours(checkInHour, Math.floor((i * 13 + day * 7) % 60), 0, 0);
      const attId = uuidv4();
      db.runSync(
        `INSERT OR IGNORE INTO attendance (id, member_id, check_in_at, method, sync_status) VALUES (?, ?, ?, ?, 'synced')`,
        [attId, memberId, d.toISOString(), day % 4 === 0 ? 'biometric' : 'manual']
      );
    }
  }

  // ── GYM SETTINGS ────────────────────────────────────────────────────────────
  db.runSync(`INSERT OR IGNORE INTO gym_settings (key, value) VALUES ('gym_name', '"GYM PAGLU"')`);
  db.runSync(`INSERT OR IGNORE INTO gym_settings (key, value) VALUES ('owner_name', '"Gym Owner"')`);
  db.runSync(`INSERT OR IGNORE INTO gym_settings (key, value) VALUES ('currency', '"PKR"')`);
  db.runSync(`INSERT OR IGNORE INTO gym_settings (key, value) VALUES (?, '1')`, [SEED_KEY]);

  console.log('[Seed] Database seeded successfully ✓');
};
