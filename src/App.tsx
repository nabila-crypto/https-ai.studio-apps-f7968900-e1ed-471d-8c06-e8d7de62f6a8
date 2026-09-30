/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginForm } from './components/LoginForm';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { RealtimeNotification } from './components/RealtimeNotification';
import { DashboardView } from './views/DashboardView';
import { VesselsView } from './views/VesselsView';
import { PortsView } from './views/PortsView';
import { CrewView } from './views/CrewView';
import { VoyagesView } from './views/VoyagesView';
import { BookingsView } from './views/BookingsView';
import { ClearanceView } from './views/ClearanceView';
import { ReportsView } from './views/ReportsView';
import { DatabaseBridgeView } from './views/DatabaseBridgeView';
import {
  subscribeVessels,
  subscribePorts,
  subscribeCrew,
  subscribeVoyages,
  subscribeBookings,
  subscribeClearances,
  subscribeAuditLogs,
} from './services/maritimeService';
import {
  Vessel,
  Port,
  Crew,
  Voyage,
  Booking,
  Clearance,
  AuditLog,
} from './types/maritime';

function MainApp() {
  const { currentUser, loading } = useAuth();
  const [activeView, setActiveView] = useState<string>('dashboard');

  // Real-time Collections State
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [ports, setPorts] = useState<Port[]>([]);
  const [crew, setCrew] = useState<Crew[]>([]);
  const [voyages, setVoyages] = useState<Voyage[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [clearances, setClearances] = useState<Clearance[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [latestRemoteLog, setLatestRemoteLog] = useState<AuditLog | null>(null);

  // Quick Action Modal Triggers
  const [isCreateVesselOpen, setIsCreateVesselOpen] = useState(false);
  const [isCreateVoyageOpen, setIsCreateVoyageOpen] = useState(false);
  const [isCreateBookingOpen, setIsCreateBookingOpen] = useState(false);

  // Setup real-time listeners across all accounts
  useEffect(() => {
    if (!currentUser) return;

    const unsubVessels = subscribeVessels((data) => setVessels(data));
    const unsubPorts = subscribePorts((data) => setPorts(data));
    const unsubCrew = subscribeCrew((data) => setCrew(data));
    const unsubVoyages = subscribeVoyages((data) => setVoyages(data));
    const unsubBookings = subscribeBookings((data) => setBookings(data));
    const unsubClearances = subscribeClearances((data) => setClearances(data));
    const unsubLogs = subscribeAuditLogs((data) => {
      setAuditLogs(data);
      if (data.length > 0) {
        setLatestRemoteLog(data[0]);
      }
    });

    return () => {
      unsubVessels();
      unsubPorts();
      unsubCrew();
      unsubVoyages();
      unsubBookings();
      unsubClearances();
      unsubLogs();
    };
  }, [currentUser]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white space-y-4">
        <div className="w-12 h-12 border-4 border-sky-500/20 border-t-sky-400 rounded-full animate-spin" />
        <p className="text-sm font-medium text-slate-300">Menghubungkan ke Sistem MaritimX & Cloud Database...</p>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginForm />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-sky-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar activeView={activeView} setActiveView={setActiveView} />

      {/* Main Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar */}
        <Sidebar
          activeView={activeView}
          setActiveView={setActiveView}
          vesselsCount={vessels.length}
          portsCount={ports.length}
          crewCount={crew.length}
          voyagesCount={voyages.length}
          bookingsCount={bookings.length}
        />

        {/* Content View Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-h-[calc(100vh-4rem)]">
          <div className="max-w-7xl mx-auto">
            {activeView === 'dashboard' && (
              <DashboardView
                vessels={vessels}
                ports={ports}
                voyages={voyages}
                bookings={bookings}
                auditLogs={auditLogs}
                setActiveView={setActiveView}
                onOpenCreateVessel={() => {
                  setActiveView('vessels');
                  setIsCreateVesselOpen(true);
                }}
                onOpenCreateVoyage={() => {
                  setActiveView('voyages');
                  setIsCreateVoyageOpen(true);
                }}
                onOpenCreateBooking={() => {
                  setActiveView('bookings');
                  setIsCreateBookingOpen(true);
                }}
              />
            )}

            {activeView === 'vessels' && (
              <VesselsView vessels={vessels} />
            )}

            {activeView === 'ports' && (
              <PortsView ports={ports} />
            )}

            {activeView === 'crew' && (
              <CrewView crew={crew} vessels={vessels} />
            )}

            {activeView === 'voyages' && (
              <VoyagesView
                voyages={voyages}
                vessels={vessels}
                ports={ports}
                isCreateOpen={isCreateVoyageOpen}
                onCloseCreate={() => setIsCreateVoyageOpen(false)}
              />
            )}

            {activeView === 'bookings' && (
              <BookingsView
                bookings={bookings}
                voyages={voyages}
                isCreateOpen={isCreateBookingOpen}
                onCloseCreate={() => setIsCreateBookingOpen(false)}
              />
            )}

            {activeView === 'clearances' && (
              <ClearanceView clearances={clearances} voyages={voyages} />
            )}

            {activeView === 'reports' && (
              <ReportsView
                vessels={vessels}
                ports={ports}
                voyages={voyages}
                bookings={bookings}
                clearances={clearances}
              />
            )}

            {activeView === 'database_bridge' && (
              <DatabaseBridgeView
                vessels={vessels}
                ports={ports}
                voyages={voyages}
                bookings={bookings}
                clearances={clearances}
              />
            )}
          </div>
        </main>
      </div>

      {/* Floating Realtime Notification Toast */}
      <RealtimeNotification latestLog={latestRemoteLog} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
