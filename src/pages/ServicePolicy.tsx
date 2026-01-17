import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import Layout from '@/components/layout/Layout';

const ServicePolicy = () => {
  const { isRTL } = useLanguage();

  const policyContent = {
    ar: {
      title: 'سياسة استخدام الخدمات',
      subtitle: '(Rehabilitation – Nutrition – Coaching)',
      sections: [
        {
          title: 'نطاق الخدمة',
          content: `جميع الخدمات المقدمة (التأهيل – التغذية – Coaching) تتم أونلاين فقط عبر منصات الاتصال المعتمدة.

تعتمد الخدمة على:
• التقييم الإكلينيكي عن بُعد
• وضع برنامج علاجي / غذائي / تدريبي
• المتابعة الدورية والتعديل حسب التقدم

⚠️ الخدمات الأونلاين لا تُغني عن الفحص الطبي المباشر عند الحاجة.`
        },
        {
          title: 'مسؤولية المريض / العميل',
          content: `بمجرد حجز الجلسة، يقرّ العميل بما يلي:
• تقديم معلومات صحية دقيقة وكاملة (تقارير، أشعة، تحاليل إن وُجدت).
• الالتزام الكامل بالتعليمات والبرنامج الموصوف.
• إبلاغ الفريق فورًا في حالة:
  - ظهور ألم غير طبيعي
  - أعراض جديدة
  - تدهور في الحالة الصحية

📌 عدم الالتزام أو إخفاء معلومات طبية قد يؤثر على النتائج، ولا تتحمل الجهة المقدمة للخدمة أي مسؤولية عن ذلك.`
        },
        {
          title: 'التقييم وإعادة التقييم',
          content: `• يتم إجراء تقييم أولي قبل بدء أي برنامج.
• يتم إجراء إعادة تقييم دوري حسب الخطة الموضوعة.
• يحق للفريق تعديل الخطة العلاجية أو الغذائية أو التدريبية بما يتناسب مع تطور الحالة.`
        },
        {
          title: 'حدود الخدمة والمسؤولية',
          content: `الخدمات المقدمة هي خدمات تأهيلية وصحية داعمة وليست بديلاً عن:
• التشخيص الطبي
• التدخل الجراحي
• العلاج الدوائي

ولا تتحمل الجهة أي مسؤولية عن:
• إصابات ناتجة عن تنفيذ التمارين بشكل غير صحيح
• عدم الالتزام بالبرنامج
• تجاهل التحذيرات أو الإرشادات المقدمة`
        },
        {
          title: 'سياسة الدفع',
          content: `• يتم الدفع مسبقًا قبل بدء أي جلسة أو برنامج.
• يُعد الحجز مؤكدًا فقط بعد إتمام عملية الدفع بالكامل.`
        },
        {
          title: 'سياسة الاسترداد (Refund Policy)',
          content: `🔹 لا يوجد استرداد في الحالات التالية:
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
          title: 'سياسة التأجيل والحضور',
          content: `• يحق للعميل تأجيل الجلسة مرة واحدة فقط بشرط الإبلاغ قبل موعدها بـ 24 ساعة.
• في حالة عدم الحضور دون إخطار مسبق:
  - تُحسب الجلسة كاملة
  - لا يحق للعميل التعويض أو الإعادة`
        },
        {
          title: 'الخصوصية وسرية البيانات',
          content: `• جميع بيانات المرضى والعملاء سرية تمامًا.
• لا يتم مشاركة أي معلومات أو صور أو فيديوهات إلا:
  - بموافقة كتابية من العميل
  - أو لأغراض علمية دون ذكر أي بيانات تعريفية`
        },
        {
          title: 'النتائج المتوقعة',
          content: `• تختلف النتائج من شخص لآخر حسب:
  - شدة الحالة
  - مدى الالتزام
  - نمط الحياة

• لا يوجد أي ضمان لنتائج محددة أو مدة زمنية ثابتة للتعافي.`
        },
        {
          title: 'حق إيقاف الخدمة',
          content: `يحق للفريق إيقاف الخدمة في الحالات التالية:
• عدم الالتزام المتكرر
• السلوك غير اللائق
• عدم التعاون أو تقديم معلومات طبية مضللة`
        },
        {
          title: 'إقرار الموافقة (Consent Form)',
          content: `قبل بدء الخدمة، يقرّ العميل بما يلي:

"أقرّ أنني اطّلعت على طبيعة الخدمة الأونلاين، وأفهم حدودها، وأتحمل المسؤولية الكاملة عن تنفيذ التعليمات والتوصيات المقدمة."`
        },
        {
          title: 'بند القوة القاهرة',
          content: `تشمل على سبيل المثال لا الحصر:
• انقطاع الإنترنت
• الأعطال التقنية
• الظروف الطارئة

وفي هذه الحالات يتم التعويض أو إعادة الجدولة حسب الإمكانية المتاحة.`
        },
        {
          title: 'بند الملكية الفكرية',
          content: `• جميع البرامج والخطط والمحتوى المقدم تُعد ملكية فكرية خاصة بجهة NutriRehab.
• لا يجوز إعادة بيعها أو مشاركتها أو استخدامها لأغراض تجارية دون إذن كتابي مسبق.`
        }
      ]
    },
    en: {
      title: 'Service Usage Policy',
      subtitle: '(Rehabilitation – Nutrition – Coaching)',
      sections: [
        {
          title: 'Scope of Service',
          content: `All services provided (Rehabilitation – Nutrition – Coaching) are conducted online only through approved communication platforms.

The service relies on:
• Remote clinical assessment
• Development of therapeutic / nutritional / training program
• Periodic follow-up and adjustment based on progress

⚠️ Online services do not replace direct medical examination when needed.`
        },
        {
          title: 'Patient / Client Responsibility',
          content: `Upon booking a session, the client acknowledges the following:
• Providing accurate and complete health information (reports, X-rays, tests if available).
• Full compliance with instructions and prescribed program.
• Immediately notifying the team in case of:
  - Abnormal pain
  - New symptoms
  - Deterioration in health condition

📌 Non-compliance or concealing medical information may affect results, and the service provider bears no responsibility for this.`
        },
        {
          title: 'Assessment and Re-assessment',
          content: `• An initial assessment is conducted before starting any program.
• Periodic re-assessment is conducted according to the established plan.
• The team has the right to modify the therapeutic, nutritional, or training plan according to the case development.`
        },
        {
          title: 'Service Limitations and Liability',
          content: `The services provided are supportive rehabilitation and health services and are not a substitute for:
• Medical diagnosis
• Surgical intervention
• Pharmaceutical treatment

The provider bears no responsibility for:
• Injuries resulting from incorrect exercise execution
• Non-compliance with the program
• Ignoring warnings or provided guidelines`
        },
        {
          title: 'Payment Policy',
          content: `• Payment is made in advance before starting any session or program.
• Booking is confirmed only after completing full payment.`
        },
        {
          title: 'Refund Policy',
          content: `🔹 No refund in the following cases:
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
          title: 'Postponement and Attendance Policy',
          content: `• The client may postpone the session only once, provided notification is given 24 hours before the appointment.
• In case of no-show without prior notice:
  - The session is counted in full
  - The client is not entitled to compensation or rescheduling`
        },
        {
          title: 'Privacy and Data Confidentiality',
          content: `• All patient and client data is completely confidential.
• No information, photos, or videos are shared except:
  - With written consent from the client
  - Or for scientific purposes without mentioning any identifying data`
        },
        {
          title: 'Expected Results',
          content: `• Results vary from person to person depending on:
  - Severity of condition
  - Level of commitment
  - Lifestyle

• There is no guarantee of specific results or fixed recovery timeframe.`
        },
        {
          title: 'Right to Terminate Service',
          content: `The team has the right to terminate service in the following cases:
• Repeated non-compliance
• Inappropriate behavior
• Non-cooperation or providing misleading medical information`
        },
        {
          title: 'Consent Form',
          content: `Before starting the service, the client acknowledges:

"I acknowledge that I have reviewed the nature of the online service, understand its limitations, and take full responsibility for implementing the instructions and recommendations provided."`
        },
        {
          title: 'Force Majeure Clause',
          content: `Including but not limited to:
• Internet outage
• Technical malfunctions
• Emergency circumstances

In these cases, compensation or rescheduling is provided according to available possibilities.`
        },
        {
          title: 'Intellectual Property Clause',
          content: `• All programs, plans, and content provided are intellectual property of NutriRehab.
• They may not be resold, shared, or used for commercial purposes without prior written permission.`
        }
      ]
    }
  };

  const content = isRTL ? policyContent.ar : policyContent.en;

  return (
    <Layout>
      <div className="min-h-screen bg-background py-16 pt-24">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center mb-12">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                {content.title}
              </h1>
              <p className="text-lg text-muted-foreground">
                {content.subtitle}
              </p>
            </div>
            
            <div className="space-y-6">
              {content.sections.map((section, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  className="bg-card rounded-xl p-6 shadow-sm border"
                >
                  <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </span>
                    {section.title}
                  </h2>
                  <div className="text-muted-foreground leading-relaxed whitespace-pre-line">
                    {section.content}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Footer Note */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-12 p-6 bg-primary/5 rounded-xl border border-primary/20 text-center"
            >
              <p className="text-muted-foreground">
                {isRTL 
                  ? 'بحجزك لأي من خدماتنا، فإنك توافق على جميع الشروط والأحكام المذكورة أعلاه.'
                  : 'By booking any of our services, you agree to all the terms and conditions mentioned above.'
                }
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default ServicePolicy;
