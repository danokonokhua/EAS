import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Keyboard,
} from 'react-native';
import { debugCommands } from '../../services/debug/debugCommands';
import { loggerService } from '../../services/debug/loggerService';

interface DebugConsoleProps {
  isVisible: boolean;
  onClose: () => void;
}

export const DebugConsole: React.FC<DebugConsoleProps> = ({
  isVisible,
  onClose,
}) => {
  const [command, setCommand] = useState('');
  const [output, setOutput] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const scrollViewRef = useRef<ScrollView>(null);
  useEffect(() => {
    const subscription = loggerService.onLog((log) => {
      addOutput(`${log.level}: ${log.message}`);
    });

    return () => subscription.unsubscribe();
  }, []);

  const addOutput = (text: string) => {
    setOutput((prev) => [...prev, text]);
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleCommand = async () => {
    if (!command.trim()) return;

    addOutput(`> ${command}`);
    const [cmdName, ...args] = command.split(' ');

    try {
      await debugCommands.executeCommand(cmdName, ...args);
    } catch (error) {
      addOutput(`Error: ${(error as Error).message}`);
    }

    setCommand('');
    Keyboard.dismiss();
  };

  const handleCommandChange = (text: string) => {
    setCommand(text);
    
    // Show command suggestions
    if (text.length > 0) {
      const available = debugCommands.getAvailableCommands();
      setSuggestions(
        available.filter(cmd => cmd.toLowerCase().startsWith(text.toLowerCase()))
      );
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionPress = (suggestion: string) => {
    setCommand(suggestion);
    setSuggestions([]);
  };

  if (!isVisible) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Debug Console</Text>
        <TouchableOpacity onPress={onClose}>
          <Text style={styles.closeButton}>×</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.output}
        contentContainerStyle={styles.outputContent}
      >
        {output.map((line, index) => (
          <Text key={index} style={styles.outputLine}>
            {line}
          </Text>
        ))}
      </ScrollView>

      {suggestions.length > 0 && (
        <ScrollView horizontal style={styles.suggestions}>
          {suggestions.map((suggestion) => (
            <TouchableOpacity
              key={suggestion}
              onPress={() => handleSuggestionPress(suggestion)}
              style={styles.suggestion}
            >
              <Text style={styles.suggestionText}>{suggestion}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={command}
          onChangeText={handleCommandChange}
          onSubmitEditing={handleCommand}
          placeholder="Enter debug command..."
          placeholderTextColor="#666"
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TouchableOpacity
          style={styles.executeButton}
          onPress={handleCommand}
        >
          <Text style={styles.executeButtonText}>Execute</Text>
        </TouchableOpacity>
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
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  title: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  closeButton: {
    color: '#fff',
    fontSize: 24,
    padding: 5,
  },
  output: {
    flex: 1,
    padding: 10,
  },
  outputContent: {
    paddingBottom: 10,
  },
  outputLine: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'monospace',
    marginBottom: 2,
  },
  suggestions: {
    maxHeight: 40,
    backgroundColor: '#333',
  },
  suggestion: {
    padding: 8,
    marginHorizontal: 4,
    backgroundColor: '#444',
    borderRadius: 4,
  },
  suggestionText: {
    color: '#fff',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  input: {
    flex: 1,
    height: 40,
    backgroundColor: '#333',
    color: '#fff',
    paddingHorizontal: 10,
    borderRadius: 5,
    marginRight: 10,
    fontFamily: 'monospace',
  },
  executeButton: {
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  executeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
