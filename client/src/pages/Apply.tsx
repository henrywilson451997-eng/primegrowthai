import { useState } from "react";
import { Link } from "wouter";
import { useSEO } from "@/hooks/useSEO";
import { GHL_WEBHOOKS, sendGhlWebhookGet } from "@/lib/ghlWebhook";
import { trackMetaCustomEvent, trackMetaLead } from "@/lib/metaPixel";

const PAIN_POINTS = [
  "Timesheets / Time tracking",
  "Job costing / Cost tracking per project",
  "Lead follow-up / Missed opportunities",
  "Scheduling / Crew coordination",
  "Invoicing / Getting paid on time",
  "Blind margins / No real-time profit visibility",
  "Subcontractor coordination",
  "Quote-to-invoice gap / Delayed final invoicing",
];

const SOFTWARE_OPTIONS = [
  "CRM (e.g. HubSpot, Salesforce, GHL)",
  "Project Management (e.g. Buildertrend, CoConstruct, Monday)",
  "Accounting (e.g. QuickBooks, Sage, Acomba)",
  "Other",
  "None",
];

type FormState = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  trade: string;
  crewSize: string;
  annualRevenue: string;
  painPoints: string[];
  softwareUsed: string[];
  softwareOther: string;
  sixMonthGoal: string;
  leadSource: string;
};

const initial: FormState = {
  firstName: "", lastName: "", email: "", phone: "",
  trade: "", crewSize: "", annualRevenue: "",
  painPoints: [], softwareUsed: [], softwareOther: "",
  sixMonthGoal: "", leadSource: "",
};

