import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Globe, User, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import { useAppointments } from '@/hooks/useAppointments';
import { useClientData } from '@/hooks/useClientData';
import { ClientSidebar } from '@/components/dashboard/ClientSidebar';
import { OverviewSection } from '@/components/dashboard/sections/OverviewSection';
import { HealthProfileSection } from '@/components/dashboard/sections/HealthProfileSection';
import { AppointmentsSection } from '@/components/dashboard/sections/AppointmentsSection';
import { PlaceholderSection } from '@/components/dashboard/sections/PlaceholderSection';
import { ExercisesSection } from '@/components/dashboard/sections/ExercisesSection';
import { NutritionSection } from '@/components/dashboard/sections/NutritionSection';
import { ChatSection } from '@/components/dashboard/sections/ChatSection';
import { VideosSection } from '@/components/dashboard/sections/VideosSection';
import { MedicalFollowupSection } from '@/components/dashboard/sections/MedicalFollowupSection';
import { ProgressSection } from '@/components/dashboard/sections/ProgressSection';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { cn } from '@/lib/utils';

const ClientDashboard = () => {
  const { isRTL, toggleLanguage } = useLanguage();
  const { user, profile, role, status, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const { 
    schedules, 
    appointments, 
    loading: dataLoading,
    createAppointment,
    cancelAppointment,
    getDayName 
  } = useAppointments(user?.id, 'client');

  const { assignedDoctor, loading: clientDataLoading } = useClientData(user?.id);

  useEffect(() => {
    if (!loading) {
      if (!user || role !== 'client') {
        navigate('/auth');
      } else if (status !== 'approved') {
        navigate('/pending-approval');
      }
    }
  }, [user, role, status, loading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (loading || dataLoading || clientDataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const upcomingCount = appointments.filter(a => a.status === 'confirmed' || a.status === 'pending').length;
  const completedCount = appointments.filter(a => a.status === 'completed').length;
  const users = profile ? [{ user_id: user?.id || '', full_name: profile.full_name }] : [];

  const renderSection = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <OverviewSection 
            isRTL={isRTL} 
            upcomingAppointments={upcomingCount}
            completedSessions={completedCount}
            doctorName={assignedDoctor?.full_name}
            onSectionChange={setActiveSection}
            userName={profile?.full_name || undefined}
            packageName={profile?.selected_package || undefined}
            subscriptionStatus={status === 'approved' ? 'active' : status || 'pending'}
            hasMedicalFollowup={profile?.medical_followup || false}
          />
        );
      case 'health-profile':
        return <HealthProfileSection isRTL={isRTL} />;
      case 'appointments':
        return (
          <AppointmentsSection
            isRTL={isRTL}
            clientId={user?.id || ''}
            schedules={schedules}
            appointments={appointments}
            users={users}
            onBook={createAppointment}
            onCancel={cancelAppointment}
            getDayName={getDayName}
          />
        );
      case 'program':
        return (
          <PlaceholderSection 
            isRTL={isRTL}
            title={isRTL ? 'برنامجي' : 'My Program'}
            description={isRTL ? 'سيتم عرض برنامجك العلاجي هنا بعد تخصيصه من قبل الطبيب' : 'Your treatment program will be displayed here after being customized by your doctor'}
          />
        );
      case 'exercises':
        return (
          <ExercisesSection 
            isRTL={isRTL}
            clientId={user?.id || ''}
          />
        );
      case 'diet':
        return (
          <NutritionSection 
            isRTL={isRTL}
            clientId={user?.id || ''}
            packageType={profile?.selected_package || 'basic'}
          />
        );
      case 'progress':
        return (
          <ProgressSection 
            isRTL={isRTL}
            clientId={user?.id || ''}
          />
        );
      case 'videos':
        return (
          <VideosSection 
            isRTL={isRTL}
            clientId={user?.id || ''}
          />
        );
      case 'medical-followup':
        return (
          <MedicalFollowupSection 
            isRTL={isRTL}
            clientId={user?.id || ''}
            hasMedicalFollowup={profile?.medical_followup || false}
          />
        );
      case 'chat':
        return (
          <ChatSection 
            isRTL={isRTL}
            clientId={user?.id || ''}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className={`min-h-screen bg-background ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Sidebar */}
      <ClientSidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        isRTL={isRTL}
        userName={profile?.full_name}
        userEmail={user?.email}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content */}
      <div className={cn(
        "transition-all duration-300 min-h-screen",
        // Desktop: offset by sidebar width
        "lg:mr-64 lg:ml-0",
        isRTL ? "lg:mr-64 lg:ml-0" : "lg:ml-64 lg:mr-0"
      )}>
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-card/80 backdrop-blur-xl border-b border-border">
          <div className="px-4 py-3 flex items-center justify-between">
            {/* Mobile menu button */}
            <button 
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-muted transition-colors"
            >
              <Menu className="h-6 w-6" />
            </button>

            <div className="flex items-center gap-2 sm:gap-4">
              <button onClick={toggleLanguage} className="p-2 rounded-lg hover:bg-muted transition-colors">
                <Globe className="h-5 w-5" />
              </button>
              <NotificationBell userId={user?.id} />
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <User className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-9 w-9" onClick={handleSignOut}>
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-6">
          {renderSection()}
        </main>
      </div>
    </div>
  );
};

export default ClientDashboard;
