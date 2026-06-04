import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sparkles, Database, Home, Image } from 'lucide-react';
import { cn } from '@/utils/helpers';

export const Navbar: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: '活动列表', icon: Home },
    { path: '/images', label: '图片库', icon: Image },
    { path: '/data', label: '数据管理', icon: Database },
  ];

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-pink-100 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-purple-400 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-pink-200 transition-shadow">
              <Sparkles className="text-white" size={22} />
            </div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                应援物资管理
              </h1>
              <p className="text-xs text-gray-400">Cheering Material Manager</p>
            </div>
          </Link>

          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all',
                    isActive
                      ? 'bg-gradient-to-r from-pink-100 to-purple-100 text-pink-600 shadow-sm'
                      : 'text-gray-600 hover:bg-pink-50 hover:text-pink-500'
                  )}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};
