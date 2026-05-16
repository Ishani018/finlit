import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Dimensions, Image, Platform } from 'react-native';
import { MaterialIcons, FontAwesome5, Ionicons } from '@expo/vector-icons';
import { styled } from 'nativewind';
import { LineChart } from 'react-native-chart-kit';
import { useGame } from '../context/GameContext';
import Constants from 'expo-constants';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledImage = styled(Image);

// Handle LAN IP so physical devices don't try to fetch their own localhost
const getApiBase = () => {
    // Web ALWAYS runs on the machine itself (localhost) in development
    if (Platform.OS === 'web') {
        return 'http://localhost:8000/api';
    }

    const hostUri = Constants.expoConfig?.hostUri || Constants.manifest2?.extra?.expoGo?.hostUri;

    if (hostUri) {
        const ipAddress = hostUri.split(':')[0];
        return `http://${ipAddress}:8000/api`;
    }

    // Android emulator alias for localhost is 10.0.2.2
    if (Platform.OS === 'android') {
        return 'http://10.0.2.2:8000/api';
    }

    // In case no Expo URI is defined on a physical device over LAN (use the current LAN IP)
    // '192.168.1.18' -> Windows Adapter LAN IP
    return 'http://192.168.1.18:8000/api';
};

const API_BASE = getApiBase();
const POLL_INTERVAL_MS = 3000;

