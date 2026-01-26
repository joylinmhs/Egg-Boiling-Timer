import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Progress } from '@/app/components/ui/progress';
import { Play, Pause, RotateCcw, Clock } from 'lucide-react';

type EggType = 'soft' | 'medium' | 'hard';

const EGG_TIMES = {
  soft: { minutes: 6, label: 'Soft Boiled', description: 'Runny yolk, soft white', color: 'from-yellow-400 to-orange-400', emoji: '🍳' },
  medium: { minutes: 9, label: 'Medium Boiled', description: 'Jammy yolk, firm white', color: 'from-orange-400 to-amber-500', emoji: '🥚' },
  hard: { minutes: 12, label: 'Hard Boiled', description: 'Fully cooked yolk', color: 'from-amber-500 to-yellow-600', emoji: '🔥' }
};

export function EggTimer() {
  const [selectedType, setSelectedType] = useState<EggType>('medium');
  const [timeLeft, setTimeLeft] = useState(EGG_TIMES.medium.minutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const totalTime = EGG_TIMES[selectedType].minutes * 60;
  const progress = ((totalTime - timeLeft) / totalTime) * 100;

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            setIsComplete(true);
            // Play notification sound
            playNotification();
            // Show browser notification
            showNotification();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const playNotification = () => {
    // Create a simple beep sound using Web Audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  };

  const showNotification = () => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Egg Timer Complete! 🥚', {
        body: `Your ${EGG_TIMES[selectedType].label.toLowerCase()} egg is ready!`,
        icon: '🥚'
      });
    }
  };

  useEffect(() => {
    // Request notification permission on mount
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const handleStart = () => {
    if (isComplete) {
      handleReset();
    }
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setIsComplete(false);
    setTimeLeft(EGG_TIMES[selectedType].minutes * 60);
  };

  const handleTypeChange = (type: EggType) => {
    setSelectedType(type);
    setTimeLeft(EGG_TIMES[type].minutes * 60);
    setIsRunning(false);
    setIsComplete(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative">
      {/* Decorative background blobs */}
      <div className="absolute -top-20 -left-20 w-40 h-40 bg-gradient-to-br from-yellow-300/30 to-orange-300/30 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-gradient-to-br from-amber-300/30 to-yellow-300/30 rounded-full blur-3xl"></div>
      
      <Card className="w-full max-w-2xl shadow-2xl border-0 overflow-hidden relative backdrop-blur-sm bg-white/90">
        {/* Gradient header background */}
        <div className={`absolute top-0 left-0 right-0 h-24 bg-gradient-to-br ${EGG_TIMES[selectedType].color} opacity-10 transition-all duration-500`}></div>
        
        <CardHeader className="text-center relative z-10 pb-1 pt-3">
          <div className="relative inline-block">
            <div className={`text-5xl mb-0 transition-transform duration-300 ${isRunning ? 'animate-bounce' : ''} ${isComplete ? 'scale-125' : ''}`}>
              {isComplete ? '✨' : EGG_TIMES[selectedType].emoji}
            </div>
            {isRunning && (
              <div className="absolute -top-2 -right-2 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-orange-500"></span>
              </div>
            )}
          </div>
          <CardTitle className="text-xl bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
            Egg Timer
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-3 relative z-10 px-8 pb-4">
          {/* Egg Type Selection */}
          <div className="grid grid-cols-3 gap-3">
            {(Object.keys(EGG_TIMES) as EggType[]).map((type) => (
              <button
                key={type}
                onClick={() => handleTypeChange(type)}
                disabled={isRunning}
                className={`
                  relative overflow-hidden rounded-xl p-4 transition-all duration-300 
                  ${selectedType === type 
                    ? `bg-gradient-to-br ${EGG_TIMES[type].color} text-white shadow-lg scale-105` 
                    : 'bg-gradient-to-br from-gray-50 to-gray-100 text-gray-700 hover:shadow-md hover:scale-102'
                  }
                  ${isRunning ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  disabled:opacity-50
                `}
              >
                <div className="flex flex-col items-center gap-1">
                  <span className="text-2xl">{EGG_TIMES[type].emoji}</span>
                  <span className="text-xs font-semibold">{EGG_TIMES[type].label.split(' ')[0]}</span>
                  <span className="text-[10px] opacity-80">{EGG_TIMES[type].minutes}m</span>
                </div>
                {selectedType === type && (
                  <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                )}
              </button>
            ))}
          </div>

          {/* Timer Display */}
          <div className="text-center space-y-1 py-2">
            <div className="relative inline-block">
              {/* Circular progress background */}
              <svg className="w-56 h-56 transform -rotate-90" viewBox="0 0 120 120">
                {/* Background circle */}
                <circle
                  cx="60"
                  cy="60"
                  r="54"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="6"
                  className="text-gray-100"
                />
                {/* Progress circle */}
                <circle
                  cx="60"
                  cy="60"
                  r="54"
                  fill="none"
                  stroke="url(#gradient)"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 54}`}
                  strokeDashoffset={`${2 * Math.PI * 54 * (1 - progress / 100)}`}
                  className="transition-all duration-300"
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" className="text-orange-400" stopColor="currentColor" />
                    <stop offset="100%" className="text-amber-500" stopColor="currentColor" />
                  </linearGradient>
                </defs>
              </svg>
              
              {/* Timer text in center */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className={`text-5xl font-bold bg-gradient-to-br ${EGG_TIMES[selectedType].color} bg-clip-text text-transparent transition-all duration-300 ${isRunning ? 'scale-110' : ''}`}>
                  {formatTime(timeLeft)}
                </div>
                {isComplete && (
                  <div className="text-sm text-green-600 font-semibold animate-pulse mt-1">
                    Ready! 🎉
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              <span>{EGG_TIMES[selectedType].description}</span>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={handleStart}
              size="lg"
              className={`flex-1 text-base py-5 rounded-xl shadow-lg transition-all duration-300 ${
                isComplete 
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700' 
                  : isRunning 
                  ? 'bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700'
                  : 'bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700'
              }`}
            >
              {isComplete ? (
                <>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  New
                </>
              ) : isRunning ? (
                <>
                  <Pause className="mr-2 h-4 w-4" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Start
                </>
              )}
            </Button>
            <Button
              onClick={handleReset}
              size="lg"
              variant="outline"
              disabled={!isRunning && !isComplete && timeLeft === totalTime}
              className="px-5 py-5 rounded-xl border-2 hover:bg-gray-50 transition-all duration-300"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>

          {/* Fun fact or tip */}
          <div className="text-center text-[10px] text-muted-foreground bg-gradient-to-r from-orange-50 to-yellow-50 p-2 rounded-lg">
            💡 <span className="font-medium">Tip:</span> Start with cold water!
          </div>
        </CardContent>
      </Card>
    </div>
  );
}