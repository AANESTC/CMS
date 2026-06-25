import React, { useState, useEffect } from 'react';
import {
  MdAdd, MdClose, MdReceipt, MdEdit, MdAttachMoney,
  MdPendingActions, MdCheckCircle, MdSearch, MdRefresh,
  MdPrint, MdFilterList, MdTrendingUp, MdDelete
} from 'react-icons/md';
import { getInvoices, createInvoice, updateInvoice, deleteInvoice, getPatients } from '../api';

const Z = {
  blue: '#0B5FFF', blueL: '#EEF4FF',
  green: '#00AA45', greenL: '#E6F7EE',
  orange: '#F5A623', orangeL: '#FFF5E5',
  red: '#E42527', redL: '#FEE9E9',
  yellow: '#EAB308', yellowL: '#FEFCE8',
  navy: '#1A2B4A', text: '#6B7A99',
};

const STATUS = {
  Paid:    { bg: Z.greenL,  color: Z.green,  label: 'Paid' },
  Partial: { bg: Z.yellowL, color: Z.yellow, label: 'Partial' },
  Unpaid:  { bg: Z.redL,    color: Z.red,    label: 'Unpaid' },
};

const InvoiceManagement = () => {
  const [invoices, setInvoices]   = useState([]);
  const [patients, setPatients]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [editInvoice, setEditInvoice] = useState(null);
  const [error, setError]         = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch]       = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Builder states
  const [form, setForm] = useState({ patientId: '', paidAmount: '', paymentMode: 'Cash' });
  const [items, setItems] = useState([{ desc: '', hsn: '', qty: 1, rate: 0 }]);

  const load = async () => {
    setLoading(true);
    try { setInvoices(await getInvoices()); }
    catch { setError('Failed to load invoices'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); getPatients().then(setPatients).catch(() => {}); }, []);

  const openEdit = (inv) => {
    setEditInvoice(inv);
    let parsedItems = [];
    try {
      parsedItems = JSON.parse(inv.notes);
      if (!Array.isArray(parsedItems)) parsedItems = [];
    } catch {
      // Legacy note
      parsedItems = [{ desc: inv.notes || '', hsn: '', qty: 1, rate: inv.totalAmount }];
    }
    
    if (parsedItems.length === 0) parsedItems = [{ desc: '', hsn: '', qty: 1, rate: 0 }];
    
    setItems(parsedItems);
    setForm({ patientId: inv.patientId, paidAmount: String(inv.paidAmount), paymentMode: 'Cash' });
    setShowForm(true);
  };

  const resetForm = () => {
    setShowForm(false);
    setEditInvoice(null);
    setError('');
    setForm({ patientId: '', paidAmount: '', paymentMode: 'Cash' });
    setItems([{ desc: '', hsn: '', qty: 1, rate: 0 }]);
  };

  const handleAddItem = () => setItems([...items, { desc: '', hsn: '', qty: 1, rate: 0 }]);
  
  const handleUpdateItem = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = field === 'qty' ? parseInt(value) || 0 : field === 'rate' ? parseFloat(value) || 0 : value;
    setItems(updated);
  };
  
  const handleRemoveItem = (index) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const subtotal = items.reduce((acc, item) => acc + ((item.qty || 0) * (item.rate || 0)), 0);
  const gst = Math.round(subtotal * 0.18);
  const calculatedTotal = subtotal + gst;

  const handleSubmit = async (e) => {
    e.preventDefault(); 
    if (!form.patientId) { setError('Please select a patient'); return; }
    if (items.length === 0 || items.every(i => !i.desc.trim())) { setError('Please add at least one valid item'); return; }
    
    setSubmitting(true); setError('');
    try {
      const payload = {
        patientId: form.patientId,
        totalAmount: calculatedTotal,
        paidAmount: parseFloat(form.paidAmount) || 0,
        notes: JSON.stringify(items.filter(i => i.desc.trim() !== '')),
      };
      if (editInvoice) {
        await updateInvoice(editInvoice.invoiceId, payload);
        await load();
      } else {
        const created = await createInvoice(payload);
        setInvoices(prev => [created, ...prev]);
      }
      resetForm();
    } catch (e) { setError(e.message); }
    finally { setSubmitting(false); }
  };

  const handleMarkAsPaid = () => {
    setForm({ ...form, paidAmount: String(calculatedTotal) });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this invoice? This cannot be undone.')) return;
    await deleteInvoice(id);
    setInvoices(prev => prev.filter(i => i.invoiceId !== id));
  };

  const fmt     = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  const fmtDate = (dt) => new Date(dt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  const totals = invoices.reduce((acc, i) => ({
    total: acc.total + (i.totalAmount || 0),
    paid: acc.paid + (i.paidAmount || 0),
    balance: acc.balance + (i.balanceAmount || 0),
  }), { total: 0, paid: 0, balance: 0 });

  const paidCount    = invoices.filter(i => i.status === 'Paid').length;
  const partialCount = invoices.filter(i => i.status === 'Partial').length;
  const unpaidCount  = invoices.filter(i => i.status === 'Unpaid').length;

  const filtered = invoices.filter(i => {
    const matchSearch = !search || i.patientName?.toLowerCase().includes(search.toLowerCase()) || i.invoiceNumber?.includes(search);
    const matchStatus = statusFilter === 'All' || i.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const inputCls = "w-full px-4 py-2.5 border-2 rounded-xl outline-none text-sm transition-all";
  const inputStyle = { borderColor: '#E2E8F0', background: '#F8FAFC', color: Z.navy };

  return (
    <div className="space-y-5 animate-fade-up pb-10">
      {/* Header */}
      <div className="flex justify-between items-start flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: Z.navy }}>Invoices & Billing</h1>
          <p className="text-sm mt-0.5" style={{ color: Z.text }}>Create itemized bills and manage patient payments.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="p-2.5 bg-white rounded-xl border zoho-card hover:bg-gray-50 transition-colors">
            <MdRefresh className="w-5 h-5" style={{ color: Z.text }} />
          </button>
          <button onClick={() => showForm ? resetForm() : setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold zoho-btn-primary hover:shadow-lg transition-all">
            {showForm ? <><MdClose className="w-4 h-4" /> Cancel</> : <><MdAdd className="w-4 h-4" /> New Invoice</>}
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: 'Total Billed',  value: fmt(totals.total),   icon: MdReceipt,        color: Z.blue,   bg: Z.blueL   },
          { label: 'Collected',     value: fmt(totals.paid),    icon: MdAttachMoney,    color: Z.green,  bg: Z.greenL  },
          { label: 'Pending Dues',  value: fmt(totals.balance), icon: MdPendingActions, color: Z.red,    bg: Z.redL    },
          { label: 'Paid',          value: paidCount,            icon: MdCheckCircle,    color: Z.green,  bg: Z.greenL  },
          { label: 'Partial',       value: partialCount,         icon: MdTrendingUp,     color: Z.yellow, bg: Z.yellowL },
          { label: 'Unpaid',        value: unpaidCount,          icon: MdPendingActions, color: Z.red,    bg: Z.redL    },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-2xl p-4 flex items-center gap-3 zoho-card">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: bg }}>
              <Icon className="w-4 h-4" style={{ color }} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px]" style={{ color: Z.text }}>{label}</p>
              <p className="text-base font-bold truncate" style={{ color: Z.navy }}>{value}</p>
            </div>
          </div>
        ))}
      </div>

      {error && <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm font-medium">{error}</div>}

      {/* Invoice Form (Itemized Builder) */}
      {showForm && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 animate-fade-up">
          <div className="col-span-1 lg:col-span-2 flex flex-col gap-4">
            
            <div className="bg-white p-5 rounded-2xl zoho-card border flex justify-between items-start" style={{ borderColor: '#E8EDF4' }}>
              <div>
                <h2 className="font-bold text-base mb-1" style={{ color: Z.navy }}>
                  {editInvoice ? '✏️ Edit Invoice' : '➕ Invoice Builder'}
                </h2>
                <p className="text-xs" style={{ color: Z.text }}>Add line items, consultation fees, and lab tests.</p>
              </div>
              <div className="w-64">
                <label className="block text-xs font-semibold mb-1" style={{ color: Z.navy }}>Select Patient *</label>
                <select required value={form.patientId} disabled={!!editInvoice}
                  onChange={e => setForm({ ...form, patientId: e.target.value })}
                  className={inputCls} style={{ ...inputStyle, cursor: 'pointer' }}>
                  <option value="">Select Patient...</option>
                  {patients.map(p => <option key={p.patientId} value={p.patientId}>{p.name} — {p.contactNumber}</option>)}
                </select>
              </div>
            </div>

            <div className="bg-white rounded-2xl zoho-card border overflow-hidden" style={{ borderColor: '#E8EDF4' }}>
              <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: '#E8EDF4', background: '#F8FAFC' }}>
                <h3 className="text-sm font-bold" style={{ color: Z.navy }}>Invoice Items</h3>
                <button onClick={handleAddItem} type="button" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all" style={{ background: Z.blueL, color: Z.blue }}>
                  <MdAdd size={14} /> Add Item
                </button>
              </div>
              <div className="p-5">
                <div className="grid gap-2 text-xs font-bold uppercase tracking-wide mb-3" style={{ gridTemplateColumns: '3fr 1fr 1fr 1.5fr auto', color: Z.text }}>
                  <span>Description</span>
                  <span>HSN/SAC</span>
                  <span>Qty</span>
                  <span>Rate (₹)</span>
                  <span></span>
                </div>
                
                <div className="space-y-3">
                  {items.map((item, index) => (
                    <div key={index} className="grid items-center gap-2" style={{ gridTemplateColumns: '3fr 1fr 1fr 1.5fr auto' }}>
                      <input type="text" className={inputCls} style={inputStyle} placeholder="Consultation, medicine..." value={item.desc}
                        onChange={(e) => handleUpdateItem(index, 'desc', e.target.value)}
                        onFocus={e => e.target.style.borderColor = Z.blue} onBlur={e => e.target.style.borderColor = '#E2E8F0'} />
                      <input type="text" className={inputCls} style={inputStyle} placeholder="HSN" value={item.hsn}
                        onChange={(e) => handleUpdateItem(index, 'hsn', e.target.value)}
                        onFocus={e => e.target.style.borderColor = Z.blue} onBlur={e => e.target.style.borderColor = '#E2E8F0'} />
                      <input type="number" min="1" className={inputCls} style={inputStyle} placeholder="Qty" value={item.qty}
                        onChange={(e) => handleUpdateItem(index, 'qty', e.target.value)}
                        onFocus={e => e.target.style.borderColor = Z.blue} onBlur={e => e.target.style.borderColor = '#E2E8F0'} />
                      <input type="number" min="0" className={inputCls} style={inputStyle} placeholder="Rate" value={item.rate}
                        onChange={(e) => handleUpdateItem(index, 'rate', e.target.value)}
                        onFocus={e => e.target.style.borderColor = Z.blue} onBlur={e => e.target.style.borderColor = '#E2E8F0'} />
                      <button type="button" className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" onClick={() => handleRemoveItem(index)}>
                        <MdDelete size={18} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="mt-6 ml-auto max-w-xs border-t pt-4 space-y-2.5" style={{ borderColor: '#E8EDF4' }}>
                  <div className="flex justify-between text-sm font-medium">
                    <span style={{ color: Z.text }}>Subtotal</span>
                    <span style={{ color: Z.navy }}>₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between text-sm font-medium">
                    <span style={{ color: Z.text }}>GST (18%)</span>
                    <span style={{ color: Z.navy }}>₹{gst}</span>
                  </div>
                  <div className="flex justify-between text-base font-bold border-t pt-2.5 mt-1" style={{ borderColor: '#E8EDF4' }}>
                    <span style={{ color: Z.navy }}>Total Amount</span>
                    <span style={{ color: Z.blue }}>₹{calculatedTotal}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-span-1 flex flex-col gap-4">
            <div className="bg-white p-5 rounded-2xl zoho-card border" style={{ borderColor: '#E8EDF4' }}>
              <h3 className="text-sm font-bold mb-4" style={{ color: Z.navy }}>Payment Details</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: Z.navy }}>Payment Mode</label>
                  <select value={form.paymentMode} onChange={e => setForm({ ...form, paymentMode: e.target.value })}
                    className={inputCls} style={{ ...inputStyle, cursor: 'pointer' }}>
                    <option value="Cash">Cash</option>
                    <option value="UPI">UPI</option>
                    <option value="Card">Card</option>
                    <option value="Insurance">Insurance</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: Z.navy }}>Amount Paid (₹)</label>
                  <div className="flex items-center gap-2">
                    <input type="number" min="0" step="0.01" value={form.paidAmount}
                      onChange={e => setForm({ ...form, paidAmount: e.target.value })}
                      className={inputCls} style={inputStyle}
                      onFocus={e => e.target.style.borderColor = Z.green} onBlur={e => e.target.style.borderColor = '#E2E8F0'} />
                    <button type="button" onClick={handleMarkAsPaid} title="Mark as Paid"
                      className="p-2.5 rounded-xl border flex-shrink-0 transition-colors hover:bg-green-50" style={{ borderColor: '#E8EDF4', color: Z.green }}>
                      <MdCheckCircle size={18} />
                    </button>
                  </div>
                </div>
                
                <div className="pt-2">
                  <button type="button" onClick={handleSubmit} disabled={submitting}
                    className="w-full py-3 rounded-xl text-white text-sm font-bold zoho-btn-primary shadow-md hover:shadow-lg transition-all disabled:opacity-50">
                    {submitting ? 'Saving...' : 'Save Invoice'}
                  </button>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-50/50 p-4 rounded-2xl border flex items-start gap-3 text-sm" style={{ borderColor: Z.blueL }}>
              <div className="p-2 bg-white rounded-lg flex-shrink-0" style={{ color: Z.blue }}><MdReceipt size={18} /></div>
              <div>
                <p className="font-bold mb-1" style={{ color: Z.navy }}>Pro Tip</p>
                <p style={{ color: Z.text, fontSize: '12px' }}>You can save the invoice without full payment and mark it as paid later when the patient clears the dues.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search + Filter Bar */}
      <div className="bg-white rounded-xl p-4 zoho-card flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[220px]">
          <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: Z.text }} />
          <input type="text" placeholder="Search by patient or invoice #…" value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border-2 text-sm outline-none transition-all"
            style={{ borderColor: '#E2E8F0', color: Z.navy, background: '#F8FAFC' }}
            onFocus={e => e.target.style.borderColor = Z.blue} onBlur={e => e.target.style.borderColor = '#E2E8F0'} />
        </div>
        <div className="flex items-center gap-2">
          <MdFilterList className="w-4 h-4" style={{ color: Z.text }} />
          {['All', 'Paid', 'Partial', 'Unpaid'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className="px-3 py-1.5 rounded-full text-xs font-bold transition-all"
              style={statusFilter === s
                ? { background: s === 'Paid' ? Z.green : s === 'Unpaid' ? Z.red : s === 'Partial' ? Z.yellow : Z.blue, color: '#fff' }
                : { background: '#F0F4F8', color: Z.text }}>
              {s}
            </button>
          ))}
        </div>
        <span className="text-xs font-bold ml-auto" style={{ color: Z.text }}>{filtered.length} results</span>
      </div>

      {/* Invoice Table */}
      <div className="bg-white rounded-2xl zoho-card overflow-hidden border" style={{ borderColor: '#E8EDF4' }}>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead>
              <tr className="text-[11px] uppercase border-b" style={{ color: Z.text, background: '#FAFBFD', borderColor: '#F0F4F8' }}>
                <th className="px-5 py-4 font-bold">Invoice #</th>
                <th className="px-5 py-4 font-bold">Patient</th>
                <th className="px-5 py-4 font-bold">Date</th>
                <th className="px-5 py-4 font-bold">Items</th>
                <th className="px-5 py-4 font-bold">Total</th>
                <th className="px-5 py-4 font-bold">Paid</th>
                <th className="px-5 py-4 font-bold">Balance</th>
                <th className="px-5 py-4 font-bold">Status</th>
                <th className="px-5 py-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: '#F8FAFC' }}>
              {loading ? (
                <tr><td colSpan={9} className="py-12 text-center text-sm font-medium" style={{ color: Z.text }}>Loading invoices...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={9} className="py-12 text-center text-sm font-medium" style={{ color: Z.text }}>
                  No invoices found. {statusFilter !== 'All' && 'Try changing the status filter.'}
                </td></tr>
              ) : filtered.map(inv => {
                const st = STATUS[inv.status] || { bg: '#F0F4F8', color: Z.text, label: inv.status };
                
                // Parse items for table display
                let parsedItemsCount = 0;
                try {
                  const arr = JSON.parse(inv.notes);
                  if (Array.isArray(arr)) parsedItemsCount = arr.length;
                } catch {}

                return (
                  <tr key={inv.invoiceId} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4 font-mono text-xs font-bold" style={{ color: Z.navy }}>{inv.invoiceNumber}</td>
                    <td className="px-5 py-4">
                      <p className="text-sm font-bold" style={{ color: Z.navy }}>{inv.patientName || '—'}</p>
                    </td>
                    <td className="px-5 py-4 text-sm font-medium" style={{ color: Z.navy }}>{fmtDate(inv.invoiceDate)}</td>
                    <td className="px-5 py-4 text-xs font-bold" style={{ color: Z.text }}>
                      {parsedItemsCount > 0 ? `${parsedItemsCount} Item${parsedItemsCount > 1 ? 's' : ''}` : 'Manual'}
                    </td>
                    <td className="px-5 py-4 text-sm font-bold" style={{ color: Z.navy }}>{fmt(inv.totalAmount)}</td>
                    <td className="px-5 py-4 text-sm font-bold" style={{ color: Z.green }}>{fmt(inv.paidAmount)}</td>
                    <td className="px-5 py-4 text-sm font-bold" style={{ color: inv.balanceAmount > 0 ? Z.red : Z.green }}>
                      {fmt(inv.balanceAmount)}
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full" style={{ background: st.bg, color: st.color }}>{st.label}</span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button onClick={() => openEdit(inv)} title="Edit"
                          className="p-1.5 rounded-lg transition-colors hover:bg-blue-100" style={{ color: Z.blue, background: Z.blueL }}>
                          <MdEdit className="w-4 h-4" />
                        </button>
                        <button onClick={() => window.print()} title="Print"
                          className="p-1.5 rounded-lg transition-colors hover:bg-orange-100" style={{ color: Z.orange, background: Z.orangeL }}>
                          <MdPrint className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(inv.invoiceId)} title="Delete"
                          className="p-1.5 rounded-lg transition-colors hover:bg-red-100" style={{ color: Z.red, background: Z.redL }}>
                          <MdDelete className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InvoiceManagement;
