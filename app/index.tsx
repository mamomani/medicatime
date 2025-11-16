import React, { useEffect, useState } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { requestNotificationPermissions } from '../utils/notifications';
import { getActiveProfile } from '../utils/storage';

import ProfileSelectionScreen from '../screens/ProfileSelectionScreen';
import HomeScreen from '../screens/HomeScreen';
import AddMedicationScreen from '../screens/AddMedicationScreen';
import LogScreen from '../screens/LogScreen';
import EditLogScreen from '../screens/EditLogScreen';
import BackupScreen from '../screens/BackupScreen';

const Stack = createStackNavigator();

const MainStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#F5F5F5' },
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="AddMedication" component={AddMedicationScreen} />
      <Stack.Screen name="Logs" component={LogScreen} />
      <Stack.Screen name="EditLog" component={EditLogScreen} />
      <Stack.Screen name="Backup" component={BackupScreen} />
    </Stack.Navigator>
  );
}

export default function App() {
  const [initialRoute, setInitialRoute] = useState<string | null>(null);

  useEffect(() => {
    const initialize = async () => {
      await requestNotificationPermissions();
      const profile = await getActiveProfile();
      setInitialRoute(profile ? 'Main' : 'ProfileSelection');
    };
    initialize();
  }, []);

  if (initialRoute === null) {
    return null;
  }

  return (
    <Stack.Navigator
      initialRouteName={initialRoute}
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#F5F5F5' },
      }}
    >
      <Stack.Screen name="ProfileSelection" component={ProfileSelectionScreen} />
      <Stack.Screen name="Main" component={MainStack} />
    </Stack.Navigator>
  );
}
