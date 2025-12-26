import type {
  IGetPaymentResponse,
  IGetLatestPayment,
} from "@/types/paymentType";
import api from "./axios";

export const getAllPayments = async () => {
  const token = localStorage.getItem("authToken");

  const res = await api.get<IGetPaymentResponse>("/payments", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
};

export const getLatestPaymentByInvoiceId = async (invoiceId: string) => {
  const token = localStorage.getItem("authToken");

  const res = await api.get<IGetLatestPayment>(`/payments/${invoiceId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
};
