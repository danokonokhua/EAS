import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { EmergencyRequest } from '../../types/emergency.types';
import { colors } from '../../config/theme';
import { formatDistanceToNow } from 'date-fns';
import 'date-fns';

interface EmergencyRequestsListProps {
  requests: EmergencyRequest[];
  onRequestAccept: (request: EmergencyRequest) => void;
}

export const EmergencyRequestsList: React.FC<EmergencyRequestsListProps> = ({
  requests,
  onRequestAccept,
}) => {
  const renderItem = ({ item }: { item: EmergencyRequest }) => (
    <View style={styles.requestItem}>
      <View style={styles.requestHeader}>
        <Text style={styles.requestType}>{item.emergencyType}</Text>
        <Text style={styles.requestTime}>
          {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
        </Text>
      </View>
      
      <View style={styles.locationContainer}>
        <Text style={styles.locationText}>
          {item.location.address || 'Location pending...'}
        </Text>
      </View>

      <View style={styles.actionContainer}>
        <TouchableOpacity
          style={styles.acceptButton}
          onPress={() => onRequestAccept(item)}
        >
          <Text style={styles.acceptButtonText}>Accept Request</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Emergency Requests</Text>
      <FlatList
        data={requests}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={() => (
          <Text style={styles.emptyText}>No active emergency requests</Text>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: colors.textPrimary,
  },
  listContainer: {
    paddingBottom: 16,
  },
  requestItem: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  requestType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
  },
  requestTime: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  locationContainer: {
    marginBottom: 12,
  },
  locationText: {
    fontSize: 14,
    color: colors.textPrimary,
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  acceptButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  acceptButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    color: colors.textSecondary,
    marginTop: 16,
  },
});
