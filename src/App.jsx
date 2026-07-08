import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { 
  Zap, 
  Play, 
  Volume2, 
  VolumeX, 
  Users, 
  Gift, 
  ShieldAlert, 
  CheckCircle, 
  Code, 
  MessageSquare,
  RefreshCw,
  PlusCircle,
  Skull,
  Compass,
  Key,
  BatteryCharging,
  TrendingUp,
  Cpu,
  Flame,
  Award
} from 'lucide-react';

export default function App() {
  // Live session and limits state
  const [fableWeeklyUsage, setFableWeeklyUsage] = useState(6); // starts at 6%
  const [currentSessionUsage, setCurrentSessionUsage] = useState(17); // starts at 17%
  const [maxSubscriptions, setMaxSubscriptions] = useState(1);
  const [credits, setCredits] = useState(1000);
  const [likeGoal, setLikeGoal] = useState(384);
  const [isVibeMode, setIsVibeMode] = useState(true);

  // Benchmarking states
  const [activeTab, setActiveTab] = useState('benchmarks');
  const [isRefreshingBenchmarks, setIsRefreshingBenchmarks] = useState(false);
  const [benchmarkStatus, setBenchmarkStatus] = useState('Completed');
  const [fableScores, setFableScores] = useState({
    reasoning: 96,
    refactoring: 94,
    hallucination: 92,
    speed: 88,
    safety: 35 // nerfed / safety safeguards are heavy
  });

  // Horror Game state
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [gameMessage, setGameMessage] = useState("Find the 3 Brass Keys hidden in the dark to escape. Beware of the entity...");
  const [keysFound, setKeysFound] = useState([]);
  const [flashlight, setFlashlight] = useState(100);
  const [gameState, setGameState] = useState('start'); // start, playing, caught, escaped
  const [entityDistance, setEntityDistance] = useState(100);
  const [backpack, setBackpack] = useState([]);

  // Giveaway simulator states
  const [giveawayStatus, setGiveawayStatus] = useState('idle'); // idle, picking, winner
  const [winnerName, setWinnerName] = useState('');
  const [giveawayParticipants, setGiveawayParticipants] = useState([
    'Jake', 'Ally', 'Isaac', 'Stain', 'Ally_Codes', 'ByteVibe', 'FableFan', 'LofiDev', 'ClaudeMaxGiveaway'
  ]);

  // Audio simulation context
  const audioContextRef = useRef(null);

  // Play synthetic retro-synth game sound effect
  const playSoundEffect = (type) => {
    if (!soundEnabled) return;
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'click') {
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
      } else if (type === 'key') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.25);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      } else if (type === 'battery') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      } else if (type === 'scare') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(80, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(30, ctx.currentTime + 0.8);
        
        // Add extreme high pitch noise to scare
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(2000, ctx.currentTime);
        osc2.frequency.linearRampToValueAtTime(300, ctx.currentTime + 0.8);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        gain2.gain.setValueAtTime(0.3, ctx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);

        gain.gain.setValueAtTime(0.4, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);
        
        osc.start();
        osc.stop(ctx.currentTime + 0.8);
        osc2.start();
        osc2.stop(ctx.currentTime + 0.8);
      } else if (type === 'escape') {
        // Glorious arpeggio
        [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
          const oscA = ctx.createOscillator();
          const gainA = ctx.createGain();
          oscA.connect(gainA);
          gainA.connect(ctx.destination);
          oscA.type = 'square';
          oscA.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.1);
          gainA.gain.setValueAtTime(0.1, ctx.currentTime + idx * 0.1);
          gainA.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.1 + 0.3);
          oscA.start(ctx.currentTime + idx * 0.1);
          oscA.stop(ctx.currentTime + idx * 0.1 + 0.4);
        });
      }
    } catch (e) {
      console.warn("AudioContext block or error: ", e);
    }
  };

  // Simulate usage drain over time
  useEffect(() => {
    const timer = setInterval(() => {
      if (gameState === 'playing') {
        setFlashlight(prev => {
          if (prev <= 1) {
            setGameMessage("Flashlight dead! You got lost in the dark...");
            setGameState('caught');
            playSoundEffect('scare');
            return 0;
          }
          return prev - 1;
        });

        setEntityDistance(prev => {
          if (prev <= 5) {
            setGameMessage("The entity caught you standing still!");
            setGameState('caught');
            playSoundEffect('scare');
            return 100;
          }
          return prev - 5;
        });
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [gameState]);

  const addMaxSubscription = () => {
    playSoundEffect('click');
    setMaxSubscriptions(prev => prev + 1);
    setFableWeeklyUsage(prev => Math.max(1, Math.round(prev / 2)));
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#8b5cf6', '#ec4899', '#06b6d4']
    });
  };

  const likeStream = () => {
    playSoundEffect('click');
    setLikeGoal(prev => prev + 1);
    if (likeGoal + 1 >= 700) {
      confetti({
        particleCount: 150,
        spread: 90,
        colors: ['#a78bfa', '#f472b6', '#22d3ee']
      });
    }
  };

  const startHorrorGame = () => {
    playSoundEffect('click');
    setGameState('playing');
    setKeysFound([]);
    setBackpack([]);
    setFlashlight(100);
    setEntityDistance(100);
    setGameMessage("You wake up in the abandoned kitchen. Find 3 brass keys!");
  };

  const searchRoom = (roomName) => {
    if (gameState !== 'playing') return;
    playSoundEffect('click');
    
    // Entity backs off slightly when you keep moving
    setEntityDistance(prev => Math.min(100, prev + 15));

    const chance = Math.random();
    if (chance < 0.45) {
      // Found a key!
      if (!keysFound.includes(roomName)) {
        const updated = [...keysFound, roomName];
        setKeysFound(updated);
        playSoundEffect('key');
        setGameMessage(`Found the Brass Key in the ${roomName}!`);
        
        if (updated.length === 3) {
          setGameMessage("You have all 3 keys! Head to the Escape Hatch!");
        }
      } else {
        setGameMessage(`You already searched the ${roomName}. Nothing here.`);
      }
    } else if (chance < 0.7) {
      // Found flashlight battery
      playSoundEffect('battery');
      setFlashlight(prev => Math.min(100, prev + 30));
      setGameMessage(`Found a high-capacity battery in the ${roomName}! Flashlight charged!`);
    } else {
      setGameMessage(`Searched the ${roomName} but found only dust and shadows...`);
    }
  };

  const attemptEscape = () => {
    if (gameState !== 'playing') return;
    playSoundEffect('click');
    if (keysFound.length === 3) {
      setGameState('escaped');
      playSoundEffect('escape');
      setGameMessage("AMAZING! You unlocked the door and escaped the Fable 5 Horror House!");
      confetti({
        particleCount: 200,
        spread: 100,
        origin: { y: 0.6 }
      });
    } else {
      setGameMessage(`The door is sealed tight. You need 3 keys (Current: ${keysFound.length}/3).`);
    }
  };

  const triggerGiveaway = () => {
    if (giveawayStatus === 'picking') return;
    playSoundEffect('click');
    setGiveawayStatus('picking');
    let count = 0;
    const interval = setInterval(() => {
      const tempWinner = giveawayParticipants[Math.floor(Math.random() * giveawayParticipants.length)];
      setWinnerName(tempWinner);
      count++;
      if (count > 15) {
        clearInterval(interval);
        setGiveawayStatus('winner');
        confetti({
          particleCount: 100,
          spread: 80,
          colors: ['#a78bfa', '#f472b6']
        });
      }
    }, 150);
  };

  const runBenchmarkSuite = () => {
    if (isRefreshingBenchmarks) return;
    playSoundEffect('click');
    setIsRefreshingBenchmarks(true);
    setBenchmarkStatus('Running all suites (except Security)...');
    
    setTimeout(() => {
      setIsRefreshingBenchmarks(false);
      setBenchmarkStatus('Completed & Verified');
      setFableScores({
        reasoning: 98,
        refactoring: 96,
        hallucination: 95,
        speed: 91,
        safety: 32 // safety remains heavily tuned down
      });
      confetti({
        particleCount: 50,
        spread: 45
      });
    }, 2500);
  };

  return (
    <div className="min-h-screen relative overflow-hidden pb-12">
      <div className="glow-ambient-1"></div>
      <div className="glow-ambient-2"></div>

      {/* Header Bar */}
      <header className="border-b border-subtle bg-card backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary-glow border border-primary pulse-glow">
            <Zap className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="font-display font-bold text-xl tracking-tight flex items-center gap-2">
              Bridgemind <span className="text-glow-secondary text-secondary">Fable 5</span> Hub
            </h1>
            <p className="text-xs text-text-secondary">Vibe Coding Ecosystem V2</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-border-subtle border border-border-subtle text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Live Stream Marathon Active
          </div>
          <button 
            onClick={() => setSoundEnabled(!soundEnabled)} 
            className="p-2 rounded-xl border border-border-subtle text-text-secondary hover:text-text-primary hover:border-glow transition-all"
            title="Toggle Sound Effects"
          >
            {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Main Content Dashboard Grid */}
      <div className="dashboard-grid mt-6">
        
        {/* Left Column: Stream Stats & Subscriptions */}
        <section className="col-span-12 lg:col-span-4 flex flex-col gap-6">
          
          {/* Fable 5 Telemetry */}
          <div className="glass-card flex flex-col gap-4">
            <h2 className="font-display font-semibold text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-accent" /> Fable 5 Telemetry
            </h2>
            <div className="bg-bg-dark/50 p-4 rounded-xl border border-border-subtle flex flex-col gap-4">
              {/* Weekly limit progress */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Plan Weekly Usage Limit</span>
                  <span className="font-mono text-glow-accent text-accent font-bold">{fableWeeklyUsage}%</span>
                </div>
                <div className="w-full bg-bg-dark h-3.5 rounded-full overflow-hidden border border-border-subtle p-0.5">
                  <div 
                    className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-accent to-primary" 
                    style={{ width: `${fableWeeklyUsage}%` }}
                  ></div>
                </div>
              </div>

              {/* Current session limit progress */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Current Session Usage</span>
                  <span className="font-mono text-glow-secondary text-secondary font-bold">{currentSessionUsage}%</span>
                </div>
                <div className="w-full bg-bg-dark h-3.5 rounded-full overflow-hidden border border-border-subtle p-0.5">
                  <div 
                    className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-secondary to-primary" 
                    style={{ width: `${currentSessionUsage}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs text-text-muted">
                <span>Active Subscriptions: <strong className="text-text-primary">{maxSubscriptions} Max Plan(s)</strong></span>
                <span>Remaining Cursor Credits: <strong className="text-text-primary">${credits}</strong></span>
              </div>
              <button onClick={addMaxSubscription} className="btn-glow w-full flex items-center justify-center gap-2 text-sm py-3">
                <PlusCircle className="w-4 h-4" /> Buy Another Subscription
              </button>
            </div>
          </div>

          {/* Stream Like Goal & Vibe Meter */}
          <div className="glass-card flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display font-semibold text-lg flex items-center gap-2">
                <Flame className="w-5 h-5 text-secondary animate-bounce" /> Stream Hype
              </h2>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-secondary-glow border border-secondary text-secondary">
                Goal: 700 Likes
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-bg-dark/40 p-3 rounded-xl border border-border-subtle text-center">
                <div className="text-2xl font-bold font-display text-glow-primary text-primary">{likeGoal}</div>
                <div className="text-xs text-text-secondary mt-1">Current Likes</div>
              </div>
              <div className="bg-bg-dark/40 p-3 rounded-xl border border-border-subtle text-center">
                <div className="text-2xl font-bold font-display text-glow-accent text-accent">13,248</div>
                <div className="text-xs text-text-secondary mt-1">Discord Members</div>
              </div>
            </div>

            <button onClick={likeStream} className="btn-outline w-full flex items-center justify-center gap-2 text-sm py-2">
              👍 Smash Like Button
            </button>
          </div>

        </section>

        {/* Center/Right Columns: Gaming & Benchmarking Interactive Labs */}
        <section className="col-span-12 lg:col-span-8 flex flex-col gap-6">
          
          {/* Interactive tabs */}
          <div className="flex gap-2 border-b border-subtle pb-2">
            <button 
              onClick={() => { playSoundEffect('click'); setActiveTab('benchmarks'); }} 
              className={`px-4 py-2 font-display font-semibold text-sm rounded-lg transition-all ${activeTab === 'benchmarks' ? 'bg-primary-glow text-primary border border-primary/30' : 'text-text-secondary hover:text-text-primary'}`}
            >
              Fable 5 Benchmarks
            </button>
            <button 
              onClick={() => { playSoundEffect('click'); setActiveTab('horror'); }} 
              className={`px-4 py-2 font-display font-semibold text-sm rounded-lg transition-all ${activeTab === 'horror' ? 'bg-primary-glow text-primary border border-primary/30' : 'text-text-secondary hover:text-text-primary'}`}
            >
              Bridge Horror House V2
            </button>
            <button 
              onClick={() => { playSoundEffect('click'); setActiveTab('giveaway'); }} 
              className={`px-4 py-2 font-display font-semibold text-sm rounded-lg transition-all ${activeTab === 'giveaway' ? 'bg-primary-glow text-primary border border-primary/30' : 'text-text-secondary hover:text-text-primary'}`}
            >
              Max Plan Giveaway
            </button>
          </div>

          {/* TAB CONTENT: BENCHMARKS */}
          {activeTab === 'benchmarks' && (
            <div className="glass-card flex flex-col gap-6">
              <div className="flex justify-between items-center flex-wrap gap-4">
                <div>
                  <h3 className="font-display font-bold text-xl text-glow-accent text-accent">Bridgebench V2 Analysis</h3>
                  <p className="text-sm text-text-secondary">Comparing Claude Fable 5 launch performance against June 12th baseline.</p>
                </div>
                <button 
                  onClick={runBenchmarkSuite} 
                  disabled={isRefreshingBenchmarks}
                  className="btn-glow flex items-center gap-2 text-sm"
                >
                  <RefreshCw className={`w-4 h-4 ${isRefreshingBenchmarks ? 'animate-spin' : ''}`} /> Run Benchmarks
                </button>
              </div>

              {/* Benchmark Status Banner */}
              <div className="bg-bg-dark/80 p-4 rounded-xl border border-border-subtle flex items-center justify-between text-sm">
                <span className="text-text-secondary">Current Suite Status:</span>
                <span className="font-mono text-glow-primary text-primary font-semibold flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" /> {benchmarkStatus}
                </span>
              </div>

              {/* Progress bars of benchmarks */}
              <div className="flex flex-col gap-5">
                
                {/* Reasoning */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-2 font-semibold">
                      <Cpu className="w-4 h-4 text-primary" /> Reasoning & Logic
                    </span>
                    <span className="font-mono text-primary font-bold">{fableScores.reasoning}%</span>
                  </div>
                  <div className="w-full bg-bg-dark h-2 rounded-full overflow-hidden border border-border-subtle">
                    <div className="h-full bg-primary" style={{ width: `${fableScores.reasoning}%` }}></div>
                  </div>
                </div>

                {/* Refactoring */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-2 font-semibold">
                      <Code className="w-4 h-4 text-accent" /> Refactoring Speed
                    </span>
                    <span className="font-mono text-accent font-bold">{fableScores.refactoring}%</span>
                  </div>
                  <div className="w-full bg-bg-dark h-2 rounded-full overflow-hidden border border-border-subtle">
                    <div className="h-full bg-accent" style={{ width: `${fableScores.refactoring}%` }}></div>
                  </div>
                </div>

                {/* Hallucination Mitigation */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-2 font-semibold">
                      <MessageSquare className="w-4 h-4 text-secondary" /> Hallucination Mitigation
                    </span>
                    <span className="font-mono text-secondary font-bold">{fableScores.hallucination}%</span>
                  </div>
                  <div className="w-full bg-bg-dark h-2 rounded-full overflow-hidden border border-border-subtle">
                    <div className="h-full bg-secondary" style={{ width: `${fableScores.hallucination}%` }}></div>
                  </div>
                </div>

                {/* Safety safeguards */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between text-sm text-amber-500">
                    <span className="flex items-center gap-2 font-semibold">
                      <ShieldAlert className="w-4 h-4" /> Cyber / Safety Limit Constraints
                    </span>
                    <span className="font-mono font-bold">{fableScores.safety}%</span>
                  </div>
                  <div className="w-full bg-bg-dark h-2 rounded-full overflow-hidden border border-border-subtle">
                    <div className="h-full bg-amber-500" style={{ width: `${fableScores.safety}%` }}></div>
                  </div>
                </div>

              </div>

              {/* Benchmark Summary Tip */}
              <div className="bg-primary-glow/40 p-4 rounded-xl border border-primary/20 text-sm text-text-secondary flex gap-3">
                <span className="text-xl">💡</span>
                <p>
                  <strong>Verdict:</strong> Fable 5 July 1st release has identical reasoning and raw processing profiles to the June 12th preview model, with slightly heavier alignment and cyber-security safety constraints. Hallucination scores are highly optimized.
                </p>
              </div>

            </div>
          )}

          {/* TAB CONTENT: HORROR HOUSE MINI-GAME */}
          {activeTab === 'horror' && (
            <div className="glass-card flex flex-col gap-6">
              <div>
                <h3 className="font-display font-bold text-xl text-glow-secondary text-secondary flex items-center gap-2">
                  <Skull className="w-6 h-6 animate-pulse" /> Bridge Horror House V2 Playtest
                </h3>
                <p className="text-sm text-text-secondary">Simulating Fable 5's horror prompt game mechanics inside the web UI.</p>
              </div>

              {gameState === 'start' && (
                <div className="bg-bg-dark/80 p-8 rounded-2xl border border-border-subtle text-center flex flex-col items-center gap-4">
                  <p className="max-w-md text-text-secondary text-sm">
                    "The doors sealed themselves the night he died. Three brass keys. One in the kitchen, one in the study, one in the bedroom. Do not let him catch you standing still."
                  </p>
                  <button onClick={startHorrorGame} className="btn-glow text-sm px-8 py-3">
                    Start Game Simulator
                  </button>
                </div>
              )}

              {(gameState === 'playing' || gameState === 'caught' || gameState === 'escaped') && (
                <div className="flex flex-col gap-4">
                  {/* Game Status Board */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-bg-dark/60 p-3 rounded-xl border border-border-subtle text-center">
                      <div className="text-xs text-text-secondary">Flashlight Battery</div>
                      <div className={`text-lg font-bold font-mono ${flashlight < 30 ? 'text-rose-500 animate-pulse' : 'text-glow-accent text-accent'}`}>
                        {flashlight}%
                      </div>
                    </div>
                    <div className="bg-bg-dark/60 p-3 rounded-xl border border-border-subtle text-center">
                      <div className="text-xs text-text-secondary">Brass Keys Found</div>
                      <div className="text-lg font-bold font-mono text-glow-primary text-primary">
                        {keysFound.length} / 3
                      </div>
                    </div>
                    <div className="bg-bg-dark/60 p-3 rounded-xl border border-border-subtle text-center">
                      <div className="text-xs text-text-secondary">Entity Distance</div>
                      <div className={`text-lg font-bold font-mono ${entityDistance < 30 ? 'text-rose-500 animate-ping' : 'text-text-primary'}`}>
                        {entityDistance}m
                      </div>
                    </div>
                  </div>

                  {/* Simulator Screen */}
                  <div className={`min-h-[200px] border rounded-2xl p-6 flex flex-col justify-between items-center transition-all ${
                    gameState === 'caught' ? 'bg-rose-950/20 border-rose-500/30' : 
                    gameState === 'escaped' ? 'bg-emerald-950/20 border-emerald-500/30' : 
                    'bg-bg-dark/85 border-border-subtle'
                  }`}>
                    <div className="text-center">
                      {gameState === 'caught' && <Skull className="w-12 h-12 text-rose-500 mx-auto animate-bounce mb-2" />}
                      {gameState === 'escaped' && <Award className="w-12 h-12 text-emerald-400 mx-auto animate-bounce mb-2" />}
                      <p className="font-display font-medium text-lg leading-relaxed max-w-lg mt-2">
                        {gameMessage}
                      </p>
                    </div>

                    {gameState === 'playing' && (
                      <div className="flex flex-wrap gap-2 justify-center mt-6">
                        <button onClick={() => searchRoom('Kitchen')} className="px-4 py-2 bg-bg-card hover:bg-bg-card-hover border border-border-subtle text-xs rounded-xl font-semibold hover:border-glow transition-all">
                          Search Kitchen
                        </button>
                        <button onClick={() => searchRoom('Study')} className="px-4 py-2 bg-bg-card hover:bg-bg-card-hover border border-border-subtle text-xs rounded-xl font-semibold hover:border-glow transition-all">
                          Search Study
                        </button>
                        <button onClick={() => searchRoom('Bedroom')} className="px-4 py-2 bg-bg-card hover:bg-bg-card-hover border border-border-subtle text-xs rounded-xl font-semibold hover:border-glow transition-all">
                          Search Bedroom
                        </button>
                        <button onClick={attemptEscape} className="px-4 py-2 bg-primary-glow border border-primary text-primary hover:bg-primary text-xs rounded-xl font-semibold hover:text-white transition-all">
                          Open Door Hatch
                        </button>
                      </div>
                    )}

                    {gameState !== 'playing' && (
                      <button onClick={startHorrorGame} className="btn-glow text-xs mt-4">
                        Play Again
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB CONTENT: GIVEAWAY SIMULATOR */}
          {activeTab === 'giveaway' && (
            <div className="glass-card flex flex-col gap-6">
              <div>
                <h3 className="font-display font-bold text-xl text-glow-primary text-primary flex items-center gap-2">
                  <Gift className="w-6 h-6" /> Claude Max Subscription Giveaway
                </h3>
                <p className="text-sm text-text-secondary">Simulate the stream giveaway when upgrading subscription plans.</p>
              </div>

              <div className="bg-bg-dark/85 p-6 rounded-2xl border border-border-subtle flex flex-col items-center gap-4">
                <div className="text-center">
                  <div className="text-xs text-text-secondary uppercase tracking-widest mb-1 font-semibold">Active Contenders</div>
                  <div className="flex flex-wrap justify-center gap-2 max-w-md mt-2">
                    {giveawayParticipants.map((p, idx) => (
                      <span key={idx} className="px-3 py-1 rounded-full text-xs bg-bg-dark border border-border-subtle text-text-secondary">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="min-h-[100px] flex items-center justify-center mt-4">
                  {giveawayStatus === 'idle' && (
                    <p className="text-text-muted text-sm">Winner will be revealed here...</p>
                  )}
                  {giveawayStatus === 'picking' && (
                    <div className="text-3xl font-display font-bold text-glow-accent text-accent animate-pulse">
                      {winnerName}
                    </div>
                  )}
                  {giveawayStatus === 'winner' && (
                    <div className="text-center animate-bounce">
                      <div className="text-sm text-text-secondary">🏆 Winner Decided!</div>
                      <div className="text-4xl font-display font-black text-glow-secondary text-secondary mt-1">
                        {winnerName}
                      </div>
                    </div>
                  )}
                </div>

                <button 
                  onClick={triggerGiveaway} 
                  disabled={giveawayStatus === 'picking'}
                  className="btn-glow text-sm px-6 py-3 w-full max-w-sm mt-2"
                >
                  {giveawayStatus === 'picking' ? 'Selecting Winner...' : 'Trigger Random Selection'}
                </button>
              </div>
            </div>
          )}

        </section>

      </div>
    </div>
  );
}