export default function TradingScreen({ onClose }) {
    const { balance } = useGame();

    const [activeTab, setActiveTab] = useState('Watchlist'); // Watchlist, Portfolio, Orders, News, Advisor

    // Market Data State
    const [quotes, setQuotes] = useState([]);
    const [selectedStock, setSelectedStock] = useState(null);
    const [stockHistory, setStockHistory] = useState(null);
    const [isTrading, setIsTrading] = useState(false);
    const [portfolioData, setPortfolioData] = useState(null);
    const [ordersData, setOrdersData] = useState([]);
    const [newsData, setNewsData] = useState([]);
    const [advisorData, setAdvisorData] = useState(null);
    const [isCaSubscribed, setIsCaSubscribed] = useState(false);

    // Fake User ID for demo
    const USER_ID = 1;

    // Poll for Market Quotes
    useEffect(() => {
        fetchQuotes(); // Initial fetch
        if (activeTab === 'Portfolio') fetchPortfolio();
        if (activeTab === 'Orders') fetchOrders();
        if (activeTab === 'News') fetchNews();
        if (activeTab === 'Advisor') fetchAdvisor();

        // Set up polling string
        const interval = setInterval(() => {
            fetchQuotes();
            if (activeTab === 'Portfolio') fetchPortfolio();
            if (activeTab === 'Orders') fetchOrders();
            if (activeTab === 'News') fetchNews();
        }, POLL_INTERVAL_MS);

        return () => clearInterval(interval);
    }, [activeTab]);

    const fetchQuotes = async () => {
        try {
            const res = await fetch(`${API_BASE}/market/quotes`);
            const json = await res.json();
            setQuotes(json.data || []);

            // Update selected stock price live if viewing a modal
            if (selectedStock) {
                const updated = (json.data || []).find(q => q.symbol === selectedStock.symbol);
                if (updated) setSelectedStock(updated);
            }
        } catch (e) {
            console.warn("Could not fetch quotes: ", e);
        }
    };

    const fetchHistory = async (symbol) => {
        try {
            const res = await fetch(`${API_BASE}/market/history/${symbol}`);
            const json = await res.json();

            if (!json.data || json.data.length < 2) {
                // chart-kit crashes if there is < 2 points
                const defaultPrice = json.data && json.data.length === 1 ? json.data[0].close : 100;
                setStockHistory({
                    labels: ["Start", "Current"],
                    datasets: [{ data: [defaultPrice, defaultPrice] }]
                });
                return;
            }

            // Map to chart-kit compatible format
            const prices = json.data.map(cdl => cdl.close);
            const labels = json.data.map((_, i) => i % 10 === 0 ? String(i) : ''); // Every 10th label

            setStockHistory({
                labels: labels.slice(-20), // Last 20 points for clean UI
                datasets: [{ data: prices.slice(-20) }]
            });
        } catch (e) {
            console.warn("Failed to fetch history");
        }
    };

    const handleTrade = async (action) => {
        if (!selectedStock || isTrading) return;

        setIsTrading(true);
        try {
            const res = await fetch(`${API_BASE}/trade/${action}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: USER_ID,
                    symbol: selectedStock.symbol,
                    quantity: 1 // Default to 1 for now
                })
            });

            const json = await res.json();
            if (res.ok) {
                alert(`Successfully ${action === 'buy' ? 'bought' : 'sold'} 1 share of ${selectedStock.symbol.replace(".NS", "")}`);
                fetchPortfolio(); // Refresh backend portfolio if we trade
            } else {
                alert(`Trade Failed: ${json.detail || 'Unknown error'}`);
            }
        } catch (e) {
            alert('Error connecting to the market engine.');
        }
        setIsTrading(false);
    };

    const fetchPortfolio = async () => {
        try {
            const res = await fetch(`${API_BASE}/trade/portfolio/${USER_ID}`);
            const json = await res.json();
            setPortfolioData(json);
        } catch (e) {
            console.warn("Could not fetch portfolio");
        }
    };

    const fetchOrders = async () => {
        try {
            const res = await fetch(`${API_BASE}/trade/orders/${USER_ID}`);
            const json = await res.json();
            setOrdersData(json.data || []);
        } catch (e) {
            console.warn("Could not fetch orders");
        }
    };

    const fetchNews = async () => {
        try {
            const res = await fetch(`${API_BASE}/news/feed`);
            const json = await res.json();
            setNewsData(json.data || []);
        } catch (e) {
            console.warn("Could not fetch news");
        }
    };

    const fetchAdvisor = async () => {
        try {
            const res = await fetch(`${API_BASE}/advisor/recommendations/${USER_ID}`);
            if (res.status === 403) {
                setIsCaSubscribed(false);
                return;
            }
            const json = await res.json();
            setIsCaSubscribed(true);
            setAdvisorData(json.data || []);
        } catch (e) {
            console.warn("Could not fetch advisor data");
        }
    };

    const handleSubscribeCA = async () => {
        try {
            const res = await fetch(`${API_BASE}/advisor/subscribe`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: USER_ID })
            });
            const json = await res.json();
            if (res.ok) {
                alert("Successfully hired CA Advisor!");
                setIsCaSubscribed(true);
                fetchAdvisor();
            } else {
                alert(json.detail || "Failed to subscribe");
            }
        } catch (e) {
            alert('Error connecting to backend.');
        }
    };

    const handleSelectStock = (stock) => {
        setSelectedStock(stock);
        setStockHistory(null);
        fetchHistory(stock.symbol);
    };

    const renderTabHeader = () => (
        <StyledView className="flex-row border-b border-gray-800 mb-4 px-2">
            {['Watchlist', 'Portfolio', 'Orders', 'News', 'Advisor'].map(tab => (
                <StyledTouchableOpacity
                    key={tab}
                    onPress={() => setActiveTab(tab)}
                    style={{ borderRadius: 10 }}
                    className={`pb-3 mr-6 ${activeTab === tab ? 'border-b-2 border-yellow-500' : ''}`}
                >
                    <StyledText className={`font-bold ${activeTab === tab ? 'text-yellow-400' : 'text-gray-500'}`}>
                        {tab}
                    </StyledText>
                </StyledTouchableOpacity>
            ))}
        </StyledView>
    );

    const renderWatchlist = () => (
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            {quotes.map(stock => {
                const isUp = stock.change >= 0;
                return (
                    <StyledTouchableOpacity
                        key={stock.symbol}
                        onPress={() => handleSelectStock(stock)}
                        className="flex-row justify-between items-center py-4 border-b border-gray-800"
                    >
                        <StyledView className="flex-row items-center gap-3">
                            {/* Fake Logo Placeholder */}
                            <StyledView className="w-10 h-10 rounded-lg bg-gray-800 items-center justify-center border border-gray-700">
                                <StyledText className="text-white font-bold text-xs">{stock.symbol.substring(0, 2)}</StyledText>
                            </StyledView>
                            <StyledView>
                                <StyledText className="text-white font-bold text-base">{stock.symbol.replace(".NS", "")}</StyledText>
                                <StyledText className="text-gray-400 text-xs">{stock.name}</StyledText>
                            </StyledView>
                        </StyledView>

                        <StyledView className="items-end">
                            <StyledText className={`font-bold text-lg ${isUp ? 'text-green-400' : 'text-red-400'}`}>
                                ₹{stock.price.toFixed(2)}
                            </StyledText>
                            <StyledText className={`font-bold text-xs ${isUp ? 'text-green-400' : 'text-red-400'}`}>
                                {isUp ? '+' : ''}{stock.change.toFixed(2)} ({stock.change_percent.toFixed(2)}%)
                            </StyledText>
                        </StyledView>
                    </StyledTouchableOpacity>
                );
            })}
        </ScrollView>
    );

    const renderPortfolio = () => {
        if (!portfolioData) return <StyledText className="text-white text-center mt-10">Loading portfolio...</StyledText>;

        // Handle error responses from backend
        if (portfolioData.detail) return <StyledText className="text-white text-center mt-10">Error: {portfolioData.detail}</StyledText>;

        // Safely access fields with fallbacks
        const totalPnl = portfolioData.total_pnl || 0;
        const currentValue = portfolioData.current_value || 0;
        const totalInvested = portfolioData.total_invested || 0;
        const holdings = portfolioData.holdings || [];

        const isUp = totalPnl >= 0;

        return (
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                <StyledView className="bg-gray-900 border border-gray-800 p-6 mb-6" style={{ borderRadius: 14 }}>
                    <StyledText className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mb-1">Total Portfolio Value</StyledText>
                    <StyledText className="text-white text-4xl font-bold mb-2">₹{currentValue.toLocaleString()}</StyledText>
                    <StyledView className="flex-row items-center justify-between mt-4 pb-4 border-b border-gray-800">
                        <StyledView>
                            <StyledText className="text-gray-500 text-xs">Invested</StyledText>
                            <StyledText className="text-white font-bold">₹{totalInvested.toLocaleString()}</StyledText>
                        </StyledView>
                        <StyledView className="items-end">
                            <StyledText className="text-gray-500 text-xs">Total Returns</StyledText>
                            <StyledText className={`font-bold ${isUp ? 'text-green-400' : 'text-red-400'}`}>
                                {isUp ? '+' : ''}₹{totalPnl.toLocaleString()}
                            </StyledText>
                        </StyledView>
                    </StyledView>
                </StyledView>

                <StyledText className="text-white font-bold text-lg mb-4">Your Holdings</StyledText>

                {holdings.length === 0 ? (
                    <StyledText className="text-gray-500 text-center mt-10">You don't own any stocks yet.</StyledText>
                ) : (
                    holdings.map((h, i) => (
                        <StyledView key={i} className="bg-gray-900 p-4 border border-gray-800 mb-3 flex-row justify-between items-center" style={{ borderRadius: 14 }}>
                            <StyledView>
                                <StyledText className="text-white font-bold text-base">{h.symbol.replace(".NS", "")}</StyledText>
                                <StyledText className="text-gray-400 text-xs">{h.quantity} Shares • Avg ₹{h.average_price.toFixed(2)}</StyledText>
                            </StyledView>
                            <StyledView className="items-end">
                                <StyledText className="text-white font-bold text-base">₹{(h.current_price * h.quantity).toLocaleString()}</StyledText>
                                <StyledText className={`font-bold text-xs ${h.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    {h.pnl >= 0 ? '+' : ''}{h.pnl.toFixed(2)} ({h.pnl_percent.toFixed(2)}%)
                                </StyledText>
                            </StyledView>
                        </StyledView>
                    ))
                )}
            </ScrollView>
        );
    };

    const renderOrders = () => {
        if (ordersData.length === 0) {
            return <StyledText className="text-gray-500 text-center mt-10">No orders executed yet.</StyledText>;
        }

        return (
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {ordersData.map((order, i) => (
                    <StyledView key={i} className="bg-gray-900 p-4 border border-gray-800 rounded-xl mb-3 flex-row justify-between items-center">
                        <StyledView>
                            <StyledView className="flex-row items-center gap-2 mb-1">
                                <StyledView className={`px-2 py-0.5 ${order.transaction_type === 'BUY' ? 'bg-yellow-500/20' : 'bg-red-500/20'}`} style={{ borderRadius: 8 }}>
                                    <StyledText className={`text-[10px] font-bold ${order.transaction_type === 'BUY' ? 'text-yellow-400' : 'text-red-400'}`}>
                                        {order.transaction_type}
                                    </StyledText>
                                </StyledView>
                                <StyledText className="text-white font-bold text-base">{order.symbol.replace(".NS", "")}</StyledText>
                            </StyledView>
                            <StyledText className="text-gray-500 text-[10px]">{order.timestamp}</StyledText>
                        </StyledView>
                        <StyledView className="items-end">
                            <StyledText className="text-white font-bold">₹{order.price.toFixed(2)}</StyledText>
                            <StyledText className="text-gray-400 text-xs">Qty: {order.quantity}</StyledText>
                        </StyledView>
                    </StyledView>
                ))}
            </ScrollView>
        );
    };

    const renderNews = () => {
        if (newsData.length === 0) return <StyledText className="text-gray-500 text-center mt-10">No recent market news.</StyledText>;

        return (
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {newsData.map((news, i) => {
                    const isPositive = news.trend >= 0;
                    return (
                        <StyledView key={i} className="bg-gray-900 p-4 border border-gray-800 mb-3" style={{ borderRadius: 14 }}>
                            <StyledView className="flex-row items-center gap-2 mb-2">
                                <StyledView className={`px-2 py-0.5 ${isPositive ? 'bg-green-500/20' : 'bg-red-500/20'}`} style={{ borderRadius: 8 }}>
                                    <StyledText className={`text-[10px] font-bold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                                        {news.sector}
                                    </StyledText>
                                </StyledView>
                                <StyledText className="text-gray-500 text-[10px]">{news.time}</StyledText>
                            </StyledView>
                            <StyledText className="text-white font-bold text-base leading-5 mb-2">{news.headline}</StyledText>
                            <StyledText className={`font-bold text-xs ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                                Market Impact: {isPositive ? '+' : ''}{(news.trend * 100).toFixed(1)}%
                            </StyledText>
                        </StyledView>
                    );
                })}
            </ScrollView>
        );
    };

    const renderAdvisor = () => {
        if (!isCaSubscribed) {
            return (
                <StyledView className="flex-1 items-center justify-center p-6">
                    <StyledImage
                        source={require('../../assets/CA_Office.png')}
                        style={{ width: 128, height: 128 }}
                        className="rounded-xl mb-6 border-4 border-yellow-500"
                        resizeMode="contain"
                    />
                    <StyledText className="text-white text-2xl font-bold mb-2">Hire a CA</StyledText>
                    <StyledText className="text-gray-400 text-center mb-8 leading-relaxed">
                        Get expert stock recommendations and avoid market traps by hiring a professional Chartered Accountant.
                    </StyledText>

                    <StyledView className="bg-gray-900 border border-gray-800 p-4 items-center w-full mb-6" style={{ borderRadius: 14 }}>
                        <StyledText className="text-gray-500 text-xs uppercase tracking-widest font-bold mb-1">Monthly Retainer</StyledText>
                        <StyledText className="text-yellow-500 text-3xl font-bold">₹5,000</StyledText>
                    </StyledView>

                    <StyledTouchableOpacity
                        onPress={handleSubscribeCA}
                        className="w-full py-4 items-center"
                        style={{ backgroundColor: '#d4942a', borderRadius: 12 }}
                    >
                        <StyledText className="text-white font-bold text-lg">Hire CA Advisor</StyledText>
                    </StyledTouchableOpacity>
                </StyledView>
            );
        }

        if (!advisorData || advisorData.length === 0) {
            return <StyledText className="text-gray-500 text-center mt-10">Your CA has no recommendations right now.</StyledText>;
        }

        return (
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                <StyledView className="p-4 mb-6 flex-row items-start gap-4" style={{ backgroundColor: '#3a2e1e', borderWidth: 1, borderColor: '#d4942a50', borderRadius: 14 }}>
                    <StyledImage
                        source={require('../../assets/CA_Office.png')}
                        style={{ width: 64, height: 64, borderRadius: 10, borderWidth: 1, borderColor: '#d4942a' }}
                        resizeMode="contain"
                    />
                    <StyledView className="flex-1">
                        <StyledText className="text-white font-bold text-lg mb-1">Your CA says:</StyledText>
                        <StyledText style={{ color: '#e8d5b0' }}>"The market is looking volatile. I've analyzed the recent trends and found some opportunities you should consider."</StyledText>
                    </StyledView>
                </StyledView>

                {advisorData.map((rec, i) => (
                    <StyledView key={i} className="bg-gray-900 p-4 border border-gray-800 mb-4" style={{ borderRadius: 14 }}>
                        <StyledView className="flex-row justify-between items-center mb-3">
                            <StyledView>
                                <StyledText className="text-white font-bold text-lg">{rec.symbol.replace(".NS", "")}</StyledText>
                                <StyledText className="text-gray-400 text-xs">{rec.name}</StyledText>
                            </StyledView>
                            <StyledView className="bg-green-500/20 px-3 py-1 border border-green-500/50" style={{ borderRadius: 8 }}>
                                <StyledText className="text-green-400 font-bold">{rec.advice}</StyledText>
                            </StyledView>
                        </StyledView>
                        <StyledText className="text-gray-300 italic">"{rec.reason}"</StyledText>
                    </StyledView>
                ))}
            </ScrollView>
        );
    };

    return (
        <StyledView className="flex-1" style={{ backgroundColor: '#1c1610' }}>
            {/* HEADER */}
            <StyledView className="flex-row justify-between items-center px-4 pt-12 pb-4 border-b border-gray-800" style={{ backgroundColor: '#241a10' }}>
                <StyledView>
                    <StyledText className="text-white text-2xl font-bold tracking-widest uppercase">Kite Mock</StyledText>
                    <StyledText className="text-gray-400 text-xs">Funds: ₹{balance?.toLocaleString() || '100,000'}</StyledText>
                </StyledView>
                <StyledTouchableOpacity onPress={onClose} className="p-2 bg-gray-800 rounded-full" style={{ borderRadius: 12 }}>
                    <Ionicons name="close" size={24} color="white" />
                </StyledTouchableOpacity>
            </StyledView>

            <StyledView className="flex-1 p-4">
                {renderTabHeader()}

                {activeTab === 'Watchlist' && renderWatchlist()}
                {activeTab === 'Portfolio' && renderPortfolio()}
                {activeTab === 'Orders' && renderOrders()}
                {activeTab === 'News' && renderNews()}
                {activeTab === 'Advisor' && renderAdvisor()}
            </StyledView>

            {/* STOCK DETAIL MODAL OVERLAY */}
            {selectedStock && (
                <StyledView className="absolute inset-0 z-50 flex-1" style={{ backgroundColor: 'rgba(18,14,8,0.95)' }}>
                    <StyledView className="flex-row justify-between items-center p-6 border-b border-gray-800">
                        <StyledView>
                            <StyledText className="text-white text-2xl font-bold">{selectedStock.symbol.replace(".NS", "")}</StyledText>
                            <StyledText className="text-gray-400">{selectedStock.name}</StyledText>
                        </StyledView>
                        <StyledTouchableOpacity onPress={() => setSelectedStock(null)}>
                            <Ionicons name="close-circle" size={32} color="#4B5563" />
                        </StyledTouchableOpacity>
                    </StyledView>

                    <ScrollView className="flex-1 mb-[80px]" contentContainerStyle={{ padding: 24 }} showsVerticalScrollIndicator={false}>
                        <StyledView className="flex-row items-end gap-3 mb-8">
                            <StyledText className="text-white text-4xl font-bold">₹{selectedStock.price.toFixed(2)}</StyledText>
                            <StyledText className={`text-lg font-bold mb-1 ${selectedStock.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {selectedStock.change >= 0 ? '+' : ''}{selectedStock.change.toFixed(2)} ({selectedStock.change_percent.toFixed(2)}%)
                            </StyledText>
                        </StyledView>

                        {stockHistory ? (
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                <LineChart
                                    data={stockHistory}
                                    width={Math.max(Dimensions.get("window").width - 48, stockHistory.labels.length * 40)} // Ensure minimum dynamic width based on data
                                    height={220}
                                    withDots={false}
                                    withInnerLines={false}
                                    chartConfig={{
                                        backgroundColor: "#1c1610",
                                        backgroundGradientFrom: "#241a10",
                                        backgroundGradientTo: "#241a10",
                                        decimalPlaces: 1, // optional, defaults to 2dp
                                        color: (opacity = 1) => selectedStock.change >= 0 ? `rgba(74, 222, 128, ${opacity})` : `rgba(248, 113, 113, ${opacity})`,
                                        labelColor: (opacity = 1) => `rgba(156, 163, 175, ${opacity})`,
                                        style: { borderRadius: 16 },
                                        propsForDots: { r: "0", strokeWidth: "0" }
                                    }}
                                    bezier
                                    style={{ marginVertical: 8, borderRadius: 16 }}
                                />
                            </ScrollView>
                        ) : (
                            <StyledView className="h-[220px] items-center justify-center border border-gray-800 mb-2" style={{ borderRadius: 14 }}>
                                <StyledText className="text-gray-500">Loading Chart...</StyledText>
                            </StyledView>
                        )}
                    </ScrollView>

                    <StyledView className="absolute bottom-0 left-0 right-0 p-6 flex-row gap-4 border-t border-gray-800" style={{ backgroundColor: '#241a10' }}>
                        <StyledTouchableOpacity
                            onPress={() => handleTrade('sell')}
                            disabled={isTrading}
                            className="flex-1 bg-red-600 py-4 items-center"
                            style={{ borderRadius: 12 }}
                        >
                            <StyledText className="text-white font-bold text-lg">{isTrading ? '...' : 'SELL'}</StyledText>
                        </StyledTouchableOpacity>
                        <StyledTouchableOpacity
                            onPress={() => handleTrade('buy')}
                            disabled={isTrading}
                            className="flex-1 py-4 items-center"
                            style={{ backgroundColor: '#d4942a', borderRadius: 12 }}
                        >
                            <StyledText className="text-white font-bold text-lg">{isTrading ? '...' : 'BUY'}</StyledText>
                        </StyledTouchableOpacity>
                    </StyledView>
                </StyledView>
            )}
        </StyledView>
    );
}
