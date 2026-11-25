export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 space-y-6">
      <h1 className="text-3xl font-bold text-slate-900">About Sahayata</h1>
      <p className="text-slate-700 leading-relaxed">
        Sahayata is a universal direct donation and community-support platform designed to connect people who want to help with neighbors who need support.
      </p>
      <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Our Core Principles</h2>
        <ul className="list-disc pl-5 space-y-2 text-sm text-slate-700">
          <li><strong>Zero Middlemen:</strong> Physical items are handed over directly between donor and recipient.</li>
          <li><strong>No Platform Custody:</strong> We never hold, collect, or process money, and never integrate payment gateways.</li>
          <li><strong>Two-Party Confirmation:</strong> Monetary pledges are only marked confirmed when both donor and recipient verify the direct transfer.</li>
          <li><strong>Privacy by Default:</strong> Phone numbers, emails, and exact addresses are hidden from public listings.</li>
        </ul>
      </div>
    </div>
  );
}
