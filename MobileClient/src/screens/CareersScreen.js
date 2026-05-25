import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView } from 'react-native';
import { useGame } from '../context/GameContext';
import { JOBS } from '../data/jobs';
import { FontAwesome5 } from '@expo/vector-icons';

const PAD = 14;
const GAP = 8;
const TIER_H = 150;
const JOB_H = 110;

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
};

const TIERS = [
    { key: 'Tier 1', label: 'GIG & FREELANCE', color: '#6b7280', accent: '#9ca3af', icon: 'bolt',     image: require('../../assets/jobs/streamer.png') },
    { key: 'Tier 2', label: 'CAREERS',         color: '#3b82f6', accent: '#93c5fd', icon: 'briefcase', image: require('../../assets/jobs/SDE.png') },
    { key: 'Tier 3', label: 'BUSINESS',        color: '#4ade80', accent: '#86efac', icon: 'store',     image: require('../../assets/jobs/irani cafe.png') },
    { key: 'Tier 4', label: 'EXECUTIVE',       color: '#a78bfa', accent: '#c4b5fd', icon: 'crown',     image: require('../../assets/jobs/construction site.png') },
];

const MAX_SALARY = 1500000;

function ItemGrid({ children }) {
    const items = React.Children.toArray(children);
    const rows = [];
    for (let i = 0; i < items.length; i += 2) {
        rows.push(
            <View key={i} style={{ flexDirection: 'row', gap: GAP, marginBottom: GAP }}>
                {items[i]}
                {items[i + 1] || <View style={{ flex: 1 }} />}
            </View>
        );
    }
    return <View>{rows}</View>;
}

function TierCard({ tier, unlocked, count, onPress }) {
    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.8}
            style={{ flex: 1, height: TIER_H, overflow: 'hidden', position: 'relative', borderWidth: 1, borderColor: C.border }}
        >
            <Image source={tier.image} style={{ width: '100%', height: '100%', position: 'absolute' }} resizeMode="cover" />
            <View style={{ position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(6,8,15,0.85)', borderWidth: 1, borderColor: tier.color + '50', paddingHorizontal: 5, paddingVertical: 2 }}>
                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: tier.accent }}>{unlocked}/{count}</Text>
            </View>
            <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(6,8,15,0.88)', paddingVertical: 6, paddingHorizontal: 8, borderTopWidth: 1, borderColor: tier.color + '30' }}>
                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: tier.accent, letterSpacing: 2 }}>{tier.label}</Text>
            </View>
        </TouchableOpacity>
    );
}

function JobCard({ job, tier, isCurrent, isOffer, isLocked, isPending, onPress }) {
    const salaryPct = Math.min(job.salary / MAX_SALARY, 1);
    const borderColor = isCurrent ? C.blue : isOffer ? '#22c55e' : isPending ? '#ca8a04' : C.border;
    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.8}
            style={{ flex: 1, height: JOB_H + 58, overflow: 'hidden', position: 'relative', borderWidth: 1, borderColor, opacity: isLocked ? 0.5 : 1 }}
        >
            <View style={{ width: '100%', height: JOB_H, backgroundColor: C.card }}>
                <Image source={job.image} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                {isLocked && <View style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(6,8,15,0.65)' }} />}
                {isLocked && (
                    <View style={{ position: 'absolute', top: 8, right: 8 }}>
                        <FontAwesome5 name="lock" size={13} color={C.dim} />
                    </View>
                )}
                {isCurrent && (
                    <View style={{ position: 'absolute', top: 6, left: 6, backgroundColor: '#050d1e', borderWidth: 1, borderColor: C.blue, paddingHorizontal: 5, paddingVertical: 1 }}>
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 10, color: '#60a5fa', letterSpacing: 1 }}>CURRENT</Text>
                    </View>
                )}
                {isOffer && (
                    <View style={{ position: 'absolute', top: 6, left: 6, backgroundColor: '#0d1e12', borderWidth: 1, borderColor: '#22c55e', paddingHorizontal: 5, paddingVertical: 1 }}>
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 10, color: '#4ade80', letterSpacing: 1 }}>OFFER</Text>
                    </View>
                )}
                {isPending && !isCurrent && (
                    <View style={{ position: 'absolute', top: 6, left: 6, backgroundColor: '#422006', borderWidth: 1, borderColor: '#ca8a04', paddingHorizontal: 5, paddingVertical: 1 }}>
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 10, color: '#facc15', letterSpacing: 1 }}>PENDING</Text>
                    </View>
                )}
            </View>
            <View style={{ padding: 8, backgroundColor: C.panel }}>
                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 15, color: isLocked ? C.dark : C.cream, lineHeight: 16 }} numberOfLines={1}>{job.name}</Text>
                <View style={{ height: 3, backgroundColor: C.card, marginTop: 5, marginBottom: 4 }}>
                    <View style={{ height: '100%', width: `${salaryPct * 100}%`, backgroundColor: isLocked ? C.dark : tier.color }} />
                </View>
                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: isLocked ? C.dark : C.sage }}>₹{(job.salary / 1000).toFixed(0)}k/mo</Text>
            </View>
        </TouchableOpacity>
    );
}

