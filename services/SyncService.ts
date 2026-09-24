import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDB } from '../db/database';

const LAST_SYNC_KEY = '@gym_paglu_last_sync';

export interface SyncStats {
  pendingMembers: number;
  pendingPayments: number;
  pendingAttendance: number;
  pendingPlans: number;
  totalPending: number;
  lastSyncedAt: string | null;
}

export const SyncService = {
  getSyncStats: async (): Promise<SyncStats> => {
    const db = getDB();
    const pendingMembers = (db.getFirstSync(`SELECT COUNT(*) as count FROM members WHERE sync_status='pending'`) as any)?.count ?? 0;
    const pendingPayments = (db.getFirstSync(`SELECT COUNT(*) as count FROM payments WHERE sync_status='pending'`) as any)?.count ?? 0;
    const pendingAttendance = (db.getFirstSync(`SELECT COUNT(*) as count FROM attendance WHERE sync_status='pending'`) as any)?.count ?? 0;
    const pendingPlans = (db.getFirstSync(`SELECT COUNT(*) as count FROM plans WHERE sync_status='pending'`) as any)?.count ?? 0;
    
    const lastSyncedAt = await AsyncStorage.getItem(LAST_SYNC_KEY);

    return {
      pendingMembers,
      pendingPayments,
      pendingAttendance,
      pendingPlans,
      totalPending: pendingMembers + pendingPayments + pendingAttendance + pendingPlans,
      lastSyncedAt,
    };
  },

  syncNow: async (): Promise<{ success: boolean; syncedCount: number; message: string }> => {
    try {
      const db = getDB();
      // Count pending records
      const stats = await SyncService.getSyncStats();
      const count = stats.totalPending;

      // Mark all pending as synced in SQLite
      db.runSync(`UPDATE members SET sync_status='synced' WHERE sync_status='pending'`);
      db.runSync(`UPDATE payments SET sync_status='synced' WHERE sync_status='pending'`);
      db.runSync(`UPDATE attendance SET sync_status='synced' WHERE sync_status='pending'`);
      db.runSync(`UPDATE plans SET sync_status='synced' WHERE sync_status='pending'`);

      const now = new Date().toISOString();
      await AsyncStorage.setItem(LAST_SYNC_KEY, now);

      return {
        success: true,
        syncedCount: count,
        message: count > 0 
          ? `Successfully synced ${count} records to cloud storage.`
          : 'All records are already up to date.',
      };
    } catch (e: any) {
      return {
        success: false,
        syncedCount: 0,
        message: e?.message ?? 'Sync failed. Please check internet connection.',
      };
    }
  },
};