export default function Apply() {
  useSEO({
    title: "Request a Free Operations Review | PrimeGrowth AI",
    description: "Request a free operations review for your contracting business. Tell us where admin, job costing, scheduling, and follow-up are breaking down so we can assess the best next step.",
    canonical: "https://www.primegrowthai.com/apply",
    lang: "en",
    alternateHref: "https://www.primegrowthai.com/fr/postuler",
    alternateLang: "fr",
  });

  const [form, setForm] = useState<FormState>(initial);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [error, setError] = useState("");

  const toggle = (field: "painPoints" | "softwareUsed", value: string) => {
    setForm(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(v => v !== value)
        : [...prev[field], value],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    setError("");
    try {
      await sendGhlWebhookGet(GHL_WEBHOOKS.applyForm, {
        ...form,
        painPoints: form.painPoints.join(", "),
        softwareUsed: form.softwareUsed.join(", "),
        lang: "en",
        source: "operations-review-application-en",
      });
      trackMetaLead({
        content_name: "PrimeGrowth Operations Review Application",
        content_category: "application",
        source: "apply-en",
        language: "en",
      });
      trackMetaCustomEvent("OperationsReviewApplication", {
        source: "apply-en",
        language: "en",
      });
      setStatus("success");
    } catch {
      setStatus("error");
      setError("Something went wrong. Please try again or email us directly.");
    }
  };

  if (status === "success") {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center px-4">
        <div className="max-w-lg text-center">
          <div className="w-16 h-16 bg-teal-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">Request Received</h1>
          <p className="text-gray-400 mb-6">
            We've got your details. David will review your operation and reach out within 24 hours if there is a clear fit.
          </p>
          <p className="text-gray-300 mb-8">
            Want to choose a time now? Book your Discovery Call here:
          </p>
          <a href="https://api.leadconnectorhq.com/widget/booking/tna24x8ZRjYp8JGdYWoO" target="_blank" rel="noopener noreferrer" onClick={() => trackMetaCustomEvent("DiscoveryCallBookingClick", { source: "apply-success-en", language: "en" })} className="inline-block bg-teal-500 text-white font-semibold px-8 py-3 rounded-lg hover:bg-teal-400 transition-colors mb-4">
            Book Your Discovery Call
          </a>
          <br />
          <Link href="/" className="inline-block text-gray-500 hover:text-teal-400 text-sm mt-4 transition-colors">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F172A] text-white">
      {/* Header */}
      <div className="border-b border-white/10 px-6 py-4">
        <Link href="/" className="text-teal-400 hover:text-teal-300 text-sm font-medium">
          ← Back to PrimeGrowth AI
        </Link>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-12">
        {/* Hero */}
        <div className="mb-10">
          <div className="inline-block bg-teal-500/10 border border-teal-500/30 text-teal-400 text-xs font-semibold px-3 py-1 rounded-full mb-4 uppercase tracking-wider">
            Operations Review Request
          </div>
          <h1 className="text-4xl font-bold mb-4 leading-tight">
            Request Your Free<br />Operations Review
          </h1>
          <p className="text-gray-400 text-lg leading-relaxed">
            Tell us where admin, job costing, scheduling, or follow-up is slowing the business down. David reviews every request personally and will follow up within 24 hours if an operations review is the right next step.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Contact */}
          <section>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Contact Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">First Name *</label>
                <input required value={form.firstName} onChange={e => setForm(p => ({...p, firstName: e.target.value}))}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-teal-500 transition-colors"
                  placeholder="Mike" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Last Name *</label>
                <input required value={form.lastName} onChange={e => setForm(p => ({...p, lastName: e.target.value}))}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-teal-500 transition-colors"
                  placeholder="Roberts" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email *</label>
                <input required type="email" value={form.email} onChange={e => setForm(p => ({...p, email: e.target.value}))}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-teal-500 transition-colors"
                  placeholder="mike@yourcompany.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Phone *</label>
                <input required type="tel" value={form.phone} onChange={e => setForm(p => ({...p, phone: e.target.value}))}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-teal-500 transition-colors"
                  placeholder="+1 (514) 000-0000" />
              </div>
            </div>
          </section>

          {/* Business */}
          <section>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Your Business</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Trade / Specialty *</label>
                <select required value={form.trade} onChange={e => setForm(p => ({...p, trade: e.target.value}))}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-teal-500 transition-colors appearance-none">
                  <option value="" disabled className="bg-[#0F172A]">Select your trade...</option>
                  {["Tiling / Carrelage","Formwork / Coffrage","Electrical / Électricité","Plumbing / Plomberie","Painting / Peinture","General Contractor / Entrepreneur général","Roofing / Toiture","Excavation / Landscaping","Other / Autre"].map(o => (
                    <option key={o} value={o} className="bg-[#0F172A]">{o}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Crew Size *</label>
                  <select required value={form.crewSize} onChange={e => setForm(p => ({...p, crewSize: e.target.value}))}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-teal-500 transition-colors appearance-none">
                    <option value="" disabled className="bg-[#0F172A]">Select...</option>
                    {["Solo (just me)","2–5 employees","6–15 employees","15+ employees"].map(o => (
                      <option key={o} value={o} className="bg-[#0F172A]">{o}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Annual Revenue *</label>
                  <select required value={form.annualRevenue} onChange={e => setForm(p => ({...p, annualRevenue: e.target.value}))}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-teal-500 transition-colors appearance-none">
                    <option value="" disabled className="bg-[#0F172A]">Select...</option>
                    {["Less than $200K","$200K – $500K","$500K – $1M","$1M – $3M","$3M+"].map(o => (
                      <option key={o} value={o} className="bg-[#0F172A]">{o}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </section>

          {/* Pain Points */}
          <section>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Biggest Admin Pain Points *</h2>
            <p className="text-gray-500 text-sm mb-4">Select all that apply</p>
            <div className="grid grid-cols-1 gap-2">
              {PAIN_POINTS.map(p => (
                <label key={p} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${form.painPoints.includes(p) ? "border-teal-500 bg-teal-500/10" : "border-white/10 bg-white/5 hover:border-white/20"}`}>
                  <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 border ${form.painPoints.includes(p) ? "bg-teal-500 border-teal-500" : "border-white/30"}`}>
                    {form.painPoints.includes(p) && (
                      <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className="text-sm text-gray-300" onClick={() => toggle("painPoints", p)}>{p}</span>
                  <input type="checkbox" className="hidden" checked={form.painPoints.includes(p)} onChange={() => toggle("painPoints", p)} />
                </label>
              ))}
            </div>
          </section>

          {/* Software */}
          <section>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Software Currently Used</h2>
            <p className="text-gray-500 text-sm mb-4">Select all that apply</p>
            <div className="grid grid-cols-1 gap-2">
              {SOFTWARE_OPTIONS.map(s => (
                <label key={s} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${form.softwareUsed.includes(s) ? "border-teal-500 bg-teal-500/10" : "border-white/10 bg-white/5 hover:border-white/20"}`}>
                  <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 border ${form.softwareUsed.includes(s) ? "bg-teal-500 border-teal-500" : "border-white/30"}`}>
                    {form.softwareUsed.includes(s) && (
                      <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className="text-sm text-gray-300" onClick={() => toggle("softwareUsed", s)}>{s}</span>
                  <input type="checkbox" className="hidden" checked={form.softwareUsed.includes(s)} onChange={() => toggle("softwareUsed", s)} />
                </label>
              ))}
            </div>
            {form.softwareUsed.includes("Other") && (
              <div className="mt-3">
                <input value={form.softwareOther} onChange={e => setForm(p => ({...p, softwareOther: e.target.value}))}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-teal-500 transition-colors"
                  placeholder="e.g. Excel, WhatsApp, paper..." />
              </div>
            )}
          </section>

          {/* Goal */}
          <section>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Your Goal</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">What's your biggest goal in the next 6 months? *</label>
                <textarea required value={form.sixMonthGoal} onChange={e => setForm(p => ({...p, sixMonthGoal: e.target.value}))}
                  rows={4}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-teal-500 transition-colors resize-none"
                  placeholder="e.g. Stop losing money on jobs I can't track. Get my weekends back. Know my margins before I quote..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">How did you hear about PrimeGrowth AI?</label>
                <select value={form.leadSource} onChange={e => setForm(p => ({...p, leadSource: e.target.value}))}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-teal-500 transition-colors appearance-none">
                  <option value="" disabled className="bg-[#0F172A]">Select...</option>
                  {["Instagram","Job Costing Calculator","Referral","Google","LinkedIn","Other"].map(o => (
                    <option key={o} value={o} className="bg-[#0F172A]">{o}</option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* Submit */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <div className="pt-2">
            <button type="submit" disabled={status === "submitting"}
              className="w-full bg-teal-500 hover:bg-teal-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-lg text-lg transition-colors">
              {status === "submitting" ? "Submitting..." : "Request My Operations Review →"}
            </button>
            <p className="text-center text-gray-600 text-sm mt-3">
              Every request is reviewed manually. If there is a fit, you'll hear from David within 24 hours.
            </p>
          </div>

          {/* Lang toggle */}
          <div className="text-center pt-4 border-t border-white/10">
            <Link href="/fr/postuler" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">
              Voir cette page en français →
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
