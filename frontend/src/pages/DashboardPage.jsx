import { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import Loader from '../components/Loader';
import { fetchOrganizerAnalytics } from '../services/bookingService';
import { formatCurrency } from '../utils/formatDate';
import '../styles/DashboardPage.css';

function DashboardPage() {
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await fetchOrganizerAnalytics();
        setAnalytics(data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load analytics');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  if (isLoading) return <Loader label="Crunching your numbers..." />;
  if (error) return <div className="alert alert-error">{error}</div>;

  const { summary, totalEvents, revenueOverTime, ticketTypeBreakdown } = analytics;

  return (
    <div className="page-wrapper container">
      <h1>Organizer Dashboard</h1>

      <div className="dashboard-summary-grid">
        <div className="card summary-card">
          <span className="summary-label">Total Events</span>
          <span className="summary-value">{totalEvents}</span>
        </div>
        <div className="card summary-card">
          <span className="summary-label">Tickets Sold</span>
          <span className="summary-value">{summary.totalTicketsSold}</span>
        </div>
        <div className="card summary-card">
          <span className="summary-label">Total Bookings</span>
          <span className="summary-value">{summary.totalBookings}</span>
        </div>
        <div className="card summary-card highlight">
          <span className="summary-label">Total Revenue</span>
          <span className="summary-value">{formatCurrency(summary.totalRevenue)}</span>
        </div>
      </div>

      <div className="dashboard-charts-grid">
        <div className="card chart-card">
          <h3>Revenue over time</h3>
          {revenueOverTime.length === 0 ? (
            <p className="empty-state">No confirmed sales yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={revenueOverTime}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="_id" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Line type="monotone" dataKey="revenue" stroke="#6d28d9" strokeWidth={2.5} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card chart-card">
          <h3>Sales by ticket type</h3>
          {ticketTypeBreakdown.length === 0 ? (
            <p className="empty-state">No confirmed sales yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={ticketTypeBreakdown}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="_id" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Bar dataKey="totalSold" fill="#f59e0b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
