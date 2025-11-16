import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import AlarmStyleTimePicker from '../components/AlarmStyleTimePicker';
import { Medication, MedicationRoute, Profile } from '../data/models';
import { addMedication, addLog, getActiveProfile } from '../utils/storage';
import { scheduleNotificationForMedication } from '../utils/notifications';
import { Clock, X } from 'lucide-react-native';
import { useLanguage } from '../contexts/LanguageContext';
import RoutePicker from '../components/RoutePicker';

interface AddMedicationScreenProps {
  navigation: any;
}

export default function AddMedicationScreen({ navigation }: AddMedicationScreenProps) {
  const { t, isRTL } = useLanguage();
  const [name, setName] = useState('');
  const [dose, setDose] = useState('');
  const [route, setRoute] = useState<MedicationRoute>('Tablet');
  const [times, setTimes] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAddTime = () => {
    setShowTimePicker(true);
  };

  const handleTimeConfirm = (hour: number, minute: number) => {
    const hours = hour.toString().padStart(2, '0');
    const minutes = minute.toString().padStart(2, '0');
    const timeString = `${hours}:${minutes}`;

    if (!times.includes(timeString)) {
      setTimes([...times, timeString].sort());
    }
  };

  const handleRemoveTime = (time: string) => {
    setTimes(times.filter((t) => t !== time));
  };

  const validateForm = (): boolean => {
    if (!name.trim()) {
      Alert.alert(t.addMedication.error, t.addMedication.errorName);
      return false;
    }
    if (!dose.trim()) {
      Alert.alert(t.addMedication.error, t.addMedication.errorDose);
      return false;
    }
    if (times.length === 0) {
      Alert.alert(t.addMedication.error, t.addMedication.errorTimes);
      return false;
    }
    return true;
  };

  const getLocalDateString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const createInitialLogs = async (medication: Medication) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 7; i++) {
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() + i);
      const dateString = getLocalDateString(targetDate);

      for (const time of medication.times) {
        await addLog({
          id: `${medication.id}-${time}-${dateString}`,
          profileId: medication.profileId,
          medicationId: medication.id,
          scheduledTime: `${dateString}T${time}:00`,
          taken: false,
          date: dateString,
        });
      }
    }
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const activeProfile = await getActiveProfile();
      if (!activeProfile) {
        Alert.alert(t.common.error, 'No active profile');
        navigation.replace('ProfileSelection');
        return;
      }

      const medication: Medication = {
        id: Date.now().toString(),
        profileId: activeProfile.id,
        name: name.trim(),
        dose: dose.trim(),
        route,
        times,
        notes: notes.trim(),
        createdAt: new Date().toISOString(),
      };

      await addMedication(medication);
      await createInitialLogs(medication);
      await scheduleNotificationForMedication(medication);

      Alert.alert(t.addMedication.success, t.addMedication.successMessage, [
        { text: t.common.ok, onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert(t.addMedication.error, t.addMedication.errorMessage);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>{isRTL ? '→' : '←'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t.addMedication.title}</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.section}>
          <Text style={styles.label}>{t.addMedication.name} {t.addMedication.required}</Text>
          <TextInput
            mode="outlined"
            value={name}
            onChangeText={setName}
            placeholder={t.addMedication.namePlaceholder}
            style={styles.input}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>{t.addMedication.dose} {t.addMedication.required}</Text>
          <TextInput
            mode="outlined"
            value={dose}
            onChangeText={setDose}
            placeholder={t.addMedication.dosePlaceholder}
            style={styles.input}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>{t.addMedication.route} {t.addMedication.required}</Text>
          <RoutePicker value={route} onValueChange={setRoute} />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.label}>{t.addMedication.times} {t.addMedication.required}</Text>
            <TouchableOpacity
              onPress={handleAddTime}
              style={styles.addTimeButton}
            >
              <Clock color="#2196F3" size={20} />
              <Text style={styles.addTimeText}>{t.addMedication.addTime}</Text>
            </TouchableOpacity>
          </View>

          {times.length === 0 ? (
            <View style={styles.emptyTimes}>
              <Text style={styles.emptyTimesText}>{t.addMedication.noTimes}</Text>
            </View>
          ) : (
            <View style={styles.timesContainer}>
              {times.map((time, index) => (
                <View key={index} style={styles.timeChip}>
                  <Text style={styles.timeChipText}>{time}</Text>
                  <TouchableOpacity onPress={() => handleRemoveTime(time)}>
                    <X color="#666" size={16} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>{t.addMedication.notes} {t.addMedication.optional}</Text>
          <TextInput
            mode="outlined"
            value={notes}
            onChangeText={setNotes}
            placeholder={t.addMedication.notesPlaceholder}
            multiline
            numberOfLines={3}
            style={styles.input}
          />
        </View>

        <Button
          mode="contained"
          onPress={handleSave}
          loading={loading}
          disabled={loading}
          style={styles.saveButton}
          buttonColor="#2196F3"
        >
          {t.addMedication.save}
        </Button>
      </ScrollView>

      <AlarmStyleTimePicker
        visible={showTimePicker}
        onClose={() => setShowTimePicker(false)}
        onConfirm={handleTimeConfirm}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#2196F3',
    padding: 20,
    paddingTop: 50,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 16,
  },
  backButtonText: {
    fontSize: 28,
    color: '#FFF',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFF',
  },
  pickerContainer: {
    backgroundColor: '#FFF',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#CCC',
  },
  picker: {
    height: 50,
  },
  addTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  addTimeText: {
    color: '#2196F3',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  emptyTimes: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  emptyTimesText: {
    color: '#999',
    fontSize: 14,
  },
  timesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    gap: 8,
  },
  timeChipText: {
    color: '#2196F3',
    fontSize: 14,
    fontWeight: '600',
  },
  saveButton: {
    marginTop: 16,
    paddingVertical: 8,
  },
});
