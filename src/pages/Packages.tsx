import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Stethoscope, Heart, Dumbbell, Users, Sparkles, Home, Clock, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useLanguage } from '@/contexts/LanguageContext';
import Layout from '@/components/layout/Layout';
import { toast } from '@/hooks/use-toast';

// Policy terms that need individual agreement with full details
const policyTerms = {
  ar: [
    { 
      id: 'scope', 
      title: 'نطاق الخدمة', 
      summary: 'أفهم أن جميع الخدمات تتم أونلاين ولا تُغني عن الفحص الطبي المباشر عند الحاجة',
      fullContent: `جميع الخدمات المقدمة (التأهيل – التغذية – Coaching) تتم أونلاين فقط عبر منصات الاتصال المعتمدة.

تعتمد الخدمة على:
• التقييم الإكلينيكي عن بُعد
• وضع برنامج علاجي / غذائي / تدريبي
• المتابعة الدورية والتعديل حسب التقدم

⚠️ الخدمات الأونلاين لا تُغني عن الفحص الطبي المباشر عند الحاجة.`
    },
    { 
      id: 'responsibility', 
      title: 'مسؤولية العميل', 
      summary: 'أقر بتقديم معلومات صحية دقيقة والالتزام بالتعليمات والبرنامج الموصوف',
      fullContent: `بمجرد حجز الجلسة، يقرّ العميل بما يلي:
• تقديم معلومات صحية دقيقة وكاملة (تقارير، أشعة، تحاليل إن وُجدت).
• الالتزام الكامل بالتعليمات والبرنامج الموصوف.
• إبلاغ الفريق فورًا في حالة:
  - ظهور ألم غير طبيعي
  - أعراض جديدة
  - تدهور في الحالة الصحية

📌 عدم الالتزام أو إخفاء معلومات طبية قد يؤثر على النتائج، ولا تتحمل الجهة المقدمة للخدمة أي مسؤولية عن ذلك.`
    },
    { 
      id: 'liability', 
      title: 'حدود المسؤولية', 
      summary: 'أفهم أن الخدمات تأهيلية داعمة وليست بديلاً عن التشخيص أو العلاج الطبي',
      fullContent: `الخدمات المقدمة هي خدمات تأهيلية وصحية داعمة وليست بديلاً عن:
• التشخيص الطبي
• التدخل الجراحي
• العلاج الدوائي

ولا تتحمل الجهة أي مسؤولية عن:
• إصابات ناتجة عن تنفيذ التمارين بشكل غير صحيح
• عدم الالتزام بالبرنامج
• تجاهل التحذيرات أو الإرشادات المقدمة`
    },
    { 
      id: 'payment', 
      title: 'سياسة الدفع', 
      summary: 'أفهم أن الدفع مسبق والحجز مؤكد فقط بعد إتمام الدفع',
      fullContent: `• يتم الدفع مسبقًا قبل بدء أي جلسة أو برنامج.
• يُعد الحجز مؤكدًا فقط بعد إتمام عملية الدفع بالكامل.`
    },
    { 
      id: 'refund', 
      title: 'سياسة الاسترداد', 
      summary: 'أفهم شروط الاسترداد وأنه لا يوجد استرداد بعد تنفيذ الجلسة الأولى أو إرسال البرنامج',
      fullContent: `🔹 لا يوجد استرداد في الحالات التالية:
• بعد تنفيذ الجلسة الأولى
• بعد إرسال البرنامج (تأهيلي / غذائي / تدريبي)
• في حالة عدم التزام العميل بالحضور أو المتابعة

🔹 يتم الاسترداد الجزئي أو الكامل فقط في الحالات التالية:
• الإلغاء خلال 24 ساعة من تاريخ الحجز
• إلغاء الخدمة من قِبل الجهة المقدمة
• وجود مشكلة تقنية من طرفنا منعت تقديم الخدمة
• ظرف قهري موثّق ويتم تقييمه إداريًا

📌 جميع طلبات الاسترداد تخضع للتقييم خلال مدة من 3 إلى 5 أيام عمل.`
    },
    { 
      id: 'privacy', 
      title: 'الخصوصية وسرية البيانات', 
      summary: 'أوافق على سياسة الخصوصية وسرية البيانات',
      fullContent: `• جميع بيانات المرضى والعملاء سرية تمامًا.
• لا يتم مشاركة أي معلومات أو صور أو فيديوهات إلا:
  - بموافقة كتابية من العميل
  - أو لأغراض علمية دون ذكر أي بيانات تعريفية`
    },
    { 
      id: 'results', 
      title: 'النتائج المتوقعة', 
      summary: 'أفهم أن النتائج تختلف من شخص لآخر ولا يوجد ضمان لنتائج محددة',
      fullContent: `• تختلف النتائج من شخص لآخر حسب:
  - شدة الحالة
  - مدى الالتزام
  - نمط الحياة

• لا يوجد أي ضمان لنتائج محددة أو مدة زمنية ثابتة للتعافي.`
    },
    { 
      id: 'consent', 
      title: 'إقرار الموافقة', 
      summary: 'أقر أنني اطلعت على طبيعة الخدمة وأتحمل المسؤولية الكاملة عن تنفيذ التعليمات',
      fullContent: `قبل بدء الخدمة، يقرّ العميل بما يلي:

"أقرّ أنني اطّلعت على طبيعة الخدمة الأونلاين، وأفهم حدودها، وأتحمل المسؤولية الكاملة عن تنفيذ التعليمات والتوصيات المقدمة."

بند الملكية الفكرية:
• جميع البرامج والخطط والمحتوى المقدم تُعد ملكية فكرية خاصة بجهة NutriRehab.
• لا يجوز إعادة بيعها أو مشاركتها أو استخدامها لأغراض تجارية دون إذن كتابي مسبق.`
    },
  ],
  en: [
    { 
      id: 'scope', 
      title: 'Scope of Service', 
      summary: 'I understand all services are online and do not replace direct medical examination when needed',
      fullContent: `All services provided (Rehabilitation – Nutrition – Coaching) are conducted online only through approved communication platforms.

The service relies on:
• Remote clinical assessment
• Development of therapeutic / nutritional / training program
• Periodic follow-up and adjustment based on progress

⚠️ Online services do not replace direct medical examination when needed.`
    },
    { 
      id: 'responsibility', 
      title: 'Client Responsibility', 
      summary: 'I agree to provide accurate health information and comply with instructions and program',
      fullContent: `Upon booking a session, the client acknowledges the following:
• Providing accurate and complete health information (reports, X-rays, tests if available).
• Full compliance with instructions and prescribed program.
• Immediately notifying the team in case of:
  - Abnormal pain
  - New symptoms
  - Deterioration in health condition

📌 Non-compliance or concealing medical information may affect results, and the service provider bears no responsibility for this.`
    },
    { 
      id: 'liability', 
      title: 'Liability Limits', 
      summary: 'I understand services are supportive and not a substitute for medical diagnosis or treatment',
      fullContent: `The services provided are supportive rehabilitation and health services and are not a substitute for:
• Medical diagnosis
• Surgical intervention
• Pharmaceutical treatment

The provider bears no responsibility for:
• Injuries resulting from incorrect exercise execution
• Non-compliance with the program
• Ignoring warnings or provided guidelines`
    },
    { 
      id: 'payment', 
      title: 'Payment Policy', 
      summary: 'I understand payment is in advance and booking is confirmed only after full payment',
      fullContent: `• Payment is made in advance before starting any session or program.
• Booking is confirmed only after completing full payment.`
    },
    { 
      id: 'refund', 
      title: 'Refund Policy', 
      summary: 'I understand refund terms and no refund after first session or program delivery',
      fullContent: `🔹 No refund in the following cases:
• After the first session is conducted
• After the program is sent (rehabilitation / nutritional / training)
• If the client fails to attend or follow up

🔹 Partial or full refund only in the following cases:
• Cancellation within 24 hours of booking date
• Service cancellation by the provider
• Technical problem on our end that prevented service delivery
• Documented force majeure evaluated administratively

📌 All refund requests are subject to evaluation within 3 to 5 business days.`
    },
    { 
      id: 'privacy', 
      title: 'Privacy & Data Confidentiality', 
      summary: 'I agree to the privacy and data confidentiality policy',
      fullContent: `• All patient and client data is completely confidential.
• No information, photos, or videos are shared except:
  - With written consent from the client
  - Or for scientific purposes without mentioning any identifying data`
    },
    { 
      id: 'results', 
      title: 'Expected Results', 
      summary: 'I understand results vary and there is no guarantee of specific outcomes',
      fullContent: `• Results vary from person to person depending on:
  - Severity of condition
  - Level of commitment
  - Lifestyle

• There is no guarantee of specific results or fixed recovery timeframe.`
    },
    { 
      id: 'consent', 
      title: 'Consent', 
      summary: 'I acknowledge I reviewed the service nature and take full responsibility for following instructions',
      fullContent: `Before starting the service, the client acknowledges:

"I acknowledge that I have reviewed the nature of the online service, understand its limitations, and take full responsibility for implementing the instructions and recommendations provided."

Intellectual Property Clause:
• All programs, plans, and content provided are intellectual property of NutriRehab.
• They may not be resold, shared, or used for commercial purposes without prior written permission.`
    },
  ]
};

