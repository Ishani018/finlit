import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, Modal, ScrollView, StatusBar, SafeAreaView } from 'react-native';
import { GameProvider, useGame } from './src/context/GameContext';
import { JOBS } from './src/data/jobs';
import { INVESTMENTS } from './src/data/investments';
import { FontAwesome5, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { styled } from 'nativewind';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledImage = styled(Image);
const StyledTouchableOpacity = styled(TouchableOpacity);

const GameLayout = () => {
  const {
    balance, turn, nextMonth, netWorth,
    currentJob, currentHousing, dependents,
    applyForJob, buyInvestment,
    isPlaying, setIsPlaying, checkJobRequirements
  } = useGame();

  const [activeMenu, setActiveMenu] = useState(null); // null, 'jobs', 'investments'
  const [selectedJob, setSelectedJob] = useState(null); // For detailed view

  if (!currentHousing || balance === undefined) {
    return (
      <StyledView className="flex-1 items-center justify-center bg-black">
        <StyledText className="text-white font-bold">Loading Simulation...</StyledText>
      </StyledView>
    );
  }

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
    <StyledView className="flex-1 bg-black relative">
      <StatusBar barStyle="light-content" />

      {/* --- TOP HEADER (STATUS) --- */}
      <StyledView className="z-20 pt-12 pb-4 flex-row justify-center bg-black/80 border-b border-white/10">
        <BlurView intensity={20} className="absolute inset-0" />
        <StyledView className="bg-gray-900/50 rounded-full px-6 py-2 flex-row items-center gap-6 border border-white/10">
          <StyledView className="items-center">
            <StyledText className="text-[10px] text-gray-400 uppercase font-bold">Balance</StyledText>
            <StyledText className="text-xl font-bold text-green-400">₹{balance?.toLocaleString()}</StyledText>
          </StyledView>
          <StyledView className="h-8 w-px bg-white/10" />
          <StyledView className="items-center">
            <StyledText className="text-[10px] text-gray-400 uppercase font-bold">Net Worth</StyledText>
            <StyledText className="text-sm font-bold text-blue-400">₹{netWorth?.toLocaleString()}</StyledText>
          </StyledView>
        </StyledView>
      </StyledView>

      {/* --- MIDDLE STAGE (THE ROOM) --- */}
      <StyledView className="flex-1 relative bg-gray-900 items-center justify-center overflow-hidden">
        <StyledImage
          source={currentHousing.image}
          className="w-full h-full"
          resizeMode="contain"
        />

        {/* Date Display (Floating) */}
        <StyledView className="absolute top-4 left-4 bg-black/50 rounded px-3 py-1 border border-white/5">
          <StyledText className="text-xs text-white/80">{turn.month}/{turn.year}</StyledText>
        </StyledView>

        {/* Job Badge (Floating) */}
        <StyledView className="absolute top-4 right-4 bg-black/50 rounded px-3 py-1 border border-white/5 flex-row items-center gap-2">
          <FontAwesome5 name="briefcase" size={12} color="#EAB308" />
          <StyledText className="text-xs text-white/80">{currentJob?.name || 'Unemployed'}</StyledText>
        </StyledView>

        {/* Pause Overlay indicator */}
        {!isPlaying && (
          <StyledView className="absolute bottom-4 bg-black/50 px-4 py-1 rounded-full border border-white/10 flex-row items-center gap-2">
            <Ionicons name="pause" size={10} color="white" />
            <StyledText className="text-[10px] text-white/60">PAUSED</StyledText>
          </StyledView>
        )}
      </StyledView>

      {/* --- BOTTOM DOCK (CONTROLS) --- */}
      <StyledView className="z-20 pb-8 pt-4 bg-black/80 border-t border-white/10 flex-row justify-center items-end gap-6">
        <BlurView intensity={20} className="absolute inset-0" />

        <StyledTouchableOpacity
          onPress={() => { setActiveMenu(activeMenu === 'jobs' ? null : 'jobs'); setIsPlaying(false); }}
          className="items-center gap-1"
        >
          <StyledView className="w-12 h-12 bg-gray-800 rounded-2xl items-center justify-center border border-white/10">
            <FontAwesome5 name="briefcase" size={20} color={activeMenu === 'jobs' ? 'white' : '#9CA3AF'} />
          </StyledView>
          <StyledText className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Jobs</StyledText>
        </StyledTouchableOpacity>

        {/* PLAY / PAUSE HERO BUTTON */}
        <StyledTouchableOpacity
          onPress={() => setIsPlaying(!isPlaying)}
          className={`w-20 h-20 rounded-full border-4 border-gray-900 items-center justify-center -mt-8 ${isPlaying ? 'bg-gray-700' : 'bg-indigo-600'}`}
        >
          {isPlaying ? (
            <Ionicons name="pause" size={32} color="white" />
          ) : (
            <Ionicons name="play" size={32} color="white" style={{ marginLeft: 4 }} />
          )}
        </StyledTouchableOpacity>

        <StyledTouchableOpacity
          onPress={() => { setActiveMenu(activeMenu === 'investments' ? null : 'investments'); setIsPlaying(false); }}
          className="items-center gap-1"
        >
          <StyledView className="w-12 h-12 bg-gray-800 rounded-2xl items-center justify-center border border-white/10">
            <FontAwesome5 name="shopping-bag" size={20} color={activeMenu === 'investments' ? 'white' : '#9CA3AF'} />
          </StyledView>
          <StyledText className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Shop</StyledText>
        </StyledTouchableOpacity>

      </StyledView>

      {/* --- MENUS (HALF-SCREEN SHEETS) --- */}
      <Modal
        visible={!!activeMenu}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setActiveMenu(null)}
      >
        <StyledView className="flex-1 justify-end">
          <StyledTouchableOpacity
            className="absolute inset-0 bg-black/50"
            activeOpacity={1}
            onPress={() => setActiveMenu(null)}
          />
          <StyledView className="h-[70%] bg-gray-900 rounded-t-3xl border-t border-white/10 overflow-hidden">
            <BlurView intensity={50} className="absolute inset-0" />

            {/* Menu Header */}
            <StyledView className="flex-row justify-between items-center p-6 border-b border-white/10 bg-white/5">
              <StyledView className="flex-row items-center gap-2">
                {activeMenu === 'jobs' && <FontAwesome5 name="briefcase" size={18} color="white" />}
                {activeMenu === 'investments' && <FontAwesome5 name="shopping-bag" size={18} color="white" />}
                <StyledText className="text-lg font-bold text-white uppercase tracking-widest">
                  {activeMenu === 'jobs' ? 'Job Board' : 'Real Estate'}
                </StyledText>
              </StyledView>
              <StyledTouchableOpacity onPress={() => setActiveMenu(null)} className="p-2 bg-white/10 rounded-full">
                <Ionicons name="close" size={24} color="#9CA3AF" />
              </StyledTouchableOpacity>
            </StyledView>

            {/* Menu Content */}
            <ScrollView className="flex-1 p-4" contentContainerStyle={{ paddingBottom: 40 }}>

              {/* JOBS LIST */}
              {activeMenu === 'jobs' && JOBS.map(job => {
                const reqStatus = checkJobRequirements(job);
                const isLocked = !reqStatus.allowed;

                return (
                  <StyledTouchableOpacity
                    key={job.id}
                    onPress={() => setSelectedJob(job)}
                    className={`p-4 mb-3 rounded-xl border flex-row items-center gap-4 ${isLocked ? 'bg-white/5 border-white/5 opacity-70' : 'bg-white/10 border-white/10'}`}
                  >
                    <StyledImage source={job.image} className="w-12 h-12 rounded-lg bg-black/50" />
                    <StyledView className="flex-1">
                      <StyledView className="flex-row items-center gap-2">
                        <StyledText className="font-bold text-white text-base">{job.name}</StyledText>
                        {isLocked && <FontAwesome5 name="lock" size={12} color="#6B7280" />}
                      </StyledView>
                      <StyledView className="mt-1 flex-row">
                        <StyledText className="text-xs font-bold text-green-400 bg-green-400/10 px-2 py-0.5 rounded">₹{job.salary.toLocaleString()}/mo</StyledText>
                      </StyledView>
                    </StyledView>
                    <MaterialIcons name="chevron-right" size={20} color="#6B7280" />
                  </StyledTouchableOpacity>
                );
              })}

              {/* INVESTMENTS LIST (Shop) */}
              {activeMenu === 'investments' && INVESTMENTS.map(inv => (
                <StyledView key={inv.id} className="bg-white/5 rounded-xl border border-white/5 mb-4 overflow-hidden">
                  <StyledView className="h-40 w-full relative">
                    <StyledImage source={inv.image} className="w-full h-full" resizeMode="cover" />
                    <StyledView className="absolute bottom-3 left-4 bg-black/50 px-2 py-1 rounded">
                      <StyledText className="font-bold text-white text-lg">{inv.name}</StyledText>
                      <StyledText className="text-xs text-gray-300">{inv.type === 'housing' ? 'Housing' : 'Business'}</StyledText>
                    </StyledView>
                  </StyledView>
                  <StyledView className="p-4 flex-row justify-between items-center bg-white/5">
                    <StyledView>
                      <StyledText className="text-xl font-bold text-yellow-500">₹{inv.cost.toLocaleString()}</StyledText>
                      <StyledText className="text-xs text-gray-400">Maint: ₹{inv.maintenance.toLocaleString()}/mo</StyledText>
                    </StyledView>
                    <StyledTouchableOpacity
                      onPress={() => buyInvestment(inv)}
                      className="bg-green-600 px-6 py-2 rounded-lg elevation-5"
                    >
                      <StyledText className="text-white text-sm font-bold uppercase tracking-wider">Buy</StyledText>
                    </StyledTouchableOpacity>
                  </StyledView>
                </StyledView>
              ))}
            </ScrollView>
          </StyledView>
        </StyledView>
      </Modal>

      {/* --- DETAILED JOB VIEW MODAL --- */}
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

              {selectedJob?.req_degrees.map((deg, i) => (
                <StyledView key={i} className="p-3 rounded-lg border border-red-500/20 bg-red-500/10 mb-2 flex-row justify-between items-center">
                  <StyledText className="text-sm font-bold text-red-400">{deg}</StyledText>
                  <FontAwesome5 name="exclamation-circle" size={16} color="#F87171" />
                </StyledView>
              ))}
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
  );
};

export default function App() {
  return (
    <GameProvider>
      <GameLayout />
    </GameProvider>
  );
}
