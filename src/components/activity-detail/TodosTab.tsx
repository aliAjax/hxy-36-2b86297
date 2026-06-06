import React from 'react';
import { Plus, Search, Filter, ListTodo, Clock } from 'lucide-react';
import { Todo } from '@/types';
import { TodoItem } from '@/components/TodoItem';
import { cn } from '@/utils/helpers';

interface CountdownGroupConfig {
  label: string;
  color: string;
  icon: string;
}

interface TodosTabProps {
  filteredTodos: Todo[];
  activityTodos: Todo[];
  todoSearchQuery: string;
  setTodoSearchQuery: (value: string) => void;
  filterTodoStatus: string;
  setFilterTodoStatus: (value: string) => void;
  todoViewMode: 'list' | 'countdown';
  setTodoViewMode: (mode: 'list' | 'countdown') => void;
  groupedTodos: Record<string, Todo[]>;
  countdownGroupConfig: Record<string, CountdownGroupConfig>;
  onAddTodo: () => void;
  onToggleTodo: (todoId: string) => void;
  onEditTodo: (todo: Todo) => void;
  onDeleteTodo: (todoId: string) => void;
}

export const TodosTab: React.FC<TodosTabProps> = ({
  filteredTodos,
  activityTodos,
  todoSearchQuery,
  setTodoSearchQuery,
  filterTodoStatus,
  setFilterTodoStatus,
  todoViewMode,
  setTodoViewMode,
  groupedTodos,
  countdownGroupConfig,
  onAddTodo,
  onToggleTodo,
  onEditTodo,
  onDeleteTodo,
}) => {
  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            placeholder="搜索待办事项..."
            value={todoSearchQuery}
            onChange={(e) => setTodoSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-50 outline-none transition-all"
          />
        </div>
        <div className="relative">
          <Filter
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <select
            value={filterTodoStatus}
            onChange={(e) => setFilterTodoStatus(e.target.value)}
            className="pl-11 pr-10 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-50 outline-none transition-all appearance-none"
          >
            <option value="all">全部状态</option>
            <option value="pending">待完成</option>
            <option value="completed">已完成</option>
            <option value="overdue">已逾期</option>
          </select>
        </div>
        <button
          onClick={onAddTodo}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl font-medium hover:from-pink-600 hover:to-purple-600 transition-all shadow-sm"
        >
          <Plus size={18} />
          添加待办
        </button>
      </div>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTodoViewMode('list')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all',
            todoViewMode === 'list'
              ? 'bg-pink-500 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          )}
        >
          <ListTodo size={16} />
          列表视图
        </button>
        <button
          onClick={() => setTodoViewMode('countdown')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all',
            todoViewMode === 'countdown'
              ? 'bg-pink-500 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          )}
        >
          <Clock size={16} />
          活动倒计时
        </button>
      </div>

      {filteredTodos.length === 0 && (
        <div className="text-center py-16">
          <div className="w-20 h-20 mx-auto mb-4 bg-pink-50 rounded-full flex items-center justify-center">
            <span className="text-3xl">📋</span>
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">
            {activityTodos.length === 0
              ? '还没有添加待办事项'
              : '没有找到匹配的待办事项'}
          </h3>
          <p className="text-gray-500 mb-4">
            {activityTodos.length === 0
              ? '点击上方按钮添加待办事项吧'
              : '试试其他搜索条件'}
          </p>
        </div>
      )}

      {filteredTodos.length > 0 && todoViewMode === 'list' && (
        <div className="space-y-3">
          {filteredTodos.map((todo, index) => (
            <div
              key={todo.id}
              style={{ animation: `fadeInUp 0.3s ease-out ${index * 0.03}s both` }}
            >
              <TodoItem
                todo={todo}
                onToggle={() => onToggleTodo(todo.id)}
                onDelete={() => onDeleteTodo(todo.id)}
                onEdit={() => onEditTodo(todo)}
              />
            </div>
          ))}
        </div>
      )}

      {filteredTodos.length > 0 && todoViewMode === 'countdown' && (
        <div className="space-y-6">
          {Object.keys(countdownGroupConfig).map((groupKey) => {
            const groupTodos = groupedTodos[groupKey] || [];
            if (groupTodos.length === 0) return null;

            const groupConfig = countdownGroupConfig[groupKey];

            return (
              <div key={groupKey}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">{groupConfig.icon}</span>
                  <h3 className="font-bold text-gray-800">{groupConfig.label}</h3>
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full">
                    {groupTodos.length}
                  </span>
                </div>
                <div className="space-y-3">
                  {groupTodos.map((todo, index) => (
                    <div
                      key={todo.id}
                      style={{
                        animation: `fadeInUp 0.3s ease-out ${index * 0.03}s both`,
                      }}
                    >
                      <TodoItem
                        todo={todo}
                        onToggle={() => onToggleTodo(todo.id)}
                        onDelete={() => onDeleteTodo(todo.id)}
                        onEdit={() => onEditTodo(todo)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
