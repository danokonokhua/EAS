import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ScrollView } from 'react-native';
import { useSelector } from 'react-redux';
import { CustomButton } from '../common';
import { colors } from '../../config/theme';
import { PatientMedicalHistory } from './PatientMedicalHistory';
import { AppointmentHistory } from './AppointmentHistory';
import { patientService } from '../../services/patient/patientService';

export const PatientProfile: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'medical' | 'appointments'>('medical');
  const [loading, setLoading] = useState(false);
  const { user } = useSelector((state: RootState) => state.auth);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'medical':
        return <PatientMedicalHistory patientId={user?.id} />;
      case 'appointments':
        return <AppointmentHistory patientId={user?.id} />;
      default:
        return null;
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Image
          source={{ uri: user?.profileImage || 'default_avatar_url' }}
          style={styles.avatar}
        />
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.info}>{user?.email}</Text>
        <Text style={styles.info}>{user?.phone}</Text>
      </View>

      <View style={styles.tabContainer}>
        <CustomButton
          title="Medical History"
          onPress={() => setActiveTab('medical')}
          style={[
            styles.tabButton,
            activeTab === 'medical' && styles.activeTab
          ]}
          textStyle={activeTab === 'medical' && styles.activeTabText}
        />
        <CustomButton
          title="Appointments"
          onPress={() => setActiveTab('appointments')}
          style={[
            styles.tabButton,
            activeTab === 'appointments' && styles.activeTab
          ]}
          textStyle={activeTab === 'appointments' && styles.activeTabText}
        />
      </View>

      <View style={styles.content}>
        {renderTabContent()}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  info: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tabButton: {
    flex: 1,
    marginHorizontal: 4,
    backgroundColor: colors.surface,
  },
  activeTab: {
    backgroundColor: colors.primary,
  },
  activeTabText: {
    color: colors.white,
  },
  content: {
    flex: 1,
    padding: 16,
  },
});
