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
      className="w-full flex flex-wrap gap-4 items-end justify-between bg-white/80 p-4 rounded-2xl shadow border border-gray-100"
      onSubmit={handleSubmit(submitHandler)}
      data-testid="task-filters-form"
    >
      <div className="flex flex-col min-w-[120px] flex-1">
        <label className="block text-sm font-semibold mb-1 text-gray-700">Title</label>
        <input
          type="text"
          {...register('title')}
          className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white shadow-sm transition"
          data-testid="filter-title-input"
        />
      </div>
      <div className="flex flex-col min-w-[120px] flex-1">
        <label className="block text-sm font-semibold mb-1 text-gray-700">Description</label>
        <input
          type="text"
          {...register('description')}
          className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white shadow-sm transition"
          data-testid="filter-description-input"
        />
      </div>
      <div className="flex flex-col min-w-[100px]">
        <label className="block text-sm font-semibold mb-1 text-gray-700">Status</label>
        <select
          {...register('status')}
          className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white shadow-sm transition"
          data-testid="filter-status-select"
        >
          {statusOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col min-w-[100px]">
        <label className="block text-sm font-semibold mb-1 text-gray-700">Sort By</label>
        <select
          {...register('sortBy')}
          className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white shadow-sm transition"
          data-testid="filter-sort-by-select"
        >
          <option value="created_at">Created At</option>
          <option value="title">Title</option>
          <option value="description">Description</option>
          <option value="status">Status</option>
        </select>
      </div>
      <div className="flex flex-col min-w-[90px]">
        <label className="block text-sm font-semibold mb-1 text-gray-700">Order</label>
        <select
          {...register('sortOrder')}
          className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white shadow-sm transition"
          data-testid="filter-sort-order-select"
        >
          <option value="asc">Asc</option>
          <option value="desc">Desc</option>
        </select>
      </div>
      <div className="flex flex-row gap-2 mt-4 sm:mt-0">
        <button
          type="submit"
          className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-5 py-2 rounded-lg shadow hover:opacity-90 focus:ring-2 focus:ring-blue-300 font-semibold transition"
          data-testid="filter-apply-button"
        >
          Apply
        </button>
        <button
          type="button"
          className="bg-gray-200 text-gray-700 px-5 py-2 rounded-lg shadow hover:bg-gray-300 focus:ring-2 focus:ring-gray-300 font-semibold transition"
          onClick={onReset}
          data-testid="filter-reset-button"
        >
          Reset
        </button>
      </div>
    </form>
  );
};

export default TaskFilters;
