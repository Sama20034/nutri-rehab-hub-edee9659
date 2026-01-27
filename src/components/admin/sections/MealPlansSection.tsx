import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Edit, Trash2, Calendar, Coffee, Sun, Moon, Apple, 
  Clock, Flame, ChefHat, Save, X, Search, Image, Video,
  ChevronLeft, ChevronRight, Users, Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
  created_by: string | null;
  created_at: string;
}

interface MealData {
  recipe_id?: string;
  title: string;
  calories: number;
  time: string;
  image_url?: string;
}

const mealTypeConfig = {
  breakfast: { 
    icon: Coffee, 
    color: 'from-amber-500 to-orange-500',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
    label: { ar: 'الإفطار', en: 'Breakfast' },
    defaultTime: '8:00'
  },
  lunch: { 
    icon: Sun, 
    color: 'from-green-500 to-emerald-500',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/30',
    label: { ar: 'الغداء', en: 'Lunch' },
    defaultTime: '13:00'
  },
  dinner: { 
    icon: Moon, 
    color: 'from-purple-500 to-indigo-500',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
    label: { ar: 'العشاء', en: 'Dinner' },
    defaultTime: '19:00'
  },
  snack: { 
    icon: Apple, 
    color: 'from-pink-500 to-rose-500',
    bgColor: 'bg-pink-500/10',
    borderColor: 'border-pink-500/30',
    label: { ar: 'سناكس', en: 'Snacks' },
    defaultTime: '16:00'
  }
};

const packageTypes = ['basic', 'premium', 'vip'];

