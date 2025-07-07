import React from 'react';

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
  onReset
}) => {
  return (
    <form className="flex flex-wrap gap-4 items-end mb-4" onSubmit={e => { e.preventDefault(); onApply(); }} data-testid="task-filters-form">
      <div>
        <label className="block text-xs font-medium mb-1">Title</label>
        <input 
          type="text" 
          value={title} 
          onChange={e => onChange('title', e.target.value)} 
          className="border rounded px-2 py-1" 
          data-testid="filter-title-input"
        />
      </div>
      <div>
        <label className="block text-xs font-medium mb-1">Description</label>
        <input 
          type="text" 
          value={description} 
          onChange={e => onChange('description', e.target.value)} 
          className="border rounded px-2 py-1" 
          data-testid="filter-description-input"
        />
      </div>
      <div>
        <label className="block text-xs font-medium mb-1">Status</label>
        <select 
          value={status} 
          onChange={e => onChange('status', e.target.value)} 
          className="border rounded px-2 py-1"
          data-testid="filter-status-select"
        >
          {statusOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium mb-1">Sort By</label>
        <select 
          value={sortBy} 
          onChange={e => onChange('sortBy', e.target.value)} 
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
          value={sortOrder} 
          onChange={e => onChange('sortOrder', e.target.value)} 
          className="border rounded px-2 py-1"
          data-testid="filter-sort-order-select"
        >
          <option value="asc">Asc</option>
          <option value="desc">Desc</option>
        </select>
      </div>
      <button type="submit" className="bg-blue-500 text-white px-3 py-1 rounded" data-testid="filter-apply-button">Apply</button>
      <button type="button" className="bg-gray-300 text-black px-3 py-1 rounded ml-2" onClick={onReset} data-testid="filter-reset-button">Reset</button>
    </form>
  );
};

export default TaskFilters; 