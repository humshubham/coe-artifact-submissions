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
    <table className="w-full border rounded" data-testid="task-table">
      <thead>
        <tr className="bg-gray-100">
          <th className="p-2 text-left">Title</th>
          <th className="p-2 text-left">Description</th>
          <th className="p-2 text-left">Status</th>
          <th className="p-2 text-left">Actions</th>
        </tr>
      </thead>
      <tbody>
        {tasks.map((task, index) => {
          const isEditing = editingTaskId === task.id;
          return (
            <tr key={task.id} className="border-t" data-testid={`task-row-${index}`}>
              <td className="p-2" data-testid={`task-title-${index}`}>
                {task.title}
              </td>
              <td className="p-2" data-testid={`task-description-${index}`}>
                {task.description}
              </td>
              <td className="p-2" data-testid={`task-status-${index}`}>
                {task.status}
              </td>
              <td className="p-2 flex gap-2">
                <button
                  className="bg-blue-500 text-white px-2 py-1 rounded flex items-center gap-1"
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
                  className="bg-red-500 text-white px-2 py-1 rounded flex items-center gap-1"
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
  );
};

export default TaskTable;
