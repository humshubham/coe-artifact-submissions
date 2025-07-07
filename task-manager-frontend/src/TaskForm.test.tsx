import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TaskForm from './TaskForm';

describe('TaskForm Component', () => {
  const mockOnSubmit = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Create Mode', () => {
    it('should render create form with empty fields', () => {
      render(
        <TaskForm
          mode="create"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByTestId('task-form')).toBeInTheDocument();
      expect(screen.getByTestId('task-form-title')).toHaveTextContent('Add Task');
      expect(screen.getByTestId('task-title-input')).toHaveValue('');
      expect(screen.getByTestId('task-description-input')).toHaveValue('');
      expect(screen.getByTestId('task-status-select')).toHaveValue('todo');
    });

    it('should handle form submission with valid data', async () => {
      render(
        <TaskForm
          mode="create"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const titleInput = screen.getByTestId('task-title-input');
      const descriptionInput = screen.getByTestId('task-description-input');
      const statusSelect = screen.getByTestId('task-status-select');
      const submitButton = screen.getByTestId('task-submit-button');

      fireEvent.change(titleInput, { target: { value: 'Test Task' } });
      fireEvent.change(descriptionInput, { target: { value: 'Test Description' } });
      fireEvent.change(statusSelect, { target: { value: 'inprogress' } });

      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          title: 'Test Task',
          description: 'Test Description',
          status: 'inprogress',
        });
      });
    });

    it('should handle cancel button click', () => {
      render(
        <TaskForm
          mode="create"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const cancelButton = screen.getByTestId('task-cancel-button');
      fireEvent.click(cancelButton);

      expect(mockOnCancel).toHaveBeenCalled();
    });

    it('should disable submit button when loading', () => {
      render(
        <TaskForm
          mode="create"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          loading={true}
        />
      );

      const submitButton = screen.getByTestId('task-submit-button');
      expect(submitButton).toBeDisabled();
    });

    it('should disable cancel button when loading', () => {
      render(
        <TaskForm
          mode="create"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          loading={true}
        />
      );

      const cancelButton = screen.getByTestId('task-cancel-button');
      expect(cancelButton).toBeDisabled();
    });
  });

  describe('Edit Mode', () => {
    const mockInitialData = {
      id: 1,
      title: 'Existing Task',
      description: 'Existing Description',
      status: 'done',
    };

    it('should render edit form with initial data', () => {
      render(
        <TaskForm
          mode="edit"
          initialData={mockInitialData}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByTestId('task-form-title')).toHaveTextContent('Edit Task');
      expect(screen.getByTestId('task-title-input')).toHaveValue('Existing Task');
      expect(screen.getByTestId('task-description-input')).toHaveValue('Existing Description');
      expect(screen.getByTestId('task-status-select')).toHaveValue('done');
    });

    it('should handle form submission with updated data', async () => {
      render(
        <TaskForm
          mode="edit"
          initialData={mockInitialData}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const titleInput = screen.getByTestId('task-title-input');
      const descriptionInput = screen.getByTestId('task-description-input');
      const statusSelect = screen.getByTestId('task-status-select');
      const submitButton = screen.getByTestId('task-submit-button');

      fireEvent.change(titleInput, { target: { value: 'Updated Task' } });
      fireEvent.change(descriptionInput, { target: { value: 'Updated Description' } });
      fireEvent.change(statusSelect, { target: { value: 'todo' } });

      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          id: 1,
          title: 'Updated Task',
          description: 'Updated Description',
          status: 'todo',
        });
      });
    });

    it('should update submit button text in edit mode', () => {
      render(
        <TaskForm
          mode="edit"
          initialData={mockInitialData}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const submitButton = screen.getByTestId('task-submit-button');
      expect(submitButton).toHaveTextContent('Update');
    });
  });

  describe('Form Validation', () => {
    it('should require title field', () => {
      render(
        <TaskForm
          mode="create"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const titleInput = screen.getByTestId('task-title-input');
      expect(titleInput).toHaveAttribute('required');
    });

    it('should not require description field', () => {
      render(
        <TaskForm
          mode="create"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const descriptionInput = screen.getByTestId('task-description-input');
      expect(descriptionInput).not.toHaveAttribute('required');
    });
  });

  describe('Status Options', () => {
    it('should display all status options', () => {
      render(
        <TaskForm
          mode="create"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const statusSelect = screen.getByTestId('task-status-select');
      const options = statusSelect.querySelectorAll('option');

      expect(options).toHaveLength(3);
      expect(options[0]).toHaveValue('todo');
      expect(options[0]).toHaveTextContent('Todo');
      expect(options[1]).toHaveValue('inprogress');
      expect(options[1]).toHaveTextContent('In Progress');
      expect(options[2]).toHaveValue('done');
      expect(options[2]).toHaveTextContent('Done');
    });
  });

  describe('Input Handling', () => {
    it('should handle title input changes', () => {
      render(
        <TaskForm
          mode="create"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const titleInput = screen.getByTestId('task-title-input');
      fireEvent.change(titleInput, { target: { value: 'New Title' } });

      expect(titleInput).toHaveValue('New Title');
    });

    it('should handle description input changes', () => {
      render(
        <TaskForm
          mode="create"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const descriptionInput = screen.getByTestId('task-description-input');
      fireEvent.change(descriptionInput, { target: { value: 'New Description' } });

      expect(descriptionInput).toHaveValue('New Description');
    });

    it('should handle status select changes', () => {
      render(
        <TaskForm
          mode="create"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const statusSelect = screen.getByTestId('task-status-select');
      fireEvent.change(statusSelect, { target: { value: 'done' } });

      expect(statusSelect).toHaveValue('done');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty description', async () => {
      render(
        <TaskForm
          mode="create"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const titleInput = screen.getByTestId('task-title-input');
      const submitButton = screen.getByTestId('task-submit-button');

      fireEvent.change(titleInput, { target: { value: 'Test Task' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          title: 'Test Task',
          description: '',
          status: 'todo',
        });
      });
    });
  });

  describe('Loading States', () => {
    it('should show loading state on submit button when loading', () => {
      render(
        <TaskForm
          mode="create"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          loading={true}
        />
      );

      const submitButton = screen.getByTestId('task-submit-button');
      expect(submitButton).toBeDisabled();
    });

    it('should show loading state on cancel button when loading', () => {
      render(
        <TaskForm
          mode="create"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          loading={true}
        />
      );

      const cancelButton = screen.getByTestId('task-cancel-button');
      expect(cancelButton).toBeDisabled();
    });
  });

  describe('Form Reset', () => {
    it('should reset form when initialData changes', () => {
      const { rerender } = render(
        <TaskForm
          mode="edit"
          initialData={{ id: 1, title: 'Task 1', description: 'Desc 1', status: 'todo' }}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByTestId('task-title-input')).toHaveValue('Task 1');

      rerender(
        <TaskForm
          mode="edit"
          initialData={{ id: 2, title: 'Task 2', description: 'Desc 2', status: 'done' }}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByTestId('task-title-input')).toHaveValue('Task 2');
      expect(screen.getByTestId('task-status-select')).toHaveValue('done');
    });
  });
}); 