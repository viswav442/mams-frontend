import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { FiPlus, FiEdit, FiTrash2, FiEye } from "react-icons/fi";
import purchasesService from "../services/purchasesService";

const PurchasesPage = () => {
  const { user, token } = useContext(AuthContext);
  const [filters, setFilters] = useState({
    dateFrom: "2024-01-01",
    dateTo: "2024-01-31",
    baseId: user?.role === "base_commander" ? user.assigned_base_id : "all",
    assetType: "all",
  });
  const [bases, setBases] = useState([]);
  const [assetTypes, setAssetTypes] = useState([]);
  const [assets, setAssets] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    asset_id: "",
    quantity: "",
    cost: "",
    supplier: "",
    base_id: user?.role === "base_commander" ? user.assigned_base_id : "",
    source: user?.role === "admin" ? "admin" : user?.role,
    file: null,
  });
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState("");

  // Fetch reference data
  useEffect(() => {
    purchasesService.getBases().then((res) => setBases(res.data.bases));
    purchasesService
      .getAssetTypes(token)
      .then((res) => setAssetTypes(res.data.asset_types));
    purchasesService.getAssets(token).then((res) => setAssets(res.data.assets));
  }, [token]);

  // Fetch purchases
  useEffect(() => {
    setLoading(true);
    setError("");
    const params = {
      from_date: filters.dateFrom,
      to_date: filters.dateTo,
      base_id: filters.baseId !== "all" ? filters.baseId : undefined,
      asset_type_id:
        filters.assetType !== "all"
          ? assetTypes.find((t) => t.name === filters.assetType)?.id
          : undefined,
    };
    purchasesService
      .getPurchases(params, token)
      .then((res) => setPurchases(res.data.purchases))
      .catch(() => setError("Failed to load purchases."))
      .finally(() => setLoading(false));
  }, [filters, token, assetTypes]);

  // Summary calculations
  const totalValue = purchases.reduce(
    (sum, p) => sum + (Number(p.cost) || 0),
    0
  );
  const totalOrders = purchases.length;

  const handleFilterChange = (e) => {
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFormChange = (e) => {
    const { name, value, files } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleNewPurchase = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    setModalError("");
    try {
      const data = {
        base_id: form.base_id,
        asset_id: form.asset_id,
        quantity: form.quantity,
        source: form.source,
      };
      await purchasesService.createPurchase(data, token);
      setModalOpen(false);
      setForm({
        asset_id: "",
        quantity: "",
        cost: "",
        supplier: "",
        base_id: user?.role === "base_commander" ? user.assigned_base_id : "",
        source: user?.role === "admin" ? "admin" : user?.role,
        file: null,
      });
      // Refresh purchases
      const params = {
        from_date: filters.dateFrom,
        to_date: filters.dateTo,
        base_id: filters.baseId !== "all" ? filters.baseId : undefined,
        asset_type_id:
          filters.assetType !== "all"
            ? assetTypes.find((t) => t.name === filters.assetType)?.id
            : undefined,
      };
      const res = await purchasesService.getPurchases(params, token);
      setPurchases(res.data.purchases);
    } catch {
      setModalError("Failed to create purchase.");
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Purchases</h1>
          <p className="text-gray-500">
            Manage asset purchases and procurement
          </p>
        </div>
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-semibold flex items-center gap-2"
          onClick={() => setModalOpen(true)}
        >
          <FiPlus /> New Purchase
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow flex items-center gap-4">
          <div className="text-4xl text-green-500">$</div>
          <div>
            <p className="text-gray-500">Total Value</p>
            <p className="text-2xl font-bold">${totalValue.toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow flex items-center gap-4">
          <div className="text-4xl text-blue-500">
            <svg width="32" height="32" fill="none" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M3 6a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V6Zm3-1a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1H6Z"
              />
            </svg>
          </div>
          <div>
            <p className="text-gray-500">Total Orders</p>
            <p className="text-2xl font-bold">{totalOrders}</p>
          </div>
        </div>
      </div>

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
          name="assetType"
          value={filters.assetType}
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

      {/* Purchases Table */}
      <div className="bg-white rounded-lg shadow p-4">
        {loading ? (
          <div className="text-center py-8">Loading purchases...</div>
        ) : error ? (
          <div className="text-center text-red-500 py-8">{error}</div>
        ) : (
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-2 py-2 text-left">Asset</th>
                <th className="px-2 py-2 text-left">Quantity</th>
                {/* <th className="px-2 py-2 text-left">Cost</th> */}
                {/* <th className="px-2 py-2 text-left">Supplier</th> */}
                <th className="px-2 py-2 text-left">Base</th>
                <th className="px-2 py-2 text-left">Date</th>
                {/* <th className="px-2 py-2 text-left">Actions</th> */}
              </tr>
            </thead>
            <tbody>
              {purchases.map((p) => {
                const asset = assets.find((a) => a.id === p.asset_id);
                const base = bases.find((b) => b.id === p.base_id);
                return (
                  <tr key={p.id} className="border-b last:border-0">
                    <td className="px-2 py-2">
                      <div className="font-semibold">
                        {asset ? asset.name : p.asset_id}
                      </div>
                      <div className="text-xs text-gray-400">
                        {asset ? asset.asset_type_name : ""}
                      </div>
                    </td>
                    <td className="px-2 py-2">{p.quantity}</td>
                    {/* <td className="px-2 py-2">
                      {p.cost ? `$${Number(p.cost).toLocaleString()}` : "-"}
                    </td>
                    <td className="px-2 py-2">{p.supplier || "-"}</td> */}
                    <td className="px-2 py-2">
                      {base ? base.name : p.base_id}
                    </td>
                    <td className="px-2 py-2">
                      {new Date(p.date).toLocaleDateString()}
                    </td>
                    {/* <td className="px-2 py-2 flex gap-2">
                      <button
                        className="text-blue-500 hover:underline"
                        title="View"
                      >
                        <FiEye />
                      </button>
                      <button
                        className="text-green-500 hover:underline"
                        title="Edit"
                      >
                        <FiEdit />
                      </button>
                      <button
                        className="text-red-500 hover:underline"
                        title="Delete"
                      >
                        <FiTrash2 />
                      </button>
                    </td> */}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* New Purchase Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl"
              onClick={() => setModalOpen(false)}
            >
              &times;
            </button>
            <h2 className="text-xl font-bold mb-4">New Purchase</h2>
            <form onSubmit={handleNewPurchase} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Asset</label>
                <select
                  name="asset_id"
                  value={form.asset_id}
                  onChange={handleFormChange}
                  required
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Select Asset</option>
                  {assets.map((asset) => (
                    <option key={asset.id} value={asset.id}>
                      {asset.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Quantity
                </label>
                <input
                  type="number"
                  name="quantity"
                  value={form.quantity}
                  onChange={handleFormChange}
                  required
                  className="w-full p-2 border rounded-md"
                />
              </div>
              {user?.role === "admin" && (
                <div>
                  <label className="block text-sm font-medium mb-1">Base</label>
                  <select
                    name="base_id"
                    value={form.base_id}
                    onChange={handleFormChange}
                    required
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="">Select Base</option>
                    {bases.map((base) => (
                      <option key={base.id} value={base.id}>
                        {base.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              {modalError && (
                <div className="text-red-500 text-sm">{modalError}</div>
              )}
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md font-semibold"
                disabled={modalLoading}
              >
                {modalLoading ? "Creating..." : "Create Purchase"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchasesPage;
