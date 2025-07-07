import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TaskFilters from './TaskFilters';

describe('TaskFilters Component', () => {
  const mockOnChange = jest.fn();
  const mockOnApply = jest.fn();
  const mockOnReset = jest.fn();

  const defaultProps = {
    title: '',
    description: '',
    status: '',
    sortBy: 'created_at',
    sortOrder: 'desc',
    onChange: mockOnChange,
    onApply: mockOnApply,
    onReset: mockOnReset,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial Rendering', () => {
    it('should render all filter inputs', () => {
      render(<TaskFilters {...defaultProps} />);

      expect(screen.getByTestId('filter-title-input')).toBeInTheDocument();
      expect(screen.getByTestId('filter-description-input')).toBeInTheDocument();
      expect(screen.getByTestId('filter-status-select')).toBeInTheDocument();
      expect(screen.getByTestId('filter-sort-by-select')).toBeInTheDocument();
      expect(screen.getByTestId('filter-sort-order-select')).toBeInTheDocument();
    });

    it('should render action buttons', () => {
      render(<TaskFilters {...defaultProps} />);

      expect(screen.getByTestId('filter-apply-button')).toBeInTheDocument();
      expect(screen.getByTestId('filter-reset-button')).toBeInTheDocument();
    });

    it('should display initial values correctly', () => {
      const propsWithValues = {
        ...defaultProps,
        title: 'Test Title',
        description: 'Test Description',
        status: 'todo',
        sortBy: 'title',
        sortOrder: 'asc',
      };

      render(<TaskFilters {...propsWithValues} />);

      expect(screen.getByTestId('filter-title-input')).toHaveValue('Test Title');
      expect(screen.getByTestId('filter-description-input')).toHaveValue('Test Description');
      expect(screen.getByTestId('filter-status-select')).toHaveValue('todo');
      expect(screen.getByTestId('filter-sort-by-select')).toHaveValue('title');
      expect(screen.getByTestId('filter-sort-order-select')).toHaveValue('asc');
    });
  });

  describe('User Interactions', () => {
    it('should call onChange when title input changes', () => {
      render(<TaskFilters {...defaultProps} />);

      const titleInput = screen.getByTestId('filter-title-input');
      fireEvent.change(titleInput, { target: { value: 'New Title' } });

      expect(mockOnChange).toHaveBeenCalledWith('title', 'New Title');
    });

    it('should call onChange when description input changes', () => {
      render(<TaskFilters {...defaultProps} />);

      const descriptionInput = screen.getByTestId('filter-description-input');
      fireEvent.change(descriptionInput, { target: { value: 'New Description' } });

      expect(mockOnChange).toHaveBeenCalledWith('description', 'New Description');
    });

    it('should call onChange when status select changes', () => {
      render(<TaskFilters {...defaultProps} />);

      const statusSelect = screen.getByTestId('filter-status-select');
      fireEvent.change(statusSelect, { target: { value: 'done' } });

      expect(mockOnChange).toHaveBeenCalledWith('status', 'done');
    });

    it('should call onChange when sort by select changes', () => {
      render(<TaskFilters {...defaultProps} />);

      const sortBySelect = screen.getByTestId('filter-sort-by-select');
      fireEvent.change(sortBySelect, { target: { value: 'description' } });

      expect(mockOnChange).toHaveBeenCalledWith('sortBy', 'description');
    });

    it('should call onChange when sort order select changes', () => {
      render(<TaskFilters {...defaultProps} />);

      const sortOrderSelect = screen.getByTestId('filter-sort-order-select');
      fireEvent.change(sortOrderSelect, { target: { value: 'asc' } });

      expect(mockOnChange).toHaveBeenCalledWith('sortOrder', 'asc');
    });

    it('should call onApply when Apply button is clicked', async () => {
      render(<TaskFilters {...defaultProps} />);

      const applyButton = screen.getByTestId('filter-apply-button');
      fireEvent.click(applyButton);

      await waitFor(() => {
        expect(mockOnApply).toHaveBeenCalled();
      });
    });

    it('should call onReset when Reset button is clicked', () => {
      render(<TaskFilters {...defaultProps} />);

      const resetButton = screen.getByTestId('filter-reset-button');
      fireEvent.click(resetButton);

      expect(mockOnReset).toHaveBeenCalled();
    });
  });

  describe('Status Options', () => {
    it('should display all status options', () => {
      render(<TaskFilters {...defaultProps} />);

      const statusSelect = screen.getByTestId('filter-status-select');
      const options = statusSelect.querySelectorAll('option');

      expect(options).toHaveLength(4);
      expect(options[0]).toHaveValue('');
      expect(options[0]).toHaveTextContent('All');
      expect(options[1]).toHaveValue('todo');
      expect(options[1]).toHaveTextContent('Todo');
      expect(options[2]).toHaveValue('inprogress');
      expect(options[2]).toHaveTextContent('In Progress');
      expect(options[3]).toHaveValue('done');
      expect(options[3]).toHaveTextContent('Done');
    });
  });

  describe('Sort Options', () => {
    it('should display all sort by options', () => {
      render(<TaskFilters {...defaultProps} />);

      const sortBySelect = screen.getByTestId('filter-sort-by-select');
      const options = sortBySelect.querySelectorAll('option');

      expect(options).toHaveLength(4);
      expect(options[0]).toHaveValue('created_at');
      expect(options[0]).toHaveTextContent('Created At');
      expect(options[1]).toHaveValue('title');
      expect(options[1]).toHaveTextContent('Title');
      expect(options[2]).toHaveValue('description');
      expect(options[2]).toHaveTextContent('Description');
      expect(options[3]).toHaveValue('status');
      expect(options[3]).toHaveTextContent('Status');
    });

    it('should display all sort order options', () => {
      render(<TaskFilters {...defaultProps} />);

      const sortOrderSelect = screen.getByTestId('filter-sort-order-select');
      const options = sortOrderSelect.querySelectorAll('option');

      expect(options).toHaveLength(2);
      expect(options[0]).toHaveValue('asc');
      expect(options[0]).toHaveTextContent('Asc');
      expect(options[1]).toHaveValue('desc');
      expect(options[1]).toHaveTextContent('Desc');
    });
  });

  describe('Edge Cases', () => {
    it('should handle special characters in text inputs', () => {
      render(<TaskFilters {...defaultProps} />);

      const titleInput = screen.getByTestId('filter-title-input');
      const descriptionInput = screen.getByTestId('filter-description-input');

      fireEvent.change(titleInput, { target: { value: 'Title with @#$%^&*()' } });
      fireEvent.change(descriptionInput, { target: { value: 'Description with <script>alert("xss")</script>' } });

      expect(mockOnChange).toHaveBeenCalledWith('title', 'Title with @#$%^&*()');
      expect(mockOnChange).toHaveBeenCalledWith('description', 'Description with <script>alert("xss")</script>');
    });

    it('should handle unicode characters in text inputs', () => {
      render(<TaskFilters {...defaultProps} />);

      const titleInput = screen.getByTestId('filter-title-input');
      const descriptionInput = screen.getByTestId('filter-description-input');

      fireEvent.change(titleInput, { target: { value: 'Tîtle with émojis 🎉' } });
      fireEvent.change(descriptionInput, { target: { value: 'Déscription with 中文' } });

      expect(mockOnChange).toHaveBeenCalledWith('title', 'Tîtle with émojis 🎉');
      expect(mockOnChange).toHaveBeenCalledWith('description', 'Déscription with 中文');
    });

    it('should handle whitespace-only values', () => {
      render(<TaskFilters {...defaultProps} />);

      const titleInput = screen.getByTestId('filter-title-input');
      fireEvent.change(titleInput, { target: { value: '   ' } });

      expect(mockOnChange).toHaveBeenCalledWith('title', '   ');
    });
  });

  describe('Form Submission', () => {
    it('should prevent default form submission', async () => {
      render(<TaskFilters {...defaultProps} />);

      const form = screen.getByTestId('task-filters-form');
      const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
      fireEvent(form, submitEvent);

      await waitFor(() => {
        expect(mockOnApply).toHaveBeenCalled();
      });
    });
  });
}); 