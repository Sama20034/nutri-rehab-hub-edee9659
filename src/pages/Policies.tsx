import { useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, MapPin, Phone, Mail, Clock, Truck, RefreshCw, Shield, FileText, Users } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import Layout from '@/components/layout/Layout';

const Policies = () => {
  const location = useLocation();
  const { isRTL } = useLanguage();
  
  // Get policy type from path
  const pathType = location.pathname.replace('/', '') || 'privacy';

  const policies: Record<string, { title: string; titleEn: string; icon: React.ElementType; content: React.ReactNode }> = {
    refund: {
      title: 'سياسة الاسترجاع والاستبدال',
      titleEn: 'Refund & Exchange Policy',
      icon: RefreshCw,
      content: (
        <div className="space-y-6">
          <p className="text-lg leading-relaxed">
            {isRTL 
              ? 'نحرص في Alligator Fit على رضا عملائنا التام. إذا لم تكن راضيًا عن المنتج، يمكنك طلب استرجاع أو استبدال المنتج خلال 14 يومًا من تاريخ الاستلام، بشرط أن يكون المنتج في حالته الأصلية غير مستخدم وبالغلاف الأصلي.'
              : 'At Alligator Fit, we prioritize complete customer satisfaction. If you are not satisfied with the product, you can request a return or exchange within 14 days of receipt, provided the product is in its original, unused condition with original packaging.'}
          </p>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 rounded-xl bg-primary/5 border border-primary/20">
              <h3 className="font-bold text-lg mb-3 text-primary flex items-center gap-2">
                <RefreshCw className="h-5 w-5" />
                {isRTL ? 'الاستبدال' : 'Exchange'}
              </h3>
              <p className="text-muted-foreground">
                {isRTL 
                  ? 'يتم استبدال المنتج بمنتج آخر بنفس القيمة مجانًا في حال وجود عيب مصنعي.'
                  : 'The product will be exchanged for another product of the same value free of charge in case of a manufacturing defect.'}
              </p>
            </div>
            
            <div className="p-6 rounded-xl bg-accent/5 border border-accent/20">
              <h3 className="font-bold text-lg mb-3 text-accent flex items-center gap-2">
                <Shield className="h-5 w-5" />
                {isRTL ? 'الاسترجاع' : 'Refund'}
              </h3>
              <p className="text-muted-foreground">
                {isRTL 
                  ? 'يتم استرداد المبلغ بنفس طريقة الدفع الأصلية بعد فحص المنتج المسترجع والتأكد من سلامته (يتم خصم مصاريف الشحن في الحالات غير المتعلقة بعيوب الصناعة).'
                  : 'The amount will be refunded using the original payment method after inspecting the returned product and confirming its condition (shipping costs are deducted in cases not related to manufacturing defects).'}
              </p>
            </div>
          </div>
        </div>
      ),
    },
    contact: {
      title: 'اتصل بنا',
      titleEn: 'Contact Us',
      icon: Phone,
      content: (
        <div className="space-y-6">
          <p className="text-lg leading-relaxed">
            {isRTL 
              ? 'نحن هنا لمساعدتك! إذا كان لديك أي استفسار أو واجهت أي مشكلة، لا تتردد في التواصل معنا عبر القنوات التالية:'
              : 'We are here to help! If you have any questions or encounter any problems, do not hesitate to contact us through the following channels:'}
          </p>
          
          <div className="grid gap-4">
            <a href="tel:+201016111733" className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border hover:border-primary transition-colors">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Phone className="h-6 w-6 text-primary" />
              </div>
              <div>
                <span className="block font-semibold">{isRTL ? 'رقم الهاتف / واتساب' : 'Phone / WhatsApp'}</span>
                <span className="text-muted-foreground" dir="ltr">01016111733</span>
              </div>
            </a>
            
            <a href="mailto:mahmoudreagy@gmail.com" className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border hover:border-primary transition-colors">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <div>
                <span className="block font-semibold">{isRTL ? 'البريد الإلكتروني' : 'Email'}</span>
                <span className="text-muted-foreground">mahmoudreagy@gmail.com</span>
              </div>
            </a>
            
            <div className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <div>
                <span className="block font-semibold">{isRTL ? 'ساعات العمل' : 'Working Hours'}</span>
                <span className="text-muted-foreground">{isRTL ? 'يومياً من الساعة 9 صباحاً إلى الساعة 9 مساءً' : 'Daily from 9 AM to 9 PM'}</span>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    address: {
      title: 'العنوان',
      titleEn: 'Address',
      icon: MapPin,
      content: (
        <div className="space-y-6">
          <p className="text-lg leading-relaxed font-semibold">
            {isRTL ? 'مقرنا الرئيسي:' : 'Our Main Headquarters:'}
          </p>
          
          <div className="flex items-start gap-4 p-6 rounded-xl bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/20">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <MapPin className="h-7 w-7 text-primary" />
            </div>
            <div>
              <p className="text-lg text-foreground">
                {isRTL 
                  ? 'محافظة الأقصر، مدينة أرمنت، شارع مستشفى حورس، عمارة رقم ١١.'
                  : 'Luxor Governorate, Armant City, Horus Hospital Street, Building No. 11.'}
              </p>
            </div>
          </div>
        </div>
      ),
    },
    shipping: {
      title: 'سياسة الشحن والتوصيل',
      titleEn: 'Shipping & Delivery Policy',
      icon: Truck,
      content: (
        <div className="space-y-6">
          <p className="text-lg leading-relaxed">
            {isRTL 
              ? 'نقوم بتجهيز الطلبات وشحنها في أسرع وقت ممكن لضمان وصولها إليكم:'
              : 'We prepare and ship orders as quickly as possible to ensure they reach you:'}
          </p>
          
          <div className="space-y-4">
            <div className="p-5 rounded-xl bg-card border border-border">
              <h3 className="font-bold mb-2 flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                {isRTL ? 'مدة التجهيز' : 'Preparation Time'}
              </h3>
              <p className="text-muted-foreground">
                {isRTL ? 'يستغرق تجهيز الطلب من 24 إلى 48 ساعة.' : 'Order preparation takes 24 to 48 hours.'}
              </p>
            </div>
            
            <div className="p-5 rounded-xl bg-card border border-border">
              <h3 className="font-bold mb-3 flex items-center gap-2">
                <Truck className="h-5 w-5 text-primary" />
                {isRTL ? 'مدة التوصيل' : 'Delivery Time'}
              </h3>
              <div className="space-y-2 text-muted-foreground">
                <p className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary"></span>
                  {isRTL ? 'داخل الأقصر والصعيد: من 2 إلى 3 أيام عمل.' : 'Within Luxor and Upper Egypt: 2 to 3 business days.'}
                </p>
                <p className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-accent"></span>
                  {isRTL ? 'القاهرة وباقي المحافظات: من 3 إلى 5 أيام عمل.' : 'Cairo and other governorates: 3 to 5 business days.'}
                </p>
              </div>
            </div>
            
            <div className="p-5 rounded-xl bg-accent/10 border border-accent/20">
              <h3 className="font-bold mb-2 text-accent">
                {isRTL ? 'تكلفة الشحن' : 'Shipping Cost'}
              </h3>
              <p className="text-muted-foreground">
                {isRTL ? 'تقريبياً ١٠٠ جنيه حسب المحافظة.' : 'Approximately 100 EGP depending on the governorate.'}
              </p>
            </div>
          </div>
        </div>
      ),
    },
    terms: {
      title: 'الشروط والأحكام',
      titleEn: 'Terms and Conditions',
      icon: FileText,
      content: (
        <div className="space-y-6">
          <p className="text-lg leading-relaxed">
            {isRTL 
              ? 'مرحبًا بكم في alligatorfit.com. باستخدامك لهذا الموقع، فإنك توافق على الالتزام بالشروط والأحكام التالية:'
              : 'Welcome to alligatorfit.com. By using this website, you agree to abide by the following terms and conditions:'}
          </p>
          
          <div className="space-y-4">
            {[
              {
                ar: 'يجب أن تكون البيانات المقدمة أثناء الطلب (الاسم، العنوان، رقم الهاتف) دقيقة وصحيحة لضمان وصول الطلب.',
                en: 'The data provided during ordering (name, address, phone number) must be accurate to ensure order delivery.',
              },
              {
                ar: 'نحتفظ بالحق في تعديل أسعار المنتجات في أي وقت دون إشعار مسبق (لا ينطبق على الطلبات التي تم تأكيدها بالفعل).',
                en: 'We reserve the right to modify product prices at any time without prior notice (does not apply to already confirmed orders).',
              },
              {
                ar: 'جميع حقوق الملكية الفكرية للمحتوى المعروض على الموقع محفوظة لـ Alligator Fit.',
                en: 'All intellectual property rights for the content displayed on the website are reserved for Alligator Fit.',
              },
            ].map((item, index) => (
              <div key={index} className="flex gap-4 p-4 rounded-xl bg-card border border-border">
                <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary font-bold">
                  {index + 1}
                </span>
                <p className="text-muted-foreground">{isRTL ? item.ar : item.en}</p>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    about: {
      title: 'من نحن',
      titleEn: 'About Us',
      icon: Users,
      content: (
        <div className="space-y-6">
          <div className="p-6 rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
            <p className="text-lg leading-relaxed">
              {isRTL 
                ? 'نحن Alligator Fit، متجر إلكتروني مصري مقره مدينة أرمنت بالأقصر. انطلقنا بشغف لتقديم خدمة التدريب الأونلاين والمكملات الغذائية مع خطة لكل طلب عن كيفية الاستخدام بجودة عالية وأسعار تنافسية.'
                : 'We are Alligator Fit, an Egyptian online store based in Armant City, Luxor. We launched with passion to provide online training services and nutritional supplements with a usage plan for each order, offering high quality at competitive prices.'}
            </p>
          </div>
          
          <p className="text-muted-foreground leading-relaxed">
            {isRTL 
              ? 'نسعى لتوفير تجربة تسوق سهلة وممتعة لعملائنا في جميع أنحاء الجمهورية، مع الالتزام بالمصداقية وسرعة التوصيل.'
              : 'We strive to provide an easy and enjoyable shopping experience for our customers throughout Egypt, with commitment to credibility and fast delivery.'}
          </p>
        </div>
      ),
    },
    privacy: {
      title: 'سياسة الخصوصية',
      titleEn: 'Privacy Policy',
      icon: Shield,
      content: (
        <div className="space-y-6">
          <p className="text-lg leading-relaxed font-semibold text-primary">
            {isRTL ? 'خصوصية بياناتك هي أولويتنا في Alligator Fit.' : 'Your data privacy is our priority at Alligator Fit.'}
          </p>
          
          <div className="space-y-4">
            <div className="p-5 rounded-xl bg-card border border-border">
              <h3 className="font-bold mb-2 flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                {isRTL ? 'جمع البيانات' : 'Data Collection'}
              </h3>
              <p className="text-muted-foreground">
                {isRTL 
                  ? 'نقوم بجمع البيانات الأساسية اللازمة لإتمام الطلب فقط (الاسم، العنوان، الهاتف).'
                  : 'We only collect the basic data necessary to complete the order (name, address, phone).'}
              </p>
            </div>
            
            <div className="p-5 rounded-xl bg-card border border-border">
              <h3 className="font-bold mb-2 flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                {isRTL ? 'استخدام البيانات' : 'Data Usage'}
              </h3>
              <p className="text-muted-foreground">
                {isRTL 
                  ? 'نستخدم هذه البيانات لتوصيل الطلبات ولتحسين تجربتك في الموقع، ولا نقوم بمشاركتها مع أي أطراف ثالثة لأغراض تجارية.'
                  : 'We use this data to deliver orders and improve your experience on the site, and we do not share it with any third parties for commercial purposes.'}
              </p>
            </div>
            
            <div className="p-5 rounded-xl bg-primary/5 border border-primary/20">
              <h3 className="font-bold mb-2 flex items-center gap-2 text-primary">
                <Shield className="h-5 w-5" />
                {isRTL ? 'الأمان' : 'Security'}
              </h3>
              <p className="text-muted-foreground">
                {isRTL 
                  ? 'نلتزم باتخاذ كافة التدابير التقنية اللازمة لحماية بياناتك الشخصية من الوصول غير المصرح به.'
                  : 'We are committed to taking all necessary technical measures to protect your personal data from unauthorized access.'}
              </p>
            </div>
          </div>
        </div>
      ),
    },
  };

  const currentPolicy = policies[pathType] || policies.privacy;
  const PolicyIcon = currentPolicy.icon;

  return (
    <Layout>
      <section className="pt-32 pb-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                <PolicyIcon className="h-7 w-7 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gradient">
                  {isRTL ? currentPolicy.title : currentPolicy.titleEn}
                </h1>
              </div>
            </div>
            
            <div className="text-muted-foreground leading-relaxed">
              {currentPolicy.content}
            </div>

            <div className="mt-12 p-6 rounded-xl bg-card border border-border">
              <h3 className="font-semibold mb-4">
                {isRTL ? 'صفحات أخرى' : 'Other Pages'}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(policies).map(([key, policy]) => {
                  const Icon = policy.icon;
                  return (
                    <Link
                      key={key}
                      to={`/${key}`}
                      className={`flex items-center gap-2 p-3 rounded-lg text-sm transition-all ${
                        pathType === key 
                          ? 'bg-primary/10 text-primary border border-primary/20' 
                          : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                      }`}
                    >
                      <Icon className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{isRTL ? policy.title : policy.titleEn}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default Policies;
