import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle } from 'lucide-react';

const faqsData = [
  {
    category: 'सामान्य',
    questions: [
      {
        q: 'NAGRIK NEWS क्या है?',
        a: 'NAGRIK NEWS एक AI-संचालित समाचार प्लेटफॉर्म है जो आपको सबसे ताज़ी और महत्वपूर्ण खबरें देता है। हमारा AI स्वचालित रूप से समाचार सारांश और विश्लेषण तैयार करता है।'
      },
      {
        q: 'क्या NAGRIK NEWS का उपयोग मुफ्त है?',
        a: 'हाँ! NAGRIK NEWS पूरी तरह से मुफ्त है। आप बिना किसी सदस्यता के सभी समाचार पढ़ सकते हैं।'
      },
      {
        q: 'मैं NAGRIK NEWS पर न्यूज़ कैसे पढ़ूं?',
        a: 'बस होम पेज खोलें, सभी नवीनतम समाचार देखें और किसी भी समाचार पर क्लिक करें विवरण पढ़ने के लिए।'
      }
    ]
  },
  {
    category: 'खाता और लॉगिन',
    questions: [
      {
        q: 'क्या मुझे खाता बनाना आवश्यक है?',
        a: 'नहीं, आप बिना खाता बनाए समाचार पढ़ सकते हैं। लेकिन खाता बनाने से आप अपनी पसंदीदा समाचार सहेज सकते हैं।'
      },
      {
        q: 'मैं अपना पासवर्ड कैसे रीसेट करूं?',
        a: 'लॉगिन पेज पर "पासवर्ड भूल गए?" विकल्प पर क्लिक करें और अपना ईमेल दर्ज करें। आपको पासवर्ड रीसेट करने के लिए एक लिंक मिल जाएगा।'
      },
      {
        q: 'क्या मेरे खाते की जानकारी सुरक्षित है?',
        a: 'हाँ, हम आपकी सभी जानकारी एन्क्रिप्ट करते हैं। आप हमें पूरी तरह विश्वास कर सकते हैं।'
      }
    ]
  },
  {
    category: 'समाचार और सामग्री',
    questions: [
      {
        q: 'समाचार कितनी बार अपडेट होते हैं?',
        a: 'हमारे समाचार 24/7 अपडेट होते हैं। नई खबर आते ही आप उसे देख सकते हैं।'
      },
      {
        q: 'क्या मैं समाचार साझा कर सकता हूं?',
        a: 'हाँ! हर समाचार के नीचे शेयर बटन है। आप इसे सोशल मीडिया पर शेयर कर सकते हैं।'
      },
      {
        q: 'एडिटर पैनल क्या है?',
        a: 'एडिटर पैनल केवल मंजूरी प्राप्त संपादकों के लिए है। यहाँ वे नई खबरें जोड़ सकते हैं और मौजूदा खबरों को संपादित कर सकते हैं।'
      }
    ]
  },
  {
    category: 'तकनीकी समर्थन',
    questions: [
      {
        q: 'अगर साइट काम नहीं कर रही है तो क्या करूं?',
        a: 'पहले अपने ब्राउज़र को रीलोड करें। अगर समस्या बनी रहे तो हमें फीडबैक भेजें।'
      },
      {
        q: 'कौन से ब्राउज़र सबसे अच्छे काम करते हैं?',
        a: 'Chrome, Firefox, Safari और Edge - सभी काम करते हैं। सबसे अच्छे अनुभव के लिए नवीनतम संस्करण का उपयोग करें।'
      },
      {
        q: 'क्या NAGRIK NEWS मोबाइल पर काम करता है?',
        a: 'हाँ! NAGRIK NEWS पूरी तरह से मोबाइल-अनुकूल है। आप अपने फोन पर भी समाचार पढ़ सकते हैं।'
      }
    ]
  }
];

export default function FAQs() {
  const [expanded, setExpanded] = useState({});

  const toggleExpand = (id) => {
    setExpanded(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen py-12 px-4"
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-6">
            <HelpCircle className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-4">
            अक्सर पूछे जाने वाले प्रश्न (FAQs)
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            NAGRIK NEWS के बारे में आपके सवालों के जवाब यहां मिलेंगे
          </p>
        </motion.div>

        {/* FAQs by Category */}
        <div className="space-y-12">
          {faqsData.map((category, catIdx) => (
            <motion.div
              key={catIdx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: catIdx * 0.1 }}
            >
              {/* Category Title */}
              <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30">
                  {catIdx + 1}
                </span>
                {category.category}
              </h2>

              {/* Questions */}
              <div className="space-y-3">
                {category.questions.map((item, qIdx) => {
                  const itemId = `${catIdx}-${qIdx}`;

                  return (
                    <motion.div
                      key={itemId}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: catIdx * 0.1 + qIdx * 0.05 }}
                      className="rounded-2xl border-2 border-gray-200 dark:border-gray-700 hover:border-red-400 dark:hover:border-red-500 transition-all overflow-hidden"
                    >
                      <button
                        onClick={() => toggleExpand(itemId)}
                        className="w-full px-6 py-4 flex items-center justify-between bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all"
                      >
                        <span className="text-left font-bold text-gray-900 dark:text-white text-lg">
                          {item.q}
                        </span>
                        <motion.div
                          animate={{ rotate: expanded[itemId] ? 180 : 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <ChevronDown className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0" />
                        </motion.div>
                      </button>

                      {/* Answer */}
                      <AnimatePresence>
                        {expanded[itemId] && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="bg-gradient-to-b from-gray-50 to-white dark:from-gray-700/50 dark:to-gray-800 border-t-2 border-gray-200 dark:border-gray-700"
                          >
                            <p className="px-6 py-4 text-gray-700 dark:text-gray-300 leading-relaxed text-base">
                              {item.a}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Help Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-16 p-8 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 border-2 border-blue-200 dark:border-blue-700 text-center"
        >
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            और सवाल हैं?
          </h3>
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            हम आपकी मदद के लिए तैयार हैं। अपना फीडबैक भेजें या हमसे संपर्क करें।
          </p>
          <button onClick={() => window.location.href = 'mailto:karantiwari062@gmail.com'} className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg">
            हमसे संपर्क करें
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
}
