import AsyncStorage from '@react-native-async-storage/async-storage';
import { Medication, MedicationLog, Profile } from '../data/models';

const MEDICATIONS_KEY = '@medicatime_medications';
const LOGS_KEY = '@medicatime_logs';
const PROFILES_KEY = '@medicatime_profiles';
const ACTIVE_PROFILE_KEY = '@medicatime_active_profile';

export const getProfiles = async (): Promise<Profile[]> => {
  try {
    const data = await AsyncStorage.getItem(PROFILES_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting profiles:', error);
    return [];
  }
};

export const saveProfiles = async (profiles: Profile[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
  } catch (error) {
    console.error('Error saving profiles:', error);
  }
};

export const addProfile = async (profile: Profile): Promise<void> => {
  const profiles = await getProfiles();
  profiles.push(profile);
  await saveProfiles(profiles);
};

export const updateProfile = async (profile: Profile): Promise<void> => {
  const profiles = await getProfiles();
  const index = profiles.findIndex((p) => p.id === profile.id);
  if (index !== -1) {
    profiles[index] = profile;
    await saveProfiles(profiles);
  }
};

export const deleteProfile = async (id: string): Promise<void> => {
  const profiles = await getProfiles();
  const filtered = profiles.filter((p) => p.id !== id);
  await saveProfiles(filtered);

  const medications = await getMedications();
  const filteredMeds = medications.filter((m) => m.profileId !== id);
  await saveMedications(filteredMeds);

  const logs = await getLogs();
  const filteredLogs = logs.filter((l) => l.profileId !== id);
  await saveLogs(filteredLogs);

  const activeProfile = await getActiveProfile();
  if (activeProfile?.id === id) {
    await setActiveProfile(null);
  }
};

export const getActiveProfile = async (): Promise<Profile | null> => {
  try {
    const data = await AsyncStorage.getItem(ACTIVE_PROFILE_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error getting active profile:', error);
    return null;
  }
};

export const setActiveProfile = async (profile: Profile | null): Promise<void> => {
  try {
    if (profile) {
      await AsyncStorage.setItem(ACTIVE_PROFILE_KEY, JSON.stringify(profile));
    } else {
      await AsyncStorage.removeItem(ACTIVE_PROFILE_KEY);
    }
  } catch (error) {
    console.error('Error setting active profile:', error);
  }
};

export const getMedications = async (profileId?: string): Promise<Medication[]> => {
  try {
    const data = await AsyncStorage.getItem(MEDICATIONS_KEY);
    const medications = data ? JSON.parse(data) : [];
    if (profileId) {
      return medications.filter((m: Medication) => m.profileId === profileId);
    }
    return medications;
  } catch (error) {
    console.error('Error getting medications:', error);
    return [];
  }
};

export const saveMedications = async (medications: Medication[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(MEDICATIONS_KEY, JSON.stringify(medications));
  } catch (error) {
    console.error('Error saving medications:', error);
  }
};

export const addMedication = async (medication: Medication): Promise<void> => {
  const medications = await getMedications();
  medications.push(medication);
  await saveMedications(medications);
};

export const updateMedication = async (medication: Medication): Promise<void> => {
  const medications = await getMedications();
  const index = medications.findIndex((m) => m.id === medication.id);
  if (index !== -1) {
    medications[index] = medication;
    await saveMedications(medications);
  }
};

export const deleteMedication = async (id: string): Promise<void> => {
  const medications = await getMedications();
  const filtered = medications.filter((m) => m.id !== id);
  await saveMedications(filtered);
};

export const getLogs = async (profileId?: string): Promise<MedicationLog[]> => {
  try {
    const data = await AsyncStorage.getItem(LOGS_KEY);
    const logs = data ? JSON.parse(data) : [];
    if (profileId) {
      return logs.filter((l: MedicationLog) => l.profileId === profileId);
    }
    return logs;
  } catch (error) {
    console.error('Error getting logs:', error);
    return [];
  }
};

export const saveLogs = async (logs: MedicationLog[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(LOGS_KEY, JSON.stringify(logs));
  } catch (error) {
    console.error('Error saving logs:', error);
  }
};

export const addLog = async (log: MedicationLog): Promise<void> => {
  const logs = await getLogs();
  logs.push(log);
  await saveLogs(logs);
};

export const updateLog = async (log: MedicationLog): Promise<void> => {
  const logs = await getLogs();
  const index = logs.findIndex((l) => l.id === log.id);
  if (index !== -1) {
    logs[index] = log;
    await saveLogs(logs);
  }
};

export const getLogsByMedication = async (medicationId: string): Promise<MedicationLog[]> => {
  const logs = await getLogs();
  return logs.filter((log) => log.medicationId === medicationId);
};

export const exportData = async (profile: Profile): Promise<string> => {
  try {
    const medications = await getMedications(profile.id);
    const logs = await getLogs(profile.id);
    return JSON.stringify({ profile, medications, logs }, null, 2);
  } catch (error) {
    console.error('Error exporting data:', error);
    throw error;
  }
};

export const importData = async (jsonData: string): Promise<Profile | null> => {
  try {
    const data = JSON.parse(jsonData);

    if (!data.profile) {
      throw new Error('Invalid backup file: missing profile data');
    }

    const profiles = await getProfiles();
    const existingProfile = profiles.find((p) => p.name === data.profile.name);

    let targetProfile: Profile;
    if (existingProfile) {
      targetProfile = existingProfile;
    } else {
      targetProfile = {
        id: data.profile.id || Date.now().toString(),
        name: data.profile.name,
        createdAt: data.profile.createdAt || new Date().toISOString(),
      };
      await addProfile(targetProfile);
    }

    const allMedications = await getMedications();
    const otherMedications = allMedications.filter((m) => m.profileId !== targetProfile.id);
    const importedMedications = (data.medications || []).map((m: Medication) => ({
      ...m,
      profileId: targetProfile.id,
    }));
    await saveMedications([...otherMedications, ...importedMedications]);

    const allLogs = await getLogs();
    const otherLogs = allLogs.filter((l) => l.profileId !== targetProfile.id);
    const importedLogs = (data.logs || []).map((l: MedicationLog) => ({
      ...l,
      profileId: targetProfile.id,
    }));
    await saveLogs([...otherLogs, ...importedLogs]);

    return targetProfile;
  } catch (error) {
    console.error('Error importing data:', error);
    throw error;
  }
};

export const clearAllData = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([MEDICATIONS_KEY, LOGS_KEY, PROFILES_KEY, ACTIVE_PROFILE_KEY]);
  } catch (error) {
    console.error('Error clearing data:', error);
  }
};

