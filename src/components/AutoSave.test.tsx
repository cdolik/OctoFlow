import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AutoSave from './AutoSave';

const mockData = { key: 'value' };
const mockSave = jest.fn().mockResolvedValue(true);
const mockError = jest.fn().mockRejectedValue(new Error('Save failed'));

const TestComponent: React.FC<{ onSave: () => Promise<boolean>; isDirty: boolean }> = ({ onSave, isDirty }) => (
  <AutoSave onSave={onSave} isDirty={isDirty}>
    <div>Test Content</div>
  </AutoSave>
);

describe('AutoSave', () => {
  it('calls onSave when isDirty is true', async () => {
    render(<TestComponent onSave={mockSave} isDirty={true} />);
    expect(mockSave).toHaveBeenCalled();
  });

  it('does not call onSave when isDirty is false', () => {
    render(<TestComponent onSave={mockSave} isDirty={false} />);
    expect(mockSave).not.toHaveBeenCalled();
  });

  it('shows saving indicator while saving', async () => {
    render(<TestComponent onSave={mockSave} isDirty={true} />);
    expect(screen.getByText('Saving...')).toBeInTheDocument();
    await screen.findByText('Changes saved');
  });

  it('shows error message on save failure', async () => {
    render(<TestComponent onSave={mockError} isDirty={true} />);
    expect(screen.getByText('Saving...')).toBeInTheDocument();
    await screen.findByText('Save failed');
  });
});