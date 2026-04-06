'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import {
  LayoutDashboard, Bell, ChevronDown, ChevronRight,
  Plus, Settings, Search, Star, Users, Zap, Sparkles,
  FolderOpen, Contact2, TrendingUp, Calendar,
} from 'lucide-react';
import { AppSection } from '@/lib/types';

export function Sidebar() {
  const { state, dispatch } = useStore();
  const [projectsOpen, setProjectsOpen] = useState(true);
  const unreadCount = state.notifications.filter(n => !n.read).length;

  function setSection(section: AppSection) {
    dispatch({ type: 'SET_ACTIVE_SECTION', payload: section });
  }

  const navItems: { section: AppSection; icon: React.ReactNode; label: string; badge?: number }[] = [
    { section: 'dashboard', icon: <LayoutDashboard size={16} />, label: 'Dashboard' },
    { section: 'crm', icon: <Contact2 size={16} />, label: 'CRM' },
    { section: 'automations', icon: <Zap size={16} />, label: 'Automations' },
  ];

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="logo-icon">T</div>
        <span className="logo-text">TaskFlow</span>
      </div>

      {/* Search */}
      <div className="sidebar-search">
        <Search size={14} />
        <span>Search</span>
      </div>

      {/* Nav items */}
      <nav className="sidebar-nav">
        {navItems.map(item => (
          <div
            key={item.section}
            className={`sidebar-nav-item ${state.activeSection === item.section ? 'active' : ''}`}
            onClick={() => setSection(item.section)}
          >
            {item.icon}
            <span>{item.label}</span>
            {item.badge != null && item.badge > 0 && (
              <span className="notification-badge">{item.badge}</span>
            )}
          </div>
        ))}
        <div
          className="sidebar-nav-item"
          onClick={() => dispatch({ type: 'TOGGLE_NOTIFICATIONS_PANEL' })}
        >
          <Bell size={16} />
          <span>Notifications</span>
          {unreadCount > 0 && (
            <span className="notification-badge">{unreadCount}</span>
          )}
        </div>
      </nav>

      <div className="sidebar-divider" />

      {/* Projects */}
      <div className="sidebar-section">
        <div
          className="sidebar-section-header"
          onClick={() => setProjectsOpen(!projectsOpen)}
        >
          {projectsOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          <span>Projects</span>
        </div>

        {projectsOpen && (
          <div className="sidebar-projects">
            {state.projects.map(project => (
              <div
                key={project.id}
                className={`sidebar-project-item ${state.activeProjectId === project.id && state.activeSection === 'projects' ? 'active' : ''}`}
                onClick={() => {
                  dispatch({ type: 'SET_ACTIVE_PROJECT', payload: project.id });
                  dispatch({ type: 'SET_ACTIVE_SECTION', payload: 'projects' });
                }}
              >
                <span className="project-dot" style={{ background: project.color }} />
                <span className="project-name">{project.icon} {project.name}</span>
              </div>
            ))}
            <div
              className="sidebar-add-project"
              onClick={() => dispatch({ type: 'OPEN_NEW_PROJECT_MODAL' })}
            >
              <Plus size={14} />
              <span>Add Project</span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom */}
      <div className="sidebar-footer">
        {/* AI Agent button */}
        <div
          className={`sidebar-ai-btn ${state.aiPanelOpen ? 'active' : ''}`}
          onClick={() => dispatch({ type: 'TOGGLE_AI_PANEL' })}
        >
          <div className="ai-btn-glow" />
          <Sparkles size={15} />
          <span>AI Assistant</span>
          {state.aiPanelOpen && <span className="ai-online-dot" />}
        </div>

        <div className="sidebar-nav-item">
          <Users size={16} />
          <span>Team</span>
        </div>
        <div className="sidebar-nav-item">
          <Settings size={16} />
          <span>Settings</span>
        </div>
        <div className="user-avatar-bar">
          <div className="user-avatar" style={{ background: state.currentUser.color }}>
            {state.currentUser.avatar}
          </div>
          <div className="user-info">
            <div className="user-name">{state.currentUser.name}</div>
            <div className="user-email">{state.currentUser.email}</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
