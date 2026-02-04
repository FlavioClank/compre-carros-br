import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface BillingRecord {
  id: string;
  billing_day: number;
}

interface Payment {
  billing_id: string;
  reference_month: number;
  reference_year: number;
}

export function usePendingBillings() {
  const [pendingCount, setPendingCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchPendingBillings() {
      try {
        const [billingsRes, paymentsRes] = await Promise.all([
          supabase.from("ad_billing").select("id, billing_day"),
          supabase.from("ad_billing_payments").select("billing_id, reference_month, reference_year"),
        ]);

        if (billingsRes.error || paymentsRes.error) {
          console.error("Error fetching billing data");
          setIsLoading(false);
          return;
        }

        const billings: BillingRecord[] = billingsRes.data || [];
        const payments: Payment[] = paymentsRes.data || [];

        const today = new Date();
        const currentMonth = today.getMonth() + 1;
        const currentYear = today.getFullYear();
        const currentDay = today.getDate();

        // Count pending (past due date, not paid this month)
        let count = 0;
        for (const billing of billings) {
          const isPastDue = currentDay >= billing.billing_day;
          const isPaidThisMonth = payments.some(
            (p) =>
              p.billing_id === billing.id &&
              p.reference_month === currentMonth &&
              p.reference_year === currentYear
          );

          if (isPastDue && !isPaidThisMonth) {
            count++;
          }
        }

        setPendingCount(count);
      } catch (error) {
        console.error("Error checking pending billings:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchPendingBillings();
  }, []);

  return { pendingCount, isLoading };
}
