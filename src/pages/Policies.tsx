import { useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import Layout from '@/components/layout/Layout';

const Policies = () => {
  const location = useLocation();
  const { isRTL } = useLanguage();
  
  // Get policy type from path
  const pathType = location.pathname.replace('/', '') || 'privacy';

  const policies: Record<string, { title: string; content: string[] }> = {
    privacy: {
      title: isRTL ? 'سياسة الخصوصية' : 'Privacy Policy',
      content: isRTL ? [
        'نحن في NutriRehab نلتزم بحماية خصوصيتك وأمان بياناتك الشخصية.',
        '1. جمع المعلومات: نجمع فقط المعلومات الضرورية لتقديم خدماتنا، بما في ذلك الاسم والبريد الإلكتروني ورقم الهاتف والمعلومات الصحية ذات الصلة.',
        '2. استخدام المعلومات: نستخدم معلوماتك فقط لتقديم خدماتنا وتحسين تجربتك معنا.',
        '3. مشاركة المعلومات: لا نشارك معلوماتك مع أي طرف ثالث إلا بموافقتك أو عند الضرورة القانونية.',
        '4. أمان البيانات: نستخدم أحدث تقنيات التشفير والأمان لحماية بياناتك.',
        '5. حقوقك: لديك الحق في الوصول إلى بياناتك وتعديلها وحذفها في أي وقت.',
      ] : [
        'At NutriRehab, we are committed to protecting your privacy and the security of your personal data.',
        '1. Information Collection: We only collect information necessary to provide our services, including name, email, phone number, and relevant health information.',
        '2. Use of Information: We use your information only to provide our services and improve your experience with us.',
        '3. Information Sharing: We do not share your information with any third party without your consent or legal requirement.',
        '4. Data Security: We use the latest encryption and security technologies to protect your data.',
        '5. Your Rights: You have the right to access, modify, and delete your data at any time.',
      ],
    },
    terms: {
      title: isRTL ? 'شروط الاستخدام' : 'Terms of Service',
      content: isRTL ? [
        'باستخدام منصة NutriRehab، فإنك توافق على الشروط والأحكام التالية:',
        '1. الأهلية: يجب أن يكون عمرك 18 عاماً أو أكثر لاستخدام خدماتنا.',
        '2. الحساب: أنت مسؤول عن الحفاظ على سرية حسابك وكلمة المرور.',
        '3. الخدمات: خدماتنا استشارية وتثقيفية ولا تحل محل الرعاية الطبية المباشرة.',
        '4. الدفع: جميع المدفوعات غير قابلة للاسترداد إلا وفقاً لسياسة الاسترداد الخاصة بنا.',
        '5. المحتوى: جميع المحتوى على المنصة محمي بحقوق الملكية الفكرية.',
        '6. إنهاء الخدمة: نحتفظ بحق إنهاء أو تعليق حسابك في حالة انتهاك هذه الشروط.',
      ] : [
        'By using the NutriRehab platform, you agree to the following terms and conditions:',
        '1. Eligibility: You must be 18 years or older to use our services.',
        '2. Account: You are responsible for maintaining the confidentiality of your account and password.',
        '3. Services: Our services are consultative and educational and do not replace direct medical care.',
        '4. Payment: All payments are non-refundable except according to our refund policy.',
        '5. Content: All content on the platform is protected by intellectual property rights.',
        '6. Service Termination: We reserve the right to terminate or suspend your account for violating these terms.',
      ],
    },
    refund: {
      title: isRTL ? 'سياسة الاسترداد' : 'Refund Policy',
      content: isRTL ? [
        'سياسة الاسترداد في NutriRehab:',
        '1. الإلغاء قبل الجلسة: يمكنك إلغاء موعدك واسترداد المبلغ كاملاً إذا تم الإلغاء قبل 24 ساعة من موعد الجلسة.',
        '2. الإلغاء المتأخر: في حالة الإلغاء خلال 24 ساعة من الموعد، سيتم خصم 50% من قيمة الجلسة.',
        '3. عدم الحضور: في حالة عدم الحضور بدون إخطار مسبق، لن يتم استرداد أي مبلغ.',
        '4. البرامج الشهرية: يمكن استرداد قيمة البرنامج خلال أول 7 أيام فقط إذا لم يتم حضور أي جلسة.',
        '5. طريقة الاسترداد: سيتم إعادة المبلغ خلال 5-10 أيام عمل إلى نفس وسيلة الدفع المستخدمة.',
      ] : [
        'NutriRehab Refund Policy:',
        '1. Pre-Session Cancellation: You can cancel your appointment and receive a full refund if cancelled 24 hours before the session.',
        '2. Late Cancellation: Cancellations within 24 hours of the appointment will result in a 50% charge.',
        '3. No-Show: In case of no-show without prior notice, no refund will be issued.',
        '4. Monthly Programs: Program refunds are available within the first 7 days only if no sessions have been attended.',
        '5. Refund Method: Refunds will be processed within 5-10 business days to the same payment method used.',
      ],
    },
  };
  const currentPolicy = policies[pathType] || policies.privacy;

  return (
    <Layout>
      <section className="pt-32 pb-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl mx-auto"
          >
            <h1 className="text-4xl font-bold mb-8 text-gradient">{currentPolicy.title}</h1>
            
            <div className="space-y-6 text-muted-foreground leading-relaxed">
              {currentPolicy.content.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>

            <div className="mt-12 p-6 rounded-xl bg-card border border-border">
              <h3 className="font-semibold mb-4">
                {isRTL ? 'سياسات أخرى' : 'Other Policies'}
              </h3>
              <div className="flex flex-wrap gap-4">
                {Object.entries(policies).map(([key, policy]) => (
                  <Link
                    key={key}
                    to={`/${key}`}
                    className={`flex items-center gap-2 text-sm ${
                      pathType === key ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                    } transition-colors`}
                  >
                    {policy.title}
                    <ArrowRight className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default Policies;
