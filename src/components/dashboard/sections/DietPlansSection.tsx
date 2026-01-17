import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Utensils, Clock, Flame, CalendarDays, ChefHat, Leaf } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';

interface DietPlan {
  id: string;
  name: string;
  description: string | null;
  calories_min: number | null;
  calories_max: number | null;
  goal: string | null;
  duration_weeks: number | null;
  status: string | null;
}

interface ClientDietPlan {
  id: string;
  diet_plan_id: string;
  start_date: string | null;
  end_date: string | null;
  status: string | null;
  diet_plan: DietPlan | null;
}

interface DietPlansSectionProps {
  isRTL: boolean;
  clientId: string;
}

export const DietPlansSection = ({ isRTL, clientId }: DietPlansSectionProps) => {
  const [dietPlans, setDietPlans] = useState<ClientDietPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDietPlans();
  }, [clientId]);

  const fetchDietPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('client_diet_plans')
        .select(`
          id,
          diet_plan_id,
          start_date,
          end_date,
          status,
          diet_plan:diet_plans(
            id,
            name,
            description,
            calories_min,
            calories_max,
            goal,
            duration_weeks,
            status
          )
        `)
        .eq('client_id', clientId);

      if (error) throw error;

      if (data) {
        // Filter out entries where diet_plan is null (due to RLS restrictions)
        const validData = data.filter(d => d.diet_plan !== null);
        setDietPlans(validData as ClientDietPlan[]);
      }
    } catch (error) {
      console.error('Error fetching diet plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const parseMealsFromDescription = (description: string | null) => {
    if (!description) return [];
    
    // Try to extract meals from description format: "وجبة (وقت): محتوى - سعرات سعرة"
    const lines = description.split('\n').filter(line => line.includes(':'));
    const meals: { name: string; time: string; content: string; calories: string }[] = [];
    
    lines.forEach(line => {
      const match = line.match(/(.+?)\s*\((\d{1,2}:\d{2})\):\s*(.+?)\s*-\s*(\d+)/);
      if (match) {
        meals.push({
          name: match[1].trim(),
          time: match[2],
          content: match[3].trim(),
          calories: match[4]
        });
      }
    });
    
    return meals;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (dietPlans.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center min-h-[400px] text-center"
      >
        <div className="w-24 h-24 rounded-2xl bg-muted flex items-center justify-center mb-6">
          <Utensils className="h-12 w-12 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-bold mb-2">
          {isRTL ? 'نظامي الغذائي' : 'My Diet'}
        </h2>
        <p className="text-muted-foreground">
          {isRTL ? 'سيتم عرض خطتك الغذائية هنا' : 'Your diet plan will be displayed here'}
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className={`${isRTL ? 'text-right' : ''}`}>
        <h1 className="text-2xl font-bold">{isRTL ? 'نظامي الغذائي' : 'My Diet'}</h1>
        <p className="text-muted-foreground">
          {isRTL ? 'خطتك الغذائية المخصصة من الطبيب' : 'Your personalized diet plan from your doctor'}
        </p>
      </div>

      <div className="grid gap-6">
        {dietPlans.map((clientPlan, index) => {
          const plan = clientPlan.diet_plan;
          if (!plan) return null;
          
          const meals = parseMealsFromDescription(plan.description);
          
          return (
            <motion.div
              key={clientPlan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="overflow-hidden">
                <CardHeader className="bg-gradient-to-br from-primary/10 to-primary/5 border-b border-border">
                  <div className={`flex items-start justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                        <ChefHat className="h-6 w-6 text-primary" />
                      </div>
                      <div className={isRTL ? 'text-right' : ''}>
                        <CardTitle className="text-xl">{plan.name}</CardTitle>
                        <div className={`flex items-center gap-2 mt-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                          {plan.calories_min && plan.calories_max && (
                            <Badge variant="secondary" className="gap-1">
                              <Flame className="h-3 w-3" />
                              {plan.calories_min}-{plan.calories_max} {isRTL ? 'سعرة' : 'cal'}
                            </Badge>
                          )}
                          {plan.duration_weeks && (
                            <Badge variant="outline" className="gap-1">
                              <CalendarDays className="h-3 w-3" />
                              {plan.duration_weeks} {isRTL ? 'أسبوع' : 'weeks'}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <Badge 
                      variant={clientPlan.status === 'active' ? 'default' : 'secondary'}
                      className="capitalize"
                    >
                      {clientPlan.status === 'active' ? (isRTL ? 'نشط' : 'Active') : clientPlan.status}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="p-6">
                  {plan.goal && (
                    <div className={`flex items-center gap-2 mb-4 text-muted-foreground ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <Leaf className="h-4 w-4" />
                      <span>{isRTL ? 'الهدف:' : 'Goal:'} {plan.goal}</span>
                    </div>
                  )}

                  {meals.length > 0 ? (
                    <div className="space-y-4">
                      <h4 className={`font-semibold flex items-center gap-2 ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
                        <Utensils className="h-4 w-4" />
                        {isRTL ? 'الوجبات اليومية' : 'Daily Meals'}
                      </h4>
                      <div className="grid gap-3">
                        {meals.map((meal, idx) => (
                          <div 
                            key={idx}
                            className={`p-4 rounded-xl bg-muted/50 border border-border ${isRTL ? 'text-right' : ''}`}
                          >
                            <div className={`flex items-center justify-between mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                              <span className="font-medium">{meal.name}</span>
                              <div className={`flex items-center gap-3 text-sm text-muted-foreground ${isRTL ? 'flex-row-reverse' : ''}`}>
                                <span className={`flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                  <Clock className="h-3 w-3" />
                                  {meal.time}
                                </span>
                                <span className={`flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                  <Flame className="h-3 w-3" />
                                  {meal.calories} {isRTL ? 'سعرة' : 'cal'}
                                </span>
                              </div>
                            </div>
                            <p className="text-muted-foreground text-sm">{meal.content}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : plan.description && (
                    <div className={`text-muted-foreground ${isRTL ? 'text-right' : ''}`}>
                      <p className="whitespace-pre-line">{plan.description}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};