import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Card, Button } from 'react-native-paper';
import { LogMessage, LoggerObserver, loggerService } from '../../services/LoggerService';

export const RemoteDebugUI: React.FC = () => {
  const [logs, setLogs] = useState<LogMessage[]>([]);
  const [autoScroll, setAutoScroll] = useState(true);
  const scrollViewRef = React.useRef<ScrollView>(null);

  useEffect(() => {
    const observer: LoggerObserver = {
      onLogMessage: (message) => {
        setLogs(prevLogs => [...prevLogs, message]);
      }
    };

    loggerService.addObserver(observer);

    // Initialize with existing logs
    setLogs(loggerService.getLogHistory());

    return () => {
      loggerService.removeObserver(observer);
    };
  }, []);

  useEffect(() => {
    if (autoScroll && scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [logs, autoScroll]);

  const getLogColor = (level: LogMessage['level']) => {
    switch (level) {
      case 'error': return '#ff0000';
      case 'warn': return '#ffa500';
      case 'info': return '#000000';
      default: return '#000000';
    }
  };

  const clearLogs = () => {
    loggerService.clearHistory();
    setLogs([]);
  };

  return (
    <Card style={styles.container}>
      <Card.Title title="Remote Debug Console" />
      <Card.Content>
        <View style={styles.controls}>
          <Button 
            mode="contained" 
            onPress={clearLogs}
            style={styles.button}
          >
            Clear Logs
          </Button>
          <Button
            mode="outlined"
            onPress={() => setAutoScroll(!autoScroll)}
            style={styles.button}
          >
            {autoScroll ? 'Disable Auto-scroll' : 'Enable Auto-scroll'}
          </Button>
        </View>
        <ScrollView 
          ref={scrollViewRef}
          style={styles.logContainer}
          onContentSizeChange={() => {
            if (autoScroll && scrollViewRef.current) {
              scrollViewRef.current.scrollToEnd({ animated: true });
            }
          }}
        >
          {logs.map((log, index) => (
            <Text 
              key={index} 
              style={[styles.logEntry, { color: getLogColor(log.level) }]}
            >
              [{log.timestamp.toLocaleTimeString()}] [{log.level.toUpperCase()}] {log.message}
              {log.metadata && `\n${JSON.stringify(log.metadata, null, 2)}`}
            </Text>
          ))}
        </ScrollView>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 8,
    maxHeight: '50%',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  button: {
    flex: 1,
    marginHorizontal: 4,
  },
  logContainer: {
    maxHeight: 300,
    backgroundColor: '#f5f5f5',
    padding: 8,
    borderRadius: 4,
  },
  logEntry: {
    fontFamily: 'monospace',
    fontSize: 12,
    marginBottom: 4,
  },
});
