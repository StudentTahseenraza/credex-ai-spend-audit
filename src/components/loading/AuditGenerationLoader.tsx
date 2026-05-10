'use client';

import { useEffect, useState} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Cpu, BarChart3, TrendingDown, Zap, Brain } from 'lucide-react';

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
  const [randomNumbers, setRandomNumbers] = useState({ subscriptions: 0, latency: 0 });
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; duration: number; delay: number }>>([]);

  useEffect(() => {
  const initializeLoader = async () => {
    setRandomNumbers({
      subscriptions: Math.floor(Math.random() * 1000),
      latency: Math.floor(Math.random() * 50 + 20),
    });

    const generatedParticles = Array.from(
      { length: 20 },
      (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        duration: Math.random() * 3 + 2,
        delay: Math.random() * 5,
      })
    );

    setParticles(generatedParticles);
  };

  void initializeLoader();
}, []);

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
        return prev;
      });
    }, stageDuration);

    const insightInterval = setInterval(() => {
      setCurrentInsight(prev => (prev + 1) % 3);
    }, 800);

    // Cleanup stage interval after last stage
    const lastStageTimeout = setTimeout(() => {
      clearInterval(stageInterval);
    }, stageDuration * loadingStages.length);

    return () => {
      clearInterval(interval);
      clearInterval(stageInterval);
      clearInterval(insightInterval);
      clearTimeout(lastStageTimeout);
    };
  }, [onComplete]);

  const currentStageData = loadingStages[currentStage];

  return (
    <div className="min-h-[500px] flex items-center justify-center bg-gradient-to-br from-gray-50 to-white relative overflow-hidden">
      {/* Static Particles - No random during render */}
      <div className="absolute inset-0 pointer-events-none">
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute w-1 h-1 bg-blue-400/20 rounded-full"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
            }}
            animate={{
              y: [0, -30, 30, 0],
              opacity: [0, 0.5, 0.5, 0],
            }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              delay: particle.delay,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <div className="max-w-md w-full mx-auto px-4 relative z-10">
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
                animate={{
                  width: idx === currentStage ? 16 : 6,
                }}
                transition={{ duration: 0.3 }}
              />
            ))}
          </div>

          {/* Static Live Calculations - No random during render */}
          <div className="mt-6 pt-4 border-t border-gray-100">
            <div className="flex justify-between text-xs text-gray-400 font-mono">
              <span>Processing: {randomNumbers.subscriptions || 0} subscriptions</span>
              <span>Latency: {randomNumbers.latency || 0}ms</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}