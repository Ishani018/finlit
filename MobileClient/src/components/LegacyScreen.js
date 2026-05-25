import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, Image } from 'react-native';
import { useGame } from '../context/GameContext';
import { useFonts, VT323_400Regular } from '@expo-google-fonts/vt323';

export default function LegacyScreen() {
    let [fontsLoaded] = useFonts({ VT323_400Regular });
    const { legacySummary, setIsLegacyMode, setPlayerSprite } = useGame();

    if (!fontsLoaded || !legacySummary) return null;

    const {
        age, netWorth, estateTaxRate, estateTaxAmount,
        totalChildSavings, numChildren, generalInheritance,
        eldestSavings, startingGenBalance, eldestChild
    } = legacySummary;

    const handleStartNextGen = () => {
        setIsLegacyMode(true);
        // Clearing player sprite triggers SpriteSelectionScreen in App.js
        setPlayerSprite(null);
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#06080f' }}>
            <View style={{ flex: 1, padding: 24, justifyContent: 'center' }}>
                <View style={{ borderWidth: 1, borderColor: '#f87171', backgroundColor: '#f8717111', padding: 20, alignItems: 'center' }}>
                    <Image source={require('../../assets/ui_comp/warning.png')} style={{ width: 40, height: 40, marginBottom: 10, tintColor: '#f87171' }} />
                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 32, color: '#f87171', letterSpacing: 2 }}>END OF AN ERA</Text>
                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: '#c8d4f0', textAlign: 'center', marginTop: 8 }}>
                        You peacefully passed away at age {age}. Your financial legacy now passes to the next generation.
                    </Text>
                </View>

                <ScrollView style={{ marginTop: 24, flex: 1 }} showsVerticalScrollIndicator={false}>
                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 22, color: '#60a5fa', marginBottom: 12 }}>ESTATE SETTLEMENT</Text>
                    
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 18, color: '#c8d4f0' }}>Total Net Worth</Text>
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 18, color: '#fbbf24' }}>₹{netWorth.toLocaleString()}</Text>
                    </View>

                    {totalChildSavings > 0 && (
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 18, color: '#c8d4f0' }}>- Child Savings Accs</Text>
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 18, color: '#f87171' }}>-₹{totalChildSavings.toLocaleString()}</Text>
                        </View>
                    )}

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 18, color: '#c8d4f0' }}>- Estate Tax ({estateTaxRate}%)</Text>
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 18, color: '#f87171' }}>-₹{Math.round(estateTaxAmount).toLocaleString()}</Text>
                    </View>

                    <View style={{ height: 1, backgroundColor: '#1a2440', marginVertical: 12 }} />

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 }}>
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 20, color: '#60a5fa' }}>INHERITANCE POOL</Text>
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 20, color: '#fbbf24' }}>
                            ₹{Math.round(netWorth - totalChildSavings - estateTaxAmount).toLocaleString()}
                        </Text>
                    </View>

                    <View style={{ backgroundColor: '#111828', padding: 16, borderWidth: 1, borderColor: '#1a2440' }}>
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 20, color: '#c8d4f0', marginBottom: 12 }}>NEXT GENERATION: {eldestChild ? eldestChild.name.toUpperCase() : 'YOUR HEIR'}</Text>
                        
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: '#6b7280' }}>1/{numChildren} Split of Pool</Text>
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: '#fbbf24' }}>₹{generalInheritance.toLocaleString()}</Text>
                        </View>

                        {eldestSavings > 0 && (
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: '#6b7280' }}>Specific Savings Acc</Text>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: '#fbbf24' }}>+₹{eldestSavings.toLocaleString()}</Text>
                            </View>
                        )}

                        <View style={{ height: 1, backgroundColor: '#1a2440', marginVertical: 8 }} />

                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 18, color: '#60a5fa' }}>STARTING BALANCE</Text>
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 18, color: '#fbbf24' }}>₹{startingGenBalance.toLocaleString()}</Text>
                        </View>

                        {eldestChild && eldestChild.schoolTier === 'Top Tier' && (
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: '#34d399', marginTop: 4 }}>
                                ✓ Inherited Top Tier Education (Starts with Degree)
                            </Text>
                        )}
                    </View>

                    <TouchableOpacity 
                        onPress={handleStartNextGen}
                        style={{ backgroundColor: '#60a5fa', padding: 16, alignItems: 'center', marginTop: 32 }}
                    >
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 20, color: '#04060e', letterSpacing: 2 }}>
                            PASS THE TORCH →
                        </Text>
                    </TouchableOpacity>
                </ScrollView>
            </View>
        </SafeAreaView>
    );
}
