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
import { Button } from 'react-native-paper';
import * as DocumentPicker from 'expo-document-picker';
import * as Sharing from 'expo-sharing';
import { Paths, File } from 'expo-file-system';
import { exportData, importData, clearAllData, getActiveProfile, setActiveProfile } from '../utils/storage';
import { Database, Upload, Download, Trash2 } from 'lucide-react-native';
import { useLanguage } from '../contexts/LanguageContext';

interface BackupScreenProps {
  navigation: any;
}

export default function BackupScreen({ navigation }: BackupScreenProps) {
  const { t, isRTL } = useLanguage();
  const [loading, setLoading] = useState(false);

  const handleExportData = async () => {
    setLoading(true);
    try {
      const activeProfile = await getActiveProfile();
      if (!activeProfile) {
        Alert.alert(t.common.error, 'No active profile');
        return;
      }
      const jsonData = await exportData(activeProfile);
      const fileName = `medicatime_${activeProfile.name}.txt`;

      if (Platform.OS === 'web') {
        const blob = new Blob([jsonData], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        Alert.alert(t.common.success, t.backup.exportSuccess);
      } else {
        const file = new File(Paths.cache, fileName);
        await file.write(jsonData);

        const isAvailable = await Sharing.isAvailableAsync();
        if (isAvailable) {
          await Sharing.shareAsync(file.uri, {
            mimeType: 'text/plain',
            dialogTitle: 'Share Backup File',
          });
        } else {
          Alert.alert(t.common.success, `${t.backup.exportSuccess}`);
        }
      }
    } catch (error) {
      Alert.alert(t.backup.error, 'Failed to export data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleImportData = async () => {
    setLoading(true);
    try {
      if (Platform.OS === 'web') {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'text/plain,.txt,.json';
        input.onchange = async (e: any) => {
          const file = e.target.files[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = async (event: any) => {
              try {
                const jsonData = event.target.result;
                const importedProfile = await importData(jsonData);
                if (importedProfile) {
                  await setActiveProfile(importedProfile);
                }
                Alert.alert(t.common.success, t.backup.importSuccess, [
                  { text: t.common.ok, onPress: () => navigation.goBack() },
                ]);
              } catch (error) {
                Alert.alert(t.backup.error, t.backup.invalidFile);
                console.error(error);
              }
            };
            reader.readAsText(file);
          }
          setLoading(false);
        };
        input.click();
      } else {
        const result = await DocumentPicker.getDocumentAsync({
          type: ['text/plain', 'application/json', '*/*'],
          copyToCacheDirectory: true,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
          const fileUri = result.assets[0].uri;
          const file = new File(fileUri);
          const jsonData = await file.text();
          const importedProfile = await importData(jsonData);
          if (importedProfile) {
            await setActiveProfile(importedProfile);
          }
          Alert.alert(t.common.success, t.backup.importSuccess, [
            { text: t.common.ok, onPress: () => navigation.goBack() },
          ]);
        }
        setLoading(false);
      }
    } catch (error) {
      Alert.alert(t.backup.error, 'Failed to import data');
      console.error(error);
      setLoading(false);
    }
  };

  const handleClearAllData = () => {
    Alert.alert(
      t.backup.clearTitle,
      t.backup.clearMessage,
      [
        { text: t.backup.cancel, style: 'cancel' },
        {
          text: t.backup.delete,
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await clearAllData();
              Alert.alert(t.common.success, t.backup.clearSuccess, [
                { text: t.common.ok, onPress: () => navigation.goBack() },
              ]);
            } catch (error) {
              Alert.alert(t.backup.error, 'Failed to clear data');
              console.error(error);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>{isRTL ? '→' : '←'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t.backup.title}</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.infoCard}>
          <Database color="#2196F3" size={32} />
          <Text style={styles.infoTitle}>{t.backup.dataManagement}</Text>
          <Text style={styles.infoText}>
            {t.backup.description}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.backup.exportTitle}</Text>
          <Text style={styles.sectionDescription}>
            {t.backup.exportDescription}
          </Text>
          <Button
            mode="contained"
            onPress={handleExportData}
            loading={loading}
            disabled={loading}
            style={styles.button}
            buttonColor="#4CAF50"
            icon={() => <Download color="#FFF" size={20} />}
          >
            {t.backup.exportButton}
          </Button>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.backup.importTitle}</Text>
          <Text style={styles.sectionDescription}>
            {t.backup.importDescription}
          </Text>
          <Button
            mode="contained"
            onPress={handleImportData}
            loading={loading}
            disabled={loading}
            style={styles.button}
            buttonColor="#2196F3"
            icon={() => <Upload color="#FFF" size={20} />}
          >
            {t.backup.importButton}
          </Button>
        </View>

        <View style={styles.dangerSection}>
          <Text style={styles.dangerTitle}>{t.backup.dangerZone}</Text>
          <Text style={styles.dangerDescription}>
            {t.backup.dangerDescription}
          </Text>
          <Button
            mode="outlined"
            onPress={handleClearAllData}
            loading={loading}
            disabled={loading}
            style={styles.dangerButton}
            textColor="#F44336"
            icon={() => <Trash2 color="#F44336" size={20} />}
          >
            {t.backup.clearButton}
          </Button>
        </View>

        <View style={styles.noteCard}>
          <Text style={styles.noteTitle}>{t.backup.noteTitle}</Text>
          <Text style={styles.noteText}>
            {t.backup.note1}{'\n'}
            {t.backup.note2}{'\n'}
            {t.backup.note3}{'\n'}
            {t.backup.note4}
          </Text>
        </View>
      </ScrollView>
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
    backgroundColor: '#E3F2FD',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1976D2',
    marginTop: 12,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#1565C0',
    textAlign: 'center',
    lineHeight: 20,
  },
  section: {
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  button: {
    paddingVertical: 8,
  },
  dangerSection: {
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  dangerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F44336',
    marginBottom: 8,
  },
  dangerDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  dangerButton: {
    paddingVertical: 8,
    borderColor: '#F44336',
  },
  noteCard: {
    backgroundColor: '#FFFDE7',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FBC02D',
  },
  noteTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#F57F17',
    marginBottom: 8,
  },
  noteText: {
    fontSize: 12,
    color: '#F57F17',
    lineHeight: 18,
  },
});
