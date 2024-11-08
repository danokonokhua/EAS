import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NetworkInspector } from '../../components/debug/NetworkInspector';
import { networkMonitor } from '../../services/debug/networkMonitor';

describe('NetworkInspector Integration Tests', () => {
  const mockRequest = {
    id: '1',
    url: 'https://api.example.com/data',
    method: 'GET',
    status: 200,
    duration: 150,
    requestHeaders: { 'Content-Type': 'application/json' },
    requestBody: null,
    responseHeaders: { 'Content-Type': 'application/json' },
    responseBody: { data: 'test' },
    timestamp: Date.now(),
  };

  beforeEach(() => {
    // Reset network monitor
    networkMonitor.clearLogs();
  });

  it('should display network requests and allow inspection', async () => {
    // Arrange
    const { getByText, getByTestId, queryByText } = render(<NetworkInspector />);
    
    // Act - Simulate new network request
    networkMonitor.addRequest(mockRequest);

    // Assert - Request appears in list
    await waitFor(() => {
      expect(getByText('GET')).toBeVisible();
      expect(getByText('https://api.example.com/data')).toBeVisible();
    });

    // Act - Select request
    fireEvent.press(getByTestId(`request-${mockRequest.id}`));

    // Assert - Details are shown
    expect(getByText('Request Details')).toBeVisible();
    expect(getByText('Content-Type: application/json')).toBeVisible();
  });

  it('should highlight failed requests', async () => {
    // Arrange
    const failedRequest = { ...mockRequest, status: 404 };
    const { getByTestId } = render(<NetworkInspector />);
    
    // Act
    networkMonitor.addRequest(failedRequest);

    // Assert
    await waitFor(() => {
      const requestItem = getByTestId(`request-${failedRequest.id}`);
      expect(requestItem).toHaveStyle({ backgroundColor: '#ffebee' });
    });
  });
});
function expect(requestItem: any) {
    throw new Error('Function not implemented.');
}

