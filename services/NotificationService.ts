import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { MemberRepository } from '../db/repositories/MemberRepository';
import { PaymentRepository } from '../db/repositories/PaymentRepository';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
    priority: Notifications.AndroidNotificationPriority.HIGH,
  }),
});

export const NotificationService = {
  requestPermissions: async (): Promise<boolean> => {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      return finalStatus === 'granted';
    } catch (e) {
      console.warn('Failed to get notification permissions:', e);
      return false;
    }
  },

  scheduleDuePaymentReminders: async (): Promise<number> => {
    try {
      const granted = await NotificationService.requestPermissions();
      if (!granted) return 0;

      // Find members with fees due soon (within 3 days)
      const duePayments = PaymentRepository.getByStatus('due');
      let scheduledCount = 0;

      for (const payment of duePayments) {
        if (!payment.due_date) continue;
        const dueDate = new Date(payment.due_date);
        const now = new Date();
        const diffTime = dueDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays >= 0 && diffDays <= 3) {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: 'Fee Reminder 🔔',
              body: `${payment.member_name ?? 'Member'} fee of PKR ${payment.amount.toLocaleString()} is due in ${diffDays === 0 ? 'today' : `${diffDays} days`}!`,
              data: { memberId: payment.member_id, paymentId: payment.id },
            },
            trigger: null, // send immediately or trigger at scheduled time
          });
          scheduledCount++;
        }
      }

      return scheduledCount;
    } catch (e) {
      console.warn('Error scheduling reminders:', e);
      return 0;
    }
  },

  sendImmediateNotification: async (title: string, body: string) => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: true,
        },
        trigger: null,
      });
    } catch (e) {
      console.warn('Error sending notification:', e);
    }
  },
};
