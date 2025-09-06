import React, { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

export default function PaystackCallback() {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const reference = searchParams.get("reference");

    if (!reference) {
      // Redirect to Netlify domain instead of internal route
      window.location.href = "https://face-fit-ke.netlify.app/";
      return;
    }

    const verifyPayment = async () => {
      try {
        const resp = await fetch(
          `https://face-fit.onrender.com/verify/${encodeURIComponent(reference)}`
        );
        const data = await resp.json();

        if (data?.data?.status === "success") {
          // Mark paid in sessionStorage
          sessionStorage.setItem("paystack_paid", "true");
          sessionStorage.setItem("paystack_reference", reference);

          // Redirect to Netlify domain
          window.location.href = "https://face-fit-ke.netlify.app/";
        } else {
          alert("❌ Payment verification failed.");
          window.location.href = "https://face-fit-ke.netlify.app/";
        }
      } catch (err) {
        console.error("Verification error:", err);
        alert("⚠️ Payment verification failed.");
        window.location.href = "https://face-fit-ke.netlify.app/";
      }
    };

    verifyPayment();
  }, [searchParams]); // Removed navigate from dependencies

  return (
    <div className="p-8 text-center">
      <h2 className="text-2xl font-semibold">Verifying payment...</h2>
      <p className="text-gray-600 mt-4">
        Please wait while we confirm your transaction.
      </p>
    </div>
  );
}