import { filterAndSortUsers } from './users';
import { User } from '@/types';

describe('filterAndSortUsers', () => {
  // Test data
  const mockUsers: User[] = [
    { id: 1, first_name: 'John' },
    { id: 2, first_name: 'Jane' },
    { id: 3, first_name: 'Jack' },
    { id: 4, first_name: 'Abbie' },
    { id: 5, first_name: 'Bob' }
  ];

  it('filters users based on query', () => {
    const result = filterAndSortUsers(mockUsers, 'jo', 5);
    expect(result).toHaveLength(1);
    expect(result.map(u => u.first_name)).toEqual(['John']);
  });

  it('returns empty array when no matches found', () => {
    const result = filterAndSortUsers(mockUsers, 'xyz', 5);
    expect(result).toHaveLength(0);
  });

  it('respects the limit parameter', () => {
    const result = filterAndSortUsers(mockUsers, 'j', 2);
    expect(result).toHaveLength(2);
  });

  it('sorts results with exact matches first', () => {
    const result = filterAndSortUsers(mockUsers, 'jo', 5);
    expect(result[0].first_name).toBe('John');
  });

  it('is case insensitive', () => {
    const result = filterAndSortUsers(mockUsers, 'JOHN', 5);
    expect(result).toHaveLength(1);
    expect(result[0].first_name).toBe('John');
  });

  it('returns all users when query is empty', () => {
    const result = filterAndSortUsers(mockUsers, '', 5);
    expect(result).toHaveLength(5);
    // Should be alphabetically sorted
    expect(result.map(u => u.first_name)).toEqual(['Abbie','Bob', 'Jack', 'Jane', 'John']);
  });

  it('handles edge cases', () => {
    // Empty users array
    expect(filterAndSortUsers([], 'test', 5)).toHaveLength(0);
    
    // Zero limit
    expect(filterAndSortUsers(mockUsers, 'j', 0)).toHaveLength(0);
    
    // Limit larger than results
    const result = filterAndSortUsers(mockUsers, 'j', 10);
    expect(result.length).toBeLessThanOrEqual(10);
  });
});