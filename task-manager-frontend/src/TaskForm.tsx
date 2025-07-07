import React, { useState, useEffect } from 'react';

type TaskFormProps = {
  mode: 'create' | 'edit';
  initialData?: {
    id?: number;
    title: string;
    description: string;
    status: string;
  };
  onSubmit: (data: { title: string; description: string; status: string }) => void;
  onCancel: () => void;
  loading?: boolean;
};

const defaultTask = { title: '', description: '', status: 'todo' };

const statusOptions = [
  { value: 'todo', label: 'Todo' },
  { value: 'inprogress', label: 'In Progress' },
  { value: 'done', label: 'Done' },
];

const TaskForm: React.FC<TaskFormProps> = ({ mode, initialData, onSubmit, onCancel, loading }) => {
  const [form, setForm] = useState(defaultTask);
  useEffect(() => {
    if (initialData) setForm(initialData);
    else setForm(defaultTask);
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form className="bg-gray-100 p-4 rounded mb-4" onSubmit={handleSubmit} data-testid="task-form">
      <h3 className="font-semibold mb-2" data-testid="task-form-title">{mode === 'create' ? 'Add Task' : 'Edit Task'}</h3>
      <div className="mb-2">
        <label className="block text-xs font-medium mb-1">Title</label>
        <input 
          name="title" 
          value={form.title} 
          onChange={handleChange} 
          className="border rounded px-2 py-1 w-full" 
          required 
          data-testid="task-title-input"
        />
      </div>
      <div className="mb-2">
        <label className="block text-xs font-medium mb-1">Description</label>
        <input 
          name="description" 
          value={form.description} 
          onChange={handleChange} 
          className="border rounded px-2 py-1 w-full" 
          data-testid="task-description-input"
        />
      </div>
      <div className="mb-2">
        <label className="block text-xs font-medium mb-1">Status</label>
        <select 
          name="status" 
          value={form.status} 
          onChange={handleChange} 
          className="border rounded px-2 py-1 w-full"
          data-testid="task-status-select"
        >
          {statusOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
      <div className="flex gap-2 mt-2">
        <button 
          type="submit" 
          className="bg-blue-500 text-white px-3 py-1 rounded" 
          disabled={loading}
          data-testid="task-submit-button"
        >
          {mode === 'create' ? 'Create' : 'Update'}
        </button>
        <button 
          type="button" 
          className="bg-gray-300 text-black px-3 py-1 rounded" 
          onClick={onCancel} 
          disabled={loading}
          data-testid="task-cancel-button"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default TaskForm; 