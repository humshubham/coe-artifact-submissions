import { render, screen, fireEvent } from '@testing-library/react';
import TaskTable from './TaskTable';

describe('TaskTable Component', () => {
  const mockTasks = [
    { id: 1, title: 'Task 1', description: 'Description 1', status: 'todo' },
    { id: 2, title: 'Task 2', description: 'Description 2', status: 'inprogress' },
    { id: 3, title: 'Task 3', description: 'Description 3', status: 'done' },
  ];

  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();

  const defaultProps = {
    tasks: mockTasks,
    onEdit: mockOnEdit,
    onDelete: mockOnDelete,
    editLoading: false,
    deleteLoading: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial Rendering', () => {
    it('should render table with headers', () => {
      render(<TaskTable {...defaultProps} />);

      expect(screen.getByTestId('task-table')).toBeInTheDocument();
      expect(screen.getByText('Title')).toBeInTheDocument();
      expect(screen.getByText('Description')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('Actions')).toBeInTheDocument();
    });

    it('should render all tasks', () => {
      render(<TaskTable {...defaultProps} />);

      expect(screen.getByTestId('task-title-0')).toHaveTextContent('Task 1');
      expect(screen.getByTestId('task-description-0')).toHaveTextContent('Description 1');
      expect(screen.getByTestId('task-status-0')).toHaveTextContent('todo');

      expect(screen.getByTestId('task-title-1')).toHaveTextContent('Task 2');
      expect(screen.getByTestId('task-description-1')).toHaveTextContent('Description 2');
      expect(screen.getByTestId('task-status-1')).toHaveTextContent('inprogress');

      expect(screen.getByTestId('task-title-2')).toHaveTextContent('Task 3');
      expect(screen.getByTestId('task-description-2')).toHaveTextContent('Description 3');
      expect(screen.getByTestId('task-status-2')).toHaveTextContent('done');
    });

    it('should render edit and delete buttons for each task', () => {
      render(<TaskTable {...defaultProps} />);

      expect(screen.getByTestId('edit-task-button-0')).toBeInTheDocument();
      expect(screen.getByTestId('delete-task-button-0')).toBeInTheDocument();
      expect(screen.getByTestId('edit-task-button-1')).toBeInTheDocument();
      expect(screen.getByTestId('delete-task-button-1')).toBeInTheDocument();
      expect(screen.getByTestId('edit-task-button-2')).toBeInTheDocument();
      expect(screen.getByTestId('delete-task-button-2')).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should render empty table when no tasks', () => {
      render(<TaskTable {...defaultProps} tasks={[]} />);

      expect(screen.getByTestId('task-table')).toBeInTheDocument();
      expect(screen.getByText('Title')).toBeInTheDocument();
      expect(screen.getByText('Description')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('Actions')).toBeInTheDocument();
    });
  });

  describe('Task Actions', () => {
    it('should call onEdit when edit button is clicked', () => {
      render(<TaskTable {...defaultProps} />);

      const editButton = screen.getByTestId('edit-task-button-0');
      fireEvent.click(editButton);

      expect(mockOnEdit).toHaveBeenCalledWith(mockTasks[0]);
    });

    it('should call onDelete when delete button is clicked', () => {
      render(<TaskTable {...defaultProps} />);

      const deleteButton = screen.getByTestId('delete-task-button-0');
      fireEvent.click(deleteButton);

      expect(mockOnDelete).toHaveBeenCalledWith(mockTasks[0]);
    });

    it('should call onEdit with correct task for each row', () => {
      render(<TaskTable {...defaultProps} />);

      const editButton1 = screen.getByTestId('edit-task-button-0');
      const editButton2 = screen.getByTestId('edit-task-button-1');
      const editButton3 = screen.getByTestId('edit-task-button-2');

      fireEvent.click(editButton1);
      expect(mockOnEdit).toHaveBeenCalledWith(mockTasks[0]);

      fireEvent.click(editButton2);
      expect(mockOnEdit).toHaveBeenCalledWith(mockTasks[1]);

      fireEvent.click(editButton3);
      expect(mockOnEdit).toHaveBeenCalledWith(mockTasks[2]);
    });

    it('should call onDelete with correct task for each row', () => {
      render(<TaskTable {...defaultProps} />);

      const deleteButton1 = screen.getByTestId('delete-task-button-0');
      const deleteButton2 = screen.getByTestId('delete-task-button-1');
      const deleteButton3 = screen.getByTestId('delete-task-button-2');

      fireEvent.click(deleteButton1);
      expect(mockOnDelete).toHaveBeenCalledWith(mockTasks[0]);

      fireEvent.click(deleteButton2);
      expect(mockOnDelete).toHaveBeenCalledWith(mockTasks[1]);

      fireEvent.click(deleteButton3);
      expect(mockOnDelete).toHaveBeenCalledWith(mockTasks[2]);
    });
  });

  describe('Loading States', () => {
    it('should disable edit buttons when editLoading is true', () => {
      render(<TaskTable {...defaultProps} editLoading={true} />);

      const editButton = screen.getByTestId('edit-task-button-0');
      expect(editButton).toBeDisabled();
      expect(editButton).toHaveAttribute('aria-disabled', 'true');
    });

    it('should disable delete buttons when deleteLoading is true', () => {
      render(<TaskTable {...defaultProps} deleteLoading={true} />);

      const deleteButton = screen.getByTestId('delete-task-button-0');
      expect(deleteButton).toBeDisabled();
      expect(deleteButton).toHaveAttribute('aria-disabled', 'true');
    });
  });

  describe('Button States', () => {
    it('should enable buttons when not loading', () => {
      render(<TaskTable {...defaultProps} />);

      const editButton = screen.getByTestId('edit-task-button-0');
      const deleteButton = screen.getByTestId('delete-task-button-0');

      expect(editButton).not.toBeDisabled();
      expect(deleteButton).not.toBeDisabled();
    });

    it('should have proper ARIA labels', () => {
      render(<TaskTable {...defaultProps} />);

      const editButton = screen.getByTestId('edit-task-button-0');
      const deleteButton = screen.getByTestId('delete-task-button-0');

      expect(editButton).toHaveAttribute('aria-label', 'Edit Task 1');
      expect(deleteButton).toHaveAttribute('aria-label', 'Delete Task 1');
    });
  });

  describe('Task Data Display', () => {
    it('should display task data correctly', () => {
      const singleTask = [{ id: 1, title: 'Test Task', description: 'Test Description', status: 'done' }];
      render(<TaskTable {...defaultProps} tasks={singleTask} />);

      expect(screen.getByTestId('task-title-0')).toHaveTextContent('Test Task');
      expect(screen.getByTestId('task-description-0')).toHaveTextContent('Test Description');
      expect(screen.getByTestId('task-status-0')).toHaveTextContent('done');
    });

    it('should handle empty description', () => {
      const taskWithEmptyDesc = [{ id: 1, title: 'Test Task', description: '', status: 'todo' }];
      render(<TaskTable {...defaultProps} tasks={taskWithEmptyDesc} />);

      expect(screen.getByTestId('task-description-0')).toHaveTextContent('');
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long task titles', () => {
      const longTitle = 'a'.repeat(1000);
      const taskWithLongTitle = [{ id: 1, title: longTitle, description: 'Test', status: 'todo' }];
      render(<TaskTable {...defaultProps} tasks={taskWithLongTitle} />);

      expect(screen.getByTestId('task-title-0')).toHaveTextContent(longTitle);
    });

    it('should handle very long task descriptions', () => {
      const longDescription = 'b'.repeat(2000);
      const taskWithLongDesc = [{ id: 1, title: 'Test', description: longDescription, status: 'todo' }];
      render(<TaskTable {...defaultProps} tasks={taskWithLongDesc} />);

      expect(screen.getByTestId('task-description-0')).toHaveTextContent(longDescription);
    });

    // it('should handle whitespace-only task data', () => {
    //   const taskWithWhitespace = [{ id: 1, title: '   ', description: '   ', status: 'todo' }];
    //   render(<TaskTable {...defaultProps} tasks={taskWithWhitespace} />);

    //   expect(screen.getByTestId('task-title-0')).toHaveTextContent('   ');
    //   expect(screen.getByTestId('task-description-0')).toHaveTextContent('   ');
    // });
  });

  describe('Component Props', () => {
    it('should handle empty tasks array', () => {
      render(<TaskTable {...defaultProps} tasks={[]} />);

      expect(screen.getByTestId('task-table')).toBeInTheDocument();
    });

    it('should handle single task', () => {
      const singleTask = [{ id: 1, title: 'Single Task', description: 'Single Description', status: 'todo' }];
      render(<TaskTable {...defaultProps} tasks={singleTask} />);

      expect(screen.getByTestId('task-title-0')).toHaveTextContent('Single Task');
    });

    it('should handle many tasks', () => {
      const manyTasks = Array.from({ length: 100 }, (_, i) => ({
        id: i + 1,
        title: `Task ${i + 1}`,
        description: `Description ${i + 1}`,
        status: 'todo'
      }));
      render(<TaskTable {...defaultProps} tasks={manyTasks} />);

      expect(screen.getByTestId('task-title-0')).toHaveTextContent('Task 1');
      expect(screen.getByTestId('task-title-99')).toHaveTextContent('Task 100');
    });
  });
}); 