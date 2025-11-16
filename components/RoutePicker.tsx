import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { MedicationRoute, MEDICATION_ROUTES, getRouteTranslationKey } from '../data/models';
import { useLanguage } from '../contexts/LanguageContext';

interface RoutePickerProps {
  value: MedicationRoute;
  onValueChange: (value: MedicationRoute) => void;
}

export default function RoutePicker({ value, onValueChange }: RoutePickerProps) {
  const { t } = useLanguage();

  return (
    <View style={styles.pickerContainer}>
      <Picker
        selectedValue={value}
        onValueChange={(itemValue) => onValueChange(itemValue as MedicationRoute)}
        style={styles.picker}
      >
        {MEDICATION_ROUTES.map((route) => {
          const translationKey = getRouteTranslationKey(route);
          return (
            <Picker.Item
              key={route}
              label={t.routes[translationKey as keyof typeof t.routes]}
              value={route}
            />
          );
        })}
      </Picker>
    </View>
  );
}

const styles = StyleSheet.create({
  pickerContainer: {
    backgroundColor: '#FFF',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#CCC',
  },
  picker: {
    height: 50,
  },
});
