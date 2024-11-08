import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Switch,
} from 'react-native';
import { loggerService } from '../../services/debug/loggerService';
import { performanceService } from '../../services/debug/performanceService';
import { uiPerformanceMonitor } from '../../services/debug/uiPerformanceMonitor';
import { nativeDebugger } from '../../services/debug/nativeDebugger';
import { remoteDebugger } from '../../services/debug/remoteDebugger';
import { pluginSystem } from '../../services/debug/pluginSystem';
import { performanceProfiler } from '../../services/debug/performanceProfiler';
import { testEnvironmentDebugger } from '../../services/debug/testEnvironment';
import { networkMocker } from '../../services/debug/networkMocker';
import { stateTimeTravel } from '../../services/debug/stateTimeTravel';
import { DebugConsole } from './DebugConsole';
import { memoryLeakDetector } from '../../services/debug/memoryLeakDetector';
import { debugReportGenerator } from '../../services/debug/debugReportGenerator';

interface DebugMenuProps {
  isVisible: boolean;
  onClose: () => void;
}

export const DebugMenu: React.FC<DebugMenuProps> = ({ isVisible, onClose }) => {
  const [isPerformanceMonitoring, setIsPerformanceMonitoring] = useState(false);
  const [isRemoteDebugging, setIsRemoteDebugging] = useState(false);
  const [isRecordingPerformance, setIsRecordingPerformance] = useState(false);
  const [isTestMode, setIsTestMode] = useState(false);
  const [isMockingEnabled, setIsMockingEnabled] = useState(false);
  const [isStateRecording, setIsStateRecording] = useState(false);
  const [isConsoleVisible, setIsConsoleVisible] = useState(false);
  const [isMemoryMonitoring, setIsMemoryMonitoring] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  const togglePerformanceMonitoring = () => {
    if (isPerformanceMonitoring) {
      uiPerformanceMonitor.stopMonitoring();
    } else {
      uiPerformanceMonitor.startMonitoring();
    }
    setIsPerformanceMonitoring(!isPerformanceMonitoring);
  };

  const toggleRemoteDebugging = async () => {
    if (isRemoteDebugging) {
      remoteDebugger.disconnect();
    } else {
      await remoteDebugger.connect();
    }
    setIsRemoteDebugging(!isRemoteDebugging);
  };

  const togglePerformanceRecording = () => {
    if (isRecordingPerformance) {
      const metrics = performanceProfiler.stopRecording();
      loggerService.info('Performance metrics', { metrics });
    } else {
      performanceProfiler.startRecording();
    }
    setIsRecordingPerformance(!isRecordingPerformance);
  };

  const clearLogs = () => {
    loggerService.clearLogs();
    nativeDebugger.clearNativeLogs();
  };

  const downloadLogs = async () => {
    try {
      const logs = {
        appLogs: loggerService.getLogs(),
        nativeLogs: nativeDebugger.getNativeLogs(),
        performanceMetrics: performanceService.getPerformanceMetrics(),
      };

      // Implementation for sharing logs
      await fileService.exportToFile(JSON.stringify(logs, null, 2), 'debug-logs.json');
      console.log('Logs ready for download:', logs);
    } catch (error) {
      loggerService.error('Failed to download logs', error as Error);
    }
  };

  const toggleTestMode = () => {
    if (isTestMode) {
      testEnvironmentDebugger.disableTestMode();
    } else {
      testEnvironmentDebugger.enableTestMode();
    }
    setIsTestMode(!isTestMode);
  };

  const toggleNetworkMocking = () => {
    if (isMockingEnabled) {
      networkMocker.disableMocking();
    } else {
      networkMocker.enableMocking();
    }
    setIsMockingEnabled(!isMockingEnabled);
  };

  const toggleStateRecording = () => {
    if (isStateRecording) {
      stateTimeTravel.stopRecording();
    } else {
      stateTimeTravel.startRecording();
    }
    setIsStateRecording(!isStateRecording);
  };

  const toggleMemoryMonitoring = () => {
    if (isMemoryMonitoring) {
      memoryLeakDetector.stopMonitoring();
    } else {
      memoryLeakDetector.startMonitoring();
    }
    setIsMemoryMonitoring(!isMemoryMonitoring);
  };

  const handleGenerateReport = async () => {
    try {
      setIsGeneratingReport(true);
      const report = await debugReportGenerator.generateReport();
      const reportPath = await debugReportGenerator.saveReport(report);
      await debugReportGenerator.shareReport(reportPath);
    } catch (error) {
      loggerService.error('Failed to generate debug report', error as Error);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.menu}>
          <Text style={styles.title}>Debug Menu</Text>
          
          <ScrollView>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Performance</Text>
              <View style={styles.row}>
                <Text>Monitor UI Performance</Text>
                <Switch
                  value={isPerformanceMonitoring}
                  onValueChange={togglePerformanceMonitoring}
                />
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Remote Debugging</Text>
              <View style={styles.row}>
                <Text>Enable Remote Debugging</Text>
                <Switch
                  value={isRemoteDebugging}
                  onValueChange={toggleRemoteDebugging}
                />
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Performance Profiling</Text>
              <View style={styles.row}>
                <Text>Record Performance Metrics</Text>
                <Switch
                  value={isRecordingPerformance}
                  onValueChange={togglePerformanceRecording}
                />
              </View>
              <TouchableOpacity
                style={styles.button}
                onPress={() => performanceProfiler.clearMetrics()}
              >
                <Text style={styles.buttonText}>Clear Metrics</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Logs</Text>
              <TouchableOpacity style={styles.button} onPress={clearLogs}>
                <Text style={styles.buttonText}>Clear Logs</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button} onPress={downloadLogs}>
                <Text style={styles.buttonText}>Download Logs</Text>
              </TouchableOpacity>
            </View>

            {/* Test Environment Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Test Environment</Text>
              <View style={styles.row}>
                <Text>Enable Test Mode</Text>
                <Switch value={isTestMode} onValueChange={toggleTestMode} />
              </View>
            </View>

            {/* Network Mocking Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Network Mocking</Text>
              <View style={styles.row}>
                <Text>Enable Mocking</Text>
                <Switch 
                  value={isMockingEnabled} 
                  onValueChange={toggleNetworkMocking} 
                />
              </View>
            </View>

            {/* State Time Travel Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>State Time Travel</Text>
              <View style={styles.row}>
                <Text>Record State Changes</Text>
                <Switch 
                  value={isStateRecording} 
                  onValueChange={toggleStateRecording} 
                />
              </View>
              <View style={styles.buttonRow}>
                <TouchableOpacity 
                  style={styles.button}
                  onPress={() => stateTimeTravel.undo()}
                >
                  <Text style={styles.buttonText}>Undo</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.button}
                  onPress={() => stateTimeTravel.redo()}
                >
                  <Text style={styles.buttonText}>Redo</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Memory Monitoring</Text>
              <Switch
                value={isMemoryMonitoring}
                onValueChange={toggleMemoryMonitoring}
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Debug Report</Text>
              <TouchableOpacity
                style={styles.button}
                onPress={handleGenerateReport}
                disabled={isGeneratingReport}
              >
                <Text style={styles.buttonText}>
                  {isGeneratingReport ? 'Generating...' : 'Generate Report'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Debug Console</Text>
              <TouchableOpacity
                style={styles.button}
                onPress={() => setIsConsoleVisible(true)}
              >
                <Text style={styles.buttonText}>Open Console</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <DebugConsole
        isVisible={isConsoleVisible}
        onClose={() => setIsConsoleVisible(false)}
      />
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menu: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
  },
  closeButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#FF3B30',
    borderRadius: 5,
  },
  closeButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});
