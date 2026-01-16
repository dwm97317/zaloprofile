import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import VirtualizedOrderList from '../VirtualizedOrderList';

// Mock @tanstack/react-virtual
vi.mock('@tanstack/react-virtual', () => ({
  useVirtualizer: vi.fn(() => ({
    getVirtualItems: vi.fn(() => [
      { index: 0, key: 0, start: 0, size: 200 },
      { index: 1, key: 1, start: 200, size: 200 },
      { index: 2, key: 2, start: 400, size: 200 },
    ]),
    getTotalSize: vi.fn(() => 1000),
    measureElement: vi.fn(),
  })),
}));

describe('VirtualizedOrderList', () => {
  const mockItems = [
    { id: 1, name: 'Order 1' },
    { id: 2, name: 'Order 2' },
    { id: 3, name: 'Order 3' },
    { id: 4, name: 'Order 4' },
    { id: 5, name: 'Order 5' },
  ];

  const mockRenderItem = vi.fn((item) => (
    <div data-testid={`order-${item.id}`}>{item.name}</div>
  ));

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render virtualized list container', () => {
    render(
      <VirtualizedOrderList
        items={mockItems}
        renderItem={mockRenderItem}
      />
    );

    const container = screen.getByRole('generic');
    expect(container).toBeTruthy();
  });

  it('should render only visible items', () => {
    render(
      <VirtualizedOrderList
        items={mockItems}
        renderItem={mockRenderItem}
      />
    );

    // Should render 3 items (mocked virtual items)
    expect(mockRenderItem).toHaveBeenCalledTimes(3);
  });

  it('should call renderItem with correct item and index', () => {
    render(
      <VirtualizedOrderList
        items={mockItems}
        renderItem={mockRenderItem}
      />
    );

    expect(mockRenderItem).toHaveBeenCalledWith(mockItems[0], 0);
    expect(mockRenderItem).toHaveBeenCalledWith(mockItems[1], 1);
    expect(mockRenderItem).toHaveBeenCalledWith(mockItems[2], 2);
  });

  it('should handle empty items array', () => {
    render(
      <VirtualizedOrderList
        items={[]}
        renderItem={mockRenderItem}
      />
    );

    expect(mockRenderItem).not.toHaveBeenCalled();
  });

  it('should apply custom estimateSize', () => {
    const { useVirtualizer } = require('@tanstack/react-virtual');
    
    render(
      <VirtualizedOrderList
        items={mockItems}
        renderItem={mockRenderItem}
        estimateSize={300}
      />
    );

    expect(useVirtualizer).toHaveBeenCalledWith(
      expect.objectContaining({
        estimateSize: expect.any(Function),
      })
    );
  });

  it('should apply custom overscan', () => {
    const { useVirtualizer } = require('@tanstack/react-virtual');
    
    render(
      <VirtualizedOrderList
        items={mockItems}
        renderItem={mockRenderItem}
        overscan={10}
      />
    );

    expect(useVirtualizer).toHaveBeenCalledWith(
      expect.objectContaining({
        overscan: 10,
      })
    );
  });
});
