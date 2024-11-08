import React from 'react';
import { NetworkInspector } from '../components/debug/NetworkInspector';
import { NetworkMonitor } from '../services/NetworkMonitor';

const networkMonitor = new NetworkMonitor();

export const DebugScreen: React.FC<{networkMonitor?: NetworkMonitor}> = () => {
  return (
    <NetworkInspector networkMonitor={networkMonitor} />
  );
};
