import React from 'react';
import { FaSpinner } from 'react-icons/fa';

type Task = {
  id: number;
  title: string;
  description: string;
  status: string;
};

type TaskTableProps = {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  editLoading: boolean;
  deleteLoading: boolean;
  editingTaskId?: number | null;
};

const TaskTable: React.FC<TaskTableProps> = ({
  tasks,
  onEdit,
  onDelete,
  editLoading,
  deleteLoading,
  editingTaskId,
}) => {
  return (
    <div className="bg-white/80 rounded-2xl shadow border border-gray-100 overflow-x-auto">
      <table className="w-full min-w-[600px]" data-testid="task-table">
        <thead>
          <tr className="bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100">
            <th className="p-3 text-left font-bold text-gray-700 text-base">Title</th>
            <th className="p-3 text-left font-bold text-gray-700 text-base">Description</th>
            <th className="p-3 text-left font-bold text-gray-700 text-base">Status</th>
            <th className="p-3 text-left font-bold text-gray-700 text-base">Actions</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task, index) => {
            const isEditing = editingTaskId === task.id;
            return (
              <tr
                key={task.id}
                className={`border-t transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50`}
                data-testid={`task-row-${index}`}
              >
                <td className="p-3" data-testid={`task-title-${index}`}>{task.title}</td>
                <td className="p-3" data-testid={`task-description-${index}`}>{task.description}</td>
                <td className="p-3 capitalize" data-testid={`task-status-${index}`}>{task.status}</td>
                <td className="p-3 flex gap-2">
                  <button
                    className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-1.5 rounded-lg shadow hover:opacity-90 focus:ring-2 focus:ring-blue-300 font-semibold transition flex items-center gap-1 disabled:opacity-60 disabled:cursor-not-allowed"
                    onClick={() => onEdit(task)}
                    disabled={editLoading || isEditing}
                    aria-disabled={editLoading || isEditing}
                    aria-label={`Edit ${task.title}`}
                    data-testid={`edit-task-button-${index}`}
                  >
                    {editLoading ? <FaSpinner className="animate-spin" aria-label="Loading" /> : null}
                    Edit
                  </button>
                  <button
                    className="bg-gradient-to-r from-pink-500 to-red-500 text-white px-4 py-1.5 rounded-lg shadow hover:opacity-90 focus:ring-2 focus:ring-red-300 font-semibold transition flex items-center gap-1 disabled:opacity-60 disabled:cursor-not-allowed"
                    onClick={() => onDelete(task)}
                    disabled={deleteLoading || isEditing}
                    aria-disabled={deleteLoading || isEditing}
                    aria-label={`Delete ${task.title}`}
                    data-testid={`delete-task-button-${index}`}
                  >
                    {deleteLoading ? (
                      <FaSpinner className="animate-spin" aria-label="Loading" />
                    ) : null}
                    Delete
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default TaskTable;
