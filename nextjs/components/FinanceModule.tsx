import React, { useState } from 'react';
import { Invoice, InvoiceStatus, Student, UserRole } from '../types';
import { DollarSign, CheckCircle, Clock, AlertCircle, FileText, Plus, Download, Upload } from 'lucide-react';
import { Button } from './Button';
import { formatLKR, formatRawLKR, EXCHANGE_RATES, RATE_UPDATED_AT } from '../utils';

interface FinanceModuleProps {
    student: Student;
    invoices: Invoice[];
    userRole: UserRole;
    onCreateInvoice?: (invoice: Invoice) => void;
    onUpdateInvoice?: (invoice: Invoice) => void;
}

export const FinanceModule: React.FC<FinanceModuleProps> = ({ student, invoices, userRole, onCreateInvoice, onUpdateInvoice }) => {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    
    // Create Form State
    const [newAmount, setNewAmount] = useState('');
    const [newDesc, setNewDesc] = useState('');
    const [newCurrency, setNewCurrency] = useState('LKR');
    const [newDueDate, setNewDueDate] = useState('');

    const studentInvoices = invoices.filter(inv => inv.studentId === student.id).sort((a,b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime());
    
    // KPIs - Correctly combine payments by converting to LKR
    const totalPaid = studentInvoices
        .filter(i => i.status === 'Paid')
        .reduce((acc, curr) => acc + (curr.amount * (EXCHANGE_RATES[curr.currency] || 1)), 0);
        
    const totalPending = studentInvoices
        .filter(i => i.status === 'Pending' || i.status === 'Overdue' || i.status === 'Verifying')
        .reduce((acc, curr) => acc + (curr.amount * (EXCHANGE_RATES[curr.currency] || 1)), 0);

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!onCreateInvoice) return;

        const newInv: Invoice = {
            id: `INV-${Date.now()}`,
            studentId: student.id,
            amount: parseFloat(newAmount),
            currency: newCurrency,
            description: newDesc,
            issueDate: new Date().toISOString().split('T')[0],
            dueDate: newDueDate,
            status: 'Pending'
        };
        onCreateInvoice(newInv);
        setIsCreateOpen(false);
        setNewAmount('');
        setNewDesc('');
        setNewDueDate('');
    };

    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<'card' | 'upload'>('card');

    const handlePayClick = (invoice: Invoice) => {
        setSelectedInvoice(invoice);
        setIsPaymentModalOpen(true);
    };

    const handlePaymentSubmit = () => {
        if (!onUpdateInvoice || !selectedInvoice) return;

        if (paymentMethod === 'card') {
            // Simulate Card Payment
            onUpdateInvoice({
                ...selectedInvoice,
                status: 'Paid',
                paymentMethod: 'Credit Card',
                generatedReceiptUrl: `REC-${selectedInvoice.id}.pdf`
            });
        } else {
            // Simulate Bank Transfer Upload
            onUpdateInvoice({
                ...selectedInvoice,
                status: 'Verifying',
                paymentMethod: 'Bank Transfer',
                paymentProofUrl: 'mock_slip.pdf'
            });
        }
        setIsPaymentModalOpen(false);
        setSelectedInvoice(null);
    };

    const handleApprove = (invoice: Invoice) => {
        if (!onUpdateInvoice) return;
        onUpdateInvoice({
            ...invoice,
            status: 'Paid',
            generatedReceiptUrl: `REC-${invoice.id}.pdf`
        });
    };

    const getStatusColor = (status: InvoiceStatus) => {
        switch (status) {
            case 'Paid': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
            case 'Pending': return 'bg-amber-50 text-amber-700 border-amber-200';
            case 'Verifying': return 'bg-blue-50 text-blue-700 border-blue-200';
            case 'Overdue': return 'bg-rose-50 text-rose-700 border-rose-200';
            default: return 'bg-slate-50 text-slate-700 border-slate-200';
        }
    };

    const isStaff = userRole === 'Admin' || userRole === 'Manager' || userRole === 'Counselor';

    return (
        <div className="space-y-6">
            
            {/* 1. Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><FileText size={20} /></div>
                        <span className="text-xs font-bold text-slate-400 uppercase">Total Invoiced</span>
                    </div>
                    <div className="text-2xl font-bold text-slate-900">{studentInvoices.length}</div>
                </div>
                  <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><CheckCircle size={20} /></div>
                        <span className="text-xs font-bold text-slate-400 uppercase">Total Paid</span>
                    </div>
                    <div className="text-2xl font-bold text-slate-900">{formatRawLKR(totalPaid)}</div>
                </div>
                 <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><Clock size={20} /></div>
                        <span className="text-xs font-bold text-slate-400 uppercase">Outstanding</span>
                    </div>
                    <div className="text-2xl font-bold text-amber-600">{formatRawLKR(totalPending)}</div>
                </div>
            </div>

            {/* 2. Action Toolbar (Staff Only) */}
            <div className="flex justify-between items-center">
                <div className="space-y-1">
                    <h3 className="font-bold text-slate-900 flex items-center gap-2">
                        <DollarSign size={18} className="text-slate-500" />
                        Ledger & Payments
                    </h3>
                    <p className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Clock size={10} /> Rates updated: {RATE_UPDATED_AT}
                    </p>
                </div>
                {isStaff && (
                    <Button size="sm" onClick={() => setIsCreateOpen(true)}>
                        <Plus size={16} className="mr-2" /> Create Invoice
                    </Button>
                )}
            </div>

            {/* 3. Create Invoice Form (Inline) */}
            {isCreateOpen && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 animate-in slide-in-from-top-2">
                    <h4 className="font-bold text-sm text-slate-900 mb-4">New Invoice Details</h4>
                    <form onSubmit={handleCreateSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                        <div className="md:col-span-4">
                            <label className="text-xs font-semibold text-slate-500 uppercase block mb-1">Description</label>
                            <input 
                                required
                                type="text" 
                                className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-md outline-none focus:border-indigo-500"
                                placeholder="e.g. Visa Fee"
                                value={newDesc}
                                onChange={e => setNewDesc(e.target.value)}
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="text-xs font-semibold text-slate-500 uppercase block mb-1">Amount</label>
                            <input 
                                required
                                type="number" 
                                className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-md outline-none focus:border-indigo-500"
                                placeholder="0.00"
                                value={newAmount}
                                onChange={e => setNewAmount(e.target.value)}
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="text-xs font-semibold text-slate-500 uppercase block mb-1">Currency</label>
                            <select 
                                className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-md outline-none focus:border-indigo-500"
                                value={newCurrency}
                                onChange={e => setNewCurrency(e.target.value)}
                            >
                                <option>LKR</option>
                                <option>USD</option>
                                <option>GBP</option>
                                <option>CAD</option>
                                <option>AUD</option>
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <label className="text-xs font-semibold text-slate-500 uppercase block mb-1">Due Date</label>
                            <input 
                                required
                                type="date" 
                                className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-md outline-none focus:border-indigo-500"
                                value={newDueDate}
                                onChange={e => setNewDueDate(e.target.value)}
                            />
                        </div>
                        <div className="md:col-span-2 flex gap-2">
                             <Button type="button" variant="ghost" className="flex-1" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                             <Button type="submit" className="flex-1">Issue</Button>
                        </div>
                    </form>
                </div>
            )}

            {/* 4. Invoice Table */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 border-b border-gray-200 text-slate-500 font-medium">
                        <tr>
                            <th className="px-6 py-4">Invoice ID / Date</th>
                            <th className="px-6 py-4">Description</th>
                            <th className="px-6 py-4">Amount</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {studentInvoices.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="text-center py-8 text-slate-400">No invoices found.</td>
                            </tr>
                        ) : (
                            studentInvoices.map(inv => (
                                <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-mono text-slate-900 font-medium">{inv.id}</div>
                                        <div className="text-xs text-slate-400">{inv.issueDate}</div>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-slate-700">
                                        {inv.description}
                                        {inv.dueDate && inv.status !== 'Paid' && (
                                            <div className="text-xs text-rose-500 mt-0.5 flex items-center gap-1">
                                                <AlertCircle size={10} /> Due: {inv.dueDate}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 font-mono font-bold text-slate-900">
                                        <div className="flex flex-col">
                                            <span>{inv.currency} {inv.amount.toLocaleString()}</span>
                                            {inv.currency !== 'LKR' && (
                                                <span className="text-[10px] text-slate-400 font-normal">≈ {formatLKR(inv.amount, inv.currency)}</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusColor(inv.status)}`}>
                                            {inv.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            {/* Student Actions */}
                                            {userRole === 'Student' && inv.status === 'Pending' && (
                                                <Button size="sm" onClick={() => handlePayClick(inv)} className="bg-indigo-600 hover:bg-indigo-700">
                                                    Pay Now
                                                </Button>
                                            )}
                                            
                                            {/* Staff Actions */}
                                            {isStaff && inv.status === 'Verifying' && (
                                                <Button size="sm" onClick={() => handleApprove(inv)} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                                                    Approve Payment
                                                </Button>
                                            )}

                                            {/* Common Actions */}
                                            {inv.status === 'Paid' && inv.generatedReceiptUrl && (
                                                <Button size="sm" variant="secondary" className="text-slate-600">
                                                    <Download size={14} className="mr-2" /> Receipt
                                                </Button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            {/* Payment Modal */}
            {isPaymentModalOpen && selectedInvoice && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md scale-100 animate-in zoom-in-95">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-lg text-slate-900">Process Payment</h3>
                            <button onClick={() => setIsPaymentModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <span className="sr-only">Close</span>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                        </div>
                        
                        <div className="mb-6 bg-slate-50 p-4 rounded-lg border border-slate-100">
                            <p className="text-xs text-slate-500 uppercase font-bold mb-1">Total Amount</p>
                            <p className="text-2xl font-bold text-slate-900">{selectedInvoice.currency} {selectedInvoice.amount.toLocaleString()}</p>
                            {selectedInvoice.currency !== 'LKR' && (
                                <p className="text-xs text-slate-400 mt-1">≈ {formatLKR(selectedInvoice.amount, selectedInvoice.currency)}</p>
                            )}
                            <p className="text-sm text-slate-600 mt-2">{selectedInvoice.description}</p>
                        </div>

                        <div className="space-y-4 mb-6">
                            <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === 'card' ? 'border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500' : 'border-gray-200 hover:border-gray-300'}`}>
                                <input type="radio" name="payment" className="sr-only" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} />
                                <div className={`w-5 h-5 rounded-full border mr-3 flex items-center justify-center ${paymentMethod === 'card' ? 'border-indigo-600' : 'border-gray-300'}`}>
                                    {paymentMethod === 'card' && <div className="w-2.5 h-2.5 bg-indigo-600 rounded-full" />}
                                </div>
                                <div>
                                    <p className="font-semibold text-slate-900">Pay by Card</p>
                                    <p className="text-xs text-slate-500">Secure checkout via Stripe</p>
                                </div>
                            </label>

                            <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === 'upload' ? 'border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500' : 'border-gray-200 hover:border-gray-300'}`}>
                                <input type="radio" name="payment" className="sr-only" checked={paymentMethod === 'upload'} onChange={() => setPaymentMethod('upload')} />
                                <div className={`w-5 h-5 rounded-full border mr-3 flex items-center justify-center ${paymentMethod === 'upload' ? 'border-indigo-600' : 'border-gray-300'}`}>
                                    {paymentMethod === 'upload' && <div className="w-2.5 h-2.5 bg-indigo-600 rounded-full" />}
                                </div>
                                <div>
                                    <p className="font-semibold text-slate-900">Bank Transfer</p>
                                    <p className="text-xs text-slate-500">Upload receipt/slip manually</p>
                                </div>
                            </label>
                        </div>

                        {paymentMethod === 'upload' && (
                            <div className="mb-6 border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:bg-slate-50 cursor-pointer transition-colors">
                                <Upload className="mx-auto text-slate-400 mb-2" size={24} />
                                <p className="text-sm font-medium text-slate-600">Click to upload receipt</p>
                                <p className="text-xs text-slate-400 mt-1">JPG, PNG or PDF</p>
                            </div>
                        )}

                        <div className="flex gap-3">
                            <Button variant="ghost" className="flex-1" onClick={() => setIsPaymentModalOpen(false)}>Cancel</Button>
                            <Button className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white" onClick={handlePaymentSubmit}>
                                {paymentMethod === 'card' ? 'Pay Now' : 'Submit Receipt'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};