import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Menu, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import { useAdminData } from '@/hooks/useAdminData';
import { useAdminExercisesData } from '@/hooks/useAdminExercisesData';
import { useAdminStats } from '@/hooks/useAdminStats';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { OverviewSection } from '@/components/admin/sections/OverviewSection';
import { PendingSection } from '@/components/admin/sections/PendingSection';
import { ClientsSection } from '@/components/admin/sections/ClientsSection';
import { AssignmentsSection } from '@/components/admin/sections/AssignmentsSection';
import { ExercisesSection } from '@/components/admin/sections/ExercisesSection';
import { DietPlansSection } from '@/components/admin/sections/DietPlansSection';
import { MealPlansSection } from '@/components/admin/sections/MealPlansSection';
import { ArticlesSection } from '@/components/admin/sections/ArticlesSection';
import { StoreSection } from '@/components/admin/sections/StoreSection';
import { PaymentsSection } from '@/components/admin/sections/PaymentsSection';
import { DiscountsSection } from '@/components/admin/sections/DiscountsSection';
import { VideosSection } from '@/components/admin/sections/VideosSection';
import { TransformationsSection } from '@/components/admin/sections/TransformationsSection';
import { ProgressTrackingSection } from '@/components/admin/sections/ProgressTrackingSection';
import { CategoriesSection } from '@/components/admin/sections/CategoriesSection';
import PromoBannersSection from '@/components/admin/sections/PromoBannersSection';
import { HealthProfilesSection } from '@/components/admin/sections/HealthProfilesSection';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { cn } from '@/lib/utils';
import logo from '@/assets/logo.png';

