import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Tasks from './Tasks';

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  removeItem: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

// Mock window.confirm
const mockConfirm = jest.fn();
Object.defineProperty(window, 'confirm', {
  value: mockConfirm,
});

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const mockTasks = [
  { id: 1, title: 'Test Task 1', description: 'Description 1', status: 'todo' },
  { id: 2, title: 'Test Task 2', description: 'Description 2', status: 'inprogress' },
];

const mockPagination = {
  total_pages: 2,
  total: 15,
  has_next: true,
  has_prev: false,
};

describe('Tasks Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue('mock-token');
  });

  describe('Initial Rendering', () => {
    it('should render the tasks page with title', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ tasks: mockTasks, pagination: mockPagination }),
      });

      render(
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Tasks />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('tasks-title')).toBeInTheDocument();
      });
      
      expect(screen.getByTestId('add-task-button')).toBeInTheDocument();
      expect(screen.getByTestId('logout-button')).toBeInTheDocument();
    });

    it('should show loading state initially', () => {
      mockFetch.mockImplementation(() => new Promise(() => {})); // Never resolves

      render(
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Tasks />
        </BrowserRouter>
      );

      expect(screen.getByTestId('loading-indicator')).toBeInTheDocument();
    });

    it('should display tasks after successful fetch', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ tasks: mockTasks, pagination: mockPagination }),
      });

      render(
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Tasks />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('task-table-container')).toBeInTheDocument();
      });

      expect(screen.getByTestId('task-title-0')).toHaveTextContent('Test Task 1');
      expect(screen.getByTestId('task-title-1')).toHaveTextContent('Test Task 2');
    });

    it('should show error message on fetch failure', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      render(
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Tasks />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeInTheDocument();
      });
    });
  });

  describe('Task Creation', () => {
    it('should show create form when Add Task button is clicked', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ tasks: mockTasks, pagination: mockPagination }),
      });

      render(
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Tasks />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('add-task-button')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('add-task-button'));

      await waitFor(() => {
        expect(screen.getByTestId('create-task-form-container')).toBeInTheDocument();
      });
      expect(screen.getByTestId('task-form')).toBeInTheDocument();
    });

    it('should create task successfully', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ tasks: mockTasks, pagination: mockPagination }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ message: 'Task created successfully' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ tasks: [...mockTasks, { id: 3, title: 'New Task', description: 'New Description', status: 'todo' }], pagination: mockPagination }),
        });

      render(
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Tasks />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('add-task-button')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('add-task-button'));

      await waitFor(() => {
        expect(screen.getByTestId('create-task-form-container')).toBeInTheDocument();
      });

      const titleInput = screen.getByTestId('task-title-input');
      const descriptionInput = screen.getByTestId('task-description-input');
      const statusSelect = screen.getByTestId('task-status-select');

      fireEvent.change(titleInput, { target: { value: 'New Task' } });
      fireEvent.change(descriptionInput, { target: { value: 'New Description' } });
      fireEvent.change(statusSelect, { target: { value: 'todo' } });

      fireEvent.click(screen.getByTestId('task-submit-button'));

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          'http://127.0.0.1:5000/tasks',
          expect.objectContaining({
            method: 'POST',
            headers: expect.objectContaining({
              'Content-Type': 'application/json',
              'Authorization': 'Bearer mock-token',
            }),
            body: JSON.stringify({
              title: 'New Task',
              description: 'New Description',
              status: 'todo',
            }),
          })
        );
      });
    });

    it('should handle task creation error', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ tasks: mockTasks, pagination: mockPagination }),
        })
        .mockRejectedValueOnce(new Error('Creation failed'));

      render(
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Tasks />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('add-task-button')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('add-task-button'));

      await waitFor(() => {
        expect(screen.getByTestId('create-task-form-container')).toBeInTheDocument();
      });

      const titleInput = screen.getByTestId('task-title-input');
      
      fireEvent.change(titleInput, { target: { value: 'New Task' } });

      fireEvent.click(screen.getByTestId('task-submit-button'));

      await waitFor(() => {
        expect(screen.getByText('Creation failed')).toBeInTheDocument();
      });
    });
  });

  describe('Task Editing', () => {
    it('should show edit form when Edit button is clicked', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ tasks: mockTasks, pagination: mockPagination }),
      });

      render(
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Tasks />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('edit-task-button-0')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('edit-task-button-0'));

      await waitFor(() => {
        expect(screen.getByTestId('edit-task-form-container')).toBeInTheDocument();
      });
      expect(screen.getByTestId('task-form')).toBeInTheDocument();
    });

    it('should update task successfully', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ tasks: mockTasks, pagination: mockPagination }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ message: 'Task updated successfully' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ tasks: mockTasks, pagination: mockPagination }),
        });

      render(
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Tasks />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('edit-task-button-0')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('edit-task-button-0'));

      await waitFor(() => {
        expect(screen.getByTestId('edit-task-form-container')).toBeInTheDocument();
      });

      const titleInput = screen.getByTestId('task-title-input');
      
      fireEvent.change(titleInput, { target: { value: 'Updated Task' } });

      fireEvent.click(screen.getByTestId('task-submit-button'));

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          'http://127.0.0.1:5000/tasks/1',
          expect.objectContaining({
            method: 'PUT',
            headers: expect.objectContaining({
              'Content-Type': 'application/json',
              'Authorization': 'Bearer mock-token',
            }),
            body: JSON.stringify({
              id: 1,
              title: 'Updated Task',
              description: 'Description 1',
              status: 'todo',
            }),
          })
        );
      });
    });
  });

  describe('Task Deletion', () => {
    it('should delete task when confirmed', async () => {
      mockConfirm.mockReturnValue(true);
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ tasks: mockTasks, pagination: mockPagination }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ message: 'Task deleted successfully' }),
        });

      render(
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Tasks />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('delete-task-button-0')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('delete-task-button-0'));

      expect(mockConfirm).toHaveBeenCalledWith('Are you sure you want to delete this task?');

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          'http://127.0.0.1:5000/tasks/1',
          expect.objectContaining({
            method: 'DELETE',
            headers: expect.objectContaining({
              'Authorization': 'Bearer mock-token',
            }),
          })
        );
      });
    });

    it('should not delete task when cancelled', async () => {
      mockConfirm.mockReturnValue(false);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ tasks: mockTasks, pagination: mockPagination }),
      });

      render(
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Tasks />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('delete-task-button-0')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('delete-task-button-0'));

      expect(mockConfirm).toHaveBeenCalled();
      expect(mockFetch).not.toHaveBeenCalledWith(
        expect.stringContaining('/tasks/1'),
        expect.any(Object)
      );
    });
  });

  describe('Filtering and Sorting', () => {
    it('should apply filters when Apply button is clicked', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ tasks: mockTasks, pagination: mockPagination }),
      });

      render(
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Tasks />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('filter-title-input')).toBeInTheDocument();
      });

      const titleInput = screen.getByTestId('filter-title-input');
      
      fireEvent.change(titleInput, { target: { value: 'Test' } });

      fireEvent.click(screen.getByTestId('filter-apply-button'));

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('title=Test'),
          expect.any(Object)
        );
      });
    });

    it('should reset filters when Reset button is clicked', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ tasks: mockTasks, pagination: mockPagination }),
      });

      render(
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Tasks />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('filter-reset-button')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('filter-reset-button'));

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('page_no=1'),
          expect.any(Object)
        );
      });
    });
  });

  describe('Pagination', () => {
    // it('should navigate to next page', async () => {
    //   mockFetch
    //     .mockResolvedValueOnce({
    //       ok: true,
    //       json: async () => ({ tasks: mockTasks, pagination: { ...mockPagination, page_no: 1, has_next: true, has_prev: false } }),
    //     })
    //     .mockResolvedValueOnce({
    //       ok: true,
    //       json: async () => ({ tasks: mockTasks, pagination: { ...mockPagination, page_no: 2, has_next: false, has_prev: true } }),
    //     });

    //   render(
    //     <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
    //       <Tasks />
    //     </BrowserRouter>
    //   );

    //   await waitFor(() => {
    //     expect(screen.getByTestId('next-page-button')).toBeInTheDocument();
    //   });

    //   await act(async () => {
    //     fireEvent.click(screen.getByTestId('next-page-button'));
    //   });

    //   // Wait for the page info to update to 'Page 2 of 2'
    //   await waitFor(() => {
    //     expect(screen.getByTestId('page-info')).toHaveTextContent('Page 2 of 2');
    //   });

    //   expect(mockFetch).toHaveBeenCalledWith(
    //     expect.stringContaining('page_no=2'),
    //     expect.any(Object)
    //   );
    // });

    it('should navigate to previous page', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ tasks: mockTasks, pagination: { ...mockPagination, has_prev: true, page_no: 2 } }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ tasks: mockTasks, pagination: mockPagination }),
        });

      render(
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Tasks />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('prev-page-button')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('prev-page-button'));

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('page_no=1'),
          expect.any(Object)
        );
      });
    });
  });

  describe('Page Size Selection', () => {
    it('should change page size and reset to page 1', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ tasks: mockTasks, pagination: mockPagination }),
      });

      render(
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Tasks />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('page-size-select')).toBeInTheDocument();
      });

      const pageSizeSelect = screen.getByTestId('page-size-select');
      fireEvent.change(pageSizeSelect, { target: { value: '20' } });

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('limit=20'),
          expect.any(Object)
        );
      });
    });
  });

  describe('Logout', () => {
    it('should logout and navigate to login page', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ tasks: mockTasks, pagination: mockPagination }),
      });

      render(
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Tasks />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('logout-button')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('logout-button'));

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('access_token');
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

