"use client";

interface Invoice {
  id: string;
  amount: string;
  date: string;
  status: "Paid" | "Pending" | "Overdue";
}

const invoices: Invoice[] = [
  { id: "inv_123456", amount: "$99.00", date: "Oct 01, 2023", status: "Paid" },
  { id: "inv_123457", amount: "$199.00", date: "Nov 01, 2023", status: "Paid" },
  {
    id: "inv_123458",
    amount: "$99.00",
    date: "Dec 01, 2023",
    status: "Pending",
  },
];

export default function BillingSection() {
  return (
    <div className="bg-background-secondry border border-white/10 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold mb-1">Billing & Invoices</h2>
          <p className="text-text-secondry text-sm">
            Manage your billing information and view invoices
          </p>
        </div>
        <button className="px-4 py-2 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-lg hover:bg-purple-500/20 transition-colors text-sm">
          Manage Payment Methods
        </button>
      </div>

      {/* Credit Card Preview */}
      <div className="flex items-center gap-4 mb-8 p-4 bg-linear-to-r from-blue-500/10 to-transparent border border-blue-500/20 rounded-lg max-w-md">
        <div className="w-12 h-8 bg-blue-500 rounded flex items-center justify-center text-white font-bold text-xs">
          VISA
        </div>
        <div>
          <p className="font-mono text-sm">•••• •••• •••• 4242</p>
          <p className="text-xs text-text-secondry">Expires 12/28</p>
        </div>
        <span className="ml-auto px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded">
          Default
        </span>
      </div>

      {/* Invoices List */}
      <h3 className="font-semibold mb-4">Recent Invoices</h3>
      <div className="space-y-2">
        {invoices.map((invoice) => (
          <div
            key={invoice.id}
            className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors border border-transparent hover:border-white/5"
          >
            <div className="flex items-center gap-4">
              <div className="p-2 bg-white/5 rounded-lg">📄</div>
              <div>
                <p className="font-medium">{invoice.amount}</p>
                <p className="text-xs text-text-secondry">
                  {invoice.id} • {invoice.date}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span
                className={`text-xs px-2 py-1 rounded-full ${
                  invoice.status === "Paid"
                    ? "bg-green-500/10 text-green-400"
                    : invoice.status === "Pending"
                      ? "bg-yellow-500/10 text-yellow-400"
                      : "bg-red-500/10 text-red-400"
                }`}
              >
                {invoice.status}
              </span>
              <button className="text-text-secondry hover:text-white transition-colors">
                ⬇
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
