import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView } from 'react-native';
import { useGame } from '../context/GameContext';
import { JOBS } from '../data/jobs';
import { BUSINESS_TYPES, MAX_CONCURRENT_BUSINESSES, MAX_WORKERS_PER_BUSINESS, generateStaffCandidates } from '../data/businesses';
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
    { key: 'Tier 4', label: 'BIG BUSINESS',    color: '#a78bfa', accent: '#c4b5fd', icon: 'crown',     image: require('../../assets/jobs/construction_site.png') },
];

// TODO: swap for assets/jobs/side_hustles_tier.png once that dedicated art lands
const SIDE_HUSTLES_TIER = { key: 'business', label: 'SIDE HUSTLES', color: '#4ade80', accent: '#86efac', icon: 'store', image: require('../../assets/jobs/sweet_shop.png') };

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

function TierCard({ tier, unlocked, count, onPress, suffixLabel = 'unlocked' }) {
    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.8}
            style={{ height: 160, overflow: 'hidden', position: 'relative', borderRadius: 10, marginBottom: 12 }}
        >
            <Image source={tier.image} style={{ width: '100%', height: '100%', position: 'absolute' }} resizeMode="cover" />
            <View style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(4,6,14,0.38)' }} />
            {/* Bottom info strip */}
            <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(4,6,14,0.82)', paddingVertical: 10, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 20, color: '#c8d4f0', letterSpacing: 1 }}>{tier.label}</Text>
                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 15, color: tier.accent }}>{unlocked}/{count} {suffixLabel}</Text>
            </View>
        </TouchableOpacity>
    );
}

function JobCard({ job, tier, isCurrent, isOffer, isLocked, isPending, onPress }) {
    const salaryPct = Math.min(job.salary / MAX_SALARY, 1);
    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.8}
            style={{ flex: 1, height: JOB_H + 58, overflow: 'hidden', position: 'relative', borderRadius: 10, opacity: isLocked ? 0.5 : 1 }}
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
                    <View style={{ position: 'absolute', top: 8, left: 8, backgroundColor: 'rgba(5,13,30,0.85)', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 }}>
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: '#60a5fa', letterSpacing: 1 }}>CURRENT</Text>
                    </View>
                )}
                {isOffer && (
                    <View style={{ position: 'absolute', top: 8, left: 8, backgroundColor: 'rgba(13,30,18,0.85)', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 }}>
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: '#4ade80', letterSpacing: 1 }}>OFFER</Text>
                    </View>
                )}
                {isPending && !isCurrent && (
                    <View style={{ position: 'absolute', top: 8, left: 8, backgroundColor: 'rgba(66,32,6,0.85)', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 }}>
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: '#facc15', letterSpacing: 1 }}>PENDING</Text>
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

function StarRating({ n }) {
    return (
        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: '#fbbf24' }}>
            {'★'.repeat(n)}{'☆'.repeat(5 - n)}
        </Text>
    );
}

// Placeholder until generic_worker.png / generic_manager.png sprites land
function StaffAvatar({ role }) {
    return (
        <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: role === 'manager' ? '#2a1a4a' : '#0f2a1a', alignItems: 'center', justifyContent: 'center' }}>
            <FontAwesome5 name={role === 'manager' ? 'user-tie' : 'user'} size={16} color={role === 'manager' ? '#c4b5fd' : '#4ade80'} />
        </View>
    );
}

