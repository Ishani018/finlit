import { useState } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView } from 'react-native';
import { useGame } from '../context/GameContext';
import { EDUCATION } from '../data/education';
import { FontAwesome5 } from '@expo/vector-icons';

const LOCK_IMG = require('../../assets/ui_comp/lock.png');

const Corners = ({ color = '#6366f1' }) => (
    <>
        <View style={{ position: 'absolute', top: 0, left: 0, width: 5, height: 5, backgroundColor: color }} />
        <View style={{ position: 'absolute', top: 0, right: 0, width: 5, height: 5, backgroundColor: color }} />
        <View style={{ position: 'absolute', bottom: 0, left: 0, width: 5, height: 5, backgroundColor: color }} />
        <View style={{ position: 'absolute', bottom: 0, right: 0, width: 5, height: 5, backgroundColor: color }} />
    </>
);

const TYPE_META = {
    certification: { label: 'CERT',    color: '#6b7280', accent: '#9ca3af' },
    diploma:       { label: 'DIPLOMA',  color: '#f59e0b', accent: '#fbbf24' },
    degree:        { label: 'DEGREE',   color: '#6366f1', accent: '#a78bfa' },
};

const CARD_H = 150;

export default function EducationScreen({ onClose, onEnroll, onEnrollLoan }) {
    const { degrees, activeEnrollment, balance, dropOut } = useGame();
    const [selectedCourse, setSelectedCourse] = useState(null);

    // ── Course detail view ───────────────────────────────────────────────────
    if (selectedCourse) {
        const course = selectedCourse;
        const meta = TYPE_META[course.type] || TYPE_META.degree;
        const isCompleted = degrees.includes(course.name);
        const isStudying = activeEnrollment?.courseId === course.id;
        const missingPrereqs = (course.req_degrees || []).filter(d => !degrees.includes(d));
        const isLocked = missingPrereqs.length > 0;
        const canAfford = balance >= course.monthly_tuition;
        const months = course.duration;
        const durationLabel = months >= 12 ? `${Math.floor(months / 12)}y${months % 12 > 0 ? ` ${months % 12}mo` : ''}` : `${months}mo`;

        return (
            <View style={{ flex: 1, backgroundColor: '#06080f' }}>
                {/* Hero */}
                <View style={{ height: 180, backgroundColor: '#0a0d1a', position: 'relative' }}>
                    <Image source={course.image} style={{ width: '100%', height: '100%' }} resizeMode="contain" />
                    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(6,8,15,0.5)' }} />
                    <TouchableOpacity
                        onPress={() => setSelectedCourse(null)}
                        style={{ position: 'absolute', top: 14, left: 14, width: 34, height: 34, backgroundColor: 'rgba(0,0,0,0.7)', borderWidth: 1, borderColor: '#1e2840', alignItems: 'center', justifyContent: 'center' }}
                    >
                        <FontAwesome5 name="chevron-left" size={14} color="#6070a0" />
                    </TouchableOpacity>
                    <View style={{ position: 'absolute', bottom: 12, left: 14, backgroundColor: meta.color + '20', borderWidth: 1, borderColor: meta.color + '60', paddingHorizontal: 10, paddingVertical: 3 }}>
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: meta.accent, letterSpacing: 2 }}>{meta.label}</Text>
                    </View>
                    {isCompleted && (
                        <View style={{ position: 'absolute', bottom: 12, right: 14, backgroundColor: '#14532d', borderWidth: 1, borderColor: '#22c55e', paddingHorizontal: 10, paddingVertical: 3 }}>
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: '#4ade80', letterSpacing: 2 }}>✓ COMPLETED</Text>
                        </View>
                    )}
                </View>

                <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 28, color: '#c8d4f0', letterSpacing: 1, marginBottom: 4 }}>{course.name}</Text>
                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 17, color: '#556080', lineHeight: 22, marginBottom: 16 }}>{course.description}</Text>

                    <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
                        <View style={{ flex: 1, borderWidth: 1, borderColor: '#1e2840', backgroundColor: '#0d1020', padding: 12, alignItems: 'center' }}>
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: '#2a3860', letterSpacing: 2, marginBottom: 2 }}>MONTHLY FEE</Text>
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 22, color: canAfford ? '#fbbf24' : '#f87171' }}>₹{course.monthly_tuition.toLocaleString()}</Text>
                        </View>
                        <View style={{ flex: 1, borderWidth: 1, borderColor: '#1e2840', backgroundColor: '#0d1020', padding: 12, alignItems: 'center' }}>
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: '#2a3860', letterSpacing: 2, marginBottom: 2 }}>TOTAL COST</Text>
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 22, color: '#c8d4f0' }}>₹{course.total_cost.toLocaleString()}</Text>
                        </View>
                        <View style={{ flex: 1, borderWidth: 1, borderColor: '#1e2840', backgroundColor: '#0d1020', padding: 12, alignItems: 'center' }}>
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: '#2a3860', letterSpacing: 2, marginBottom: 2 }}>DURATION</Text>
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 22, color: '#c8d4f0' }}>{durationLabel}</Text>
                        </View>
                    </View>

                    {course.req_degrees.length > 0 && (
                        <View style={{ marginBottom: 16 }}>
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: '#2a3860', letterSpacing: 3, marginBottom: 8 }}>PREREQUISITES</Text>
                            {course.req_degrees.map((deg, i) => {
                                const has = degrees.includes(deg);
                                return (
                                    <View key={i} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 10, borderWidth: 1, borderColor: has ? '#166534' : '#7f1d1d', backgroundColor: has ? '#0d1e12' : '#1a0808', marginBottom: 6 }}>
                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: has ? '#4ade80' : '#f87171' }}>{deg}</Text>
                                        <FontAwesome5 name={has ? 'check' : 'times'} size={14} color={has ? '#4ade80' : '#f87171'} />
                                    </View>
                                );
                            })}
                        </View>
                    )}

                    <View style={{ borderWidth: 1, borderColor: '#1e2840', backgroundColor: '#070910', padding: 12, marginBottom: 20 }}>
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: '#2a3860', letterSpacing: 2, marginBottom: 4 }}>UNLOCKS</Text>
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: '#445070' }}>
                            {course.type === 'certification' && 'Trade jobs: Plumber, Carpenter, CAD Engineer'}
                            {course.id === 'edu_cs_degree' && 'Software Engineer, AR/VR Scientist → MBA path'}
                            {course.id === 'edu_mba' && 'CEO, CFO, Executive roles'}
                            {course.id === 'edu_medical' && 'Doctor, Therapist, Vet'}
                            {course.id === 'edu_design' && 'Interior Designer'}
                            {course.id === 'edu_culinary' && 'High-End Chef'}
                            {course.id === 'edu_science' && 'Microbiologist, Forensic Scientist, Horticulturist'}
                        </Text>
                    </View>

                    {isCompleted ? (
                        <View style={{ padding: 14, borderWidth: 1, borderColor: '#166534', backgroundColor: '#0d1e12', alignItems: 'center', position: 'relative' }}>
                            <Corners color="#22c55e" />
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 22, color: '#4ade80', letterSpacing: 2 }}>✓ DEGREE EARNED</Text>
                        </View>
                    ) : isStudying ? (
                        <View>
                            <View style={{ padding: 14, borderWidth: 1, borderColor: meta.color, backgroundColor: '#0d0d1e', alignItems: 'center', marginBottom: 10, position: 'relative' }}>
                                <Corners color={meta.color} />
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 20, color: meta.accent, letterSpacing: 2 }}>STUDYING — {activeEnrollment.monthsRemaining}mo LEFT</Text>
                                <View style={{ width: '100%', height: 5, backgroundColor: '#0d1020', marginTop: 10 }}>
                                    <View style={{ height: '100%', width: `${Math.max(5, 100 - (activeEnrollment.monthsRemaining / course.duration * 100))}%`, backgroundColor: meta.color }} />
                                </View>
                            </View>
                            <TouchableOpacity onPress={() => { dropOut(); setSelectedCourse(null); }} style={{ padding: 12, borderWidth: 1, borderColor: '#7f1d1d', alignItems: 'center' }}>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 18, color: '#f87171', letterSpacing: 1 }}>DROP OUT</Text>
                            </TouchableOpacity>
                        </View>
                    ) : isLocked ? (
                        <View style={{ padding: 14, borderWidth: 1, borderColor: '#7f1d1d', backgroundColor: '#1a0808', flexDirection: 'row', alignItems: 'center', gap: 10, justifyContent: 'center' }}>
                            <Image source={LOCK_IMG} style={{ width: 16, height: 16 }} resizeMode="contain" />
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 18, color: '#f87171' }}>Complete prerequisites first</Text>
                        </View>
                    ) : (
                        <View style={{ gap: 10 }}>
                            <TouchableOpacity
                                onPress={() => { onEnroll(course); setSelectedCourse(null); }}
                                disabled={!!activeEnrollment || !canAfford}
                                style={{ padding: 14, borderWidth: 1, borderColor: canAfford && !activeEnrollment ? meta.color : '#1e2840', backgroundColor: canAfford && !activeEnrollment ? '#0d0d1e' : '#070910', alignItems: 'center', position: 'relative', opacity: activeEnrollment ? 0.5 : 1 }}
                            >
                                {canAfford && !activeEnrollment && <Corners color={meta.color} />}
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 20, color: canAfford && !activeEnrollment ? meta.accent : '#2a3560', letterSpacing: 2 }}>
                                    {activeEnrollment ? 'ALREADY STUDYING' : !canAfford ? 'CANT AFFORD FEES' : 'ENROLL — PAY MONTHLY'}
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => { onEnrollLoan(course); setSelectedCourse(null); }}
                                disabled={!!activeEnrollment}
                                style={{ padding: 14, borderWidth: 1, borderColor: !activeEnrollment ? '#166534' : '#1e2840', backgroundColor: !activeEnrollment ? '#0d1e12' : '#070910', alignItems: 'center', position: 'relative', opacity: activeEnrollment ? 0.5 : 1 }}
                            >
                                {!activeEnrollment && <Corners color="#22c55e" />}
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 20, color: !activeEnrollment ? '#4ade80' : '#2a3560', letterSpacing: 2 }}>
                                    {activeEnrollment ? 'ALREADY STUDYING' : 'EDUCATION LOAN'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </ScrollView>
            </View>
        );
    }

    // ── Main card grid ───────────────────────────────────────────────────────
    return (
        <View style={{ flex: 1, backgroundColor: '#06080f' }}>
            <View style={{ backgroundColor: '#0d1020', paddingTop: 14, paddingBottom: 12, paddingHorizontal: 16, borderBottomWidth: 1, borderColor: '#1a2040', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View>
                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: '#2a3560', letterSpacing: 4 }}>UNIVERSITY</Text>
                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 26, color: '#c8d4f0', letterSpacing: 1 }}>Your Education</Text>
                </View>
                <TouchableOpacity onPress={onClose} style={{ width: 34, height: 34, borderWidth: 1, borderColor: '#1e2840', alignItems: 'center', justifyContent: 'center' }}>
                    <FontAwesome5 name="times" size={14} color="#445070" />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ padding: 12, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
                {/* Active enrollment banner */}
                {activeEnrollment && (() => {
                    const course = EDUCATION.find(c => c.id === activeEnrollment.courseId);
                    const meta = TYPE_META[course?.type] || TYPE_META.degree;
                    const pct = course ? Math.max(5, 100 - (activeEnrollment.monthsRemaining / course.duration * 100)) : 50;
                    return (
                        <View style={{ borderWidth: 1, borderColor: meta.color + '60', backgroundColor: meta.color + '08', padding: 12, marginBottom: 14, position: 'relative' }}>
                            <Corners color={meta.color} />
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: meta.color, letterSpacing: 3, marginBottom: 2 }}>CURRENTLY STUDYING</Text>
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 20, color: '#c8d4f0', marginBottom: 2 }}>{activeEnrollment.courseName}</Text>
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: '#445070', marginBottom: 8 }}>{activeEnrollment.monthsRemaining}mo left · ₹{activeEnrollment.monthlyTuition.toLocaleString()}/mo</Text>
                            <View style={{ height: 5, backgroundColor: '#070910' }}>
                                <View style={{ height: '100%', width: `${pct}%`, backgroundColor: meta.color }} />
                            </View>
                        </View>
                    );
                })()}

                {/* Degrees earned chips */}
                {degrees.length > 0 && (
                    <View style={{ marginBottom: 14 }}>
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: '#2a3560', letterSpacing: 3, marginBottom: 6 }}>EARNED ({degrees.length})</Text>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                            {degrees.map(d => (
                                <View key={d} style={{ backgroundColor: '#0d1e12', borderWidth: 1, borderColor: '#166534', paddingHorizontal: 8, paddingVertical: 3 }}>
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: '#4ade80' }}>✓ {d}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {/* Course card grid — 2 columns per type section */}
                {['certification', 'diploma', 'degree'].map(type => {
                    const courses = EDUCATION.filter(c => c.type === type);
                    const meta = TYPE_META[type];
                    return (
                        <View key={type} style={{ marginBottom: 16 }}>
                            {/* Section label */}
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                <View style={{ width: 3, height: 14, backgroundColor: meta.color }} />
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: meta.accent, letterSpacing: 3 }}>{meta.label}S</Text>
                                <View style={{ flex: 1, height: 1, backgroundColor: meta.color + '30' }} />
                            </View>

                            {/* 2-col grid */}
                            {Array.from({ length: Math.ceil(courses.length / 2) }).map((_, rowIdx) => (
                                <View key={rowIdx} style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
                                    {courses.slice(rowIdx * 2, rowIdx * 2 + 2).map(course => {
                                        const isCompleted = degrees.includes(course.name);
                                        const isStudying = activeEnrollment?.courseId === course.id;
                                        const missingPrereqs = (course.req_degrees || []).filter(d => !degrees.includes(d));
                                        const isLocked = missingPrereqs.length > 0;
                                        const months = course.duration;
                                        const durationLabel = months >= 12 ? `${Math.floor(months / 12)}y` : `${months}mo`;

                                        return (
                                            <TouchableOpacity
                                                key={course.id}
                                                onPress={() => setSelectedCourse(course)}
                                                activeOpacity={0.85}
                                                style={{ flex: 1, borderWidth: 1, borderColor: isCompleted ? '#166534' : isStudying ? meta.color + '80' : '#1a2040', overflow: 'hidden' }}
                                            >
                                                {/* Image fills card */}
                                                <View style={{ height: CARD_H, position: 'relative', backgroundColor: '#0a0d1a' }}>
                                                    <Image source={course.image} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                                                    {/* Scrim */}
                                                    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: isLocked ? 'rgba(4,6,14,0.72)' : 'rgba(4,6,14,0.45)' }} />
                                                    {/* Status badge top-right */}
                                                    {isCompleted && (
                                                        <View style={{ position: 'absolute', top: 8, right: 8, backgroundColor: '#22c55e', paddingHorizontal: 6, paddingVertical: 2 }}>
                                                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 9, color: '#000', letterSpacing: 1 }}>✓ DONE</Text>
                                                        </View>
                                                    )}
                                                    {isStudying && (
                                                        <View style={{ position: 'absolute', top: 8, right: 8, backgroundColor: meta.color, paddingHorizontal: 6, paddingVertical: 2 }}>
                                                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 9, color: '#000', letterSpacing: 1 }}>ACTIVE</Text>
                                                        </View>
                                                    )}
                                                    {isLocked && (
                                                        <View style={{ position: 'absolute', top: 8, right: 8 }}>
                                                            <Image source={LOCK_IMG} style={{ width: 18, height: 18, opacity: 0.7 }} resizeMode="contain" />
                                                        </View>
                                                    )}
                                                    {/* Info overlay bottom */}
                                                    <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 8 }}>
                                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 15, color: isLocked ? '#445070' : '#c8d4f0', lineHeight: 17 }} numberOfLines={1}>{course.name}</Text>
                                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 2 }}>
                                                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 12, color: '#445070' }}>₹{(course.monthly_tuition / 1000).toFixed(0)}k/mo</Text>
                                                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 12, color: meta.color }}>{durationLabel}</Text>
                                                        </View>
                                                    </View>
                                                </View>
                                            </TouchableOpacity>
                                        );
                                    })}
                                    {courses.slice(rowIdx * 2, rowIdx * 2 + 2).length === 1 && <View style={{ flex: 1 }} />}
                                </View>
                            ))}
                        </View>
                    );
                })}
            </ScrollView>
        </View>
    );
}
