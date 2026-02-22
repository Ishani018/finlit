import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, TextInput, ScrollView } from 'react-native';
import { styled } from 'nativewind';
import { useGame } from '../context/GameContext';
import { FontAwesome5 } from '@expo/vector-icons';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledImage = styled(Image);
const StyledTextInput = styled(TextInput);

const AVAILABLE_SPRITES = [
    { id: 'young_pia_1', image: require('../../assets/sprites/young pia 1.png') },
    { id: 'young_raj_1', image: require('../../assets/sprites/young raj 1.png') },
    { id: 'young_soms_1', image: require('../../assets/sprites/young soms 1.png') },
    { id: 'young_sia_1', image: require('../../assets/sprites/young sia 1.png') },
    { id: 'young_soni_1', image: require('../../assets/sprites/young soni 1.png') },
    { id: 'young_priya_1', image: require('../../assets/sprites/young priya 1.png') },
    { id: 'young_rahul_1', image: require('../../assets/sprites/young rahul 1.png') },
    { id: 'young_riya_1', image: require('../../assets/sprites/young riya 1.png') },
    { id: 'young_karthik_1', image: require('../../assets/sprites/young karthik 1.png') },
    { id: 'young_sara_1', image: require('../../assets/sprites/young sara 1.png') },
    { id: 'young_kav_1', image: require('../../assets/sprites/young kav 1.png') },
];

const SpriteSelectionScreen = () => {
    const { setPlayerSprite, setPlayerName } = useGame();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [nameInput, setNameInput] = useState("");
    const [step, setStep] = useState(1); // 1: Pick Avatar, 2: Enter Name

    const handleConfirm = () => {
        if (nameInput.trim() === '') return;
        setPlayerName(nameInput.trim());
        setPlayerSprite(AVAILABLE_SPRITES[currentIndex].id);
    };

    const handleNextStep = () => {
        setStep(2);
    };

    const handleBackStep = () => {
        setStep(1);
    };

    const handleNext = () => {
        setCurrentIndex((prev) => (prev + 1) % AVAILABLE_SPRITES.length);
    };

    const handlePrev = () => {
        setCurrentIndex((prev) => (prev - 1 + AVAILABLE_SPRITES.length) % AVAILABLE_SPRITES.length);
    };

    const currentSprite = AVAILABLE_SPRITES[currentIndex];

    return (
        <StyledView className="flex-1 bg-neutral-900 justify-center items-center py-10 px-4">
            <StyledView className="w-full max-w-sm">
                <StyledView className="items-center mb-10">
                    <StyledText className="text-3xl font-black text-white mb-2 text-center tracking-widest uppercase">Select Avatar</StyledText>
                    <StyledText className="text-neutral-400 text-center text-md">
                        This character will represent you in the FinLit simulation.
                    </StyledText>
                </StyledView>

                {/* Step 1: Avatar Selection */}
                {step === 1 && (
                    <>
                        <StyledView className="items-center justify-center mb-6 relative flex-row">
                            {/* Left Arrow */}
                            <StyledTouchableOpacity
                                onPress={handlePrev}
                                className="absolute left-0 z-10 w-12 h-12 bg-black/80 border border-white/20 rounded-full items-center justify-center"
                            >
                                <FontAwesome5 name="chevron-left" size={20} color="white" style={{ marginRight: 2 }} />
                            </StyledTouchableOpacity>

                            {/* Character Card Base */}
                            <StyledView className="w-64 h-80 items-center justify-center overflow-hidden pb-4">
                                <StyledImage
                                    source={currentSprite.image}
                                    style={{ width: '80%', height: '80%' }}
                                    resizeMode="contain"
                                />
                            </StyledView>

                            {/* Right Arrow */}
                            <StyledTouchableOpacity
                                onPress={handleNext}
                                className="absolute right-0 z-10 w-12 h-12 bg-black/80 border border-white/20 rounded-full items-center justify-center"
                            >
                                <FontAwesome5 name="chevron-right" size={20} color="white" style={{ marginLeft: 2 }} />
                            </StyledTouchableOpacity>
                        </StyledView>

                        {/* Dots indicator */}
                        <StyledView className="flex-row items-center justify-center gap-1 mb-8 max-w-[80%] self-center flex-wrap">
                            {AVAILABLE_SPRITES.map((_, idx) => (
                                <StyledView
                                    key={idx}
                                    className={`h-2 rounded-full m-0.5 ${idx === currentIndex ? 'bg-blue-500 w-6' : 'bg-neutral-600 w-2'}`}
                                />
                            ))}
                        </StyledView>

                        {/* Footer fixed at bottom */}
                        <StyledView className="pb-8 pt-2">
                            <StyledTouchableOpacity
                                onPress={handleNextStep}
                                className="w-full py-5 rounded-2xl items-center justify-center border bg-blue-600 border-blue-400"
                            >
                                <StyledText className="text-lg font-bold uppercase tracking-widest text-white">
                                    Next: Name Avatar
                                </StyledText>
                            </StyledTouchableOpacity>
                        </StyledView>
                    </>
                )}

                {/* Step 2: Name Input */}
                {step === 2 && (
                    <StyledView className="flex-1 justify-end pb-8">
                        <StyledView className="bg-black/50 p-6 rounded-3xl border border-white/10 mb-6 w-full items-center">
                            <StyledText className="text-neutral-300 font-bold mb-4 uppercase tracking-wider text-center">What is your name?</StyledText>
                            <StyledTextInput
                                className="w-full bg-neutral-800 border-2 border-neutral-700 text-white p-4 rounded-xl text-center text-2xl font-bold focus:border-blue-500 mb-6"
                                placeholder="Player Name"
                                placeholderTextColor="#6b7280"
                                value={nameInput}
                                onChangeText={setNameInput}
                                maxLength={15}
                                autoFocus={true}
                            />
                        </StyledView>

                        <StyledView className="flex-row gap-4">
                            <StyledTouchableOpacity
                                onPress={handleBackStep}
                                className="flex-1 py-4 rounded-xl items-center justify-center border bg-neutral-800 border-neutral-700"
                            >
                                <StyledText className="text-neutral-400 font-bold uppercase tracking-widest">Back</StyledText>
                            </StyledTouchableOpacity>

                            <StyledTouchableOpacity
                                onPress={handleConfirm}
                                disabled={nameInput.trim() === ''}
                                className={`flex-[2] py-4 rounded-xl items-center justify-center border ${nameInput.trim() === '' ? 'bg-neutral-800 border-neutral-700' : 'bg-blue-600 border-blue-400'}`}
                            >
                                <StyledText className={`font-bold uppercase tracking-widest ${nameInput.trim() === '' ? 'text-neutral-500' : 'text-white'}`}>
                                    Start Journey
                                </StyledText>
                            </StyledTouchableOpacity>
                        </StyledView>
                    </StyledView>
                )}
            </StyledView>
        </StyledView>
    );
};

export default SpriteSelectionScreen;