function BusinessHub({ onBack, onShowDialog }) {
    const {
        ownedBusinesses, getBusinessEligibility, startBusiness, closeBusiness,
        hireManager, fireManager, hireWorker, fireWorker,
    } = useGame();
    const [applyingId, setApplyingId] = useState(null);
    const [managingId, setManagingId] = useState(null);
    const [hiringRole, setHiringRole] = useState(null);
    const [candidates, setCandidates] = useState([]);

    const managingBiz = managingId ? ownedBusinesses.find(b => b.id === managingId) : null;
    const managingType = managingBiz ? BUSINESS_TYPES.find(b => b.id === managingBiz.businessId) : null;

    const openHiring = (role) => {
        if (!managingType) return;
        setCandidates(generateStaffCandidates(managingType, role, 3));
        setHiringRole(role);
    };

    // ── Hiring panel ──
    if (hiringRole && managingBiz && managingType) {
        return (
            <View style={{ flex: 1, backgroundColor: C.bg }}>
                <View style={{ backgroundColor: C.panel, paddingTop: 14, paddingBottom: 12, paddingHorizontal: PAD, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <TouchableOpacity onPress={() => setHiringRole(null)} style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: '#0d1020', alignItems: 'center', justifyContent: 'center' }}>
                        <FontAwesome5 name="chevron-left" size={13} color={C.dim} />
                    </TouchableOpacity>
                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 20, color: C.cream, letterSpacing: 2, flex: 1 }}>HIRE {hiringRole === 'manager' ? 'MANAGER' : 'WORKER'}</Text>
                </View>
                <ScrollView contentContainerStyle={{ padding: PAD, paddingBottom: 40, gap: 10 }}>
                    <TouchableOpacity onPress={() => setCandidates(generateStaffCandidates(managingType, hiringRole, 3))} style={{ alignSelf: 'flex-end', marginBottom: 4 }}>
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: C.blue, letterSpacing: 1 }}>↻ NEW CANDIDATES</Text>
                    </TouchableOpacity>
                    {candidates.map(cand => (
                        <View key={cand.id} style={{ borderRadius: 10, backgroundColor: C.panel, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                            <StaffAvatar role={hiringRole} />
                            <View style={{ flex: 1 }}>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 18, color: C.cream }}>{cand.name}</Text>
                                <StarRating n={cand.skill} />
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: C.dim }}>₹{cand.wage.toLocaleString()}/mo</Text>
                            </View>
                            <TouchableOpacity
                                onPress={() => {
                                    const res = hiringRole === 'manager' ? hireManager(managingBiz.id, cand) : hireWorker(managingBiz.id, cand);
                                    onShowDialog(res.success ? 'Hired!' : 'Could Not Hire', res.msg, res.success ? 'success' : 'error');
                                    if (res.success) setHiringRole(null);
                                }}
                                style={{ backgroundColor: '#0d2c18', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 10 }}
                            >
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: '#4ade80', letterSpacing: 1 }}>HIRE</Text>
                            </TouchableOpacity>
                        </View>
                    ))}
                </ScrollView>
            </View>
        );
    }

    // ── Manage (visit) view ──
    if (managingBiz && managingType) {
        const workers = managingBiz.workers || [];
        return (
            <View style={{ flex: 1, backgroundColor: C.bg }}>
                <View style={{ backgroundColor: C.panel, paddingTop: 14, paddingBottom: 12, paddingHorizontal: PAD, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <TouchableOpacity onPress={() => setManagingId(null)} style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: '#0d1020', alignItems: 'center', justifyContent: 'center' }}>
                        <FontAwesome5 name="chevron-left" size={13} color={C.dim} />
                    </TouchableOpacity>
                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 20, color: C.cream, letterSpacing: 2, flex: 1 }}>{managingType.name}</Text>
                </View>
                <ScrollView contentContainerStyle={{ padding: PAD, paddingBottom: 40, gap: 12 }}>
                    <View style={{ height: 150, borderRadius: 10, overflow: 'hidden', position: 'relative' }}>
                        <Image source={managingType.image} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                        <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(4,6,14,0.75)', paddingVertical: 6, alignItems: 'center' }}>
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 12, color: '#8fa0c8', letterSpacing: 2 }}>VISITING {managingType.name.toUpperCase()}</Text>
                        </View>
                    </View>

                    <View style={{ borderRadius: 10, backgroundColor: C.panel, padding: 14, flexDirection: 'row', justifyContent: 'space-between' }}>
                        <View>
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: C.dark, letterSpacing: 2 }}>MONTHS OWNED</Text>
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 20, color: C.cream }}>{managingBiz.monthsOwned}</Text>
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: C.dark, letterSpacing: 2 }}>NET PROFIT</Text>
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 20, color: managingBiz.totalProfit >= 0 ? C.sage : '#f87171' }}>₹{managingBiz.totalProfit.toLocaleString()}</Text>
                        </View>
                    </View>

                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: C.dark, letterSpacing: 3 }}>MANAGER</Text>
                    {managingBiz.manager ? (
                        <View style={{ borderRadius: 10, backgroundColor: C.panel, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                            <StaffAvatar role="manager" />
                            <View style={{ flex: 1 }}>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 17, color: C.cream }}>{managingBiz.manager.name}</Text>
                                <StarRating n={managingBiz.manager.skill} />
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: C.dim }}>₹{managingBiz.manager.wage.toLocaleString()}/mo</Text>
                            </View>
                            <TouchableOpacity
                                onPress={() => {
                                    const res = fireManager(managingBiz.id);
                                    onShowDialog(res.success ? 'Fired' : 'Failed', res.msg, res.success ? 'info' : 'error');
                                }}
                                style={{ backgroundColor: '#1a0808', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 9 }}
                            >
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: '#f87171' }}>FIRE</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View style={{ borderRadius: 10, backgroundColor: '#1a1000', padding: 14, gap: 8 }}>
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 15, color: '#fbbf24' }}>No manager — you're running this solo on top of your job.</Text>
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: '#ca8a04' }}>Lower revenue, higher failure risk, and it's draining your happiness & health each month.</Text>
                            <TouchableOpacity onPress={() => openHiring('manager')} style={{ backgroundColor: '#0d2c18', borderRadius: 8, paddingVertical: 10, alignItems: 'center', marginTop: 4 }}>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 15, color: '#4ade80', letterSpacing: 1 }}>HIRE A MANAGER</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: C.dark, letterSpacing: 3 }}>WORKERS ({workers.length}/{MAX_WORKERS_PER_BUSINESS})</Text>
                    {workers.map(w => (
                        <View key={w.id} style={{ borderRadius: 10, backgroundColor: C.panel, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                            <StaffAvatar role="worker" />
                            <View style={{ flex: 1 }}>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 17, color: C.cream }}>{w.name}</Text>
                                <StarRating n={w.skill} />
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: C.dim }}>₹{w.wage.toLocaleString()}/mo</Text>
                            </View>
                            <TouchableOpacity
                                onPress={() => fireWorker(managingBiz.id, w.id)}
                                style={{ backgroundColor: '#1a0808', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 9 }}
                            >
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: '#f87171' }}>FIRE</Text>
                            </TouchableOpacity>
                        </View>
                    ))}
                    {workers.length < MAX_WORKERS_PER_BUSINESS && (
                        <TouchableOpacity onPress={() => openHiring('worker')} style={{ borderRadius: 10, backgroundColor: C.panel, borderWidth: 1, borderColor: C.borderLt, borderStyle: 'dashed', padding: 14, alignItems: 'center' }}>
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 15, color: C.dim, letterSpacing: 1 }}>+ HIRE WORKER</Text>
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity
                        onPress={() => {
                            const res = closeBusiness(managingBiz.id);
                            onShowDialog(res.success ? 'Business Sold' : 'Failed', res.msg, res.success ? 'success' : 'error');
                            if (res.success) setManagingId(null);
                        }}
                        style={{ paddingVertical: 14, borderRadius: 10, backgroundColor: '#1a0808', alignItems: 'center', marginTop: 8 }}
                    >
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 15, color: '#f87171', letterSpacing: 1 }}>SELL BUSINESS (SALVAGE ₹{Math.round(managingType.cost * managingType.salvage_pct).toLocaleString()})</Text>
                    </TouchableOpacity>
                </ScrollView>
            </View>
        );
    }

    // ── Apply/detail view ──
    if (applyingId) {
        const biz = BUSINESS_TYPES.find(b => b.id === applyingId);
        const issues = getBusinessEligibility(biz);
        const eligible = issues.length === 0;
        return (
            <View style={{ flex: 1, backgroundColor: C.bg }}>
                <View style={{ backgroundColor: C.panel, paddingTop: 14, paddingBottom: 12, paddingHorizontal: PAD, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <TouchableOpacity onPress={() => setApplyingId(null)} style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: '#0d1020', alignItems: 'center', justifyContent: 'center' }}>
                        <FontAwesome5 name="chevron-left" size={13} color={C.dim} />
                    </TouchableOpacity>
                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 20, color: C.cream, letterSpacing: 2, flex: 1 }}>{biz.name}</Text>
                </View>
                <ScrollView contentContainerStyle={{ padding: PAD, paddingBottom: 40, gap: 10 }}>
                    <View style={{ height: 160, borderRadius: 10, overflow: 'hidden' }}>
                        <Image source={biz.image} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                    </View>
                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 15, color: C.dim, lineHeight: 19 }}>{biz.description}</Text>
                    <View style={{ borderRadius: 10, backgroundColor: C.panel, padding: 14, gap: 8 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: C.dim }}>Upfront cost</Text>
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: '#f87171' }}>₹{biz.cost.toLocaleString()}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: C.dim }}>Monthly revenue (est., solo)</Text>
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: C.sage }}>₹{biz.revenue_range[0].toLocaleString()}–₹{biz.revenue_range[1].toLocaleString()}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: C.dim }}>Running cost</Text>
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: '#fb923c' }}>₹{biz.running_cost.toLocaleString()}/mo</Text>
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: C.dim }}>Monthly failure risk (solo)</Text>
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: '#f87171' }}>{(biz.failure_chance * 100).toFixed(1)}%</Text>
                        </View>
                    </View>
                    <View style={{ borderRadius: 10, backgroundColor: '#818cf810', padding: 12 }}>
                        <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: '#818cf8', lineHeight: 18 }}>Owning this is on top of your job — running it solo costs happiness and health each month. Hire a manager after starting to remove that strain.</Text>
                    </View>

                    {!eligible ? (
                        <View style={{ backgroundColor: '#1a0808', borderRadius: 10, padding: 14 }}>
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 16, color: '#f87171', marginBottom: 8 }}>You don't qualify yet:</Text>
                            {issues.map((iss, i) => (
                                <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4 }}>
                                    <FontAwesome5 name="lock" size={13} color="#f87171" />
                                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 15, color: '#f8717190', flex: 1 }}>{iss}</Text>
                                </View>
                            ))}
                        </View>
                    ) : (
                        <TouchableOpacity
                            onPress={() => {
                                let res;
                                try { res = startBusiness(biz.id); }
                                catch (e) { res = { success: false, msg: 'Something went wrong. Please try again.' }; }
                                onShowDialog(res.success ? 'Business Started!' : 'Could Not Start', res.msg || (res.success ? 'Business started.' : 'Failed to start business.'), res.success ? 'success' : 'error');
                                if (res.success) setApplyingId(null);
                            }}
                            style={{ paddingVertical: 16, borderRadius: 10, backgroundColor: '#4ade8022', alignItems: 'center' }}
                        >
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 20, color: '#4ade80', letterSpacing: 1 }}>START BUSINESS — ₹{biz.cost.toLocaleString()}</Text>
                        </TouchableOpacity>
                    )}
                </ScrollView>
            </View>
        );
    }

    // ── List view: owned + available ──
    return (
        <View style={{ flex: 1, backgroundColor: C.bg }}>
            <View style={{ backgroundColor: C.panel, paddingTop: 14, paddingBottom: 12, paddingHorizontal: PAD, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <TouchableOpacity onPress={onBack} style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: '#0d1020', alignItems: 'center', justifyContent: 'center' }}>
                    <FontAwesome5 name="chevron-left" size={13} color={C.dim} />
                </TouchableOpacity>
                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 20, color: '#86efac', letterSpacing: 2, flex: 1 }}>SIDE HUSTLES</Text>
                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: C.dark }}>{ownedBusinesses.length}/{MAX_CONCURRENT_BUSINESSES} owned</Text>
            </View>
            <ScrollView contentContainerStyle={{ padding: PAD, paddingBottom: 40, gap: 8 }}>
                {ownedBusinesses.length > 0 && ownedBusinesses.map(owned => {
                    const biz = BUSINESS_TYPES.find(b => b.id === owned.businessId);
                    if (!biz) return null;
                    const staffed = !!owned.manager;
                    return (
                        <TouchableOpacity key={owned.id} onPress={() => setManagingId(owned.id)} activeOpacity={0.85}
                            style={{ borderRadius: 10, backgroundColor: C.panel, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                            <View style={{ width: 36, height: 36, borderRadius: 8, overflow: 'hidden', backgroundColor: C.card }}>
                                <Image source={biz.image} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 17, color: C.cream }}>{biz.name}</Text>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 12, color: staffed ? C.sage : '#f87171' }}>{staffed ? 'Staffed' : 'Running solo'}</Text>
                            </View>
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 17, color: owned.totalProfit >= 0 ? C.sage : '#f87171' }}>₹{owned.totalProfit.toLocaleString()}</Text>
                        </TouchableOpacity>
                    );
                })}

                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: C.dark, letterSpacing: 3, marginTop: 6 }}>AVAILABLE TO START</Text>
                {BUSINESS_TYPES.map(biz => {
                    const issues = getBusinessEligibility(biz);
                    const eligible = issues.length === 0;
                    const alreadyOwned = ownedBusinesses.some(b => b.businessId === biz.id);
                    return (
                        <TouchableOpacity key={biz.id} onPress={() => setApplyingId(biz.id)} activeOpacity={0.85}
                            style={{ borderRadius: 10, backgroundColor: C.panel, padding: 14, opacity: eligible || alreadyOwned ? 1 : 0.5, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                            <View style={{ width: 36, height: 36, borderRadius: 8, overflow: 'hidden', backgroundColor: C.card }}>
                                <Image source={biz.image} style={{ width: '100%', height: '100%', opacity: eligible ? 1 : 0.5 }} resizeMode="cover" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 17, color: eligible ? C.cream : C.dim }}>{biz.name}</Text>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 13, color: C.dim }}>₹{(biz.cost / 1000).toFixed(0)}k · ₹{(biz.revenue_range[0] / 1000).toFixed(0)}k–₹{(biz.revenue_range[1] / 1000).toFixed(0)}k/mo</Text>
                            </View>
                            {alreadyOwned && <FontAwesome5 name="check-circle" size={16} color="#4ade80" />}
                            {!eligible && !alreadyOwned && <FontAwesome5 name="lock" size={14} color={C.dim} />}
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
}

export default function CareersScreen({ onClose, onApply, onAcceptOffer, onShowDialog }) {
    const { currentJob, checkJobRequirements, netWorth, pendingJobOffer, degrees, pendingApplications = [], ownedBusinesses } = useGame();
    const [selectedTier, setSelectedTier] = useState(null);
    const [selectedJob, setSelectedJob] = useState(null);

    const tierJobs = (tierKey) => JOBS.filter(j => j.type.startsWith(tierKey));
    const tier = selectedTier ? TIERS.find(t => t.key === selectedTier) : null;
    const jobs = selectedTier ? tierJobs(selectedTier) : [];

    // ── Side Hustles — a separate flow: owning one doesn't replace currentJob ──
    if (selectedTier === 'business') {
        return <BusinessHub onBack={() => setSelectedTier(null)} onShowDialog={onShowDialog} />;
    }

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
                        style={{ position: 'absolute', top: 14, left: 14, width: 34, height: 34, backgroundColor: 'rgba(6,8,15,0.8)', borderRadius: 8, alignItems: 'center', justifyContent: 'center' }}
                    >
                        <FontAwesome5 name="chevron-left" size={14} color={C.dim} />
                    </TouchableOpacity>
                    <View style={{ position: 'absolute', bottom: 12, left: 14, backgroundColor: tierInfo.color + '22', borderWidth: 1, borderRadius: 10, borderColor: tierInfo.color + '60', paddingHorizontal: 10, paddingVertical: 3 }}>
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

                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 12, color: C.dark, letterSpacing: 3, marginBottom: 10 }}>REQUIREMENTS</Text>
                    <View style={{ marginBottom: 24 }}>
                        {[
                            { label: `Net Worth ≥ ₹${selectedJob.req_net_worth.toLocaleString()}`, met: netWorth >= selectedJob.req_net_worth },
                            ...(selectedJob.req_degrees.length === 0
                                ? [{ label: 'No degree required', met: true }]
                                : selectedJob.req_degrees.map(deg => ({ label: deg, met: degrees.includes(deg) }))
                            ),
                        ].map((r, i) => (
                            <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderTopWidth: i === 0 ? 0 : 1, borderColor: '#0f1525' }}>
                                <Image source={r.met ? require('../../assets/ui_comp/nextbutton.png') : require('../../assets/ui_comp/lock.png')} style={{ width: 18, height: 18, tintColor: r.met ? '#4ade80' : '#f87171', opacity: 0.9 }} resizeMode="contain" />
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 17, color: r.met ? '#c8d4f0' : '#445070', flex: 1 }}>{r.label}</Text>
                            </View>
                        ))}
                    </View>

                    {isCurrent ? (
                        <View style={{ padding: 16, borderRadius: 10, backgroundColor: '#0d1020', alignItems: 'center' }}>
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 18, color: C.dim, letterSpacing: 2 }}>CURRENT JOB</Text>
                        </View>
                    ) : isLocked ? (
                        <View style={{ padding: 16, borderRadius: 10, backgroundColor: '#0d1020', flexDirection: 'row', alignItems: 'center', gap: 10, justifyContent: 'center' }}>
                            <Image source={require('../../assets/ui_comp/lock.png')} style={{ width: 16, height: 16, tintColor: '#f87171' }} resizeMode="contain" />
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 17, color: '#f87171' }}>{req.reason}</Text>
                        </View>
                    ) : pendingApplications.some(a => a.id === selectedJob.id) ? (
                        <View style={{ padding: 16, borderRadius: 10, backgroundColor: '#1a1000', alignItems: 'center' }}>
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 20, color: '#fbbf24', letterSpacing: 2 }}>APPLICATION PENDING</Text>
                        </View>
                    ) : (
                        <TouchableOpacity
                            onPress={() => { if (isOffer && onAcceptOffer) onAcceptOffer(selectedJob); else onApply(selectedJob); setSelectedJob(null); }}
                            style={{ padding: 16, borderRadius: 10, backgroundColor: '#0d1e12', alignItems: 'center' }}
                        >
                            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 20, color: '#4ade80', letterSpacing: 2 }}>
                                {isOffer ? 'ACCEPT OFFER ›' : 'APPLY NOW ›'}
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
                    <TouchableOpacity onPress={() => setSelectedTier(null)} style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: '#0d1020', alignItems: 'center', justifyContent: 'center' }}>
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
                <TouchableOpacity onPress={onClose} style={{ width: 34, height: 34, borderRadius: 8, backgroundColor: '#0d1020', alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 20, color: C.dim }}>✕</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ padding: PAD, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
                {currentJob && (
                    <View style={{ marginBottom: 20, borderWidth: 1, borderColor: C.borderLt, backgroundColor: C.panel, overflow: 'hidden', borderRadius: 12 }}>
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
                            <TouchableOpacity onPress={() => setSelectedJob(pendingJobOffer)} activeOpacity={0.8} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderTopWidth: 1, borderColor: C.border, backgroundColor: '#0d1e12' }}>
                                <FontAwesome5 name="envelope" size={12} color="#22c55e" />
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 15, color: '#22c55e', letterSpacing: 1, flex: 1 }}>NEW OFFER — {pendingJobOffer.name} @ ₹{pendingJobOffer.salary.toLocaleString()}/mo</Text>
                                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 15, color: '#4ade80' }}>VIEW ›</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}

                {pendingApplications.length > 0 && (
                    <View style={{ marginBottom: 20, borderWidth: 1, borderRadius: 10, borderColor: '#ca8a04', backgroundColor: '#422006', padding: 10 }}>
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

                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 11, color: C.dark, letterSpacing: 3, marginBottom: 12 }}>SELECT TIER</Text>
                <View>
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
                    <TierCard
                        tier={SIDE_HUSTLES_TIER}
                        unlocked={ownedBusinesses.length}
                        count={MAX_CONCURRENT_BUSINESSES}
                        onPress={() => setSelectedTier('business')}
                        suffixLabel="owned"
                    />
                </View>
            </ScrollView>
        </View>
    );
}
