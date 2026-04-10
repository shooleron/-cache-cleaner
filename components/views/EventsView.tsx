'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { isAdmin } from '@/lib/permissions';

const STATUS_LABELS: Record<string, string> = {
  draft: 'טיוטה',
  active: 'פעיל',
  completed: 'הושלם',
  archived: 'ארכיון',
};

const STATUS_COLORS: Record<string, string> = {
  draft: '#fdab3d',
  active: '#00c875',
  completed: '#6366f1',
  archived: '#94a3b8',
};

const PANEL_FORMAT_LABELS: Record<string, string> = {
  panel: 'פאנל', lecture: 'הרצאה', interview: 'ראיון', video: 'וידאו', discussion: 'דיון',
};

function EventDetail({ eventId }: { eventId: string }) {
  const { state, dispatch } = useStore();
  const event = state.events.find(e => e.id === eventId);
  if (!event) return null;

  const projects = state.projects.filter(p => p.eventId === eventId);
  const panels = state.panels.filter(p => p.eventId === eventId);
  const speakers = state.speakers.filter(s => s.eventIds.includes(eventId));
  const deals = state.deals.filter(d => d.eventId === eventId && d.stage === 'closed_won');

  const soldProducts: { productId: string; productName: string; quantity: number; unitPrice: number }[] = [];
  deals.forEach(deal => {
    deal.lineItems?.forEach(li => {
      const ex = soldProducts.find(p => p.productId === li.productId);
      if (ex) ex.quantity += li.quantity;
      else soldProducts.push({ ...li });
    });
  });

  const eventTasks = state.tasks.filter(t => projects.some(p => p.id === t.projectId));
  const doneTasks = eventTasks.filter(t => t.status === 'done').length;
  const pct = eventTasks.length > 0 ? Math.round((doneTasks / eventTasks.length) * 100) : 0;
  const revenue = deals.reduce((s, d) => s + d.value, 0);

  const [activeTab, setActiveTab] = useState<'projects' | 'products' | 'panels' | 'speakers'>('projects');

  const categoryTabs = [
    { id: 'projects',  label: 'פרויקטים',       icon: 'folder',   count: projects.length },
    { id: 'products',  label: 'מופעים ומכירות',  icon: 'sell',     count: soldProducts.length },
    { id: 'panels',    label: 'פאנלים',          icon: 'groups',   count: panels.length },
    { id: 'speakers',  label: 'דוברים',          icon: 'mic',      count: speakers.length },
  ] as const;

  return (
    <div className="event-detail-full">
      {/* Prominent event header */}
      <div className="event-detail-banner" style={{ background: `linear-gradient(135deg, ${event.color}18 0%, ${event.color}08 100%)`, borderTop: `4px solid ${event.color}` }}>
        <div className="event-detail-banner-left">
          <div className="event-detail-banner-icon" style={{ background: event.color + '22' }}>
            <span style={{ fontSize: 32 }}>{event.icon || '📅'}</span>
          </div>
          <div>
            <div style={{ display: 'flex', flexDirection: 'row-reverse', alignItems: 'center', gap: 10 }}>
              <h2 className="event-detail-banner-name">{event.name}</h2>
              <span className="event-detail-banner-status" style={{ background: STATUS_COLORS[event.status], color: '#fff' }}>
                {STATUS_LABELS[event.status]}
              </span>
            </div>
            <div className="event-detail-banner-meta">
              <span><span className="material-symbols-outlined" style={{ fontSize: 14, verticalAlign: 'middle' }}>calendar_today</span> {new Date(event.date).toLocaleDateString('he-IL', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              {event.location && <span><span className="material-symbols-outlined" style={{ fontSize: 14, verticalAlign: 'middle' }}>location_on</span> {event.location}</span>}
            </div>
          </div>
        </div>

        {/* Quick stats */}
        <div className="event-detail-banner-stats">
          <div className="event-banner-stat">
            <span className="event-banner-stat-val">{projects.length}</span>
            <span className="event-banner-stat-label">פרויקטים</span>
          </div>
          <div className="event-banner-stat">
            <span className="event-banner-stat-val">{speakers.length}</span>
            <span className="event-banner-stat-label">דוברים</span>
          </div>
          <div className="event-banner-stat">
            <span className="event-banner-stat-val">{panels.length}</span>
            <span className="event-banner-stat-label">פאנלים</span>
          </div>
          {revenue > 0 && (
            <div className="event-banner-stat" style={{ color: '#10b981' }}>
              <span className="event-banner-stat-val">₪{(revenue / 1000).toFixed(0)}K</span>
              <span className="event-banner-stat-label">הכנסות</span>
            </div>
          )}
          {eventTasks.length > 0 && (
            <div className="event-banner-stat">
              <span className="event-banner-stat-val">{pct}%</span>
              <span className="event-banner-stat-label">ביצוע</span>
              <div style={{ height: 3, background: '#e2e8f0', borderRadius: 2, marginTop: 3, overflow: 'hidden', width: 50 }}>
                <div style={{ height: '100%', width: `${pct}%`, background: event.color }} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Category tabs */}
      <div className="event-category-tabs">
        {categoryTabs.map(tab => (
          <button
            key={tab.id}
            className={`event-category-tab ${activeTab === tab.id ? 'active' : ''}`}
            style={activeTab === tab.id ? { borderBottomColor: event.color, color: event.color } : {}}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>{tab.icon}</span>
            <span>{tab.label}</span>
            {tab.count > 0 && (
              <span className="event-category-tab-count" style={activeTab === tab.id ? { background: event.color, color: '#fff' } : {}}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="event-tab-body">
        {activeTab === 'projects' && (
          <div>
            {projects.length === 0 && <div className="event-detail-empty">אין פרויקטים לאירוע זה</div>}
            {projects.map(project => {
              const tasks = state.tasks.filter(t => t.projectId === project.id);
              const done = tasks.filter(t => t.status === 'done').length;
              const p = tasks.length > 0 ? Math.round((done / tasks.length) * 100) : 0;
              return (
                <div key={project.id} className="event-project-row" onClick={() => {
                  dispatch({ type: 'SET_ACTIVE_PROJECT', payload: project.id });
                  dispatch({ type: 'SET_ACTIVE_SECTION', payload: 'events' });
                }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: project.color, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div className="event-project-name">{project.name}</div>
                    <div style={{ height: 4, background: '#e2e8f0', borderRadius: 2, marginTop: 4, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${p}%`, background: project.color, borderRadius: 2 }} />
                    </div>
                  </div>
                  <span style={{ fontSize: 12, color: 'var(--on-surface-variant)' }}>{done}/{tasks.length} משימות</span>
                  <span className="material-symbols-outlined" style={{ fontSize: 16, color: 'var(--on-surface-variant)' }}>chevron_left</span>
                </div>
              );
            })}
            <button className="event-add-btn" onClick={() => dispatch({ type: 'OPEN_NEW_PROJECT_MODAL' })}>
              <span className="material-symbols-outlined" style={{ fontSize: 15 }}>add</span>הוסף פרויקט
            </button>
          </div>
        )}

        {activeTab === 'products' && (
          <div>
            {soldProducts.length === 0 ? (
              <div className="event-detail-empty">
                <p>אין מוצרים שנמכרו לאירוע זה</p>
                <p style={{ fontSize: 12, color: 'var(--on-surface-variant)', marginTop: 4 }}>סגור עסקות בסטטוס &quot;closed won&quot; ושייך אותן לאירוע</p>
              </div>
            ) : (
              <>
                <div className="event-products-total">סה&quot;כ הכנסות: <strong>₪{revenue.toLocaleString('he-IL')}</strong></div>
                {soldProducts.map((p, i) => {
                  const product = state.products.find(pr => pr.id === p.productId);
                  return (
                    <div key={i} className="event-product-row">
                      <span className="material-symbols-outlined" style={{ fontSize: 20, color: 'var(--primary)' }}>{product?.icon || 'sell'}</span>
                      <div style={{ flex: 1 }}>
                        <div className="event-product-name">{p.productName}</div>
                        <div className="event-product-meta">כמות: {p.quantity}</div>
                      </div>
                      <div className="event-product-price">₪{(p.unitPrice * p.quantity).toLocaleString('he-IL')}</div>
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
                  {panel.hall && <div className="event-panel-meta"><span className="material-symbols-outlined" style={{ fontSize: 13 }}>location_on</span>{panel.hall}{panel.startTime && ` · ${panel.startTime}`}</div>}
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
              <div key={speaker.id} className="event-speaker-row" onClick={() => dispatch({ type: 'OPEN_SPEAKER_MODAL', payload: speaker.id })}>
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

  // Brand filter — null means "all brands"
  const [selectedBrandId, setSelectedBrandId] = useState<string | null>(null);
  const [showArchive, setShowArchive] = useState(false);

  const activeEvents = state.events.filter(e => e.status !== 'archived');
  const archivedEvents = state.events.filter(e => e.status === 'archived');

  // Filter events by selected brand
  const visibleEvents = selectedBrandId
    ? activeEvents.filter(e => e.brandId === selectedBrandId)
    : activeEvents;

  const [selectedEventId, setSelectedEventId] = useState<string | null>(
    state.activeEventId || (visibleEvents[0]?.id ?? null)
  );

  // If selected event is not in visible set after brand switch, reset
  const effectiveSelectedId = visibleEvents.find(e => e.id === selectedEventId)
    ? selectedEventId
    : (visibleEvents[0]?.id ?? null);

  function selectEvent(id: string) {
    setSelectedEventId(id);
    dispatch({ type: 'SET_ACTIVE_EVENT', payload: id });
  }

  function selectBrand(id: string | null) {
    setSelectedBrandId(id);
    // Auto-select first event of new brand
    const first = id
      ? activeEvents.find(e => e.brandId === id)
      : activeEvents[0];
    if (first) selectEvent(first.id);
    else setSelectedEventId(null);
  }

  return (
    <div className="events-view-v2">
      {/* ── Brand tabs ── */}
      <div className="brand-tabs-bar">
        <div className="brand-tabs-scroll">
          <button
            className={`brand-tab ${!selectedBrandId ? 'active' : ''}`}
            onClick={() => selectBrand(null)}
          >
            <span className="brand-tab-icon">🌐</span>
            <span>כל המותגים</span>
          </button>
          {state.brands.map(brand => (
            <button
              key={brand.id}
              className={`brand-tab ${selectedBrandId === brand.id ? 'active' : ''}`}
              style={selectedBrandId === brand.id ? { borderBottomColor: brand.color, color: brand.color } : {}}
              onClick={() => selectBrand(brand.id)}
            >
              <span className="brand-tab-icon">{brand.icon}</span>
              <span className="brand-tab-name">{brand.name}</span>
              <span className="brand-tab-count">{activeEvents.filter(e => e.brandId === brand.id).length}</span>
            </button>
          ))}
        </div>
        {admin && (
          <button className="brand-add-btn" onClick={() => {/* future: open brand modal */}}>
            <span className="material-symbols-outlined" style={{ fontSize: 15 }}>add</span>
            מותג חדש
          </button>
        )}
      </div>

      {/* ── Event tabs (filtered by brand) ── */}
      <div className="events-topbar">
        <div className="events-tabs-scroll">
          {visibleEvents.map(event => {
            const projects = state.projects.filter(p => p.eventId === event.id);
            const tasks = state.tasks.filter(t => projects.some(p => p.id === t.projectId));
            const done = tasks.filter(t => t.status === 'done').length;
            const pct = tasks.length > 0 ? Math.round((done / tasks.length) * 100) : 0;
            const isSelected = effectiveSelectedId === event.id;
            return (
              <button
                key={event.id}
                className={`events-tab ${isSelected ? 'active' : ''}`}
                style={isSelected ? { borderBottomColor: event.color, color: event.color } : {}}
                onClick={() => selectEvent(event.id)}
              >
                <span className="events-tab-dot" style={{ background: STATUS_COLORS[event.status] }} title={STATUS_LABELS[event.status]} />
                <div className="events-tab-info">
                  <span className="events-tab-name">{event.name}</span>
                  <span className="events-tab-date">{new Date(event.date).toLocaleDateString('he-IL', { day: 'numeric', month: 'short' })}</span>
                </div>
                {pct > 0 && (
                  <div className="events-tab-progress">
                    <div style={{ height: '100%', width: `${pct}%`, background: event.color, borderRadius: 2 }} />
                  </div>
                )}
              </button>
            );
          })}

          {archivedEvents.length > 0 && (
            <button className="events-tab events-tab-archive" onClick={() => setShowArchive(o => !o)}>
              <span className="material-symbols-outlined" style={{ fontSize: 15 }}>archive</span>
              ארכיון ({archivedEvents.length})
            </button>
          )}
        </div>

        {admin && (
          <button className="events-add-event-btn" onClick={() => dispatch({ type: 'OPEN_NEW_EVENT_MODAL' })}>
            <span className="material-symbols-outlined" style={{ fontSize: 15 }}>add</span>
            אירוע חדש
          </button>
        )}
      </div>

      {/* Archive list */}
      {showArchive && (
        <div className="events-archive-bar">
          {archivedEvents.map(event => (
            <button key={event.id} className={`events-tab ${effectiveSelectedId === event.id ? 'active' : ''}`}
              style={{ opacity: 0.6 }} onClick={() => selectEvent(event.id)}>
              <span className="events-tab-name">{event.name}</span>
              <span className="events-tab-date">{new Date(event.date).getFullYear()}</span>
            </button>
          ))}
        </div>
      )}

      {/* Event detail */}
      <div className="events-detail-area">
        {effectiveSelectedId ? (
          <EventDetail eventId={effectiveSelectedId} />
        ) : (
          <div className="events-empty" style={{ height: '50vh' }}>
            <span style={{ fontSize: 48 }}>📅</span>
            <p>{selectedBrandId ? 'אין אירועים למותג זה' : 'בחר אירוע למעלה'}</p>
            {admin && <button className="events-add-btn" onClick={() => dispatch({ type: 'OPEN_NEW_EVENT_MODAL' })}>צור אירוע ראשון</button>}
          </div>
        )}
      </div>
    </div>
  );
}
