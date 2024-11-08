import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Text, Avatar, ListItem } from '@rneui/themed';
import { useAuth } from '../../hooks/useAuth';
import { useImagePicker } from '../../hooks/useImagePicker';
import { ProfileSection } from '../../components/profile/ProfileSection';
import { EditProfileModal } from '../../components/profile/EditProfileModal';
import { MaterialIcons } from '@expo/vector-icons';

export const ProfileScreen: React.FC = () => {
  const { user, updateProfile, logout } = useAuth();
  const { pickImage } = useImagePicker();
  const [isEditModalVisible, setEditModalVisible] = React.useState(false);

  const handleUpdateAvatar = async () => {
    const result = await pickImage();
    if (result) {
      await updateProfile({ avatar: result.uri });
    }
  };

  const profileSections = [
    {
      title: 'Personal Information',
      items: [
        { icon: 'person', title: 'Full Name', value: user?.name },
        { icon: 'phone', title: 'Phone Number', value: user?.phone },
        { icon: 'email', title: 'Email', value: user?.email },
      ],
    },
    {
      title: 'Emergency Settings',
      items: [
        { icon: 'local-hospital', title: 'Blood Type', value: user?.bloodType },
        { icon: 'medical-services', title: 'Medical Conditions', value: user?.medicalConditions?.join(', ') },
        { icon: 'medication', title: 'Allergies', value: user?.allergies?.join(', ') },
      ],
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleUpdateAvatar}>
          <Avatar
            size={100}
            rounded
            source={{ uri: user?.avatar }}
            containerStyle={styles.avatar}
          >
            <Avatar.Accessory size={30} />
          </Avatar>
        </TouchableOpacity>
        
        <Text h4 style={styles.name}>{user?.name}</Text>
        <Text style={styles.phone}>{user?.phone}</Text>
      </View>

      {profileSections.map((section, index) => (
        <ProfileSection
          key={index}
          title={section.title}
          items={section.items}
        />
      ))}

      <ListItem onPress={() => setEditModalVisible(true)}>
        <MaterialIcons name="edit" size={24} color="#007AFF" />
        <ListItem.Content>
          <ListItem.Title>Edit Profile</ListItem.Title>
        </ListItem.Content>
        <ListItem.Chevron />
      </ListItem>

      <ListItem onPress={logout} bottomDivider>
        <MaterialIcons name="logout" size={24} color="#FF3B30" />
        <ListItem.Content>
          <ListItem.Title style={{ color: '#FF3B30' }}>Logout</ListItem.Title>
        </ListItem.Content>
      </ListItem>

      <EditProfileModal
        visible={isEditModalVisible}
        onClose={() => setEditModalVisible(false)}
        onSubmit={updateProfile}
        initialData={user}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  avatar: {
    backgroundColor: '#ddd',
  },
  name: {
    marginTop: 10,
    marginBottom: 5,
  },
  phone: {
    color: '#666',
  },
});
