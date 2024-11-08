import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, Card, Button, Icon } from '@rneui/themed';
import { useEmergencyHistory } from '../../hooks/useEmergencyHistory';
import { EmergencyHistoryCard } from '../../components/history/EmergencyHistoryCard';
import { FilterModal } from '../../components/history/FilterModal';
import { formatDate } from '../../utils/dateUtils';

export const EmergencyHistoryScreen: React.FC = () => {
  const [isFilterModalVisible, setFilterModalVisible] = React.useState(false);
  const { history, isLoading, fetchMore, filters, updateFilters } = useEmergencyHistory();

  const renderEmergencyCard = ({ item }) => (
    <EmergencyHistoryCard
      emergency={item}
      onPress={() => navigation.navigate('EmergencyDetails', { id: item.id })}
    />
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <Text h4>Emergency History</Text>
      <Button
        icon={<Icon name="filter-list" color="#fff" />}
        onPress={() => setFilterModalVisible(true)}
        type="clear"
      />
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Icon name="history" size={64} color="#ccc" />
      <Text style={styles.emptyText}>No emergency history found</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={history}
        renderItem={renderEmergencyCard}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        onEndReached={fetchMore}
        onEndReachedThreshold={0.5}
        contentContainerStyle={styles.listContainer}
      />

      <FilterModal
        visible={isFilterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        filters={filters}
        onApplyFilters={updateFilters}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  listContainer: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});
