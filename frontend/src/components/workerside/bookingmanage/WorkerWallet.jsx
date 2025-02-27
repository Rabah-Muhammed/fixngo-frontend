import { useEffect, useState } from "react";
import axios from "axios";
import { FaWallet, FaHistory } from "react-icons/fa";
import WorkerLayout from "../workerauth/WorkerLayout";

const BASE_URL = "http://localhost:8000";

const WorkerWallet = () => {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);  // ✅ Default empty array
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWalletData = async () => {
      const token = localStorage.getItem("workerAccessToken");  
      if (!token) return;

      try {
        const response = await axios.get(`${BASE_URL}/api/worker-wallet/`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setBalance(response.data.balance);
        setTransactions(response.data.transactions || []);  // ✅ Ensure transactions is always an array
      } catch (error) {
        console.error("Error fetching wallet data:", error);
        setError("Failed to load wallet data.");
      } finally {
        setLoading(false);
      }
    };

    fetchWalletData();
  }, []);

  return (
    <WorkerLayout>
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
        <FaWallet /> Worker Wallet
      </h2>

      {loading ? (
        <p className="text-gray-500 mt-4">Loading...</p>
      ) : error ? (
        <p className="text-red-500 mt-4">{error}</p>
      ) : (
        <>
          <p className="text-2xl font-semibold text-green-600 mt-4">
            Balance: ${balance.toFixed(2)}
          </p>

          {/* Transaction History */}
          <div className="mt-6">
            <h3 className="text-xl font-semibold text-gray-700 flex items-center gap-2">
              <FaHistory /> Transaction History
            </h3>

            {transactions.length === 0 ? (
              <p className="text-gray-500 mt-2">No transactions yet.</p>
            ) : (
              <ul className="mt-3 border-t border-gray-300 pt-3 space-y-3">
                {transactions.map((tx, index) => (
                  <li
                    key={index}
                    className="flex justify-between p-3 bg-gray-100 rounded-md shadow-sm"
                  >
                    <span className="text-gray-700">{tx.description}</span>
                    <span className="text-green-600 font-semibold">
                      +${tx.amount.toFixed(2)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
    </WorkerLayout>
  );
};

export default WorkerWallet;
