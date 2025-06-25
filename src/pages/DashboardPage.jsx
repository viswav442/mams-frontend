import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
const API_BASE_URL = import.meta.env.VITE_API_URL;
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";

const COLORS = [
  "#6366F1",
  "#F59E42",
  "#10B981",
  "#EF4444",
  "#FBBF24",
  "#3B82F6",
  "#8B5CF6",
  "#F472B6",
];

const AssetDistributionChart = ({ filters, token }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    const params = new URLSearchParams({
      base_id: filters.baseId,
      from_date: filters.dateFrom,
      to_date: filters.dateTo,
    });
    axios
      .get(
        `${API_BASE_URL}/dashboard/asset-distribution?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      .then((res) => {
        setData(res.data.distribution || []);
      })
      .catch(() => setError("Failed to load asset distribution."))
      .finally(() => setLoading(false));
  }, [filters, token]);

  if (loading)
    return (
      <div className="bg-white p-6 rounded-lg shadow">Loading chart...</div>
    );
  if (error)
    return (
      <div className="bg-white p-6 rounded-lg shadow text-red-500">{error}</div>
    );
  if (!data.length)
    return <div className="bg-white p-6 rounded-lg shadow">No data</div>;

  const assetTypes = Array.from(
    new Set(data.flatMap((row) => Object.keys(row).filter((k) => k !== "base")))
  );

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="font-semibold mb-2">Asset Distribution by Type</h2>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={data}
            dataKey="total"
            nameKey="asset_type"
            cx="50%"
            cy="50%"
            outerRadius={80}
            label
          >
            {data.map((entry, idx) => (
              <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
            ))}
          </Pie>
          <RechartsTooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

const AssetsByBaseChart = ({ filters, token }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    const params = new URLSearchParams({
      assetTypeName: filters.assetTypeName,
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo,
      baseId: filters.baseId,
    });
    axios
      .get(`${API_BASE_URL}/dashboard/assets-by-base?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setData(res.data.by_base || []);
      })
      .catch(() => setError("Failed to load assets by base."))
      .finally(() => setLoading(false));
  }, [filters, token]);

  if (loading)
    return (
      <div className="bg-white p-6 rounded-lg shadow">Loading chart...</div>
    );
  if (error)
    return (
      <div className="bg-white p-6 rounded-lg shadow text-red-500">{error}</div>
    );
  if (!data.length)
    return <div className="bg-white p-6 rounded-lg shadow">No data</div>;

  const assetTypes = Array.from(
    new Set(data.flatMap((row) => Object.keys(row).filter((k) => k !== "base")))
  );

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="font-semibold mb-2">Assets by Base</h2>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart
          data={data}
          margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="base" />
          <YAxis allowDecimals={false} />
          <RechartsTooltip />
          <Legend />
          {assetTypes.map((type, idx) => (
            <Bar key={type} dataKey={type} fill={COLORS[idx % COLORS.length]} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

const RecentActivity = ({ filters, token }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    const params = new URLSearchParams({
      baseId: filters.baseId,
      limit: 10,
    });
    axios
      .get(`${API_BASE_URL}/dashboard/recent-activity?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setData(res.data.recent || []);
      })
      .catch(() => setError("Failed to load recent activity."))
      .finally(() => setLoading(false));
  }, [filters, token]);

  if (loading)
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        Loading recent activity...
      </div>
    );
  if (error)
    return (
      <div className="bg-white p-6 rounded-lg shadow text-red-500">{error}</div>
    );
  if (!data.length)
    return (
      <div className="bg-white p-6 rounded-lg shadow">No recent activity</div>
    );

  // console.log(data);

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="font-semibold mb-2">Recent Activity</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-2 py-1 text-left">Time</th>
              <th className="px-2 py-1 text-left">User</th>
              <th className="px-2 py-1 text-left">Action</th>
              {/* <th className="px-2 py-1 text-left">Table</th>
              <th className="px-2 py-1 text-left">Details</th> */}
            </tr>
          </thead>
          <tbody>
            {data.map((log) => (
              <tr key={log.id} className="border-b last:border-0">
                <td className="px-2 py-1 whitespace-nowrap">
                  {new Date(log.timestamp).toLocaleString()}
                </td>
                <td className="px-2 py-1 whitespace-nowrap">
                  {log.user_name.replace("User", "").trim()}
                </td>
                <td className="px-2 py-1 whitespace-nowrap">
                  {log.table_name.slice(0, log.table_name.length - 1)}
                </td>
                {/* <td className="px-2 py-1 whitespace-nowrap">
                  {log.table_name}
                </td> */}
                {/* <td
                  className="px-2 py-1 max-w-xs truncate"
                  title={
                    typeof log.details === "object"
                      ? JSON.stringify(log.details)
                      : log.details
                  }
                >
                  {typeof log.details === "object"
                    ? JSON.stringify(log.details)
                    : log.details}
                </td> */}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, change, positive, icon }) => (
  <div className="bg-white p-6 rounded-lg shadow-md flex items-center justify-between">
    <div>
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
      <div
        className={`text-xs flex items-center mt-1 ${
          positive ? "text-green-500" : "text-red-500"
        }`}
      >
        {change} vs last period
      </div>
    </div>
    <div className="text-4xl text-gray-300">{icon}</div>
  </div>
);

const GroupedStackedBarChart = ({ filters, token }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    const params = new URLSearchParams({
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo,
      baseId: filters.baseId,
    });
    axios
      .get(
        `${API_BASE_URL}/dashboard/by-base-type-value?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      .then((res) => {
        console.log(res.data);
        setData(res.data.by_base_type_value || []);
      })
      .catch(() => setError("Failed to load asset value by base/type."))
      .finally(() => setLoading(false));
  }, [filters, token]);

  if (loading)
    return (
      <div className="bg-white p-6 rounded-lg shadow">Loading chart...</div>
    );
  if (error)
    return (
      <div className="bg-white p-6 rounded-lg shadow text-red-500">{error}</div>
    );
  if (!data.length)
    return <div className="bg-white p-6 rounded-lg shadow">No data</div>;

  const assetTypes = Array.from(
    new Set(data.flatMap((row) => Object.keys(row).filter((k) => k !== "base")))
  );
  console.log(data);

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="font-semibold mb-2">Asset Value by Base & Type</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={data}
          margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="base" />
          <YAxis
            allowDecimals={false}
            tickFormatter={(value) =>
              value >= 1e6 ? `${value / 1e6}M` : value
            }
          />
          <RechartsTooltip formatter={(value) => `₹${value}`} />
          <Legend />
          {assetTypes.map((type, idx) => (
            <Bar
              key={type}
              dataKey={type}
              stackId="a" // For stacked; remove for grouped
              fill={COLORS[idx % COLORS.length]}
              name={type}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

const DashboardPage = () => {
  const { user, token } = useContext(AuthContext);
  const [filters, setFilters] = useState({
    dateFrom: "2024-01-01",
    dateTo: new Date().toISOString().split("T")[0],
    baseId: user?.role === "base_commander" ? user.base_id : "all",
    assetTypeName: "all",
  });

  // Data states
  const [bases, setBases] = useState([]);
  const [assetTypes, setAssetTypes] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // console.log(dashboardData);

  const API_URL = import.meta.env.VITE_API_URL;

  // Effect for fetching static filter data (bases, asset types)
  useEffect(() => {
    if (!user || !token) return;

    const fetchReferenceData = async () => {
      try {
        const promises = [
          axios.get(`${API_URL}/reference/asset-types`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ];

        if (user.role === "admin" || user.role === "logistics_officer") {
          promises.push(axios.get(`${API_URL}/reference/bases`));
        }

        const [assetTypesRes, basesRes] = await Promise.all(promises);

        setAssetTypes(assetTypesRes.data.asset_types || []);
        if (basesRes) {
          setBases(basesRes.data.bases || []);
        }
      } catch (err) {
        console.error("Failed to fetch reference data", err);
        setError("Could not load filter options.");
      }
    };

    fetchReferenceData();
  }, [user, token]);

  // Effect for fetching dashboard data based on filters
  useEffect(() => {
    if (!user || !token) return;

    const fetchDashboardData = async () => {
      setLoading(true);
      setError("");
      try {
        const params = new URLSearchParams(filters);
        const dashboardRes = await axios.get(
          `${API_URL}/dashboard?${params.toString()}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setDashboardData(dashboardRes.data);
      } catch (err) {
        setError("Failed to fetch dashboard data. Please try again.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [filters, user, token]);

  const handleFilterChange = (e) => {
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h1>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-lg shadow mb-6 flex flex-col lg:flex-row lg:items-center gap-3 lg:gap-4">
        <span className="font-semibold">Filters:</span>
        <input
          type="date"
          name="dateFrom"
          value={filters.dateFrom}
          onChange={handleFilterChange}
          className="p-2 border rounded-md w-full lg:w-auto"
        />
        <span>to</span>
        <input
          type="date"
          name="dateTo"
          value={filters.dateTo}
          onChange={handleFilterChange}
          className="p-2 border rounded-md w-full lg:w-auto"
        />

        {(user?.role === "admin" || user?.role === "logistics_officer") && (
          <select
            name="baseId"
            value={filters.baseId}
            onChange={handleFilterChange}
            className="p-2 border rounded-md w-full lg:w-auto"
          >
            <option value="all">All Bases</option>
            {bases.map((base) => (
              <option key={base.id} value={base.id}>
                {base.name}
              </option>
            ))}
          </select>
        )}

        <select
          name="assetTypeName"
          value={filters.assetTypeName}
          onChange={handleFilterChange}
          className="p-2 border rounded-md w-full lg:w-auto"
        >
          <option value="all">All Types</option>
          {assetTypes.map((type) => (
            <option key={type.id} value={type.name}>
              {type.name}
            </option>
          ))}
        </select>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {dashboardData && !loading && (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <StatCard
              title="Opening Balance"
              value={dashboardData.summary.opening_balance ?? 0}
              change="+5.2%"
              positive={true}
            />
            <StatCard
              title="Closing Balance"
              value={dashboardData.summary.closing_balance ?? 0}
              change="-2.1%"
              positive={false}
            />
            <StatCard
              title="Net Movement"
              value={dashboardData.summary.net_movement ?? 0}
              change="-8.3%"
              positive={false}
            />
            <StatCard
              title="Active Assignments"
              value={dashboardData.summary.total_assigned ?? 0}
              change="+12.5%"
              positive={true}
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
            <div className="lg:col-span-2">
              {/* <AssetDistributionChart filters={filters} token={token} /> */}
            </div>
            <div className="lg:col-span-3">
              {/* <AssetsByBaseChart filters={filters} token={token} /> */}
            </div>
          </div>

          {/* Grouped/Stacked Bar Chart for Asset Value by Base & Type */}
          <GroupedStackedBarChart
            filters={filters}
            token={token}
            assetTypes={assetTypes}
          />

          {/* Recent Activity */}
          <RecentActivity filters={filters} token={token} />
        </>
      )}
    </div>
  );
};

export default DashboardPage;