const AdminDashboard = () => {
  const { isRTL, toggleLanguage } = useLanguage();
  const { user, profile, role, loading, signOut, status } = useAuth();
  const navigate = useNavigate();
  const {
    doctors, clients, pendingUsers, approvedUsers, assignments,
    loading: dataLoading, updateUserStatus, assignClientToDoctor,
    transferClient, deleteAssignment
  } = useAdminData();
  
  const {
    exercises, dietPlans,
    loading: exercisesLoading,
    addExercise, updateExercise, deleteExercise,
    addDietPlan, updateDietPlan, deleteDietPlan,
    assignDietPlanToClients, assignExerciseToClients
  } = useAdminExercisesData();

  const {
    stats: salesStats,
    orders,
    payments,
    products,
    loading: statsLoading,
    updateOrderStatus,
    updatePaymentStatus,
    addProduct,
    updateProduct,
    deleteProduct
  } = useAdminStats();

  const [activeSection, setActiveSection] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Lock background scroll when mobile sidebar is open
  useEffect(() => {
    if (!sidebarOpen) {
      document.body.style.overflow = "";
      return;
    }

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previous;
    };
  }, [sidebarOpen]);

  // Authentication check disabled for testing
  //   if (!loading && (!user || role !== 'admin')) {
  //     navigate('/auth');
  //   }
  //   if (!loading && status !== 'approved' && role !== 'admin') {
  //     navigate('/pending-approval');
  //   }
  // }, [user, role, loading, status, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleApprove = async (userId: string) => {
    return updateUserStatus(userId, 'approved');
  };

  const handleReject = async (userId: string) => {
    return updateUserStatus(userId, 'rejected');
  };


  if (loading || dataLoading || exercisesLoading || statsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const activeDoctors = doctors.filter(d => d.status === 'approved');
  const activeClients = clients.filter(c => c.status === 'approved');

  const renderSection = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <OverviewSection
            pendingCount={pendingUsers.length}
            clientsCount={clients.length}
            doctorsCount={doctors.length}
            approvedCount={approvedUsers.length}
            activeClientsCount={activeClients.length}
            activeDoctorsCount={activeDoctors.length}
            onQuickAction={setActiveSection}
            stats={salesStats}
          />
        );
      case 'store':
        return (
          <StoreSection
            orders={orders}
            products={products}
            onUpdateOrderStatus={updateOrderStatus}
            onAddProduct={addProduct}
            onUpdateProduct={updateProduct}
            onDeleteProduct={deleteProduct}
          />
        );
      case 'payments':
        return (
          <PaymentsSection
            payments={payments}
            onUpdateStatus={updatePaymentStatus}
          />
        );
      case 'discounts':
        return <DiscountsSection />;
      case 'pending':
        return (
          <PendingSection
            pendingUsers={pendingUsers}
            onApprove={handleApprove}
            onReject={handleReject}
          />
        );
      case 'health-profiles':
        return <HealthProfilesSection />;
      case 'clients':
        return (
          <ClientsSection
            clients={clients}
            onApprove={(userId) => updateUserStatus(userId, 'approved')}
            onSuspend={(userId) => updateUserStatus(userId, 'suspended')}
          />
        );
      case 'assignments':
        return (
          <AssignmentsSection
            clients={clients}
            doctors={doctors}
            assignments={assignments}
            onAssign={assignClientToDoctor}
            onTransfer={transferClient}
            onDelete={deleteAssignment}
          />
        );
      case 'exercises':
        return (
          <ExercisesSection
            exercises={exercises}
            onAddExercise={addExercise}
            onUpdateExercise={updateExercise}
            onDeleteExercise={deleteExercise}
            onAssignToClients={assignExerciseToClients}
          />
        );
      case 'meal-plans':
        return <MealPlansSection />;
      case 'diets':
        return (
          <DietPlansSection
            dietPlans={dietPlans}
            onAdd={addDietPlan}
            onUpdate={updateDietPlan}
            onDelete={deleteDietPlan}
            onAssignToClients={assignDietPlanToClients}
          />
        );
      case 'videos':
        return <VideosSection />;
      case 'transformations':
        return <TransformationsSection />;
      case 'progress':
        return <ProgressTrackingSection />;
      case 'articles':
        return <ArticlesSection />;
      case 'categories':
        return <CategoriesSection />;
      case 'banners':
        return <PromoBannersSection isRTL={isRTL} />;
      default:
        return null;
    }
  };

  return (
    <div className={`min-h-screen min-h-[100dvh] bg-background overflow-x-hidden ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Sidebar */}
      <AdminSidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        userEmail={user?.email}
        adminName={profile?.full_name}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content - offset by sidebar on desktop */}
      <div
        className={cn(
          "min-h-screen min-h-[100dvh] overflow-x-hidden transition-all duration-300",
          // Desktop: offset by sidebar width (256px = w-64)
          isRTL ? "lg:mr-64" : "lg:ml-64"
        )}
      >
        {/* Header */}
        <header className="sticky top-0 z-30 bg-card/95 backdrop-blur-xl border-b border-border">
          <div className="px-3 sm:px-4 py-3 flex items-center justify-between gap-2">
            {/* Left side: Menu + Logo */}
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-shrink">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden flex-shrink-0 h-10 w-10"
                onClick={() => setSidebarOpen(true)}
                aria-label={isRTL ? 'فتح القائمة' : 'Open menu'}
              >
                <Menu className="h-5 w-5" />
              </Button>

              <div className="flex items-center gap-2 min-w-0">
                <img src={logo} alt="NutriRehab" className="h-8 w-8 object-contain flex-shrink-0" />
                <div className="min-w-0 hidden sm:block">
                  <span className="font-bold text-foreground text-sm truncate block">
                    {isRTL ? 'لوحة تحكم الأدمن' : 'Admin Dashboard'}
                  </span>
                </div>
              </div>
            </div>

            {/* Right side: Actions */}
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              <NotificationBell userId={user?.id} />

              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9"
                onClick={toggleLanguage}
                aria-label={isRTL ? 'تغيير اللغة' : 'Change language'}
              >
                <Globe className="h-4 w-4" />
              </Button>

              <Button
                variant="destructive"
                size="icon"
                className="h-9 w-9"
                onClick={handleSignOut}
                aria-label={isRTL ? 'خروج' : 'Logout'}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-3 sm:p-4 lg:p-6 overflow-x-hidden">
          {renderSection()}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
