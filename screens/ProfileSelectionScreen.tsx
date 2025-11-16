import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import { Dialog, Portal, Button } from 'react-native-paper';
import { User, UserPlus, Edit2, Trash2, Upload, Download } from 'lucide-react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as Sharing from 'expo-sharing';
import { Paths, File } from 'expo-file-system';
import { Profile } from '../data/models';
import {
  getProfiles,
  addProfile,
  updateProfile,
  deleteProfile,
  setActiveProfile,
  getActiveProfile,
  exportData,
  importData,
} from '../utils/storage';
import { useLanguage } from '../contexts/LanguageContext';

interface ProfileSelectionScreenProps {
  navigation: any;
}

export default function ProfileSelectionScreen({ navigation }: ProfileSelectionScreenProps) {
  const { t, language, setLanguage, isRTL } = useLanguage();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [profileName, setProfileName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    const data = await getProfiles();
    setProfiles(data);
  };

  const handleCreateProfile = async () => {
    if (!profileName.trim()) {
      Alert.alert(t.common.error, t.profiles.errorName);
      return;
    }

    const newProfile: Profile = {
      id: Date.now().toString(),
      name: profileName.trim(),
      createdAt: new Date().toISOString(),
    };

    await addProfile(newProfile);
    await loadProfiles();
    setShowCreateDialog(false);
    setProfileName('');
  };

  const handleRenameProfile = async () => {
    if (!profileName.trim() || !selectedProfile) {
      Alert.alert(t.common.error, t.profiles.errorName);
      return;
    }

    const updatedProfile = {
      ...selectedProfile,
      name: profileName.trim(),
    };

    await updateProfile(updatedProfile);
    await loadProfiles();
    setShowRenameDialog(false);
    setProfileName('');
    setSelectedProfile(null);
  };

  const handleDeleteProfile = (profile: Profile) => {
    Alert.alert(
      t.profiles.deleteTitle,
      t.profiles.deleteMessage,
      [
        { text: t.profiles.cancel, style: 'cancel' },
        {
          text: t.profiles.delete,
          style: 'destructive',
          onPress: async () => {
            await deleteProfile(profile.id);
            await loadProfiles();
          },
        },
      ]
    );
  };

  const handleSelectProfile = async (profile: Profile) => {
    await setActiveProfile(profile);
    navigation.replace('Main');
  };

  const handleShowExportDialog = () => {
    if (profiles.length === 0) {
      Alert.alert(t.common.error, t.profiles.noProfiles);
      return;
    }
    setShowExportDialog(true);
  };

  const handleExportProfile = async (profile: Profile) => {
    setLoading(true);
    setShowExportDialog(false);
    try {
      const jsonData = await exportData(profile);
      const fileName = `jar3aty_${profile.name}.txt`;

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
                  await loadProfiles();
                  Alert.alert(t.common.success, t.backup.importSuccess);
                }
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
            await loadProfiles();
            Alert.alert(t.common.success, t.backup.importSuccess);
          }
        }
        setLoading(false);
      }
    } catch (error) {
      Alert.alert(t.backup.error, t.backup.invalidFile);
      console.error(error);
      setLoading(false);
    }
  };

  const openRenameDialog = (profile: Profile) => {
    setSelectedProfile(profile);
    setProfileName(profile.name);
    setShowRenameDialog(true);
  };

  const renderProfileItem = ({ item }: { item: Profile }) => (
    <TouchableOpacity
      style={styles.profileCard}
      onPress={() => handleSelectProfile(item)}
    >
      <View style={styles.profileHeader}>
        <View style={styles.profileIcon}>
          <User color="#2196F3" size={32} />
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{item.name}</Text>
          <Text style={styles.profileDate}>
            {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </View>
      </View>
      <View style={styles.profileActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => openRenameDialog(item)}
        >
          <Edit2 color="#666" size={20} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleDeleteProfile(item)}
        >
          <Trash2 color="#F44336" size={20} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.title}>{t.profiles.title}</Text>
            <Text style={styles.subtitle}>{t.profiles.selectProfile}</Text>
          </View>
          <TouchableOpacity
            style={styles.languageButton}
            onPress={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
          >
            <Text style={styles.languageButtonText}>
              {language === 'ar' ? 'English' : 'العربية'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {profiles.length === 0 ? (
        <View style={styles.emptyContainer}>
          <User color="#CCC" size={64} />
          <Text style={styles.emptyText}>{t.profiles.noProfiles}</Text>
          <Text style={styles.emptySubtext}>{t.profiles.noProfilesSubtext}</Text>
        </View>
      ) : (
        <FlatList
          data={profiles}
          renderItem={renderProfileItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
        />
      )}

      <View style={styles.bottomButtonsContainer}>
        <View style={styles.backupButtonsRow}>
          <TouchableOpacity
            style={styles.backupButton}
            onPress={handleImportData}
            disabled={loading}
          >
            <Upload color="#2196F3" size={20} />
            <Text style={styles.backupButtonText}>{t.backup.importButton}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.backupButton}
            onPress={handleShowExportDialog}
            disabled={loading}
          >
            <Download color="#2196F3" size={20} />
            <Text style={styles.backupButtonText}>{t.backup.exportButton}</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => setShowCreateDialog(true)}
        >
          <UserPlus color="#FFF" size={24} />
          <Text style={styles.createButtonText}>{t.profiles.createNew}</Text>
        </TouchableOpacity>
      </View>

      <Portal>
        <Dialog visible={showCreateDialog} onDismiss={() => setShowCreateDialog(false)}>
          <Dialog.Title>{t.profiles.createNew}</Dialog.Title>
          <Dialog.Content>
            <Text style={styles.dialogLabel}>{t.profiles.enterName}</Text>
            <TextInput
              style={styles.input}
              value={profileName}
              onChangeText={setProfileName}
              placeholder={t.profiles.namePlaceholder}
              autoFocus
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowCreateDialog(false)}>{t.profiles.cancel}</Button>
            <Button onPress={handleCreateProfile}>{t.profiles.create}</Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog visible={showRenameDialog} onDismiss={() => setShowRenameDialog(false)}>
          <Dialog.Title>{t.profiles.renameTitle}</Dialog.Title>
          <Dialog.Content>
            <Text style={styles.dialogLabel}>{t.profiles.enterName}</Text>
            <TextInput
              style={styles.input}
              value={profileName}
              onChangeText={setProfileName}
              placeholder={t.profiles.namePlaceholder}
              autoFocus
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowRenameDialog(false)}>{t.profiles.cancel}</Button>
            <Button onPress={handleRenameProfile}>{t.profiles.rename}</Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog visible={showExportDialog} onDismiss={() => setShowExportDialog(false)}>
          <Dialog.Title>{t.backup.exportTitle}</Dialog.Title>
          <Dialog.Content>
            <Text style={styles.dialogLabel}>{t.profiles.selectProfile}</Text>
            <View style={styles.profileListContainer}>
              {profiles.map((profile) => (
                <TouchableOpacity
                  key={profile.id}
                  style={styles.exportProfileItem}
                  onPress={() => handleExportProfile(profile)}
                  disabled={loading}
                >
                  <View style={styles.exportProfileIcon}>
                    <User color="#2196F3" size={24} />
                  </View>
                  <Text style={styles.exportProfileName}>{profile.name}</Text>
                  <Download color="#666" size={20} />
                </TouchableOpacity>
              ))}
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowExportDialog(false)}>{t.profiles.cancel}</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
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
    paddingBottom: 30,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerTextContainer: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#E3F2FD',
  },
  languageButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  languageButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  listContainer: {
    padding: 16,
  },
  profileCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profileIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  profileDate: {
    fontSize: 14,
    color: '#999',
  },
  profileActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#999',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#BBB',
    textAlign: 'center',
  },
  bottomButtonsContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  backupButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 12,
  },
  backupButton: {
    flex: 1,
    backgroundColor: '#FFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#2196F3',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  backupButtonText: {
    color: '#2196F3',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  createButton: {
    backgroundColor: '#2196F3',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  createButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  dialogLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#FFF',
  },
  profileListContainer: {
    marginTop: 8,
    maxHeight: 300,
  },
  exportProfileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  exportProfileIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  exportProfileName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
});