interface Package {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  price: number;
  oldPrice?: number;
  priceUSD: number;
  discount?: number;
  sessions?: number;
}

interface PackageCategory {
  id: string;
  title: string;
  titleEn: string;
  icon: React.ReactNode;
  iconBg: string;
  packages: Package[];
}

const packagesData: PackageCategory[] = [
  {
    id: 'assessments',
    title: 'التقييمات',
    titleEn: 'Assessments',
    icon: <Stethoscope className="h-6 w-6" />,
    iconBg: 'bg-blue-500',
    packages: [
      {
        id: 'nutrition-assessment',
        name: 'جلسة تقييم التغذية',
        nameEn: 'Nutrition Assessment',
        description: 'تقييم غذائي شامل لمدة 30-40 دقيقة يغطي التاريخ الصحي، أنماط الأكل، الأهداف، والقياسات الأساسية لإعداد استراتيجية...',
        descriptionEn: 'Comprehensive nutritional assessment for 30-40 minutes covering health history, eating patterns, goals, and basic measurements...',
        price: 500,
        priceUSD: 25,
      },
      {
        id: 'rehab-assessment',
        name: 'جلسة تقييم التأهيل',
        nameEn: 'Rehabilitation Assessment',
        description: 'تقييم عضلي هيكلي كامل لمدة 45 دقيقة يشمل اختبار نطاق الحركة، تقييم الألم، تحليل الوضعية، ووضع خارطة طريق التأهيل...',
        descriptionEn: 'Complete musculoskeletal assessment for 45 minutes including range of motion test, pain assessment, posture analysis...',
        price: 500,
        priceUSD: 35,
      },
    ],
  },
  {
    id: 'nutrition-plans',
    title: 'خطط التغذية',
    titleEn: 'Nutrition Plans',
    icon: <Heart className="h-6 w-6" />,
    iconBg: 'bg-pink-500',
    packages: [
      {
        id: 'nutrione-monthly',
        name: 'NutriOne - خطة شهرية',
        nameEn: 'NutriOne - Monthly Plan',
        description: 'برنامج تغذية شخصي شهري مع تعديلات أسبوعية، تتبع الأهداف، وإرشاد غذائي كامل',
        descriptionEn: 'Personal monthly nutrition program with weekly adjustments, goal tracking, and complete dietary guidance',
        price: 2000,
        oldPrice: 2500,
        priceUSD: 80,
        discount: 20,
      },
      {
        id: 'nutriplus-3months',
        name: 'NutriPlus - 3 أشهر',
        nameEn: 'NutriPlus - 3 Months',
        description: 'خطة تغذية تقدمية لمدة 3 أشهر مصممة لبناء العادات، التكيف الأيضي، والتحول الملموس',
        descriptionEn: 'Progressive 3-month nutrition plan designed for habit building, metabolic adaptation, and tangible transformation',
        price: 6000,
        oldPrice: 7500,
        priceUSD: 220,
        discount: 20,
      },
      {
        id: 'nutritransform-6months',
        name: 'NutriTransform - 6 أشهر',
        nameEn: 'NutriTransform - 6 Months',
        description: 'استراتيجية طويلة المدى تركز على تغيير نمط الحياة العميق، تحسين تكوين الجسم، ونتائج مستدامة',
        descriptionEn: 'Long-term strategy focusing on deep lifestyle change, body composition improvement, and sustainable results',
        price: 12000,
        oldPrice: 15000,
        priceUSD: 400,
        discount: 20,
      },
      {
        id: 'annual-nutrition',
        name: 'التغذية السنوية',
        nameEn: 'Annual Nutrition',
        description: 'برنامج تغذية سنوي شامل مع متابعة مستمرة وتعديلات موسمية',
        descriptionEn: 'Comprehensive annual nutrition program with continuous follow-up and seasonal adjustments',
        price: 24000,
        oldPrice: 30000,
        priceUSD: 800,
        discount: 20,
      },
    ],
  },
  {
    id: 'rehab-packages',
    title: 'باقات التأهيل',
    titleEn: 'Rehabilitation Packages',
    icon: <Sparkles className="h-6 w-6" />,
    iconBg: 'bg-emerald-500',
    packages: [
      {
        id: 'rehabstart-1month',
        name: 'RehabStart - شهر واحد',
        nameEn: 'RehabStart - 1 Month',
        description: 'برنامج تأهيل منظم لمدة 4 أسابيع يستهدف تقليل الألم، استعادة الحركة، والتحسين الوظيفي',
        descriptionEn: 'Structured 4-week rehabilitation program targeting pain reduction, mobility restoration, and functional improvement',
        price: 2100,
        oldPrice: 3000,
        priceUSD: 75,
        discount: 30,
        sessions: 12,
      },
      {
        id: 'rehabprogress-3months',
        name: 'RehabProgress - 3 أشهر',
        nameEn: 'RehabProgress - 3 Months',
        description: 'مرحلة تأهيل تصحيحية تركز على تحسين جودة الحركة، القوة، التوازن، واستقرار المفاصل طويل المدى',
        descriptionEn: 'Corrective rehabilitation phase focusing on movement quality, strength, balance, and long-term joint stability',
        price: 6300,
        oldPrice: 9000,
        priceUSD: 225,
        discount: 30,
        sessions: 36,
      },
      {
        id: 'rehabadvance-6months',
        name: 'RehabAdvance - 6 أشهر',
        nameEn: 'RehabAdvance - 6 Months',
        description: 'رحلة تأهيل شاملة تستهدف تصحيح الحركة العميق، التوازن العضلي، وإعادة بناء الأداء',
        descriptionEn: 'Comprehensive rehabilitation journey targeting deep movement correction, muscle balance, and performance rebuilding',
        price: 12600,
        oldPrice: 18000,
        priceUSD: 400,
        discount: 30,
        sessions: 72,
      },
      {
        id: 'rehabmaster-annual',
        name: 'RehabMaster - سنوي',
        nameEn: 'RehabMaster - Annual',
        description: 'برنامج تحول لمدة عام كامل مصمم لإعادة بناء جسمك، حركتك، قوتك، ووظيفتك من الأساس',
        descriptionEn: 'Full year transformation program designed to rebuild your body, movement, strength, and function from the ground up',
        price: 25200,
        oldPrice: 36000,
        priceUSD: 900,
        discount: 30,
        sessions: 144,
      },
    ],
  },
  {
    id: 'online-coaching',
    title: 'التدريب الأونلاين',
    titleEn: 'Online Coaching',
    icon: <Dumbbell className="h-6 w-6" />,
    iconBg: 'bg-orange-500',
    packages: [
      {
        id: 'coachone-monthly',
        name: 'CoachOne - شهري',
        nameEn: 'CoachOne - Monthly',
        description: 'برنامج تدريب شهري يشمل تصميم التمارين الأسبوعي، تقييم الفيديو، وتتبع الأداء',
        descriptionEn: 'Monthly training program including weekly exercise design, video assessment, and performance tracking',
        price: 1600,
        oldPrice: 2000,
        priceUSD: 55,
        discount: 20,
      },
      {
        id: 'coachthree-3months',
        name: 'Coach Three - 3 أشهر',
        nameEn: 'Coach Three - 3 Months',
        description: 'برنامج تدريب لمدة 3 أشهر يشمل تصميم التمارين الأسبوعي، تقييم الفيديو، وتتبع الأداء',
        descriptionEn: '3-month training program including weekly exercise design, video assessment, and performance tracking',
        price: 4800,
        oldPrice: 6000,
        priceUSD: 165,
        discount: 20,
      },
      {
        id: 'coachstar-6months',
        name: 'Coach Star - 6 أشهر',
        nameEn: 'Coach Star - 6 Months',
        description: 'برنامج تدريب لمدة 6 أشهر يشمل تصميم التمارين الأسبوعي، تقييم الفيديو، وتتبع الأداء',
        descriptionEn: '6-month training program including weekly exercise design, video assessment, and performance tracking',
        price: 9600,
        oldPrice: 12000,
        priceUSD: 350,
        discount: 20,
      },
      {
        id: 'coachdiamond-annual',
        name: 'Coach Diamond - سنوي',
        nameEn: 'Coach Diamond - Annual',
        description: 'برنامج تدريب لمدة عام كامل يشمل تصميم التمارين الأسبوعي، تقييم الفيديو، وتتبع الأداء',
        descriptionEn: 'Full year training program including weekly exercise design, video assessment, and performance tracking',
        price: 19200,
        oldPrice: 24000,
        priceUSD: 550,
        discount: 20,
      },
    ],
  },
  {
    id: 'combo-packages',
    title: 'الباقات المدمجة',
    titleEn: 'Combo Packages',
    icon: <Users className="h-6 w-6" />,
    iconBg: 'bg-purple-500',
    packages: [
      {
        id: 'duo-rehab-nutrition',
        name: 'Duo - تأهيل + تغذية',
        nameEn: 'Duo - Rehab + Nutrition',
        description: 'نظام شهري متكامل يجمع 12 جلسة تأهيل + خطة تغذية كاملة لتسريع التعافي وتحول الجسم',
        descriptionEn: 'Integrated monthly system combining 12 rehab sessions + complete nutrition plan for faster recovery and body transformation',
        price: 5500,
        priceUSD: 150,
      },
      {
        id: 'powerpack-rehab-coaching',
        name: 'Power Pack - تأهيل + تدريب',
        nameEn: 'Power Pack - Rehab + Coaching',
        description: 'يشمل 12 جلسة تأهيل + تدريب أونلاين شهري لتحسين الحركة، القوة، والأداء الوظيفي',
        descriptionEn: 'Includes 12 rehab sessions + monthly online coaching to improve movement, strength, and functional performance',
        price: 5000,
        priceUSD: 110,
      },
      {
        id: 'thestar-coaching-nutrition',
        name: 'The Star - تدريب + تغذية',
        nameEn: 'The Star - Coaching + Nutrition',
        description: 'يشمل خطة تغذية كاملة لتسريع تحول الجسم + تدريب أونلاين شهري لتحسين الحركة والقوة',
        descriptionEn: 'Includes complete nutrition plan for faster body transformation + monthly online coaching for movement and strength',
        price: 4500,
        priceUSD: 120,
      },
      {
        id: 'ultimate-transformation',
        name: 'Ultimate Transformation - الباقة الكاملة',
        nameEn: 'Ultimate Transformation - Full Package',
        description: 'الباقة الكاملة: تأهيل + تغذية + تدريب للتحول الشامل للجسم ونمط الحياة',
        descriptionEn: 'The complete package: rehab + nutrition + coaching for comprehensive body and lifestyle transformation',
        price: 8500,
        priceUSD: 180,
      },
    ],
  },
  {
    id: 'recovery-sessions',
    title: 'جلسات الاستشفاء',
    titleEn: 'Recovery Sessions',
    icon: <Heart className="h-6 w-6" />,
    iconBg: 'bg-teal-500',
    packages: [
      {
        id: 'upper-needles',
        name: 'Needles Upper (الجزء العلوي)',
        nameEn: 'Needles Upper (Upper Body)',
        description: 'استشفاء الجزء العلوي من الجسم باستخدام تقنيات الإبر لتقليل التوتر، تحسين الدورة الدموية، وتعزيز الأداء',
        descriptionEn: 'Upper body recovery using needle techniques to reduce tension, improve circulation, and enhance performance',
        price: 500,
        priceUSD: 25,
      },
      {
        id: 'lower-needles',
        name: 'Needles Lower (الجزء السفلي)',
        nameEn: 'Needles Lower (Lower Body)',
        description: 'استشفاء الجزء السفلي من الجسم يستهدف العضلات المشدودة، التعب، واستعادة الحركة',
        descriptionEn: 'Lower body recovery targeting tight muscles, fatigue, and mobility restoration',
        price: 500,
        priceUSD: 25,
      },
      {
        id: 'fullbody-recovery',
        name: 'Full Body (كامل الجسم)',
        nameEn: 'Full Body Recovery',
        description: 'جلسة استشفاء لكامل الجسم مصممة لإطلاق التوتر، تحسين الحركة، وتعزيز الرفاهية العضلية الشاملة',
        descriptionEn: 'Full body recovery session designed to release tension, improve mobility, and enhance overall muscular wellness',
        price: 900,
        priceUSD: 45,
      },
    ],
  },
  {
    id: 'cupping',
    title: 'الحجامة',
    titleEn: 'Cupping Therapy',
    icon: <Heart className="h-6 w-6" />,
    iconBg: 'bg-red-500',
    packages: [
      {
        id: 'upper-cupping',
        name: 'حجامة الجزء العلوي',
        nameEn: 'Upper Body Cupping',
        description: 'جلسة حجامة مستهدفة باستخدام تقنيات الإبر لتحسين تدفق الدم وتقليل مناطق الألم',
        descriptionEn: 'Targeted cupping session using needle techniques to improve blood flow and reduce pain areas',
        price: 450,
        priceUSD: 22,
      },
      {
        id: 'fullbody-cupping',
        name: 'حجامة كامل الجسم',
        nameEn: 'Full Body Cupping',
        description: 'جلسة حجامة لكامل الجسم للتخلص من السموم، تحسين الدورة الدموية، وتخفيف العضلات',
        descriptionEn: 'Full body cupping session for detoxification, improving circulation, and muscle relief',
        price: 800,
        priceUSD: 40,
      },
      {
        id: 'boost-cupping',
        name: 'Boost - استشفاء + حجامة',
        nameEn: 'Boost - Recovery + Cupping',
        description: 'جلسة مدمجة من الاستشفاء + الحجامة مصممة لتعظيم الشفاء، تقليل الألم، وتعزيز توازن الجسم',
        descriptionEn: 'Combined recovery + cupping session designed to maximize healing, reduce pain, and enhance body balance',
        price: 1500,
        priceUSD: 75,
      },
    ],
  },
  {
    id: 'home-therapy',
    title: 'العلاج الطبيعي المنزلي',
    titleEn: 'Home Physical Therapy',
    icon: <Home className="h-6 w-6" />,
    iconBg: 'bg-indigo-500',
    packages: [
      {
        id: 'home-assessment',
        name: 'التقييم المنزلي',
        nameEn: 'Home Assessment',
        description: 'زيارة منزلية واحدة تشمل التقييم والجلسة',
        descriptionEn: 'One home visit including assessment and session',
        price: 500,
        priceUSD: 25,
      },
      {
        id: 'star-6sessions',
        name: 'Star - 6 جلسات',
        nameEn: 'Star - 6 Sessions',
        description: '6 جلسات علاج طبيعي منزلية',
        descriptionEn: '6 home physical therapy sessions',
        price: 2500,
        priceUSD: 125,
      },
      {
        id: 'starplus-12sessions',
        name: 'Star Plus - 12 جلسة',
        nameEn: 'Star Plus - 12 Sessions',
        description: '12 جلسة علاج طبيعي منزلية',
        descriptionEn: '12 home physical therapy sessions',
        price: 4500,
        priceUSD: 225,
      },
    ],
  },
];

