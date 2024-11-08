import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Card, Text, Button, Icon, Progress } from '@ui-kitten/components';
import { TrainingModule, TrainingContent } from '../../types/training.types';
import { trainingService } from '../../services/training/trainingService';
import { VideoPlayer } from './VideoPlayer';
import { QuizSection } from './QuizSection';
import { AnimationPlayer } from './AnimationPlayer';

interface TrainingModuleProps {
  moduleId: string;
  userId: string;
  onComplete: () => void;
}

export const TrainingModuleComponent: React.FC<TrainingModuleProps> = ({
  moduleId,
  userId,
  onComplete,
}) => {
  const [module, setModule] = useState<TrainingModule | null>(null);
  const [currentContent, setCurrentContent] = useState<TrainingContent | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [isOffline, setIsOffline] = useState<boolean>(false);

  useEffect(() => {
    loadModule();
    checkOfflineAvailability();
  }, []);

  const loadModule = async () => {
    try {
      const moduleData = await trainingService.getTrainingModule(moduleId);
      setModule(moduleData);
      setCurrentContent(moduleData.content[0]);
    } catch (error) {
      console.error('Failed to load training module:', error);
    }
  };

  const handleContentComplete = async (contentId: string) => {
    try {
      await trainingService.trackProgress(userId, moduleId, contentId);
      
      // Update progress
      const completedCount = module?.content.filter(c => c.completed).length || 0;
      const totalCount = module?.content.length || 1;
      setProgress((completedCount / totalCount) * 100);

      // Move to next content
      if (module && currentContent) {
        const currentIndex = module.content.findIndex(c => c.id === currentContent.id);
        if (currentIndex < module.content.length - 1) {
          setCurrentContent(module.content[currentIndex + 1]);
        } else {
          onComplete();
        }
      }
    } catch (error) {
      console.error('Failed to track progress:', error);
    }
  };

  const renderContent = () => {
    if (!currentContent) return null;

    switch (currentContent.type) {
      case 'VIDEO':
        return (
          <VideoPlayer
            url={currentContent.content.url!}
            onComplete={() => handleContentComplete(currentContent.id)}
          />
        );
      case 'QUIZ':
        return (
          <QuizSection
            questions={currentContent.content.questions!}
            onComplete={() => handleContentComplete(currentContent.id)}
          />
        );
      case 'ANIMATION':
        return (
          <AnimationPlayer
            url={currentContent.content.url!}
            onComplete={() => handleContentComplete(currentContent.id)}
          />
        );
      case 'TEXT':
        return (
          <Card>
            <Text>{currentContent.content.text}</Text>
            <Button onPress={() => handleContentComplete(currentContent.id)}>
              Mark as Complete
            </Button>
          </Card>
        );
      default:
        return null;
    }
  };

  return (
    <ScrollView style={styles.container}>
      {module && (
        <>
          <Card style={styles.headerCard}>
            <Text category="h5">{module.title}</Text>
            <Text category="s1">
              {module.duration} minutes • {module.difficulty}
            </Text>
            <Progress
              style={styles.progress}
              value={progress}
              status="primary"
            />
          </Card>

          {renderContent()}

          {!isOffline && (
            <Button
              style={styles.downloadButton}
              appearance="ghost"
              status="basic"
              accessoryLeft={props => <Icon {...props} name="download-outline" />}
              onPress={() => trainingService.downloadOfflineContent(moduleId)}
            >
              Download for Offline Use
            </Button>
          )}
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerCard: {
    margin: 16,
  },
  progress: {
    marginTop: 16,
  },
  downloadButton: {
    margin: 16,
  },
});
