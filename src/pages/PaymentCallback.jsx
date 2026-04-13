import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

const API_BASE = import.meta.env.VITE_BASE_URL;

/**
 * Paystack redirects here after payment with ?reference=xxx&trxref=xxx
 * We verify with our backend, then push the user to /booking/confirmation
 */
const PaymentCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("verifying"); // verifying | success | failed
  const [message, setMessage] = useState("Verifying your payment…");

  useEffect(() => {
    const reference = searchParams.get("reference") || searchParams.get("trxref");

    if (!reference) {
      setStatus("failed");
      setMessage("No payment reference found. Please contact support.");
      return;
    }

    const verify = async () => {
      try {
        const token =
          localStorage.getItem("token") || sessionStorage.getItem("token");

        const res = await fetch(
          `${API_BASE}/bookings/verify?reference=${reference}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const data = await res.json();

        if (res.ok && data.success) {
          // Store confirmed booking for the confirmation page
          sessionStorage.setItem(
            "confirmedBooking",
            JSON.stringify(data.data)
          );
          setStatus("success");
          setMessage("Payment confirmed! Redirecting…");

          setTimeout(() => navigate("/booking/confirmation"), 1500);
        } else {
          setStatus("failed");
          setMessage(data.message || "Payment verification failed.");
        }
      } catch (err) {
        console.error(err);
        setStatus("failed");
        setMessage("Something went wrong while verifying your payment.");
      }
    };

    verify();
  }, [navigate, searchParams]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-10 max-w-md w-full text-center">
        {status === "verifying" && (
          <>
            <Loader2 className="w-14 h-14 text-blue-600 animate-spin mx-auto mb-5" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Processing Payment
            </h2>
            <p className="text-gray-500 text-sm">{message}</p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle className="w-14 h-14 text-green-500 mx-auto mb-5" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Payment Successful!
            </h2>
            <p className="text-gray-500 text-sm">{message}</p>
          </>
        )}

        {status === "failed" && (
          <>
            <XCircle className="w-14 h-14 text-red-500 mx-auto mb-5" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Payment Failed
            </h2>
            <p className="text-gray-500 text-sm mb-6">{message}</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => navigate("/flight")}
                className="px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                New Search
              </button>
              <button
                onClick={() => navigate(-1)}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentCallback;