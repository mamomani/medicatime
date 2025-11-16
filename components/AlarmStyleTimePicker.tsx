import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { Button } from 'react-native-paper';
import { useLanguage } from '../contexts/LanguageContext';

interface AlarmStyleTimePickerProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (hour: number, minute: number) => void;
}

export default function AlarmStyleTimePicker({ visible, onClose, onConfirm }: AlarmStyleTimePickerProps) {
  const { t, isRTL } = useLanguage();
  const [selectedHour, setSelectedHour] = useState(12);
  const [selectedMinute, setSelectedMinute] = useState(0);
  const [isPM, setIsPM] = useState(false);

  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  const handleConfirm = () => {
    let hour24 = selectedHour;
    if (isPM && selectedHour !== 12) {
      hour24 = selectedHour + 12;
    } else if (!isPM && selectedHour === 12) {
      hour24 = 0;
    }
    onConfirm(hour24, selectedMinute);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>{t.addMedication.addTime}</Text>
          </View>

          <View style={styles.timeDisplay}>
            <Text style={styles.timeText}>
              {selectedHour.toString().padStart(2, '0')}:{selectedMinute.toString().padStart(2, '0')}
            </Text>
            <View style={styles.ampmContainer}>
              <TouchableOpacity
                style={[styles.ampmButton, !isPM && styles.ampmButtonActive]}
                onPress={() => setIsPM(false)}
              >
                <Text style={[styles.ampmText, !isPM && styles.ampmTextActive]}>AM</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.ampmButton, isPM && styles.ampmButtonActive]}
                onPress={() => setIsPM(true)}
              >
                <Text style={[styles.ampmText, isPM && styles.ampmTextActive]}>PM</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.pickersContainer}>
            <View style={styles.pickerColumn}>
              <Text style={styles.pickerLabel}>{t.common.hour}</Text>
              <ScrollView style={styles.picker} showsVerticalScrollIndicator={false}>
                {hours.map((hour) => (
                  <TouchableOpacity
                    key={hour}
                    style={[
                      styles.pickerItem,
                      selectedHour === hour && styles.pickerItemSelected,
                    ]}
                    onPress={() => setSelectedHour(hour)}
                  >
                    <Text
                      style={[
                        styles.pickerItemText,
                        selectedHour === hour && styles.pickerItemTextSelected,
                      ]}
                    >
                      {hour.toString().padStart(2, '0')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <Text style={styles.separator}>:</Text>

            <View style={styles.pickerColumn}>
              <Text style={styles.pickerLabel}>{t.common.minute}</Text>
              <ScrollView style={styles.picker} showsVerticalScrollIndicator={false}>
                {minutes.map((minute) => (
                  <TouchableOpacity
                    key={minute}
                    style={[
                      styles.pickerItem,
                      selectedMinute === minute && styles.pickerItemSelected,
                    ]}
                    onPress={() => setSelectedMinute(minute)}
                  >
                    <Text
                      style={[
                        styles.pickerItemText,
                        selectedMinute === minute && styles.pickerItemTextSelected,
                      ]}
                    >
                      {minute.toString().padStart(2, '0')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>

          <View style={styles.buttonsContainer}>
            <Button
              mode="text"
              onPress={onClose}
              textColor="#666"
              style={styles.button}
            >
              {t.common.cancel}
            </Button>
            <Button
              mode="contained"
              onPress={handleConfirm}
              buttonColor="#2196F3"
              style={styles.button}
            >
              {t.common.ok}
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    width: '85%',
    maxWidth: 400,
    overflow: 'hidden',
  },
  header: {
    padding: 20,
    backgroundColor: '#2196F3',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
  },
  timeDisplay: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  timeText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 16,
  },
  ampmContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  ampmButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#E0E0E0',
    minWidth: 60,
    alignItems: 'center',
  },
  ampmButtonActive: {
    backgroundColor: '#2196F3',
  },
  ampmText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  ampmTextActive: {
    color: '#FFF',
  },
  pickersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    gap: 16,
  },
  pickerColumn: {
    flex: 1,
    alignItems: 'center',
  },
  pickerLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    fontWeight: '600',
  },
  picker: {
    height: 200,
    width: '100%',
  },
  pickerItem: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderRadius: 8,
    marginVertical: 2,
  },
  pickerItemSelected: {
    backgroundColor: '#E3F2FD',
  },
  pickerItemText: {
    fontSize: 20,
    color: '#666',
  },
  pickerItemTextSelected: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  separator: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2196F3',
    marginTop: 30,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  button: {
    minWidth: 80,
  },
});
