import { useState, useMemo } from 'react';
import { Todo, Activity } from '@/types';

interface UseTodoFiltersProps {
  activityTodos: Todo[];
  activity: Activity | undefined;
}

type TodoViewMode = 'list' | 'countdown';

interface CountdownGroupConfig {
  label: string;
  color: string;
  icon: string;
}

export const useTodoFilters = ({ activityTodos, activity }: UseTodoFiltersProps) => {
  const [todoSearchQuery, setTodoSearchQuery] = useState('');
  const [filterTodoStatus, setFilterTodoStatus] = useState<string>('all');
  const [todoViewMode, setTodoViewMode] = useState<TodoViewMode>('list');

  const filteredTodos = useMemo(() => {
    return activityTodos.filter((todo) => {
      const matchesSearch = todo.title.toLowerCase().includes(todoSearchQuery.toLowerCase());
      const matchesStatus =
        filterTodoStatus === 'all' ||
        (filterTodoStatus === 'pending' && !todo.completed) ||
        (filterTodoStatus === 'completed' && todo.completed) ||
        (filterTodoStatus === 'overdue' &&
          !todo.completed &&
          new Date(todo.dueDate) < new Date(new Date().toDateString()));
      return matchesSearch && matchesStatus;
    });
  }, [activityTodos, todoSearchQuery, filterTodoStatus]);

  const groupedTodos = useMemo(() => {
    const getTodoCountdownGroup = (todo: Todo): string => {
      if (!activity) return 'other';

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const dueDate = new Date(todo.dueDate);
      dueDate.setHours(0, 0, 0, 0);

      const actDate = new Date(activity.date);
      actDate.setHours(0, 0, 0, 0);

      if (!todo.completed && dueDate < today) {
        return 'overdue';
      }

      const diffTime = actDate.getTime() - dueDate.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays < 0) {
        return 'after-activity';
      } else if (diffDays === 0) {
        return 'activity-day';
      } else if (diffDays <= 3) {
        return 'within-3-days';
      } else if (diffDays <= 7) {
        return 'within-7-days';
      } else {
        return 'more-than-7-days';
      }
    };

    const groups: Record<string, Todo[]> = {
      overdue: [],
      'activity-day': [],
      'within-3-days': [],
      'within-7-days': [],
      'more-than-7-days': [],
      'after-activity': [],
    };

    filteredTodos.forEach((todo) => {
      const group = getTodoCountdownGroup(todo);
      if (groups[group]) {
        groups[group].push(todo);
      }
    });

    return groups;
  }, [filteredTodos, activity]);

  const countdownGroupConfig: Record<string, CountdownGroupConfig> = {
    overdue: { label: '已逾期', color: 'red', icon: '⏰' },
    'activity-day': { label: '活动当天', color: 'pink', icon: '🎉' },
    'within-3-days': { label: '活动前3天内', color: 'orange', icon: '🔥' },
    'within-7-days': { label: '活动前7天内', color: 'yellow', icon: '📅' },
    'more-than-7-days': { label: '7天以上', color: 'green', icon: '🌱' },
    'after-activity': { label: '活动后', color: 'purple', icon: '📌' },
  };

  return {
    todoSearchQuery,
    setTodoSearchQuery,
    filterTodoStatus,
    setFilterTodoStatus,
    todoViewMode,
    setTodoViewMode,
    filteredTodos,
    groupedTodos,
    countdownGroupConfig,
  };
};
