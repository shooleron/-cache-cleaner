'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { isAdmin } from '@/lib/permissions';
import { Event } from '@/lib/types';

const STATUS_LABELS: Record<string, string> = {
  draft: 'טיוטה',
  active: 'פעיל',
  completed: 'הושלם',
  archived: 'ארכיון',
};

const STATUS_COLORS: Record<string, string> = {
  draft: '#fdab3d',
  active: '#00c875',
  completed: '#c4c4c4',
  archived: '#c4c4c4',
};

const PANEL_FORMAT_LABELS: Record<string, string> = {
  panel: 'פאנל',
  lecture: 'הרצאה',
  interview: 'ראיון',
  video: 'וידאו',
  discussion: 'דיון',
};

function EventCard({ event, onSelect, isSelected }: { event: Event; onSelect: () => void; isSelected: boolean }) {
  const { state } = useStore();
  const projects = state.projects.filter(p => p.eventId === event.id);
  const eventTasks = state.tasks.filter(t => projects.some(p => p.id === t.projectId));
  const done = eventTasks.filter(t => t.status === 'done').length;
  const pct = eventTasks.length > 0 ? Math.round((done / eventTasks.length) * 100) : 0;
  const panels = state.panels.filter(p => p.eventId === event.id);
  const speakers = state.speakers.filter(s => s.eventIds.includes(event.id));
  const deals = state.deals.filter(d => d.eventId === event.id && d.stage === 'closed_won');
  const revenue = deals.reduce((sum, d) => sum + d.value, 0);

  return (
    <div
      className={`event-card ${isSelected ? 'selected' : ''}`}
      onClick={onSelect}
    >
      <div className="event-card-top">
        <div className="event-card-icon-wrap" style={{ background: event.color + '22' }}>
          <span className="material-symbols-outlined" style={{ fontSize: 22, color: event.color }}>{event.icon || 'event'}</span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="event-card-name">{event.name}</div>
          <div className="event-card-date">
            <span className="material-symbols-outlined" style={{ fontSize: 13 }}>calendar_today</span>
            {new Date(event.date).toLocaleDateString('he-IL', { day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
        </div>
        <span className="event-card-status-dot" style={{ background: STATUS_COLORS[event.status] }} title={STATUS_LABELS[event.status]} />
      </div>

      {event.description && (
        <p className="event-card-desc">{event.description}</p>
      )}

      {/* Stats */}
      <div className="event-card-stats">
        <div className="event-stat">
          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>folder</span>
          <span>{projects.length} פרויקטים</span>
        </div>
        <div className="event-stat">
          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>mic</span>
          <span>{speakers.length} דוברים</span>
        </div>
        <div className="event-stat">
          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>groups</span>
          <span>{panels.length} פאנלים</span>
        </div>
        {revenue > 0 && (
          <div className="event-stat" style={{ color: '#10b981' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>payments</span>
            <span>₪{(revenue / 1000).toFixed(0)}K</span>
          </div>
        )}
      </div>

      {/* Progress */}
      {eventTasks.length > 0 && (
        <div style={{ marginTop: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>התקדמות</span>
            <span style={{ fontSize: 11, fontWeight: 600 }}>{pct}%</span>
          </div>
          <div style={{ height: 4, background: '#e2e8f0', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${pct}%`, background: event.color, borderRadius: 2 }} />
          </div>
        </div>
      )}
    </div>
  );
}

function EventDetail({ eventId }: { eventId: string }) {
  const { state, dispatch } = useStore();
  const event = state.events.find(e => e.id === eventId);
  if (!event) return null;

  const projects = state.projects.filter(p => p.eventId === eventId);
  const panels = state.panels.filter(p => p.eventId === eventId);
  const speakers = state.speakers.filter(s => s.eventIds.includes(eventId));
  const deals = state.deals.filter(d => d.eventId === eventId && d.stage === 'closed_won');

  // Products sold (from deal line items)
  const soldProducts: { productId: string; productName: string; quantity: number; unitPrice: number }[] = [];
  deals.forEach(deal => {
    deal.lineItems?.forEach(li => {
      const existing = soldProducts.find(p => p.productId === li.productId);
      if (existing) {
        existing.quantity += li.quantity;
      } else {
        soldProducts.push({ ...li });
      }
    });
  });

  const [activeTab, setActiveTab] = useState<'projects' | 'products' | 'panels' | 'speakers'>('projects');

  return (
    <div className="event-detail">
      {/* Header */}
      <div className="event-detail-header">
        <div className="event-detail-icon" style={{ background: event.color + '22' }}>
          <span className="material-symbols-outlined" style={{ fontSize: 28, color: event.color }}>{event.icon || 'event'}</span>
        </div>
        <div style={{ flex: 1 }}>
          <h2 className="event-detail-name">{event.name}</h2>
          <div className="event-detail-meta">
            <span className="event-detail-status" style={{ background: STATUS_COLORS[event.status] + '22', color: STATUS_COLORS[event.status] }}>
              {STATUS_LABELS[event.status]}
            </span>
            <span>
              <span className="material-symbols-outlined" style={{ fontSize: 13, verticalAlign: 'middle' }}>calendar_today</span>
              {' '}{new Date(event.date).toLocaleDateString('he-IL', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
            {event.location && (
              <span>
                <span className="material-symbols-outlined" style={{ fontSize: 13, verticalAlign: 'middle' }}>location_on</span>
                {' '}{event.location}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="event-detail-tabs">
        {[
          { id: 'projects', label: 'פרויקטים', icon: 'folder', count: projects.length },
          { id: 'products', label: 'מופעים ומכירות', icon: 'sell', count: soldProducts.length },
          { id: 'panels', label: 'פאנלים', icon: 'groups', count: panels.length },
          { id: 'speakers', label: 'דוברים', icon: 'mic', count: speakers.length },
        ].map(tab => (
          <button
            key={tab.id}
            className={`event-detail-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 15 }}>{tab.icon}</span>
            {tab.label}
            {tab.count > 0 && <span className="event-detail-tab-count">{tab.count}</span>}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="event-detail-content">
        {activeTab === 'projects' && (
          <div>
            {projects.length === 0 && <div className="event-detail-empty">אין פרויקטים לאירוע זה</div>}
            {projects.map(project => {
              const tasks = state.tasks.filter(t => t.projectId === project.id);
              const done = tasks.filter(t => t.status === 'done').length;
              const pct = tasks.length > 0 ? Math.round((done / tasks.length) * 100) : 0;
              return (
                <div
                  key={project.id}
                  className="event-project-row"
                  onClick={() => {
                    dispatch({ type: 'SET_ACTIVE_PROJECT', payload: project.id });
                    dispatch({ type: 'SET_ACTIVE_SECTION', payload: 'events' });
                  }}
                >
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: project.color, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div className="event-project-name">{project.name}</div>
                    <div style={{ height: 4, background: '#e2e8f0', borderRadius: 2, marginTop: 4, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: project.color, borderRadius: 2 }} />
                    </div>
                  </div>
                  <span style={{ fontSize: 12, color: 'var(--on-surface-variant)' }}>{done}/{tasks.length} משימות</span>
                  <span className="material-symbols-outlined" style={{ fontSize: 16, color: 'var(--on-surface-variant)' }}>chevron_left</span>
                </div>
              );
            })}
            <button
              className="event-add-btn"
              onClick={() => dispatch({ type: 'OPEN_NEW_PROJECT_MODAL' })}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 15 }}>add</span>
              הוסף פרויקט לאירוע
            </button>
          </div>
        )}

        {activeTab === 'products' && (
          <div>
            {soldProducts.length === 0 && (
              <div className="event-detail-empty">
                <p>אין מוצרים שנמכרו לאירוע זה</p>
                <p style={{ fontSize: 12, color: 'var(--on-surface-variant)', marginTop: 4 }}>סגור עסקות בסטטוס &quot;closed_won&quot; ושייך אותן לאירוע</p>
              </div>
            )}
            {soldProducts.length > 0 && (
              <>
                <div className="event-products-total">
                  סה&quot;כ הכנסות: <strong>₪{deals.reduce((s, d) => s + d.value, 0).toLocaleString('he-IL')}</strong>
                </div>
                {soldProducts.map((p, i) => {
                  const product = state.products.find(pr => pr.id === p.productId);
                  return (
                    <div key={i} className="event-product-row">
                      <span className="material-symbols-outlined" style={{ fontSize: 20, color: 'var(--primary)' }}>
                        {product?.icon || 'sell'}
                      </span>
                      <div style={{ flex: 1 }}>
                        <div className="event-product-name">{p.productName}</div>
                        <div className="event-product-meta">כמות: {p.quantity}</div>
                      </div>
                      <div className="event-product-price">
                        ₪{(p.unitPrice * p.quantity).toLocaleString('he-IL')}
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        )}

        {activeTab === 'panels' && (
          <div>
            {panels.length === 0 && <div className="event-detail-empty">אין פאנלים לאירוע זה</div>}
            {panels.map(panel => {
              const panelSpeakers = state.speakers.filter(s => panel.speakerIds.includes(s.id));
              return (
                <div key={panel.id} className="event-panel-row">
                  <div className="event-panel-header-row">
                    <span className="event-panel-format">{PANEL_FORMAT_LABELS[panel.format] || panel.format}</span>
                    <span className="event-panel-name">{panel.name}</span>
                    <span className="event-panel-duration">{panel.duration} דקות</span>
                  </div>
                  {panel.hall && (
                    <div className="event-panel-meta">
                      <span className="material-symbols-outlined" style={{ fontSize: 13 }}>location_on</span>
                      {panel.hall}
                      {panel.startTime && <span> · {panel.startTime}</span>}
                    </div>
                  )}
                  {panelSpeakers.length > 0 && (
                    <div className="event-panel-speakers">
                      {panelSpeakers.map(s => (
                        <span key={s.id} className="event-panel-speaker-chip">
                          <span className="event-panel-speaker-avatar" style={{ background: '#6366f1' }}>{s.avatar}</span>
                          {s.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'speakers' && (
          <div>
            {speakers.length === 0 && <div className="event-detail-empty">אין דוברים לאירוע זה</div>}
            {speakers.map(speaker => (
              <div
                key={speaker.id}
                className="event-speaker-row"
                onClick={() => dispatch({ type: 'OPEN_SPEAKER_MODAL', payload: speaker.id })}
              >
                <div className="event-speaker-avatar" style={{ background: '#6366f1' }}>{speaker.avatar}</div>
                <div style={{ flex: 1 }}>
                  <div className="event-speaker-name">{speaker.name}</div>
                  <div className="event-speaker-meta">{speaker.jobTitle} · {speaker.organization}</div>
                </div>
                <span className="event-speaker-status" style={{
                  background: speaker.approvalStatus === 'approved' ? '#dcfce7' : speaker.approvalStatus === 'pending' ? '#fef9c3' : '#fee2e2',
                  color: speaker.approvalStatus === 'approved' ? '#16a34a' : speaker.approvalStatus === 'pending' ? '#ca8a04' : '#dc2626',
                }}>
                  {speaker.approvalStatus === 'approved' ? 'מאושר' : speaker.approvalStatus === 'pending' ? 'ממתין' : 'בוטל'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function EventsView() {
  const { state, dispatch } = useStore();
  const admin = isAdmin(state.currentUser);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(
    state.activeEventId || (state.events[0]?.id ?? null)
  );

  const activeEvents = state.events.filter(e => e.status !== 'archived');
  const archivedEvents = state.events.filter(e => e.status === 'archived');

  function selectEvent(id: string) {
    setSelectedEventId(id);
    dispatch({ type: 'SET_ACTIVE_EVENT', payload: id });
  }

  return (
    <div className="events-view">
      {/* Left column: event cards */}
      <div className="events-list-col">
        <div className="events-list-header">
          <h2 className="events-list-title">אירועים</h2>
          {admin && (
            <button className="events-add-btn" onClick={() => dispatch({ type: 'OPEN_NEW_EVENT_MODAL' })}>
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span>
              חדש
            </button>
          )}
        </div>

        {activeEvents.map(event => (
          <EventCard
            key={event.id}
            event={event}
            isSelected={selectedEventId === event.id}
            onSelect={() => selectEvent(event.id)}
          />
        ))}

        {archivedEvents.length > 0 && (
          <div className="events-archive-section">
            <div className="events-archive-label">ארכיון ({archivedEvents.length})</div>
            {archivedEvents.map(event => (
              <EventCard
                key={event.id}
                event={event}
                isSelected={selectedEventId === event.id}
                onSelect={() => selectEvent(event.id)}
              />
            ))}
          </div>
        )}

        {state.events.length === 0 && (
          <div className="events-empty">
            <span className="material-symbols-outlined" style={{ fontSize: 40, color: '#c4c4c4' }}>event</span>
            <p>אין אירועים עדיין</p>
            {admin && (
              <button className="events-add-btn" onClick={() => dispatch({ type: 'OPEN_NEW_EVENT_MODAL' })}>
                צור אירוע ראשון
              </button>
            )}
          </div>
        )}
      </div>

      {/* Right column: event detail */}
      <div className="events-detail-col">
        {selectedEventId ? (
          <EventDetail eventId={selectedEventId} />
        ) : (
          <div className="events-empty" style={{ height: '100%' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 48, color: '#c4c4c4' }}>event_note</span>
            <p>בחר אירוע לצפייה בפרטים</p>
          </div>
        )}
      </div>
    </div>
  );
}
