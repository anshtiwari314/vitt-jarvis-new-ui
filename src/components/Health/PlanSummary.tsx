interface PlanItem {
  name: string;
  price: number;
}

interface PlanSummaryProps {
  title?: string;
  items: PlanItem[];
}

export default function PlanSummary({
  title = "Final Plan Summary",
  items,
}: PlanSummaryProps) {
  const total = items.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-slate-200">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        <div className="space-y-4">
          {items.map((item, idx) => (
            <div
              key={idx}
              className="flex justify-between items-center"
            >
              <span className="text-slate-600">{item.name}</span>
              <span className="font-semibold">₹ {item.price.toLocaleString()}</span>
            </div>
          ))}

          <div className="border-t border-slate-200 my-2"></div>

          <div className="flex justify-between items-center text-lg">
            <span className="font-bold text-slate-800">
              Total Annual Premium
            </span>
            <span className="font-bold text-indigo-600">
              ₹ {total.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
