import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, Modal, StatusBar, Platform, Dimensions, TextInput } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { GameProvider, useGame } from './src/context/GameContext';
import { JOBS } from './src/data/jobs';
import { EDUCATION } from './src/data/education';
import { STOCKS } from './src/data/stocks';
import { RESIDENTIAL_PROPERTIES, COMMERCIAL_PROPERTIES } from './src/data/realEstate';

// Combine both arrays for display
const REAL_ESTATE = [...RESIDENTIAL_PROPERTIES, ...COMMERCIAL_PROPERTIES];
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { styled } from 'nativewind';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledImage = styled(Image);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledTextInput = styled(TextInput);

const GameLayout = () => {
  const {
    balance, turn, nextMonth, netWorth,
    currentJob, currentHousing, isPlaying, setIsPlaying,
    degrees, portfolio, properties, marketPrices,
    enrollInCourse, tradeStock, buyProperty, applyForJob, checkJobRequirements, getCAAdvice
  } = useGame();

  const [activeMenu, setActiveMenu] = useState(null); // 'university', 'invest', 'advisor', 'careers'
  const [selectedJob, setSelectedJob] = useState(null);
  const [investCategory, setInvestCategory] = useState(null); // null, 'stocks', 'houses', 'commercial'
  const [viewMode, setViewMode] = useState('home'); // 'home' or 'work'

  console.log('Active Menu:', activeMenu);

  if (!currentHousing || balance === undefined) {
    return (
      <StyledView className="flex-1 items-center justify-center bg-black">
        <StyledText className="text-white font-bold">Booting Life OS...</StyledText>
      </StyledView>
    );
  }

  // --- HANDLERS ---
  const handleEnroll = (course) => {
    const res = enrollInCourse(course);
    alert(res.msg);
  };

  const handleTrade = (stock, qty, action) => {
    const res = tradeStock(stock, qty, action);
    if (!res.success) alert(res.msg);
  };

  const handleBuyProperty = (prop) => {
    const res = buyProperty(prop);
    alert(res.msg);
  };

  const handleApply = (job) => {
    const result = applyForJob(job);
    if (result.allowed) {
      setSelectedJob(null);
      setActiveMenu(null);
    } else {
      alert(`Cannot apply: ${result.reason}`);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#000' }}>
      <StyledView className="flex-1 bg-black relative">
        <StatusBar barStyle="light-content" />

        {/* --- TOP HEADER (STATUS DASHBOARD) --- */}
        {activeMenu !== 'advisor' && (
          <StyledView className="z-20 bg-black border-b border-white/10 px-4 pt-2 pb-3">
            {/* Row 1: Date + Balance + Net Worth */}
            <StyledView className="flex-row items-center justify-between mb-2">
              <StyledView className="bg-white/5 rounded-lg px-3 py-1 border border-white/10">
                <StyledText className="text-[10px] text-gray-400 uppercase font-bold">📅 {turn.month}/{turn.year}</StyledText>
              </StyledView>
              <StyledView className="items-center">
                <StyledText className="text-[9px] text-gray-500 uppercase">Balance</StyledText>
                <StyledText className="text-lg font-bold text-green-400">₹{balance?.toLocaleString()}</StyledText>
              </StyledView>
              <StyledView className="items-center">
                <StyledText className="text-[9px] text-gray-500 uppercase">Net Worth</StyledText>
                <StyledText className="text-base font-bold text-blue-400">₹{netWorth?.toLocaleString()}</StyledText>
              </StyledView>
            </StyledView>

            {/* Row 2: Job | Housing | Cashflow */}
            <StyledView className="flex-row gap-2">
              {/* Job */}
              <StyledView className="flex-1 bg-white/5 rounded-lg px-3 py-2 border border-white/5">
                <StyledText className="text-[9px] text-gray-500 uppercase mb-0.5">💼 Job</StyledText>
                <StyledText className="text-white text-xs font-bold" numberOfLines={1}>{currentJob?.name || 'Unemployed'}</StyledText>
                <StyledText className="text-yellow-400 text-[10px]">{currentJob ? `₹${currentJob.salary.toLocaleString()}/mo` : 'No income'}</StyledText>
              </StyledView>

              {/* Housing */}
              <StyledView className="flex-1 bg-white/5 rounded-lg px-3 py-2 border border-white/5">
                <StyledText className="text-[9px] text-gray-500 uppercase mb-0.5">🏠 Home</StyledText>
                <StyledText className="text-white text-xs font-bold" numberOfLines={1}>{currentHousing?.name}</StyledText>
                <StyledText className="text-red-400 text-[10px]">₹{(currentHousing?.rent || currentHousing?.maintenance || 0).toLocaleString()}/mo</StyledText>
              </StyledView>

              {/* Monthly Cashflow */}
              <StyledView className="flex-1 bg-white/5 rounded-lg px-3 py-2 border border-white/5">
                <StyledText className="text-[9px] text-gray-500 uppercase mb-0.5">📈 Flow</StyledText>
                {(() => {
                  const income = (currentJob?.salary || 0);
                  const expenses = (currentHousing?.rent || currentHousing?.maintenance || 0) + 2000;
                  const flow = income - expenses;
                  return (
                    <>
                      <StyledText className={`text-xs font-bold ${flow >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {flow >= 0 ? '+' : ''}₹{flow.toLocaleString()}
                      </StyledText>
                      <StyledText className="text-gray-500 text-[10px]">per month</StyledText>
                    </>
                  );
                })()}
              </StyledView>
            </StyledView>
          </StyledView>
        )}

        {/* --- DESKTOP / ROOM VISUAL --- */}
        <StyledView className="flex-1 relative bg-gray-900 overflow-hidden">
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'black' }}
            maximumZoomScale={3.0}
            minimumZoomScale={1.0}
            centerContent={true}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            <StyledImage
              key={`${activeMenu}-${viewMode}`}
              source={
                activeMenu === 'advisor'
                  ? require('./assets/properties/CA_Office.png')
                  : viewMode === 'work' && currentJob?.office_image
                    ? currentJob.office_image
                    : currentHousing.image
              }
              style={{ width: '100%', height: '100%' }}
              resizeMode="contain"
            />
            {/* View Mode Label */}
            {activeMenu !== 'advisor' && (
              <StyledView className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/50 rounded-full px-3 py-1 border border-white/10 flex-row items-center gap-2">
                <FontAwesome5 name={viewMode === 'home' ? 'home' : 'building'} size={10} color="#9CA3AF" />
                <StyledText className="text-[10px] text-white/60 font-bold uppercase">{viewMode === 'home' ? currentHousing.name : (currentJob?.name || 'No Job')}</StyledText>
              </StyledView>
            )}
          </ScrollView>

          {/* Floating Play/Pause Button */}
          {activeMenu !== 'advisor' && (
            <StyledTouchableOpacity
              onPress={() => setIsPlaying(!isPlaying)}
              className={`absolute bottom-4 right-4 w-10 h-10 rounded-full items-center justify-center border border-white/20 ${isPlaying ? 'bg-gray-800/80' : 'bg-green-600/90'}`}
            >
              <Ionicons name={isPlaying ? 'pause' : 'play'} size={16} color="white" style={{ marginLeft: isPlaying ? 0 : 2 }} />
            </StyledTouchableOpacity>
          )}

          {/* Work mode: unemployed empty state */}
          {viewMode === 'work' && !currentJob && activeMenu !== 'advisor' && (
            <StyledView className="absolute inset-0 items-center justify-center bg-black/70">
              <FontAwesome5 name="briefcase" size={40} color="#6B7280" />
              <StyledText className="text-gray-400 font-bold text-lg mt-4">No Job Yet</StyledText>
              <StyledText className="text-gray-500 text-sm mt-1 text-center px-8">Head to Careers to find a job and see your workplace!</StyledText>
              <StyledTouchableOpacity onPress={() => { setActiveMenu('careers'); setViewMode('home'); }} className="mt-4 bg-yellow-500 px-6 py-2 rounded-full">
                <StyledText className="text-black font-bold">Find a Job</StyledText>
              </StyledTouchableOpacity>
            </StyledView>
          )}

          {/* --- ADVISOR OVERLAY (Only visible in Advisor mode) --- */}
          {activeMenu === 'advisor' && (
            <StyledView className="absolute bottom-24 left-4 right-4 bg-black/90 px-6 py-6 rounded-2xl border border-white/20 shadow-lg">
              <StyledView className="flex-row items-center justify-between mb-4">
                <StyledView className="flex-row items-center gap-3">
                  <FontAwesome5 name="user-tie" size={24} color="#EAB308" />
                  <StyledText className="text-xl font-bold text-yellow-500 uppercase tracking-widest">CA Advisor</StyledText>
                </StyledView>
                <StyledTouchableOpacity onPress={() => setActiveMenu(null)} className="p-2 bg-white/10 rounded-full">
                  <Ionicons name="close" size={20} color="white" />
                </StyledTouchableOpacity>
              </StyledView>
              <ScrollView style={{ maxHeight: 150 }}>
                <StyledText className="text-white/95 text-lg italic leading-relaxed font-medium">
                  "{getCAAdvice()}"
                </StyledText>
              </ScrollView>
            </StyledView>
          )}

        </StyledView>

        {/* --- LIFE OS DOCK --- */}
        <StyledView className="z-20 pb-8 pt-4 bg-black/80 border-t border-white/10 flex-row justify-around items-end px-4">
          <BlurView intensity={20} className="absolute inset-0" />

          {/* 1. UNIVERSITY */}
          <StyledTouchableOpacity onPress={() => { setActiveMenu('university'); setViewMode('home'); }} className="items-center gap-1">
            <StyledView className={`w-12 h-12 rounded-2xl items-center justify-center border border-white/10 ${activeMenu === 'university' ? 'bg-indigo-600' : 'bg-gray-800'}`}>
              <FontAwesome5 name="graduation-cap" size={18} color="white" />
            </StyledView>
            <StyledText className="text-[9px] text-gray-400 font-bold uppercase">Study</StyledText>
          </StyledTouchableOpacity>

          {/* 2. INVEST */}
          <StyledTouchableOpacity onPress={() => { setActiveMenu('invest'); setViewMode('home'); }} className="items-center gap-1">
            <StyledView className={`w-12 h-12 rounded-2xl items-center justify-center border border-white/10 ${activeMenu === 'invest' ? 'bg-indigo-600' : 'bg-gray-800'}`}>
              <FontAwesome5 name="chart-line" size={18} color="white" />
            </StyledView>
            <StyledText className="text-[9px] text-gray-400 font-bold uppercase">Invest</StyledText>
          </StyledTouchableOpacity>

          {/* HOME / WORK TOGGLE (Center Button) */}
          <StyledTouchableOpacity
            onPress={() => { setViewMode(v => v === 'home' ? 'work' : 'home'); setActiveMenu(null); }}
            className={`w-16 h-16 rounded-full border-4 border-gray-900 items-center justify-center -mb-8 z-30 ${viewMode === 'work' ? 'bg-yellow-500' : 'bg-blue-600'}`}
          >
            <FontAwesome5 name={viewMode === 'home' ? 'building' : 'home'} size={22} color="white" />
          </StyledTouchableOpacity>

          {/* 3. ADVISOR */}
          <StyledTouchableOpacity onPress={() => { setActiveMenu('advisor'); setViewMode('home'); }} className="items-center gap-1">
            <StyledView className={`w-12 h-12 rounded-2xl items-center justify-center border border-white/10 ${activeMenu === 'advisor' ? 'bg-indigo-600' : 'bg-gray-800'}`}>
              <FontAwesome5 name="user-tie" size={18} color="white" />
            </StyledView>
            <StyledText className="text-[9px] text-gray-400 font-bold uppercase">Advisor</StyledText>
          </StyledTouchableOpacity>

          {/* 4. CAREERS */}
          <StyledTouchableOpacity onPress={() => { setActiveMenu('careers'); setViewMode('home'); }} className="items-center gap-1">
            <StyledView className={`w-12 h-12 rounded-2xl items-center justify-center border border-white/10 ${activeMenu === 'careers' ? 'bg-indigo-600' : 'bg-gray-800'}`}>
              <FontAwesome5 name="briefcase" size={18} color="white" />
            </StyledView>
            <StyledText className="text-[9px] text-gray-400 font-bold uppercase">Careers</StyledText>
          </StyledTouchableOpacity>

        </StyledView>

        {/* --- MODALS (Exclude 'advisor' as it's now handled inline) --- */}
        <Modal
          visible={!!activeMenu && !selectedJob && activeMenu !== 'advisor'}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setActiveMenu(null)}
        >
          <StyledView className="flex-1 justify-end">
            <StyledTouchableOpacity className="absolute inset-0 bg-black/50" activeOpacity={1} onPress={() => setActiveMenu(null)} />
            <StyledView className="h-full bg-gray-900 rounded-t-3xl border-t border-white/10 overflow-hidden">

              {/* Header */}
              <StyledView className="flex-row justify-between items-center p-6 border-b border-white/10 bg-white/5">
                <StyledText className="text-xl font-bold text-white uppercase tracking-widest">
                  {activeMenu === 'university' && 'University'}
                  {activeMenu === 'invest' && 'Market & Assets'}
                  {activeMenu === 'careers' && 'Career Portal'}
                </StyledText>
                <StyledTouchableOpacity onPress={() => setActiveMenu(null)} className="p-2 bg-white/10 rounded-full">
                  <Ionicons name="close" size={24} color="#9CA3AF" />
                </StyledTouchableOpacity>
              </StyledView>

              <ScrollView className="flex-1 p-4" contentContainerStyle={{ paddingBottom: 40 }}>



                {/* --- UNIVERSITY --- */}
                {activeMenu === 'university' && EDUCATION.map(course => {
                  const isEnrolled = degrees.includes(course.name);
                  return (
                    <StyledView key={course.id} className="bg-white/5 rounded-xl p-4 mb-4 border border-white/5 flex-row gap-4">
                      <StyledImage source={course.image} className="w-16 h-16 rounded-lg bg-black/20" />
                      <StyledView className="flex-1">
                        <StyledText className="text-white font-bold text-lg">{course.name}</StyledText>
                        <StyledText className="text-gray-400 text-xs mb-2">{course.description}</StyledText>
                        <StyledView className="flex-row justify-between items-center">
                          <StyledText className="text-yellow-500 font-bold">₹{course.cost.toLocaleString()}</StyledText>
                          <StyledTouchableOpacity
                            onPress={() => handleEnroll(course)}
                            disabled={isEnrolled}
                            className={`px-4 py-2 rounded ${isEnrolled ? 'bg-gray-600' : 'bg-indigo-600'}`}
                          >
                            <StyledText className="text-white text-xs font-bold">{isEnrolled ? 'ENROLLED' : 'ENROLL'}</StyledText>
                          </StyledTouchableOpacity>
                        </StyledView>
                      </StyledView>
                    </StyledView>
                  );
                })}

                {/* --- INVEST (Drill-Down Navigation) --- */}
                {activeMenu === 'invest' && (
                  <StyledView>
                    {!investCategory ? (
                      // Category Selection View
                      <StyledView>
                        <StyledText className="text-gray-400 text-sm mb-4">Select a category to explore</StyledText>

                        {/* Stocks Category Card */}
                        <StyledTouchableOpacity onPress={() => setInvestCategory('stocks')} className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-4 flex-row items-center justify-between overflow-hidden relative">
                          <StyledView className="flex-row items-center gap-4 z-10">
                            <StyledImage source={require('./assets/jobs/CEO.png')} className="w-16 h-16 rounded-lg" resizeMode="cover" />
                            <StyledView>
                              <StyledText className="text-white font-bold text-lg">Stocks</StyledText>
                              <StyledText className="text-blue-400 text-xs">{STOCKS.length} stocks available</StyledText>
                            </StyledView>
                          </StyledView>
                          <FontAwesome5 name="chevron-right" size={20} color="#60A5FA" />
                        </StyledTouchableOpacity>

                        {/* Houses Category Card */}
                        <StyledTouchableOpacity onPress={() => setInvestCategory('houses')} className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 mb-4 flex-row items-center justify-between overflow-hidden relative">
                          <StyledView className="flex-row items-center gap-4 z-10">
                            <StyledImage source={require('./assets/properties/villa_for_family_of_4-5.png')} className="w-16 h-16 rounded-lg" resizeMode="cover" />
                            <StyledView>
                              <StyledText className="text-white font-bold text-lg">Buy Houses</StyledText>
                              <StyledText className="text-green-400 text-xs">{RESIDENTIAL_PROPERTIES.length} residential properties</StyledText>
                            </StyledView>
                          </StyledView>
                          <FontAwesome5 name="chevron-right" size={20} color="#4ADE80" />
                        </StyledTouchableOpacity>

                        {/* Commercial Category Card */}
                        <StyledTouchableOpacity onPress={() => setInvestCategory('commercial')} className="bg-indigo-500/10 border border-indigo-500/30 rounded-xl p-4 mb-4 flex-row items-center justify-between overflow-hidden relative">
                          <StyledView className="flex-row items-center gap-4 z-10">
                            <StyledImage source={require('./assets/properties/commercial_lot.png')} className="w-16 h-16 rounded-lg" resizeMode="cover" />
                            <StyledView>
                              <StyledText className="text-white font-bold text-lg">Investment Properties</StyledText>
                              <StyledText className="text-indigo-400 text-xs">{COMMERCIAL_PROPERTIES.length} commercial properties</StyledText>
                            </StyledView>
                          </StyledView>
                          <FontAwesome5 name="chevron-right" size={20} color="#818CF8" />
                        </StyledTouchableOpacity>
                      </StyledView>
                    ) : (
                      // Category Detail View
                      <StyledView>
                        {/* Back Button */}
                        <StyledTouchableOpacity onPress={() => setInvestCategory(null)} className="flex-row items-center gap-2 mb-4 py-2">
                          <FontAwesome5 name="chevron-left" size={16} color="#9CA3AF" />
                          <StyledText className="text-gray-400 text-sm">Back to categories</StyledText>
                        </StyledTouchableOpacity>

                        {/* STOCKS */}
                        {investCategory === 'stocks' && (
                          <StyledView>
                            <StyledText className="text-xl font-bold text-white mb-4 uppercase tracking-wider">📈 Stocks</StyledText>
                            {STOCKS.map(stock => {
                              const currentPrice = marketPrices[stock.id] || stock.price;
                              const held = portfolio[stock.id] || 0;
                              return (
                                <StyledView key={stock.id} className="bg-white/5 rounded-xl p-4 mb-3 border border-white/5 flex-row items-center justify-between">
                                  <StyledView className="flex-1">
                                    <StyledText className="text-white font-bold text-lg">{stock.ticker}</StyledText>
                                    <StyledText className="text-gray-400 text-xs">{stock.name}</StyledText>
                                    <StyledText className="text-blue-400 font-bold mt-1">₹{currentPrice.toFixed(2)}</StyledText>
                                  </StyledView>
                                  <StyledView className="items-end">
                                    <StyledText className="text-white/60 text-xs mb-2">Held: {held}</StyledText>
                                    <StyledView className="flex-row gap-2">
                                      <StyledTouchableOpacity onPress={() => handleTrade(stock, 1, 'SELL')} className="bg-red-500/20 px-3 py-1 rounded border border-red-500/50">
                                        <StyledText className="text-red-400 font-bold">-1</StyledText>
                                      </StyledTouchableOpacity>
                                      <StyledTouchableOpacity onPress={() => handleTrade(stock, 1, 'BUY')} className="bg-green-500/20 px-3 py-1 rounded border border-green-500/50">
                                        <StyledText className="text-green-400 font-bold">+1</StyledText>
                                      </StyledTouchableOpacity>
                                    </StyledView>
                                  </StyledView>
                                </StyledView>
                              );
                            })}
                          </StyledView>
                        )}

                        {/* HOUSES */}
                        {investCategory === 'houses' && (
                          <StyledView>
                            <StyledText className="text-xl font-bold text-white mb-2 uppercase tracking-wider">🏠 Buy Houses</StyledText>
                            <StyledText className="text-gray-400 text-sm mb-4">Live in or rent out for income</StyledText>
                            {RESIDENTIAL_PROPERTIES.map(prop => {
                              const isOwned = properties.includes(prop.id);
                              return (
                                <StyledView key={prop.id} className="bg-white/5 rounded-xl mb-4 border border-white/5 overflow-hidden">
                                  <StyledImage source={prop.image} className="w-full h-32" resizeMode="cover" />
                                  <StyledView className="p-3">
                                    <StyledText className="text-white font-bold text-lg">{prop.name}</StyledText>
                                    <StyledText className="text-yellow-500 font-bold mb-2">₹{prop.price.toLocaleString()}</StyledText>
                                    <StyledText className="text-green-400 text-xs mb-1">Rental Income: ₹{prop.rental_income.toLocaleString()}/mo</StyledText>
                                    <StyledText className="text-gray-400 text-xs mb-2">Maintenance: ₹{prop.maintenance.toLocaleString()}/mo</StyledText>
                                    <StyledTouchableOpacity
                                      onPress={() => handleBuyProperty(prop)}
                                      disabled={isOwned}
                                      className={`mt-2 py-2 rounded items-center ${isOwned ? 'bg-gray-700' : 'bg-green-600'}`}
                                    >
                                      <StyledText className="text-white font-bold text-xs">{isOwned ? 'OWNED' : 'BUY PROPERTY'}</StyledText>
                                    </StyledTouchableOpacity>
                                  </StyledView>
                                </StyledView>
                              );
                            })}
                          </StyledView>
                        )}

                        {/* COMMERCIAL */}
                        {investCategory === 'commercial' && (
                          <StyledView>
                            <StyledText className="text-xl font-bold text-white mb-2 uppercase tracking-wider">🏢 Investment Properties</StyledText>
                            <StyledText className="text-gray-400 text-sm mb-4">Commercial real estate always rented to businesses</StyledText>
                            {COMMERCIAL_PROPERTIES.map(prop => {
                              const isOwned = properties.includes(prop.id);
                              return (
                                <StyledView key={prop.id} className="bg-white/5 rounded-xl mb-4 border border-white/5 overflow-hidden">
                                  <StyledImage source={prop.image} className="w-full h-32" resizeMode="cover" />
                                  <StyledView className="p-3">
                                    <StyledText className="text-white font-bold text-lg">{prop.name}</StyledText>
                                    <StyledText className="text-yellow-500 font-bold mb-2">₹{prop.price.toLocaleString()}</StyledText>
                                    <StyledText className="text-green-400 text-xs mb-1">Business Lease: ₹{prop.rental_income.toLocaleString()}/mo</StyledText>
                                    <StyledText className="text-gray-400 text-xs mb-2">Maintenance: ₹{prop.maintenance.toLocaleString()}/mo</StyledText>
                                    <StyledTouchableOpacity
                                      onPress={() => handleBuyProperty(prop)}
                                      disabled={isOwned}
                                      className={`mt-2 py-2 rounded items-center ${isOwned ? 'bg-gray-700' : 'bg-indigo-600'}`}
                                    >
                                      <StyledText className="text-white font-bold text-xs">{isOwned ? 'OWNED' : 'BUY COMMERCIAL'}</StyledText>
                                    </StyledTouchableOpacity>
                                  </StyledView>
                                </StyledView>
                              );
                            })}
                          </StyledView>
                        )}
                      </StyledView>
                    )}
                  </StyledView>
                )}

                {/* --- CAREERS (New Job Board) --- */}
                {activeMenu === 'careers' && JOBS.map(job => {
                  const reqStatus = checkJobRequirements(job);
                  const isLocked = !reqStatus.allowed;
                  return (
                    <StyledTouchableOpacity
                      key={job.id}
                      onPress={() => setSelectedJob(job)}
                      activeOpacity={0.7}
                      className={`p-4 mb-3 rounded-xl border flex-row items-center gap-4 ${isLocked ? 'bg-gray-800/80 border-gray-700' : 'bg-white/10 border-white/10'}`}
                    >
                      <StyledImage source={job.image} className={`w-12 h-12 rounded-lg bg-black/50 ${isLocked ? 'opacity-50' : ''}`} />
                      <StyledView className="flex-1">
                        <StyledView className="flex-row items-center gap-2">
                          <StyledText className={`font-bold text-base ${isLocked ? 'text-gray-400' : 'text-white'}`}>{job.name}</StyledText>
                          {isLocked && <FontAwesome5 name="lock" size={12} color="#6B7280" />}
                        </StyledView>
                        <StyledView className="mt-1 flex-col">
                          <StyledText className={`text-xs font-bold px-2 py-0.5 rounded self-start ${isLocked ? 'text-green-800 bg-green-900/10' : 'text-green-400 bg-green-400/10'}`}>₹{job.salary.toLocaleString()}/mo</StyledText>
                          {isLocked && (
                            <StyledText className="text-[10px] text-red-400 mt-1">
                              {reqStatus.reason} (Net: {netWorth})
                            </StyledText>
                          )}
                        </StyledView>
                      </StyledView>
                      <MaterialIcons name="chevron-right" size={20} color={isLocked ? "#4B5563" : "#6B7280"} />
                    </StyledTouchableOpacity>
                  );
                })}

              </ScrollView>
            </StyledView>
          </StyledView>
        </Modal>

        {/* --- JOB DETAIL MODAL (Unchanged Logic, just ensuring it overlays everything) --- */}
        <Modal
          visible={!!selectedJob}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setSelectedJob(null)}
        >
          <StyledView className="flex-1 justify-end bg-black">
            {/* Header Image */}
            <StyledView className="h-64 w-full relative">
              <StyledImage source={selectedJob?.office_image || selectedJob?.image} className="w-full h-full" resizeMode="cover" />
              <StyledTouchableOpacity
                onPress={() => setSelectedJob(null)}
                className="absolute top-12 right-4 bg-black/50 p-2 rounded-full"
              >
                <Ionicons name="close" size={24} color="white" />
              </StyledTouchableOpacity>
            </StyledView>

            {/* Content */}
            <StyledView className="flex-1 p-6 bg-gray-900 rounded-t-3xl -mt-6">
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
        </Modal>

      </StyledView>
    </SafeAreaView>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <GameProvider>
        <GameLayout />
      </GameProvider>
    </SafeAreaProvider>
  );
}