//   describe('Loading States', () => {
//     it('should show loading spinner during create operation', async () => {
//       mockFetch
//         .mockResolvedValueOnce({
//           ok: true,
//           json: async () => ({ tasks: mockTasks, pagination: mockPagination }),
//         })
//         .mockImplementation(() => new Promise(() => {})); // Never resolves for create

//       render(
//         <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
//           <Tasks />
//         </BrowserRouter>
//       );

//       await waitFor(() => {
//         expect(screen.getByTestId('add-task-button')).toBeInTheDocument();
//       });

//       await act(async () => {
//         fireEvent.click(screen.getByTestId('add-task-button'));
//       });

//       const titleInput = screen.getByTestId('task-title-input');
//       await act(async () => {
//         fireEvent.change(titleInput, { target: { value: 'Test Task' } });
//       });

//       await act(async () => {
//         fireEvent.click(screen.getByTestId('task-submit-button'));
//       });

//       // The button should be disabled during loading
//       expect(screen.getByTestId('task-submit-button')).toBeDisabled();
//     });

//     // it('should show loading spinner during edit operation', async () => {
//     //   mockFetch
//     //     .mockResolvedValueOnce({
//     //       ok: true,
//     //       json: async () => ({ tasks: mockTasks, pagination: mockPagination }),
//     //     })
//     //     .mockImplementation(() => new Promise(() => {})); // Never resolves for update

