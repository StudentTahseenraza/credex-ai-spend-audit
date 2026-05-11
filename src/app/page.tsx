// src/app/page.tsx
'use client';

import { useRef, useState, useEffect } from 'react';
import { MultiStepForm } from '../components/forms/MultiStepForm';
import { Button } from '../components/ui/button';
import { ChevronDown, Sparkles, Zap, Shield, TrendingUp, Clock, Users, DollarSign, Star, ThumbsUp, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

// Animated Feature Banner Component
const AnimatedFeatureBanner = () => {
  const features = [
    { icon: TrendingUp, text: "Average savings: 28%", color: "text-green-400" },
    { icon: Zap, text: "Real-time pricing data", color: "text-yellow-400" },
    { icon: Clock, text: "2-min audit", color: "text-blue-400" },
    { icon: Users, text: "Trusted by 500+ startups", color: "text-purple-400" },
    { icon: DollarSign, text: "20-40% off retail", color: "text-emerald-400" },
    { icon: Shield, text: "No credit card needed", color: "text-orange-400" },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

 useEffect(() => {
  const interval = setInterval(() => {
    setCurrentIndex((prev) => (prev + 1) % features.length);
  }, 3000);

  return () => clearInterval(interval);
}, [features.length]);

  const CurrentIcon = features[currentIndex].icon;

  return (
    <motion.div
      key={currentIndex}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.5 }}
      className="mt-6 inline-flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-full px-6 py-3 border border-white/20"
    >
      <CurrentIcon className={`w-5 h-5 ${features[currentIndex].color}`} />
      <span className="text-white font-medium">{features[currentIndex].text}</span>
      <div className="flex gap-1 ml-2">
        {features.map((_, idx) => (
          <div
            key={idx}
            className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/40'
              }`}
          />
        ))}
      </div>
    </motion.div>
  );
};



// Floating particles background
const FloatingParticles = ({ color = "white" }) => {
  const particles = Array.from({ length: 25 }, (_, i) => ({
  width: (i % 10) + 2,
  height: ((i * 3) % 10) + 2,
  top: (i * 13) % 100,
  left: (i * 17) % 100,
  delay: (i % 5) * 0.5,
  duration: 5 + (i % 10),
  opacity: 0.05 + ((i % 5) * 0.02),
}));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle, i) => (
        <div
          key={i}
          className="absolute animate-float rounded-full"
          style={{
            width: `${particle.width}px`,
            height: `${particle.height}px`,
            top: `${particle.top}%`,
            left: `${particle.left}%`,
            animationDelay: `${particle.delay}s`,
            animationDuration: `${particle.duration}s`,
            backgroundColor:
              color === "white"
                ? `rgba(255, 255, 255, ${particle.opacity})`
                : `rgba(100, 100, 255, ${particle.opacity})`,
          }}
        />
      ))}
    </div>
  );
};

// FAQ Accordion Component with Premium Styling
const FaqItem = ({ question, answer, isOpen, onClick }: {
  question: string;
  answer: string;
  isOpen: boolean;
  onClick: () => void;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="group"
    >
      <div className={`
        backdrop-blur-md rounded-2xl overflow-hidden transition-all duration-300
        ${isOpen
          ? 'bg-white/20 shadow-xl shadow-purple-500/20 border border-white/30'
          : 'bg-white/10 hover:bg-white/15 border border-white/20'
        }
      `}>
        <button
          onClick={onClick}
          className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-white/5 transition-all duration-200 group"
        >
          <span className={`font-semibold text-lg transition-colors duration-200 ${isOpen ? 'text-white' : 'text-gray-100'}`}>
            {question}
          </span>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <ChevronDown className={`w-5 h-5 transition-colors ${isOpen ? 'text-white' : 'text-gray-300 group-hover:text-white'}`} />
          </motion.div>
        </button>
        <motion.div
          initial={false}
          animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="overflow-hidden"
        >
          <div className="px-6 pb-6 text-gray-200 border-t border-white/20 pt-4 leading-relaxed">
            {answer}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default function Home() {
  const formRef = useRef<HTMLDivElement>(null);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const faqs = [
    { q: "✨ Is this really free?", a: "Yes. We help startups optimize AI spend. If we find major savings, we'll introduce you to Credex's discounted credits — completely optional." },
    { q: "🎯 How accurate is the audit?", a: "We use real-time pricing data from official vendor pages. All recommendations are backed by current pricing and updated weekly." },
    { q: "🔒 Do I need to share my email?", a: "No! See results instantly. Email only if you want to save or share the report with your team." },
    { q: "🛠️ What tools do you support?", a: "ChatGPT, Cursor, Claude, GitHub Copilot, Gemini, Anthropic API, OpenAI API, Windsurf, and more being added weekly." },
    { q: "💎 How does Credex save me money?", a: "We buy unused AI credits from enterprises and pass the savings to you — typically 20-40% off retail with same enterprise features." },
  ];

  return (
    <main className="min-h-screen">
      {/* Hero Section with Animated Banner */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] text-white">
        <FloatingParticles color="white" />

        <div className="absolute top-20 -right-32 w-96 h-96 bg-purple-600 rounded-full opacity-20 blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-20 -left-32 w-96 h-96 bg-blue-600 rounded-full opacity-20 blur-3xl animate-pulse-slow animation-delay-2000" />

        <div className="container mx-auto px-4 py-20 md:py-28 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6 border border-white/20"
            >
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-medium">AI Cost Optimization Platform</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent"
            >
              Find Hidden Savings
              <br />
              in Your AI Stack
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-xl md:text-2xl text-blue-100 mb-8 max-w-2xl mx-auto"
            >
              Most startups overpay by 30%+ on AI tools. We&apos;ll show you exactly where — and how to save.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex justify-center"
            >
              <AnimatedFeatureBanner />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex gap-4 justify-center mt-10"
            >
              <Button
                size="lg"
                onClick={scrollToForm}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-2xl shadow-purple-500/30 hover:shadow-purple-500/50 transition-all duration-300 transform hover:-translate-y-1 text-lg px-8 py-6 rounded-2xl"
              >
                Start Free Audit <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 rounded-2xl px-8 py-6 text-lg"
              >
                Watch Demo
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="flex items-center justify-center gap-6 mt-10 text-sm text-blue-200"
            >
              <span className="flex items-center gap-2">✅ No credit card required</span>
              <span className="w-1 h-1 bg-blue-300 rounded-full" />
              <span className="flex items-center gap-2">⚡ 2 minutes</span>
              <span className="w-1 h-1 bg-blue-300 rounded-full" />
              <span className="flex items-center gap-2">📊 Instant results</span>
            </motion.div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-full h-12">
            <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" fill="#667eea" fillOpacity="0.1"></path>
            <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" fill="#f0f4ff" fillOpacity="0.95"></path>
          </svg>
        </div>
      </section>

      {/* Trust Bar - Enhanced */}
      <section className="border-b border-gray-200 bg-white/90 backdrop-blur-sm py-4 sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-8">
            <p className="text-sm text-gray-500 font-medium">Trusted by founders from</p>
            <div className="flex gap-8 items-center opacity-70">
              <span className="font-bold text-gray-500 text-xl tracking-tighter">YC</span>
              <span className="font-bold text-gray-500 text-xl tracking-tighter">Techstars</span>
              <span className="font-bold text-gray-500 text-xl tracking-tighter">500 Startups</span>
            </div>
          </div>
        </div>
      </section>

      {/* FORM SECTION - Premium Gradient Background (Light & Vibrant) */}
      <section ref={formRef} className="py-20 relative overflow-hidden">
        {/* Premium gradient background for form section - Vibrant light gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#667eea] via-[#764ba2] to-[#f093fb]">
          {/* Animated gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/20 via-transparent to-white/10" />

          {/* Floating blurred orbs */}
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-20 left-10 w-80 h-80 bg-yellow-300 rounded-full mix-blend-overlay filter blur-3xl opacity-20 animate-float-slow" />
            <div className="absolute bottom-20 right-10 w-80 h-80 bg-pink-300 rounded-full mix-blend-overlay filter blur-3xl opacity-20 animate-float-slow animation-delay-2000" />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-300 rounded-full mix-blend-overlay filter blur-3xl opacity-15 animate-float-slow animation-delay-4000" />
          </div>

          {/* Subtle wave pattern */}
          <div className="absolute inset-0 opacity-30 bg-[url('data:image/svg+xml,%3Csvg%20width=%2760%27%20height=%2760%27%20viewBox=%270%200%2060%2060%27%20xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cg%20fill=%27none%27%20fill-rule=%27evenodd%27%3E%3Cg%20fill=%27%23ffffff%27%20fill-opacity=%270.03%27%3E%3Cpath%20d=%27M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%27/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]" />        </div>

        <div className="container mx-auto px-4 relative z-10">
          {/* Form Section Header */}
          <div className="text-center mb-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-4 border border-white/30"
            >
              <Star className="w-4 h-4 text-yellow-300" />
              <span className="text-sm font-medium text-white">AI Spend Calculator</span>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold text-white mb-3"
            >
              Analyze Your AI Spending
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="text-white/80 text-lg max-w-2xl mx-auto"
            >
              Enter your current AI tools and get personalized savings recommendations
            </motion.p>
          </div>

          {/* MultiStepForm with glass background */}
          <MultiStepForm />
        </div>
      </section>

      {/* FAQ SECTION - Dark Premium Gradient (Matches your screenshot) */}
      <section className="py-20 relative overflow-hidden">
        {/* Premium dark gradient background for FAQ section */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460]">
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-40 right-20 w-96 h-96 bg-purple-500 rounded-full mix-blend-screen filter blur-3xl opacity-10 animate-float-slow" />
            <div className="absolute bottom-20 left-10 w-80 h-80 bg-blue-500 rounded-full mix-blend-screen filter blur-3xl opacity-10 animate-float-slow animation-delay-2000" />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500 rounded-full mix-blend-screen filter blur-3xl opacity-5 animate-float-slow animation-delay-4000" />
          </div>

          {/* Grid pattern overlay */}
          <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml,%3Csvg%20width=%2760%27%20height=%2760%27%20viewBox=%270%200%2060%2060%27%20xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cg%20fill=%27none%27%20fill-rule=%27evenodd%27%3E%3Cg%20fill=%27%239C92AC%27%20fill-opacity=%270.05%27%3E%3Cpath%20d=%27M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%27/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]" />        </div>

        <div className="container mx-auto px-4 max-w-3xl relative z-10">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-4 border border-white/20">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-medium text-white/90">Got questions?</span>
            </div>
            <h2 className="text-4xl font-bold mb-3 text-white">
              Frequently Asked Questions
            </h2>
            <p className="text-blue-200 text-lg">
              Everything you need to know about optimizing your AI spend
            </p>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <FaqItem
                key={idx}
                question={faq.q}
                answer={faq.a}
                isOpen={openIndex === idx}
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
              />
            ))}
          </div>

          {/* Bottom CTA */}
          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-2 text-blue-200 text-sm">
              <ThumbsUp className="w-4 h-4" />
              <span>Still have questions? Contact our team</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}