import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Settings, Globe, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import { useAppointments } from '@/hooks/useAppointments';
import { useDoctorClients } from '@/hooks/useDoctorClients';
import { useDoctorData } from '@/hooks/useDoctorData';
import { DoctorSidebar } from '@/components/doctor/DoctorSidebar';
import { OverviewSection } from '@/components/doctor/sections/OverviewSection';
import { ClientsSection } from '@/components/doctor/sections/ClientsSection';
import { AppointmentsSection } from '@/components/doctor/sections/AppointmentsSection';
import { ExercisesSection } from '@/components/doctor/sections/ExercisesSection';
import { DietPlansSection } from '@/components/doctor/sections/DietPlansSection';
import { VideosSection } from '@/components/doctor/sections/VideosSection';
import { NotesSection } from '@/components/doctor/sections/NotesSection';
import { ProgramsSection } from '@/components/doctor/sections/ProgramsSection';
import { ScheduleSection } from '@/components/doctor/sections/ScheduleSection';
import { ChatSection } from '@/components/doctor/sections/ChatSection';
import { ArticlesSection } from '@/components/doctor/sections/ArticlesSection';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { cn } from '@/lib/utils';

const DoctorDashboard = () => {
  const { isRTL, toggleLanguage } = useLanguage();
  const { user, profile, role, status, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const { 
    schedules, 
    appointments, 
    loading: appointmentsLoading,
    addSchedule, 
    updateSchedule, 
    deleteSchedule,
    confirmAppointment,
    cancelAppointment,
    rejectAppointment,
    completeAppointment,
    getDayName 
  } = useAppointments(user?.id, 'doctor');

  const { clients, loading: clientsLoading } = useDoctorClients(user?.id);
  
  const {
    exercises,
    dietPlans,
    videos,
    programs,
    notes,
    muscles,
    equipment,
    loading: dataLoading,
    addExercise,
    updateExercise,
    deleteExercise,
    addDietPlan,
    updateDietPlan,
    deleteDietPlan,
    addVideo,
    deleteVideo,
    addProgram,
    updateProgram,
    deleteProgram,
    addNote,
    updateNote,
    deleteNote,
    addMuscle,
    updateMuscle,
    deleteMuscle,
    addEquipment,
    updateEquipment,
    deleteEquipment
  } = useDoctorData(user?.id);

  useEffect(() => {
    if (!loading) {
      if (!user || role !== 'doctor') {
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

  if (loading || appointmentsLoading || clientsLoading || dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const todayAppointments = appointments.filter(a => 
    a.appointment_date === new Date().toISOString().split('T')[0] && a.status !== 'cancelled'
  );

  const renderSection = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <OverviewSection
            doctorName={profile?.full_name || ''}
            clientsCount={clients.length}
            programsCount={programs.filter(p => p.status === 'active').length}
            videosCount={videos.length}
            todayAppointmentsCount={todayAppointments.length}
            pendingAppointmentsCount={appointments.filter(a => a.status === 'pending').length}
            messagesCount={0}
            onSectionChange={setActiveSection}
          />
        );
      case 'clients':
        return (
          <ClientsSection 
            clients={clients}
            exercises={exercises}
            videos={videos}
            dietPlans={dietPlans}
            doctorId={user?.id || ''}
            onAddDietPlan={addDietPlan}
          />
        );
      case 'appointments':
        return (
          <AppointmentsSection
            appointments={appointments}
            clients={clients}
            onConfirm={confirmAppointment}
            onCancel={cancelAppointment}
            onReject={rejectAppointment}
            onComplete={completeAppointment}
          />
        );
      case 'programs':
        return (
          <ProgramsSection
            programs={programs}
            clients={clients}
            doctorId={user?.id || ''}
            onAdd={addProgram}
            onUpdate={updateProgram}
            onDelete={deleteProgram}
          />
        );
      case 'videos':
        return (
          <VideosSection
            videos={videos}
            doctorId={user?.id || ''}
            onAdd={addVideo}
            onDelete={deleteVideo}
          />
        );
      case 'exercises':
        return (
          <ExercisesSection
            exercises={exercises}
            muscles={muscles}
            equipment={equipment}
            doctorId={user?.id || ''}
            onAddExercise={addExercise}
            onUpdateExercise={updateExercise}
            onDeleteExercise={deleteExercise}
            onAddMuscle={addMuscle}
            onUpdateMuscle={updateMuscle}
            onDeleteMuscle={deleteMuscle}
            onAddEquipment={addEquipment}
            onUpdateEquipment={updateEquipment}
            onDeleteEquipment={deleteEquipment}
          />
        );
      case 'diets':
        return (
          <DietPlansSection
            dietPlans={dietPlans}
            doctorId={user?.id || ''}
            onAdd={addDietPlan}
            onUpdate={updateDietPlan}
            onDelete={deleteDietPlan}
          />
        );
      case 'notes':
        return (
          <NotesSection
            notes={notes}
            clients={clients}
            doctorId={user?.id || ''}
            onAdd={addNote}
            onUpdate={updateNote}
            onDelete={deleteNote}
          />
        );
      case 'schedule':
        return (
          <ScheduleSection
            doctorId={user?.id || ''}
            schedules={schedules}
            onAdd={addSchedule}
            onUpdate={updateSchedule}
            onDelete={deleteSchedule}
            getDayName={getDayName}
          />
        );
      case 'conversations':
        return (
          <ChatSection 
            isRTL={isRTL}
            doctorId={user?.id || ''}
          />
        );
      case 'articles':
        return <ArticlesSection doctorId={user?.id || ''} />;
      default:
        return null;
    }
  };

  return (
    <div className={`min-h-screen bg-background ${isRTL ? 'rtl' : 'ltr'}`}>
      <DoctorSidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        userEmail={user?.email}
        doctorName={profile?.full_name}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className={cn(
        "transition-all duration-300 min-h-screen",
        // Desktop: offset by sidebar width
        isRTL ? "lg:mr-64 lg:ml-0" : "lg:ml-64 lg:mr-0"
      )}>
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
                <Settings className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-9 w-9" onClick={handleSignOut}>
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-6">
          {renderSection()}
        </main>
      </div>
    </div>
  );
};

export default DoctorDashboard;
