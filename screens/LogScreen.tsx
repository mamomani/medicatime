import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Card, Chip } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { MedicationLog } from '../data/models';
import { getLogs, getMedications, getActiveProfile } from '../utils/storage';
import { CheckCircle, XCircle, Clock, Calendar } from 'lucide-react-native';
import { useLanguage } from '../contexts/LanguageContext';

interface LogScreenProps {
  navigation: any;
  route: any;
}

export default function LogScreen({ navigation, route }: LogScreenProps) {
  const { t, isRTL } = useLanguage();
  const [logs, setLogs] = useState<MedicationLog[]>([]);
  const [medicationName, setMedicationName] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const medicationId = route.params?.medicationId;

  const loadLogs = async () => {
    const profile = await getActiveProfile();
    if (!profile) return;

    const allLogs = await getLogs(profile.id);
    const medications = await getMedications(profile.id);

    const sortLogs = (logsToSort: MedicationLog[]) => {
      const now = new Date().getTime();

      return logsToSort.sort((a, b) => {
        const timeA = new Date(a.scheduledTime).getTime();
        const timeB = new Date(b.scheduledTime).getTime();

        const isPastA = timeA <= now;
        const isPastB = timeB <= now;

        if (isPastA && !isPastB) return -1;
        if (!isPastA && isPastB) return 1;

        if (isPastA && isPastB) {
          return timeB - timeA;
        }

        return timeA - timeB;
      });
    };

    if (medicationId) {
      const filtered = allLogs.filter((log) => log.medicationId === medicationId);
      const medication = medications.find((m) => m.id === medicationId);
      setMedicationName(medication?.name || '');
      setLogs(sortLogs(filtered));
    } else {
      setLogs(sortLogs(allLogs));
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadLogs();
    }, [medicationId])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadLogs();
    setRefreshing(false);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getMedicationNameForLog = async (logMedicationId: string): Promise<string> => {
    const profile = await getActiveProfile();
    if (!profile) return 'Unknown';

    const medications = await getMedications(profile.id);
    const medication = medications.find((m) => m.id === logMedicationId);
    return medication?.name || 'Unknown';
  };

  const renderLogItem = ({ item }: { item: MedicationLog }) => (
    <Card style={styles.card}>
      <TouchableOpacity
        onPress={() => navigation.navigate('EditLog', { logId: item.id })}
        activeOpacity={0.7}
      >
        <Card.Content>
          <View style={styles.logHeader}>
            <View style={styles.statusIcon}>
              {item.taken ? (
                <CheckCircle color="#4CAF50" size={24} />
              ) : (
                <XCircle color="#F44336" size={24} />
              )}
            </View>
            <View style={styles.logInfo}>
              <Text style={styles.statusText}>
                {item.taken ? t.logs.taken : t.logs.notTaken}
              </Text>
              {!medicationId && (
                <Text style={styles.medicationText}>Medication ID: {item.medicationId}</Text>
              )}
            </View>
          </View>

          <View style={styles.timeContainer}>
            <View style={styles.timeRow}>
              <Calendar color="#666" size={16} />
              <Text style={styles.timeLabel}>{t.logs.scheduled}</Text>
              <Text style={styles.timeValue}>
                {formatDate(item.scheduledTime)} at {formatTime(item.scheduledTime)}
              </Text>
            </View>

            {item.taken && item.takenTime && (
              <View style={styles.timeRow}>
                <Clock color="#4CAF50" size={16} />
                <Text style={styles.timeLabel}>{t.home.lastTaken}</Text>
                <Text style={styles.timeValue}>
                  {formatDate(item.takenTime)} at {formatTime(item.takenTime)}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.footer}>
            <Chip
              mode="outlined"
              style={[
                styles.chip,
                item.taken ? styles.chipTaken : styles.chipNotTaken,
              ]}
              textStyle={styles.chipText}
            >
              {item.taken ? t.logs.completed : t.logs.pending}
            </Chip>
            <Text style={styles.editHint}>{t.logs.tapToEdit}</Text>
          </View>
        </Card.Content>
      </TouchableOpacity>
    </Card>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>{isRTL ? '→' : '←'}</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>{t.logs.title}</Text>
          {medicationName && (
            <Text style={styles.headerSubtitle}>{medicationName}</Text>
          )}
        </View>
      </View>

      {logs.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Calendar color="#CCC" size={64} />
          <Text style={styles.emptyText}>{t.logs.noLogs}</Text>
          <Text style={styles.emptySubtext}>
            {t.logs.noLogsSubtext}
          </Text>
        </View>
      ) : (
        <FlatList
          data={logs}
          renderItem={renderLogItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
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
  headerSubtitle: {
    fontSize: 14,
    color: '#E3F2FD',
    marginTop: 4,
  },
  listContainer: {
    padding: 16,
  },
  card: {
    marginBottom: 12,
    elevation: 2,
  },
  logHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusIcon: {
    marginRight: 12,
  },
  logInfo: {
    flex: 1,
  },
  statusText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  medicationText: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  timeContainer: {
    marginBottom: 12,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  timeLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  timeValue: {
    fontSize: 14,
    color: '#333',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chip: {
    height: 28,
  },
  chipTaken: {
    borderColor: '#4CAF50',
    backgroundColor: '#E8F5E9',
  },
  chipNotTaken: {
    borderColor: '#F44336',
    backgroundColor: '#FFEBEE',
  },
  chipText: {
    fontSize: 12,
  },
  editHint: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    color: '#999',
    marginTop: 16,
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#CCC',
    marginTop: 8,
    textAlign: 'center',
  },
});
