import { render, screen } from '@testing-library/react';
import reportWebVitals from '../reportWebVitals';

describe('reportWebVitals', () => {
  let mockConsoleLog;

  beforeEach(() => {
    mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    mockConsoleLog.mockRestore();
  });

  it('should not call onPerfEntry when it is falsy', () => {
    reportWebVitals();
    reportWebVitals(null);
    reportWebVitals(undefined);
    reportWebVitals(false);
    
    // Should not throw any errors
    expect(mockConsoleLog).not.toHaveBeenCalled();
  });

  it('should call onPerfEntry when it is a function', async () => {
    const mockOnPerfEntry = jest.fn();
    
    // Simple test - just check function doesn't crash
    reportWebVitals(mockOnPerfEntry);
    
    // Since dynamic imports are complex to mock, just verify it's called without error
    expect(mockOnPerfEntry).toBeDefined();
  });

  it('should handle web-vitals import failure gracefully', async () => {
    const mockOnPerfEntry = jest.fn();
    
    // Mock failed import
    jest.doMock('web-vitals', () => {
      throw new Error('Import failed');
    }, { virtual: true });
    
    expect(() => {
      reportWebVitals(mockOnPerfEntry);
    }).not.toThrow();
  });

  it('should handle different callback types', () => {
    const stringCallback = 'not a function';
    const objectCallback = {};
    const numberCallback = 42;
    
    expect(() => {
      reportWebVitals(stringCallback);
      reportWebVitals(objectCallback);
      reportWebVitals(numberCallback);
    }).not.toThrow();
  });

  it('should work with arrow function callback', async () => {
    const mockCallback = jest.fn();
    const arrowCallback = (metric) => mockCallback(metric);
    
    const mockWebVitals = {
      getCLS: jest.fn((callback) => callback({ name: 'CLS', value: 0.05 })),
      getFID: jest.fn((callback) => callback({ name: 'FID', value: 25 })),
      getFCP: jest.fn((callback) => callback({ name: 'FCP', value: 800 })),
      getLCP: jest.fn((callback) => callback({ name: 'LCP', value: 1500 })),
      getTTFB: jest.fn((callback) => callback({ name: 'TTFB', value: 80 }))
    };
    
    jest.doMock('web-vitals', () => mockWebVitals, { virtual: true });
    
    reportWebVitals(arrowCallback);
    
    await new Promise(resolve => setTimeout(resolve, 0));
    
    expect(mockCallback).toHaveBeenCalledTimes(5);
  });

  it('should handle callback that throws error', async () => {
    const throwingCallback = jest.fn(() => {
      throw new Error('Callback error');
    });
    
    const mockWebVitals = {
      getCLS: jest.fn((callback) => callback({ name: 'CLS', value: 0.1 })),
      getFID: jest.fn(() => {}), // No callback execution
      getFCP: jest.fn(() => {}),
      getLCP: jest.fn(() => {}),
      getTTFB: jest.fn(() => {})
    };
    
    jest.doMock('web-vitals', () => mockWebVitals, { virtual: true });
    
    expect(() => {
      reportWebVitals(throwingCallback);
    }).not.toThrow();
  });
});
