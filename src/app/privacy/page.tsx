export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 space-y-5">
      <h1 className="text-3xl font-bold text-slate-900">Privacy Policy</h1>
      <p className="text-sm text-slate-700 leading-relaxed">
        We protect your personal contact details by default. Email addresses, phone numbers, and exact handover addresses are stored in access-controlled tables and are never exposed in public feeds or public API responses.
      </p>
      <p className="text-sm text-slate-700 leading-relaxed">
        Supporting documents and post images are stored in private storage buckets and accessed only through short-lived signed URLs for authorized participants.
      </p>
      <p className="text-sm text-slate-700 leading-relaxed">
        We never collect or store bank passwords, card numbers, CVV, PIN, or OTPs.
      </p>
    </div>
  );
}