export const MealPlansSection = () => {
  const { isRTL } = useLanguage();
  const { user } = useAuth();
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('plans');
  const [selectedDay, setSelectedDay] = useState(1);
  
  // Dialog states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<MealPlan | null>(null);
  const [isRecipeDialogOpen, setIsRecipeDialogOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);

  // Form data for meal plan
  const [planFormData, setPlanFormData] = useState({
    name: '',
    description: '',
    package_type: 'basic',
    day_number: 1,
    breakfast: { title: '', calories: 0, time: '8:00', image_url: '' } as MealData,
    lunch: { title: '', calories: 0, time: '13:00', image_url: '' } as MealData,
    dinner: { title: '', calories: 0, time: '19:00', image_url: '' } as MealData,
    snacks: [] as MealData[]
  });

  // Form data for recipe
  const [recipeFormData, setRecipeFormData] = useState({
    name: '',
    description: '',
    category: 'breakfast',
    meal_type: 'breakfast',
    calories: '',
    protein_g: '',
    carbs_g: '',
    fat_g: '',
    prep_time_minutes: '',
    cook_time_minutes: '',
    ingredients: '',
    instructions: '',
    image_url: '',
    video_url: '',
    difficulty: 'easy',
    package_type: 'basic'
  });

  const fetchData = useCallback(async () => {
    try {
      const [plansRes, recipesRes] = await Promise.all([
        supabase.from('meal_plans').select('*').order('day_number', { ascending: true }),
        supabase.from('recipes').select('*').order('created_at', { ascending: false })
      ]);

      if (plansRes.data) setMealPlans(plansRes.data);
      if (recipesRes.data) setRecipes(recipesRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const resetPlanForm = () => {
    setPlanFormData({
      name: '',
      description: '',
      package_type: 'basic',
      day_number: 1,
      breakfast: { title: '', calories: 0, time: '8:00', image_url: '' },
      lunch: { title: '', calories: 0, time: '13:00', image_url: '' },
      dinner: { title: '', calories: 0, time: '19:00', image_url: '' },
      snacks: []
    });
    setEditingPlan(null);
  };

  const resetRecipeForm = () => {
    setRecipeFormData({
      name: '',
      description: '',
      category: 'breakfast',
      meal_type: 'breakfast',
      calories: '',
      protein_g: '',
      carbs_g: '',
      fat_g: '',
      prep_time_minutes: '',
      cook_time_minutes: '',
      ingredients: '',
      instructions: '',
      image_url: '',
      video_url: '',
      difficulty: 'easy',
      package_type: 'basic'
    });
    setEditingRecipe(null);
  };

  const handleSubmitPlan = async () => {
    if (!planFormData.name) {
      toast.error(isRTL ? 'يرجى إدخال اسم الخطة' : 'Please enter plan name');
      return;
    }

    const totalCalories = 
      (planFormData.breakfast?.calories || 0) + 
      (planFormData.lunch?.calories || 0) + 
      (planFormData.dinner?.calories || 0) +
      planFormData.snacks.reduce((sum, s) => sum + (s.calories || 0), 0);

    // Convert MealData to JSON-compatible format
    const toJsonMeal = (meal: MealData) => ({
      recipe_id: meal.recipe_id || null,
      title: meal.title,
      calories: meal.calories,
      time: meal.time,
      image_url: meal.image_url || null
    });

    const planData = {
      name: planFormData.name,
      description: planFormData.description || null,
      package_type: planFormData.package_type,
      day_number: planFormData.day_number,
      breakfast: planFormData.breakfast.title ? toJsonMeal(planFormData.breakfast) : null,
      lunch: planFormData.lunch.title ? toJsonMeal(planFormData.lunch) : null,
      dinner: planFormData.dinner.title ? toJsonMeal(planFormData.dinner) : null,
      snacks: planFormData.snacks.filter(s => s.title).map(toJsonMeal),
      total_calories: totalCalories,
      created_by: user?.id || null
    };

    try {
      if (editingPlan) {
        const { error } = await supabase.from('meal_plans').update(planData).eq('id', editingPlan.id);
        if (error) throw error;
        toast.success(isRTL ? 'تم تحديث الخطة' : 'Plan updated');
      } else {
        const { error } = await supabase.from('meal_plans').insert(planData);
        if (error) throw error;
        toast.success(isRTL ? 'تم إضافة الخطة' : 'Plan added');
      }
      setIsDialogOpen(false);
      resetPlanForm();
      fetchData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleSubmitRecipe = async () => {
    if (!recipeFormData.name) {
      toast.error(isRTL ? 'يرجى إدخال اسم الوصفة' : 'Please enter recipe name');
      return;
    }

    const recipeData = {
      name: recipeFormData.name,
      description: recipeFormData.description || null,
      category: recipeFormData.category,
      meal_type: recipeFormData.meal_type,
      calories: recipeFormData.calories ? parseInt(recipeFormData.calories) : null,
      protein_g: recipeFormData.protein_g ? parseFloat(recipeFormData.protein_g) : null,
      carbs_g: recipeFormData.carbs_g ? parseFloat(recipeFormData.carbs_g) : null,
      fat_g: recipeFormData.fat_g ? parseFloat(recipeFormData.fat_g) : null,
      prep_time_minutes: recipeFormData.prep_time_minutes ? parseInt(recipeFormData.prep_time_minutes) : null,
      cook_time_minutes: recipeFormData.cook_time_minutes ? parseInt(recipeFormData.cook_time_minutes) : null,
      ingredients: recipeFormData.ingredients ? recipeFormData.ingredients.split('\n').filter(i => i.trim()) : null,
      instructions: recipeFormData.instructions ? recipeFormData.instructions.split('\n').filter(i => i.trim()) : null,
      image_url: recipeFormData.image_url || null,
      video_url: recipeFormData.video_url || null,
      difficulty: recipeFormData.difficulty,
      package_type: recipeFormData.package_type,
      created_by: user?.id || null
    };

    try {
      if (editingRecipe) {
        const { error } = await supabase.from('recipes').update(recipeData).eq('id', editingRecipe.id);
        if (error) throw error;
        toast.success(isRTL ? 'تم تحديث الوصفة' : 'Recipe updated');
      } else {
        const { error } = await supabase.from('recipes').insert(recipeData);
        if (error) throw error;
        toast.success(isRTL ? 'تم إضافة الوصفة' : 'Recipe added');
      }
      setIsRecipeDialogOpen(false);
      resetRecipeForm();
      fetchData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleEditPlan = (plan: MealPlan) => {
    setPlanFormData({
      name: plan.name,
      description: plan.description || '',
      package_type: plan.package_type || 'basic',
      day_number: plan.day_number || 1,
      breakfast: plan.breakfast || { title: '', calories: 0, time: '8:00', image_url: '' },
      lunch: plan.lunch || { title: '', calories: 0, time: '13:00', image_url: '' },
      dinner: plan.dinner || { title: '', calories: 0, time: '19:00', image_url: '' },
      snacks: plan.snacks || []
    });
    setEditingPlan(plan);
    setIsDialogOpen(true);
  };

  const handleEditRecipe = (recipe: Recipe) => {
    setRecipeFormData({
      name: recipe.name,
      description: recipe.description || '',
      category: recipe.category || 'breakfast',
      meal_type: recipe.meal_type || 'breakfast',
      calories: recipe.calories?.toString() || '',
      protein_g: recipe.protein_g?.toString() || '',
      carbs_g: recipe.carbs_g?.toString() || '',
      fat_g: recipe.fat_g?.toString() || '',
      prep_time_minutes: recipe.prep_time_minutes?.toString() || '',
      cook_time_minutes: recipe.cook_time_minutes?.toString() || '',
      ingredients: Array.isArray(recipe.ingredients) ? recipe.ingredients.join('\n') : '',
      instructions: Array.isArray(recipe.instructions) ? recipe.instructions.join('\n') : '',
      image_url: recipe.image_url || '',
      video_url: recipe.video_url || '',
      difficulty: recipe.difficulty || 'easy',
      package_type: recipe.package_type || 'basic'
    });
    setEditingRecipe(recipe);
    setIsRecipeDialogOpen(true);
  };

  const handleDeletePlan = async (id: string) => {
    try {
      const { error } = await supabase.from('meal_plans').delete().eq('id', id);
      if (error) throw error;
      toast.success(isRTL ? 'تم حذف الخطة' : 'Plan deleted');
      fetchData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDeleteRecipe = async (id: string) => {
    try {
      const { error } = await supabase.from('recipes').delete().eq('id', id);
      if (error) throw error;
      toast.success(isRTL ? 'تم حذف الوصفة' : 'Recipe deleted');
      fetchData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const getMealsByDay = (day: number) => {
    return mealPlans.filter(p => p.day_number === day);
  };

  const addSnack = () => {
    setPlanFormData({
      ...planFormData,
      snacks: [...planFormData.snacks, { title: '', calories: 0, time: '16:00', image_url: '' }]
    });
  };

  const updateSnack = (index: number, field: keyof MealData, value: string | number) => {
    const newSnacks = [...planFormData.snacks];
    newSnacks[index] = { ...newSnacks[index], [field]: value };
    setPlanFormData({ ...planFormData, snacks: newSnacks });
  };

  const removeSnack = (index: number) => {
    setPlanFormData({
      ...planFormData,
      snacks: planFormData.snacks.filter((_, i) => i !== index)
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ChefHat className="h-7 w-7 text-primary" />
            {isRTL ? 'خطط الوجبات والوصفات' : 'Meal Plans & Recipes'}
          </h1>
          <p className="text-muted-foreground">
            {isRTL ? 'إدارة الوجبات اليومية والوصفات الصحية' : 'Manage daily meals and healthy recipes'}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="plans" className="gap-2">
            <Calendar className="h-4 w-4" />
            {isRTL ? 'خطط الوجبات' : 'Meal Plans'}
          </TabsTrigger>
          <TabsTrigger value="recipes" className="gap-2">
            <ChefHat className="h-4 w-4" />
            {isRTL ? 'الوصفات' : 'Recipes'}
          </TabsTrigger>
        </TabsList>

        {/* Meal Plans Tab */}
        <TabsContent value="plans" className="space-y-6 mt-6">
          <div className="flex items-center justify-between">
            <Badge variant="secondary">{mealPlans.length} {isRTL ? 'خطة' : 'Plan(s)'}</Badge>
            <Button onClick={() => { resetPlanForm(); setIsDialogOpen(true); }}>
              <Plus className="h-4 w-4 mr-2" />
              {isRTL ? 'إضافة خطة جديدة' : 'Add New Plan'}
            </Button>
          </div>

          {/* Day Selector */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {[1, 2, 3, 4, 5, 6, 7].map(day => {
              const dayPlans = getMealsByDay(day);
              return (
                <Button
                  key={day}
                  variant={selectedDay === day ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedDay(day)}
                  className="min-w-[80px] relative"
                >
                  {isRTL ? `يوم ${day}` : `Day ${day}`}
                  {dayPlans.length > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                      {dayPlans.length}
                    </span>
                  )}
                </Button>
              );
            })}
          </div>

          {/* Daily Meals Display */}
          <div className="grid gap-4">
            {getMealsByDay(selectedDay).length === 0 ? (
              <Card className="p-12 text-center">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">
                  {isRTL ? `لا توجد وجبات لليوم ${selectedDay}` : `No meals for Day ${selectedDay}`}
                </p>
                <Button onClick={() => { resetPlanForm(); setPlanFormData(prev => ({ ...prev, day_number: selectedDay })); setIsDialogOpen(true); }}>
                  <Plus className="h-4 w-4 mr-2" />
                  {isRTL ? 'إضافة وجبات' : 'Add Meals'}
                </Button>
              </Card>
            ) : (
              getMealsByDay(selectedDay).map((plan) => (
                <Card key={plan.id} className="overflow-hidden">
                  <CardHeader className="bg-gradient-to-br from-primary/10 to-primary/5 border-b">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>{plan.name}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary">{plan.package_type}</Badge>
                          <Badge variant="outline">
                            <Flame className="h-3 w-3 mr-1" />
                            {plan.total_calories} {isRTL ? 'سعرة' : 'cal'}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEditPlan(plan)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeletePlan(plan.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                      {/* Breakfast */}
                      {plan.breakfast && (
                        <MealCard 
                          type="breakfast" 
                          meal={plan.breakfast} 
                          isRTL={isRTL} 
                        />
                      )}
                      {/* Lunch */}
                      {plan.lunch && (
                        <MealCard 
                          type="lunch" 
                          meal={plan.lunch} 
                          isRTL={isRTL} 
                        />
                      )}
                      {/* Dinner */}
                      {plan.dinner && (
                        <MealCard 
                          type="dinner" 
                          meal={plan.dinner} 
                          isRTL={isRTL} 
                        />
                      )}
                      {/* Snacks */}
                      {plan.snacks && plan.snacks.map((snack, i) => (
                        <MealCard 
                          key={i} 
                          type="snack" 
                          meal={snack} 
                          isRTL={isRTL} 
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Recipes Tab */}
        <TabsContent value="recipes" className="space-y-6 mt-6">
          <div className="flex items-center justify-between">
            <Badge variant="secondary">{recipes.length} {isRTL ? 'وصفة' : 'Recipe(s)'}</Badge>
            <Button onClick={() => { resetRecipeForm(); setIsRecipeDialogOpen(true); }}>
              <Plus className="h-4 w-4 mr-2" />
              {isRTL ? 'إضافة وصفة جديدة' : 'Add New Recipe'}
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {recipes.map((recipe) => {
              const config = mealTypeConfig[recipe.category as keyof typeof mealTypeConfig] || mealTypeConfig.breakfast;
              const Icon = config.icon;
              
              return (
                <motion.div
                  key={recipe.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className={`overflow-hidden hover:shadow-lg transition-shadow ${config.borderColor} border-2`}>
                    {recipe.image_url && (
                      <div className="relative h-40">
                        <img 
                          src={recipe.image_url} 
                          alt={recipe.name}
                          className="w-full h-full object-cover"
                        />
                        <div className={`absolute inset-0 bg-gradient-to-t ${config.color} opacity-20`} />
                      </div>
                    )}
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className={`p-2 rounded-lg ${config.bgColor}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditRecipe(recipe)}>
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDeleteRecipe(recipe.id)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <h3 className="font-semibold mb-1">{recipe.name}</h3>
                      {recipe.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{recipe.description}</p>
                      )}
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        {recipe.calories && (
                          <span className="flex items-center gap-1">
                            <Flame className="h-3 w-3" />
                            {recipe.calories}
                          </span>
                        )}
                        {recipe.prep_time_minutes && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {recipe.prep_time_minutes}m
                          </span>
                        )}
                        <Badge variant="outline" className="text-xs">{recipe.package_type}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {recipes.length === 0 && (
            <Card className="p-12 text-center">
              <ChefHat className="h-12 w-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">
                {isRTL ? 'لا توجد وصفات' : 'No recipes found'}
              </p>
              <Button onClick={() => { resetRecipeForm(); setIsRecipeDialogOpen(true); }}>
                <Plus className="h-4 w-4 mr-2" />
                {isRTL ? 'إضافة وصفة' : 'Add Recipe'}
              </Button>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Meal Plan Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetPlanForm(); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPlan ? (isRTL ? 'تعديل خطة الوجبات' : 'Edit Meal Plan') : (isRTL ? 'إضافة خطة وجبات جديدة' : 'Add New Meal Plan')}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 mt-4">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label>{isRTL ? 'اسم الخطة' : 'Plan Name'}</Label>
                <Input
                  value={planFormData.name}
                  onChange={(e) => setPlanFormData({ ...planFormData, name: e.target.value })}
                  placeholder={isRTL ? 'مثال: خطة اليوم الأول' : 'e.g., Day 1 Plan'}
                />
              </div>
              <div>
                <Label>{isRTL ? 'رقم اليوم' : 'Day Number'}</Label>
                <Select 
                  value={planFormData.day_number.toString()} 
                  onValueChange={(v) => setPlanFormData({ ...planFormData, day_number: parseInt(v) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7].map(d => (
                      <SelectItem key={d} value={d.toString()}>
                        {isRTL ? `يوم ${d}` : `Day ${d}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{isRTL ? 'نوع الباقة' : 'Package Type'}</Label>
                <Select 
                  value={planFormData.package_type} 
                  onValueChange={(v) => setPlanFormData({ ...planFormData, package_type: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {packageTypes.map(p => (
                      <SelectItem key={p} value={p}>{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Meals Section */}
            <div className="space-y-4">
              <h3 className="font-semibold">{isRTL ? 'الوجبات' : 'Meals'}</h3>
              
              {/* Breakfast */}
              <MealInputCard
                type="breakfast"
                meal={planFormData.breakfast}
                onChange={(meal) => setPlanFormData({ ...planFormData, breakfast: meal })}
                isRTL={isRTL}
              />

              {/* Lunch */}
              <MealInputCard
                type="lunch"
                meal={planFormData.lunch}
                onChange={(meal) => setPlanFormData({ ...planFormData, lunch: meal })}
                isRTL={isRTL}
              />

              {/* Dinner */}
              <MealInputCard
                type="dinner"
                meal={planFormData.dinner}
                onChange={(meal) => setPlanFormData({ ...planFormData, dinner: meal })}
                isRTL={isRTL}
              />

              {/* Snacks */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    <Apple className="h-4 w-4" />
                    {isRTL ? 'السناكس' : 'Snacks'}
                  </Label>
                  <Button variant="outline" size="sm" onClick={addSnack}>
                    <Plus className="h-3 w-3 mr-1" />
                    {isRTL ? 'إضافة سناك' : 'Add Snack'}
                  </Button>
                </div>
                {planFormData.snacks.map((snack, index) => (
                  <div key={index} className="flex gap-2 items-start">
                    <div className="flex-1 grid grid-cols-3 gap-2">
                      <Input
                        placeholder={isRTL ? 'الاسم' : 'Name'}
                        value={snack.title}
                        onChange={(e) => updateSnack(index, 'title', e.target.value)}
                      />
                      <Input
                        type="number"
                        placeholder={isRTL ? 'السعرات' : 'Calories'}
                        value={snack.calories || ''}
                        onChange={(e) => updateSnack(index, 'calories', parseInt(e.target.value) || 0)}
                      />
                      <Input
                        type="time"
                        value={snack.time}
                        onChange={(e) => updateSnack(index, 'time', e.target.value)}
                      />
                    </div>
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => removeSnack(index)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label>{isRTL ? 'الوصف' : 'Description'}</Label>
              <Textarea
                value={planFormData.description}
                onChange={(e) => setPlanFormData({ ...planFormData, description: e.target.value })}
                placeholder={isRTL ? 'وصف الخطة...' : 'Plan description...'}
              />
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              {isRTL ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button onClick={handleSubmitPlan}>
              <Save className="h-4 w-4 mr-2" />
              {editingPlan ? (isRTL ? 'تحديث' : 'Update') : (isRTL ? 'حفظ' : 'Save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Recipe Dialog */}
      <Dialog open={isRecipeDialogOpen} onOpenChange={(open) => { setIsRecipeDialogOpen(open); if (!open) resetRecipeForm(); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingRecipe ? (isRTL ? 'تعديل الوصفة' : 'Edit Recipe') : (isRTL ? 'إضافة وصفة جديدة' : 'Add New Recipe')}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label>{isRTL ? 'اسم الوصفة' : 'Recipe Name'}</Label>
                <Input
                  value={recipeFormData.name}
                  onChange={(e) => setRecipeFormData({ ...recipeFormData, name: e.target.value })}
                  placeholder={isRTL ? 'مثال: شوفان بالفواكه' : 'e.g., Oatmeal with Fruits'}
                />
              </div>
              <div>
                <Label>{isRTL ? 'نوع الوجبة' : 'Meal Type'}</Label>
                <Select 
                  value={recipeFormData.category} 
                  onValueChange={(v) => setRecipeFormData({ ...recipeFormData, category: v, meal_type: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="breakfast">{isRTL ? 'إفطار' : 'Breakfast'}</SelectItem>
                    <SelectItem value="lunch">{isRTL ? 'غداء' : 'Lunch'}</SelectItem>
                    <SelectItem value="dinner">{isRTL ? 'عشاء' : 'Dinner'}</SelectItem>
                    <SelectItem value="snack">{isRTL ? 'سناك' : 'Snack'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{isRTL ? 'نوع الباقة' : 'Package Type'}</Label>
                <Select 
                  value={recipeFormData.package_type} 
                  onValueChange={(v) => setRecipeFormData({ ...recipeFormData, package_type: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {packageTypes.map(p => (
                      <SelectItem key={p} value={p}>{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>{isRTL ? 'الوصف' : 'Description'}</Label>
              <Textarea
                value={recipeFormData.description}
                onChange={(e) => setRecipeFormData({ ...recipeFormData, description: e.target.value })}
                placeholder={isRTL ? 'وصف الوصفة...' : 'Recipe description...'}
              />
            </div>

            {/* Nutrition Info */}
            <div className="grid grid-cols-4 gap-4">
              <div>
                <Label>{isRTL ? 'السعرات' : 'Calories'}</Label>
                <Input
                  type="number"
                  value={recipeFormData.calories}
                  onChange={(e) => setRecipeFormData({ ...recipeFormData, calories: e.target.value })}
                  placeholder="350"
                />
              </div>
              <div>
                <Label>{isRTL ? 'بروتين (جم)' : 'Protein (g)'}</Label>
                <Input
                  type="number"
                  value={recipeFormData.protein_g}
                  onChange={(e) => setRecipeFormData({ ...recipeFormData, protein_g: e.target.value })}
                  placeholder="20"
                />
              </div>
              <div>
                <Label>{isRTL ? 'كربوهيدرات (جم)' : 'Carbs (g)'}</Label>
                <Input
                  type="number"
                  value={recipeFormData.carbs_g}
                  onChange={(e) => setRecipeFormData({ ...recipeFormData, carbs_g: e.target.value })}
                  placeholder="45"
                />
              </div>
              <div>
                <Label>{isRTL ? 'دهون (جم)' : 'Fat (g)'}</Label>
                <Input
                  type="number"
                  value={recipeFormData.fat_g}
                  onChange={(e) => setRecipeFormData({ ...recipeFormData, fat_g: e.target.value })}
                  placeholder="10"
                />
              </div>
            </div>

            {/* Time & Difficulty */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>{isRTL ? 'وقت التحضير (دقيقة)' : 'Prep Time (min)'}</Label>
                <Input
                  type="number"
                  value={recipeFormData.prep_time_minutes}
                  onChange={(e) => setRecipeFormData({ ...recipeFormData, prep_time_minutes: e.target.value })}
                  placeholder="10"
                />
              </div>
              <div>
                <Label>{isRTL ? 'وقت الطبخ (دقيقة)' : 'Cook Time (min)'}</Label>
                <Input
                  type="number"
                  value={recipeFormData.cook_time_minutes}
                  onChange={(e) => setRecipeFormData({ ...recipeFormData, cook_time_minutes: e.target.value })}
                  placeholder="20"
                />
              </div>
              <div>
                <Label>{isRTL ? 'الصعوبة' : 'Difficulty'}</Label>
                <Select 
                  value={recipeFormData.difficulty} 
                  onValueChange={(v) => setRecipeFormData({ ...recipeFormData, difficulty: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">{isRTL ? 'سهل' : 'Easy'}</SelectItem>
                    <SelectItem value="medium">{isRTL ? 'متوسط' : 'Medium'}</SelectItem>
                    <SelectItem value="hard">{isRTL ? 'صعب' : 'Hard'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Media */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="flex items-center gap-2">
                  <Image className="h-4 w-4" />
                  {isRTL ? 'رابط الصورة' : 'Image URL'}
                </Label>
                <Input
                  value={recipeFormData.image_url}
                  onChange={(e) => setRecipeFormData({ ...recipeFormData, image_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              <div>
                <Label className="flex items-center gap-2">
                  <Video className="h-4 w-4" />
                  {isRTL ? 'رابط الفيديو' : 'Video URL'}
                </Label>
                <Input
                  value={recipeFormData.video_url}
                  onChange={(e) => setRecipeFormData({ ...recipeFormData, video_url: e.target.value })}
                  placeholder="https://youtube.com/..."
                />
              </div>
            </div>

            {/* Ingredients & Instructions */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{isRTL ? 'المكونات (سطر لكل مكون)' : 'Ingredients (one per line)'}</Label>
                <Textarea
                  value={recipeFormData.ingredients}
                  onChange={(e) => setRecipeFormData({ ...recipeFormData, ingredients: e.target.value })}
                  placeholder={isRTL ? 'موز\nشوفان\nحليب' : 'Banana\nOats\nMilk'}
                  rows={4}
                />
              </div>
              <div>
                <Label>{isRTL ? 'التعليمات (سطر لكل خطوة)' : 'Instructions (one per line)'}</Label>
                <Textarea
                  value={recipeFormData.instructions}
                  onChange={(e) => setRecipeFormData({ ...recipeFormData, instructions: e.target.value })}
                  placeholder={isRTL ? 'ضع المكونات\nاخلط جيداً\nقدم' : 'Add ingredients\nMix well\nServe'}
                  rows={4}
                />
              </div>
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsRecipeDialogOpen(false)}>
              {isRTL ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button onClick={handleSubmitRecipe}>
              <Save className="h-4 w-4 mr-2" />
              {editingRecipe ? (isRTL ? 'تحديث' : 'Update') : (isRTL ? 'حفظ' : 'Save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Meal Card Component
const MealCard = ({ type, meal, isRTL }: { type: string; meal: MealData; isRTL: boolean }) => {
  const config = mealTypeConfig[type as keyof typeof mealTypeConfig];
  const Icon = config.icon;

  return (
    <div className={`p-3 rounded-lg ${config.bgColor} ${config.borderColor} border`}>
      <div className="flex items-center gap-2 mb-2">
        <div className={`p-1.5 rounded ${config.bgColor}`}>
          <Icon className="h-4 w-4" />
        </div>
        <Badge variant="secondary" className="text-xs">
          {config.label[isRTL ? 'ar' : 'en']}
        </Badge>
      </div>
      <h4 className="font-medium text-sm mb-1">{meal.title}</h4>
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {meal.time}
        </span>
        <span className="flex items-center gap-1">
          <Flame className="h-3 w-3" />
          {meal.calories} {isRTL ? 'سعرة' : 'cal'}
        </span>
      </div>
    </div>
  );
};

// Meal Input Card Component
const MealInputCard = ({ 
  type, 
  meal, 
  onChange, 
  isRTL 
}: { 
  type: string; 
  meal: MealData; 
  onChange: (meal: MealData) => void;
  isRTL: boolean;
}) => {
  const config = mealTypeConfig[type as keyof typeof mealTypeConfig];
  const Icon = config.icon;

  return (
    <Card className={`${config.borderColor} border-2`}>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className={`p-2 rounded-lg ${config.bgColor}`}>
            <Icon className="h-4 w-4" />
          </div>
          <span className="font-medium">{config.label[isRTL ? 'ar' : 'en']}</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="col-span-3">
            <Input
              placeholder={isRTL ? 'اسم الوجبة' : 'Meal name'}
              value={meal.title}
              onChange={(e) => onChange({ ...meal, title: e.target.value })}
            />
          </div>
          <Input
            type="number"
            placeholder={isRTL ? 'السعرات' : 'Calories'}
            value={meal.calories || ''}
            onChange={(e) => onChange({ ...meal, calories: parseInt(e.target.value) || 0 })}
          />
          <Input
            type="time"
            value={meal.time}
            onChange={(e) => onChange({ ...meal, time: e.target.value })}
          />
          <Input
            placeholder={isRTL ? 'رابط الصورة' : 'Image URL'}
            value={meal.image_url || ''}
            onChange={(e) => onChange({ ...meal, image_url: e.target.value })}
          />
        </div>
      </CardContent>
    </Card>
  );
};
