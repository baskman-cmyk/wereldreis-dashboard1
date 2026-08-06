import React, { useState, useEffect, useRef } from "react";
import { PackingItem, TabType, TripDataState } from "./types";
import { loadTripData, saveTripData } from "./utils/storage";

// Components
import { Navbar } from "./components/Navbar";
import { Sidebar } from "./components/Sidebar";
import { MobileNav } from "./components/MobileNav";
import { GlobalSearchModal } from "./components/GlobalSearchModal";
import { AiReisassistentModal } from "./components/AiReisassistentModal";
import { ExportSyncModal } from "./components/ExportSyncModal";
import { ImportCenterModal } from "./components/ImportCenterModal";
import { AppErrorBoundary } from "./components/AppErrorBoundary";

// Views
import { DashboardView } from "./components/DashboardView";
import { TodayView } from "./components/TodayView";
import { TimelineView } from "./components/TimelineView";
import { ReisplanningView } from "./components/ReisplanningView";
import { NavigatieView } from "./components/NavigatieView";
import { VluchtenView } from "./components/VluchtenView";
import { AccommodatiesView } from "./components/AccommodatiesView";
import { CamperView } from "./components/CamperView";
import { BudgetView } from "./components/BudgetView";
import { DocumentenView } from "./components/DocumentenView";
import { GezondheidView } from "./components/GezondheidView";
import { PaklijstView } from "./components/PaklijstView";
import { FotosView } from "./components/FotosView";
import { DagboekView } from "./components/DagboekView";
import { KaartenView } from "./components/KaartenView";
import { ActiviteitenView } from "./components/ActiviteitenView";
import { ChecklistView } from "./components/ChecklistView";
import { MeldingenView } from "./components/MeldingenView";
import { WeerView } from "./components/WeerView";
import { ValutaView } from "./components/ValutaView";
import { NoodView } from "./components/NoodView";
import { StatistiekenView } from "./components/StatistiekenView";
import { MoreView } from "./components/MoreView";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export function App() {
  const [data, setData] = useState<TripDataState>(() => loadTripData());
  const [activeTab, setActiveTab] = useState<TabType>("today");
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("wereldreis-theme") === "dark");
  const mainRef = useRef<HTMLElement>(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(() => window.matchMedia("(display-mode: standalone)").matches);
  const [updateRegistration, setUpdateRegistration] = useState<ServiceWorkerRegistration | null>(null);

  // Modals
  const [searchOpen, setSearchOpen] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);

  // Auto-save data changes to localStorage
  useEffect(() => {
    saveTripData(data);
  }, [data]);

  // Dark mode effect
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("wereldreis-theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  // Global keyboard shortcuts and escape handling
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isTyping = target?.tagName === "INPUT" || target?.tagName === "TEXTAREA" || target?.isContentEditable;

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen(true);
      }
      if (!isTyping && event.key === "/") {
        event.preventDefault();
        setSearchOpen(true);
      }
      if (event.key === "Escape") {
        setSearchOpen(false);
        setAssistantOpen(false);
        setExportOpen(false);
        setImportOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Move keyboard focus to the newly selected page.
  useEffect(() => {
    mainRef.current?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [activeTab]);

  // Online / Offline listener
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // PWA installation and update events.
  useEffect(() => {
    const handleInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    };
    const handleInstalled = () => {
      setInstallPrompt(null);
      setIsInstalled(true);
    };
    const handleUpdate = (event: Event) => {
      setUpdateRegistration((event as CustomEvent<ServiceWorkerRegistration>).detail);
    };

    window.addEventListener("beforeinstallprompt", handleInstallPrompt);
    window.addEventListener("appinstalled", handleInstalled);
    window.addEventListener("wereldreis-sw-update", handleUpdate);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleInstallPrompt);
      window.removeEventListener("appinstalled", handleInstalled);
      window.removeEventListener("wereldreis-sw-update", handleUpdate);
    };
  }, []);

  const handleInstallApp = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    if (choice.outcome === "accepted") setInstallPrompt(null);
  };

  const handleApplyUpdate = () => {
    updateRegistration?.waiting?.postMessage({ type: "SKIP_WAITING" });
  };

  const unreadNotifications = data.notifications.filter((n) => !n.read).length;

  // Handlers for state updates
  const handleUpdateWidgets = (widgetsConfig: any) => {
    setData((prev) => ({ ...prev, widgetsConfig }));
  };

  const handleUpdateTimelineDay = (updatedDay: any) => {
    setData((prev) => ({
      ...prev,
      timeline: prev.timeline.map((d) => (d.id === updatedDay.id ? updatedDay : d)),
    }));
  };

  const handleAddTimelineDay = (newDay: any) => {
    setData((prev) => ({
      ...prev,
      timeline: [...prev.timeline, newDay],
    }));
  };

  const handleAddLocation = (loc: any) => {
    setData((prev) => ({
      ...prev,
      savedLocations: [loc, ...prev.savedLocations],
    }));
  };

  const handleUpdateCamper = (camper: any) => {
    setData((prev) => ({ ...prev, camper }));
  };

  const handleAddExpense = (exp: any) => {
    setData((prev) => {
      const updatedExpenses = [exp, ...prev.budgetExpenses];
      const updatedBudgets = prev.categoryBudgets.map((cat) =>
        cat.category === exp.category
          ? { ...cat, spentEur: cat.spentEur + exp.amountEur }
          : cat
      );
      return {
        ...prev,
        budgetExpenses: updatedExpenses,
        categoryBudgets: updatedBudgets,
      };
    });
  };

  const handleAddDocument = (doc: any) => {
    setData((prev) => ({
      ...prev,
      documents: [doc, ...prev.documents],
    }));
  };

  const handleUpdateDocument = (doc: any) => {
    setData((prev) => ({
      ...prev,
      documents: prev.documents.map((item) => (item.id === doc.id ? doc : item)),
    }));
  };

  const handleUpdateAccommodation = (accommodation: any) => {
    setData((prev) => ({
      ...prev,
      accommodations: prev.accommodations.map((item) =>
        item.id === accommodation.id ? accommodation : item
      ),
    }));
  };

  const handleUpdateFlight = (flight: any) => {
    setData((prev) => ({
      ...prev,
      flights: prev.flights.map((item) => (item.id === flight.id ? flight : item)),
    }));
  };

  const handleUpdateActivity = (activity: any) => {
    setData((prev) => ({
      ...prev,
      activities: prev.activities.map((item) =>
        item.id === activity.id ? activity : item
      ),
    }));
  };

  const handleUpdateFamilyMember = (member: any) => {
    setData((prev) => ({
      ...prev,
      familyMembers: prev.familyMembers.map((m) =>
        m.id === member.id ? member : m
      ),
    }));
  };

  const handleUpdatePackingItemStatus = (id: string, status: PackingItem["status"]) => {
    setData((prev) => ({
      ...prev,
      packingItems: prev.packingItems.map((item) =>
        item.id === id ? { ...item, status } : item
      ),
    }));
  };

  const handleAddPackingItem = (item: any) => {
    setData((prev) => ({
      ...prev,
      packingItems: [item, ...prev.packingItems],
    }));
  };

  const handleAddPhoto = (photo: any) => {
    setData((prev) => ({
      ...prev,
      photos: [photo, ...prev.photos],
    }));
  };

  const handleAddJournal = (entry: any) => {
    setData((prev) => ({
      ...prev,
      journals: [entry, ...prev.journals],
    }));
  };

  const handleToggleCheckItem = (_groupId: string, itemId: string) => {
    setData((prev) => ({
      ...prev,
      checklists: prev.checklists.map((item) =>
        item.id === itemId ? { ...item, completed: !item.completed } : item
      ),
    }));
  };

  const handleMarkAllNotificationsRead = () => {
    setData((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) => ({ ...n, read: true })),
    }));
  };

  const handleToggleNotificationRead = (id: string) => {
    setData((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) =>
        n.id === id ? { ...n, read: !n.read } : n
      ),
    }));
  };

  return (
    <AppErrorBoundary>
    <div className="min-h-screen bg-[#FAF9F5] dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      <a href="#main-content" className="skip-link">Ga naar hoofdinhoud</a>

      {/* Top Navbar */}
      <Navbar
        overview={data.overview}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isDarkMode={darkMode}
        setIsDarkMode={setDarkMode}
        isOnline={!isOffline}
        unreadNotificationsCount={unreadNotifications}
        onOpenAssistant={() => setAssistantOpen(true)}
        onOpenExport={() => setExportOpen(true)}
        onOpenSearch={() => setSearchOpen(true)}
      />

      {isOffline && (
        <div role="status" className="border-b border-amber-300 bg-amber-50 px-4 py-2 text-center text-xs font-bold text-amber-900 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-200">
          Offline modus: je lokale reisgegevens blijven beschikbaar. Online AI, weer en live informatie kunnen tijdelijk niet werken.
        </div>
      )}

      {updateRegistration && (
        <div role="status" className="flex items-center justify-center gap-3 border-b border-cyan-300 bg-cyan-50 px-4 py-2 text-center text-xs font-bold text-cyan-950 dark:border-cyan-800 dark:bg-cyan-950/50 dark:text-cyan-100">
          <span>Er staat een nieuwe versie van de Wereldreis-app klaar.</span>
          <button type="button" onClick={handleApplyUpdate} className="rounded-lg bg-[#174A7E] px-3 py-1.5 text-white hover:bg-[#123d69]">
            Nu bijwerken
          </button>
        </div>
      )}

      {/* Main Layout Area */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 gap-6">
        {/* Desktop Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={(tab) => {
            if (tab === "assistant") {
              setAssistantOpen(true);
            } else {
              setActiveTab(tab);
            }
          }}
          unreadNotifications={unreadNotifications}
        />

        {/* Content View */}
        <main ref={mainRef} id="main-content" tabIndex={-1} className="flex-1 min-w-0 pb-24 outline-none lg:pb-6">
          {activeTab === "today" && (
            <TodayView data={data} setActiveTab={setActiveTab} />
          )}

          {activeTab === "dashboard" && (
            <DashboardView
              data={data}
              setActiveTab={setActiveTab}
              onUpdateWidgets={handleUpdateWidgets}
              onOpenAssistant={() => setAssistantOpen(true)}
            />
          )}

          {activeTab === "timeline" && (
            <TimelineView
              timeline={data.timeline}
              onAddDay={handleAddTimelineDay}
              onUpdateDay={handleUpdateTimelineDay}
            />
          )}

          {activeTab === "reisplanning" && (
            <ReisplanningView
              countries={data.countries}
              timeline={data.timeline}
              accommodations={data.accommodations}
              activities={data.activities}
              flights={data.flights}
              savedLocations={data.savedLocations}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === "navigatie" && (
            <NavigatieView
              locations={data.savedLocations}
              onAddLocation={handleAddLocation}
            />
          )}

          {activeTab === "vluchten" && (
            <VluchtenView flights={data.flights} onUpdateFlight={handleUpdateFlight} />
          )}

          {activeTab === "accommodaties" && (
            <AccommodatiesView accommodations={data.accommodations} onUpdateAccommodation={handleUpdateAccommodation} />
          )}

          {activeTab === "camper" && (
            <CamperView
              camper={data.camper}
              onUpdateCamper={handleUpdateCamper}
            />
          )}

          {activeTab === "budget" && (
            <BudgetView
              expenses={data.budgetExpenses}
              categoryBudgets={data.categoryBudgets}
              onAddExpense={handleAddExpense}
            />
          )}

          {activeTab === "documenten" && (
            <DocumentenView
              documents={data.documents}
              onAddDocument={handleAddDocument}
              onUpdateDocument={handleUpdateDocument}
            />
          )}

          {activeTab === "gezondheid" && (
            <GezondheidView
              familyMembers={data.familyMembers}
              onUpdateFamilyMember={handleUpdateFamilyMember}
            />
          )}

          {activeTab === "paklijst" && (
            <PaklijstView
              items={data.packingItems}
              onAddItem={handleAddPackingItem}
              onUpdateStatus={handleUpdatePackingItemStatus}
            />
          )}

          {activeTab === "fotos" && (
            <FotosView
              photos={data.photos}
              onAddPhoto={handleAddPhoto}
            />
          )}

          {activeTab === "dagboek" && (
            <DagboekView
              journals={data.journals}
              photos={data.photos}
              timeline={data.timeline}
              onAddJournal={handleAddJournal}
              onAddPhoto={handleAddPhoto}
            />
          )}

          {activeTab === "kaarten" && (
            <KaartenView
              hikes={data.hikes}
              timeline={data.timeline}
              countryPlans={data.countries}
              savedLocations={data.savedLocations}
              accommodations={data.accommodations}
              onNavigate={setActiveTab}
            />
          )}

          {activeTab === "activiteiten" && (
            <ActiviteitenView activities={data.activities} onUpdateActivity={handleUpdateActivity} />
          )}

          {activeTab === "checklist" && (
            <ChecklistView
              checklists={data.checklists}
              onToggleCheckItem={handleToggleCheckItem}
            />
          )}

          {activeTab === "meldingen" && (
            <MeldingenView
              notifications={data.notifications}
              onMarkAllRead={handleMarkAllNotificationsRead}
              onToggleRead={handleToggleNotificationRead}
            />
          )}

          {activeTab === "weer" && (
            <WeerView weatherData={data.weatherForecasts} />
          )}

          {activeTab === "valuta" && (
            <ValutaView currencies={data.overview.currencies} />
          )}

          {activeTab === "nood" && (
            <NoodView emergencyContacts={data.emergencies} />
          )}

          {activeTab === "statistieken" && (
            <StatistiekenView
              categoryBudgets={data.categoryBudgets}
              overview={data.overview}
            />
          )}

          {activeTab === "more" && (
            <MoreView
              data={data}
              setActiveTab={setActiveTab}
              onOpenAssistant={() => setAssistantOpen(true)}
              onOpenExport={() => setExportOpen(true)}
              onOpenImport={() => setImportOpen(true)}
              canInstall={Boolean(installPrompt)}
              isInstalled={isInstalled}
              onInstall={handleInstallApp}
            />
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <MobileNav
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (tab === "assistant") {
            setAssistantOpen(true);
          } else {
            setActiveTab(tab);
          }
        }}
        unreadNotifications={unreadNotifications}
      />

      {/* Global Search Modal */}
      <GlobalSearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        data={data}
        setActiveTab={setActiveTab}
      />

      {/* AI Reisassistent Modal */}
      <AiReisassistentModal
        isOpen={assistantOpen}
        onClose={() => setAssistantOpen(false)}
        data={data}
      />

      <ImportCenterModal
        isOpen={importOpen}
        onClose={() => setImportOpen(false)}
        data={data}
        onDataLoaded={(newData) => setData(newData)}
      />

      {/* Export & Sync Modal */}
      <ExportSyncModal
        isOpen={exportOpen}
        onClose={() => setExportOpen(false)}
        data={data}
        onDataLoaded={(newData) => setData(newData)}
      />
    </div>
    </AppErrorBoundary>
  );
}

export default App;
