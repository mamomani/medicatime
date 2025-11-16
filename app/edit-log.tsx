import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { Button, Switch } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MedicationLog } from '../data/models';
import { getLogs, updateLog, getMedications, getActiveProfile } from '../utils/storage';
import { CheckCircle, XCircle, Clock } from 'lucide-react-native';
import { useLanguage } from '../contexts/LanguageContext';

export default function EditLogScreen() {
  const { t, isRTL } = useLanguage();
  const router = useRouter();
  const { logId } = useLocalSearchParams();
  const [log, setLog] = useState<MedicationLog | null>(null);
  const [medicationName, setMedicationName] = useState('');
  const [taken, setTaken] = useState(false);
  const [takenTime, setTakenTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (logId) {
      loadLog();
    }
  }, [logId]);

  const loadLog = async () => {
    const profile = await getActiveProfile();
    if (!profile) {
      router.back();
      return;
    }

    const logs = await getLogs(profile.id);
    const foundLog = logs.find((l) => l.id === logId);
    if (foundLog) {
      setLog(foundLog);
      setTaken(foundLog.taken);
      if (foundLog.takenTime) {
        setTakenTime(new Date(foundLog.takenTime));
      } else {
        setTakenTime(new Date());
      }

      const medications = await getMedications(profile.id);
      const medication = medications.find((m) => m.id === foundLog.medicationId);
      setMedicationName(medication?.name || 'Unknown');
    }
  };

  const onTimeChange = (event: any, date?: Date) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (date) {
      const newTime = new Date(takenTime);
      newTime.setHours(date.getHours());
      newTime.setMinutes(date.getMinutes());
      setTakenTime(newTime);
    }
  };

  const onDateChange = (event: any, date?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (date) {
      const newTime = new Date(takenTime);
      newTime.setFullYear(date.getFullYear());
      newTime.setMonth(date.getMonth());
      newTime.setDate(date.getDate());
      setTakenTime(newTime);
    }
  };

  const handleMarkAsNow = () => {
    setTakenTime(new Date());
    setTaken(true);
  };

  const handleSave = async () => {
    if (!log) return;

    setLoading(true);
    try {
      const updatedLog: MedicationLog = {
        ...log,
        taken,
        takenTime: taken ? takenTime.toISOString() : undefined,
      };

      await updateLog(updatedLog);
      Alert.alert(t.editLog.success, t.editLog.successMessage, [
        { text: t.common.ok, onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert(t.editLog.error, t.editLog.errorMessage);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (date: Date): string => {
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!log) {
    return (
      <View style={styles.container}>
        <Text>{t.common.loading}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>{isRTL ? '→' : '←'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t.editLog.title}</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>{t.editLog.medication}</Text>
          <Text style={styles.infoValue}>{medicationName}</Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>{t.editLog.scheduledTime}</Text>
          <Text style={styles.infoValue}>
            {formatDateTime(new Date(log.scheduledTime))}
          </Text>
        </View>

        <View style={styles.section}>
          <View style={styles.switchContainer}>
            <View style={styles.switchLabel}>
              {taken ? (
                <CheckCircle color="#4CAF50" size={24} />
              ) : (
                <XCircle color="#F44336" size={24} />
              )}
              <Text style={styles.switchText}>
                {taken ? t.editLog.medicationTaken : t.editLog.medicationNotTaken}
              </Text>
            </View>
            <Switch
              value={taken}
              onValueChange={setTaken}
              color="#2196F3"
            />
          </View>
        </View>

        {taken && (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t.editLog.timeTaken}</Text>

              <TouchableOpacity
                style={styles.timeButton}
                onPress={handleMarkAsNow}
              >
                <Clock color="#2196F3" size={20} />
                <Text style={styles.timeButtonText}>{t.editLog.markNow}</Text>
              </TouchableOpacity>

              <View style={styles.selectedTimeContainer}>
                <Text style={styles.selectedTimeLabel}>{t.editLog.selectedTime}</Text>
                <Text style={styles.selectedTimeValue}>
                  {formatDateTime(takenTime)}
                </Text>
              </View>

              <View style={styles.pickerButtons}>
                <TouchableOpacity
                  style={styles.pickerButton}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={styles.pickerButtonText}>{t.editLog.changeDate}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.pickerButton}
                  onPress={() => setShowTimePicker(true)}
                >
                  <Text style={styles.pickerButtonText}>{t.editLog.changeTime}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}

        <Button
          mode="contained"
          onPress={handleSave}
          loading={loading}
          disabled={loading}
          style={styles.saveButton}
          buttonColor="#2196F3"
        >
          {t.editLog.save}
        </Button>
      </ScrollView>

      {showTimePicker && (
        <DateTimePicker
          value={takenTime}
          mode="time"
          is24Hour={true}
          display="default"
          onChange={onTimeChange}
        />
      )}

      {showDatePicker && (
        <DateTimePicker
          value={takenTime}
          mode="date"
          display="default"
          onChange={onDateChange}
        />
      )}
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
  infoCard: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  infoLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  section: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  switchText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E3F2FD',
    padding: 12,
    borderRadius: 8,
    gap: 8,
    marginBottom: 16,
  },
  timeButtonText: {
    color: '#2196F3',
    fontSize: 14,
    fontWeight: '600',
  },
  selectedTimeContainer: {
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  selectedTimeLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  selectedTimeValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  pickerButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  pickerButton: {
    flex: 1,
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  pickerButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  saveButton: {
    marginTop: 16,
    paddingVertical: 8,
  },
});
