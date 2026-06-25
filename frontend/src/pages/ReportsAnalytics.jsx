import React, { useState, useEffect } from 'react';
import {
  MdArrowBack, MdPeople, MdReceipt, MdAccessTime, MdTrendingUp, MdDownload,
  MdRefresh, MdCheckCircle
} from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { getDashboardSummary } from '../api';

const Z = {
  blue: '#0B5FFF', blueL: '#EEF4FF',
  green: '#00AA45', greenL: '#E6F7EE',
  orange: '#F5A623', orangeL: '#FFF5E5',
  teal: '#00B2A9', tealL: '#E0F7F6',
  purple: '#7B61FF', purpleL: '#F0EDFF',
  red: '#E42527', redL: '#FEE9E9',
  navy: '#1A2B4A', text: '#6B7A99',
};

const ReportsAnalytics = () => {
  const navigate = useNavigate();
  const [timeframe, setTimeframe] = useState('Weekly');
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const data = await getDashboardSummary();
      setSummary(data);
      setLastUpdated(new Date());
    } catch (e) {
      console.error('Failed to load reports:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const s = summary;
  const radius = 36;
  const circumference = 2 * Math.PI * radius; // ~226.2

  // Prepare Documents Pie Chart Data (matching backend enum names)
  const docData = s ? [
    { name: 'Blood Tests',   count: s.docsByType?.bloodTest    || 0, color: Z.red    },
    { name: 'X-Rays',        count: s.docsByType?.xray         || 0, color: Z.blue   },
    { name: 'Prescriptions', count: s.docsByType?.prescription || 0, color: Z.green  },
    { name: 'Other',         count: s.docsByType?.other        || 0, color: Z.orange }
  ].filter(d => d.count > 0) : [];
  
  const totalDocs = docData.reduce((acc, curr) => acc + curr.count, 0) || 1;
  const pieSegments = docData.map(d => ({ ...d, percentage: Math.round((d.count / totalDocs) * 100) }));

  // Chart data based on timeframe selection
  const weekChart = timeframe === 'Weekly'
    ? (s?.weekChart || Array(7).fill({ date: '-', appointments: 0 }))
    : (s?.weekChart || Array(7).fill({ date: '-', appointments: 0 }));
  const revChart = s?.monthlyRevenueChart || Array(6).fill({ month: '-', revenue: 0 });
  const maxVisits = Math.max(...weekChart.map(w => w.appointments), 10);
  const stepX = 280 / (weekChart.length - 1 || 1);
  const getPathD = () => {
    const points = weekChart.map((w, i) => {
      const x = 10 + (i * stepX);
      const y = 110 - ((w.appointments / maxVisits) * 90);
      return `${x},${y}`;
    });
    if (points.length === 0) return '';
    // Generate smooth curve
    let d = `M ${points[0].split(',')[0]} ${points[0].split(',')[1]}`;
    for (let i = 1; i < points.length; i++) {
      const prevX = parseFloat(points[i - 1].split(',')[0]);
      const prevY = parseFloat(points[i - 1].split(',')[1]);
      const currX = parseFloat(points[i].split(',')[0]);
      const currY = parseFloat(points[i].split(',')[1]);
      const ctrlX = (prevX + currX) / 2;
      d += ` Q ${ctrlX} ${prevY} ${currX} ${currY}`;
    }
    return d;
  };
  const pathD = getPathD();

  const maxRev = Math.max(...revChart.map(m => m.revenue), 1000);

  const fmtM = (n) => `₹${((n ?? 0)).toLocaleString('en-IN')}`;
  const fmtTime = (d) => d ? d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) : '';
  
  if (loading) return (
    <div className="h-full flex flex-col items-center justify-center gap-3" style={{ color: Z.text }}>
      <div className="w-10 h-10 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin" />
      <p className="text-sm font-bold">Loading analytics from database...</p>
    </div>
  );

  return (
    <div className="animate-fade-up h-full overflow-y-auto pb-10 space-y-5">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            className="p-2 rounded-xl border hover:bg-gray-50 transition-colors zoho-card" style={{ borderColor: '#E8EDF4', color: Z.text }}
            onClick={() => navigate(-1)}
          >
            <MdArrowBack size={20} />
          </button>
          <h1 className="text-2xl font-bold" style={{ color: Z.navy }}>Reports & Analytics</h1>
        </div>

        <div className="flex items-center gap-3">
          <select
            className="border-2 rounded-xl py-2 px-3 text-sm font-medium outline-none cursor-pointer"
            style={{ borderColor: '#E8EDF4', background: '#F8FAFC', color: Z.navy }}
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
          >
            <option value="Weekly">Weekly View</option>
            <option value="Monthly">Monthly View</option>
          </select>

          <button
            onClick={() => fetchData(true)}
            disabled={refreshing}
            className="flex items-center gap-1.5 py-2 px-4 rounded-xl text-sm font-bold border transition-all hover:bg-blue-50 hover:-translate-y-0.5 disabled:opacity-60 cursor-pointer"
            style={{ color: Z.blue, borderColor: Z.blueL }}
          >
            <MdRefresh size={16} className={refreshing ? 'animate-spin' : ''} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>

          <button className="flex items-center gap-1.5 py-2 px-4 rounded-xl text-sm font-bold border transition-all hover:bg-gray-50"
                  style={{ color: Z.blue, borderColor: Z.blueL }}>
            <MdDownload size={16} />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Last updated timestamp */}
      {lastUpdated && (
        <div className="flex items-center gap-1.5 text-[10px] font-bold -mt-2" style={{ color: Z.text }}>
          <MdCheckCircle size={12} style={{ color: Z.green }} />
          Live data · Last updated {fmtTime(lastUpdated)}
        </div>
      )}

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-shrink-0">
        <div className="bg-white rounded-2xl p-4 flex items-center gap-4 zoho-card border" style={{ borderColor: '#F0F4F8' }}>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: Z.blueL, color: Z.blue }}>
            <MdPeople size={24} />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: Z.text }}>Total Consultations</p>
            <p className="text-xl font-bold mt-0.5" style={{ color: Z.navy }}>{s?.totalAppointments || 0}</p>
            <span className="text-[10px] font-bold block mt-0.5" style={{ color: Z.green }}>↑ Tracked in Database</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 flex items-center gap-4 zoho-card border" style={{ borderColor: '#F0F4F8' }}>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: Z.greenL, color: Z.green }}>
            <MdReceipt size={24} />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: Z.text }}>Total Revenue</p>
            <p className="text-xl font-bold mt-0.5" style={{ color: Z.navy }}>{fmtM(s?.totalRevenue)}</p>
            <span className="text-[10px] font-bold block mt-0.5" style={{ color: Z.green }}>↑ All Time Collected</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 flex items-center gap-4 zoho-card border" style={{ borderColor: '#F0F4F8' }}>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: Z.orangeL, color: Z.orange }}>
            <MdAccessTime size={24} />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: Z.text }}>Today's Appts</p>
            <p className="text-xl font-bold mt-0.5" style={{ color: Z.navy }}>{s?.todayTotal || 0}</p>
            <span className="text-[10px] font-bold block mt-0.5" style={{ color: Z.text }}>{s?.completedToday || 0} completed</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 flex items-center gap-4 zoho-card border" style={{ borderColor: '#F0F4F8' }}>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: Z.purpleL, color: Z.purple }}>
            <MdTrendingUp size={24} />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: Z.text }}>Pending Dues</p>
            <p className="text-xl font-bold mt-0.5" style={{ color: Z.navy }}>{fmtM(s?.pendingRevenue)}</p>
            <span className="text-[10px] font-bold block mt-0.5" style={{ color: Z.red }}>{s?.unpaidCount || 0} invoices unpaid</span>
          </div>
        </div>
      </div>

      {/* Row 2: Visual Dashboard Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Chart 1: Patient Visits Trend */}
        <div className="bg-white rounded-2xl p-5 zoho-card border flex flex-col justify-between" style={{ borderColor: '#F0F4F8' }}>
          <div>
            <h3 className="font-bold text-sm" style={{ color: Z.navy }}>Patient Visits Trend</h3>
            <p className="text-[10.5px] mt-0.5" style={{ color: Z.text }}>Visits over the last 7 days</p>
          </div>
          
          <div className="h-48 w-full mt-4 flex items-end relative">
            <svg className="w-full h-full" viewBox="0 0 300 120" preserveAspectRatio="none">
              <line x1="0" y1="20" x2="300" y2="20" stroke="#F0F4F8" strokeWidth="1" />
              <line x1="0" y1="50" x2="300" y2="50" stroke="#F0F4F8" strokeWidth="1" />
              <line x1="0" y1="80" x2="300" y2="80" stroke="#F0F4F8" strokeWidth="1" />
              <line x1="0" y1="110" x2="300" y2="110" stroke="#F0F4F8" strokeWidth="1" />

              {/* Area Under Curve */}
              {pathD && (
                <path
                  d={`${pathD} L 290 110 L 10 110 Z`}
                  fill="url(#visits-gradient)"
                  opacity="0.15"
                />
              )}

              <defs>
                <linearGradient id="visits-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={Z.blue} />
                  <stop offset="100%" stopColor={Z.blue} stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Line path */}
              {pathD && (
                <path
                  d={pathD}
                  fill="none"
                  stroke={Z.blue}
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              )}

              {/* Glowing Dots */}
              {weekChart.map((w, i) => {
                const x = 10 + (i * stepX);
                const y = 110 - ((w.appointments / maxVisits) * 90);
                return (
                  <circle key={i} cx={x} cy={y} r="4" fill="white" stroke={Z.blue} strokeWidth="2" />
                )
              })}
            </svg>
          </div>
          
          <div className="flex justify-between text-[10px] font-bold mt-3 px-1" style={{ color: Z.text }}>
            {weekChart.map((w, i) => <span key={i}>{w.date.split(' ')[0]}</span>)}
          </div>
        </div>

        {/* Chart 2: Revenue Breakdown */}
        <div className="bg-white rounded-2xl p-5 zoho-card border flex flex-col justify-between" style={{ borderColor: '#F0F4F8' }}>
          <div>
            <h3 className="font-bold text-sm" style={{ color: Z.navy }}>Monthly Revenue</h3>
            <p className="text-[10.5px] mt-0.5" style={{ color: Z.text }}>Earnings collected in ₹</p>
          </div>

          <div className="h-48 w-full mt-4 flex items-end justify-between relative px-2">
            <div className="absolute inset-x-0 top-0 border-t" style={{ borderColor: '#F0F4F8' }}></div>
            <div className="absolute inset-x-0 top-1/4 border-t" style={{ borderColor: '#F0F4F8' }}></div>
            <div className="absolute inset-x-0 top-2/4 border-t" style={{ borderColor: '#F0F4F8' }}></div>
            <div className="absolute inset-x-0 top-3/4 border-t" style={{ borderColor: '#F0F4F8' }}></div>
            
            {/* Bar elements */}
            {revChart.map((m, i) => {
              const h = Math.max((m.revenue / maxRev) * 140, 5); // 140px max height
              const isLast = i === revChart.length - 1;
              return (
                <div key={i} className="flex flex-col items-center gap-1.5 w-10 relative z-10">
                  <span className="text-[10px] font-bold" style={{ color: isLast ? Z.navy : Z.text }}>
                    {m.revenue > 1000 ? (m.revenue / 1000).toFixed(1) + 'k' : m.revenue}
                  </span>
                  <div className="w-6 rounded-t-md transition-all shadow-sm" style={{ height: `${h}px`, background: isLast ? Z.green : Z.greenL }}></div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between text-[10px] font-bold mt-3 px-1" style={{ color: Z.text }}>
            {revChart.map((m, i) => <span key={i} style={{ width: '40px', textAlign: 'center' }}>{m.month}</span>)}
          </div>
        </div>

      </div>

      {/* Row 3: Diagnosis Doughnut Breakdown & Top Ailments List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Document Doughnut Chart */}
        <div className="bg-white rounded-2xl p-5 zoho-card border md:col-span-1 flex flex-col justify-between" style={{ borderColor: '#F0F4F8' }}>
          <div>
            <h3 className="font-bold text-sm" style={{ color: Z.navy }}>Document Profile</h3>
            <p className="text-[10.5px] mt-0.5" style={{ color: Z.text }}>Breakdown of clinical uploads</p>
          </div>

          {pieSegments.length > 0 ? (
            <>
              <div className="flex items-center justify-center py-6">
                <div className="relative w-28 h-28">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 90 90">
                    <circle cx="45" cy="45" r={radius} fill="transparent" stroke="#F8FAFC" strokeWidth="8" />
                    
                    {pieSegments.map((diag, index) => {
                      const strokeDash = (diag.percentage / 100) * circumference;
                      
                      let prevPercentSum = 0;
                      for (let i = 0; i < index; i++) prevPercentSum += pieSegments[i].percentage;
                      
                      const startOffset = circumference - (prevPercentSum / 100) * circumference;

                      return (
                        <circle
                          key={diag.name}
                          cx="45"
                          cy="45"
                          r={radius}
                          fill="transparent"
                          stroke={diag.color}
                          strokeWidth="8"
                          strokeDasharray={`${strokeDash} ${circumference}`}
                          strokeDashoffset={startOffset}
                          strokeLinecap="round"
                        />
                      );
                    })}
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xs font-bold uppercase leading-none" style={{ color: Z.text }}>Top Doc</span>
                    <span className="text-base font-bold mt-1 leading-none" style={{ color: Z.navy }}>{pieSegments[0].percentage}%</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 text-[11px] font-bold px-2" style={{ color: Z.text }}>
                {pieSegments.map(diag => (
                  <div key={diag.name} className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: diag.color }}></span>
                      <span>{diag.name}</span>
                    </div>
                    <span style={{ color: Z.navy }}>{diag.percentage}%</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
             <div className="flex-1 flex items-center justify-center text-sm" style={{ color: Z.text }}>No documents yet</div>
          )}
        </div>

        {/* Clinical Breakdown List */}
        <div className="bg-white rounded-2xl p-5 zoho-card border md:col-span-2 flex flex-col justify-between" style={{ borderColor: '#F0F4F8' }}>
          <div>
            <h3 className="font-bold text-sm" style={{ color: Z.navy }}>Patient Demographics</h3>
            <p className="text-[10.5px] mt-0.5" style={{ color: Z.text }}>Age and gender distribution of registered patients</p>
          </div>

          <div className="divide-y flex-grow mt-4" style={{ borderColor: '#F8FAFC' }}>
            <div className="flex justify-between items-center py-2 text-[10px] font-bold uppercase tracking-wider" style={{ color: Z.text }}>
              <span>Category</span>
              <div className="flex gap-16">
                <span className="w-16 text-right">Count</span>
                <span className="w-16 text-right">% Share</span>
              </div>
            </div>
            
            {[
               { label: 'Male Patients', count: s?.genderSplit?.male || 0 },
               { label: 'Female Patients', count: s?.genderSplit?.female || 0 },
               { label: 'Adults (18-60 yrs)', count: s?.ageGroups?.adults || 0 },
               { label: 'Children (<18 yrs)', count: s?.ageGroups?.children || 0 },
               { label: 'Seniors (60+ yrs)', count: s?.ageGroups?.senior || 0 },
            ].map(row => {
              const total = s?.totalPatients || 1;
              const percent = Math.round((row.count / total) * 100);
              return (
                <div key={row.label} className="flex justify-between items-center py-3 text-xs">
                  <span className="font-bold" style={{ color: Z.navy }}>{row.label}</span>
                  <div className="flex gap-16 font-bold" style={{ color: Z.text }}>
                    <span className="w-16 text-right">{row.count}</span>
                    <span className="w-16 text-right">{percent}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
};

export default ReportsAnalytics;
