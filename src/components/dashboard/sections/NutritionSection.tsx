import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Utensils, Clock, Flame, ChefHat, Leaf, Play, Image, 
  Coffee, Sun, Moon, Apple, Check, ChevronRight, 
  BookOpen, Video, Calendar, Star, Timer, Users
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Recipe {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  meal_type: string | null;
  calories: number | null;
  protein_g: number | null;
  carbs_g: number | null;
  fat_g: number | null;
  prep_time_minutes: number | null;
  cook_time_minutes: number | null;
  ingredients: any;
  instructions: any;
  image_url: string | null;
  video_url: string | null;
  difficulty: string | null;
  tags: string[] | null;
  package_type: string | null;
}

interface DietPlan {
  id: string;
  name: string;
  description: string | null;
  calories_min: number | null;
  calories_max: number | null;
  goal: string | null;
  duration_weeks: number | null;
  status: string | null;
  attachments: any[] | null;
  video_urls: string[] | null;
}

interface ClientDietPlan {
  id: string;
  diet_plan_id: string;
  start_date: string | null;
  end_date: string | null;
  status: string | null;
  diet_plan: DietPlan | null;
}

interface MealPlan {
  id: string;
  name: string;
  description: string | null;
  package_type: string | null;
  day_number: number | null;
  breakfast: any;
  lunch: any;
  dinner: any;
  snacks: any[];
  total_calories: number | null;
}

interface NutritionSectionProps {
  isRTL: boolean;
  clientId: string;
  packageType?: string;
}

// Meal type icons and colors
const mealTypeConfig = {
  breakfast: { 
    icon: Coffee, 
    color: 'from-amber-500 to-orange-500',
    bgColor: 'bg-amber-500/10',
    label: { ar: 'الإفطار', en: 'Breakfast' },
    time: '7:00 - 9:00'
  },
  lunch: { 
    icon: Sun, 
    color: 'from-green-500 to-emerald-500',
    bgColor: 'bg-green-500/10',
    label: { ar: 'الغداء', en: 'Lunch' },
    time: '12:00 - 14:00'
  },
  dinner: { 
    icon: Moon, 
    color: 'from-purple-500 to-indigo-500',
    bgColor: 'bg-purple-500/10',
    label: { ar: 'العشاء', en: 'Dinner' },
    time: '18:00 - 20:00'
  },
  snack: { 
    icon: Apple, 
    color: 'from-pink-500 to-rose-500',
    bgColor: 'bg-pink-500/10',
    label: { ar: 'سناكس', en: 'Snacks' },
    time: '10:00, 16:00'
  }
};

const difficultyConfig = {
  easy: { label: { ar: 'سهل', en: 'Easy' }, color: 'bg-green-500' },
  medium: { label: { ar: 'متوسط', en: 'Medium' }, color: 'bg-yellow-500' },
  hard: { label: { ar: 'صعب', en: 'Hard' }, color: 'bg-red-500' }
};

