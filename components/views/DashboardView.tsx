'use client';

import React from 'react';
import { useStore } from '@/lib/store';
import { TrendingUp, CheckCircle, AlertCircle, Clock, Users, DollarSign, Target, Activity } from 'lucide-react';

function KPICard({ icon, label, value, sub, color, trend }: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
  trend?: { value: number; positive: boolean };
}) {
  return (
    <div className="kpi-card">
      <div className="kpi-icon" style={{ background: color + '18', color }}>
        {icon}
      </div>
      <div className="kpi-body">
        <div className="kpi-value">{value}</div>
        <div className="kpi-label">{label}</div>
        {sub && <div className="kpi-sub">{sub}</div>}
      </div>
      {trend && (
        <div className={`kpi-trend ${trend.positive ? 'positive' : 'negative'}`}>
          {trend.positive ? '↑' : '↓'} {Math.abs(trend.value)}%
        </div>
      )}
    </div>
  );
}

function MiniBarChart({ data, color }: { data: { label: string; value: number }[]; color: string }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="mini-bar-chart">
      {data.map((d, i) => (
        <div key={i} className="mini-bar-item">
          <div className="mini-bar-wrap">
            <div
              className="mini-bar-fill"
              style={{ height: `${(d.value / max) * 100}%`, background: color }}
            />
          </div>
          <div className="mini-bar-label">{d.label}</div>
          <div className="mini-bar-value">{d.value}</div>
        </div>
      ))}
    </div>
  );
}

