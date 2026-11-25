export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 space-y-5">
      <h1 className="text-3xl font-bold text-slate-900">Terms & Conditions</h1>
      <ul className="list-disc pl-5 space-y-2 text-sm text-slate-700 leading-relaxed">
        <li>All donations and handovers occur directly between donor and recipient.</li>
        <li>The platform does not act as a financial intermediary, escrow, or payment processor.</li>
        <li>Medicine posts must strictly comply with local laws and safety guidelines (sealed, non-expired, no controlled substances).</li>
        <li>Fraudulent posts, harassment, or attempts to solicit sensitive financial credentials (PIN, OTP, CVV) result in immediate account suspension.</li>
      </ul>
    </div>
  );
}
