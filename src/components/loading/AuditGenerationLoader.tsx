'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Cpu, BarChart3, TrendingDown, Zap, Brain } from 'lucide-react';

// Remove the cn import if not used, or keep it
// import { cn } from '@/lib/utils';

interface LoadingStage {
  id: number;
  title: string;
  icon: React.ReactNode;
  insights: string[];
}

const loadingStages: LoadingStage[] = [
  {
    id: 1,
    title: "Analyzing your AI infrastructure...",
    icon: <Cpu className="h-5 w-5 text-white" />,
    insights: [
      "Scanning 8+ AI providers",
      "Mapping subscription patterns",
      "Identifying active users"
    ]
  },
  {
    id: 2,
    title: "Comparing pricing across providers...",
    icon: <BarChart3 className="h-5 w-5 text-white" />,
    insights: [
      "Real-time price verification",
      "Contract value analysis",
      "Discount opportunity detection"
    ]
  },
  {
    id: 3,
    title: "Detecting redundant subscriptions...",
    icon: <Zap className="h-5 w-5 text-white" />,
    insights: [
      "Analyzing tool overlap",
      "Usage pattern correlation",
      "Feature duplication detection"
    ]
  },
  {
    id: 4,
    title: "Calculating optimization opportunities...",
    icon: <TrendingDown className="h-5 w-5 text-white" />,
    insights: [
      "Seat utilization modeling",
      "Plan efficiency scoring",
      "Savings projection"
    ]
  },
  {
    id: 5,
    title: "Generating executive audit summary...",
    icon: <Brain className="h-5 w-5 text-white" />,
    insights: [
      "AI-powered recommendations",
      "Benchmark comparison",
      "Strategic insights"
    ]
  },
  {
    id: 6,
    title: "Building your dashboard...",
    icon: <Sparkles className="h-5 w-5 text-white" />,
    insights: [
      "Preparing visualizations",
      "Finalizing recommendations",
      "Ready in a moment"
    ]
  }
];

interface AuditGenerationLoaderProps {
  onComplete?: () => void;
}

export function AuditGenerationLoader({ onComplete }: AuditGenerationLoaderProps) {
  const [currentStage, setCurrentStage] = useState(0);
  const [progress, setProgress] = useState(0);
  const [currentInsight, setCurrentInsight] = useState(0);

  useEffect(() => {
    const stageDuration = 2000;
    
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + 2;
        if (newProgress >= 100) {
          clearInterval(interval);
          setTimeout(() => onComplete?.(), 500);
          return 100;
        }
        return newProgress;
      });
    }, 60);

    const stageInterval = setInterval(() => {
      setCurrentStage(prev => {
        if (prev < loadingStages.length - 1) {
          return prev + 1;
        }
        clearInterval(stageInterval);
        return prev;
      });
    }, stageDuration);

    const insightInterval = setInterval(() => {
      setCurrentInsight(prev => (prev + 1) % 3);
    }, 800);

    return () => {
      clearInterval(interval);
      clearInterval(stageInterval);
      clearInterval(insightInterval);
    };
  }, [onComplete]);

  const currentStageData = loadingStages[currentStage];

  return (
    <div className="min-h-[500px] flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-md w-full mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative bg-white rounded-2xl border border-gray-200 p-8 shadow-xl"
        >
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between text-xs text-gray-500 mb-2">
              <span>Analyzing your AI stack</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>
          </div>

          {/* Current Stage */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStage}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-center"
            >
              {/* Animated Icon */}
              <div className="relative inline-flex mb-4">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-xl opacity-30 animate-pulse" />
                <div className="relative bg-gradient-to-r from-blue-500 to-purple-500 rounded-full p-3">
                  {currentStageData?.icon}
                </div>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {currentStageData?.title}
              </h3>

              {/* Rotating Insights */}
              <div className="h-12">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={currentInsight}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="text-sm text-gray-500"
                  >
                    {currentStageData?.insights[currentInsight]}
                  </motion.p>
                </AnimatePresence>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Stage Dots */}
          <div className="flex justify-center gap-2 mt-8">
            {loadingStages.map((stage, idx) => (
              <motion.div
                key={stage.id}
                className={`h-1.5 rounded-full transition-all ${
                  idx <= currentStage ? 'bg-blue-500' : 'bg-gray-200'
                }`}
                style={{ width: idx === currentStage ? 16 : 6 }}
                animate={{
                  width: idx === currentStage ? 16 : 6,
                }}
              />
            ))}
          </div>

          {/* Fake Live Calculations */}
          <div className="mt-6 pt-4 border-t border-gray-100">
            <div className="flex justify-between text-xs text-gray-400 font-mono">
              <span>Processing: {Math.floor(Math.random() * 1000)} subscriptions</span>
              <span>Latency: {Math.floor(Math.random() * 50 + 20)}ms</span>
            </div>
          </div>
        </motion.div>

        {/* Floating particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-blue-400/20 rounded-full"
              initial={{
                x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
                y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
              }}
              animate={{
                y: [null, -30, 30, -30],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: Math.random() * 3 + 2,
                repeat: Infinity,
                delay: Math.random() * 5,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}