function DonutChart({ segments }: { segments: { label: string; value: number; color: string }[] }) {
  const total = segments.reduce((s, d) => s + d.value, 0) || 1;
  let cumulative = 0;
  const radius = 36;
  const cx = 44;
  const cy = 44;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="donut-wrap">
      <svg width="88" height="88" viewBox="0 0 88 88">
        <circle cx={cx} cy={cy} r={radius} fill="none" stroke="#f0f1f5" strokeWidth="10" />
        {segments.map((seg, i) => {
          const pct = seg.value / total;
          const dashArray = `${pct * circumference} ${circumference}`;
          const rotation = (cumulative / total) * 360 - 90;
          cumulative += seg.value;
          return (
            <circle
              key={i}
              cx={cx} cy={cy} r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth="10"
              strokeDasharray={dashArray}
              strokeDashoffset="0"
              transform={`rotate(${rotation} ${cx} ${cy})`}
              strokeLinecap="round"
            />
          );
        })}
        <text x={cx} y={cy + 1} textAnchor="middle" dominantBaseline="middle" fontSize="14" fontWeight="700" fill="#323338">
          {total}
        </text>
        <text x={cx} y={cy + 13} textAnchor="middle" dominantBaseline="middle" fontSize="9" fill="#676879">
          total
        </text>
      </svg>
      <div className="donut-legend">
        {segments.map((seg, i) => (
          <div key={i} className="donut-legend-item">
            <span className="donut-legend-dot" style={{ background: seg.color }} />
            <span className="donut-legend-label">{seg.label}</span>
            <span className="donut-legend-val">{seg.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DashboardView() {
  const { state } = useStore();
  const { tasks, projects, contacts, deals, users } = state;

  const now = new Date();
  const tasksDone = tasks.filter(t => t.status === 'done').length;
  const tasksInProgress = tasks.filter(t => t.status === 'in_progress').length;
  const tasksStuck = tasks.filter(t => t.status === 'stuck').length;
  const overdue = tasks.filter(t => t.dueDate && new Date(t.dueDate) < now && t.status !== 'done').length;
  const completionRate = tasks.length ? Math.round((tasksDone / tasks.length) * 100) : 0;

  const pipelineValue = deals
    .filter(d => d.stage !== 'closed_lost')
    .reduce((sum, d) => sum + d.value, 0);
  const wonValue = deals
    .filter(d => d.stage === 'closed_won')
    .reduce((sum, d) => sum + d.value, 0);

  const tasksByProject = projects.map(p => ({
    label: p.name.split(' ')[0],
    value: tasks.filter(t => t.projectId === p.id).length,
  }));

  const taskStatusSegments = [
    { label: 'Done', value: tasksDone, color: '#00c875' },
    { label: 'In Progress', value: tasksInProgress, color: '#0073ea' },
    { label: 'Stuck', value: tasksStuck, color: '#e2445c' },
    { label: 'Todo', value: tasks.filter(t => t.status === 'todo').length, color: '#fdab3d' },
    { label: 'Backlog', value: tasks.filter(t => t.status === 'backlog').length, color: '#c5c7d4' },
  ].filter(s => s.value > 0);

  const dealsByStage = [
    { label: 'Lead', value: deals.filter(d => d.stage === 'lead').length, color: '#c5c7d4' },
    { label: 'Qualified', value: deals.filter(d => d.stage === 'qualified').length, color: '#fdab3d' },
    { label: 'Proposal', value: deals.filter(d => d.stage === 'proposal').length, color: '#0073ea' },
    { label: 'Negotiation', value: deals.filter(d => d.stage === 'negotiation').length, color: '#9c27b0' },
    { label: 'Won', value: deals.filter(d => d.stage === 'closed_won').length, color: '#00c875' },
    { label: 'Lost', value: deals.filter(d => d.stage === 'closed_lost').length, color: '#e2445c' },
  ].filter(s => s.value > 0);

  const recentActivity = tasks
    .slice()
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  const topAssignees = users.map(u => ({
    user: u,
    count: tasks.filter(t => t.assigneeIds.includes(u.id)).length,
  })).sort((a, b) => b.count - a.count).slice(0, 4);

  return (
    <div className="dashboard-view">
      <div className="dashboard-header">
        <div>
          <h2 className="dashboard-title">Dashboard</h2>
          <p className="dashboard-subtitle">Overview of your workspace</p>
        </div>
        <div className="dashboard-date">{now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</div>
      </div>

      {/* KPI Row */}
      <div className="kpi-grid">
        <KPICard icon={<CheckCircle size={20} />} label="Tasks Done" value={tasksDone} sub={`${completionRate}% completion rate`} color="#00c875" trend={{ value: 12, positive: true }} />
        <KPICard icon={<Activity size={20} />} label="In Progress" value={tasksInProgress} sub={`${tasksStuck} stuck`} color="#0073ea" />
        <KPICard icon={<AlertCircle size={20} />} label="Overdue" value={overdue} sub="Needs attention" color="#e2445c" trend={{ value: 3, positive: false }} />
        <KPICard icon={<DollarSign size={20} />} label="Pipeline Value" value={`$${(pipelineValue / 1000).toFixed(0)}K`} sub={`$${(wonValue / 1000).toFixed(0)}K won`} color="#9c27b0" trend={{ value: 8, positive: true }} />
        <KPICard icon={<Users size={20} />} label="Contacts" value={contacts.length} sub={`${contacts.filter(c => c.status === 'customer').length} customers`} color="#fdab3d" />
        <KPICard icon={<Target size={20} />} label="Active Deals" value={deals.filter(d => !['closed_won', 'closed_lost'].includes(d.stage)).length} sub={`${deals.length} total`} color="#0073ea" />
      </div>

      {/* Charts Row */}
      <div className="dashboard-charts-row">
        {/* Tasks by Status */}
        <div className="dashboard-card">
          <h3 className="dashboard-card-title">Tasks by Status</h3>
          <DonutChart segments={taskStatusSegments} />
        </div>

        {/* Tasks by Project */}
        <div className="dashboard-card">
          <h3 className="dashboard-card-title">Tasks by Project</h3>
          <MiniBarChart data={tasksByProject} color="#0073ea" />
        </div>

        {/* Deals by Stage */}
        <div className="dashboard-card">
          <h3 className="dashboard-card-title">Deals Pipeline</h3>
          <DonutChart segments={dealsByStage} />
        </div>
      </div>

      {/* Bottom Row */}
      <div className="dashboard-bottom-row">
        {/* Recent Activity */}
        <div className="dashboard-card dashboard-card-wide">
          <h3 className="dashboard-card-title">Recent Activity</h3>
          <div className="activity-list">
            {recentActivity.map(task => {
              const project = projects.find(p => p.id === task.projectId);
              const assignees = task.assigneeIds.map(id => users.find(u => u.id === id)).filter(Boolean);
              return (
                <div key={task.id} className="activity-item">
                  <div className="activity-dot" style={{ background: task.status === 'done' ? '#00c875' : task.status === 'stuck' ? '#e2445c' : '#0073ea' }} />
                  <div className="activity-content">
                    <div className="activity-title">{task.title}</div>
                    <div className="activity-meta">
                      <span style={{ color: project?.color }}>{project?.icon} {project?.name}</span>
                      <span> · </span>
                      <span className={`status-badge status-${task.status}`}>{task.status.replace('_', ' ')}</span>
                    </div>
                  </div>
                  <div className="activity-assignees">
                    {assignees.slice(0, 2).map(u => u && (
                      <div key={u.id} className="activity-avatar" style={{ background: u.color }} title={u.name}>
                        {u.avatar}
                      </div>
                    ))}
                  </div>
                  <div className="activity-time">
                    {new Date(task.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Assignees */}
        <div className="dashboard-card">
          <h3 className="dashboard-card-title">Team Workload</h3>
          <div className="workload-list">
            {topAssignees.map(({ user, count }) => (
              <div key={user.id} className="workload-item">
                <div className="workload-avatar" style={{ background: user.color }}>{user.avatar}</div>
                <div className="workload-info">
                  <div className="workload-name">{user.name}</div>
                  <div className="workload-bar-wrap">
                    <div
                      className="workload-bar-fill"
                      style={{
                        width: `${Math.min((count / Math.max(...topAssignees.map(a => a.count), 1)) * 100, 100)}%`,
                        background: user.color,
                      }}
                    />
                  </div>
                </div>
                <div className="workload-count">{count}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div className="dashboard-card">
          <h3 className="dashboard-card-title">Upcoming Deadlines</h3>
          <div className="deadlines-list">
            {tasks
              .filter(t => t.dueDate && t.status !== 'done')
              .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
              .slice(0, 5)
              .map(task => {
                const dueDate = new Date(task.dueDate!);
                const isOverdue = dueDate < now;
                const daysLeft = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                return (
                  <div key={task.id} className="deadline-item">
                    <div className={`deadline-indicator ${isOverdue ? 'overdue' : daysLeft <= 3 ? 'urgent' : 'normal'}`} />
                    <div className="deadline-info">
                      <div className="deadline-title">{task.title}</div>
                      <div className={`deadline-date ${isOverdue ? 'overdue-text' : ''}`}>
                        {isOverdue ? `${Math.abs(daysLeft)}d overdue` : daysLeft === 0 ? 'Today' : `${daysLeft}d left`}
                      </div>
                    </div>
                  </div>
                );
              })}
            {tasks.filter(t => t.dueDate && t.status !== 'done').length === 0 && (
              <div className="empty-small">No upcoming deadlines</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
