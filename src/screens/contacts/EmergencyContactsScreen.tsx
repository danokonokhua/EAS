import React from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useEmergencyContacts } from '../../hooks/useEmergencyContacts';
import { ContactCard } from '../../components/contacts/ContactCard';
import { AddContactModal } from '../../components/contacts/AddContactModal';
import { EmergencyContact } from '../../types/contacts';
import { FAB, SearchBar } from '@rneui/themed';

export const EmergencyContactsScreen: React.FC = () => {
  const [isModalVisible, setModalVisible] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const { contacts, addContact, deleteContact, isLoading } = useEmergencyContacts();

  const filteredContacts = React.useMemo(() => {
    return contacts.filter((contact) =>
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.phone.includes(searchQuery)
    );
  }, [contacts, searchQuery]);

  const handleAddContact = async (contact: EmergencyContact) => {
    try {
      await addContact(contact);
      setModalVisible(false);
    } catch (error) {
      console.error('Failed to add contact:', error);
    }
  };

  const handleDeleteContact = async (contactId: string) => {
    try {
      await deleteContact(contactId);
    } catch (error) {
      console.error('Failed to delete contact:', error);
    }
  };

  return (
    <View style={styles.container}>
      <SearchBar
        placeholder="Search contacts..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        platform="ios"
        containerStyle={styles.searchBar}
      />

      <FlatList
        data={filteredContacts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ContactCard
            contact={item}
            onDelete={() => handleDeleteContact(item.id)}
          />
        )}
        contentContainerStyle={styles.listContainer}
      />

      <FAB
        icon={{ name: 'add', color: 'white' }}
        placement="right"
        onPress={() => setModalVisible(true)}
      />

      <AddContactModal
        visible={isModalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={handleAddContact}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  searchBar: {
    backgroundColor: '#fff',
    borderBottomColor: '#ddd',
    borderTopColor: '#ddd',
  },
  listContainer: {
    padding: 16,
  },
});
