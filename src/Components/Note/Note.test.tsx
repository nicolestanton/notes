import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { getUsers } from '../../endpoints';
import { Note } from './Note';

// Mock the getUsers endpoint
jest.mock('@/endpoints', () => ({
  getUsers: jest.fn()
}));

jest.mock('./Note.module.scss', () => ({
    note: 'note',
    noteHeader: 'noteHeader',
    noteTitle: 'noteTitle',
    lastUpdated: 'lastUpdated',
    editorContainer: 'editorContainer',
    textarea: 'textarea',
    overlay: 'overlay',
    mentionsDropdown: 'mentionsDropdown',
    mentionItem: 'mentionItem',
    mentionWrapper: 'mentionWrapper',
    mentionText: 'mentionText'
  }));

// Mock data
const mockUsers = [
  { id: 1, first_name: 'John', last_name: 'Doe' },
  { id: 2, first_name: 'Jane', last_name: 'Smith' },
  { id: 3, first_name: 'Bob', last_name: 'Jones' }
];

describe('Note Component', () => {
  const mockOnUpdate = jest.fn();
  const defaultProps = {
    id: 1,
    body: '',
    lastUpdated: '2024-01-01T00:00:00.000Z',
    onUpdate: mockOnUpdate,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset mock implementation for getUsers
    (getUsers as jest.Mock).mockResolvedValue(mockUsers);
  });

  it('renders with initial content', () => {
    render(
      <Note
        id={1}
        body="Initial note content"
        onUpdate={mockOnUpdate}
      />
    );

    expect(screen.getByRole('textbox')).toHaveValue('Initial note content');
  });

  it('updates content when typing', async () => {
    render(
      <Note
        id={1}
        body=""
        onUpdate={mockOnUpdate}
      />
    );

    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'New content' } });

    expect(textarea).toHaveValue('New content');
    
    // Wait for the debounced save
    await waitFor(() => {
      expect(mockOnUpdate).toHaveBeenCalledWith(1, 'New content');
    }, { timeout: 1100 });
  });

  it('displays mentions dropdown when typing @', async () => {
    render(
      <Note
        id={1}
        body=""
        onUpdate={mockOnUpdate}
      />
    );

    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: '@', selectionStart: 1 } });

    await waitFor(() => {
      expect(screen.getByText('John-Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane-Smith')).toBeInTheDocument();
      expect(screen.getByText('Bob-Jones')).toBeInTheDocument();
    });
  });

  it('inserts mention when clicking on suggestion', async () => {
    render(
      <Note
        id={1}
        body=""
        onUpdate={mockOnUpdate}
      />
    );

    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: '@', selectionStart: 1 } });

    await waitFor(() => {
      expect(screen.getByText('John-Doe')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('John-Doe'));

    expect(textarea).toHaveValue('@John-Doe ');
    
    // Wait for the debounced save
    await waitFor(() => {
      expect(mockOnUpdate).toHaveBeenCalledWith(1, '@John-Doe ');
    }, { timeout: 1100 });
  });

  it('displays last updated time when provided', () => {
    const lastUpdated = '2024-02-10T12:00:00Z';
    render(
      <Note
        {...defaultProps}
        lastUpdated={lastUpdated}
      />
    );

    const dateElement = screen.getByTestId('last-updated-date');
    expect(dateElement.textContent).toBe(new Date(lastUpdated).toLocaleString());
  });
});