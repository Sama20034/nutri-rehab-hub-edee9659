import { motion } from 'framer-motion';
import { 
  DollarSign, Users, ShoppingCart, Package, TrendingUp, 
  Target, Clock, CheckCircle, CreditCard, Pill, UserCheck,
  AlertTriangle, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';

interface SalesStats {
  totalSales: number;
  subscriptionRevenue: number;
  supplementsRevenue: number;
  pendingOrders: number;
  confirmedOrders: number;
  activeSubscriptions: number;
  dailyTarget: number;
  tenDayTarget: number;
  monthlyTarget: number;
  dailySales: number;
  tenDaySales: number;
  monthlySales: number;
}

interface OverviewSectionProps {
  pendingCount: number;
  clientsCount: number;
  doctorsCount: number;
  approvedCount: number;
  activeClientsCount: number;
  activeDoctorsCount: number;
  onQuickAction: (section: string) => void;
  stats?: SalesStats;
}

export const OverviewSection = ({
  pendingCount,
  clientsCount,
  doctorsCount,
  approvedCount,
  activeClientsCount,
  activeDoctorsCount,
  onQuickAction,
  stats
}: OverviewSectionProps) => {
  const { isRTL } = useLanguage();

  const defaultStats: SalesStats = {
    totalSales: 0,
    subscriptionRevenue: 0,
    supplementsRevenue: 0,
    pendingOrders: 0,
    confirmedOrders: 0,
    activeSubscriptions: 0,
    dailyTarget: 5000,
    tenDayTarget: 50000,
    monthlyTarget: 150000,
    dailySales: 0,
    tenDaySales: 0,
    monthlySales: 0
  };

  const salesStats = stats || defaultStats;

  // Revenue breakdown data for pie chart
  const revenueData = [
    { 
      name: isRTL ? 'الاشتراكات' : 'Subscriptions', 
      value: salesStats.subscriptionRevenue,
      color: 'hsl(var(--primary))'
    },
    { 
      name: isRTL ? 'المكملات' : 'Supplements', 
      value: salesStats.supplementsRevenue,
      color: 'hsl(var(--accent))'
    }
  ];

  // Target progress data
  const targetData = [
    {
      name: isRTL ? 'يومي' : 'Daily',
      current: salesStats.dailySales,
      target: salesStats.dailyTarget,
      progress: Math.min((salesStats.dailySales / salesStats.dailyTarget) * 100, 100)
    },
    {
      name: isRTL ? '10 أيام' : '10 Days',
      current: salesStats.tenDaySales,
      target: salesStats.tenDayTarget,
      progress: Math.min((salesStats.tenDaySales / salesStats.tenDayTarget) * 100, 100)
    },
    {
      name: isRTL ? 'شهري' : 'Monthly',
      current: salesStats.monthlySales,
      target: salesStats.monthlyTarget,
      progress: Math.min((salesStats.monthlySales / salesStats.monthlyTarget) * 100, 100)
    }
  ];

  const formatCurrency = (value: number) => {
    return `${value.toLocaleString()} ${isRTL ? 'ج.م' : 'EGP'}`;
  };

  const mainStats = [
    {
      icon: DollarSign,
      value: formatCurrency(salesStats.totalSales),
      label: isRTL ? 'إجمالي المبيعات' : 'Total Sales',
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      trend: '+12%',
      trendUp: true
    },
    {
      icon: CreditCard,
      value: salesStats.activeSubscriptions,
      label: isRTL ? 'الاشتراكات النشطة' : 'Active Subscriptions',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      section: 'payments'
    },
    {
      icon: Clock,
      value: salesStats.pendingOrders,
      label: isRTL ? 'الطلبات المعلقة' : 'Pending Orders',
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
      section: 'store'
    },
    {
      icon: Package,
      value: salesStats.confirmedOrders,
      label: isRTL ? 'الطلبات المؤكدة' : 'Confirmed Orders',
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      section: 'store'
    }
  ];

  const userStats = [
    {
      icon: Users,
      value: clientsCount,
      label: isRTL ? 'إجمالي العملاء' : 'Total Clients',
      color: 'text-accent',
      bgColor: 'bg-accent/10',
      section: 'clients'
    },
    {
      icon: UserCheck,
      value: doctorsCount,
      label: isRTL ? 'إجمالي الأطباء' : 'Total Doctors',
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      section: 'doctors'
    },
    {
      icon: AlertTriangle,
      value: pendingCount,
      label: isRTL ? 'طلبات الموافقة' : 'Pending Approvals',
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
      section: 'pending'
    },
    {
      icon: CheckCircle,
      value: approvedCount,
      label: isRTL ? 'المستخدمين المعتمدين' : 'Approved Users',
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      section: 'clients'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={isRTL ? 'text-right' : 'text-left'}>
        <h1 className="text-2xl font-bold mb-1">{isRTL ? 'لوحة التحكم الشاملة' : 'Comprehensive Dashboard'}</h1>
        <p className="text-muted-foreground text-sm">
          {isRTL ? 'إحصائيات المبيعات والاشتراكات والمستخدمين' : 'Sales, subscriptions, and users statistics'}
        </p>
      </div>

      {/* Main Sales Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {mainStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => stat.section && onQuickAction(stat.section)}
            >
              <Card className={`bg-card border-border hover:border-primary/30 hover:shadow-lg transition-all ${stat.section ? 'cursor-pointer hover:scale-[1.02]' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-2 rounded-xl ${stat.bgColor}`}>
                      <Icon className={`h-5 w-5 ${stat.color}`} />
                    </div>
                    {stat.trend && (
                      <div className={`flex items-center gap-1 text-xs font-medium ${stat.trendUp ? 'text-green-500' : 'text-red-500'}`}>
                        {stat.trendUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                        {stat.trend}
                      </div>
                    )}
                  </div>
                  <p className="text-xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Revenue Split & Targets */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Revenue Breakdown */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-card border-border h-full">
            <CardHeader className="pb-2">
              <CardTitle className={`text-lg flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <TrendingUp className="h-5 w-5 text-primary" />
                {isRTL ? 'تقسيم الإيرادات' : 'Revenue Breakdown'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={revenueData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {revenueData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => formatCurrency(value)}
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="text-center p-3 rounded-xl bg-primary/10">
                  <p className="text-sm text-muted-foreground">{isRTL ? 'الاشتراكات' : 'Subscriptions'}</p>
                  <p className="text-lg font-bold text-primary">{formatCurrency(salesStats.subscriptionRevenue)}</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-accent/10">
                  <p className="text-sm text-muted-foreground">{isRTL ? 'المكملات' : 'Supplements'}</p>
                  <p className="text-lg font-bold text-accent">{formatCurrency(salesStats.supplementsRevenue)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Sales Targets */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-card border-border h-full">
            <CardHeader className="pb-2">
              <CardTitle className={`text-lg flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <Target className="h-5 w-5 text-accent" />
                {isRTL ? 'الأهداف (Targets)' : 'Sales Targets'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {targetData.map((target, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{target.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {formatCurrency(target.current)} / {formatCurrency(target.target)}
                    </span>
                  </div>
                  <Progress 
                    value={target.progress} 
                    className="h-3"
                  />
                  <div className="flex items-center justify-between text-xs">
                    <span className={target.progress >= 100 ? 'text-green-500 font-medium' : 'text-muted-foreground'}>
                      {target.progress.toFixed(1)}%
                    </span>
                    {target.progress >= 100 && (
                      <span className="text-green-500 flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        {isRTL ? 'تم تحقيق الهدف!' : 'Target achieved!'}
                      </span>
                    )}
                  </div>
                </div>
              ))}

              {/* Target Bar Chart */}
              <div className="h-[120px] mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={targetData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip 
                      formatter={(value: number) => formatCurrency(value)}
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="current" name={isRTL ? 'المحقق' : 'Achieved'} fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="target" name={isRTL ? 'الهدف' : 'Target'} fill="hsl(var(--muted))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Users Stats */}
      <div>
        <h2 className={`text-lg font-semibold mb-4 ${isRTL ? 'text-right' : 'text-left'}`}>
          {isRTL ? 'إحصائيات المستخدمين' : 'User Statistics'}
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {userStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                onClick={() => onQuickAction(stat.section)}
              >
                <Card className="bg-card border-border hover:border-primary/30 hover:scale-[1.02] hover:shadow-lg transition-all cursor-pointer">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                      <Icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                    <div className={isRTL ? 'text-right flex-1' : 'text-left flex-1'}>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Pending Approvals */}
        {pendingCount > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7 }}
          >
            <Card 
              className="bg-yellow-500/5 border-yellow-500/20 hover:border-yellow-500/40 cursor-pointer transition-all"
              onClick={() => onQuickAction('pending')}
            >
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-yellow-500/10">
                    <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  </div>
                  <div>
                    <p className="font-medium">{isRTL ? 'طلبات الموافقة' : 'Pending Approvals'}</p>
                    <p className="text-sm text-muted-foreground">{pendingCount} {isRTL ? 'طلب' : 'request(s)'}</p>
                  </div>
                </div>
                <ArrowUpRight className="h-5 w-5 text-yellow-500" />
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Pending Orders */}
        {salesStats.pendingOrders > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8 }}
          >
            <Card 
              className="bg-orange-500/5 border-orange-500/20 hover:border-orange-500/40 cursor-pointer transition-all"
              onClick={() => onQuickAction('store')}
            >
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-orange-500/10">
                    <ShoppingCart className="h-5 w-5 text-orange-500" />
                  </div>
                  <div>
                    <p className="font-medium">{isRTL ? 'طلبات المتجر' : 'Store Orders'}</p>
                    <p className="text-sm text-muted-foreground">{salesStats.pendingOrders} {isRTL ? 'معلق' : 'pending'}</p>
                  </div>
                </div>
                <ArrowUpRight className="h-5 w-5 text-orange-500" />
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Store Management */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.9 }}
        >
          <Card 
            className="bg-primary/5 border-primary/20 hover:border-primary/40 cursor-pointer transition-all"
            onClick={() => onQuickAction('products')}
          >
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/10">
                  <Pill className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{isRTL ? 'إدارة المنتجات' : 'Manage Products'}</p>
                  <p className="text-sm text-muted-foreground">{isRTL ? 'المتجر والمكملات' : 'Store & Supplements'}</p>
                </div>
              </div>
              <ArrowUpRight className="h-5 w-5 text-primary" />
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};
