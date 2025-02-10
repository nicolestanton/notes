import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Note } from './Note';
import { getUsers } from '@/endpoints';
import '@testing-library/jest-dom';

// Mock the getUsers endpoint
jest.mock('@/endpoints', () => ({
  getUsers: jest.fn()
}));

// Mock data
const mockUsers = [
  { id: 1, first_name: 'John' },
  { id: 2, first_name: 'Jane' },
  { id: 3, first_name: 'Bob' }
];

describe('Note Component', () => {
  const mockOnUpdate = jest.fn();
  const defaultProps = {
    noteId: 1,
    initialContent: '',
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
        noteId={1}
        initialContent="Initial note content"
        onUpdate={mockOnUpdate}
      />
    );

    expect(screen.getByRole('textbox')).toHaveValue('Initial note content');
  });

  it('updates content when typing', async () => {
    render(
      <Note
        noteId={1}
        initialContent=""
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
        noteId={1}
        initialContent=""
        onUpdate={mockOnUpdate}
      />
    );

    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: '@', selectionStart: 1 } });

    await waitFor(() => {
      expect(screen.getByText('John')).toBeInTheDocument();
      expect(screen.getByText('Jane')).toBeInTheDocument();
      expect(screen.getByText('Bob')).toBeInTheDocument();
    });
  });

  it('inserts mention when clicking on suggestion', async () => {
    render(
      <Note
        noteId={1}
        initialContent=""
        onUpdate={mockOnUpdate}
      />
    );

    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: '@', selectionStart: 1 } });

    await waitFor(() => {
      expect(screen.getByText('John')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('John'));

    expect(textarea).toHaveValue('@John ');
    
    // Wait for the debounced save
    await waitFor(() => {
      expect(mockOnUpdate).toHaveBeenCalledWith(1, '@John ');
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