const Packages = () => {
  const { isRTL, language } = useLanguage();
  const [agreedTerms, setAgreedTerms] = useState<Record<string, boolean>>({});
  const [expandedTerms, setExpandedTerms] = useState<Record<string, boolean>>({});
  const policyRef = useRef<HTMLDivElement>(null);

  const terms = isRTL ? policyTerms.ar : policyTerms.en;
  const allTermsAgreed = terms.every(term => agreedTerms[term.id]);

  const formatPrice = (price: number) => {
    return price.toLocaleString('en-US');
  };

  const handleTermChange = (termId: string, checked: boolean) => {
    setAgreedTerms(prev => ({ ...prev, [termId]: checked }));
  };

  const toggleExpanded = (termId: string) => {
    setExpandedTerms(prev => ({ ...prev, [termId]: !prev[termId] }));
  };

  const handleFreeConsultation = () => {
    window.open('https://wa.me/201203246090', '_blank');
  };

  const handleBookNow = () => {
    if (!allTermsAgreed) {
      toast({
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: language === 'ar' ? 'يجب الموافقة على جميع شروط سياسة استخدام الخدمات أولاً' : 'You must agree to all service usage policy terms first',
        variant: 'destructive'
      });
      // Scroll to policy section
      policyRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    window.open('https://wa.me/201203246090', '_blank');
  };

  return (
    <Layout>
      <div className="min-h-screen bg-background pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {isRTL ? 'باقات الخدمات' : 'Service Packages'}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {isRTL 
                ? 'اختر الباقة المناسبة لك من مجموعة متنوعة من خدماتنا المتميزة'
                : 'Choose the right package for you from our diverse range of premium services'
              }
            </p>
          </motion.div>

          {/* Package Categories */}
          {packagesData.map((category, categoryIndex) => (
            <motion.section
              key={category.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: categoryIndex * 0.1 }}
              className="mb-16"
            >
              {/* Category Header */}
              <div className={`flex items-center gap-4 mb-8 ${isRTL ? 'flex-row-reverse justify-end' : 'justify-start'}`}>
                <div className={`p-3 rounded-xl ${category.iconBg} text-white`}>
                  {category.icon}
                </div>
                <div className={isRTL ? 'text-right' : 'text-left'}>
                  <h2 className="text-2xl font-bold">
                    {isRTL ? category.title : category.titleEn}
                  </h2>
                  <p className="text-muted-foreground text-sm">
                    {category.packages.length} {isRTL ? 'باقات متاحة' : 'packages available'}
                  </p>
                </div>
              </div>

              {/* Packages Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {category.packages.map((pkg, pkgIndex) => (
                  <motion.div
                    key={pkg.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: categoryIndex * 0.1 + pkgIndex * 0.05 }}
                    className="bg-card border border-border rounded-2xl p-6 hover:border-primary/50 transition-all duration-300 flex flex-col"
                  >
                    {/* Discount Badge */}
                    {pkg.discount && (
                      <Badge className="self-start mb-4 bg-primary/20 text-primary border-0">
                        {pkg.discount}% %
                      </Badge>
                    )}

                    {/* Package Name */}
                    <h3 className={`text-lg font-bold mb-3 ${isRTL ? 'text-right' : 'text-left'}`}>
                      {isRTL ? pkg.name : pkg.nameEn}
                    </h3>

                    {/* Description */}
                    <p className={`text-sm text-muted-foreground mb-4 flex-grow ${isRTL ? 'text-right' : 'text-left'}`}>
                      {isRTL ? pkg.description : pkg.descriptionEn}
                    </p>

                    {/* Sessions if available */}
                    {pkg.sessions && (
                      <div className={`flex items-center gap-2 mb-4 text-sm text-muted-foreground ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <Clock className="h-4 w-4" />
                        <span>{pkg.sessions} {isRTL ? 'جلسة' : 'sessions'}</span>
                      </div>
                    )}

                    {/* Pricing */}
                    <div className={`mb-4 ${isRTL ? 'text-right' : 'text-left'}`}>
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <span className="text-3xl font-bold text-primary">
                          {formatPrice(pkg.price)}
                        </span>
                        <span className="text-lg text-muted-foreground">EGP</span>
                      </div>
                      {pkg.oldPrice && (
                        <div className="text-sm text-muted-foreground line-through">
                          EGP {formatPrice(pkg.oldPrice)}
                        </div>
                      )}
                      <div className="text-sm text-muted-foreground mt-1">
                        ≈ USD ${pkg.priceUSD}
                      </div>
                    </div>

                    {/* Book Now Button */}
                    <Button
                      onClick={handleBookNow}
                      className="w-full bg-primary hover:bg-primary/90 gap-2"
                    >
                      <MessageCircle className="h-4 w-4" />
                      {isRTL ? 'احجز الآن' : 'Book Now'}
                    </Button>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          ))}

          {/* Policy Agreement Section */}
          <motion.div
            ref={policyRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-12 max-w-3xl mx-auto"
          >
            <div className="bg-card border rounded-2xl p-6" dir="rtl">
              <h3 className="text-xl font-bold mb-2 text-right">
                {isRTL ? 'الموافقة على شروط الخدمة' : 'Service Terms Agreement'}
              </h3>
              <p className="text-sm text-muted-foreground mb-6 text-right">
                {isRTL 
                  ? 'يجب الموافقة على جميع الشروط التالية قبل الحجز (اضغط على أي شرط لقراءة التفاصيل)'
                  : 'You must agree to all the following terms before booking (click any term to read details)'
                }
              </p>
              
              <div className="space-y-3">
                {terms.map((term, index) => (
                  <motion.div
                    key={term.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.05 }}
                    className={`rounded-xl border transition-colors overflow-hidden ${
                      agreedTerms[term.id] 
                        ? 'bg-primary/5 border-primary/30' 
                        : 'bg-muted/30 border-border hover:border-primary/20'
                    }`}
                  >
                    <div className="flex items-start gap-3 p-4">
                      <Checkbox
                        id={`term-${term.id}`}
                        checked={agreedTerms[term.id] || false}
                        onCheckedChange={(checked) => handleTermChange(term.id, checked === true)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <button 
                          type="button"
                          onClick={() => toggleExpanded(term.id)}
                          className="w-full flex items-center justify-between gap-2"
                        >
                          <div className="text-right flex-1">
                            <span className="font-medium text-foreground block mb-1">
                              {index + 1}. {term.title}
                            </span>
                            <span className="text-sm text-muted-foreground block">
                              {term.summary}
                            </span>
                          </div>
                          <ChevronDown 
                            className={`h-5 w-5 text-muted-foreground transition-transform shrink-0 ${
                              expandedTerms[term.id] ? 'rotate-180' : ''
                            }`} 
                          />
                        </button>
                      </div>
                    </div>
                    
                    <AnimatePresence>
                      {expandedTerms[term.id] && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-4 ps-12">
                            <div className="p-4 bg-background rounded-lg border text-sm text-muted-foreground whitespace-pre-line leading-relaxed text-right">
                              {term.fullContent}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>

              {/* Progress indicator */}
              <div className="mt-6 pt-4 border-t">
                <div className={`flex items-center justify-between text-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <span className="text-muted-foreground">
                    {isRTL 
                      ? `تم الموافقة على ${Object.values(agreedTerms).filter(Boolean).length} من ${terms.length} شروط`
                      : `Agreed to ${Object.values(agreedTerms).filter(Boolean).length} of ${terms.length} terms`
                    }
                  </span>
                  {allTermsAgreed && (
                    <span className="text-primary font-medium">
                      {isRTL ? '✓ جاهز للحجز' : '✓ Ready to book'}
                    </span>
                  )}
                </div>
                <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${(Object.values(agreedTerms).filter(Boolean).length / terms.length) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Help Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-16 text-center bg-gradient-to-b from-primary/10 to-transparent rounded-3xl p-12"
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              {isRTL ? 'محتاج مساعدة في اختيار الباقة المناسبة؟' : 'Need help choosing the right package?'}
            </h2>
            <p className="text-muted-foreground mb-8">
              {isRTL 
                ? 'تواصل معنا الآن وسنساعدك في اختيار أفضل باقة تناسب أهدافك'
                : 'Contact us now and we\'ll help you choose the best package for your goals'
              }
            </p>
            <Button
              onClick={handleFreeConsultation}
              size="lg"
              variant="outline"
              className="gap-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
            >
              <MessageCircle className="h-5 w-5" />
              {isRTL ? 'احجز استشارة مجانية' : 'Book Free Consultation'}
            </Button>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default Packages;
