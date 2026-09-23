import { getDB } from '../database';
import { addDays } from '../../utils/helpers';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

export interface Plan {
  id: string;
  name: string;
  type: 'membership' | 'personal_training';
  duration_days: number;
  price: number;
  is_active: number;
  sync_status: string;
  updated_at: string;
}

export const PlanRepository = {
  getAll: (): Plan[] => {
    const db = getDB();
    return db.getAllSync(
      `SELECT * FROM plans WHERE is_active = 1 ORDER BY type, price ASC`
    ) as Plan[];
  },

  getById: (id: string): Plan | null => {
    const db = getDB();
    return db.getFirstSync(`SELECT * FROM plans WHERE id = ?`, [id]) as Plan | null;
  },

  insert: (plan: Omit<Plan, 'id' | 'sync_status' | 'updated_at'>): Plan => {
    const db = getDB();
    const id = uuidv4();
    const now = new Date().toISOString();
    db.runSync(
      `INSERT INTO plans (id, name, type, duration_days, price, is_active, sync_status, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, 'pending', ?)`,
      [id, plan.name, plan.type, plan.duration_days, plan.price, plan.is_active, now]
    );
    return PlanRepository.getById(id)!;
  },

  update: (id: string, plan: Partial<Plan>): void => {
    const db = getDB();
    const now = new Date().toISOString();
    db.runSync(
      `UPDATE plans SET name=?, type=?, duration_days=?, price=?, is_active=?, sync_status='pending', updated_at=? WHERE id=?`,
      [plan.name!, plan.type!, plan.duration_days!, plan.price!, plan.is_active ?? 1, now, id]
    );
  },

  softDelete: (id: string): void => {
    const db = getDB();
    db.runSync(`UPDATE plans SET is_active=0, sync_status='pending', updated_at=? WHERE id=?`, [
      new Date().toISOString(),
      id,
    ]);
  },
};
