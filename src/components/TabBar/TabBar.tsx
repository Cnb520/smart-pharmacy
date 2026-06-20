import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Pill, User } from 'lucide-react';
import styles from './TabBar.module.css';

interface TabItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
}

const tabs: TabItem[] = [
  { label: '首页', path: '/home', icon: Home },
  { label: '药品分类', path: '/drug-category', icon: Pill },
  { label: '我的', path: '/mine', icon: User },
];

const TabBar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className={styles.tabBar}>
      {tabs.map((tab) => {
        const isActive = location.pathname.startsWith(tab.path);
        const Icon = tab.icon;

        return (
          <div
            key={tab.path}
            className={`${styles.tabItem} ${isActive ? styles.active : ''}`}
            onClick={() => navigate(tab.path)}
          >
            <Icon className={isActive ? styles.active : undefined} />
            <span className={styles.tabLabel}>{tab.label}</span>
          </div>
        );
      })}
    </div>
  );
};

export default TabBar;