export default function CareersScreen({ onClose, onApply }) {
    const { currentJob, checkJobRequirements, netWorth, pendingJobOffer, degrees, pendingApplications = [] } = useGame();
    const [selectedTier, setSelectedTier] = useState(null);
    const [selectedJob, setSelectedJob] = useState(null);

    const tierJobs = (tierKey) => JOBS.filter(j => j.type.startsWith(tierKey));
    const tier = selectedTier ? TIERS.find(t => t.key === selectedTier) : null;
    const jobs = selectedTier ? tierJobs(selectedTier) : [];

    // ── Job detail view ──────────────────────────────────────────────────────
    if (selectedJob) {
        const req = checkJobRequirements(selectedJob);
        const isLocked = !req.allowed;
        const isCurrent = currentJob?.id === selectedJob.id;
        const isOffer = pendingJobOffer?.id === selectedJob.id;
        const salaryPct = Math.min(selectedJob.salary / MAX_SALARY, 1);
        const currentSalaryPct = currentJob ? Math.min(currentJob.salary / MAX_SALARY, 1) : 0;
        const tierInfo = TIERS.find(t => selectedJob.type.startsWith(t.key)) || TIERS[0];

        return (
            <View style={{ flex: 1, backgroundColor: C.bg }}>
                <View style={{ height: 200, backgroundColor: C.card, position: 'relative' }}>
                    <Image source={selectedJob.office_image || selectedJob.image} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                    <View style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(6,8,15,0.4)' }} />
                    <TouchableOpacity
                        onPress={() => setSelectedJob(null)}
                        style={{ position: 'absolute', top: 14, left: 14, width: 34, height: 34, backgroundColor: 'rgba(6,8,15,0.8)', borderWidth: 1, borderColor: C.border, alignItems: 'center', justifyContent: 'center' }}
                    >
                        <FontAwesome5 name="chevron-left" size={14} color={C.dim} />
                    </TouchableOpacity>
                    <View style={{ position: 'absolute', bottom: 12, left: 14, backgroundColor: tierInfo.color + '22', borderWidth: 1, borderColor: tierInfo.color + '60', paddingHorizontal: 10, paddingVertical: 3 }}>
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 12, color: tierInfo.accent, letterSpacing: 2 }}>{selectedJob.type.toUpperCase()}</Text>
                    </View>
                </View>

                <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 30, color: C.cream, letterSpacing: 1, marginBottom: 2 }}>{selectedJob.name}</Text>

                    <View style={{ marginTop: 12, marginBottom: 16 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: C.dim, letterSpacing: 2 }}>SALARY</Text>
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 22, color: C.sage }}>₹{selectedJob.salary.toLocaleString()}/mo</Text>
                        </View>
                        <View style={{ height: 8, backgroundColor: C.card, marginBottom: 3 }}>
                            <View style={{ height: '100%', width: `${salaryPct * 100}%`, backgroundColor: tierInfo.color }} />
                        </View>
                        {currentJob && (
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                <View style={{ flex: 1, height: 4, backgroundColor: C.card }}>
                                    <View style={{ height: '100%', width: `${currentSalaryPct * 100}%`, backgroundColor: C.dark }} />
                                </View>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: C.dark }}>
                                    Current: ₹{currentJob.salary.toLocaleString()}
                                </Text>
                            </View>
                        )}
                        {currentJob && selectedJob.salary > currentJob.salary && (
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: C.sage, marginTop: 4 }}>
                                +₹{(selectedJob.salary - currentJob.salary).toLocaleString()}/mo raise
                            </Text>
                        )}
                    </View>

                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 15, color: C.dim, lineHeight: 18, marginBottom: 16 }}>{selectedJob.description}</Text>

                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 12, color: C.dark, letterSpacing: 3, marginBottom: 8 }}>REQUIREMENTS</Text>
                    <View style={{ marginBottom: 20, gap: 6 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 10, borderWidth: 1, borderColor: netWorth >= selectedJob.req_net_worth ? '#166534' : '#7f1d1d', backgroundColor: netWorth >= selectedJob.req_net_worth ? '#0d1e12' : '#150508' }}>
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: netWorth >= selectedJob.req_net_worth ? '#4ade80' : '#f87171' }}>
                                Net Worth ≥ ₹{selectedJob.req_net_worth.toLocaleString()}
                            </Text>
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: netWorth >= selectedJob.req_net_worth ? '#4ade80' : '#f87171' }}>
                                {netWorth >= selectedJob.req_net_worth ? '✓' : '✕'}
                            </Text>
                        </View>
                        {selectedJob.req_degrees.length === 0 && (
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 10, borderWidth: 1, borderColor: '#166534', backgroundColor: '#0d1e12' }}>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: '#4ade80' }}>No degree required</Text>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: '#4ade80' }}>✓</Text>
                            </View>
                        )}
                        {selectedJob.req_degrees.map((deg, i) => {
                            const hasDeg = degrees.includes(deg);
                            return (
                                <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 10, borderWidth: 1, borderColor: hasDeg ? '#166534' : '#7f1d1d', backgroundColor: hasDeg ? '#0d1e12' : '#150508' }}>
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: hasDeg ? '#4ade80' : '#f87171' }}>{deg}</Text>
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: hasDeg ? '#4ade80' : '#f87171' }}>{hasDeg ? '✓' : '✕'}</Text>
                                </View>
                            );
                        })}
                    </View>

                    {isCurrent ? (
                        <View style={{ padding: 14, borderWidth: 1, borderColor: C.border, backgroundColor: C.panel, alignItems: 'center' }}>
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 18, color: C.blue, letterSpacing: 2 }}>CURRENT JOB ✓</Text>
                        </View>
                    ) : isLocked ? (
                        <View style={{ padding: 14, borderWidth: 1, borderColor: '#7f1d1d', backgroundColor: '#150508', flexDirection: 'row', alignItems: 'center', gap: 10, justifyContent: 'center' }}>
                            <FontAwesome5 name="lock" size={14} color="#f87171" />
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 18, color: '#f87171', letterSpacing: 1 }}>{req.reason}</Text>
                        </View>
                    ) : pendingApplications.some(a => a.id === selectedJob.id) ? (
                        <View style={{ padding: 14, borderWidth: 1, borderColor: '#ca8a04', backgroundColor: '#422006', alignItems: 'center' }}>
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 20, color: '#facc15', letterSpacing: 2 }}>APPLICATION PENDING</Text>
                        </View>
                    ) : (
                        <TouchableOpacity
                            onPress={() => { onApply(selectedJob); setSelectedJob(null); }}
                            style={{ padding: 14, borderWidth: 1, borderColor: '#22c55e', backgroundColor: '#0d1e12', alignItems: 'center' }}
                        >
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 20, color: '#4ade80', letterSpacing: 2 }}>
                                {isOffer ? 'ACCEPT OFFER ✓' : 'APPLY NOW'}
                            </Text>
                        </TouchableOpacity>
                    )}
                </ScrollView>
            </View>
        );
    }

    // ── Job list within tier ─────────────────────────────────────────────────
    if (selectedTier && tier) {
        return (
            <View style={{ flex: 1, backgroundColor: C.bg }}>
                <View style={{ backgroundColor: C.panel, paddingTop: 14, paddingBottom: 12, paddingHorizontal: PAD, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <TouchableOpacity onPress={() => setSelectedTier(null)} style={{ width: 32, height: 32, borderWidth: 1, borderColor: C.border, alignItems: 'center', justifyContent: 'center' }}>
                        <FontAwesome5 name="chevron-left" size={13} color={C.dim} />
                    </TouchableOpacity>
                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 20, color: tier.accent, letterSpacing: 2, flex: 1 }}>{tier.label}</Text>
                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: C.dark }}>{jobs.length} jobs</Text>
                </View>

                <ScrollView contentContainerStyle={{ padding: PAD, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
                    <ItemGrid>
                        {jobs.map(job => {
                            const req = checkJobRequirements(job);
                            return (
                                <JobCard
                                    key={job.id}
                                    job={job}
                                    tier={tier}
                                    isCurrent={currentJob?.id === job.id}
                                    isOffer={pendingJobOffer?.id === job.id}
                                    isLocked={!req.allowed}
                                    isPending={pendingApplications.some(a => a.id === job.id)}
                                    onPress={() => setSelectedJob(job)}
                                />
                            );
                        })}
                    </ItemGrid>
                </ScrollView>
            </View>
        );
    }

    // ── Tier selection home ──────────────────────────────────────────────────
    return (
        <View style={{ flex: 1, backgroundColor: C.bg }}>
            <View style={{ backgroundColor: C.panel, paddingTop: 14, paddingBottom: 12, paddingHorizontal: PAD, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View>
                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: C.dark, letterSpacing: 4 }}>CAREER PORTAL</Text>
                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 26, color: C.cream, lineHeight: 28 }}>Find Your Path</Text>
                </View>
                <TouchableOpacity onPress={onClose} style={{ width: 34, height: 34, borderWidth: 1, borderColor: C.border, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 20, color: C.dim }}>✕</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ padding: PAD, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
                {currentJob && (
                    <View style={{ marginBottom: 20, borderWidth: 1, borderColor: C.borderLt, backgroundColor: C.panel, overflow: 'hidden' }}>
                        <View style={{ height: 80, backgroundColor: C.card }}>
                            <Image source={currentJob.office_image || currentJob.image} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                            <View style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(6,8,15,0.5)' }} />
                            <View style={{ position: 'absolute', top: 8, left: 10 }}>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: C.dark, letterSpacing: 3 }}>CURRENT JOB</Text>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 22, color: C.cream, lineHeight: 24 }}>{currentJob.name}</Text>
                            </View>
                            <View style={{ position: 'absolute', bottom: 8, right: 10 }}>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 20, color: C.sage }}>₹{currentJob.salary.toLocaleString()}/mo</Text>
                            </View>
                        </View>
                        <View style={{ height: 3, backgroundColor: C.card }}>
                            <View style={{ height: '100%', width: `${Math.min(currentJob.salary / MAX_SALARY, 1) * 100}%`, backgroundColor: C.blue }} />
                        </View>
                        {pendingJobOffer && (
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, padding: 10, borderTopWidth: 1, borderColor: C.border }}>
                                <FontAwesome5 name="envelope" size={11} color="#22c55e" />
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: '#22c55e', letterSpacing: 1, flex: 1 }}>NEW OFFER — {pendingJobOffer.name} @ ₹{pendingJobOffer.salary.toLocaleString()}/mo</Text>
                            </View>
                        )}
                    </View>
                )}

                {pendingApplications.length > 0 && (
                    <View style={{ marginBottom: 20, borderWidth: 1, borderColor: '#ca8a04', backgroundColor: '#422006', padding: 10 }}>
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: '#facc15', letterSpacing: 2, marginBottom: 6 }}>PENDING APPLICATIONS</Text>
                        <View style={{ gap: 4 }}>
                            {pendingApplications.map((app, i) => (
                                <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)', padding: 8 }}>
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: '#fef08a' }}>{app.name}</Text>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: '#ca8a04' }}>IN REVIEW</Text>
                                        <FontAwesome5 name="clock" size={10} color="#ca8a04" />
                                    </View>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: C.dark, letterSpacing: 3, marginBottom: 10 }}>SELECT TIER</Text>
                <ItemGrid>
                    {TIERS.map(t => {
                        const count = tierJobs(t.key).length;
                        const unlocked = tierJobs(t.key).filter(j => checkJobRequirements(j).allowed).length;
                        return (
                            <TierCard
                                key={t.key}
                                tier={t}
                                unlocked={unlocked}
                                count={count}
                                onPress={() => setSelectedTier(t.key)}
                            />
                        );
                    })}
                </ItemGrid>
            </ScrollView>
        </View>
    );
}
