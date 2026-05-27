import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, Text, TouchableOpacity, Pressable, Image, ScrollView, StatusBar, Dimensions, TextInput, Animated, Modal } from 'react-native';
import ResponsiveModal from './src/components/ResponsiveModal';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { GameProvider, useGame } from './src/context/GameContext';
import './imports';
import { JOBS } from './src/data/jobs';
import { EDUCATION } from './src/data/education';
import { STOCKS } from './src/data/stocks';
import { MUTUAL_FUNDS } from './src/data/mutualFunds';
import { RESIDENTIAL_PROPERTIES, COMMERCIAL_PROPERTIES } from './src/data/realEstate';

// Combine both arrays for display
const REAL_ESTATE = [...RESIDENTIAL_PROPERTIES, ...COMMERCIAL_PROPERTIES];
import { FontAwesome5, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { styled } from 'nativewind';
import { useBackgroundMusic } from './src/hooks/useBackgroundMusic';
import SpriteSelectionScreen from './src/components/SpriteSelectionScreen';
import LegacyScreen from './src/components/LegacyScreen';
import FamilyScreen from './src/screens/FamilyScreen';
import HomeScreen from './src/screens/HomeScreen';
import CareersScreen from './src/screens/CareersScreen';
import EducationScreen from './src/screens/EducationScreen';
import InsuranceScreen from './src/screens/InsuranceScreen';
import BankScreen from './src/screens/BankScreen';
import ShopScreen from './src/screens/ShopScreen';
import GoalsScreen from './src/screens/GoalsScreen';
import ChoiceDialog from './src/components/ChoiceDialog';
import BirthdayDialog from './src/components/BirthdayDialog';
import FinancialTip, { FINANCIAL_TIPS } from './src/components/FinancialTip';
import PixelDialog from './src/components/PixelDialog';
import BottomTabBar from './src/components/BottomTabBar';
import MonthSummaryCard from './src/components/MonthSummaryCard';
import DailyLimitScreen from './src/components/DailyLimitScreen';
import BirthdayCelebrationRoom from './src/components/BirthdayCelebrationRoom';
import CrisisSimulator from './src/components/CrisisSimulator';
import CRTOverlay from './src/components/CRTOverlay';
import Vignette from './src/components/Vignette';
import InterviewModal from './src/components/InterviewModal';
import LoadingScreen from './src/components/LoadingScreen';
import { getSpriteImage } from './src/data/spriteMap';
import { useFonts, VT323_400Regular } from '@expo-google-fonts/vt323';
import { PressStart2P_400Regular } from '@expo-google-fonts/press-start-2p';
import AsyncStorage from '@react-native-async-storage/async-storage';

const StyledView = styled(View);
const RawStyledText = styled(Text);
const StyledText = React.forwardRef(({ style, className, ...props }, ref) => (
  <RawStyledText ref={ref} style={[{ fontFamily: 'VT323_400Regular' }, style]} className={className} {...props} />
));
const StyledImage = styled(Image);
const StyledTouchableOpacity = styled(TouchableOpacity);
// ===== GAME HUD BAR (clean thin style) =====
const HudBar = ({ label, value, max, color, icon, format }) => {
  const pct = max > 0 ? Math.min(value / max, 1) : 0;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 5 }}>
      <FontAwesome5 name={icon} size={12} color="#445070" style={{ width: 16, textAlign: 'center' }} />
      <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: '#6070a0', width: 90, lineHeight: 16 }} numberOfLines={1}>{label}</Text>
      <View style={{ flex: 1, height: 6, backgroundColor: '#151c30', borderRadius: 3, overflow: 'hidden', borderWidth: 0.5, borderColor: '#1e2840' }}>
        <View style={{ height: '100%', width: `${pct * 100}%`, backgroundColor: color, borderRadius: 3 }} />
      </View>
      <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: '#556080', width: 52, textAlign: 'right', lineHeight: 16 }}>{format || value}</Text>
    </View>
  );
};

// --- Floating Money Indicator + Coin Burst ---
const BURST_PARTICLES = 6;
const BURST_ANGLES = [0, 52, 104, 156, 208, 310];

const FloatingMoneyIndicator = ({ flow }) => {
  const fadeAnim  = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const particles = useRef(
    Array.from({ length: BURST_PARTICLES }, () => ({
      x: new Animated.Value(0),
      y: new Animated.Value(0),
      o: new Animated.Value(1),
    }))
  ).current;

  useEffect(() => {
    fadeAnim.setValue(1);
    slideAnim.setValue(0);
    particles.forEach(p => { p.x.setValue(0); p.y.setValue(0); p.o.setValue(1); });
    const burstAnims = particles.map((p, i) => {
      const angle = (BURST_ANGLES[i] * Math.PI) / 180;
      const dist  = 28 + Math.random() * 22;
      return Animated.parallel([
        Animated.timing(p.x, { toValue: Math.cos(angle) * dist, duration: 700, useNativeDriver: true }),
        Animated.timing(p.y, { toValue: Math.sin(angle) * dist - 20, duration: 700, useNativeDriver: true }),
        Animated.timing(p.o, { toValue: 0, duration: 700, useNativeDriver: true }),
      ]);
    });
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 0, duration: 2000, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: -52, duration: 2000, useNativeDriver: true }),
      ...burstAnims,
    ]).start();
  }, []);

  const isPositive = flow.amount >= 0;
  const particleColor = isPositive ? '#fbbf24' : '#f87171';

  return (
    <View style={{ position: 'absolute', top: 60, alignSelf: 'center', zIndex: 50, alignItems: 'center' }} pointerEvents="none">
      {/* Coin burst particles */}
      {particles.map((p, i) => (
        <Animated.View
          key={i}
          style={{
            position: 'absolute',
            width: 5, height: 5,
            backgroundColor: particleColor,
            opacity: p.o,
            transform: [{ translateX: p.x }, { translateY: p.y }],
          }}
        />
      ))}
      {/* Amount text */}
      <Animated.Text style={{
        fontFamily: 'VT323_400Regular',
        fontSize: 28,
        color: isPositive ? '#4ADE80' : '#F87171',
        textShadowColor: '#000', textShadowOffset: { width: 2, height: 2 }, textShadowRadius: 0,
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
      }}>
        {isPositive ? '+' : ''}₹{Math.abs(flow.amount).toLocaleString()}
      </Animated.Text>
    </View>
  );
};

// --- Speed Control Buttons (compact clean style) ---
const SpeedControls = ({ isPlaying, setIsPlaying, gameSpeed, setGameSpeed }) => {
  const speeds = [
    { speed: 0, icon: 'pause', label: '⏸' },
    { speed: 1, icon: 'play', label: '▶' },
    { speed: 2, icon: 'forward', label: '⏩' },
    { speed: 3, icon: 'forward', label: '⏭' },
  ];
  const currentSpeed = isPlaying ? gameSpeed : 0;

  return (
    <View style={{ flexDirection: 'row', gap: 4, alignItems: 'center', backgroundColor: 'rgba(13,16,32,0.9)', borderRadius: 8, padding: 3, borderWidth: 1, borderColor: '#2a3560' }}>
      {speeds.map(s => (
        <Pressable
          key={s.speed}
          onPress={() => {
            if (s.speed === 0) { setIsPlaying(false); }
            else { setGameSpeed(s.speed); setIsPlaying(true); }
          }}
          style={({ pressed }) => ({
            width: 28, height: 28, alignItems: 'center', justifyContent: 'center',
            backgroundColor: currentSpeed === s.speed ? (s.speed === 0 ? 'rgba(251,191,36,0.15)' : '#1a2040') : 'transparent',
            borderRadius: 6,
            transform: [{ translateY: pressed ? 1 : 0 }],
          })}
        >
          <Text style={{
            fontFamily: 'VT323_400Regular',
            fontSize: 15, fontWeight: 'bold',
            color: currentSpeed === s.speed ? (s.speed === 0 ? '#FBBF24' : '#c0d0f0') : '#8090c0',
          }}>{s.label}</Text>
        </Pressable>
      ))}
    </View>
  );
};

// --- Pixel sparkline mini-chart ---
const MiniChart = ({ history, height = 28, width = 80 }) => {
  if (!history || history.length < 2) return null;
  const min = Math.min(...history);
  const max = Math.max(...history);
  const range = max - min || 1;
  const pts = history.map((v, i) => {
    const x = (i / (history.length - 1)) * width;
    const y = height - ((v - min) / range) * height;
    return `${x},${y}`;
  });
  const isUp = history[history.length - 1] >= history[0];
  const chartColor = isUp ? '#4ade80' : '#f87171';
  return (
    <View style={{ width, height, overflow: 'hidden' }}>
      <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, top: 0 }}>
        {pts.slice(1).map((pt, i) => {
          const prev = pts[i].split(',');
          const curr = pt.split(',');
          const x1 = parseFloat(prev[0]);
          const y1 = parseFloat(prev[1]);
          const x2 = parseFloat(curr[0]);
          const y2 = parseFloat(curr[1]);
          const len = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
          const angle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);
          return (
            <View key={i} style={{
              position: 'absolute',
              left: x1,
              top: y1,
              width: len,
              height: 1.5,
              backgroundColor: chartColor,
              opacity: 0.8 + (i / pts.length) * 0.2,
              transformOrigin: '0 50%',
              transform: [{ rotate: `${angle}deg` }],
            }} />
          );
        })}
      </View>
    </View>
  );
};

const { width: SW } = Dimensions.get('window');
const CONFETTI_COLORS = ['#fbbf24', '#f87171', '#4ade80', '#60a5fa', '#a78bfa', '#f472b6', '#34d399'];
const ConfettiPiece = ({ color, startX, delay }) => {
  const y = useRef(new Animated.Value(-20)).current;
  const x = useRef(new Animated.Value(0)).current;
  const rot = useRef(new Animated.Value(0)).current;
  const op = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.delay(delay).start(() => {
      Animated.parallel([
        Animated.timing(y, { toValue: 700, duration: 2200, useNativeDriver: true }),
        Animated.timing(x, { toValue: (Math.random() - 0.5) * 120, duration: 2200, useNativeDriver: true }),
        Animated.timing(rot, { toValue: 6, duration: 2200, useNativeDriver: true }),
        Animated.sequence([Animated.delay(1600), Animated.timing(op, { toValue: 0, duration: 600, useNativeDriver: true })]),
      ]).start();
    });
  }, []);
  const spin = rot.interpolate({ inputRange: [0, 6], outputRange: ['0deg', '720deg'] });
  return (
    <Animated.View style={{
      position: 'absolute', top: 60, left: startX,
      width: 8, height: 8, backgroundColor: color,
      opacity: op, transform: [{ translateY: y }, { translateX: x }, { rotate: spin }],
    }} />
  );
};

const AchievementToast = ({ achievement, onDone }) => {
  const slideAnim = useRef(new Animated.Value(-120)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    if (!achievement) return;
    slideAnim.setValue(-120);
    opacityAnim.setValue(0);
    scaleAnim.setValue(0.9);
    Animated.sequence([
      Animated.parallel([
        Animated.spring(slideAnim, { toValue: 0, friction: 7, tension: 90, useNativeDriver: true }),
        Animated.timing(opacityAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, friction: 7, tension: 90, useNativeDriver: true }),
      ]),
      Animated.delay(achievement.isMilestone ? 3500 : 2800),
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: -120, duration: 400, useNativeDriver: true }),
        Animated.timing(opacityAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]),
    ]).start(() => onDone());
  }, [achievement]);

  if (!achievement) return null;
  const color = achievement.color || '#fbbf24';
  const confettiPieces = achievement.isMilestone
    ? Array.from({ length: 24 }, (_, i) => ({ id: i, color: CONFETTI_COLORS[i % CONFETTI_COLORS.length], startX: Math.random() * SW, delay: i * 60 }))
    : [];

  return (
    <Animated.View style={{
      position: 'absolute', top: 0, left: 0, right: 0, zIndex: 999,
      opacity: opacityAnim, transform: [{ translateY: slideAnim }],
    }} pointerEvents="none">
      {confettiPieces.map(p => <ConfettiPiece key={p.id} color={p.color} startX={p.startX} delay={p.delay} />)}
      <View style={{
        backgroundColor: '#080b18', borderBottomWidth: 2, borderColor: color,
        paddingHorizontal: 16, paddingVertical: 14, paddingTop: 50,
        flexDirection: 'row', alignItems: 'center', gap: 14,
        borderLeftWidth: achievement.isMilestone ? 4 : 0, borderLeftColor: color,
      }}>
        <View style={{ width: achievement.isMilestone ? 44 : 36, height: achievement.isMilestone ? 44 : 36, borderWidth: 2, borderColor: color, backgroundColor: color + '15', alignItems: 'center', justifyContent: 'center' }}>
          <FontAwesome5 name={achievement.isMilestone ? 'trophy' : 'check'} size={achievement.isMilestone ? 18 : 14} color={color} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 12, color: color, letterSpacing: 3 }}>
            {achievement.isMilestone ? 'MILESTONE REACHED' : 'ACHIEVEMENT UNLOCKED'}
          </Text>
          <Text style={{ fontFamily: 'VT323_400Regular', fontSize: achievement.isMilestone ? 26 : 22, color: '#c8d4f0' }}>{achievement.name}</Text>
          {achievement.desc && (
            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: '#445070' }}>{achievement.desc}</Text>
          )}
        </View>
      </View>
    </Animated.View>
  );
};

const CrisisFlash = ({ visible }) => {
  const op = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!visible) return;
    op.setValue(0.45);
    Animated.timing(op, { toValue: 0, duration: 1200, useNativeDriver: true }).start();
  }, [visible]);
  return (
    <Animated.View style={{
      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 998,
      backgroundColor: '#f87171', opacity: op,
    }} pointerEvents="none" />
  );
};

