import React, { useState, useEffect } from "react";
import { db } from "../../firebase"; // Adjust path based on your folders
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { CheckCircle2, AlertCircle, Loader2, Clock } from "lucide-react";

export default function OrdersSection({ userId }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // 1. Check if the component received the userId prop
    if (!userId) {
      setError(
        "No User ID found. Please check if the user is logged in correctly.",
      );
      setLoading(false);
      return;
    }

    setError("");
    setLoading(true);

    let unsubscribe = () => {};

    try {
      const ordersRef = collection(db, "echoagent-orders");

      // 2. Build the query parameters
      const q = query(
        ordersRef,
        where("userId", "==", userId),
        orderBy("createdAt", "desc"),
      );

      // 3. Start the real-time stream listener
      unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          // If the query works but there are no documents found
          if (snapshot.empty) {
            setOrders([]);
            setLoading(false);
            return;
          }

          const ordersList = snapshot.docs.map((doc) => {
            const data = doc.data();

            // Format the date object cleanly
            let formattedDate = "Just now";
            if (data.createdAt) {
              const dateObj = data.createdAt.toDate();
              formattedDate =
                dateObj.toLocaleDateString() +
                " " +
                dateObj.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                });
            }

            return {
              id: doc.id,
              ...data,
              dateString: formattedDate,
            };
          });

          setOrders(ordersList);
          setLoading(false);
        },
        (err) => {
          // 4. Catch common Firestore execution blocks explicitly
          console.error("CRITICAL FIRESTORE ERROR LOG:", err);

          if (err.code === "permission-denied") {
            setError(
              "Database Security Rules blocked this request. Check your Firestore Security Rules.",
            );
          } else if (err.code === "failed-precondition") {
            setError(
              "This query requires a Missing Composite Index. Open your browser console (F12) and click the link to build it.",
            );
          } else {
            setError(`Database error: ${err.message}`);
          }
          setLoading(false);
        },
      );
    } catch (err) {
      console.error("Setup error:", err);
      setError(`Setup failed: ${err.message}`);
      setLoading(false);
    }

    // Clean up listener when screen changes
    return () => unsubscribe();
  }, [userId]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Order History Ledger</h2>
        <p className="text-sm text-slate-400 mt-1">
          Track all data bundle packages processed through your profile account.
        </p>
      </div>

      {/* Visible Error Banner Box */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-mono rounded-xl flex items-start gap-2">
          <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
          <div>
            <div className="font-bold uppercase tracking-wider text-xs">
              Query Failed
            </div>
            <div className="mt-1 text-xs opacity-90">{error}</div>
          </div>
        </div>
      )}

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-400">
            <thead className="bg-slate-950 text-xs font-mono uppercase tracking-wider text-slate-500 border-b border-slate-800">
              <tr>
                <th className="p-4">Order ID</th>
                <th className="p-4">Time</th>
                <th className="p-4">Network</th>
                <th className="p-4">Phone Number</th>
                <th className="p-4">Package Size</th>
                <th className="p-4">Price Charged</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {loading ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-500">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-emerald-400" />
                      Loading your orders...
                    </div>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="p-8 text-center text-slate-500 font-mono text-xs"
                  >
                    No orders found in the "echoagent-orders" collection
                    matching your User ID.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-slate-800/10 transition-colors"
                  >
                    <td className="p-4 font-mono font-bold text-slate-300">
                      {order.orderId || order.id}
                    </td>
                    <td className="p-4 text-xs font-mono text-slate-400">
                      {order.dateString}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${
                          order.network === "MTN"
                            ? "bg-yellow-500/10 text-yellow-500"
                            : order.network === "Telecel"
                              ? "bg-red-500/10 text-red-500"
                              : "bg-cyan-500/10 text-cyan-400"
                        }`}
                      >
                        {order.network}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-xs text-slate-300">
                      {order.phoneNumber || order.recipientPhone}
                    </td>
                    <td className="p-4 font-bold text-slate-300">
                      {order.size}
                    </td>
                    <td className="p-4 font-mono text-emerald-400 font-semibold">
                      GHS {parseFloat(order.costCharged || 0).toFixed(2)}
                    </td>
                    <td className="p-4">
                      {order.status === "success" ||
                      order.status === "completed" ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10">
                          <CheckCircle2 className="h-3 w-3" /> Fulfilled
                        </span>
                      ) : order.status === "failed" ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-400 bg-red-500/5 px-2 py-0.5 rounded border border-red-500/10">
                          <AlertCircle className="h-3 w-3" /> Failed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-500/5 px-2 py-0.5 rounded border border-amber-500/10">
                          <Clock className="h-3 w-3" /> Pending
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
