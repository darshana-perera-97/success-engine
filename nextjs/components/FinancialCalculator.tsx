import React, { useState } from 'react';
import { Student, FinancialAsset, AssetType } from '../types';
import { Button } from './Button';
import { formatRawLKR, EXCHANGE_RATES, RATE_UPDATED_AT } from '../utils';
import { DollarSign, Landmark, Calculator, AlertTriangle, Plus, Trash2, Info, Clock } from 'lucide-react';

interface FinancialCalculatorProps {
    student: Student;
    onSave?: (data: any) => void;
}

// Living Expense Constants (Annual estimate for visa)
const LIVING_EXPENSES: Record<string, number> = {
    'UK': 12006, // London rate approx
    'Canada': 20635, // New 2024 GIC
    'Australia': 24505, 
    'New Zealand': 20000,
    'USA': 25000, // I-20 Est
};

const CURRENCY_CODES: Record<string, string> = {
    'UK': 'GBP',
    'Canada': 'CAD',
    'Australia': 'AUD',
    'New Zealand': 'NZD',
    'USA': 'USD',
};

export const FinancialCalculator: React.FC<FinancialCalculatorProps> = ({ student }) => {
    // --- State ---
    const [tuitionFee, setTuitionFee] = useState(student.financials?.tuitionFee || 15000);
    const [scholarship, setScholarship] = useState(student.financials?.scholarship || 0);
    const [paidTuition, setPaidTuition] = useState(student.financials?.paidTuition || 0);
    const [assets, setAssets] = useState<FinancialAsset[]>(student.financials?.assets || []);

    // Form State for New Asset
    const [newAssetAmount, setNewAssetAmount] = useState('');
    const [newAssetType, setNewAssetType] = useState<AssetType>('Savings');
    const [newAssetAge, setNewAssetAge] = useState('');

    // --- Calculations ---
    const targetCurrency = CURRENCY_CODES[student.country] || 'USD';
    const exchangeRate = EXCHANGE_RATES[targetCurrency] || 312.50;
    
    // 1. Requirement
    const livingCost = LIVING_EXPENSES[student.country] || 15000;
    const travelCost = 2000; // Flat estimate
    const totalTuitionDue = Math.max(0, tuitionFee - scholarship - paidTuition);
    const totalRequiredTarget = totalTuitionDue + livingCost + travelCost;
    const totalRequiredLKR = totalRequiredTarget * exchangeRate;

    // 2. Availability
    const liquidAssets = assets.filter(a => a.isLiquid);
    const totalLiquidLKR = liquidAssets.reduce((sum, a) => sum + a.amountLKR, 0);
    const totalLiquidTarget = totalLiquidLKR / exchangeRate;
    
    // 3. Gap
    const shortfallTarget = totalRequiredTarget - totalLiquidTarget;
    const isSufficient = shortfallTarget <= 0;
    const coveragePercent = Math.min(100, Math.round((totalLiquidTarget / totalRequiredTarget) * 100));

    // --- Handlers ---
    const addAsset = () => {
        if (!newAssetAmount) return;
        const amount = parseFloat(newAssetAmount);
        const age = parseInt(newAssetAge) || 0;
        
        // Auto-determine liquidity based on strict visa rules
        // e.g., Property is NOT liquid for "Show Money" usually unless sold
        const isLiquid = newAssetType === 'Savings' || newAssetType === 'Fixed Deposit';

        const newAsset: FinancialAsset = {
            id: Math.random().toString(),
            type: newAssetType,
            amountLKR: amount,
            fundsAgeMonths: age,
            isLiquid: isLiquid
        };

        setAssets([...assets, newAsset]);
        setNewAssetAmount('');
        setNewAssetAge('');
    };

    const removeAsset = (id: string) => {
        setAssets(assets.filter(a => a.id !== id));
    };

    const formatCurrency = (val: number, currency: string) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency, maximumFractionDigits: 0 }).format(val);
    };

    return (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 h-full">
            
            {/* LEFT: Requirements Calculator */}
            <div className="xl:col-span-5 space-y-6">
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-6 flex items-center">
                        <Calculator size={16} className="mr-2 text-indigo-600" />
                        Visa Requirement Model ({student.country})
                    </h3>

                    <div className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-slate-500">Total Annual Tuition ({targetCurrency})</label>
                            <input 
                                type="number" 
                                value={tuitionFee}
                                onChange={(e) => setTuitionFee(parseFloat(e.target.value) || 0)}
                                className="w-full px-3 py-2 text-sm bg-slate-50 border border-gray-200 rounded-md outline-none focus:border-indigo-500 font-mono"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-emerald-600">Scholarship (-)</label>
                                <input 
                                    type="number" 
                                    value={scholarship}
                                    onChange={(e) => setScholarship(parseFloat(e.target.value) || 0)}
                                    className="w-full px-3 py-2 text-sm bg-emerald-50 border border-emerald-100 rounded-md outline-none focus:border-emerald-500 font-mono text-emerald-700"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-blue-600">Paid Deposit (-)</label>
                                <input 
                                    type="number" 
                                    value={paidTuition}
                                    onChange={(e) => setPaidTuition(parseFloat(e.target.value) || 0)}
                                    className="w-full px-3 py-2 text-sm bg-blue-50 border border-blue-100 rounded-md outline-none focus:border-blue-500 font-mono text-blue-700"
                                />
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-100 space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-600">Tuition Balance</span>
                                <span className="font-medium">{formatCurrency(totalTuitionDue, targetCurrency)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-600">Living Expenses (Est)</span>
                                <span className="font-medium">{formatCurrency(livingCost, targetCurrency)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-600">Travel & Health</span>
                                <span className="font-medium">{formatCurrency(travelCost, targetCurrency)}</span>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-200">
                             <div className="flex justify-between items-center mb-1">
                                <span className="text-sm font-bold text-slate-900">Total "Show Money" Required</span>
                                <span className="text-lg font-bold text-indigo-900">{formatCurrency(totalRequiredTarget, targetCurrency)}</span>
                             </div>
                              <div className="text-right text-xs text-slate-400 font-mono">
                                ≈ {formatRawLKR(totalRequiredLKR)}
                             </div>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-900 text-white rounded-xl p-6 shadow-md relative overflow-hidden">
                    <div className="relative z-10">
                        <h4 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Calculated Exchange Rate</h4>
                        <div className="flex items-end gap-2">
                            <div className="text-3xl font-mono font-bold">1 {targetCurrency}</div>
                            <div className="mb-1 text-slate-400">=</div>
                            <div className="text-3xl font-mono font-bold text-emerald-400">{exchangeRate.toFixed(2)} LKR</div>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-2 flex items-center gap-1">
                             <Clock size={10} /> Rates updated: {RATE_UPDATED_AT} (Central Bank)
                        </p>
                    </div>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600 rounded-full blur-[60px] opacity-20 -mr-10 -mt-10"></div>
                </div>
            </div>

            {/* RIGHT: Asset Manager */}
            <div className="xl:col-span-7 space-y-6">
                
                {/* Status Card */}
                <div className={`border rounded-xl p-6 shadow-sm transition-all flex flex-col sm:flex-row gap-6 items-center
                    ${isSufficient ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'}
                `}>
                    <div className="flex-1 w-full">
                        <h4 className={`text-sm font-bold uppercase mb-2 ${isSufficient ? 'text-emerald-800' : 'text-rose-800'}`}>
                            {isSufficient ? 'Funds Sufficient' : 'Funds Shortfall'}
                        </h4>
                        <div className="w-full bg-white/50 rounded-full h-4 mb-2 border border-black/5 overflow-hidden">
                            <div 
                                className={`h-4 rounded-full transition-all duration-1000 ${isSufficient ? 'bg-emerald-500' : 'bg-rose-500'}`} 
                                style={{ width: `${coveragePercent}%` }}
                            ></div>
                        </div>
                        <p className={`text-xs font-medium ${isSufficient ? 'text-emerald-700' : 'text-rose-700'}`}>
                            {coveragePercent}% Covered ({formatCurrency(totalLiquidTarget, targetCurrency)} available)
                        </p>
                    </div>
                    <div className="text-center min-w-[120px]">
                        <div className={`text-2xl font-bold ${isSufficient ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {isSufficient ? 'READY' : formatCurrency(shortfallTarget, targetCurrency)}
                        </div>
                        <div className={`text-xs uppercase font-bold ${isSufficient ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {isSufficient ? 'To File' : 'Deficit'}
                        </div>
                    </div>
                </div>

                {/* Asset Register */}
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                        <h3 className="font-bold text-slate-900 flex items-center gap-2">
                            <Landmark size={16} className="text-slate-500" />
                            Sponsor Assets
                        </h3>
                        <span className="text-xs text-slate-500 bg-white px-2 py-1 rounded border border-gray-200">
                            Total Liquid: {formatRawLKR(totalLiquidLKR)}
                        </span>
                    </div>

                    <div className="p-4 space-y-4">
                        {/* Input Row */}
                        <div className="grid grid-cols-12 gap-3 items-end bg-slate-50 p-3 rounded-lg border border-slate-100">
                            <div className="col-span-12 sm:col-span-3">
                                <label className="text-[10px] font-bold text-slate-500 uppercase">Type</label>
                                <select 
                                    className="w-full p-2 text-sm border border-gray-200 rounded bg-white outline-none"
                                    value={newAssetType}
                                    onChange={(e) => setNewAssetType(e.target.value as AssetType)}
                                >
                                    <option value="Savings">Savings</option>
                                    <option value="Fixed Deposit">Fixed Deposit</option>
                                    <option value="Property">Property (Illiquid)</option>
                                    <option value="Business Income">Business Income</option>
                                </select>
                            </div>
                            <div className="col-span-12 sm:col-span-4">
                                <label className="text-[10px] font-bold text-slate-500 uppercase">Amount (LKR)</label>
                                <input 
                                    type="number" 
                                    className="w-full p-2 text-sm border border-gray-200 rounded outline-none focus:border-indigo-500"
                                    placeholder="e.g. 5000000"
                                    value={newAssetAmount}
                                    onChange={(e) => setNewAssetAmount(e.target.value)}
                                />
                            </div>
                            <div className="col-span-6 sm:col-span-3">
                                <label className="text-[10px] font-bold text-slate-500 uppercase">Age (Months)</label>
                                <input 
                                    type="number" 
                                    className="w-full p-2 text-sm border border-gray-200 rounded outline-none focus:border-indigo-500"
                                    placeholder="Months held"
                                    value={newAssetAge}
                                    onChange={(e) => setNewAssetAge(e.target.value)}
                                />
                            </div>
                            <div className="col-span-6 sm:col-span-2">
                                <Button className="w-full" onClick={addAsset} disabled={!newAssetAmount}>
                                    <Plus size={16} />
                                </Button>
                            </div>
                        </div>

                        {/* List */}
                        <div className="space-y-2">
                            {assets.length === 0 && (
                                <div className="text-center py-6 text-slate-400 text-sm italic">
                                    No assets added. Add sponsor funds above.
                                </div>
                            )}
                            {assets.map((asset) => (
                                <div key={asset.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:border-gray-200 transition-colors group">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${asset.isLiquid ? 'bg-indigo-50 text-indigo-600' : 'bg-amber-50 text-amber-600'}`}>
                                            <DollarSign size={16} />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-900 text-sm">{asset.type}</p>
                                            <div className="flex items-center gap-2 text-xs">
                                                <span className="text-slate-500">{formatRawLKR(asset.amountLKR)}</span>
                                                {asset.fundsAgeMonths < 1 && asset.isLiquid && (
                                                    <span className="flex items-center text-rose-600 font-bold bg-rose-50 px-1 rounded">
                                                        <AlertTriangle size={10} className="mr-1" /> New Funds
                                                    </span>
                                                )}
                                                {!asset.isLiquid && (
                                                    <span className="text-amber-600 bg-amber-50 px-1 rounded">Illiquid</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <p className="font-mono font-medium text-slate-700 text-sm">
                                                {formatCurrency(asset.amountLKR / exchangeRate, targetCurrency)}
                                            </p>
                                            <p className="text-[10px] text-slate-400">
                                                Held: {asset.fundsAgeMonths}mo
                                            </p>
                                        </div>
                                        <button 
                                            onClick={() => removeAsset(asset.id)}
                                            className="text-slate-300 hover:text-rose-500 transition-colors p-1"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Smart Tips */}
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3">
                    <Info size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-800">
                        <p className="font-bold mb-1">Counselor Note:</p>
                        <ul className="list-disc list-inside space-y-1 text-xs">
                            {student.country === 'UK' && <li>Ensure funds are held for 28 consecutive days before printing the statement.</li>}
                            {student.country === 'Canada' && <li>GIC ($20,635) must be transferred from the student's or sponsor's account directly.</li>}
                            <li>Property value is generally <strong>not accepted</strong> as liquid cash for student visas unless sold.</li>
                            <li>Gold loans are acceptable if the loan is disbursed into the savings account.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};