//     //   render(
//     //     <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
//     //       <Tasks />
//     //     </BrowserRouter>
//     //   );

//     //   await waitFor(() => {
//     //     expect(screen.getByTestId('edit-task-button-0')).toBeInTheDocument();
//     //   });

//     //   await act(async () => {
//     //     fireEvent.click(screen.getByTestId('edit-task-button-0'));
//     //   });

//     //   const titleInput = screen.getByTestId('task-title-input');
//     //   await act(async () => {
//     //     fireEvent.change(titleInput, { target: { value: 'Updated Task' } });
//     //   });

//     //   await act(async () => {
//     //     fireEvent.click(screen.getByTestId('task-submit-button'));
//     //   });

//     //   // The button should be disabled during loading
//     //   expect(screen.getByTestId('task-submit-button')).toBeDisabled();
//     // });
//   });

  describe('Form Validation', () => {
    it('should require title field', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ tasks: mockTasks, pagination: mockPagination }),
      });

      render(
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Tasks />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('add-task-button')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('add-task-button'));

      const titleInput = screen.getByTestId('task-title-input');
      expect(titleInput).toHaveAttribute('required');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ tasks: mockTasks, pagination: mockPagination }),
      });

      render(
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Tasks />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('add-task-button')).toBeInTheDocument();
      });

      expect(screen.getByTestId('add-task-button')).toHaveAttribute('aria-label', 'Add Task');
      expect(screen.getByTestId('logout-button')).toHaveAttribute('aria-label', 'Logout');
    });

    it('should have proper ARIA disabled attributes', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ tasks: mockTasks, pagination: mockPagination }),
      });

      render(
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Tasks />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('add-task-button')).toBeInTheDocument();
      });

      expect(screen.getByTestId('add-task-button')).toHaveAttribute('aria-disabled', 'false');
    });
  });
}); 