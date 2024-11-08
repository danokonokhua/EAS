import React from 'react';
import { Card as PaperCard } from 'react-native-paper';

type CardProps = {
  children: React.ReactNode;
  title?: string;
};

export default function Card({ children, title }: CardProps) {
  return (
    <PaperCard>
      {title && <PaperCard.Title title={title} />}
      <PaperCard.Content>{children}</PaperCard.Content>
    </PaperCard>
  );
}
