import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  I18nManager,
} from 'react-native';
import { FAB, Card, IconButton } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { Medication, MedicationLog, Profile, getRouteTranslationKey } from '../data/models';
import { getMedications, getLogs, deleteMedication, checkAndGenerateDailyLogs, getActiveProfile } from '../utils/storage';
import { cancelNotificationsForMedication } from '../utils/notifications';
import { Pill, Clock, Trash2, Users } from 'lucide-react-native';
import { useLanguage } from '../contexts/LanguageContext';
import { BannerAd, BannerAdSize, InterstitialAd, AdEventType, TestIds } from 'react-native-google-mobile-ads';

const BANNER_AD_UNIT_ID = __DEV__
  ? TestIds.BANNER
  : 'medicabannerca-app-pub-5364073203369180/3746304354';
const INTERSTITIAL_AD_UNIT_ID = __DEV__
  ? TestIds.INTERSTITIAL
  : 'medica interstatialca-app-pub-5364073203369180/9358434124';
const INTERSTITIAL_TRIGGER_COUNT = 5;

interface HomeScreenProps {
  navigation: any;
}

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const { t, language, setLanguage, isRTL } = useLanguage();
  const [medications, setMedications] = useState<Medication[]>([]);
  const [logs, setLogs] = useState<MedicationLog[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [activeProfile, setActiveProfileState] = useState<Profile | null>(null);
  const [clickCount, setClickCount] = useState(0);
  const [isInterstitialLoaded, setIsInterstitialLoaded] = useState(false);
  const interstitialRef = useRef<InterstitialAd | null>(null);
  const pendingInterstitialRef = useRef(false);

  const loadData = async () => {
    try {
      const profile = await getActiveProfile();
      if (!profile) {
        navigation.replace('ProfileSelection');
        return;
      }
      setActiveProfileState(profile);
      await checkAndGenerateDailyLogs(profile.id);
      const meds = await getMedications(profile.id);
      const allLogs = await getLogs(profile.id);
      setMedications(meds);
      setLogs(allLogs);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  useEffect(() => {
    const interstitial = InterstitialAd.createForAdRequest(INTERSTITIAL_AD_UNIT_ID, {
      requestNonPersonalizedAdsOnly: true,
    });
    interstitialRef.current = interstitial;

    const loadedListener = interstitial.addAdEventListener(AdEventType.LOADED, () => {
      setIsInterstitialLoaded(true);
      if (pendingInterstitialRef.current) {
        pendingInterstitialRef.current = false;
        interstitial.show();
        setIsInterstitialLoaded(false);
      }
    });

    const closedListener = interstitial.addAdEventListener(AdEventType.CLOSED, () => {
      setIsInterstitialLoaded(false);
      interstitial.load();
    });

    const errorListener = interstitial.addAdEventListener(AdEventType.ERROR, () => {
      setIsInterstitialLoaded(false);
      interstitial.load();
    });

    interstitial.load();

    return () => {
      loadedListener();
      closedListener();
      errorListener();
    };
  }, []);

  const getLocalDateString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getNextDoseTime = (medication: Medication): string => {
    if (medication.times.length === 0) return t.home.noScheduledTimes;

    const now = new Date();
    const todayDate = getLocalDateString(now);

    const todayLogs = logs.filter(
      (log) => log.medicationId === medication.id &&
      log.date === todayDate &&
      !log.taken
    ).sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime));

    if (todayLogs.length > 0) {
      const nextLog = todayLogs.find((log) => {
        const logTime = new Date(log.scheduledTime);
        return logTime > now;
      });

      if (nextLog) {
        const time = nextLog.scheduledTime.split('T')[1].substring(0, 5);
        return time;
      }
    }

    const tomorrowDate = new Date(now);
    tomorrowDate.setDate(tomorrowDate.getDate() + 1);
    const tomorrowDateString = getLocalDateString(tomorrowDate);

    const tomorrowLogs = logs.filter(
      (log) => log.medicationId === medication.id &&
      log.date === tomorrowDateString
    ).sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime));

    if (tomorrowLogs.length > 0) {
      const firstTime = tomorrowLogs[0].scheduledTime.split('T')[1].substring(0, 5);
      return `${firstTime} (${t.home.tomorrow})`;
    }

    const firstTime = medication.times[0];
    return `${firstTime} (${t.home.tomorrow})`;
  };

  const getLastTakenStatus = (medication: Medication): string => {
    const medLogs = logs
      .filter((log) => log.medicationId === medication.id && log.taken)
      .sort((a, b) => new Date(b.takenTime || b.scheduledTime).getTime() - new Date(a.takenTime || a.scheduledTime).getTime());

    if (medLogs.length === 0) return t.home.notTakenYet;

    const lastLog = medLogs[0];
    const takenDate = new Date(lastLog.takenTime || lastLog.scheduledTime);
    return `${t.home.lastTaken} ${takenDate.toLocaleString()}`;
  };

  const handleDeleteMedication = async (medication: Medication) => {
    await deleteMedication(medication.id);
    await cancelNotificationsForMedication(medication.id);
    await loadData();
  };

  const maybeShowInterstitial = useCallback(() => {
    if (isInterstitialLoaded && interstitialRef.current) {
      interstitialRef.current.show();
      setIsInterstitialLoaded(false);
    } else if (interstitialRef.current) {
      pendingInterstitialRef.current = true;
    }
  }, [isInterstitialLoaded]);

  const handleTrackedPress = useCallback(
    (action: () => void) => {
      action();
      setClickCount((prev) => {
        const next = prev + 1;
        if (next >= INTERSTITIAL_TRIGGER_COUNT) {
          maybeShowInterstitial();
          return 0;
        }
        return next;
      });
    },
    [maybeShowInterstitial]
  );

  const renderMedicationItem = ({ item }: { item: Medication }) => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <View style={styles.iconContainer}>
            <Pill color="#2196F3" size={24} />
          </View>
          <View style={styles.medicationInfo}>
            <Text style={styles.medicationName}>{item.name}</Text>
            <Text style={styles.medicationDose}>
              {item.dose} - {t.routes[getRouteTranslationKey(item.route) as keyof typeof t.routes]}
            </Text>
          </View>
          <IconButton
            icon={() => <Trash2 color="#F44336" size={20} />}
            size={20}
            onPress={() => handleDeleteMedication(item)}
          />
        </View>

        <View style={styles.timeInfo}>
          <Clock color="#666" size={16} />
          <Text style={styles.timeText}>{t.home.nextDose} {getNextDoseTime(item)}</Text>
        </View>

        <Text style={styles.statusText}>{getLastTakenStatus(item)}</Text>

        {item.notes && <Text style={styles.notesText}>{t.addMedication.notes}: {item.notes}</Text>}

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.viewLogsButton}
            onPress={() => handleTrackedPress(() => navigation.navigate('Logs', { medicationId: item.id }))}
          >
            <Text style={styles.viewLogsText}>{t.home.viewLogs}</Text>
          </TouchableOpacity>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={[styles.headerRow, isRTL && styles.headerRowRTL]}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>{t.home.title}</Text>
            <Text style={styles.headerSubtitle}>{t.home.subtitle}</Text>
            {activeProfile && (
              <Text style={styles.activeProfileText}>
                {t.profiles.activeProfile} {activeProfile.name}
              </Text>
            )}
          </View>
          <TouchableOpacity
            style={[styles.languageButton, isRTL && styles.languageButtonRTL]}
            onPress={() => handleTrackedPress(() => setLanguage(language === 'ar' ? 'en' : 'ar'))}
          >
            <Text style={styles.languageButtonText}>
              {language === 'ar' ? 'English' : 'العربية'}
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.backupButton}
            onPress={() => handleTrackedPress(() => navigation.navigate('Backup'))}
          >
            <Text style={styles.backupButtonText}>{t.home.backupRestore}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => handleTrackedPress(() => navigation.replace('ProfileSelection'))}
          >
            <Users color="#FFF" size={16} />
            <Text style={styles.profileButtonText}>{t.profiles.title}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {medications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Pill color="#CCC" size={64} />
          <Text style={styles.emptyText}>{t.home.noMedications}</Text>
          <Text style={styles.emptySubtext}>{t.home.noMedicationsSubtext}</Text>
        </View>
      ) : (
        <FlatList
          data={medications}
          renderItem={renderMedicationItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}

      <View style={styles.bannerContainer}>
        <BannerAd
          unitId={BANNER_AD_UNIT_ID}
          size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
          requestOptions={{
            requestNonPersonalizedAdsOnly: true,
          }}
        />
      </View>

      <FAB
        style={styles.fab}
        icon={() => <Text style={styles.fabIcon}>+</Text>}
        label={t.home.addMedication}
        onPress={() => handleTrackedPress(() => navigation.navigate('AddMedication'))}
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
    paddingBottom: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  headerRowRTL: {
    flexDirection: 'row-reverse',
  },
  headerLeft: {
    flex: 1,
    marginRight: 12,
  },
  languageButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginLeft: 12,
  },
  languageButtonRTL: {
    marginLeft: 0,
    marginRight: 12,
  },
  languageButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#E3F2FD',
    marginTop: 4,
  },
  activeProfileText: {
    fontSize: 14,
    color: '#E3F2FD',
    marginTop: 8,
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  backupButton: {
    backgroundColor: '#1976D2',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
  },
  backupButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  profileButton: {
    backgroundColor: '#1976D2',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  profileButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 120,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  medicationInfo: {
    flex: 1,
  },
  medicationName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  medicationDose: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  timeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  timeText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  statusText: {
    fontSize: 13,
    color: '#4CAF50',
    marginBottom: 8,
  },
  notesText: {
    fontSize: 13,
    color: '#999',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  actions: {
    marginTop: 8,
  },
  viewLogsButton: {
    backgroundColor: '#E3F2FD',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  viewLogsText: {
    color: '#2196F3',
    fontSize: 14,
    fontWeight: '600',
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
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 90,
    backgroundColor: '#2196F3',
  },
  fabIcon: {
    fontSize: 24,
    color: '#FFF',
  },
  bannerContainer: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#F5F5F5',
  },
});
