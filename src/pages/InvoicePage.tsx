import React, { useEffect, useState } from "react";
import type { INVOICE } from "@/types/invoiceType";
import { companyLogos } from "@/assets/companyLogos";
import type { IPayment } from "@/types/paymentType";
import { getLatestPaymentByInvoiceId } from "@/api/payments";
/* ===============================
   Utils
================================ */

const formatCurrency = (amount: number): string =>
  `₹ ${Number(amount).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const formatDate = (iso: string) => iso.split("T")[0];
const formatTime = (iso: string) => iso.split("T")[1].slice(0, 5);

/* ===============================
   Props
================================ */

interface InvoiceProps {
  invoice: INVOICE;
}

/* ===============================
   Invoice Component
================================ */

const InvoicePage: React.FC<InvoiceProps> = ({ invoice }) => {
  const {
    _id,
    createdAt,
    company,
    customer,
    items,
    charges,
    gst,
    itemsTotal,
    subTotal,
    totalAmount,
    advance,
    remainingAmount,
    payment,
  } = invoice;

  /* ===============================
     ACTION HANDLERS
  ================================ */
  const [latestPayment, setLatestPayment] = useState<IPayment | null>(null);

  useEffect(() => {
    if (!_id) return;

    getLatestPaymentByInvoiceId(_id)
      .then((res) => {
        if (res.success) {
          setLatestPayment(res.data);
        }
      })
      .catch(() => {
        setLatestPayment(null);
      });
  }, [_id]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      {/* ================= PRINT FIXES ================= */}
      <style>
        {`
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          @media print {
            body {
              background: white !important;
            }

            .invoice {
              border: none !important;
              box-shadow: none !important;
            }

            table {
              border-collapse: collapse !important;
            }

            th, td {
              border: 1px solid #000 !important;
            }

            .action-buttons {
              display: none !important;
            }
          }
        `}
      </style>

      <div style={styles.wrapper}>
        <div className="invoice" style={styles.invoice}>
          {/* HEADER */}
          <div style={styles.row}>
            <div style={styles.company}>
              <img
                src={
                  companyLogos[company.name as string] ||
                  "/assets/default-logo.png"
                }
                alt="Company Logo"
                style={styles.logo}
              />

              <div>
                <strong>{company.name}</strong>
                <div>{company.address}</div>
                <div>Phone: {company.phone}</div>
                <div>Email: {company.email}</div>
              </div>
            </div>

            <div style={styles.invoiceTitle}>
              <h2 style={styles.heading}>TAX INVOICE</h2>
              <div>Invoice No: {_id}</div>
              <div>Date: {formatDate(createdAt)}</div>
              <div>Time: {formatTime(createdAt)}</div>
            </div>
          </div>

          {/* BILL TO */}
          <div style={styles.box}>
            <strong>BILL TO:</strong>
            <br />
            Name: {customer.name}
            <br />
            Address: {customer.address}
            <br />
            Phone: {customer.phone}
            {customer.PAN && <> | PAN: {customer.PAN}</>}
            {customer.GSTIN && <> | GSTIN: {customer.GSTIN}</>}
          </div>

          {/* ITEMS TABLE */}
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Description</th>
                <th style={styles.th}>Floor/Project Name</th>
                <th style={styles.th}>HSN Code</th>
                <th style={{ ...styles.th, textAlign: "right" }}>Area</th>
                <th style={{ ...styles.th, textAlign: "right" }}>Rate (₹)</th>
                <th style={{ ...styles.th, textAlign: "right" }}>Amount (₹)</th>
              </tr>
            </thead>

            <tbody>
              {items.map((item, idx) => {
                const amount = item.rate * item.areaSqFt;

                return (
                  <tr key={idx}>
                    <td style={styles.td}>{item.description}</td>
                    <td style={styles.td}>{item.projectName}</td>
                    <td style={styles.td}>{item.hashingCode}</td>
                    <td style={{ ...styles.td, textAlign: "right" }}>
                      {item.areaSqFt.toLocaleString("en-IN")}
                    </td>
                    <td style={{ ...styles.td, textAlign: "right" }}>
                      {formatCurrency(item.rate)}
                    </td>
                    <td style={{ ...styles.td, textAlign: "right" }}>
                      {formatCurrency(amount)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* SUMMARY + LATEST PAYMENT */}
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div style={styles.lpayment}>
              <strong>Latest Advance</strong>
              <br />
              <span
                style={{ color: "#2e7d32", fontWeight: "bold", fontSize: 13 }}
              >
                {formatCurrency(latestPayment?.amount || 0)}
              </span>
            </div>
            <div style={styles.summary}>
              <Row label="Items Total" value={itemsTotal} />
              {charges.parking > 0 && (
                <Row label="Parking" value={charges.parking} />
              )}
              {charges.amenities > 0 && (
                <Row label="Amenities" value={charges.amenities} />
              )}
              {charges.otherCharges > 0 && (
                <Row label="Other" value={charges.otherCharges} />
              )}
              <Row label="Sub Total" value={subTotal} />
              <Row label={`GST ${gst.percentage}%`} value={gst.amount} />

              <div style={styles.total}>
                <span>GRAND TOTAL</span>
                <span>{formatCurrency(totalAmount)}</span>
              </div>

              {advance > 0 && <Row label="Advance Amount" value={advance} />}

              <div style={styles.boldRow}>
                <span>TOTAL DUE AMOUNT</span>
                <span style={{ color: "#d32f2f", fontWeight: "bold" }}>
                  {formatCurrency(remainingAmount)}
                </span>
              </div>
            </div>
          </div>

          {/* PAYMENT */}
          <div style={styles.payment}>
            <strong>Payment:</strong> {payment.mode}
          </div>

          {/* FOOTER */}
          <div style={styles.footer}>
            <div>
              <strong>Terms & Condition</strong>
              <ul style={styles.terms}>
                <li>1. All disputes subjected to Kolkata jurisdiction only.</li>
                <li>2. Cheques to be drawn in favour of "{company.name}".</li>
                <li>
                  3. This Invoice is valid only with stamp and Accountant
                  signature in case of check payment.
                </li>
                <li>4. GST applicable</li>
              </ul>
            </div>
          </div>

          {/* SIGNATURE */}
          <div style={styles.signature}>
            For {company.name}
            <div style={styles.signLine}></div>
            Authorized Signatory
          </div>
        </div>

        {/* ================= ACTION BUTTONS ================= */}
        <div className="action-buttons" style={styles.actions}>
          <button onClick={handlePrint} style={styles.printBtn}>
            Print / Download
          </button>
        </div>
      </div>
    </>
  );
};

export default InvoicePage;

/* ===============================
   Helper Row
================================ */

interface RowProps {
  label: string;
  value: number;
}

const Row: React.FC<RowProps> = ({ label, value }) => (
  <div style={styles.rowItem}>
    <span>{label}</span>
    <span>{formatCurrency(value)}</span>
  </div>
);

/* ===============================
   STYLES
================================ */

const styles: { [key: string]: React.CSSProperties } = {
  wrapper: { background: "#fff", padding: 14 },

  invoice: {
    maxWidth: 880,
    margin: "auto",
    padding: 20,
    fontSize: 11.5,
    lineHeight: 1.3,
    color: "#000",

    /* TEMPORARY PREVIEW BORDER */
    border: "1.5px dashed #999",
  },

  row: { display: "flex", justifyContent: "space-between" },
  company: { display: "flex", gap: 12, fontSize: 13 },
  logo: { width: 60 },

  invoiceTitle: { textAlign: "right", fontSize: 13 },
  heading: { margin: 0, fontSize: 15 },

  box: { padding: 8, marginTop: 10, fontSize: 11.5 },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: 12,
    fontSize: 11.5,
  },

  th: {
    background: "#2c3e50",
    color: "#fff",
    padding: "6px 7px",
    border: "1px solid #000",
    fontSize: 11,
  },

  td: {
    padding: "6px 7px",
    border: "1px solid #000",
  },

  summary: {
    width: "40%",
    marginLeft: "auto",
    marginTop: 8,
    fontSize: 13,
  },
  lpayment: {
    width: "40%",
    paddingTop: 20,
    marginRight: "auto",
    fontSize: 13,
  },

  rowItem: {
    display: "flex",
    justifyContent: "space-between",
    padding: "2px 0",
  },

  total: {
    background: "#2c3e50",
    color: "#fff",
    padding: "5px 7px",
    margin: "5px 0",
    fontWeight: "bold",
    fontSize: 12,
    display: "flex",
    justifyContent: "space-between",
  },

  boldRow: {
    display: "flex",
    justifyContent: "space-between",
    fontWeight: "bold",
  },

  payment: { marginTop: 8, fontSize: 11.5 },

  footer: {
    display: "flex",
    gap: 24,
    marginTop: 18,
    fontSize: 11,
  },

  terms: { margin: 0, paddingLeft: 14 },

  signature: {
    marginTop: 30,
    textAlign: "right",
    fontSize: 11.5,
  },

  signLine: {
    width: 150,
    borderTop: "1px solid #000",
    marginLeft: "auto",
    marginTop: 18,
  },

  actions: {
    maxWidth: 880,
    margin: "16px auto",
    display: "flex",
    justifyContent: "flex-end",
    gap: 12,
  },

  whatsappBtn: {
    background: "#25D366",
    color: "#fff",
    border: "none",
    padding: "8px 14px",
    cursor: "pointer",
    fontSize: 13,
  },

  printBtn: {
    background: "#2c3e50",
    color: "#fff",
    border: "none",
    padding: "8px 14px",
    cursor: "pointer",
    fontSize: 13,
  },
};
