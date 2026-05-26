import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useGame } from '../context/GameContext';
import { INTERVIEW_SCENARIOS } from '../data/interviews';

const C = {
    bg:     '#06080f',
    panel:  '#0d1020',
    card:   '#070a16',
    border: '#1a2040',
    borderLt: '#1e2840',
    blue:   '#3b82f6',
    sage:   '#4ade80',
    cream:  '#c8d4f0',
    dim:    '#445070',
    dark:   '#2a3560',
    red:    '#ef4444',
};

export default function InterviewModal() {
    const { pendingJobInterview, resolveInterview } = useGame();
    const [scenario, setScenario] = useState(null);

    useEffect(() => {
        if (pendingJobInterview && !scenario) {
            // Pick a random scenario when a decision is pending
            const randomScenario = INTERVIEW_SCENARIOS[Math.floor(Math.random() * INTERVIEW_SCENARIOS.length)];
            setScenario(randomScenario);
        } else if (!pendingJobInterview) {
            setScenario(null);
        }
    }, [pendingJobInterview]);

    if (!pendingJobInterview || !scenario) return null;

    const job = pendingJobInterview;

    return (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 999, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
            <View style={{ width: '100%', maxWidth: 400, backgroundColor: C.panel, borderWidth: 1, borderColor: C.blue, overflow: 'hidden' }}>
                <View style={{ backgroundColor: '#1e3a8a', padding: 15, borderBottomWidth: 1, borderColor: C.border }}>
                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: '#93c5fd', letterSpacing: 2 }}>JOB INTERVIEW</Text>
                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 24, color: '#ffffff', letterSpacing: 1 }}>{job.name}</Text>
                </View>

                <View style={{ padding: 20 }}>
                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 18, color: C.cream, lineHeight: 22, marginBottom: 20 }}>
                        {scenario.text}
                    </Text>

                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: C.dim, letterSpacing: 1, marginBottom: 10 }}>CHOOSE YOUR RESPONSE:</Text>
                    
                    <ScrollView style={{ maxHeight: 300 }} showsVerticalScrollIndicator={false}>
                        <View style={{ gap: 10 }}>
                            {scenario.choices.map((choice, idx) => (
                                <TouchableOpacity
                                    key={idx}
                                    onPress={() => resolveInterview(choice, job)}
                                    activeOpacity={0.8}
                                    style={{ backgroundColor: C.card, borderWidth: 1, borderColor: C.borderLt, padding: 15 }}
                                >
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: '#60a5fa', marginBottom: 5 }}>
                                        "{choice.label}"
                                    </Text>
                                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                                        {choice.salaryMultiplier > 1 && (
                                            <View style={{ backgroundColor: '#14532d30', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 2, borderWidth: 1, borderColor: '#14532d50' }}>
                                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: '#86efac' }}>
                                                    +{Math.round((choice.salaryMultiplier - 1) * 100)}% PAY
                                                </Text>
                                            </View>
                                        )}
                                        {choice.happinessModifier !== 0 && (
                                            <View style={{ backgroundColor: choice.happinessModifier > 0 ? '#14532d30' : '#7f1d1d30', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 2, borderWidth: 1, borderColor: choice.happinessModifier > 0 ? '#14532d50' : '#7f1d1d50' }}>
                                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: choice.happinessModifier > 0 ? '#86efac' : '#fca5a5' }}>
                                                    {choice.happinessModifier > 0 ? '+' : ''}{choice.happinessModifier} HAPPINESS
                                                </Text>
                                            </View>
                                        )}
                                        {choice.healthModifier !== 0 && (
                                            <View style={{ backgroundColor: '#7f1d1d30', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 2, borderWidth: 1, borderColor: '#7f1d1d50' }}>
                                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: '#fca5a5' }}>
                                                    {choice.healthModifier} HEALTH
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </ScrollView>
                </View>
            </View>
        </View>
    );
}