const GameLayout = ({ onHardReset }) => {
  const {
    balance, turn, netWorth,
    currentJob, currentHousing, isPlaying,
    gameSpeed, setGameSpeed,
    degrees, portfolio, properties, marketPrices, priceHistory,
    enrollInCourse, tradeStock, buyProperty, moveIn, applyForJob, checkJobRequirements, getCAAdvice,
    playerSprite, setPlayerSprite, playerName,
    playerAge, totalMonthsPlayed, gameOver, finalScore, RETIREMENT_MONTH, GAME_END_MONTH,
    netWorthHistory, lastMonthFlow, monthlyRecap,
    loans, buyPropertyWithLoan, sellProperty,
    dependents, activeInsurance,
    lastCrisisEvent, setLastCrisisEvent,
    activeEnrollment, enrollWithLoan, dropOut, stockNews,
    mfNavs, mfPortfolio, buyMF,
    sipPlans, addSIP, cancelSIP,
    ppf, nps, contributePPF, contributeNPS,
    marketCycle,
    isRetired, pensionIncome,
    nextMonth, happiness, buyAndMoveIn,
    eventInbox, markEventRead, markAllEventsRead,
    pendingJobOffer, setPendingJobOffer,
    pendingDecision, resolveDecision,
    newAchievement, setNewAchievement,
    achievements,
    majorCrisisFlash,
    retireEarly,
    seenTutorials, markTutorialSeen, getProductUnlocks, getCurrentObjective,
    saveLoaded, deleteSave,
    turnsLeftToday, DAILY_TURN_LIMIT,
    health, sickLeaveMonths,
    getTotalEMI,
    pendingFamilyDemand, resolveFamilyDemand,
    pendingCreditCardOffer, setPendingCreditCardOffer,
    pendingJobInterview,
    pantry,
    legacySummary, isLegacyMode,
    playerBirthday, lastCelebrationChoice,
  } = useGame();

  const [showBirthdayRoom, setShowBirthdayRoom] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [newGameConfirm, setNewGameConfirm] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showHomeScreen, setShowHomeScreen] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [careerSubTab, setCareerSubTab] = useState(null); // null = landing | jobs | study
  const [moneySubTab, setMoneySubTab] = useState(null);
  const [showGrocery, setShowGrocery] = useState(false);
  const [happinessToast, setHappinessToast] = useState(null);
  const happinessToastTimerRef = useRef(null);
  const [showPantryBanner, setShowPantryBanner] = useState(false);
  const pantryBannerTimerRef = useRef(null);
  const [showGoals, setShowGoals] = useState(false);
  const [showDailyLimit, setShowDailyLimit] = useState(false);
  const [showCrisisSimulator, setShowCrisisSimulator] = useState(false);
  const monthsPlayedTodayRef = useRef(0);
  const [showHealthReport, setShowHealthReport] = useState(false);
  const [showHappinessReport, setShowHappinessReport] = useState(false);
  const [currentTip, setCurrentTip] = useState(null);
  const [showEventsInbox, setShowEventsInbox] = useState(false);
  const [inboxTab, setInboxTab] = useState('all');
  const [selectedJob, setSelectedJob] = useState(null);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [investCategory, setInvestCategory] = useState(null);
  const [viewMode, setViewMode] = useState('home');
  useEffect(() => { AsyncStorage.getItem('finlit_view_mode').then(v => { if (v) setViewMode(v); }); }, []);
  const switchViewMode = (v) => { setViewMode(v); AsyncStorage.setItem('finlit_view_mode', v); };

  // Low pantry banner — show when ≤3 items, auto-dismiss after 20s
  useEffect(() => {
    const totalQty = (pantry || []).reduce((s, p) => s + (p.qty || 0), 0);
    if (totalQty <= 3 && health >= 30) {
      setShowPantryBanner(true);
      clearTimeout(pantryBannerTimerRef.current);
      pantryBannerTimerRef.current = setTimeout(() => setShowPantryBanner(false), 20000);
    } else {
      setShowPantryBanner(false);
      clearTimeout(pantryBannerTimerRef.current);
    }
    return () => clearTimeout(pantryBannerTimerRef.current);
  }, [pantry, health]);

  // Floating money indicator — auto-clears after animation so tab switches never replay it
  const [activeFlow, setActiveFlow] = useState(null);
  const lastSeenFlowRef = useRef(null);
  useEffect(() => {
    if (lastMonthFlow && lastMonthFlow !== lastSeenFlowRef.current) {
      lastSeenFlowRef.current = lastMonthFlow;
      setActiveFlow(lastMonthFlow);
      const t = setTimeout(() => setActiveFlow(null), 2500);
      return () => clearTimeout(t);
    }
  }, [lastMonthFlow]);

  // Stock trading state
  const [selectedStock, setSelectedStock] = useState(null);
  const [tradeQty, setTradeQty] = useState('1');
  const [tradeTab, setTradeTab] = useState('BUY');
  const [stocksView, setStocksView] = useState('list'); // 'list' | 'news'

  // MF state
  const [selectedMF, setSelectedMF] = useState(null);
  const [mfAmount, setMfAmount] = useState('5000');
  const [mfTab, setMfTab] = useState('LUMPSUM'); // LUMPSUM | SIP

  // PPF/NPS state
  const [ppfAmount, setPpfAmount] = useState('5000');
  const [npsAmount, setNpsAmount] = useState('5000');
  const [npsEquity, setNpsEquity] = useState('60');

  // Pixel dialog state
  const [dialog, setDialog] = useState({ visible: false, title: '', message: '', type: 'info', onConfirm: null, confirmText: 'OK', cancelText: null, onCancel: null });

  // First-load intro overlay
  const [showIntro, setShowIntro] = useState(true);

  // Month summary card
  const [showSummary, setShowSummary] = useState(false);

  const showDialog = (title, message, type = 'info', onConfirm = null, confirmText = 'OK', cancelText = null, onCancel = null, image = null) => {
    setDialog({ visible: true, title, message, type, onConfirm: onConfirm || (() => setDialog(d => ({ ...d, visible: false }))), confirmText, cancelText, onCancel, image });
  };
  const closeDialog = () => setDialog(d => ({ ...d, visible: false }));

  // ── Next Month guard — prevents firing while any modal is open ──────────────
  const handleAdvanceTime = () => {
    try {
      // If a modal is genuinely open, do nothing
      if (dialog.visible || pendingJobInterview || pendingDecision || majorCrisisFlash || showSummary || pendingFamilyDemand) {
        return;
      }
      // If isPlaying is false but no modal is open, it's a stuck state — clear it
      if (!isPlaying) {
        if (lastCrisisEvent) setLastCrisisEvent(null);
      }
      monthsPlayedTodayRef.current += 1;
      nextMonth();
    } catch (e) {
      console.error('handleAdvanceTime error:', e);
    }
  };

  const openEventDetail = (event) => {
    markEventRead(event.id);
    setShowEventsInbox(false);
    setLastCrisisEvent(event);
  };

  const getCategoryDisplay = (category) => {
    switch ((category || 'other').toString()) {
      case 'positive': return 'Good News';
      case 'crisis': return 'Alerts';
      case 'market': return 'Market';
      case 'property': return 'Property';
      case 'health': return 'Health';
      case 'dilemma': return 'Decisions';
      case 'info': return 'Info';
      default: return 'Other';
    }
  };

  const getCategoryAccent = (category) => {
    switch ((category || 'other').toString()) {
      case 'positive': return '#22c55e';
      case 'crisis': return '#f87171';
      case 'market': return '#f59e0b';
      case 'property': return '#60a5fa';
      case 'health': return '#f472b6';
      case 'dilemma': return '#a855f7';
      case 'info': return '#38bdf8';
      default: return '#94a3b8';
    }
  };

  const categorizedInbox = useMemo(() => {
    const groups = {};
    eventInbox.forEach(ev => {
      const category = ev.category || 'other';
      groups[category] = groups[category] || [];
      groups[category].push(ev);
    });
    const ordering = ['positive', 'crisis', 'market', 'property', 'health', 'dilemma', 'info', 'other'];
    return Object.keys(groups)
      .sort((a, b) => {
        const ai = ordering.indexOf(a);
        const bi = ordering.indexOf(b);
        if (ai !== -1 && bi !== -1) return ai - bi;
        if (ai !== -1) return -1;
        if (bi !== -1) return 1;
        return b.localeCompare(a);
      })
      .map(category => ({
        category,
        label: getCategoryDisplay(category),
        accent: getCategoryAccent(category),
        events: groups[category].sort((a, b) => (b.month || 0) - (a.month || 0)),
      }));
  }, [eventInbox]);

  // Show month summary after every NEXT MONTH (manual or auto)
  useEffect(() => {
    if (!monthlyRecap) return;
    setShowSummary(true);
  }, [monthlyRecap]);

  // Pipe crisis events into PixelDialog
  useEffect(() => {
    if (!lastCrisisEvent) return;
    setShowEventsInbox(false);
    const isPositive = lastCrisisEvent.category === 'positive';
    const impactStr = lastCrisisEvent.impact !== 0
      ? `\n\n${lastCrisisEvent.impact > 0 ? '+' : ''}₹${Math.abs(lastCrisisEvent.impact).toLocaleString()}`
      : '';
    const finalMessage = typeof lastCrisisEvent.message === 'string'
      ? lastCrisisEvent.message + impactStr
      : (
          <View>
            {lastCrisisEvent.message}
            {impactStr ? <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: '#f87171', marginTop: 10 }}>{impactStr}</Text> : null}
          </View>
      );

    showDialog(
      lastCrisisEvent.name,
      finalMessage,
      isPositive ? 'positive' : 'crisis',
      () => { setLastCrisisEvent(null); closeDialog(); },
      'OK',
      null,
      null,
      lastCrisisEvent.image
    );
  }, [lastCrisisEvent]);

  // Family demand events — show YES/NO dialog
  useEffect(() => {
    if (!pendingFamilyDemand) return;
    const { demand, dep } = pendingFamilyDemand;
    showDialog(
      demand.getTitle(dep),
      demand.getMessage(dep),
      'warning',
      () => { closeDialog(); resolveFamilyDemand(true); },
      demand.confirmText || 'YES',
      demand.declineText || 'NOT NOW',
      () => { closeDialog(); resolveFamilyDemand(false); }
    );
  }, [pendingFamilyDemand]);

  useBackgroundMusic(isPlaying);

  // Waiting for AsyncStorage load
  if (!saveLoaded) {
    return <LoadingScreen text="LOADING SAVE..." />;
  }

  if (gameOver && legacySummary) {
    return <LegacyScreen />;
  }

  // No save found (or new game requested) — show sprite selection
  if (!playerSprite) {
    return <SpriteSelectionScreen childMode={isLegacyMode} childName={legacySummary?.eldestChild?.name} />;
  }

  // Settings overlay
  if (showSettings) {
    const BG = '#06080f', PANEL = '#0d1020', BORDER = '#1a2040';
    const GOLD = '#fbbf24', RED = '#f87171', CREAM = '#c8d4f0', DIM = '#445070';

    if (newGameConfirm) {
      return (
        <SafeAreaView style={{ flex: 1, backgroundColor: BG, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
          <View style={{ width: 48, height: 48, backgroundColor: RED + '18', borderWidth: 1, borderColor: RED + '60', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
            <Image source={require('./assets/ui_comp/warning.png')} style={{ width: 30, height: 30 }} resizeMode="contain" />
          </View>
          <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 26, color: CREAM, letterSpacing: 2, marginBottom: 8 }}>START NEW GAME?</Text>
          <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: DIM, textAlign: 'center', marginBottom: 32, lineHeight: 20 }}>
            Age {playerAge}  ·  ₹{(netWorth || 0).toLocaleString()} net worth{'\n'}This save will be permanently deleted.
          </Text>
          <TouchableOpacity
            onPress={async () => { await deleteSave(); onHardReset(); }}
            style={{ borderWidth: 1, borderColor: RED + '80', backgroundColor: RED + '18', padding: 14, width: '100%', alignItems: 'center', marginBottom: 10 }}
          >
            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 20, color: RED, letterSpacing: 2 }}>YES — DELETE & START FRESH</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setNewGameConfirm(false)}
            style={{ borderWidth: 1, borderColor: BORDER, padding: 14, width: '100%', alignItems: 'center' }}
          >
            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 20, color: DIM, letterSpacing: 2 }}>CANCEL</Text>
          </TouchableOpacity>
        </SafeAreaView>
      );
    }

    const settingsSprite = getSpriteImage(playerSprite, playerAge);
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: BG }}>
        {/* Header */}
        <View style={{ backgroundColor: PANEL, borderBottomWidth: 1, borderColor: BORDER, paddingVertical: 16, paddingHorizontal: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 28, color: CREAM, letterSpacing: 2 }}>SETTINGS</Text>
          <TouchableOpacity onPress={() => setShowSettings(false)} style={{ width: 36, height: 36, borderWidth: 1, borderColor: BORDER, alignItems: 'center', justifyContent: 'center' }}>
            <FontAwesome5 name="times" size={14} color={DIM} />
          </TouchableOpacity>
        </View>

        {/* Save info card */}
        <View style={{ margin: 20, backgroundColor: PANEL, borderWidth: 1, borderColor: BORDER, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          {settingsSprite && <Image source={settingsSprite} style={{ width: 52, height: 52 }} resizeMode="contain" />}
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 22, color: CREAM, lineHeight: 24 }}>{playerName || '—'}</Text>
            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: GOLD, lineHeight: 16 }}>Age {playerAge}  ·  ₹{(netWorth || 0).toLocaleString()} net worth</Text>
          </View>
        </View>

        {/* Buttons */}
        <View style={{ paddingHorizontal: 20, gap: 10 }}>
          <TouchableOpacity
            onPress={() => setShowSettings(false)}
            style={{ borderWidth: 1, borderColor: GOLD + '60', backgroundColor: GOLD + '12', padding: 16, alignItems: 'center' }}
          >
            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 20, color: GOLD, letterSpacing: 2 }}>◀  BACK TO GAME</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => { setShowSettings(false); setPlayerSprite(null); }}
            style={{ borderWidth: 1, borderColor: BORDER, backgroundColor: PANEL, padding: 16, alignItems: 'center' }}
          >
            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 20, color: DIM, letterSpacing: 2 }}>TITLE SCREEN</Text>
          </TouchableOpacity>

          <View style={{ height: 1, backgroundColor: BORDER, marginVertical: 4 }} />

          <TouchableOpacity
            onPress={() => setNewGameConfirm(true)}
            style={{ borderWidth: 1, borderColor: RED + '50', backgroundColor: RED + '10', padding: 16, alignItems: 'center' }}
          >
            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 20, color: RED, letterSpacing: 2 }}>START NEW GAME</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!currentHousing || balance === undefined) {
    return (
      <View style={{ flex: 1, backgroundColor: '#06080f', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 22, color: '#2a3560', letterSpacing: 4 }}>BOOTING LIFE OS...</Text>
      </View>
    );
  }

  // --- HANDLERS ---
  const handleEnroll = (course) => {
    const res = enrollInCourse(course);
    showDialog(res.success ? 'Enrolled!' : 'Cannot Enroll', res.msg, res.success ? 'success' : 'error');
  };

  const handleTrade = (stock, qty, action) => {
    const numQty = parseInt(qty) || 0;
    if (numQty <= 0) { showDialog('Invalid Qty', 'Enter a valid quantity.', 'error'); return; }
    const res = tradeStock(stock, numQty, action);
    if (!res.success) showDialog('Trade Failed', res.msg, 'error');
    else {
      const price = marketPrices[stock.id] || stock.price;
      showDialog('Trade Done', `${action === 'BUY' ? 'Bought' : 'Sold'} ${numQty} ${stock.ticker} @ ₹${Math.round(price).toLocaleString()}`, 'success');
      setSelectedStock(null);
    }
  };

  const handleBuyMF = (mf, amount, isSIP) => {
    if (isSIP) {
      const res = addSIP('mf', mf.id, parseInt(amount) || 0);
      showDialog(res.success ? 'SIP Started!' : 'SIP Failed', res.msg, res.success ? 'success' : 'error');
    } else {
      const res = buyMF(mf, parseInt(amount) || 0);
      showDialog(res.success ? 'Investment Done!' : 'Failed', res.msg, res.success ? 'success' : 'error');
    }
    if (true) setSelectedMF(null);
  };

  const handleBuyProperty = (prop) => {
    const res = buyProperty(prop);
    if (res.success) setSelectedProperty(null);
    showDialog(res.success ? 'Property Purchased!' : 'Cannot Buy', res.msg, res.success ? 'success' : 'error');
  };

  const handleBuyPropertyLoan = (prop) => {
    const res = buyPropertyWithLoan(prop);
    if (res.success) setSelectedProperty(null);
    showDialog(res.success ? 'Loan Approved!' : 'Loan Rejected', res.msg, res.success ? 'success' : 'error');
  };

  const handleMoveIn = (propId) => {
    const res = moveIn(propId);
    showDialog(res.success ? 'Moved In!' : 'Cannot Move', res.msg, res.success ? 'success' : 'error');
    if (res.success) { switchViewMode('home'); setActiveMenu(null); }
  };

  const handleHomeScreenBuy = (prop, buyWithCash, doMoveIn = true) => {
    let res;
    if (doMoveIn) {
      res = buyAndMoveIn(prop, !buyWithCash);
    } else if (buyWithCash) {
      res = buyProperty(prop);
    } else {
      res = buyPropertyWithLoan(prop);
    }
    showDialog(
      res.success ? (doMoveIn ? 'Welcome Home!' : 'Property Purchased!') : 'Cannot Buy',
      res.msg,
      res.success ? 'success' : 'error'
    );
    if (res.success) setShowHomeScreen(false);
  };

  const handleApply = (job) => {
    const check = checkJobRequirements(job);
    if (!check.allowed) { showDialog('Locked', `Cannot apply: ${check.reason}`, 'error'); return; }
    showDialog(
      'SUBMIT APPLICATION',
      `Apply for ${job.name}?\n\nBase Salary: ₹${job.salary.toLocaleString()}/mo\n\nYour application will be reviewed over the coming months. If shortlisted, you will be invited for an interview.`,
      'info',
      () => {
        const result = applyForJob(job);
        if (result.allowed) { setSelectedJob(null); setActiveMenu(null); closeDialog(); }
      },
      'SUBMIT',
      'CANCEL',
      closeDialog
    );
  };

  const handleContributePPF = () => {
    const res = contributePPF(parseInt(ppfAmount) || 0);
    showDialog(res.success ? 'PPF Updated' : 'Failed', res.msg, res.success ? 'success' : 'error');
  };

  const handleContributeNPS = () => {
    const res = contributeNPS(parseInt(npsAmount) || 0, parseInt(npsEquity) || 60);
    showDialog(res.success ? 'NPS Updated' : 'Failed', res.msg, res.success ? 'success' : 'error');
  };

  if (showHomeScreen) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#06080f' }}>
        <HomeScreen
          onClose={() => setShowHomeScreen(false)}
          onBuyProperty={handleHomeScreenBuy}
          onSellProperty={(prop) => {
            showDialog('Sell Property?', `Sell ${prop.name} for ₹${prop.price.toLocaleString()}?`, 'warning',
              () => { const r = sellProperty(prop.id); showDialog(r.success ? 'Sold!' : 'Failed', r.msg, r.success ? 'success' : 'error'); },
              'SELL', 'Cancel', closeDialog
            );
          }}
        />
        <PixelDialog {...dialog} onConfirm={dialog.onConfirm || closeDialog} />
      </SafeAreaView>
    );
  }

  // ── Legacy / End-of-Life Screen ──────────────────────────────────────────────
  if (gameOver && finalScore) {
    const rankColor = finalScore.score > 100000000 ? '#fbbf24' : finalScore.score > 20000000 ? '#a78bfa' : finalScore.score > 5000000 ? '#34d399' : '#60a5fa';
    const loansLeft = loans.reduce((s, l) => s + l.remainingPrincipal, 0);
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#04060e' }}>
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>

          {/* Header */}
          <View style={{ alignItems: 'center', marginBottom: 24, marginTop: 8 }}>
            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: '#1a2440', letterSpacing: 5 }}>━━━━━━━━━━━━━━━━━━━━━━━━━━</Text>
            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: '#2a3560', letterSpacing: 4, marginTop: 4 }}>AGE 75  •  END OF JOURNEY</Text>
            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 48, color: '#c8d4f0', letterSpacing: 3, lineHeight: 52, marginTop: 6 }}>YOUR LEGACY</Text>
            <View style={{ paddingHorizontal: 20, paddingVertical: 6, borderWidth: 1, borderColor: rankColor + '88', backgroundColor: rankColor + '11', marginTop: 8 }}>
              <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 22, color: rankColor, letterSpacing: 2 }}>{finalScore.rank}</Text>
            </View>
          </View>

          {/* Wealth number */}
          <View style={{ alignItems: 'center', borderWidth: 1, borderColor: '#0d1830', backgroundColor: '#060a16', padding: 20, marginBottom: 14, position: 'relative' }}>
            <View style={{ position: 'absolute', top: 0, left: 0, width: 6, height: 6, backgroundColor: rankColor }} />
            <View style={{ position: 'absolute', top: 0, right: 0, width: 6, height: 6, backgroundColor: rankColor }} />
            <View style={{ position: 'absolute', bottom: 0, left: 0, width: 6, height: 6, backgroundColor: rankColor }} />
            <View style={{ position: 'absolute', bottom: 0, right: 0, width: 6, height: 6, backgroundColor: rankColor }} />
            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: '#2a3860', letterSpacing: 4, marginBottom: 4 }}>FINAL NET WORTH</Text>
            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 44, color: rankColor, letterSpacing: 1 }}>₹{netWorth.toLocaleString()}</Text>
          </View>

          {/* Stats grid */}
          {[
            ['Passive Income', `₹${finalScore.passiveIncome.toLocaleString()}/mo`, '#4ade80'],
            ['Retirement Corpus', `₹${finalScore.retirementCorpus.toLocaleString()}`, '#60a5fa'],
            ['Children Educated', `${finalScore.educatedChildren}`, '#a78bfa'],
            ['Loans Cleared', loansLeft === 0 ? 'YES ✓' : `₹${loansLeft.toLocaleString()} left`, loansLeft === 0 ? '#4ade80' : '#f87171'],
            ['Properties Owned', `${properties.length}`, '#fbbf24'],
            ['Family Members', `${dependents.length}`, '#f472b6'],
            ['Life Happiness', `${Math.round(happiness)}/100`, happiness >= 70 ? '#4ade80' : happiness >= 40 ? '#fbbf24' : '#f87171'],
          ].map(([label, value, color]) => (
            <View key={label} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderColor: '#0a0f1e' }}>
              <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 18, color: '#3a4870' }}>{label}</Text>
              <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 18, color }}>{value}</Text>
            </View>
          ))}

          {/* Wealth journey chart */}
          {netWorthHistory.length > 2 && (
            <View style={{ marginTop: 20, borderWidth: 1, borderColor: '#0d1830', backgroundColor: '#060a16', padding: 14 }}>
              <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: '#1e2a48', letterSpacing: 3, marginBottom: 10 }}>WEALTH JOURNEY</Text>
              <View style={{ height: 80, flexDirection: 'row', alignItems: 'flex-end' }}>
                {(() => {
                  const maxVal = Math.max(...netWorthHistory.map(h => Math.abs(h.value)), 1);
                  return netWorthHistory.map((h, i) => (
                    <View key={i} style={{
                      flex: 1, minHeight: 3, marginRight: 1,
                      height: `${Math.max(3, (Math.abs(h.value) / maxVal) * 100)}%`,
                      backgroundColor: h.value >= 0 ? '#4ade80' : '#f87171',
                      opacity: 0.5 + (i / netWorthHistory.length) * 0.5,
                    }} />
                  ));
                })()}
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: '#1a2440' }}>Age 18</Text>
                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: '#1a2440' }}>Age 75</Text>
              </View>
            </View>
          )}

          {/* Final message */}
          <View style={{ marginTop: 20, alignItems: 'center' }}>
            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: '#1a2440', letterSpacing: 3, textAlign: 'center' }}>
              {finalScore.score > 50000000
                ? 'You built generational wealth. Your family is set for life.'
                : finalScore.score > 10000000
                ? 'A comfortable, well-lived life. Well done.'
                : finalScore.score > 2000000
                ? 'You made it through. Plenty of lessons learned.'
                : 'Life was tough, but you kept going. That counts.'}
            </Text>
            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: '#111828', letterSpacing: 2, marginTop: 12 }}>© FINLIT 2024</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const spriteImage = getSpriteImage(playerSprite, playerAge);
  const lifeProgress = Math.min(totalMonthsPlayed / GAME_END_MONTH, 1);
  const retirementMarker = RETIREMENT_MONTH / GAME_END_MONTH; // ~0.70 — where retirement starts on the bar

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0a0c12' }}>
      <StyledView className="flex-1 relative" style={{ flex: 1, backgroundColor: '#0a0c12' }}>
        <StatusBar barStyle="light-content" />

        {/* ===== GAME HUD (Top) — home tab only ===== */}
        {activeTab === 'home' && (
          <View style={{ backgroundColor: '#0d1020', paddingHorizontal: 12, paddingTop: 8, paddingBottom: 8 }}>

            {/* Row 1: Name/Age/Job — left | Cash/Income/Settings — right */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View>
                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 20, color: '#c8d4f0', lineHeight: 22 }}>{playerName || 'Player'}  ·  Age {playerAge}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 17, color: '#445070', lineHeight: 18 }}>{currentJob?.name || 'Unemployed'}</Text>
                  <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: '#2a3560', lineHeight: 16 }}>{'·'}</Text>
                  <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: '#2a3560', lineHeight: 16 }}>
                    {(() => { const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']; return `${months[(turn.month - 1) % 12]} ${turn.year}`; })()}
                  </Text>
                </View>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 24, color: '#38b2ac', lineHeight: 26 }}>₹{balance?.toLocaleString()}</Text>
                  {currentJob && (
                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: '#4fd1c5', lineHeight: 14 }}>+₹{currentJob.salary.toLocaleString()}/mo</Text>
                  )}
                </View>
                <TouchableOpacity onPress={() => setShowSettings(true)} style={{ width: 34, height: 34, alignItems: 'center', justifyContent: 'center' }}>
                  <Image source={require('./assets/ui_comp/settingsicon.png')} style={{ width: 30, height: 30 }} resizeMode="contain" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Row 2: Health + Happiness 50/50 segmented bars */}
            {(() => {
              const hpColor  = health >= 60 ? '#4ade80' : health >= 30 ? '#fbbf24' : '#f87171';
              const hapColor = happiness >= 70 ? '#4ade80' : happiness >= 40 ? '#fbbf24' : '#f87171';
              const SEGS = 10;
              const hpFilled  = Math.round((health / 100) * SEGS);
              const hapFilled = Math.round((happiness / 100) * SEGS);
              const SegBar = ({ filled, color }) => (
                <View style={{ flexDirection: 'row', gap: 2, flex: 1 }}>
                  {Array.from({ length: SEGS }).map((_, i) => (
                    <View key={i} style={{ flex: 1, height: 10, backgroundColor: i < filled ? color : '#151c30', borderWidth: 1, borderColor: i < filled ? color + '80' : '#1a2040' }} />
                  ))}
                </View>
              );
              return (
                <View style={{ flexDirection: 'row', marginTop: 8, gap: 10 }}>
                  <TouchableOpacity onPress={() => setShowHealthReport(true)} activeOpacity={0.8}
                    style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderColor: '#1a2040', paddingHorizontal: 6, paddingVertical: 4, backgroundColor: '#070a16' }}>
                    <Image source={require('./assets/ui_comp/healthicon.png')} style={{ width: 18, height: 18 }} resizeMode="contain" />
                    <SegBar filled={hpFilled} color={hpColor} />
                    <Image source={require('./assets/ui_comp/play button.png')} style={{ width: 12, height: 12, opacity: 0.4 }} resizeMode="contain" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setShowHappinessReport(true)} activeOpacity={0.8}
                    style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderColor: '#1a2040', paddingHorizontal: 6, paddingVertical: 4, backgroundColor: '#070a16' }}>
                    <Image source={require('./assets/ui_comp/happyicon.png')} style={{ width: 18, height: 18 }} resizeMode="contain" />
                    <SegBar filled={hapFilled} color={hapColor} />
                    <Image source={require('./assets/ui_comp/play button.png')} style={{ width: 12, height: 12, opacity: 0.4 }} resizeMode="contain" />
                  </TouchableOpacity>
                </View>
              );
            })()}

          </View>
        )}

        {/* ===== OBJECTIVE BANNER ===== */}
        {(() => {
          const obj = typeof getCurrentObjective === 'function' ? getCurrentObjective() : null;
          if (!obj) return null;
          return (
            <View style={{ backgroundColor: '#1d4ed8', padding: 12, borderBottomWidth: 1, borderColor: '#3b82f6' }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: '#93c5fd', letterSpacing: 2 }}>CURRENT OBJECTIVES</Text>
              </View>
              <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 20, color: '#ffffff' }}>{obj.title}</Text>
              <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: '#bfdbfe', marginBottom: 10 }}>{obj.desc}</Text>
              
              {obj.steps && obj.steps.map(step => (
                <TouchableOpacity 
                  key={step.id} 
                  onPress={() => {
                    if (step.action?.isAdvanceTime) {
                      handleAdvanceTime();
                      return;
                    }
                    if (step.action?.tab) setActiveTab(step.action.tab);
                    if (step.action?.subTab === 'shop') setShowGrocery(true);
                    if (step.action?.subTab && step.action.tab === 'money') setMoneySubTab(step.action.subTab);
                  }} 
                  activeOpacity={0.8}
                  style={{ 
                    flexDirection: 'row', alignItems: 'center', gap: 10, 
                    backgroundColor: step.done ? '#1e3a8a80' : '#2563eb', 
                    padding: 8, borderWidth: 1, borderColor: step.done ? '#1e3a8a' : '#60a5fa', 
                    marginBottom: 6, opacity: step.done ? 0.6 : 1
                  }}
                >
                  <Image source={step.icon} style={{ width: 24, height: 24, opacity: step.done ? 0.5 : 1 }} resizeMode="contain" />
                  <Text style={{ flex: 1, fontFamily: 'VT323_400Regular', fontSize: 16, color: step.done ? '#93c5fd' : '#ffffff', textDecorationLine: step.done ? 'line-through' : 'none' }}>
                    {step.label}
                  </Text>
                  {step.done ? (
                    <FontAwesome5 name="check" size={14} color="#4ade80" />
                  ) : (
                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 12, color: '#bfdbfe' }}>GO ▶</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          );
        })()}

        {/* ===== CONTENT AREA (switches by tab) ===== */}
        <View style={{ flex: 1, overflow: 'hidden' }}>

        {/* HOME TAB */}
        {activeTab === 'home' && (
        <View style={{ flex: 1, position: 'relative', backgroundColor: '#0d1020', overflow: 'hidden' }}>
          {/* Room background with panning support */}
          <ScrollView 
            style={{ position: 'absolute', width: '100%', height: '100%' }}
            contentContainerStyle={{ height: Dimensions.get('window').height * 1.2 }}
            showsVerticalScrollIndicator={false}
            bounces={false}
            contentOffset={{ x: 0, y: Dimensions.get('window').height * 0.1 }}
          >
            <ScrollView 
              horizontal 
              style={{ flex: 1 }}
              contentContainerStyle={{ width: Dimensions.get('window').width * 1.8 }}
              showsHorizontalScrollIndicator={false}
              bounces={false}
              contentOffset={{ x: Dimensions.get('window').width * 0.4, y: 0 }}
            >
              <Image
                key={`${activeMenu}-${viewMode}`}
                source={
                  activeMenu === 'advisor'
                    ? require('./assets/properties/CA_Office.png')
                    : viewMode === 'work' && currentJob?.office_image
                      ? currentJob.office_image
                      : currentHousing.image
                }
                style={{ 
                  width: Dimensions.get('window').width * 1.8, 
                  height: Dimensions.get('window').height * 1.2 
                }}
                resizeMode="cover"
              />
            </ScrollView>
          </ScrollView>

          <Vignette />
          <CRTOverlay />

          {/* Player sprite — peeking from bottom-right, tap to open Life screen */}
          {activeMenu !== 'advisor' && spriteImage && (
            <TouchableOpacity
              onPress={() => { setActiveTab('family'); }}
              activeOpacity={0.8}
              style={{ position: 'absolute', bottom: -182, right: -18, zIndex: 10 }}
            >
              <Image source={spriteImage} style={{ width: 178, height: 330 }} resizeMode="contain" />
              {dependents.length > 0 && (
                <View style={{ position: 'absolute', top: 14, right: 0, backgroundColor: '#ec4899', width: 16, height: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: '#fff' }}>{dependents.length}</Text>
                </View>
              )}
            </TouchableOpacity>
          )}

          {/* For sale icon — top-left, home view only */}
          {activeMenu !== 'advisor' && viewMode === 'home' && (() => {
            // Compute birthday info
            let playerBdayMonth = null;
            if (playerBirthday && playerBirthday.includes('/')) playerBdayMonth = parseInt(playerBirthday.split('/')[1], 10);
            const currentMonth = (totalMonthsPlayed % 12) + 1;
            const isPlayerBday = playerBdayMonth === currentMonth;
            const bdayDep = dependents.find(d => d.bdayMonth === currentMonth);
            const isBdayMonth = isPlayerBday || !!bdayDep;
            return (
              <View style={{ position: 'absolute', top: 8, left: 12, zIndex: 20, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <TouchableOpacity onPress={() => setShowHomeScreen(true)} activeOpacity={0.8}>
                  <Image source={require('./assets/ui_comp/forsale.png')} style={{ width: 36, height: 36 }} resizeMode="contain" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setShowBirthdayRoom(true)} activeOpacity={0.8} style={{ position: 'relative' }}>
                  <Image source={require('./assets/ui_comp/birthday_cake.png')} style={{ width: 36, height: 36 }} resizeMode="contain" />
                  {isBdayMonth && (
                    <View style={{ position: 'absolute', top: -3, right: -3, width: 10, height: 10, borderRadius: 5, backgroundColor: '#ec4899', borderWidth: 1.5, borderColor: '#06080f' }} />
                  )}
                </TouchableOpacity>
              </View>
            );
          })()}

          {/* Grocery + Inbox icons — top-right, no labels */}
          {activeMenu !== 'advisor' && (() => {
            const unread = eventInbox.filter(e => !e.read).length;
            return (
              <View style={{ position: 'absolute', top: 8, right: 8, zIndex: 20, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                {currentJob && (
                  <TouchableOpacity onPress={() => switchViewMode(viewMode === 'home' ? 'work' : 'home')} activeOpacity={0.8}>
                    <Image
                      source={viewMode === 'home' ? require('./assets/ui_comp/currentjob.png') : require('./assets/ui_comp/home.png')}
                      style={{ width: 36, height: 36 }}
                      resizeMode="contain"
                    />
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={() => setShowGrocery(true)} activeOpacity={0.8} style={{ position: 'relative' }}>
                  <Image source={require('./assets/ui_comp/groceryshop.png')} style={{ width: 36, height: 36 }} resizeMode="contain" />
                  {health < 30 && (
                    <View style={{ position: 'absolute', top: -3, right: -3, width: 8, height: 8, borderRadius: 4, backgroundColor: '#f87171', borderWidth: 1, borderColor: '#06080f' }} />
                  )}
                </TouchableOpacity>
                <TouchableOpacity onPress={() => { setShowEventsInbox(true); markAllEventsRead(); }} style={{ position: 'relative' }}>
                  <Image source={require('./assets/ui_comp/inbox.png')} style={{ width: 36, height: 36 }} resizeMode="contain" />
                  {unread > 0 && (
                    <View style={{ position: 'absolute', top: -4, right: -4, minWidth: 16, height: 16, borderRadius: 8, backgroundColor: '#a855f7', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3, borderWidth: 1, borderColor: '#06080f' }}>
                      <Text style={{ fontSize: 9, color: '#fff', fontWeight: 'bold' }}>{unread > 9 ? '9+' : unread}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            );
          })()}

          {/* Low health urgent warning banner */}
          {activeMenu !== 'advisor' && health < 30 && (
            <TouchableOpacity
              onPress={() => setShowGrocery(true)}
              activeOpacity={0.85}
              style={{ position: 'absolute', bottom: 46, left: 10, right: 10, zIndex: 20, backgroundColor: health < 15 ? 'rgba(30,5,5,0.97)' : 'rgba(26,12,0,0.97)', borderWidth: 1, borderColor: health < 15 ? '#f87171' : '#fbbf24', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, gap: 10 }}
            >
              <Image source={require('./assets/ui_comp/warning.png')} style={{ width: 18, height: 18 }} resizeMode="contain" />
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: '#556080', marginBottom: 2, lineHeight: 15 }}>
                  Your character needs to eat to stay healthy. Low health causes sick leave — meaning missed salary that month.
                </Text>
                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: health < 15 ? '#f87171' : '#fbbf24', letterSpacing: 1 }}>
                  {health < 15 ? 'CRITICAL — FORCED SICK LEAVE!' : 'LOW HEALTH — Risk of sick leave'}
                </Text>
                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: '#445070' }}>
                  Buy food to restore HP • {Math.round(health)}/100 HP remaining
                </Text>
              </View>
              <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: health < 15 ? '#f87171' : '#fbbf24', letterSpacing: 1 }}>EAT ▶</Text>
            </TouchableOpacity>
          )}

          {/* Low pantry warning banner — auto-dismisses after 20s */}
          {activeMenu !== 'advisor' && showPantryBanner && (() => {
            const totalQty = (pantry || []).reduce((s, p) => s + (p.qty || 0), 0);
            return (
              <TouchableOpacity
                onPress={() => { setShowPantryBanner(false); setShowGrocery(true); }}
                activeOpacity={0.85}
                style={{ position: 'absolute', bottom: 46, left: 10, right: 10, zIndex: 20, backgroundColor: 'rgba(8,13,25,0.97)', borderWidth: 1, borderColor: '#1e3a5f', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, gap: 10 }}
              >
                <Image source={require('./assets/ui_comp/groceryshop.png')} style={{ width: 24, height: 24 }} resizeMode="contain" />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: '#60a5fa', letterSpacing: 1 }}>
                    {totalQty === 0 ? 'PANTRY EMPTY — Stock up now!' : `LOW STOCK — ${totalQty} item${totalQty === 1 ? '' : 's'} left`}
                  </Text>
                  <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: '#445070' }}>
                    Tap to buy groceries • dismisses in 20s
                  </Text>
                </View>
                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: '#60a5fa' }}>SHOP ▶</Text>
              </TouchableOpacity>
            );
          })()}

          {/* Floating Money Indicator */}
          {activeMenu !== 'advisor' && activeFlow && (
            <FloatingMoneyIndicator flow={activeFlow} />
          )}

          {/* Month Summary Card */}
          {showSummary && monthlyRecap && (
            <MonthSummaryCard
              recap={monthlyRecap}
              netWorthHistory={netWorthHistory}
              currentBalance={balance}
              onContinue={() => setShowSummary(false)}
            />
          )}

          {/* News ticker with badge */}
          {activeMenu !== 'advisor' && stockNews.length > 0 && (
            <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#070910', borderTopWidth: 1, borderColor: '#141a30', flexDirection: 'row', alignItems: 'center', height: 26, zIndex: 15, overflow: 'hidden' }}>
              <View style={{ backgroundColor: '#0a1628', paddingHorizontal: 8, height: '100%', justifyContent: 'center', borderRightWidth: 1, borderRightColor: '#e2b33a40' }}>
                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: '#e2b33a', letterSpacing: 1, lineHeight: 16 }}>NEWS</Text>
              </View>
              <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 15, color: '#f59e0b', paddingLeft: 12, lineHeight: 17 }} numberOfLines={1}>
                {stockNews[0].headline}
              </Text>
            </View>
          )}




          {/* ── FIRST STEPS GUIDE — shown when no job and early in game ── */}
          {/* Help modal */}
          {showHelp && (
            <View style={{ position: 'absolute', inset: 0, zIndex: 50, justifyContent: 'flex-end' }}>
              <TouchableOpacity style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)' }} onPress={() => setShowHelp(false)} activeOpacity={1} />
              <View style={{ backgroundColor: '#080c1a', borderTopWidth: 2, borderColor: '#fbbf24', padding: 20, paddingBottom: 36 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <View style={{ width: 32, height: 32, backgroundColor: '#fbbf2420', borderWidth: 1, borderColor: '#fbbf2460', alignItems: 'center', justifyContent: 'center' }}>
                      <FontAwesome5 name="question" size={14} color="#fbbf24" />
                    </View>
                    <View>
                      <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: '#fbbf24', letterSpacing: 3 }}>FIRST STEPS</Text>
                      <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 22, color: '#c8d4f0' }}>Getting Started</Text>
                    </View>
                  </View>
                  <TouchableOpacity onPress={() => setShowHelp(false)} style={{ padding: 6, borderWidth: 1, borderColor: '#1e2840' }}>
                    <FontAwesome5 name="times" size={12} color="#445070" />
                  </TouchableOpacity>
                </View>

                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: '#445070', marginBottom: 16, lineHeight: 22 }}>
                  You moved to the city at 18 with ₹{balance.toLocaleString()}. Without a job, expenses drain your savings every month.
                </Text>

                {[
                  { done: !!currentJob,                                    label: 'Find a job',           sub: 'Tap CAREER in the nav bar',        onPress: () => { setShowHelp(false); setActiveTab('career'); } },
                  { done: loans.length === 0 || balance > 50000,           label: 'Avoid unnecessary debt', sub: 'Personal loans cost 12%+ interest', onPress: null },
                  { done: balance >= 120000,                               label: 'Build an emergency fund', sub: '6 months of expenses (₹1.2L+) in cash', onPress: null },
                  { done: sipPlans.length > 0 || ppf.balance > 0,         label: 'Start a SIP or PPF',   sub: 'Tap MONEY → INVEST → Mutual Funds', onPress: () => { setShowHelp(false); setActiveTab('money'); } },
                  { done: activeInsurance.length > 0,                     label: 'Get insured',           sub: 'Tap MONEY → INSURE for health + term cover', onPress: () => { setShowHelp(false); setActiveTab('money'); setMoneySubTab('insure'); } },
                ].map((step, i) => (
                  <TouchableOpacity key={i} onPress={step.onPress || undefined} disabled={!step.onPress} activeOpacity={step.onPress ? 0.7 : 1} style={{ marginBottom: 10 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 10, borderWidth: 1, borderColor: step.done ? '#4ade8030' : (step.onPress ? '#fbbf2430' : '#1e2840'), backgroundColor: step.done ? '#0d1e12' : '#0a0d1a' }}>
                      <View style={{ width: 22, height: 22, borderWidth: 1, borderColor: step.done ? '#4ade80' : '#2a3560', backgroundColor: step.done ? '#4ade8020' : 'transparent', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {step.done && <FontAwesome5 name="check" size={9} color="#4ade80" />}
                        {!step.done && <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: '#2a3560' }}>{i + 1}</Text>}
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 18, color: step.done ? '#4ade80' : (step.onPress ? '#fbbf24' : '#c8d4f0'), textDecorationLine: step.done ? 'line-through' : 'none' }}>
                          {step.label}{step.onPress && !step.done ? ' →' : ''}
                        </Text>
                        {!step.done && <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: '#445070' }}>{step.sub}</Text>}
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Work mode: unemployed empty state */}
          {viewMode === 'work' && !currentJob && activeMenu !== 'advisor' && (
            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.7)' }}>
              <FontAwesome5 name="briefcase" size={40} color="#6B7280" />
              <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 22, color: '#9CA3AF', marginTop: 16, fontWeight: 'bold' }}>No Job Yet</Text>
              <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: '#666', marginTop: 4, textAlign: 'center', paddingHorizontal: 32 }}>Open Careers to find work</Text>
              <TouchableOpacity
                onPress={() => setActiveTab('career')}
                style={{ marginTop: 16, backgroundColor: '#FBBF24', paddingHorizontal: 24, paddingVertical: 8, borderWidth: 2, borderColor: '#F59E0B' }}
              >
                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 18, color: '#000', fontWeight: 'bold' }}>Find a Job</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* --- ADVISOR OVERLAY --- */}
          {activeMenu === 'advisor' && (
            <View style={{ position: 'absolute', bottom: 80, left: 12, right: 12, backgroundColor: '#0d1020', borderWidth: 1, borderColor: '#2a3560', borderRadius: 12, padding: 16, zIndex: 30 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <FontAwesome5 name="user-tie" size={18} color="#FBBF24" />
                  <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 20, color: '#FBBF24', fontWeight: 'bold' }}>CA ADVISOR</Text>
                </View>
                <TouchableOpacity onPress={() => setActiveMenu(null)} style={{ padding: 4, backgroundColor: '#111828', borderWidth: 1, borderColor: '#1e2840', borderRadius: 6 }}>
                  <Ionicons name="close" size={18} color="#6070a0" />
                </TouchableOpacity>
              </View>
              <ScrollView style={{ maxHeight: 120 }}>
                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 17, color: '#c8d4f0', lineHeight: 22, fontStyle: 'italic' }}>
                  "{getCAAdvice()}"
                </Text>
              </ScrollView>
            </View>
          )}
        </View>
        )}

        {/* CAREER TAB */}
        {activeTab === 'career' && (
          <View style={{ flex: 1 }}>
            {/* Back breadcrumb when inside a section */}
            {careerSubTab && (
              <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#0a0d1a', borderBottomWidth: 1, borderBottomColor: '#1a2040', paddingHorizontal: 14, paddingVertical: 10, gap: 10 }}>
                <TouchableOpacity onPress={() => setCareerSubTab(null)} activeOpacity={0.7} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: '#445070' }}>‹</Text>
                  <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: '#445070', letterSpacing: 2 }}>CAREER</Text>
                </TouchableOpacity>
                <View style={{ width: 1, height: 14, backgroundColor: '#1a2040' }} />
                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 15, color: '#c8d4f0', letterSpacing: 2 }}>{careerSubTab === 'jobs' ? 'JOBS' : 'STUDY'}</Text>
              </View>
            )}

            {/* Landing */}
            {!careerSubTab && (
              <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 14, paddingBottom: 40 }}>
                <View style={{ marginBottom: 16, marginTop: 4 }}>
                  <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: '#2a3560', letterSpacing: 4 }}>CAREER PORTAL</Text>
                  <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 28, color: '#c8d4f0', lineHeight: 30 }}>Find Your Path</Text>
                </View>

                {/* Current job strip */}
                {currentJob && (
                  <View style={{ borderWidth: 1, borderColor: '#1a2040', backgroundColor: '#0a0d1a', flexDirection: 'row', overflow: 'hidden', marginBottom: 14 }}>
                    <View style={{ width: 3, backgroundColor: '#fbbf24' }} />
                    <View style={{ flex: 1, padding: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <View>
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: '#2a3560', letterSpacing: 3 }}>CURRENT</Text>
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 20, color: '#c8d4f0', lineHeight: 22 }}>{currentJob.name}</Text>
                      </View>
                      <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 20, color: '#4ade80' }}>₹{currentJob.salary.toLocaleString()}/mo</Text>
                    </View>
                  </View>
                )}

                {/* JOBS card */}
                <TouchableOpacity onPress={() => setCareerSubTab('jobs')} activeOpacity={0.85}
                  style={{ borderWidth: 1, borderColor: '#1a2040', backgroundColor: '#0a0d1a', overflow: 'hidden', marginBottom: 12 }}>
                  <View style={{ height: 160, position: 'relative' }}>
                    <Image source={require('./assets/jobs/SDE.png')} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                    <View style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(4,6,14,0.55)' }} />
                    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, backgroundColor: '#fbbf24' }} />
                    <View style={{ position: 'absolute', inset: 0, padding: 16, justifyContent: 'flex-end' }}>
                      <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: '#fbbf24', letterSpacing: 4 }}>EXPLORE OPPORTUNITIES</Text>
                      <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 30, color: '#ffffff', lineHeight: 32 }}>JOBS</Text>
                      <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 15, color: '#c8d4f0' }}>Gig · Careers · Business · Executive</Text>
                    </View>
                    <View style={{ position: 'absolute', bottom: 16, right: 16, backgroundColor: '#06080f', borderWidth: 1, borderColor: '#fbbf2460', paddingHorizontal: 12, paddingVertical: 4 }}>
                      <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: '#fbbf24', letterSpacing: 2 }}>BROWSE ▶</Text>
                    </View>
                  </View>
                </TouchableOpacity>

                {/* STUDY card */}
                <TouchableOpacity onPress={() => setCareerSubTab('study')} activeOpacity={0.85}
                  style={{ borderWidth: 1, borderColor: '#1a2040', backgroundColor: '#0a0d1a', overflow: 'hidden' }}>
                  <View style={{ height: 160, position: 'relative' }}>
                    <Image source={require('./assets/jobs/streamer.png')} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                    <View style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(4,6,14,0.55)' }} />
                    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, backgroundColor: '#818cf8' }} />
                    <View style={{ position: 'absolute', inset: 0, padding: 16, justifyContent: 'flex-end' }}>
                      <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: '#818cf8', letterSpacing: 4 }}>LEVEL UP YOUR SKILLS</Text>
                      <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 30, color: '#ffffff', lineHeight: 32 }}>STUDY</Text>
                      <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 15, color: '#c8d4f0' }}>Courses · Degrees · Certifications</Text>
                    </View>
                    <View style={{ position: 'absolute', bottom: 16, right: 16, backgroundColor: '#06080f', borderWidth: 1, borderColor: '#818cf860', paddingHorizontal: 12, paddingVertical: 4 }}>
                      <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: '#818cf8', letterSpacing: 2 }}>BROWSE ▶</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              </ScrollView>
            )}

            {careerSubTab === 'jobs' && <CareersScreen onClose={() => setCareerSubTab(null)} onApply={(job) => handleApply(job)} />}
            {careerSubTab === 'study' && <EducationScreen onClose={() => setCareerSubTab(null)} onEnroll={handleEnroll} onEnrollLoan={(course) => { const r = enrollWithLoan(course); showDialog(r.success ? 'Edu Loan Approved' : 'Loan Failed', r.msg, r.success ? 'success' : 'error'); }} />}
          </View>
        )}

        {/* MONEY TAB */}
        {activeTab === 'money' && (
          <View style={{ flex: 1 }}>
            {/* Back bar when inside a sub-tab */}
            {moneySubTab && (
              <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#0a0d1a', borderBottomWidth: 1, borderBottomColor: '#1a2040', paddingHorizontal: 14, paddingVertical: 10, gap: 10 }}>
                <TouchableOpacity onPress={() => { setMoneySubTab(null); setInvestCategory(null); }} activeOpacity={0.7} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: '#445070' }}>‹</Text>
                  <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: '#445070', letterSpacing: 2 }}>MONEY</Text>
                </TouchableOpacity>
                <View style={{ width: 1, height: 14, backgroundColor: '#1a2040' }} />
                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 15, color: '#c8d4f0', letterSpacing: 2 }}>{moneySubTab.toUpperCase()}</Text>
              </View>
            )}

            {/* Money Hub — landing screen when no sub-tab selected */}
            {!moneySubTab && (
              <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 14, paddingBottom: 40 }}>
                <View style={{ marginBottom: 16, marginTop: 4 }}>
                  <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: '#2a3560', letterSpacing: 4 }}>FINANCES</Text>
                  <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 28, color: '#c8d4f0', lineHeight: 30 }}>Money</Text>
                </View>

                {/* Net worth summary strip */}
                <View style={{ flexDirection: 'row', gap: 8, marginBottom: 18 }}>
                  {[
                    { label: 'NET WORTH', value: `₹${netWorth >= 100000 ? (netWorth/100000).toFixed(1)+'L' : netWorth.toLocaleString()}`, color: netWorth >= 0 ? '#4ade80' : '#f87171', icon: require('./assets/achivements/graphs and stats.png') },
                    { label: 'BALANCE',   value: `₹${balance >= 100000 ? (balance/100000).toFixed(1)+'L' : balance.toLocaleString()}`, color: '#38b2ac', icon: require('./assets/achivements/coin stack.png') },
                    { label: 'EMI/MO',   value: getTotalEMI() > 0 ? `-₹${(getTotalEMI()/1000).toFixed(0)}k` : 'NONE', color: getTotalEMI() > 0 ? '#f87171' : '#4ade80', icon: require('./assets/achivements/piggy bank.png') },
                  ].map(s => (
                    <View key={s.label} style={{ flex: 1, backgroundColor: '#0a0d1a', borderWidth: 1, borderColor: '#1a2040', padding: 8, alignItems: 'center' }}>
                      <Image source={s.icon} style={{ width: 22, height: 22, marginBottom: 4 }} resizeMode="contain" />
                      <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 9, color: '#2a3560', letterSpacing: 2 }}>{s.label}</Text>
                      <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 17, color: s.color, lineHeight: 19, marginTop: 1 }}>{s.value}</Text>
                    </View>
                  ))}
                </View>

                {/* INVEST card — full width */}
                <TouchableOpacity onPress={() => setMoneySubTab('invest')} activeOpacity={0.85}
                  style={{ borderWidth: 1, borderColor: '#1a2040', backgroundColor: '#0d1020', overflow: 'hidden', marginBottom: 10 }}>
                  <View style={{ height: 140, position: 'relative' }}>
                    <Image source={require('./assets/jobs/gold business.png')} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                    <View style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(4,6,14,0.62)' }} />
                    <View style={{ position: 'absolute', inset: 0, padding: 16, justifyContent: 'flex-end' }}>
                      <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: '#4ade80', letterSpacing: 4 }}>GROW YOUR WEALTH</Text>
                      <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 30, color: '#ffffff', lineHeight: 32 }}>INVEST</Text>
                      <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 15, color: '#c8d4f0' }}>Stocks · Mutual Funds · PPF · NPS · FD</Text>
                    </View>
                    <View style={{ position: 'absolute', bottom: 16, right: 16, backgroundColor: '#06080f', borderWidth: 1, borderColor: '#4ade8060', paddingHorizontal: 12, paddingVertical: 4 }}>
                      <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: '#4ade80', letterSpacing: 2 }}>OPEN ▶</Text>
                    </View>
                  </View>
                </TouchableOpacity>

                {/* BANK card */}
                <TouchableOpacity onPress={() => setMoneySubTab('bank')} activeOpacity={0.85}
                  style={{ borderWidth: 1, borderColor: '#1a2040', backgroundColor: '#0d1020', overflow: 'hidden', marginBottom: 10 }}>
                  <View style={{ height: 140, position: 'relative' }}>
                    <Image source={require('./assets/bank.png')} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                    <View style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(4,6,14,0.62)' }} />
                    <View style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, padding: 16, justifyContent: 'flex-end' }}>
                      <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: '#38b2ac', letterSpacing: 4 }}>BANKING & LOANS</Text>
                      <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 30, color: '#ffffff', lineHeight: 32 }}>BANK</Text>
                      <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 15, color: '#c8d4f0' }}>FD · Loans · CA · ITR</Text>
                    </View>
                    <View style={{ position: 'absolute', bottom: 16, right: 16, backgroundColor: '#06080f', borderWidth: 1, borderColor: '#38b2ac60', paddingHorizontal: 12, paddingVertical: 4 }}>
                      <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: '#38b2ac', letterSpacing: 2 }}>OPEN ▶</Text>
                    </View>
                  </View>
                </TouchableOpacity>

                {/* INSURE card */}
                <TouchableOpacity onPress={() => setMoneySubTab('insure')} activeOpacity={0.85}
                  style={{ borderWidth: 1, borderColor: '#1a2040', backgroundColor: '#0d1020', overflow: 'hidden', marginBottom: 10 }}>
                  <View style={{ height: 140, position: 'relative' }}>
                    <Image source={require('./assets/jobs/chemist drugstore.png')} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                    <View style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(4,6,14,0.62)' }} />
                    <View style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, padding: 16, justifyContent: 'flex-end' }}>
                      <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: '#22c55e', letterSpacing: 4 }}>PROTECTION</Text>
                      <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 30, color: '#ffffff', lineHeight: 32 }}>INSURE</Text>
                      <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 15, color: '#c8d4f0' }}>Health · Life · Property</Text>
                    </View>
                    <View style={{ position: 'absolute', bottom: 16, right: 16, backgroundColor: '#06080f', borderWidth: 1, borderColor: '#22c55e60', paddingHorizontal: 12, paddingVertical: 4 }}>
                      <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: '#22c55e', letterSpacing: 2 }}>OPEN ▶</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              </ScrollView>
            )}
            {moneySubTab === 'invest' && (
              <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
                  <StyledView>
                    {!investCategory ? (
                      <StyledView>
                        {/* Market Cycle Banner */}
                        <View style={{
                          flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14,
                          backgroundColor: marketCycle.phase === 'bull' ? 'rgba(20,83,45,0.4)' : marketCycle.phase === 'bear' ? 'rgba(127,29,29,0.4)' : 'rgba(30,40,60,0.4)',
                          borderWidth: 1, borderColor: marketCycle.phase === 'bull' ? '#166534' : marketCycle.phase === 'bear' ? '#7f1d1d' : '#1e2840',
                          padding: 10,
                        }}>
                          <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: marketCycle.phase === 'bull' ? '#4ade80' : marketCycle.phase === 'bear' ? '#f87171' : '#fbbf24' }} />
                          <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: marketCycle.phase === 'bull' ? '#4ade80' : marketCycle.phase === 'bear' ? '#f87171' : '#fbbf24', flex: 1 }}>
                            {marketCycle.phase === 'bull' ? 'BULL MARKET — Prices trending upward' : marketCycle.phase === 'bear' ? 'BEAR MARKET — Prices under pressure' : 'SIDEWAYS — Low volatility phase'}
                          </Text>
                          <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: '#445070' }}>{marketCycle.monthsLeft}mo</Text>
                        </View>

                        {/* Invest category image card grid */}
                        {(() => {
                          const unlocks = getProductUnlocks();
                          const INVEST_CATS = [
                            { key: 'stocks',     unlockKey: 'stocks',     tipKey: 'stocks',     label: 'STOCKS',     sub: `${STOCKS.length} Indian stocks`,                          color: '#60a5fa', img: require('./assets/achivements/graphs and stats.png'), onPress: () => setInvestCategory('stocks') },
                            { key: 'mf',         unlockKey: 'mf',         tipKey: 'mf',         label: 'MUTUAL FUNDS', sub: `${MUTUAL_FUNDS.length} funds • ${sipPlans.length} SIPs`, color: '#818cf8', img: require('./assets/achivements/piggy bank.png'),       onPress: () => setInvestCategory('mf') },
                            { key: 'retirement', unlockKey: 'ppf',        tipKey: 'ppf',        label: 'RETIREMENT', sub: `PPF / NPS • ₹${(ppf.balance + nps.balance).toLocaleString()}`, color: '#fbbf24', img: require('./assets/achivements/crest with bank.png'), onPress: () => setInvestCategory('retirement') },
                            { key: 'homes',      unlockKey: 'realestate', tipKey: 'realestate', label: 'BUY HOMES',  sub: `${RESIDENTIAL_PROPERTIES.length} properties`,              color: '#4ade80', img: require('./assets/properties/villa_for_family_of_4-5.png'), onPress: () => { setActiveMenu(null); setShowHomeScreen(true); } },
                            { key: 'commercial', unlockKey: 'realestate', tipKey: 'realestate', label: 'COMMERCIAL', sub: `${COMMERCIAL_PROPERTIES.length} commercial`,               color: '#c084fc', img: require('./assets/properties/commercial_lot.png'),         onPress: () => setInvestCategory('commercial') },
                            { key: 'assets',     unlockKey: 'stocks',     tipKey: null,         label: 'MY PORTFOLIO', sub: `${properties.length} props • ${Object.keys(portfolio).length} stocks`, color: '#fbbf24', img: require('./assets/achivements/coin stack.png'), onPress: () => setInvestCategory('assets') },
                          ];
                          return Array.from({ length: Math.ceil(INVEST_CATS.length / 2) }).map((_, rowIdx) => (
                            <View key={rowIdx} style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
                              {INVEST_CATS.slice(rowIdx * 2, rowIdx * 2 + 2).map(cat => {
                                const lock = unlocks[cat.unlockKey] || { unlocked: true };
                                return (
                                  <TouchableOpacity
                                    key={cat.key}
                                    activeOpacity={lock.unlocked ? 0.8 : 1}
                                    onPress={() => {
                                      if (!lock.unlocked) return;
                                      if (cat.tipKey && !seenTutorials.has(cat.tipKey)) {
                                        setCurrentTip(FINANCIAL_TIPS[cat.tipKey]);
                                        markTutorialSeen(cat.tipKey);
                                      }
                                      cat.onPress();
                                    }}
                                    style={{ flex: 1, borderWidth: 1, borderColor: '#1a2040', overflow: 'hidden', opacity: lock.unlocked ? 1 : 0.5 }}
                                  >
                                    {/* Full image */}
                                    <View style={{ height: 90, backgroundColor: '#0a0d1a' }}>
                                      <Image source={cat.img} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                                      {!lock.unlocked && (
                                        <View style={{ position: 'absolute', top: 6, right: 6, backgroundColor: '#000', borderWidth: 1, borderColor: '#1a2040', padding: 4, borderRadius: 12 }}>
                                          <Image source={require('./assets/ui_comp/lock.png')} style={{ width: 12, height: 12, tintColor: '#445070' }} resizeMode="contain" />
                                        </View>
                                      )}
                                    </View>
                                    {/* Label strip */}
                                    <View style={{ backgroundColor: '#070a16', borderTopWidth: 1, borderColor: '#1a2040', padding: 8 }}>
                                      <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 15, color: lock.unlocked ? cat.color : '#2a3560', letterSpacing: 1 }}>{cat.label}</Text>
                                      <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 12, color: lock.unlocked ? '#445070' : '#1e2840' }} numberOfLines={1}>
                                        {lock.unlocked ? cat.sub : lock.requirement}
                                      </Text>
                                    </View>
                                  </TouchableOpacity>
                                );
                              })}
                              {INVEST_CATS.slice(rowIdx * 2, rowIdx * 2 + 2).length === 1 && <View style={{ flex: 1 }} />}
                            </View>
                          ));
                        })()}
                      </StyledView>
                    ) : (
                      <StyledView>
                        {/* Back */}
                        <StyledTouchableOpacity onPress={() => { setInvestCategory(null); setSelectedStock(null); setSelectedMF(null); }} className="flex-row items-center gap-2 mb-4 py-2">
                          <FontAwesome5 name="chevron-left" size={14} color="#9CA3AF" />
                          <StyledText className="text-gray-400 text-sm">Back to categories</StyledText>
                        </StyledTouchableOpacity>

                        {/* ===== STOCKS ===== */}
                        {investCategory === 'stocks' && !selectedStock && (
                          <StyledView>
                            {/* Tab bar: STOCKS | MARKET NEWS */}
                            <View style={{ flexDirection: 'row', marginBottom: 12, borderWidth: 1, borderColor: '#1a2040' }}>
                              {[['list', 'STOCKS'], ['news', `MARKET NEWS${stockNews.length > 0 ? ` (${stockNews.length})` : ''}`]].map(([key, label]) => (
                                <TouchableOpacity key={key} onPress={() => setStocksView(key)}
                                  style={{ flex: 1, paddingVertical: 10, alignItems: 'center', backgroundColor: stocksView === key ? '#070a16' : '#0d1020', borderRightWidth: key === 'list' ? 1 : 0, borderColor: '#1a2040', position: 'relative' }}>
                                  {stocksView === key && <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, backgroundColor: '#3b82f6' }} />}
                                  <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: stocksView === key ? '#60a5fa' : '#2a3560', letterSpacing: 1 }}>{label}</Text>
                                </TouchableOpacity>
                              ))}
                            </View>

                            {/* Market cycle indicator */}
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                              <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 20, color: '#c8d4f0', letterSpacing: 2 }}>
                                {stocksView === 'list' ? 'INDIAN STOCKS' : 'MARKET NEWS FEED'}
                              </Text>
                              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: marketCycle.phase === 'bull' ? '#4ade80' : marketCycle.phase === 'bear' ? '#f87171' : '#fbbf24' }} />
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 15, color: '#445070' }}>
                                  {marketCycle.phase.toUpperCase()}
                                </Text>
                              </View>
                            </View>

                            {/* ── NEWS FEED ── */}
                            {stocksView === 'news' && (() => {
                              const SECTOR_COLORS = {
                                'IT': '#60a5fa', 'Banking': '#818cf8', 'NBFC': '#a78bfa',
                                'Energy': '#fb923c', 'Infra': '#fbbf24', 'Auto': '#f59e0b',
                                'Pharma': '#4ade80', 'FMCG': '#86efac', 'Consumer': '#34d399',
                                'Telecom': '#22d3ee', 'PSU': '#94a3b8', 'Commodity': '#fde68a',
                                'Mining': '#a16207', 'Tech': '#e879f9', 'Crypto': '#f43f5e',
                                'MARKET': '#c8d4f0', 'FINANCE': '#818cf8', 'ENERGY': '#fb923c',
                              };
                              if (stockNews.length === 0) {
                                return (
                                  <View style={{ alignItems: 'center', paddingVertical: 40, borderWidth: 1, borderColor: '#1a2040', backgroundColor: '#0d1020' }}>
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 18, color: '#2a3560', textAlign: 'center' }}>
                                      No news yet.{'\n'}Advance a few months to see market events.
                                    </Text>
                                  </View>
                                );
                              }
                              return stockNews.map((item, idx) => {
                                const isPositive = (item.trend || 0) >= 0;
                                const secColor = SECTOR_COLORS[item.sector] || '#c8d4f0';
                                const trendPct = item.trend ? `${isPositive ? '+' : ''}${(item.trend * 100).toFixed(0)}%` : null;
                                const advice = isPositive
                                  ? 'Sectors: consider adding positions'
                                  : 'Sectors: review exposure, possible dip';
                                return (
                                  <View key={idx} style={{ borderWidth: 1, borderColor: isPositive ? '#4ade8030' : '#f8717130', backgroundColor: isPositive ? '#050f0a' : '#0f0508', marginBottom: 8, padding: 12 }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                                      <View style={{ backgroundColor: secColor + '22', borderWidth: 1, borderColor: secColor + '55', paddingHorizontal: 6, paddingVertical: 1 }}>
                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: secColor, letterSpacing: 1 }}>{(item.sector || 'MARKET').toUpperCase()}</Text>
                                      </View>
                                      {trendPct && (
                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: isPositive ? '#4ade80' : '#f87171' }}>
                                          {isPositive ? '▲' : '▼'} {trendPct}
                                        </Text>
                                      )}
                                      <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 12, color: '#445070', marginLeft: 'auto' }}>{item.date}</Text>
                                    </View>
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 17, color: '#e2e8f0', lineHeight: 20, marginBottom: 6 }}>{item.headline}</Text>
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: isPositive ? '#4ade8088' : '#f8717188' }}>
                                      {isPositive ? '↑' : '↓'} {advice}
                                    </Text>
                                  </View>
                                );
                              });
                            })()}

                            {/* ── STOCK GRID ── */}
                            {stocksView === 'list' && Array.from({ length: Math.ceil(STOCKS.length / 2) }).map((_, rowIdx) => (
                              <View key={rowIdx} style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
                                {STOCKS.slice(rowIdx * 2, rowIdx * 2 + 2).map(stock => {
                                  const currentPrice = marketPrices[stock.id] || stock.price;
                                  const history = priceHistory[stock.id] || [];
                                  const prevPrice = history.length > 1 ? history[history.length - 2] : stock.price;
                                  const changePct = ((currentPrice - prevPrice) / prevPrice * 100);
                                  const holding = portfolio[stock.id];
                                  const isUp = changePct >= 0;
                                  const riskColors = { 'Low': '#4ade80', 'Low-Medium': '#a3e635', 'Medium': '#fbbf24', 'Medium-High': '#fb923c', 'High': '#f87171', 'Very High': '#e879f9', 'Extreme': '#f43f5e' };
                                  const cardColor = riskColors[stock.riskLevel] || '#fbbf24';
                                  return (
                                    <TouchableOpacity
                                      key={stock.id}
                                      onPress={() => { setSelectedStock(stock); setTradeQty('1'); setTradeTab('BUY'); }}
                                      activeOpacity={0.8}
                                      style={{ flex: 1, borderWidth: 1, borderColor: cardColor + '40', overflow: 'hidden', backgroundColor: '#070a16' }}
                                    >
                                      {/* Coloured header */}
                                      <View style={{ backgroundColor: cardColor + '12', borderBottomWidth: 1, borderColor: cardColor + '25', padding: 10, paddingBottom: 6, position: 'relative' }}>
                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 20, color: cardColor, letterSpacing: 2 }}>{stock.ticker}</Text>
                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: cardColor + 'aa', letterSpacing: 1 }}>{stock.sector.toUpperCase()}</Text>
                                        {holding && holding.qty > 0 && (
                                          <View style={{ position: 'absolute', top: 6, right: 6, backgroundColor: '#0d1e30', borderWidth: 1, borderColor: '#3b82f6', paddingHorizontal: 4, paddingVertical: 1 }}>
                                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: '#60a5fa' }}>x{holding.qty}</Text>
                                          </View>
                                        )}
                                        {history.length > 1 && <MiniChart history={history} height={22} width={80} />}
                                      </View>
                                      {/* Price info */}
                                      <View style={{ padding: 8 }}>
                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: '#c8d4f0', lineHeight: 15 }} numberOfLines={1}>{stock.name}</Text>
                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 17, color: '#fff', marginTop: 3 }}>₹{Math.round(currentPrice).toLocaleString()}</Text>
                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: isUp ? '#4ade80' : '#f87171' }}>
                                          {isUp ? '+' : ''}{changePct.toFixed(1)}%
                                        </Text>
                                      </View>
                                    </TouchableOpacity>
                                  );
                                })}
                                {STOCKS.slice(rowIdx * 2, rowIdx * 2 + 2).length === 1 && <View style={{ flex: 1 }} />}
                              </View>
                            ))}
                          </StyledView>
                        )}

                        {/* Stock detail + trade */}
                        {investCategory === 'stocks' && selectedStock && (() => {
                          const stock = selectedStock;
                          const currentPrice = marketPrices[stock.id] || stock.price;
                          const history = priceHistory[stock.id] || [];
                          const holding = portfolio[stock.id];
                          const changePct = history.length > 1 ? ((currentPrice - history[0]) / history[0] * 100) : 0;
                          const cost = Math.round(currentPrice * (parseInt(tradeQty) || 0));
                          const riskColors = { 'Low': '#4ade80', 'Low-Medium': '#a3e635', 'Medium': '#fbbf24', 'Medium-High': '#fb923c', 'High': '#f87171', 'Very High': '#e879f9', 'Extreme': '#f43f5e' };
                          return (
                            <StyledView>
                              <StyledTouchableOpacity onPress={() => setSelectedStock(null)} className="flex-row items-center gap-2 mb-4">
                                <FontAwesome5 name="chevron-left" size={12} color="#6070a0" />
                                <StyledText className="text-gray-500 text-sm">All Stocks</StyledText>
                              </StyledTouchableOpacity>

                              {/* Stock header */}
                              <View style={{ backgroundColor: '#0a0d1a', borderWidth: 1, borderColor: '#1e2840', padding: 16, marginBottom: 12 }}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                                  <View style={{ flex: 1 }}>
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 24, color: '#c8d4f0', letterSpacing: 1 }}>{stock.name}</Text>
                                    <View style={{ flexDirection: 'row', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
                                      <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: '#445070' }}>{stock.ticker}</Text>
                                      <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: '#2a3560' }}>|</Text>
                                      <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: '#445070' }}>{stock.sector}</Text>
                                      <View style={{ borderWidth: 1, borderColor: (riskColors[stock.riskLevel] || '#fbbf24') + '50', paddingHorizontal: 5 }}>
                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: riskColors[stock.riskLevel] || '#fbbf24' }}>{stock.riskLevel} Risk</Text>
                                      </View>
                                    </View>
                                  </View>
                                  <View style={{ alignItems: 'flex-end' }}>
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 26, color: '#fff' }}>₹{Math.round(currentPrice).toLocaleString()}</Text>
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 18, color: changePct >= 0 ? '#4ade80' : '#f87171' }}>
                                      {changePct >= 0 ? '+' : ''}{changePct.toFixed(1)}%
                                    </Text>
                                  </View>
                                </View>

                                {/* Mini chart */}
                                {history.length > 1 && (
                                  <View style={{ height: 48, marginBottom: 8 }}>
                                    <MiniChart history={history} height={48} width={Dimensions.get('window').width - 80} />
                                  </View>
                                )}

                                {/* Stats row */}
                                <View style={{ flexDirection: 'row', gap: 12, flexWrap: 'wrap' }}>
                                  {stock.dividendYield > 0 && (
                                    <View>
                                      <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 12, color: '#2a3560' }}>DIV YIELD</Text>
                                      <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: '#fbbf24' }}>{stock.dividendYield}% p.a.</Text>
                                    </View>
                                  )}
                                  <View>
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 12, color: '#2a3560' }}>HIST RETURN</Text>
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: '#60a5fa' }}>{stock.historicalReturn > 0 ? '+' : ''}{stock.historicalReturn}% avg</Text>
                                  </View>
                                  {holding && holding.qty > 0 && (
                                    <View>
                                      <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 12, color: '#2a3560' }}>YOU HOLD</Text>
                                      <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: '#c8d4f0' }}>{holding.qty} shares</Text>
                                    </View>
                                  )}
                                </View>

                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: '#445070', marginTop: 10, lineHeight: 22 }}>{stock.description}</Text>
                              </View>

                              {/* Trade panel */}
                              <View style={{ backgroundColor: '#0a0d1a', borderWidth: 1, borderColor: '#1e2840', padding: 16 }}>
                                {/* BUY / SELL tabs */}
                                <View style={{ flexDirection: 'row', marginBottom: 14, borderWidth: 1, borderColor: '#1e2840' }}>
                                  {['BUY', 'SELL'].map(tab => (
                                    <TouchableOpacity key={tab} onPress={() => setTradeTab(tab)} style={{
                                      flex: 1, paddingVertical: 10, alignItems: 'center',
                                      backgroundColor: tradeTab === tab ? (tab === 'BUY' ? '#166534' : '#7f1d1d') : 'transparent',
                                    }}>
                                      <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 20, color: tradeTab === tab ? '#fff' : '#445070', letterSpacing: 2 }}>{tab}</Text>
                                    </TouchableOpacity>
                                  ))}
                                </View>

                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: '#2a3560', marginBottom: 4 }}>QUANTITY</Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                                  <TouchableOpacity onPress={() => setTradeQty(q => String(Math.max(1, parseInt(q || '1') - 1)))} style={{ width: 36, height: 36, backgroundColor: '#111828', borderWidth: 1, borderColor: '#1e2840', alignItems: 'center', justifyContent: 'center' }}>
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 24, color: '#6070a0' }}>-</Text>
                                  </TouchableOpacity>
                                  <TextInput
                                    value={tradeQty}
                                    onChangeText={setTradeQty}
                                    keyboardType="number-pad"
                                    style={{ flex: 1, fontFamily: 'VT323_400Regular', fontSize: 24, color: '#c8d4f0', backgroundColor: '#060810', borderWidth: 1, borderColor: '#1e2840', textAlign: 'center', paddingVertical: 8 }}
                                  />
                                  <TouchableOpacity onPress={() => setTradeQty(q => String(parseInt(q || '1') + 1))} style={{ width: 36, height: 36, backgroundColor: '#111828', borderWidth: 1, borderColor: '#1e2840', alignItems: 'center', justifyContent: 'center' }}>
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 24, color: '#6070a0' }}>+</Text>
                                  </TouchableOpacity>
                                </View>

                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 }}>
                                  <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 18, color: '#445070' }}>
                                    {parseInt(tradeQty) || 0} x ₹{Math.round(currentPrice).toLocaleString()}
                                  </Text>
                                  <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 20, color: tradeTab === 'BUY' ? '#f87171' : '#4ade80', fontWeight: 'bold' }}>
                                    {tradeTab === 'BUY' ? '-' : '+'}₹{cost.toLocaleString()}
                                  </Text>
                                </View>

                                <TouchableOpacity
                                  onPress={() => handleTrade(stock, tradeQty, tradeTab)}
                                  style={{ backgroundColor: tradeTab === 'BUY' ? '#166534' : '#7f1d1d', paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: tradeTab === 'BUY' ? '#22c55e' : '#ef4444', position: 'relative', overflow: 'hidden' }}
                                  activeOpacity={0.85}
                                >
                                  <View style={{ position: 'absolute', top: 0, left: 0, width: 6, height: 6, backgroundColor: tradeTab === 'BUY' ? '#22c55e' : '#ef4444' }} />
                                  <View style={{ position: 'absolute', top: 0, right: 0, width: 6, height: 6, backgroundColor: tradeTab === 'BUY' ? '#22c55e' : '#ef4444' }} />
                                  <View style={{ position: 'absolute', bottom: 0, left: 0, width: 6, height: 6, backgroundColor: tradeTab === 'BUY' ? '#22c55e' : '#ef4444' }} />
                                  <View style={{ position: 'absolute', bottom: 0, right: 0, width: 6, height: 6, backgroundColor: tradeTab === 'BUY' ? '#22c55e' : '#ef4444' }} />
                                  <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 22, color: '#fff', letterSpacing: 2 }}>
                                    {tradeTab} {stock.ticker}
                                  </Text>
                                </TouchableOpacity>

                                {/* SIP for stocks */}
                                <TouchableOpacity
                                  onPress={() => { const res = addSIP('stock', stock.id, Math.round(currentPrice)); showDialog(res.success ? 'SIP Started' : 'SIP Failed', res.msg, res.success ? 'success' : 'error'); }}
                                  style={{ marginTop: 10, paddingVertical: 10, alignItems: 'center', borderWidth: 1, borderColor: '#2a3560', backgroundColor: 'transparent' }}
                                >
                                  <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 18, color: '#6070a0' }}>
                                    Start SIP — Auto-buy every month
                                  </Text>
                                </TouchableOpacity>
                              </View>
                            </StyledView>
                          );
                        })()}

                        {/* ===== MUTUAL FUNDS ===== */}
                        {investCategory === 'mf' && !selectedMF && (
                          <StyledView>
                            <StyledText className="text-xl font-bold text-white mb-1 uppercase tracking-wider">Mutual Funds</StyledText>
                            <StyledText className="text-gray-500 text-sm mb-4">SIP or lump sum — SEBI regulated funds</StyledText>

                            {/* Active SIPs */}
                            {sipPlans.filter(s => s.type === 'mf').length > 0 && (
                              <View style={{ backgroundColor: '#0a0d1a', borderWidth: 1, borderColor: '#1e2840', padding: 12, marginBottom: 14 }}>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: '#6070a0', letterSpacing: 2, marginBottom: 8 }}>ACTIVE SIPS</Text>
                                {sipPlans.filter(s => s.type === 'mf').map(sip => {
                                  const mf = MUTUAL_FUNDS.find(m => m.id === sip.assetId);
                                  return (
                                    <View key={sip.id} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                                      <View>
                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: '#c8d4f0' }}>{mf?.name || sip.assetId}</Text>
                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: '#445070' }}>₹{sip.amount.toLocaleString()}/mo • Total: ₹{(sip.totalInvested || 0).toLocaleString()}</Text>
                                      </View>
                                      <TouchableOpacity onPress={() => { cancelSIP(sip.id); }} style={{ borderWidth: 1, borderColor: '#7f1d1d', paddingHorizontal: 10, paddingVertical: 4 }}>
                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: '#f87171' }}>CANCEL</Text>
                                      </TouchableOpacity>
                                    </View>
                                  );
                                })}
                              </View>
                            )}

                            {Array.from({ length: Math.ceil(MUTUAL_FUNDS.length / 2) }).map((_, rowIdx) => (
                              <View key={rowIdx} style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
                                {MUTUAL_FUNDS.slice(rowIdx * 2, rowIdx * 2 + 2).map(mf => {
                                  const currentNav = mfNavs[mf.id] || mf.nav;
                                  const holding = mfPortfolio[mf.id];
                                  const navChange = ((currentNav - mf.nav) / mf.nav * 100);
                                  const hasSIP = sipPlans.some(s => s.assetId === mf.id);
                                  const catColors = { 'Index Fund': '#38b2ac', 'Large Cap': '#3b82f6', 'Mid Cap': '#a78bfa', 'Small Cap': '#f59e0b', 'Flexi Cap': '#ec4899', 'Multi Cap': '#ec4899', 'Debt': '#4ade80', 'Hybrid': '#fb923c' };
                                  const cardColor = catColors[mf.category] || '#818cf8';
                                  return (
                                    <TouchableOpacity
                                      key={mf.id}
                                      onPress={() => { setSelectedMF(mf); setMfAmount('5000'); setMfTab('LUMPSUM'); }}
                                      activeOpacity={0.8}
                                      style={{ flex: 1, borderWidth: 1, borderColor: cardColor + '40', overflow: 'hidden', backgroundColor: '#070a16' }}
                                    >
                                      {/* Coloured header */}
                                      <View style={{ backgroundColor: cardColor + '12', borderBottomWidth: 1, borderColor: cardColor + '25', padding: 10, paddingBottom: 8, position: 'relative' }}>
                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 12, color: cardColor, letterSpacing: 2 }}>{mf.category.toUpperCase()}</Text>
                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: '#445070', letterSpacing: 1 }}>{mf.amc}</Text>
                                        {hasSIP && (
                                          <View style={{ position: 'absolute', top: 6, right: 6, backgroundColor: '#1e1b4b', borderWidth: 1, borderColor: '#312e81', paddingHorizontal: 4, paddingVertical: 1 }}>
                                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 10, color: '#818cf8' }}>SIP</Text>
                                          </View>
                                        )}
                                        <View style={{ flexDirection: 'row', gap: 10, marginTop: 6 }}>
                                          <View>
                                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 10, color: '#2a3560' }}>3Y</Text>
                                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: '#4ade80' }}>{mf.returns_3yr}%</Text>
                                          </View>
                                          <View>
                                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 10, color: '#2a3560' }}>5Y</Text>
                                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: '#4ade80' }}>{mf.returns_5yr}%</Text>
                                          </View>
                                        </View>
                                      </View>
                                      {/* Info */}
                                      <View style={{ padding: 8 }}>
                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: '#c8d4f0', lineHeight: 15 }} numberOfLines={2}>{mf.name}</Text>
                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 17, color: '#fff', marginTop: 4 }}>₹{currentNav.toFixed(2)}</Text>
                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: navChange >= 0 ? '#4ade80' : '#f87171' }}>
                                          {navChange >= 0 ? '+' : ''}{navChange.toFixed(1)}%
                                        </Text>
                                        {holding && holding.units > 0 && (
                                          <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 12, color: '#60a5fa', marginTop: 2 }}>
                                            ₹{Math.round(holding.units * currentNav).toLocaleString()}
                                          </Text>
                                        )}
                                      </View>
                                    </TouchableOpacity>
                                  );
                                })}
                                {MUTUAL_FUNDS.slice(rowIdx * 2, rowIdx * 2 + 2).length === 1 && <View style={{ flex: 1 }} />}
                              </View>
                            ))}
                          </StyledView>
                        )}

                        {/* MF detail + invest */}
                        {investCategory === 'mf' && selectedMF && (() => {
                          const mf = selectedMF;
                          const currentNav = mfNavs[mf.id] || mf.nav;
                          const holding = mfPortfolio[mf.id];
                          const units = parseFloat(mfAmount) / currentNav;
                          return (
                            <StyledView>
                              <StyledTouchableOpacity onPress={() => setSelectedMF(null)} className="flex-row items-center gap-2 mb-4">
                                <FontAwesome5 name="chevron-left" size={12} color="#6070a0" />
                                <StyledText className="text-gray-500 text-sm">All Funds</StyledText>
                              </StyledTouchableOpacity>

                              <View style={{ backgroundColor: '#0a0d1a', borderWidth: 1, borderColor: '#1e2840', padding: 16, marginBottom: 12 }}>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 22, color: '#c8d4f0', marginBottom: 4 }}>{mf.name}</Text>
                                <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
                                  <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: '#445070' }}>{mf.amc}  •  {mf.category}</Text>
                                </View>
                                <View style={{ flexDirection: 'row', gap: 20, flexWrap: 'wrap', marginBottom: 12 }}>
                                  <View><Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: '#2a3560' }}>CURRENT NAV</Text><Text style={{ fontFamily: 'VT323_400Regular', fontSize: 20, color: '#fff' }}>₹{currentNav.toFixed(2)}</Text></View>
                                  <View><Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: '#2a3560' }}>1Y</Text><Text style={{ fontFamily: 'VT323_400Regular', fontSize: 20, color: '#4ade80' }}>{mf.returns_1yr}%</Text></View>
                                  <View><Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: '#2a3560' }}>3Y</Text><Text style={{ fontFamily: 'VT323_400Regular', fontSize: 20, color: '#4ade80' }}>{mf.returns_3yr}%</Text></View>
                                  <View><Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: '#2a3560' }}>EXP RATIO</Text><Text style={{ fontFamily: 'VT323_400Regular', fontSize: 20, color: '#fbbf24' }}>{mf.expenseRatio}%</Text></View>
                                </View>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: '#445070', lineHeight: 22 }}>{mf.description}</Text>
                                {holding && holding.units > 0 && (
                                  <View style={{ marginTop: 10, borderTopWidth: 1, borderColor: '#1e2840', paddingTop: 10 }}>
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: '#445070' }}>
                                      You own {holding.units.toFixed(3)} units  •  Value: ₹{Math.round(holding.units * currentNav).toLocaleString()}
                                    </Text>
                                  </View>
                                )}
                              </View>

                              {/* Tabs */}
                              <View style={{ flexDirection: 'row', borderWidth: 1, borderColor: '#1e2840', marginBottom: 12 }}>
                                {['LUMPSUM', 'SIP'].map(tab => (
                                  <TouchableOpacity key={tab} onPress={() => setMfTab(tab)} style={{ flex: 1, paddingVertical: 10, alignItems: 'center', backgroundColor: mfTab === tab ? '#1d4ed8' : 'transparent' }}>
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 18, color: mfTab === tab ? '#fff' : '#445070' }}>{tab}</Text>
                                  </TouchableOpacity>
                                ))}
                              </View>

                              <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: '#2a3560', marginBottom: 6 }}>
                                {mfTab === 'SIP' ? 'MONTHLY SIP AMOUNT' : 'INVESTMENT AMOUNT'}
                              </Text>
                              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 22, color: '#60a5fa' }}>₹</Text>
                                <TextInput value={mfAmount} onChangeText={setMfAmount} keyboardType="number-pad" style={{ flex: 1, fontFamily: 'VT323_400Regular', fontSize: 22, color: '#c8d4f0', backgroundColor: '#060810', borderWidth: 1, borderColor: '#1e2840', paddingHorizontal: 12, paddingVertical: 8 }} />
                              </View>
                              {mfTab === 'LUMPSUM' && (
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: '#445070', marginBottom: 14 }}>
                                  = {units.toFixed(3)} units @ NAV ₹{currentNav.toFixed(2)}
                                </Text>
                              )}

                              <TouchableOpacity
                                onPress={() => handleBuyMF(mf, mfAmount, mfTab === 'SIP')}
                                style={{ backgroundColor: '#1d4ed8', paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: '#3b82f6', position: 'relative', overflow: 'hidden' }}
                                activeOpacity={0.85}
                              >
                                <View style={{ position: 'absolute', top: 0, left: 0, width: 6, height: 6, backgroundColor: '#3b82f6' }} />
                                <View style={{ position: 'absolute', top: 0, right: 0, width: 6, height: 6, backgroundColor: '#3b82f6' }} />
                                <View style={{ position: 'absolute', bottom: 0, left: 0, width: 6, height: 6, backgroundColor: '#3b82f6' }} />
                                <View style={{ position: 'absolute', bottom: 0, right: 0, width: 6, height: 6, backgroundColor: '#3b82f6' }} />
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 22, color: '#fff', letterSpacing: 2 }}>
                                  {mfTab === 'SIP' ? 'START SIP' : 'INVEST NOW'}
                                </Text>
                              </TouchableOpacity>
                            </StyledView>
                          );
                        })()}

                        {/* ===== RETIREMENT ===== */}
                        {investCategory === 'retirement' && (
                          <StyledView>
                            <StyledText className="text-xl font-bold text-white mb-1 uppercase tracking-wider">Retirement Savings</StyledText>
                            <StyledText className="text-gray-500 text-sm mb-4">Tax-advantaged accounts. Locked till retirement age.</StyledText>

                            {/* PPF */}
                            <View style={{ backgroundColor: '#0a0d1a', borderWidth: 1, borderColor: '#78350f', padding: 16, marginBottom: 16 }}>
                              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                                <View>
                                  <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 22, color: '#fbbf24', letterSpacing: 1 }}>PPF</Text>
                                  <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: '#92400e' }}>Public Provident Fund</Text>
                                </View>
                                <View style={{ alignItems: 'flex-end' }}>
                                  <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 28, color: '#fbbf24' }}>₹{ppf.balance.toLocaleString()}</Text>
                                  <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: '#92400e' }}>7.1% p.a. guaranteed</Text>
                                </View>
                              </View>
                              <View style={{ flexDirection: 'row', gap: 16, marginBottom: 14 }}>
                                <View><Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: '#92400e' }}>THIS YEAR</Text><Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: '#c8d4f0' }}>₹{ppf.contributionsThisYear.toLocaleString()}</Text></View>
                                <View><Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: '#92400e' }}>MAX/YEAR</Text><Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: '#c8d4f0' }}>₹1,50,000</Text></View>
                                <View><Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: '#92400e' }}>TAX</Text><Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: '#4ade80' }}>80C deduction</Text></View>
                              </View>
                              <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: '#2a3560', marginBottom: 12 }}>CONTRIBUTE AMOUNT</Text>
                              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 22, color: '#fbbf24' }}>₹</Text>
                                <TextInput value={ppfAmount} onChangeText={setPpfAmount} keyboardType="number-pad" style={{ flex: 1, fontFamily: 'VT323_400Regular', fontSize: 22, color: '#c8d4f0', backgroundColor: '#060810', borderWidth: 1, borderColor: '#78350f', paddingHorizontal: 12, paddingVertical: 8 }} />
                              </View>
                              <TouchableOpacity onPress={handleContributePPF} style={{ backgroundColor: '#92400e', paddingVertical: 12, alignItems: 'center', borderWidth: 1, borderColor: '#fbbf24' }}>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 20, color: '#fff', letterSpacing: 2 }}>CONTRIBUTE TO PPF</Text>
                              </TouchableOpacity>
                            </View>

                            {/* NPS */}
                            <View style={{ backgroundColor: '#0a0d1a', borderWidth: 1, borderColor: '#1e3a5f', padding: 16, marginBottom: 16 }}>
                              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                                <View>
                                  <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 22, color: '#60a5fa', letterSpacing: 1 }}>NPS</Text>
                                  <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: '#1e4080' }}>National Pension System</Text>
                                </View>
                                <View style={{ alignItems: 'flex-end' }}>
                                  <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 28, color: '#60a5fa' }}>₹{nps.balance.toLocaleString()}</Text>
                                  <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: '#1e4080' }}>{nps.equityPct}% equity / {100 - nps.equityPct}% debt</Text>
                                </View>
                              </View>
                              <View style={{ flexDirection: 'row', gap: 16, marginBottom: 14 }}>
                                <View><Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: '#1e4080' }}>EST RETURN</Text><Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: '#c8d4f0' }}>8-14% p.a.</Text></View>
                                <View><Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: '#1e4080' }}>TAX</Text><Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: '#4ade80' }}>80CCD +₹50K</Text></View>
                              </View>
                              <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: '#2a3560', marginBottom: 8 }}>EQUITY % (higher = more growth + risk)</Text>
                              <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
                                {['25', '50', '75'].map(pct => (
                                  <TouchableOpacity key={pct} onPress={() => setNpsEquity(pct)} style={{ flex: 1, paddingVertical: 8, alignItems: 'center', borderWidth: 1, borderColor: npsEquity === pct ? '#60a5fa' : '#1e2840', backgroundColor: npsEquity === pct ? '#0d2040' : 'transparent' }}>
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 18, color: npsEquity === pct ? '#60a5fa' : '#445070' }}>{pct}%</Text>
                                  </TouchableOpacity>
                                ))}
                              </View>
                              <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: '#2a3560', marginBottom: 8 }}>AMOUNT</Text>
                              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 22, color: '#60a5fa' }}>₹</Text>
                                <TextInput value={npsAmount} onChangeText={setNpsAmount} keyboardType="number-pad" style={{ flex: 1, fontFamily: 'VT323_400Regular', fontSize: 22, color: '#c8d4f0', backgroundColor: '#060810', borderWidth: 1, borderColor: '#1e3a5f', paddingHorizontal: 12, paddingVertical: 8 }} />
                              </View>
                              <TouchableOpacity onPress={handleContributeNPS} style={{ backgroundColor: '#1e3a5f', paddingVertical: 12, alignItems: 'center', borderWidth: 1, borderColor: '#60a5fa' }}>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 20, color: '#fff', letterSpacing: 2 }}>CONTRIBUTE TO NPS</Text>
                              </TouchableOpacity>
                            </View>

                            <View style={{ backgroundColor: '#060810', borderWidth: 1, borderColor: '#1a2040', padding: 12 }}>
                              <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: '#2a3560', lineHeight: 22 }}>
                                PPF: Guaranteed 7.1%, tax-free maturity, 15-year lock-in. Max 80C deduction.{'\n'}
                                NPS: Market-linked, 60% lump sum at 60, 40% annuity. Extra ₹50K deduction under 80CCD.
                              </Text>
                            </View>
                          </StyledView>
                        )}

                        {/* COMMERCIAL */}
                        {investCategory === 'commercial' && (
                          <StyledView>
                            <StyledText className="text-xl font-bold text-white mb-2 uppercase tracking-wider">Commercial Properties</StyledText>
                            <StyledText className="text-gray-400 text-sm mb-4">Business leases — higher yield, higher price</StyledText>
                            {COMMERCIAL_PROPERTIES.map(prop => {
                              const isOwned = properties.includes(prop.id);
                              return (
                                <StyledView key={prop.id} className="bg-white/5 rounded-xl mb-4 border border-white/5 overflow-hidden">
                                  <StyledImage source={prop.image} style={{ width: '100%', height: 128 }} resizeMode="cover" />
                                  <StyledView className="p-3">
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                                      <StyledText className="text-white font-bold text-lg flex-1">{prop.name}</StyledText>
                                      {isOwned && <View style={{ backgroundColor: '#166534', paddingHorizontal: 8, paddingVertical: 2 }}><Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: '#4ade80' }}>OWNED</Text></View>}
                                    </View>
                                    <View style={{ flexDirection: 'row', gap: 12, marginBottom: 4 }}>
                                      <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: '#fbbf24' }}>₹{prop.price.toLocaleString()}</Text>
                                      <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: '#4ade80' }}>+₹{prop.rental_income.toLocaleString()}/mo</Text>
                                    </View>
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: '#f87171', marginBottom: 8 }}>Maintenance: -₹{prop.maintenance.toLocaleString()}/mo</Text>
                                    <StyledTouchableOpacity onPress={() => setSelectedProperty(prop)} className="py-2 rounded items-center bg-indigo-600">
                                      <StyledText className="text-white font-bold text-sm uppercase tracking-wider">View Details</StyledText>
                                    </StyledTouchableOpacity>
                                  </StyledView>
                                </StyledView>
                              );
                            })}
                          </StyledView>
                        )}

                        {/* MY ASSETS */}
                        {investCategory === 'assets' && (
                          <StyledView>
                            <StyledText className="text-xl font-bold text-white mb-2 uppercase tracking-wider">My Portfolio</StyledText>

                            {/* Summary */}
                            <View style={{ backgroundColor: '#0a0d1a', borderWidth: 1, borderColor: '#1e2840', padding: 14, marginBottom: 16 }}>
                              <View style={{ flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                                {[
                                  { label: 'Stocks', value: `₹${Math.round(Object.keys(portfolio).reduce((t, id) => { const h = portfolio[id]; return t + (h.qty || 0) * (marketPrices[id] || 0); }, 0)).toLocaleString()}` },
                                  { label: 'Mut. Funds', value: `₹${Math.round(Object.keys(mfPortfolio).reduce((t, id) => { const h = mfPortfolio[id]; return t + (h.units || 0) * (mfNavs[id] || 0); }, 0)).toLocaleString()}` },
                                  { label: 'PPF+NPS', value: `₹${(ppf.balance + nps.balance).toLocaleString()}` },
                                  { label: 'Real Estate', value: `₹${properties.reduce((t, id) => { const p = REAL_ESTATE.find(x => x.id === id); return t + (p ? p.price : 0); }, 0).toLocaleString()}` },
                                ].map(item => (
                                  <View key={item.label}>
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: '#2a3560' }}>{item.label.toUpperCase()}</Text>
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 18, color: '#c8d4f0' }}>{item.value}</Text>
                                  </View>
                                ))}
                              </View>
                            </View>

                            {/* Stock holdings */}
                            {Object.keys(portfolio).filter(id => (portfolio[id]?.qty || 0) > 0).length > 0 && (
                              <>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: '#445070', letterSpacing: 2, marginBottom: 8 }}>STOCK HOLDINGS</Text>
                                {Object.keys(portfolio).filter(id => (portfolio[id]?.qty || 0) > 0).map(stockId => {
                                  const stock = STOCKS.find(s => s.id === stockId);
                                  const holding = portfolio[stockId];
                                  const currentPrice = marketPrices[stockId] || 0;
                                  const value = holding.qty * currentPrice;
                                  const pl = (currentPrice - holding.avgPrice) * holding.qty;
                                  return (
                                    <View key={stockId} style={{ backgroundColor: '#0a0d1a', borderWidth: 1, borderColor: '#1e2840', padding: 12, marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between' }}>
                                      <View>
                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 17, color: '#c8d4f0' }}>{stock?.ticker || stockId}</Text>
                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: '#445070' }}>{holding.qty} shares @ ₹{Math.round(holding.avgPrice).toLocaleString()}</Text>
                                      </View>
                                      <View style={{ alignItems: 'flex-end' }}>
                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 17, color: '#c8d4f0' }}>₹{Math.round(value).toLocaleString()}</Text>
                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 15, color: pl >= 0 ? '#4ade80' : '#f87171' }}>
                                          {pl >= 0 ? '+' : ''}₹{Math.round(pl).toLocaleString()}
                                        </Text>
                                      </View>
                                    </View>
                                  );
                                })}
                              </>
                            )}

                            {/* MF holdings */}
                            {Object.keys(mfPortfolio).filter(id => (mfPortfolio[id]?.units || 0) > 0.001).length > 0 && (
                              <>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: '#445070', letterSpacing: 2, marginBottom: 8, marginTop: 12 }}>MUTUAL FUND HOLDINGS</Text>
                                {Object.keys(mfPortfolio).filter(id => (mfPortfolio[id]?.units || 0) > 0.001).map(mfId => {
                                  const mf = MUTUAL_FUNDS.find(m => m.id === mfId);
                                  const holding = mfPortfolio[mfId];
                                  const currentNav = mfNavs[mfId] || 0;
                                  const value = holding.units * currentNav;
                                  const pl = (currentNav - holding.avgNav) * holding.units;
                                  return (
                                    <View key={mfId} style={{ backgroundColor: '#0a0d1a', borderWidth: 1, borderColor: '#1e2840', padding: 12, marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between' }}>
                                      <View style={{ flex: 1, marginRight: 8 }}>
                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: '#c8d4f0' }}>{mf?.name || mfId}</Text>
                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: '#445070' }}>{holding.units.toFixed(3)} units @ ₹{holding.avgNav.toFixed(2)}</Text>
                                      </View>
                                      <View style={{ alignItems: 'flex-end' }}>
                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 17, color: '#c8d4f0' }}>₹{Math.round(value).toLocaleString()}</Text>
                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 15, color: pl >= 0 ? '#4ade80' : '#f87171' }}>
                                          {pl >= 0 ? '+' : ''}₹{Math.round(pl).toLocaleString()}
                                        </Text>
                                      </View>
                                    </View>
                                  );
                                })}
                              </>
                            )}

                            {/* Properties */}
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: '#445070', letterSpacing: 2, marginBottom: 8, marginTop: 12 }}>REAL ESTATE</Text>
                            {properties.length === 0 ? (
                              <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: '#2a3560', marginBottom: 12 }}>No properties owned yet.</Text>
                            ) : properties.map(propId => {
                              const prop = REAL_ESTATE.find(p => p.id === propId);
                              if (!prop) return null;
                              const isCurrentHome = currentHousing?.id === prop.id;
                              return (
                                <View key={prop.id} style={{ backgroundColor: '#0a0d1a', borderWidth: 1, borderColor: '#1e2840', marginBottom: 10, flexDirection: 'row', overflow: 'hidden' }}>
                                  <StyledImage source={prop.image} style={{ width: 80, height: 80 }} resizeMode="cover" />
                                  <View style={{ flex: 1, padding: 10, justifyContent: 'space-between' }}>
                                    <View>
                                      <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 17, color: '#c8d4f0', lineHeight: 19 }}>{prop.name}</Text>
                                      <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: '#445070', letterSpacing: 1 }}>{prop.category.toUpperCase()}</Text>
                                      {isCurrentHome && (
                                        <View style={{ borderWidth: 1, borderColor: '#166534', paddingHorizontal: 6, paddingVertical: 1, alignSelf: 'flex-start', marginTop: 2 }}>
                                          <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 12, color: '#4ade80' }}>LIVING HERE</Text>
                                        </View>
                                      )}
                                    </View>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                      <View>
                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: '#4ade80' }}>+₹{prop.rental_income.toLocaleString()}/mo</Text>
                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: '#445070' }}>₹{prop.price.toLocaleString()}</Text>
                                      </View>
                                      <TouchableOpacity
                                        onPress={() => {
                                          if (isCurrentHome) { showDialog('Cannot Sell', 'Move out first before selling your home.', 'error'); return; }
                                          showDialog('Sell Property?', `Sell ${prop.name} for ₹${prop.price.toLocaleString()}?`, 'warning',
                                            () => { const r = sellProperty(prop.id); showDialog(r.success ? 'Sold!' : 'Failed', r.msg, r.success ? 'success' : 'error'); },
                                            'SELL', 'Cancel', closeDialog
                                          );
                                        }}
                                        style={{ paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: isCurrentHome ? '#1e2840' : '#7f1d1d', backgroundColor: isCurrentHome ? 'transparent' : '#1a0505' }}
                                      >
                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: isCurrentHome ? '#2a3560' : '#f87171' }}>SELL</Text>
                                      </TouchableOpacity>
                                    </View>
                                  </View>
                                </View>
                              );
                            })}

                            {/* Rental income summary */}
                            {properties.length > 0 && (() => {
                              const totalRental = properties.reduce((t, id) => {
                                const p = REAL_ESTATE.find(x => x.id === id);
                                return t + (p?.rental_income || 0);
                              }, 0);
                              return totalRental > 0 ? (
                                <View style={{ backgroundColor: '#061410', borderWidth: 1, borderColor: '#14532d', padding: 12, marginBottom: 12, marginTop: 4, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <View>
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 12, color: '#14532d', letterSpacing: 3 }}>PASSIVE INCOME</Text>
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 22, color: '#4ade80' }}>₹{totalRental.toLocaleString()}<Text style={{ fontSize: 14, color: '#166534' }}>/mo rental</Text></Text>
                                  </View>
                                  <Text style={{ fontSize: 28 }}>🏘️</Text>
                                </View>
                              ) : null;
                            })()}

                            {/* Retire Early button */}
                            {!isRetired && playerAge >= 45 && (ppf.balance + nps.balance) >= 10000000 && (
                              <TouchableOpacity
                                onPress={() => {
                                  showDialog('Retire Early?', `You have ₹${((ppf.balance + nps.balance) / 100000).toFixed(0)}L corpus at age ${playerAge}. Retire now for ₹${Math.round((ppf.balance + nps.balance) * 0.04 / 12).toLocaleString()}/mo pension?`, 'warning',
                                    () => { const r = retireEarly(); if (!r.success) showDialog('Cannot Retire', r.msg, 'error'); },
                                    'RETIRE NOW', 'Not Yet', closeDialog
                                  );
                                }}
                                style={{ borderWidth: 1, borderColor: '#f59e0b80', backgroundColor: '#1a1200', padding: 14, marginBottom: 12, flexDirection: 'row', alignItems: 'center', gap: 12 }}
                              >
                                <Text style={{ fontSize: 24 }}>🌴</Text>
                                <View style={{ flex: 1 }}>
                                  <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 12, color: '#92400e', letterSpacing: 3 }}>YOU CAN RETIRE EARLY</Text>
                                  <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 18, color: '#fbbf24' }}>Corpus ready — Tap to retire now</Text>
                                </View>
                                <FontAwesome5 name="chevron-right" size={14} color="#f59e0b" />
                              </TouchableOpacity>
                            )}

                            {/* Active SIPs summary */}
                            {sipPlans.length > 0 && (
                              <>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: '#445070', letterSpacing: 2, marginBottom: 8, marginTop: 12 }}>ACTIVE SIPS</Text>
                                {sipPlans.map(sip => {
                                  const stock = STOCKS.find(s => s.id === sip.assetId);
                                  const mf = MUTUAL_FUNDS.find(m => m.id === sip.assetId);
                                  const name = stock?.name || mf?.name || sip.assetId;
                                  return (
                                    <View key={sip.id} style={{ backgroundColor: '#0a0d1a', borderWidth: 1, borderColor: '#1e2840', padding: 10, marginBottom: 6, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                      <View>
                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: '#c8d4f0' }}>{name}</Text>
                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: '#445070' }}>₹{sip.amount.toLocaleString()}/mo • Invested: ₹{(sip.totalInvested || 0).toLocaleString()}</Text>
                                      </View>
                                      <TouchableOpacity onPress={() => cancelSIP(sip.id)} style={{ borderWidth: 1, borderColor: '#7f1d1d', paddingHorizontal: 8, paddingVertical: 3 }}>
                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: '#f87171' }}>STOP</Text>
                                      </TouchableOpacity>
                                    </View>
                                  );
                                })}
                              </>
                            )}
                          </StyledView>
                        )}
                      </StyledView>
                    )}
                  </StyledView>
              </ScrollView>
            )}
            {moneySubTab === 'bank' && <BankScreen onClose={() => setActiveTab('home')} onShowDialog={(title, msg, type) => showDialog(title, msg, type)} />}
            {moneySubTab === 'insure' && <InsuranceScreen onClose={() => setActiveTab('home')} />}
          </View>
        )}

        {/* FAMILY TAB */}
        {activeTab === 'family' && (
          <FamilyScreen onClose={() => setActiveTab('home')} onGoToBank={() => { setActiveTab('money'); setMoneySubTab('bank'); }} />
        )}

        </View>

        {/* ── GROCERY OVERLAY ── */}
        {showGrocery && (
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 200, backgroundColor: '#06080f' }}>
            <ShopScreen onClose={() => setShowGrocery(false)} />
          </View>
        )}

        {/* ── GOALS OVERLAY — accessible from navbar on all non-home tabs ── */}
        {showGoals && (
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 200, backgroundColor: '#06080f' }}>
            <GoalsScreen onClose={() => setShowGoals(false)} onShop={() => { setShowGoals(false); setShowGrocery(true); }} />
          </View>
        )}

        {/* ── INTERVIEW MODAL ── */}
        <InterviewModal />

        {/* ── DAILY LIMIT OVERLAY — shown when 6 turns exhausted ── */}
        <DailyLimitScreen
          visible={showDailyLimit}
          turnsUsed={DAILY_TURN_LIMIT - turnsLeftToday()}
          dailyLimit={DAILY_TURN_LIMIT}
          monthsPlayedToday={monthsPlayedTodayRef.current}
          onDismiss={() => setShowDailyLimit(false)}
          onCrisisSimulator={() => { setShowDailyLimit(false); setShowCrisisSimulator(true); }}
        />

        {/* ── CRISIS SIMULATOR — accessible from daily limit screen ── */}
        <CrisisSimulator
          visible={showCrisisSimulator}
          gameState={{
            balance, netWorth,
            currentJob,
            loans,
            activeInsurance,
            portfolio, marketPrices,
            mfPortfolio, mfNavs,
            properties,
            dependents,
            sipPlans,
          }}
          onClose={() => setShowCrisisSimulator(false)}
        />

        <View style={{ zIndex: 500 }}>
        <BottomTabBar
          activeTab={activeTab}
          onTabPress={(tab) => {
            setShowGrocery(false);
            setShowGoals(false);
            setActiveTab(tab);
            if (tab !== 'money') { setInvestCategory(null); setMoneySubTab(null); setSelectedMF(null); }
          }}
          onGrocery={() => { setShowGoals(false); setShowGrocery(true); }}
          onGoals={() => { setShowGrocery(false); setShowGoals(true); }}
          showGrocery={showGrocery}
          showGoals={showGoals}
          onNextMonth={handleAdvanceTime}
          turnsLeft={turnsLeftToday()}
          dailyLimit={DAILY_TURN_LIMIT}
          badges={{
            home: (() => { const n = eventInbox.filter(e => !e.read).length; return n > 0 ? n : null; })(),
            career: (!currentJob && totalMonthsPlayed > 0) ? true : null,
            money: null,
            family: (health < 30 || (activeInsurance.length === 0 && dependents.length > 0)) ? true : null,
          }}
        />
        </View>

        {/* --- JOB DETAIL MODAL (Unchanged Logic, just ensuring it overlays everything) --- */}
        <ResponsiveModal
          visible={!!selectedJob}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setSelectedJob(null)}
        >
          <StyledView className="flex-1 justify-end bg-black" style={{ flex: 1 }}>
            {/* Header Image */}
            <StyledView className="h-64 w-full relative">
              <StyledImage source={selectedJob?.office_image || selectedJob?.image} className="w-full h-full" resizeMode="contain" style={{ width: '100%', height: '100%', backgroundColor: '#000' }} />
              <StyledTouchableOpacity
                onPress={() => setSelectedJob(null)}
                className="absolute top-12 right-4 bg-black/50 p-2 rounded-full"
              >
                <Ionicons name="close" size={24} color="white" />
              </StyledTouchableOpacity>
            </StyledView>

            {/* Content */}
            <StyledView className="flex-1 p-6 bg-gray-900 rounded-t-3xl -mt-6" style={{ flex: 1 }}>
              <StyledText className="text-3xl font-bold text-white mb-1">{selectedJob?.name}</StyledText>
              <StyledText className="text-indigo-400 text-sm font-bold uppercase tracking-wider mb-6">{selectedJob?.type}</StyledText>

              <StyledView className="bg-white/5 p-4 rounded-xl border border-white/5 mb-6">
                <StyledText className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-1">Monthly Salary</StyledText>
                <StyledText className="text-2xl font-bold text-green-400">₹{selectedJob?.salary.toLocaleString()}</StyledText>
              </StyledView>

              <StyledView className="mb-6">
                <StyledText className="text-white font-bold mb-3 flex-row items-center gap-2">Requirements</StyledText>

                {selectedJob && (
                  <StyledView className={`p-3 rounded-lg border flex-row justify-between items-center mb-2 ${netWorth >= selectedJob.req_net_worth ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
                    <StyledText className={`text-sm font-bold ${netWorth >= selectedJob.req_net_worth ? 'text-green-400' : 'text-red-400'}`}>Net Worth {'>'} ₹{selectedJob.req_net_worth.toLocaleString()}</StyledText>
                    {netWorth >= selectedJob.req_net_worth ? <FontAwesome5 name="check-circle" size={16} color="#4ADE80" /> : <FontAwesome5 name="exclamation-circle" size={16} color="#F87171" />}
                  </StyledView>
                )}

                {selectedJob?.req_degrees.map((deg, i) => {
                  const hasDegree = degrees ? degrees.includes(deg) : false;
                  return (
                    <StyledView key={i} className={`p-3 rounded-lg border border-red-500/20 bg-red-500/10 mb-2 flex-row justify-between items-center ${hasDegree ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
                      <StyledText className={`text-sm font-bold ${hasDegree ? 'text-green-400' : 'text-red-400'}`}>{deg}</StyledText>
                      <FontAwesome5 name={hasDegree ? "check-circle" : "exclamation-circle"} size={16} color={hasDegree ? "#4ADE80" : "#F87171"} />
                    </StyledView>
                  );
                })}
              </StyledView>

              <StyledText className="text-gray-400 text-sm leading-relaxed mb-6">
                {selectedJob?.description}
              </StyledText>

              <StyledTouchableOpacity
                onPress={() => handleApply(selectedJob)}
                disabled={selectedJob && !checkJobRequirements(selectedJob).allowed}
                className={`w-full py-4 rounded-xl items-center ${selectedJob && checkJobRequirements(selectedJob).allowed ? 'bg-indigo-600' : 'bg-gray-700'}`}
              >
                <StyledText className={`font-bold text-lg uppercase tracking-widest ${selectedJob && checkJobRequirements(selectedJob).allowed ? 'text-white' : 'text-gray-500'}`}>
                  {selectedJob && checkJobRequirements(selectedJob).allowed ? 'Apply Now' : 'Locked'}
                </StyledText>
              </StyledTouchableOpacity>
            </StyledView>
          </StyledView>
        </ResponsiveModal>

        <ResponsiveModal
          visible={!!selectedProperty}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setSelectedProperty(null)}
        >
          <StyledView className="flex-1 justify-end bg-black" style={{ flex: 1 }}>
            {/* Header Image */}
            <StyledView className="h-64 w-full relative">
              <StyledImage source={selectedProperty?.image} className="w-full h-full" resizeMode="cover" style={{ width: '100%', height: '100%', backgroundColor: '#000' }} />
              <StyledTouchableOpacity
                onPress={() => setSelectedProperty(null)}
                className="absolute top-12 right-4 bg-black/50 p-2 rounded-full z-10"
              >
                <Ionicons name="close" size={24} color="white" />
              </StyledTouchableOpacity>
            </StyledView>

            {/* Content */}
            <StyledView className="flex-1 p-6 bg-gray-900 rounded-t-3xl -mt-6" style={{ flex: 1 }}>
              <StyledText className="text-3xl font-bold text-white mb-1">{selectedProperty?.name}</StyledText>
              <StyledText className="text-green-400 text-sm font-bold uppercase tracking-wider mb-6">{selectedProperty?.category} Property</StyledText>

              {/* Price Tag */}
              <StyledView className="bg-white/5 p-4 rounded-xl border border-white/5 mb-6 items-center">
                <StyledText className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-1">Purchase Price</StyledText>
                <StyledText className="text-3xl font-bold text-white">₹{selectedProperty?.price?.toLocaleString()}</StyledText>
              </StyledView>

              {/* Monthly Stats */}
              <StyledView className="flex-row gap-4 mb-8">
                <StyledView className="flex-1 bg-green-500/10 p-4 rounded-xl border border-green-500/20 items-center">
                  <StyledText className="text-xs text-green-400 uppercase tracking-widest font-bold mb-2">Est. Income</StyledText>
                  <StyledText className="text-lg font-bold text-green-400">+₹{selectedProperty?.rental_income?.toLocaleString()}/mo</StyledText>
                </StyledView>
                <StyledView className="flex-1 bg-red-500/10 p-4 rounded-xl border border-red-500/20 items-center">
                  <StyledText className="text-xs text-red-400 uppercase tracking-widest font-bold mb-2">Maintenance</StyledText>
                  <StyledText className="text-lg font-bold text-red-400">-₹{selectedProperty?.maintenance?.toLocaleString()}/mo</StyledText>
                </StyledView>
              </StyledView>

              <ScrollView className="flex-1 mb-6">
                <StyledText className="text-gray-300 leading-relaxed text-sm">
                  {selectedProperty?.description || `Beautiful ${selectedProperty?.category} property offering great investment returns. Consider the monthly maintenance costs against the potential rental income.`}
                </StyledText>
              </ScrollView>

              <StyledView className="flex-row gap-3">
                <StyledTouchableOpacity
                  onPress={() => handleBuyProperty(selectedProperty)}
                  disabled={properties.includes(selectedProperty?.id) || balance < selectedProperty?.price}
                  className={`flex-1 py-4 rounded-xl items-center ${properties.includes(selectedProperty?.id) ? 'bg-gray-700' : balance < selectedProperty?.price ? 'bg-gray-800 border border-gray-600' : 'bg-green-600'}`}
                >
                  <StyledText className={`font-bold text-base uppercase tracking-widest ${properties.includes(selectedProperty?.id) ? 'text-gray-500' : balance < selectedProperty?.price ? 'text-gray-500' : 'text-white'}`}>
                    {properties.includes(selectedProperty?.id) ? 'Owned' : balance < selectedProperty?.price ? 'Low Funds' : 'Buy Cash'}
                  </StyledText>
                </StyledTouchableOpacity>
                {!properties.includes(selectedProperty?.id) && (
                  <StyledTouchableOpacity
                    onPress={() => handleBuyPropertyLoan(selectedProperty)}
                    className="flex-1 py-4 rounded-xl items-center bg-indigo-700 border border-indigo-500"
                  >
                    <StyledText className="font-bold text-base uppercase tracking-widest text-white">Home Loan</StyledText>
                  </StyledTouchableOpacity>
                )}
              </StyledView>
            </StyledView>
          </StyledView>
        </ResponsiveModal>

      </StyledView>

      <BirthdayCelebrationRoom
        visible={showBirthdayRoom}
        onClose={() => setShowBirthdayRoom(false)}
        turn={{ month: (totalMonthsPlayed % 12) + 1 }}
        playerBirthday={playerBirthday}
        playerName={playerName}
        dependents={dependents}
        lastCelebrationChoice={lastCelebrationChoice}
      />

      {/* ── First-load intro overlay ── */}
      {showIntro && (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 800, backgroundColor: 'rgba(4,6,14,0.96)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 }}>
          <View style={{ width: '100%', maxWidth: 360, borderWidth: 1, borderColor: '#1a2040', backgroundColor: '#070a16' }}>

            {/* Header */}
            <View style={{ backgroundColor: '#0d1020', borderBottomWidth: 1, borderColor: '#1a2040', padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View>
                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: '#2a3560', letterSpacing: 4 }}>LIFE SIMULATION</Text>
                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 30, color: '#c8d4f0', lineHeight: 32 }}>FINLIT</Text>
              </View>
              <Image source={require('./assets/ui_comp/saveandearn.png')} style={{ width: 48, height: 48 }} resizeMode="contain" />
            </View>

            <View style={{ padding: 16 }}>
              {/* Mission statement */}
              <View style={{ borderWidth: 1, borderColor: '#1a2040', backgroundColor: '#0a0d1a', padding: 12, marginBottom: 16 }}>
                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: '#2a3560', letterSpacing: 3, marginBottom: 4 }}>YOUR MISSION</Text>
                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 18, color: '#c8d4f0', lineHeight: 22 }}>Start at age 18 with ₹5,000.</Text>
                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 18, color: '#fbbf24', lineHeight: 22 }}>Retire at 58 as wealthy as possible.</Text>
              </View>

              {/* Icon grid — 3 cols × 2 rows */}
              {[
                [
                  { img: require('./assets/ui_comp/career.png'),    label: 'JOBS',    sub: 'Earn a salary' },
                  { img: require('./assets/ui_comp/education.png'),label: 'STUDY',   sub: 'Unlock careers' },
                  { img: require('./assets/ui_comp/investicon.png'), label: 'INVEST',  sub: 'Grow wealth' },
                ],
                [
                  { img: require('./assets/ui_comp/familyicon.png'),label: 'FAMILY',  sub: 'Build your life' },
                  { img: require('./assets/ui_comp/home.png'),       label: 'HOME',    sub: 'Upgrade housing' },
                  { img: require('./assets/ui_comp/inbox.png'),      label: 'INBOX',   sub: 'Life events' },
                ],
              ].map((row, ri) => (
                <View key={ri} style={{ flexDirection: 'row', gap: 6, marginBottom: 6 }}>
                  {row.map(item => (
                    <View key={item.label} style={{ flex: 1, borderWidth: 1, borderColor: '#1a2040', backgroundColor: '#0a0d1a', padding: 8, alignItems: 'center' }}>
                      <Image source={item.img} style={{ width: 28, height: 28, marginBottom: 4 }} resizeMode="contain" />
                      <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: '#c8d4f0', letterSpacing: 1 }}>{item.label}</Text>
                      <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: '#2a3560', textAlign: 'center', lineHeight: 13 }}>{item.sub}</Text>
                    </View>
                  ))}
                </View>
              ))}

              {/* Footer hint */}
              <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: '#2a3560', marginTop: 10, marginBottom: 16, textAlign: 'center', letterSpacing: 1 }}>
                TAP NEXT MONTH TO ADVANCE TIME
              </Text>

              {/* CTA */}
              <TouchableOpacity
                onPress={() => setShowIntro(false)}
                activeOpacity={0.85}
                style={{ backgroundColor: '#0d1020', paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: '#4ade80', position: 'relative' }}
              >
                <View style={{ position: 'absolute', top: 0, left: 0, width: 6, height: 6, backgroundColor: '#4ade80' }} />
                <View style={{ position: 'absolute', top: 0, right: 0, width: 6, height: 6, backgroundColor: '#4ade80' }} />
                <View style={{ position: 'absolute', bottom: 0, left: 0, width: 6, height: 6, backgroundColor: '#4ade80' }} />
                <View style={{ position: 'absolute', bottom: 0, right: 0, width: 6, height: 6, backgroundColor: '#4ade80' }} />
                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 26, color: '#4ade80', letterSpacing: 4 }}>BEGIN ▶</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      <PixelDialog {...dialog} onConfirm={dialog.onConfirm || closeDialog} />

      {/* ── CRISIS FLASH OVERLAY ── */}
      <CrisisFlash visible={majorCrisisFlash} />

      {/* ── LIFE DECISION DIALOG ── */}
      {(pendingDecision?.isBirthday || pendingDecision?.isHospital) ? (
        <BirthdayDialog
          event={pendingDecision}
          onChoice={(choice) => resolveDecision(choice)}
        />
      ) : (
        <ChoiceDialog
          event={pendingDecision}
          onChoice={(choice) => resolveDecision(choice)}
        />
      )}

      {/* ── ACHIEVEMENT TOAST ── */}
      {newAchievement && (
        <AchievementToast achievement={newAchievement} onDone={() => setNewAchievement(null)} />
      )}

      {/* ── FINANCIAL TIP (first-encounter educational tooltip) ── */}
      {currentTip && (
        <FinancialTip tip={currentTip} onDismiss={() => setCurrentTip(null)} />
      )}

      {/* ── HEALTH REPORT ── */}
      <ResponsiveModal visible={showHealthReport} transparent animationType="slide" onRequestClose={() => setShowHealthReport(false)}>
        <View style={{ flex: 1, justifyContent: 'flex-end' }}>
          <TouchableOpacity style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)' }} activeOpacity={1} onPress={() => setShowHealthReport(false)} />
          <View style={{ backgroundColor: '#06080f', borderTopWidth: 2, borderColor: health < 30 ? '#f87171' : '#1a2040', padding: 20, paddingBottom: 32 }}>
            {/* Header */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Image source={require('./assets/ui_comp/healthicon.png')} style={{ width: 28, height: 28 }} resizeMode="contain" />
                <View>
                  <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: '#2a3560', letterSpacing: 3 }}>VITALS</Text>
                  <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 26, color: '#c8d4f0', lineHeight: 28 }}>HEALTH REPORT</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => setShowHealthReport(false)}>
                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 22, color: '#2a3560' }}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Big HP display */}
            {(() => {
              const hpColor = health >= 60 ? '#4ade80' : health >= 30 ? '#fbbf24' : '#f87171';
              const status  = health >= 60 ? 'HEALTHY' : health >= 30 ? 'AT RISK' : 'CRITICAL';
              const SEGS = 10;
              const filled = Math.round((health / 100) * SEGS);
              return (
                <View style={{ marginBottom: 16 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8, marginBottom: 8 }}>
                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 48, color: hpColor, lineHeight: 50 }}>{Math.round(health)}</Text>
                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 20, color: '#2a3560' }}>/100</Text>
                    <View style={{ marginLeft: 8, backgroundColor: hpColor + '22', borderWidth: 1, borderColor: hpColor + '60', paddingHorizontal: 10, paddingVertical: 2 }}>
                      <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: hpColor, letterSpacing: 2 }}>{status}</Text>
                    </View>
                  </View>
                  <View style={{ flexDirection: 'row', gap: 3 }}>
                    {Array.from({ length: SEGS }).map((_, i) => (
                      <View key={i} style={{ flex: 1, height: 14, backgroundColor: i < filled ? hpColor : '#151c30', borderWidth: 1, borderColor: i < filled ? hpColor + '80' : '#1a2040' }} />
                    ))}
                  </View>
                </View>
              );
            })()}

            {/* Factors */}
            <View style={{ gap: 8, marginBottom: 16 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderColor: '#1a2040' }}>
                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 15, color: '#445070' }}>Monthly drain</Text>
                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 15, color: '#f87171' }}>-8 HP / month</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderColor: '#1a2040' }}>
                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 15, color: '#445070' }}>Sick leave risk below</Text>
                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 15, color: '#fbbf24' }}>30 HP</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderColor: '#1a2040' }}>
                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 15, color: '#445070' }}>Forced sick leave below</Text>
                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 15, color: '#f87171' }}>15 HP  (-50% salary)</Text>
              </View>
              {sickLeaveMonths > 0 && (
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderColor: '#1a2040' }}>
                  <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 15, color: '#445070' }}>Consecutive sick months</Text>
                  <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 15, color: '#f87171' }}>{sickLeaveMonths}</Text>
                </View>
              )}
            </View>

            {/* How to restore */}
            <View style={{ backgroundColor: '#0d1020', borderWidth: 1, borderColor: '#1a2040', padding: 12, marginBottom: 16 }}>
              <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 12, color: '#2a3560', letterSpacing: 2, marginBottom: 6 }}>HOW TO RESTORE HP</Text>
              <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: '#445070', lineHeight: 18 }}>Buy food from the grocery store each month. Each item restores HP instantly. Keep above 30 to avoid sick leave and salary cuts.</Text>
            </View>

            <TouchableOpacity
              onPress={() => { setShowHealthReport(false); setShowGrocery(true); }}
              style={{ borderWidth: 1, borderColor: '#4ade80', backgroundColor: '#050f0a', paddingVertical: 12, alignItems: 'center' }}
            >
              <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 18, color: '#4ade80', letterSpacing: 2 }}>OPEN GROCERY STORE ▶</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ResponsiveModal>

      {/* ── HAPPINESS REPORT ── */}
      <ResponsiveModal visible={showHappinessReport} transparent animationType="slide" onRequestClose={() => setShowHappinessReport(false)}>
        <View style={{ flex: 1, justifyContent: 'flex-end' }}>
          <TouchableOpacity style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)' }} activeOpacity={1} onPress={() => setShowHappinessReport(false)} />
          <View style={{ backgroundColor: '#06080f', borderTopWidth: 2, borderColor: '#fbbf24', padding: 20, paddingBottom: 32 }}>
            {/* Header */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Image source={require('./assets/ui_comp/happyicon.png')} style={{ width: 28, height: 28 }} resizeMode="contain" />
                <View>
                  <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: '#2a3560', letterSpacing: 3 }}>WELLBEING</Text>
                  <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 26, color: '#c8d4f0', lineHeight: 28 }}>HAPPINESS REPORT</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => setShowHappinessReport(false)}>
                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 22, color: '#2a3560' }}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Big happiness display */}
            {(() => {
              const hapColor = happiness >= 70 ? '#4ade80' : happiness >= 40 ? '#fbbf24' : '#f87171';
              const status   = happiness >= 70 ? 'THRIVING' : happiness >= 40 ? 'CONTENT' : happiness >= 20 ? 'STRESSED' : 'MISERABLE';
              const SEGS = 10;
              const filled = Math.round((happiness / 100) * SEGS);

              const qualityScore    = currentHousing?.life_quality || 2;
              const housingEffect   = Math.round((qualityScore - 5) * 0.25 * 10) / 10;
              const totalLoan       = loans?.reduce((s, l) => s + (l.remaining || 0), 0) || 0;
              const debtEffect      = Math.round(-(totalLoan / 10000000) * 0.4 * 10) / 10;
              const familyEffect    = Math.round(Math.min((dependents?.length || 0) * 0.3, 1.2) * 10) / 10;
              const jobEffect       = currentJob ? 0.15 : -0.4;
              const netFlow         = (currentJob?.salary || 0) - (currentHousing?.maintenance || 0);
              const financeEffect   = netFlow < 0 ? -0.5 : 0.1;

              const Factor = ({ label, value, tip }) => {
                const c = value > 0 ? '#4ade80' : value < 0 ? '#f87171' : '#445070';
                return (
                  <View style={{ paddingVertical: 8, borderBottomWidth: 1, borderColor: '#1a2040' }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 15, color: '#445070' }}>{label}</Text>
                      <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 15, color: c }}>{value > 0 ? '+' : ''}{Math.round(value * 10) / 10}/mo</Text>
                    </View>
                    {tip && <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 12, color: '#1e2840', lineHeight: 14, marginTop: 2 }}>{tip}</Text>}
                  </View>
                );
              };

              return (
                <View>
                  <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8, marginBottom: 8 }}>
                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 48, color: hapColor, lineHeight: 50 }}>{Math.round(happiness)}</Text>
                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 20, color: '#2a3560' }}>/100</Text>
                    <View style={{ marginLeft: 8, backgroundColor: hapColor + '22', borderWidth: 1, borderColor: hapColor + '60', paddingHorizontal: 10, paddingVertical: 2 }}>
                      <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: hapColor, letterSpacing: 2 }}>{status}</Text>
                    </View>
                  </View>
                  <View style={{ flexDirection: 'row', gap: 3, marginBottom: 16 }}>
                    {Array.from({ length: SEGS }).map((_, i) => (
                      <View key={i} style={{ flex: 1, height: 14, backgroundColor: i < filled ? hapColor : '#151c30', borderWidth: 1, borderColor: i < filled ? hapColor + '80' : '#1a2040' }} />
                    ))}
                  </View>

                  <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: '#2a3560', letterSpacing: 3, marginBottom: 6 }}>MONTHLY FACTORS</Text>
                  <Factor label="Housing quality" value={housingEffect}
                    tip={qualityScore < 5 ? 'Upgrade your home to boost happiness' : qualityScore >= 7 ? 'Great home — positive effect' : null} />
                  <Factor label="Loan debt stress" value={debtEffect}
                    tip={totalLoan > 0 ? `₹${totalLoan.toLocaleString()} outstanding — pay off loans to reduce stress` : null} />
                  <Factor label="Family & relationships" value={familyEffect}
                    tip={dependents?.length === 0 ? 'No dependents yet — family adds warmth' : `${dependents.length} family member${dependents.length > 1 ? 's' : ''} boosting happiness`} />
                  <Factor label="Job satisfaction" value={jobEffect}
                    tip={!currentJob ? 'Get a job — unemployment drags happiness down' : null} />
                  <Factor label="Cash flow" value={financeEffect}
                    tip={netFlow < 0 ? 'Spending more than you earn — reduce expenses' : null} />
                </View>
              );
            })()}
          </View>
        </View>
      </ResponsiveModal>

      {/* ── EVENT INBOX MODAL ── */}
      <ResponsiveModal visible={showEventsInbox} transparent animationType="slide" onRequestClose={() => setShowEventsInbox(false)}>
        <View style={{ flex: 1, justifyContent: 'flex-end' }}>
          <TouchableOpacity style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)' }} activeOpacity={1} onPress={() => setShowEventsInbox(false)} />
          <View style={{ maxHeight: '94%', backgroundColor: '#06080f', borderTopWidth: 2, borderColor: '#1a2040' }}>
            {/* Header */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 14, paddingBottom: 10 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Image source={require('./assets/ui_comp/inbox.png')} style={{ width: 26, height: 26 }} resizeMode="contain" />
                <View>
                  <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: '#2a3560', letterSpacing: 4 }}>LIFE EVENTS</Text>
                  <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 24, color: '#c8d4f0', lineHeight: 26 }}>INBOX</Text>
                </View>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                {eventInbox.some(e => !e.read) && (
                  <TouchableOpacity onPress={() => markAllEventsRead()} style={{ borderWidth: 1, borderColor: '#1a2040', paddingHorizontal: 10, paddingVertical: 5 }}>
                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: '#3b82f6', letterSpacing: 1 }}>READ ALL</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={() => setShowEventsInbox(false)} style={{ width: 32, height: 32, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#1a2040' }}>
                  <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 20, color: '#445070', lineHeight: 22 }}>✕</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Category tabs — scrollable */}
            {(() => {
              const allTabs = [
                { key: 'all', label: 'ALL', accent: '#c8d4f0' },
                { key: 'crisis', label: 'ALERTS', accent: '#f87171' },
                { key: 'positive', label: 'BANK', accent: '#22c55e' },
                { key: 'market', label: 'MARKET', accent: '#f59e0b' },
                { key: 'property', label: 'PROPERTY', accent: '#60a5fa' },
                { key: 'health', label: 'HEALTH', accent: '#f472b6' },
                { key: 'dilemma', label: 'DECISIONS', accent: '#a855f7' },
                { key: 'info', label: 'GOVT', accent: '#38bdf8' },
                { key: 'other', label: 'OTHER', accent: '#94a3b8' },
              ];
              return (
                <ScrollView horizontal showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 10, gap: 6, flexDirection: 'row' }}>
                  {allTabs.map(tab => {
                    const count = tab.key === 'all'
                      ? eventInbox.filter(e => !e.read).length
                      : eventInbox.filter(e => (e.category || 'other') === tab.key && !e.read).length;
                    const isActive = inboxTab === tab.key;
                    return (
                      <TouchableOpacity key={tab.key} onPress={() => setInboxTab(tab.key)} activeOpacity={0.8}
                        style={{ flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1,
                          borderColor: isActive ? tab.accent : '#1a2040',
                          backgroundColor: isActive ? tab.accent + '18' : '#0d1020' }}>
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: isActive ? tab.accent : '#445070', letterSpacing: 1 }}>{tab.label}</Text>
                        {count > 0 && (
                          <View style={{ minWidth: 16, height: 16, borderRadius: 8, backgroundColor: tab.accent, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3 }}>
                            <Text style={{ fontSize: 9, color: '#000', fontWeight: 'bold' }}>{count > 9 ? '9+' : count}</Text>
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              );
            })()}

            {/* Divider */}
            <View style={{ height: 1, backgroundColor: '#1a2040', marginHorizontal: 0 }} />

            {/* Email list */}
            <ScrollView contentContainerStyle={{ paddingBottom: 30 }} showsVerticalScrollIndicator={false}>
              {(() => {
                const filtered = inboxTab === 'all'
                  ? [...eventInbox].sort((a, b) => (b.month || 0) - (a.month || 0))
                  : eventInbox.filter(e => (e.category || 'other') === inboxTab).sort((a, b) => (b.month || 0) - (a.month || 0));

                if (filtered.length === 0) {
                  return (
                    <View style={{ alignItems: 'center', paddingVertical: 52 }}>
                      <Image source={require('./assets/ui_comp/inbox.png')} style={{ width: 32, height: 32, marginBottom: 14, opacity: 0.4 }} resizeMode="contain" />
                      <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 17, color: '#2a3560', textAlign: 'center' }}>
                        {inboxTab === 'all' ? 'No events yet.\nKeep playing — life has surprises.' : 'No messages in this category.'}
                      </Text>
                    </View>
                  );
                }

                return filtered.map((ev, idx) => {
                  const cat = ev.category || 'other';
                  const accent = getCategoryAccent(cat);
                  const senderLabel = getCategoryDisplay(cat).toUpperCase();
                  const isLast = idx === filtered.length - 1;
                  return (
                    <TouchableOpacity
                      key={ev.id}
                      onPress={() => openEventDetail(ev)}
                      activeOpacity={0.8}
                      style={{
                        flexDirection: 'row', alignItems: 'center', gap: 12,
                        paddingHorizontal: 16, paddingVertical: 13,
                        borderBottomWidth: isLast ? 0 : 1, borderColor: '#0f1628',
                        backgroundColor: ev.read ? '#06080f' : accent + '08',
                      }}
                    >
                      {/* Sender avatar */}
                      <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: accent + '20', borderWidth: 1, borderColor: accent + '40', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: accent, lineHeight: 18 }}>{senderLabel.slice(0, 2)}</Text>
                      </View>
                      {/* Content */}
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                          <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: accent, letterSpacing: 1 }}>{senderLabel}</Text>
                          <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 12, color: '#2a3560' }}>Mo.{ev.month || 0}</Text>
                        </View>
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 17, color: ev.read ? '#445070' : '#c8d4f0', lineHeight: 19 }} numberOfLines={1}>{ev.name}</Text>
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: '#2a3560', lineHeight: 15, marginTop: 1 }} numberOfLines={1}>
                          {typeof ev.message === 'string' ? ev.message : 'Tap to view message details...'}
                        </Text>
                      </View>
                      {/* Impact + unread dot */}
                      <View style={{ alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
                        {ev.impact !== 0 && (
                          <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: ev.impact > 0 ? '#4ade80' : '#f87171' }}>
                            {ev.impact > 0 ? '+' : ''}₹{Math.abs(ev.impact) >= 100000 ? (Math.abs(ev.impact) / 100000).toFixed(1) + 'L' : Math.abs(ev.impact).toLocaleString()}
                          </Text>
                        )}
                        {!ev.read && <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: accent }} />}
                      </View>
                    </TouchableOpacity>
                  );
                });
              })()}
            </ScrollView>
          </View>
        </View>
      </ResponsiveModal>
      {/* ── Credit Card Offer Dialog ── */}
      <ResponsiveModal visible={pendingCreditCardOffer} transparent animationType="fade" onRequestClose={() => setPendingCreditCardOffer(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', padding: 20 }}>
          <View style={{ backgroundColor: '#070a16', borderWidth: 1, borderColor: '#60a5fa', overflow: 'hidden' }}>
            <View style={{ padding: 20, alignItems: 'center' }}>
              <Image source={require('./assets/ui_comp/credit card.png')} style={{ width: 120, height: 120, marginBottom: 16 }} resizeMode="contain" />
              <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 24, color: '#60a5fa', marginBottom: 8, textAlign: 'center' }}>PRE-APPROVED CREDIT CARD OFFER!</Text>
              <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: '#c8d4f0', textAlign: 'center', marginBottom: 16 }}>
                Your excellent credit score has unlocked a new credit card offer. Build credit, enjoy interest-free days, and get lifestyle perks.
              </Text>
              
              <TouchableOpacity onPress={() => {
                setPendingCreditCardOffer(false);
                setActiveTab('money');
                setMoneySubTab('card');
              }} style={{ width: '100%', backgroundColor: '#60a5fa', padding: 14, alignItems: 'center', marginBottom: 12 }}>
                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 18, color: '#04060e', letterSpacing: 1 }}>SEE OFFER & APPLY →</Text>
              </TouchableOpacity>
              
              <TouchableOpacity onPress={() => setPendingCreditCardOffer(false)} style={{ width: '100%', borderWidth: 1, borderColor: '#1a2040', padding: 14, alignItems: 'center' }}>
                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: '#445070' }}>NOT NOW</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ResponsiveModal>

    </SafeAreaView>
  );
};

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, backgroundColor: 'red', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>APP CRASHED</Text>
          <Text style={{ color: 'white', marginTop: 10 }}>{this.state.error?.toString()}</Text>
        </View>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  let [fontsLoaded] = useFonts({
    VT323_400Regular,
    PressStart2P_400Regular,
  });
  const [gameKey, setGameKey] = useState(0);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider style={{ flex: 1 }}>
      <ErrorBoundary>
        <GameProvider key={gameKey}>
          <GameLayout onHardReset={() => setGameKey(k => k + 1)} />
        </GameProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
