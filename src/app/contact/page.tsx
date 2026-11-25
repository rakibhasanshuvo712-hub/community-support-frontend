export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 space-y-6">
      <h1 className="text-3xl font-bold text-slate-900">Contact & Safety Support</h1>
      <p className="text-slate-700">
        Need help or want to report suspicious activity? Use the in-app Report button on any post or profile, or reach out to our moderation team.
      </p>
      <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-2 text-sm text-slate-700">
        <p><strong>Safety Reminder:</strong> Our team will never ask for your password, OTP, PIN, CVV, or bank credentials.</p>
        <p><strong>Moderation Response:</strong> Reports are reviewed in order of urgency, with critical safety reports prioritized.</p>
      </div>
    </div>
  );
}