const LAST_LOG_GENERATION_KEY = '@medicatime_last_log_generation';

const getLocalDateString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const generateDailyLogs = async (profileId: string, daysAhead: number = 7): Promise<void> => {
  try {
    const medications = await getMedications(profileId);
    const existingLogs = await getLogs(profileId);
    const newLogs: MedicationLog[] = [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < daysAhead; i++) {
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() + i);
      const dateString = getLocalDateString(targetDate);

      for (const medication of medications) {
        for (const time of medication.times) {
          const logId = `${medication.id}-${time}-${dateString}`;
          const scheduledTime = `${dateString}T${time}:00`;

          const logExists = existingLogs.some(
            (log) => log.id === logId ||
            (log.medicationId === medication.id &&
             log.scheduledTime === scheduledTime)
          );

          if (!logExists) {
            newLogs.push({
              id: logId,
              profileId,
              medicationId: medication.id,
              scheduledTime,
              taken: false,
              date: dateString,
            });
          }
        }
      }
    }

    if (newLogs.length > 0) {
      const allLogsInStorage = await getLogs();
      const otherProfileLogs = allLogsInStorage.filter((l) => l.profileId !== profileId);
      const updatedProfileLogs = [...existingLogs, ...newLogs];
      await saveLogs([...otherProfileLogs, ...updatedProfileLogs]);
    }

    await AsyncStorage.setItem(LAST_LOG_GENERATION_KEY, new Date().toISOString());
  } catch (error) {
    console.error('Error generating daily logs:', error);
  }
};

export const checkAndGenerateDailyLogs = async (profileId?: string): Promise<void> => {
  try {
    const activeProfile = profileId ? { id: profileId } : await getActiveProfile();
    if (!activeProfile) return;

    const lastGeneration = await AsyncStorage.getItem(LAST_LOG_GENERATION_KEY);
    const now = new Date();

    if (!lastGeneration) {
      await generateDailyLogs(activeProfile.id, 7);
      return;
    }

    const lastDate = new Date(lastGeneration);
    lastDate.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);

    const daysDifference = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

    if (daysDifference >= 1) {
      await generateDailyLogs(activeProfile.id, 7);
    }
  } catch (error) {
    console.error('Error checking daily logs:', error);
  }
};
