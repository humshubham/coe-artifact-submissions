import React from 'react';
import { useForm } from 'react-hook-form';

type TaskFiltersProps = {
  title: string;
  description: string;
  status: string;
  sortBy: string;
  sortOrder: string;
  onChange: (field: string, value: string) => void;
  onApply: () => void;
  onReset: () => void;
};

const statusOptions = [
  { value: '', label: 'All' },
  { value: 'todo', label: 'Todo' },
  { value: 'inprogress', label: 'In Progress' },
  { value: 'done', label: 'Done' },
];

const TaskFilters: React.FC<TaskFiltersProps> = ({
  title,
  description,
  status,
  sortBy,
  sortOrder,
  onChange,
  onApply,
  onReset,
}) => {
  const { register, handleSubmit, setValue, watch } = useForm({
    defaultValues: { title, description, status, sortBy, sortOrder },
  });

  // Sync props to form state
  React.useEffect(() => {
    setValue('title', title);
    setValue('description', description);
    setValue('status', status);
    setValue('sortBy', sortBy);
    setValue('sortOrder', sortOrder);
  }, [title, description, status, sortBy, sortOrder, setValue]);

  // Watch each field and call onChange when it changes
  React.useEffect(() => {
    const subscription = watch((values, { name }) => {
      if (name && values[name] !== undefined) {
        onChange(name, values[name]);
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, onChange]);

  const submitHandler = () => {
    onApply();
  };

  return (
    <form
      className="flex flex-wrap gap-4 items-end mb-4"
      onSubmit={handleSubmit(submitHandler)}
      data-testid="task-filters-form"
    >
      <div>
        <label className="block text-xs font-medium mb-1">Title</label>
        <input
          type="text"
          {...register('title')}
          className="border rounded px-2 py-1"
          data-testid="filter-title-input"
        />
      </div>
      <div>
        <label className="block text-xs font-medium mb-1">Description</label>
        <input
          type="text"
          {...register('description')}
          className="border rounded px-2 py-1"
          data-testid="filter-description-input"
        />
      </div>
      <div>
        <label className="block text-xs font-medium mb-1">Status</label>
        <select
          {...register('status')}
          className="border rounded px-2 py-1"
          data-testid="filter-status-select"
        >
          {statusOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium mb-1">Sort By</label>
        <select
          {...register('sortBy')}
          className="border rounded px-2 py-1"
          data-testid="filter-sort-by-select"
        >
          <option value="created_at">Created At</option>
          <option value="title">Title</option>
          <option value="description">Description</option>
          <option value="status">Status</option>
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium mb-1">Order</label>
        <select
          {...register('sortOrder')}
          className="border rounded px-2 py-1"
          data-testid="filter-sort-order-select"
        >
          <option value="asc">Asc</option>
          <option value="desc">Desc</option>
        </select>
      </div>
      <button
        type="submit"
        className="bg-blue-500 text-white px-3 py-1 rounded"
        data-testid="filter-apply-button"
      >
        Apply
      </button>
      <button
        type="button"
        className="bg-gray-300 text-black px-3 py-1 rounded ml-2"
        onClick={onReset}
        data-testid="filter-reset-button"
      >
        Reset
      </button>
    </form>
  );
};

export default TaskFilters;
