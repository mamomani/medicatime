import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { router } from 'expo-router';
import { Medication } from '../data/models';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const setupNotificationListener = () => {
  const subscription = Notifications.addNotificationResponseReceivedListener(
    (response) => {
      const data = response.notification.request.content.data;
      const medicationId = data?.medicationId;
      const time = data?.time;

      if (medicationId && time) {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const dateString = `${year}-${month}-${day}`;

        const logId = `${medicationId}-${time}-${dateString}`;

        setTimeout(() => {
          try {
            router.push(`/edit-log?logId=${logId}`);
          } catch (error) {
            console.error('Navigation error:', error);
          }
        }, 100);
      }
    }
  );

  return subscription;
};

export const requestNotificationPermissions = async (): Promise<boolean> => {
  if (Platform.OS === 'web') {
    return true;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  return finalStatus === 'granted';
};

const getLocalDateString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const scheduleNotificationForMedication = async (
  medication: Medication
): Promise<void> => {
  if (Platform.OS === 'web') {
    return;
  }

  await cancelNotificationsForMedication(medication.id);

  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) {
    return;
  }

  for (const time of medication.times) {
    const [hours, minutes] = time.split(':').map(Number);

    if (Platform.OS === 'android') {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Medication Reminder',
          body: `Time to take ${medication.name} - ${medication.dose}`,
          data: {
            medicationId: medication.id,
            time: time,
            screen: 'EditLog',
          },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: hours,
          minute: minutes,
        },
      });
    } else {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Medication Reminder',
          body: `Time to take ${medication.name} - ${medication.dose}`,
          data: {
            medicationId: medication.id,
            time: time,
            screen: 'EditLog',
          },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: hours,
          minute: minutes,
        },
      });
    }
  }
};

export const cancelNotificationsForMedication = async (
  medicationId: string
): Promise<void> => {
  if (Platform.OS === 'web') {
    return;
  }

  const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
  const notificationsToCancel = scheduledNotifications.filter(
    (notification) => notification.content.data?.medicationId === medicationId
  );

  for (const notification of notificationsToCancel) {
    await Notifications.cancelScheduledNotificationAsync(notification.identifier);
  }
};

export const cancelAllNotifications = async (): Promise<void> => {
  if (Platform.OS === 'web') {
    return;
  }

  await Notifications.cancelAllScheduledNotificationsAsync();
};
