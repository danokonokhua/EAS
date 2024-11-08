import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../auth/authService';
import { errorHandlingService } from '../error/errorHandlingService';

interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
  notifyOnEmergency: boolean;
}

class EmergencyContactService {
  private static instance: EmergencyContactService;
  private contacts: Map<string, EmergencyContact[]> = new Map();
  private listeners: Set<(contacts: EmergencyContact[]) => void> = new Set();

  private constructor() {
    this.loadContacts();
  }

  static getInstance(): EmergencyContactService {
    if (!EmergencyContactService.instance) {
      EmergencyContactService.instance = new EmergencyContactService();
    }
    return EmergencyContactService.instance;
  }

  private async loadContacts(): Promise<void> {
    try {
      const user = authService.getCurrentUser();
      if (!user) return;

      const contactsData = await AsyncStorage.getItem(`contacts_${user.id}`);
      if (contactsData) {
        this.contacts.set(user.id, JSON.parse(contactsData));
        this.notifyListeners(user.id);
      }
    } catch (error) {
      errorHandlingService.handleError(error as Error);
    }
  }

  private async saveContacts(userId: string): Promise<void> {
    try {
      const contacts = this.contacts.get(userId) || [];
      await AsyncStorage.setItem(`contacts_${userId}`, JSON.stringify(contacts));
    } catch (error) {
      errorHandlingService.handleError(error as Error);
    }
  }

  async addContact(contact: Omit<EmergencyContact, 'id'>): Promise<void> {
    const user = authService.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const newContact: EmergencyContact = {
      ...contact,
      id: Date.now().toString(),
    };

    const userContacts = this.contacts.get(user.id) || [];
    userContacts.push(newContact);
    this.contacts.set(user.id, userContacts);

    await this.saveContacts(user.id);
    this.notifyListeners(user.id);
  }

  async updateContact(contactId: string, updates: Partial<EmergencyContact>): Promise<void> {
    const user = authService.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const userContacts = this.contacts.get(user.id) || [];
    const contactIndex = userContacts.findIndex(c => c.id === contactId);

    if (contactIndex === -1) throw new Error('Contact not found');

    userContacts[contactIndex] = {
      ...userContacts[contactIndex],
      ...updates,
    };

    await this.saveContacts(user.id);
    this.notifyListeners(user.id);
  }

  async deleteContact(contactId: string): Promise<void> {
    const user = authService.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const userContacts = this.contacts.get(user.id) || [];
    const updatedContacts = userContacts.filter(c => c.id !== contactId);
    this.contacts.set(user.id, updatedContacts);

    await this.saveContacts(user.id);
    this.notifyListeners(user.id);
  }

  getContacts(): EmergencyContact[] {
    const user = authService.getCurrentUser();
    if (!user) return [];
    return this.contacts.get(user.id) || [];
  }

  addContactsListener(listener: (contacts: EmergencyContact[]) => void): () => void {
    this.listeners.add(listener);
    const user = authService.getCurrentUser();
    if (user) {
      listener(this.contacts.get(user.id) || []);
    }
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(userId: string): void {
    const contacts = this.contacts.get(userId) || [];
    this.listeners.forEach(listener => listener(contacts));
  }
}

export const emergencyContactService = EmergencyContactService.getInstance();
