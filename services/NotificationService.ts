import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

export interface AppNotification {
  id: string;
  category: 'payment' | 'attendance' | 'system' | 'member';
  title: string;
  message: string;
  created_at: string;
  read: boolean;
}

const STORAGE_KEY = 'gym_paglu_dynamic_notifications';

const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'seed-1',
    category: 'payment',
    title: 'Payment Received',
    message: 'Hassan Ahmed paid PKR 3,000 via Cash',
    created_at: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    read: false,
  },
  {
    id: 'seed-2',
    category: 'payment',
    title: 'Overdue Fee Notice',
    message: 'Usman Tariq is 2 days overdue (PKR 3,000)',
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    read: false,
  },
  {
    id: 'seed-3',
    category: 'member',
    title: 'New Member Enrolled',
    message: 'Sana Khan joined Monthly Standard Plan',
    created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    read: true,
  },
  {
    id: 'seed-4',
    category: 'attendance',
    title: 'Attendance Check-In',
    message: 'Ali Raza checked in via Biometric Scanner',
    created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    read: true,
  },
  {
    id: 'seed-5',
    category: 'payment',
    title: 'Upcoming Fee Reminder',
    message: 'Upcoming dues detected for enrolled gym members',
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    read: true,
  },
  {
    id: 'seed-6',
    category: 'system',
    title: 'Biometric System Connected',
    message: 'ZK-Teco device synced successfully on LAN',
    created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    read: true,
  },
];

class NotificationServiceManager {
  private inMemoryList: AppNotification[] = [];

  constructor() {
    this.load();
  }

  private load(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (raw) {
          this.inMemoryList = JSON.parse(raw);
          return;
        }
      } catch (e) {
        console.warn('[NotificationService] Load error:', e);
      }
    }
    this.inMemoryList = [...INITIAL_NOTIFICATIONS];
    this.persist();
  }

  private persist(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.inMemoryList));
      } catch (e) {
        console.warn('[NotificationService] Persist error:', e);
      }
    }
  }

  getAll(): AppNotification[] {
    this.load();
    return [...this.inMemoryList].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  add(item: {
    category: 'payment' | 'attendance' | 'system' | 'member';
    title: string;
    message: string;
  }): AppNotification {
    this.load();
    const newNotif: AppNotification = {
      id: uuidv4(),
      category: item.category,
      title: item.title,
      message: item.message,
      created_at: new Date().toISOString(),
      read: false,
    };
    this.inMemoryList.unshift(newNotif);
    this.persist();
    return newNotif;
  }

  markAsRead(id: string): void {
    this.load();
    const target = this.inMemoryList.find(n => n.id === id);
    if (target) {
      target.read = true;
      this.persist();
    }
  }

  markAllAsRead(): void {
    this.load();
    this.inMemoryList.forEach(n => {
      n.read = true;
    });
    this.persist();
  }

  clearAll(): void {
    this.inMemoryList = [];
    this.persist();
  }

  getUnreadCount(): number {
    this.load();
    return this.inMemoryList.filter(n => !n.read).length;
  }
}

export const NotificationService = new NotificationServiceManager();