export const NutritionSection = ({ isRTL, clientId, packageType = 'basic' }: NutritionSectionProps) => {
  const [activeTab, setActiveTab] = useState('daily');
  const [dietPlans, setDietPlans] = useState<ClientDietPlan[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(1);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [recipeFilter, setRecipeFilter] = useState('all');
  const { toast } = useToast();

  useEffect(() => {
    fetchAllData();
  }, [clientId, packageType]);

  const fetchAllData = async () => {
    try {
      const [dietRes, clientMealPlansRes, clientRecipesRes] = await Promise.all([
        // Fetch assigned diet plans
        supabase
          .from('client_diet_plans')
          .select(`
            id, diet_plan_id, start_date, end_date, status,
            diet_plan:diet_plans(id, name, description, calories_min, calories_max, goal, duration_weeks, status, attachments, video_urls)
          `)
          .eq('client_id', clientId),
        // Fetch assigned meal plans for this client
        supabase
          .from('client_meal_plans')
          .select(`
            id, meal_plan_id, start_date, end_date, status, notes,
            meal_plan:meal_plans(id, name, description, package_type, day_number, breakfast, lunch, dinner, snacks, total_calories)
          `)
          .eq('client_id', clientId)
          .eq('status', 'active'),
        // Fetch assigned recipes for this client
        supabase
          .from('client_recipes')
          .select(`
            id, recipe_id, day_of_week, meal_type, completed, notes,
            recipe:recipes(*)
          `)
          .eq('client_id', clientId)
      ]);

      if (dietRes.data) {
        const validData = dietRes.data.filter(d => d.diet_plan !== null);
        setDietPlans(validData as ClientDietPlan[]);
      }
      
      // Extract meal plans from client assignments
      if (clientMealPlansRes.data) {
        const assignedPlans = clientMealPlansRes.data
          .filter(cmp => cmp.meal_plan !== null)
          .map(cmp => cmp.meal_plan as MealPlan);
        setMealPlans(assignedPlans);
      }
      
      // Extract recipes from client assignments
      if (clientRecipesRes.data) {
        const assignedRecipes = clientRecipesRes.data
          .filter(cr => cr.recipe !== null)
          .map(cr => cr.recipe as Recipe);
        setRecipes(assignedRecipes);
      }
    } catch (error) {
      console.error('Error fetching nutrition data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRecipesByMealType = (mealType: string) => {
    return recipes.filter(r => r.meal_type === mealType || r.category === mealType);
  };

  const getVideoId = (url: string | null) => {
    if (!url) return null;
    const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|shorts\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    return match ? match[1] : null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Demo data for display when no real data exists
  const demoMeals = [
    {
      type: 'breakfast',
      title: isRTL ? 'شوفان بالفواكه والعسل' : 'Oatmeal with Fruits & Honey',
      calories: 350,
      time: '8:00',
      image: 'https://images.unsplash.com/photo-1517673400267-0251440c45dc?w=300'
    },
    {
      type: 'lunch',
      title: isRTL ? 'صدور دجاج مشوية مع الأرز' : 'Grilled Chicken with Rice',
      calories: 550,
      time: '13:00',
      image: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=300'
    },
    {
      type: 'dinner',
      title: isRTL ? 'سلطة سيزر مع الخبز المحمص' : 'Caesar Salad with Toast',
      calories: 400,
      time: '19:00',
      image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=300'
    },
    {
      type: 'snack',
      title: isRTL ? 'زبادي يوناني مع المكسرات' : 'Greek Yogurt with Nuts',
      calories: 200,
      time: '16:00',
      image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=300'
    }
  ];

  const demoRecipes: Recipe[] = [
    {
      id: '1',
      name: isRTL ? 'سموذي الموز والشوفان' : 'Banana Oat Smoothie',
      description: isRTL ? 'مشروب صحي ومغذي لبداية يومك' : 'Healthy and nutritious drink to start your day',
      category: 'breakfast',
      meal_type: 'breakfast',
      calories: 280,
      protein_g: 12,
      carbs_g: 45,
      fat_g: 8,
      prep_time_minutes: 5,
      cook_time_minutes: 0,
      ingredients: ['موز', 'شوفان', 'حليب لوز', 'عسل'],
      instructions: ['ضع جميع المكونات في الخلاط', 'اخلط حتى يصبح ناعماً', 'قدم فوراً'],
      image_url: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400',
      video_url: null,
      difficulty: 'easy',
      tags: ['صحي', 'سريع'],
      package_type: 'basic'
    },
    {
      id: '2',
      name: isRTL ? 'سلطة الكينوا' : 'Quinoa Salad',
      description: isRTL ? 'سلطة غنية بالبروتين والألياف' : 'Protein and fiber rich salad',
      category: 'lunch',
      meal_type: 'lunch',
      calories: 420,
      protein_g: 18,
      carbs_g: 52,
      fat_g: 14,
      prep_time_minutes: 15,
      cook_time_minutes: 20,
      ingredients: ['كينوا', 'خيار', 'طماطم', 'فلفل', 'زيت زيتون'],
      instructions: ['اطبخ الكينوا', 'قطع الخضار', 'اخلط الجميع', 'أضف التتبيلة'],
      image_url: 'https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?w=400',
      video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      difficulty: 'medium',
      tags: ['نباتي', 'صحي'],
      package_type: 'basic'
    },
    {
      id: '3',
      name: isRTL ? 'سمك السلمون المشوي' : 'Grilled Salmon',
      description: isRTL ? 'سمك طازج غني بالأوميغا 3' : 'Fresh fish rich in Omega 3',
      category: 'dinner',
      meal_type: 'dinner',
      calories: 380,
      protein_g: 35,
      carbs_g: 5,
      fat_g: 22,
      prep_time_minutes: 10,
      cook_time_minutes: 15,
      ingredients: ['سلمون', 'ليمون', 'أعشاب', 'زيت زيتون'],
      instructions: ['تبل السمك', 'سخن الشواية', 'اشوي 7 دقائق لكل جانب'],
      image_url: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400',
      video_url: null,
      difficulty: 'medium',
      tags: ['بروتين', 'أوميغا 3'],
      package_type: 'premium'
    }
  ];

  const displayRecipes = recipes.length > 0 ? recipes : demoRecipes;
  const filteredRecipes = recipeFilter === 'all' 
    ? displayRecipes 
    : displayRecipes.filter(r => r.meal_type === recipeFilter || r.category === recipeFilter);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className={`${isRTL ? 'text-right' : ''}`}>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ChefHat className="h-7 w-7 text-primary" />
          {isRTL ? 'التغذية' : 'Nutrition'}
        </h1>
        <p className="text-muted-foreground">
          {isRTL ? 'خططك الغذائية والوصفات الصحية' : 'Your diet plans and healthy recipes'}
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
          <TabsTrigger value="daily" className="gap-2">
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">{isRTL ? 'اليومي' : 'Daily'}</span>
          </TabsTrigger>
          <TabsTrigger value="plans" className="gap-2">
            <Leaf className="h-4 w-4" />
            <span className="hidden sm:inline">{isRTL ? 'الخطط' : 'Plans'}</span>
          </TabsTrigger>
          <TabsTrigger value="recipes" className="gap-2">
            <BookOpen className="h-4 w-4" />
            <span className="hidden sm:inline">{isRTL ? 'الوصفات' : 'Recipes'}</span>
          </TabsTrigger>
          <TabsTrigger value="videos" className="gap-2">
            <Video className="h-4 w-4" />
            <span className="hidden sm:inline">{isRTL ? 'الفيديوهات' : 'Videos'}</span>
          </TabsTrigger>
        </TabsList>

        {/* Daily Meals Tab */}
        <TabsContent value="daily" className="space-y-6 mt-6">
          {/* Day Selector */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {[1, 2, 3, 4, 5, 6, 7].map(day => (
              <Button
                key={day}
                variant={selectedDay === day ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedDay(day)}
                className="min-w-[60px]"
              >
                {isRTL ? `يوم ${day}` : `Day ${day}`}
              </Button>
            ))}
          </div>

          {(() => {
            const currentDayPlan = mealPlans.find(p => p.day_number === selectedDay);
            
            if (!currentDayPlan) {
              return (
                <Card className="p-8 text-center">
                  <Utensils className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    {isRTL ? 'لا يوجد نظام غذائي لهذا اليوم' : 'No meal plan for this day'}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {isRTL ? 'لم يتم تخصيص وجبات لهذا اليوم بعد. تواصل مع طبيبك.' : 'No meals assigned for this day yet. Contact your doctor.'}
                  </p>
                </Card>
              );
            }

            const getMealData = (mealJson: any) => {
              if (!mealJson) return null;
              if (typeof mealJson === 'string') {
                try { return JSON.parse(mealJson); } catch { return { name: mealJson }; }
              }
              return mealJson;
            };

            const meals = [
              { type: 'breakfast' as const, data: getMealData(currentDayPlan.breakfast) },
              { type: 'lunch' as const, data: getMealData(currentDayPlan.lunch) },
              { type: 'dinner' as const, data: getMealData(currentDayPlan.dinner) },
              ...(currentDayPlan.snacks || []).map((s: any, i: number) => ({ 
                type: 'snack' as const, 
                data: getMealData(s),
                key: `snack-${i}`
              }))
            ].filter(m => m.data);

            const totalCalories = currentDayPlan.total_calories || 0;

            return (
              <>
                {/* Daily Summary */}
                {totalCalories > 0 && (
                  <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className={`${isRTL ? 'text-right' : ''}`}>
                          <p className="text-sm text-muted-foreground">{isRTL ? 'إجمالي السعرات اليوم' : 'Total Calories Today'}</p>
                          <p className="text-3xl font-bold">{totalCalories.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">{isRTL ? 'سعرة' : 'cal'}</span></p>
                        </div>
                        <div className="p-3 rounded-xl bg-primary/20">
                          <Flame className="h-6 w-6 text-primary" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Meals Grid */}
                <div className="grid gap-4">
                  {meals.map((meal, index) => {
                    const config = mealTypeConfig[meal.type];
                    const Icon = config.icon;
                    const mealName = meal.data?.name || meal.data?.title || config.label[isRTL ? 'ar' : 'en'];
                    const mealDesc = meal.data?.description || meal.data?.items?.join('، ') || '';
                    const mealCalories = meal.data?.calories || meal.data?.cal || null;

                    return (
                      <motion.div
                        key={(meal as any).key || meal.type}
                        initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                          <div className={`flex ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <div className={`w-3 bg-gradient-to-b ${config.color}`} />
                            <div className={`flex-1 p-4 ${isRTL ? 'text-right' : ''}`}>
                              <div className={`flex items-start justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                                <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                  <div className={`p-2 rounded-lg ${config.bgColor}`}>
                                    <Icon className="h-5 w-5" />
                                  </div>
                                  <div>
                                    <Badge variant="secondary" className="mb-1 text-xs">
                                      {config.label[isRTL ? 'ar' : 'en']}
                                    </Badge>
                                    <h3 className="font-semibold">{mealName}</h3>
                                  </div>
                                </div>
                                {mealCalories && (
                                  <span className="flex items-center gap-1 text-sm text-muted-foreground">
                                    <Flame className="h-3.5 w-3.5" />
                                    {mealCalories} {isRTL ? 'سعرة' : 'cal'}
                                  </span>
                                )}
                              </div>
                              {mealDesc && (
                                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{mealDesc}</p>
                              )}
                              {meal.data?.time && (
                                <div className={`flex items-center gap-1 mt-2 text-xs text-muted-foreground ${isRTL ? 'flex-row-reverse' : ''}`}>
                                  <Clock className="h-3 w-3" />
                                  {meal.data.time}
                                </div>
                              )}
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              </>
            );
          })()}
        </TabsContent>

        {/* Diet Plans Tab */}
        <TabsContent value="plans" className="space-y-6 mt-6">
          {dietPlans.length > 0 ? (
            dietPlans.map((clientPlan, index) => {
              const plan = clientPlan.diet_plan;
              if (!plan) return null;
              
              return (
                <motion.div
                  key={clientPlan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="overflow-hidden">
                    <CardHeader className="bg-gradient-to-br from-primary/10 to-primary/5 border-b">
                      <div className={`flex items-start justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                            <ChefHat className="h-6 w-6 text-primary" />
                          </div>
                          <div className={isRTL ? 'text-right' : ''}>
                            <CardTitle>{plan.name}</CardTitle>
                            <div className={`flex items-center gap-2 mt-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                              {plan.calories_min && plan.calories_max && (
                                <Badge variant="secondary">
                                  <Flame className="h-3 w-3 mr-1" />
                                  {plan.calories_min}-{plan.calories_max} {isRTL ? 'سعرة' : 'cal'}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <Badge variant={clientPlan.status === 'active' ? 'default' : 'secondary'}>
                          {clientPlan.status === 'active' ? (isRTL ? 'نشط' : 'Active') : clientPlan.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                      {plan.goal && (
                        <p className={`text-muted-foreground ${isRTL ? 'text-right' : ''}`}>
                          <Leaf className="h-4 w-4 inline mr-2" />
                          {plan.goal}
                        </p>
                      )}
                      {plan.description && (
                        <p className={`text-muted-foreground whitespace-pre-line ${isRTL ? 'text-right' : ''}`}>
                          {plan.description}
                        </p>
                      )}

                      {/* Attachments (Images & Files) */}
                      {plan.attachments && Array.isArray(plan.attachments) && plan.attachments.length > 0 && (
                        <div className="space-y-3">
                          <h4 className={`font-semibold text-sm flex items-center gap-2 ${isRTL ? 'flex-row-reverse text-right' : ''}`}>
                            <Image className="h-4 w-4 text-primary" />
                            {isRTL ? 'المرفقات' : 'Attachments'}
                          </h4>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {plan.attachments.map((att: any, i: number) => {
                              const url = typeof att === 'string' ? att : att?.url || att?.file_url;
                              const name = typeof att === 'string' ? '' : att?.name || att?.file_name || '';
                              if (!url) return null;
                              
                              const isImage = /\.(jpg|jpeg|png|gif|webp|svg)($|\?)/i.test(url);
                              const isPdf = /\.pdf($|\?)/i.test(url);
                              
                              if (isImage) {
                                return (
                                  <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="block group">
                                    <div className="relative rounded-lg overflow-hidden border border-border hover:border-primary/50 transition-colors">
                                      <img src={url} alt={name || `${isRTL ? 'مرفق' : 'Attachment'} ${i + 1}`} className="w-full h-32 object-cover group-hover:scale-105 transition-transform" />
                                    </div>
                                    {name && <p className="text-xs text-muted-foreground mt-1 truncate">{name}</p>}
                                  </a>
                                );
                              }
                              
                              return (
                                <a
                                  key={i}
                                  href={url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/50 transition-colors"
                                >
                                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                    {isPdf ? <BookOpen className="h-5 w-5 text-primary" /> : <Image className="h-5 w-5 text-primary" />}
                                  </div>
                                  <span className="text-sm truncate">{name || (isPdf ? 'PDF' : (isRTL ? 'ملف' : 'File'))}</span>
                                </a>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Videos */}
                      {plan.video_urls && plan.video_urls.length > 0 && (
                        <div className="space-y-3">
                          <h4 className={`font-semibold text-sm flex items-center gap-2 ${isRTL ? 'flex-row-reverse text-right' : ''}`}>
                            <Play className="h-4 w-4 text-primary" />
                            {isRTL ? 'فيديوهات الشرح' : 'Explanation Videos'}
                          </h4>
                          <div className="grid gap-3 sm:grid-cols-2">
                            {plan.video_urls.map((videoUrl, i) => {
                              const videoId = getVideoId(videoUrl);
                              if (!videoId) return null;
                              return (
                                <div key={i} className="aspect-video rounded-lg overflow-hidden border border-border">
                                  <iframe
                                    src={`https://www.youtube.com/embed/${videoId}`}
                                    className="w-full h-full"
                                    allowFullScreen
                                    title={`${plan.name} - Video ${i + 1}`}
                                  />
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })
          ) : (
            <Card className="p-8 text-center">
              <Leaf className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {isRTL ? 'لا توجد خطط غذائية بعد' : 'No diet plans yet'}
              </h3>
              <p className="text-muted-foreground">
                {isRTL ? 'سيتم إضافة خطتك الغذائية من قبل الطبيب' : 'Your diet plan will be added by your doctor'}
              </p>
            </Card>
          )}
        </TabsContent>

        {/* Recipes Tab */}
        <TabsContent value="recipes" className="space-y-6 mt-6">
          {/* Category Filter */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {['all', 'breakfast', 'lunch', 'dinner', 'snack'].map(cat => (
              <Button
                key={cat}
                variant={recipeFilter === cat ? 'default' : 'outline'}
                size="sm"
                onClick={() => setRecipeFilter(cat)}
              >
                {cat === 'all' 
                  ? (isRTL ? 'الكل' : 'All')
                  : mealTypeConfig[cat as keyof typeof mealTypeConfig].label[isRTL ? 'ar' : 'en']
                }
              </Button>
            ))}
          </div>

          {/* Recipes Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredRecipes.map((recipe, index) => (
              <motion.div
                key={recipe.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <Dialog>
                  <DialogTrigger asChild>
                    <Card className="overflow-hidden cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1">
                      <div className="relative h-40">
                        <img 
                          src={recipe.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'} 
                          alt={recipe.name}
                          className="w-full h-full object-cover"
                        />
                        {recipe.video_url && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                            <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                              <Play className="h-5 w-5 text-primary ml-1" />
                            </div>
                          </div>
                        )}
                        {recipe.difficulty && (
                          <div className={`absolute top-2 ${isRTL ? 'left-2' : 'right-2'}`}>
                            <Badge className={difficultyConfig[recipe.difficulty as keyof typeof difficultyConfig]?.color || 'bg-gray-500'}>
                              {difficultyConfig[recipe.difficulty as keyof typeof difficultyConfig]?.label[isRTL ? 'ar' : 'en'] || recipe.difficulty}
                            </Badge>
                          </div>
                        )}
                      </div>
                      <CardContent className={`p-4 ${isRTL ? 'text-right' : ''}`}>
                        <h3 className="font-semibold mb-2 line-clamp-1">{recipe.name}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{recipe.description}</p>
                        <div className={`flex items-center justify-between text-xs text-muted-foreground ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <span className={`flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <Flame className="h-3 w-3" />
                            {recipe.calories} {isRTL ? 'سعرة' : 'cal'}
                          </span>
                          <span className={`flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <Timer className="h-3 w-3" />
                            {(recipe.prep_time_minutes || 0) + (recipe.cook_time_minutes || 0)} {isRTL ? 'دقيقة' : 'min'}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className={isRTL ? 'text-right' : ''}>{recipe.name}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      {/* Recipe Image/Video */}
                      {recipe.video_url ? (
                        <div className="aspect-video rounded-lg overflow-hidden">
                          <iframe
                            src={`https://www.youtube.com/embed/${getVideoId(recipe.video_url)}`}
                            className="w-full h-full"
                            allowFullScreen
                          />
                        </div>
                      ) : (
                        <img 
                          src={recipe.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600'} 
                          alt={recipe.name}
                          className="w-full h-48 object-cover rounded-lg"
                        />
                      )}
                      
                      {/* Nutrition Info */}
                      <div className="grid grid-cols-4 gap-2">
                        <div className="text-center p-3 rounded-lg bg-muted">
                          <Flame className="h-4 w-4 mx-auto mb-1 text-orange-500" />
                          <p className="text-lg font-bold">{recipe.calories}</p>
                          <p className="text-xs text-muted-foreground">{isRTL ? 'سعرة' : 'Calories'}</p>
                        </div>
                        <div className="text-center p-3 rounded-lg bg-muted">
                          <Users className="h-4 w-4 mx-auto mb-1 text-blue-500" />
                          <p className="text-lg font-bold">{recipe.protein_g}g</p>
                          <p className="text-xs text-muted-foreground">{isRTL ? 'بروتين' : 'Protein'}</p>
                        </div>
                        <div className="text-center p-3 rounded-lg bg-muted">
                          <Star className="h-4 w-4 mx-auto mb-1 text-yellow-500" />
                          <p className="text-lg font-bold">{recipe.carbs_g}g</p>
                          <p className="text-xs text-muted-foreground">{isRTL ? 'كربوهيدرات' : 'Carbs'}</p>
                        </div>
                        <div className="text-center p-3 rounded-lg bg-muted">
                          <Leaf className="h-4 w-4 mx-auto mb-1 text-green-500" />
                          <p className="text-lg font-bold">{recipe.fat_g}g</p>
                          <p className="text-xs text-muted-foreground">{isRTL ? 'دهون' : 'Fat'}</p>
                        </div>
                      </div>

                      {/* Ingredients */}
                      {recipe.ingredients && (
                        <div className={isRTL ? 'text-right' : ''}>
                          <h4 className="font-semibold mb-2">{isRTL ? 'المكونات' : 'Ingredients'}</h4>
                          <ul className="space-y-1">
                            {(Array.isArray(recipe.ingredients) ? recipe.ingredients : []).map((ing: string, i: number) => (
                              <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Check className="h-3 w-3 text-primary" />
                                {ing}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Instructions */}
                      {recipe.instructions && (
                        <div className={isRTL ? 'text-right' : ''}>
                          <h4 className="font-semibold mb-2">{isRTL ? 'طريقة التحضير' : 'Instructions'}</h4>
                          <ol className="space-y-2">
                            {(Array.isArray(recipe.instructions) ? recipe.instructions : []).map((step: string, i: number) => (
                              <li key={i} className="flex gap-3 text-sm">
                                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 text-xs">
                                  {i + 1}
                                </span>
                                <span className="text-muted-foreground">{step}</span>
                              </li>
                            ))}
                          </ol>
                        </div>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Videos Tab */}
        <TabsContent value="videos" className="space-y-6 mt-6">
          <div className="grid gap-4 sm:grid-cols-2">
            {displayRecipes.filter(r => r.video_url).length > 0 ? (
              displayRecipes.filter(r => r.video_url).map((recipe, index) => (
                <motion.div
                  key={recipe.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="overflow-hidden">
                    <div className="aspect-video">
                      <iframe
                        src={`https://www.youtube.com/embed/${getVideoId(recipe.video_url)}`}
                        className="w-full h-full"
                        allowFullScreen
                      />
                    </div>
                    <CardContent className={`p-4 ${isRTL ? 'text-right' : ''}`}>
                      <h3 className="font-semibold">{recipe.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{recipe.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            ) : (
              <Card className="col-span-2 p-8 text-center">
                <Video className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {isRTL ? 'لا توجد فيديوهات بعد' : 'No videos yet'}
                </h3>
                <p className="text-muted-foreground">
                  {isRTL ? 'سيتم إضافة فيديوهات تحضير الوصفات قريباً' : 'Recipe preparation videos will be added soon'}
                </p>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};
