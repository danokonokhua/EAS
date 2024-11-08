import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { NetworkInspector } from './NetworkInspector';
import { PerformanceMonitor } from './PerformanceMonitor';
import { ConsoleLogger } from './ConsoleLogger';
import { DeviceInfo } from './DeviceInfo';

type DebugTab = 'network' | 'performance' | 'console' | 'device';

export const RemoteDebuggerUI: React.FC = () => {
  const [activeTab, setActiveTab] = useState<DebugTab>('network');
  const [isCollapsed, setIsCollapsed] = useState(false);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'network':
        return <NetworkInspector />;
      case 'performance':
        return <PerformanceMonitor />;
      case 'console':
        return <ConsoleLogger />;
      case 'device':
        return <DeviceInfo />;
      default:
        return null;
    }
  };

  const TabButton: React.FC<{
    tab: DebugTab;
    label: string;
  }> = ({ tab, label }) => (
    <TouchableOpacity
      style={[
        styles.tabButton,
        activeTab === tab && styles.activeTabButton
      ]}
      onPress={() => setActiveTab(tab)}
    >
      <Text style={[
        styles.tabButtonText,
        activeTab === tab && styles.activeTabButtonText
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  if (isCollapsed) {
    return (
      <TouchableOpacity 
        style={styles.collapsedButton}
        onPress={() => setIsCollapsed(false)}
      >
        <Text style={styles.collapsedButtonText}>Debug</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Remote Debugger</Text>
        <TouchableOpacity 
          style={styles.collapseButton}
          onPress={() => setIsCollapsed(true)}
        >
          <Text>Collapse</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.tabBar}>
        <TabButton tab="network" label="Network" />
        <TabButton tab="performance" label="Performance" />
        <TabButton tab="console" label="Console" />
        <TabButton tab="device" label="Device" />
      </View>
      
      <View style={styles.content}>
        {renderTabContent()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tabButton: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
  },
  activeTabButton: {
    borderBottomWidth: 2,
    borderBottomColor: '#007AFF',
  },
  tabButtonText: {
    color: '#666',
  },
  activeTabButtonText: {
    color: '#007AFF',
  },
  content: {
    flex: 1,
  },
  collapseButton: {
    padding: 5,
  },
  collapsedButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
  },
  collapsedButtonText: {
    color: '#fff',
  },
});
