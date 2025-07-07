import React, { useEffect, useState } from 'react';
import TaskFilters from './TaskFilters';
import TaskTable from './TaskTable';
import TaskForm from './TaskForm';
import Pagination from './Pagination';
import Toast from './Toast';
import { FaSpinner } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const PAGE_SIZE = 10;

const defaultFilters = {
  title: '',
  description: '',
  status: '',
  sortBy: 'created_at',
  sortOrder: 'desc',
};

function Tasks() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pageNo, setPageNo] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);
  // Filters state
  const [filters, setFilters] = useState({ ...defaultFilters });
  const [appliedFilters, setAppliedFilters] = useState({ ...defaultFilters });
  // Create Task state
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  // Edit Task state
  const [editTask, setEditTask] = useState<any | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  // Delete Task state
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [pageSize, setPageSize] = useState(10);
  const navigate = useNavigate();

  // Fetch tasks
  useEffect(() => {
    async function fetchTasks() {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('access_token');
      const params = new URLSearchParams({
        page_no: String(pageNo),
        limit: String(pageSize),
      });
      if (appliedFilters.title) params.append('title', appliedFilters.title);
      if (appliedFilters.description) params.append('description', appliedFilters.description);
      if (appliedFilters.status) params.append('status', appliedFilters.status);
      if (appliedFilters.sortBy) params.append('sort_by', appliedFilters.sortBy);
      if (appliedFilters.sortOrder) params.append('sort_order', appliedFilters.sortOrder);
      try {
        const res = await fetch(`http://127.0.0.1:5000/tasks?${params.toString()}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || 'Failed to fetch tasks');
        }
        const data = await res.json();
        setTasks(data.tasks);
        setTotalPages(data.pagination.total_pages);
        setTotal(data.pagination.total);
        setHasNext(data.pagination.has_next);
        setHasPrev(data.pagination.has_prev);
      } catch (err: any) {
        setError(err.message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    }
    fetchTasks();
  }, [pageNo, appliedFilters, pageSize]);

  const handlePageChange = (newPage: number) => {
    setPageNo(newPage);
  };

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPageSize(Number(e.target.value));
    setPageNo(1);
  };

  // TaskFilters handlers
  const handleFilterChange = (field: string, value: string) => {
    setFilters(f => ({ ...f, [field]: value }));
  };
  const handleApplyFilters = () => {
    setAppliedFilters({ ...filters });
    setPageNo(1);
  };
  const handleResetFilters = () => {
    setFilters({ ...defaultFilters });
    setAppliedFilters({ ...defaultFilters });
    setPageNo(1);
  };

  // Create Task handlers
  const handleShowCreate = () => {
    if (editTask) return; // Prevent opening create if editing
    setShowCreateForm(true);
  };
  const handleCancelCreate = () => setShowCreateForm(false);
  const handleCreateTask = async (data: { title: string; description: string; status: string }) => {
    setCreateLoading(true);
    setToast(null);
    const token = localStorage.getItem('access_token');
    try {
      const res = await fetch('http://127.0.0.1:5000/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Failed to create task');
      }
      setToast({ message: 'Task created successfully', type: 'success' });
      setShowCreateForm(false);
      setAppliedFilters({ ...appliedFilters });
    } catch (err: any) {
      setToast({ message: err.message || 'Failed to create task', type: 'error' });
    } finally {
      setCreateLoading(false);
    }
  };

  // Edit Task handlers
  const handleEditTask = (task: any) => {
    if (showCreateForm) return; // Prevent opening edit if creating
    setEditTask(task);
  };
  const handleCancelEdit = () => setEditTask(null);
  const handleUpdateTask = async (data: { title: string; description: string; status: string }) => {
    if (!editTask) return;
    setEditLoading(true);
    setToast(null);
    const token = localStorage.getItem('access_token');
    try {
      const res = await fetch(`http://127.0.0.1:5000/tasks/${editTask.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Failed to update task');
      }
      setToast({ message: 'Task updated successfully', type: 'success' });
      setEditTask(null);
      setAppliedFilters({ ...appliedFilters });
    } catch (err: any) {
      setToast({ message: err.message || 'Failed to update task', type: 'error' });
    } finally {
      setEditLoading(false);
    }
  };

  // Delete Task handler
  const handleDeleteTask = async (task: any) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    setDeleteLoading(true);
    setToast(null);
    const token = localStorage.getItem('access_token');
    try {
      const res = await fetch(`http://127.0.0.1:5000/tasks/${task.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Failed to delete task');
      }
      setToast({ message: 'Task deleted successfully', type: 'success' });
      setAppliedFilters({ ...appliedFilters });
    } catch (err: any) {
      setToast({ message: err.message || 'Failed to delete task', type: 'error' });
    } finally {
      setDeleteLoading(false);
    }
  };

  // Toast auto-hide
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 py-6 px-2 sm:px-4" data-testid="tasks-container">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-2">
          <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl shadow-lg p-6 mb-6 flex-1">
            <h2 className="text-3xl font-extrabold text-white drop-shadow mb-2 text-center sm:text-left tracking-tight" data-testid="tasks-title">Tasks</h2>
          </div>
          <button
            className="ml-4 bg-gradient-to-r from-pink-500 to-red-500 text-white px-4 py-2 rounded-lg shadow hover:opacity-90 focus:ring-2 focus:ring-red-300 transition font-semibold text-lg"
            onClick={handleLogout}
            aria-label="Logout"
            data-testid="logout-button"
          >
            Logout
          </button>
        </div>
        <div className="mb-4 flex flex-col sm:flex-row sm:justify-end gap-2">
          <button
            className="bg-gradient-to-r from-green-400 to-blue-500 text-white px-6 py-2 rounded-lg shadow hover:opacity-90 focus:ring-2 focus:ring-green-300 transition w-full sm:w-auto font-semibold text-lg"
            onClick={handleShowCreate}
            disabled={showCreateForm || editTask || createLoading}
            aria-disabled={showCreateForm || editTask || createLoading}
            aria-label="Add Task"
            data-testid="add-task-button"
          >
            {createLoading ? <FaSpinner className="animate-spin" aria-label="Loading" /> : null}
            Add Task
          </button>
        </div>
        <div className="w-full overflow-x-auto mb-4">
          <div className="bg-white rounded-xl shadow p-4">
            <TaskFilters
              title={filters.title}
              description={filters.description}
              status={filters.status}
              sortBy={filters.sortBy}
              sortOrder={filters.sortOrder}
              onChange={handleFilterChange}
              onApply={handleApplyFilters}
              onReset={handleResetFilters}
            />
          </div>
        </div>
        {showCreateForm && !editTask && (
          <div className="w-full max-w-lg mx-auto mb-4" data-testid="create-task-form-container">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <TaskForm
                mode="create"
                onSubmit={handleCreateTask}
                onCancel={handleCancelCreate}
                loading={createLoading}
              />
            </div>
          </div>
        )}
        {editTask && !showCreateForm && (
          <div className="w-full max-w-lg mx-auto mb-4" data-testid="edit-task-form-container">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <TaskForm
                mode="edit"
                initialData={editTask}
                onSubmit={handleUpdateTask}
                onCancel={handleCancelEdit}
                loading={editLoading}
              />
            </div>
          </div>
        )}
        <div className="my-4 w-full overflow-x-auto">
          <div className="flex items-center justify-end mb-2 gap-2">
            <label htmlFor="page-size" className="font-medium text-gray-700">Page Size:</label>
            <select
              id="page-size"
              value={pageSize}
              onChange={handlePageSizeChange}
              className="border rounded px-2 py-1 focus:ring-2 focus:ring-blue-300 bg-white shadow"
              style={{ minWidth: 80 }}
              data-testid="page-size-select"
            >
              {[5, 10, 20, 50, 100].map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </div>
          {loading ? (
            <div className="flex items-center gap-2 justify-center sm:justify-start text-blue-700 font-semibold" data-testid="loading-indicator"><FaSpinner className="animate-spin" aria-label="Loading" /> Loading tasks...</div>
          ) : error ? (
            <div className="text-red-600 bg-white rounded shadow p-4" role="alert" data-testid="error-message">{error}</div>
          ) : (
            <div className="min-w-[600px] bg-white rounded-xl shadow-lg" data-testid="task-table-container">
              <TaskTable
                tasks={tasks}
                onEdit={editTask || showCreateForm ? () => {} : handleEditTask}
                onDelete={deleteLoading ? () => {} : handleDeleteTask}
                editLoading={editLoading}
                deleteLoading={deleteLoading}
              />
            </div>
          )}
        </div>
        <div className="w-full flex flex-col items-center sm:flex-row sm:justify-between" data-testid="pagination-container">
          <Pagination
            pageNo={pageNo}
            totalPages={totalPages}
            hasNext={hasNext}
            hasPrev={hasPrev}
            onPageChange={handlePageChange}
          />
        </div>
        {toast && <Toast message={toast.message} type={toast.type} />}
      </div>
    </div>
  );
}

export default Tasks; 