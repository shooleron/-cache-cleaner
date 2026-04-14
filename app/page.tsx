'use client';

import { StoreProvider, useStore } from '@/lib/store';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopBar } from '@/components/layout/TopBar';
import { DashboardView } from '@/components/views/DashboardView';
import { TableView } from '@/components/views/TableView';
import { KanbanView } from '@/components/views/KanbanView';
import { RoadmapView } from '@/components/views/RoadmapView';
import { CalendarView } from '@/components/views/CalendarView';
import { ContactsView } from '@/components/crm/ContactsView';
import { DealsView } from '@/components/crm/DealsView';
import { AutomationsPanel } from '@/components/automations/AutomationsPanel';
import { UsersView } from '@/components/views/UsersView';
import { SpeakersView } from '@/components/views/SpeakersView';
import { MyTasksView } from '@/components/views/MyTasksView';
import { EventsView } from '@/components/views/EventsView';
import { SpeakerModal } from '@/components/modals/SpeakerModal';
import { AIAgentPanel } from '@/components/ai/AIAgentPanel';
import { NotificationsPanel } from '@/components/panels/NotificationsPanel';
import { ChatPanel } from '@/components/panels/ChatPanel';
import { WelcomeModal } from '@/components/modals/WelcomeModal';
import { CelebrationOverlay } from '@/components/ui/CelebrationOverlay';
import { TaskModal } from '@/components/modals/TaskModal';
import { NewProjectModal } from '@/components/modals/NewProjectModal';
import { NewEventModal } from '@/components/modals/NewEventModal';
import { InviteModal } from '@/components/modals/InviteModal';
import { OnboardingModal } from '@/components/modals/OnboardingModal';
import { ProfileModal } from '@/components/modals/ProfileModal';
import { PasswordGate } from '@/components/auth/PasswordGate';

function AppContent() {
  const { state } = useStore();

  const renderMainContent = () => {
    if (state.activeSection === 'dashboard') return <DashboardView />;
    if (state.activeSection === 'my-tasks') return <MyTasksView />;
    if (state.activeSection === 'rd') return <MyTasksView />;
    if (state.activeSection === 'marketing' || state.activeSection === 'promotion' || state.activeSection === 'social' || state.activeSection === 'design' || state.activeSection === 'bizdev') {
      const mktProject = state.activeProjectId ? state.projects?.find((p: any) => p.id === state.activeProjectId) : null;
      const hasMktProject = mktProject && mktProject.category !== null;
      if (!hasMktProject) return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 12, color: 'var(--on-surface-variant)' }}>
          <span className="material-symbols-outlined" style={{ fontSize: 48, color: 'var(--outline-variant)' }}>campaign</span>
          <p style={{ fontSize: 15, fontWeight: 600 }}>בחר פרויקט שיווקי מהסרגל הצדדי</p>
          <p style={{ fontSize: 13 }}>כל משימה מקושרת לפרויקט — עצמאי או מקושר לאירוע</p>
        </div>
      );
      switch (state.activeView) {
        case 'kanban': return <KanbanView />;
        case 'roadmap': return <RoadmapView />;
        case 'calendar': return <CalendarView />;
        default: return <TableView />;
      }
    }
    if (state.activeSection === 'crm') {
      return state.activeCRMView === 'deals' ? <DealsView /> : <ContactsView />;
    }
    if (state.activeSection === 'automations') return <AutomationsPanel />;
    if (state.activeSection === 'users') return <UsersView />;
    if (state.activeSection === 'speakers') return <SpeakersView />;
    // 'events' section — show EventsView when no project selected, or board view when project is active
    if (state.activeSection === 'events') {
      if (!state.activeProjectId) return <EventsView />;
      switch (state.activeView) {
        case 'kanban': return <KanbanView />;
        case 'roadmap': return <RoadmapView />;
        case 'calendar': return <CalendarView />;
        default: return <TableView />;
      }
    }
    // fallback
    switch (state.activeView) {
      case 'kanban': return <KanbanView />;
      case 'roadmap': return <RoadmapView />;
      case 'calendar': return <CalendarView />;
      default: return <TableView />;
    }
  };

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-area">
        <TopBar />
        <div className="content-area">
          {renderMainContent()}
        </div>
      </div>
      {state.aiPanelOpen && <AIAgentPanel />}
      {state.notificationsPanelOpen && <NotificationsPanel />}
      {state.chatPanelOpen && <ChatPanel />}
      {state.welcomeTaskId && <WelcomeModal />}
      {state.celebrationTaskId && <CelebrationOverlay />}
      {state.taskModalId && <TaskModal />}
      {state.newProjectModalOpen && <NewProjectModal />}
      {state.newEventModalOpen && <NewEventModal />}
      {state.inviteModalOpen && <InviteModal />}
      {!state.onboardingComplete && <OnboardingModal />}
      {state.onboardingComplete && state.appLocked && <PasswordGate />}
      {state.profileModalOpen && <ProfileModal />}
      {state.speakerModalId && <SpeakerModal />}
    </div>
  );
}

export default function Home() {
  return (
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  );
}
