import React, { useState } from 'react';
import { Check, Trash2, Calendar, MessageSquare, Edit3 } from 'lucide-react';
import { Todo } from '@/types';
import { formatDate, cn } from '@/utils/helpers';

interface TodoItemProps {
  todo: Todo;
  onToggle: () => void;
  onDelete: () => void;
  onEdit: () => void;
}

export const TodoItem: React.FC<TodoItemProps> = ({ todo, onToggle, onDelete, onEdit }) => {
  const [isHovered, setIsHovered] = useState(false);

  const isOverdue = !todo.completed && new Date(todo.dueDate) < new Date(new Date().toDateString());

  return (
    <div
      className={cn(
        'group relative p-4 rounded-xl border-2 transition-all duration-200',
        todo.completed
          ? 'bg-gray-50 border-gray-100'
          : isOverdue
          ? 'bg-red-50 border-red-200'
          : 'bg-white border-pink-100 hover:border-pink-300 hover:shadow-sm'
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start gap-3">
        <button
          onClick={onToggle}
          className={cn(
            'mt-0.5 flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all',
            todo.completed
              ? 'bg-green-500 border-green-500'
              : isOverdue
              ? 'border-red-400 hover:bg-red-100'
              : 'border-pink-300 hover:bg-pink-100'
          )}
        >
          {todo.completed && <Check size={14} className="text-white" />}
        </button>

        <div className="flex-1 min-w-0">
          <h4
            className={cn(
              'font-medium mb-2 transition-all',
              todo.completed
                ? 'text-gray-400 line-through'
                : isOverdue
                ? 'text-red-600'
                : 'text-gray-800'
            )}
          >
            {todo.title}
          </h4>

          <div className="flex flex-wrap items-center gap-3 text-sm">
            <div
              className={cn(
                'flex items-center gap-1',
                todo.completed
                  ? 'text-gray-400'
                  : isOverdue
                  ? 'text-red-500 font-medium'
                  : 'text-gray-500'
              )}
            >
              <Calendar size={14} />
              <span>
                {isOverdue && !todo.completed ? '已逾期：' : '截止：'}
                {formatDate(todo.dueDate)}
              </span>
            </div>

            {todo.note && (
              <div className="flex items-center gap-1 text-gray-400">
                <MessageSquare size={14} />
                <span className="line-clamp-1">{todo.note}</span>
              </div>
            )}
          </div>
        </div>

        <div
          className={cn(
            'flex items-center gap-1 transition-opacity',
            isHovered ? 'opacity-100' : 'opacity-0'
          )}
        >
          <button
            onClick={onEdit}
            className="p-2 rounded-lg text-gray-400 hover:text-pink-500 hover:bg-pink-50 transition-colors"
          >
            <Edit3 size={16} />
          </button>
          <button
            onClick={onDelete}
            className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
