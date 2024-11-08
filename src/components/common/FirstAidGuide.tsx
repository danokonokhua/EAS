import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Card, Text } from '@ui-kitten/components';
import FastImage from 'react-native-fast-image';

interface FirstAidStep {
  title: string;
  description: string;
  gifUrl: string;
}

interface FirstAidGuideProps {
  steps: FirstAidStep[];
}

export const FirstAidGuide: React.FC<FirstAidGuideProps> = ({ steps }) => {
  return (
    <ScrollView style={styles.container}>
      {steps.map((step, index) => (
        <Card key={index} style={styles.card}>
          <Text category="h6">{step.title}</Text>
          <FastImage
            style={styles.gif}
            source={{ uri: step.gifUrl }}
            resizeMode={FastImage.resizeMode.contain}
          />
          <Text>{step.description}</Text>
        </Card>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    margin: 16,
  },
  gif: {
    width: '100%',
    height: 200,
    marginVertical: 16,
  },
});
