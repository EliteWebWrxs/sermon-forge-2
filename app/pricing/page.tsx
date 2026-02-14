import type { Metadata } from "next"
import Link from "next/link"
import { PLANS } from "@/lib/stripe/server"
import { PricingClient } from "./pricing-client"

export const metadata: Metadata = {
  title: "Pricing - SermonForge",
  description: "Choose the perfect plan for your ministry. Transform sermons into devotionals, discussion guides, and more.",
}

const allFeatures = [
  { name: "Sermons per month", starter: "4", growth: "12", enterprise: "Unlimited" },
  { name: "Sermon Notes", starter: true, growth: true, enterprise: true },
  { name: "Daily Devotionals", starter: true, growth: true, enterprise: true },
  { name: "Discussion Guides", starter: true, growth: true, enterprise: true },
  { name: "Social Media Pack", starter: true, growth: true, enterprise: true },
  { name: "PDF Export", starter: true, growth: true, enterprise: true },
  { name: "Word Export", starter: true, growth: true, enterprise: true },
  { name: "PowerPoint Export", starter: false, growth: true, enterprise: true },
  { name: "Church Branding", starter: false, growth: true, enterprise: true },
  { name: "Logo on Exports", starter: false, growth: true, enterprise: true },
  { name: "Custom Integrations", starter: false, growth: false, enterprise: true },
  { name: "API Access", starter: false, growth: false, enterprise: true },
  { name: "Support", starter: "Email", growth: "Priority", enterprise: "Dedicated" },
]

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <span className="text-xl font-bold text-slate-900">SermonForge</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm text-slate-600 hover:text-slate-900">
              Sign In
            </Link>
            <Link
              href="/signup"
              className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Simple, transparent pricing
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
            Choose the perfect plan for your ministry
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Transform your sermons into engaging content for your congregation.
            All plans include our AI-powered content generation.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <PricingClient plans={PLANS} />
        </div>
      </section>

      {/* Feature Comparison */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-12">
            Compare Plans
          </h2>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-4 px-6 text-sm font-medium text-slate-500">
                      Features
                    </th>
                    <th className="text-center py-4 px-6 text-sm font-semibold text-slate-900">
                      Starter
                    </th>
                    <th className="text-center py-4 px-6 text-sm font-semibold text-blue-600 bg-blue-50">
                      Growth
                    </th>
                    <th className="text-center py-4 px-6 text-sm font-semibold text-slate-900">
                      Enterprise
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {allFeatures.map((feature, i) => (
                    <tr key={feature.name} className={i !== allFeatures.length - 1 ? "border-b border-slate-100" : ""}>
                      <td className="py-4 px-6 text-sm text-slate-700">{feature.name}</td>
                      <td className="py-4 px-6 text-center">
                        <FeatureValue value={feature.starter} />
                      </td>
                      <td className="py-4 px-6 text-center bg-blue-50/50">
                        <FeatureValue value={feature.growth} />
                      </td>
                      <td className="py-4 px-6 text-center">
                        <FeatureValue value={feature.enterprise} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-12">
            Frequently Asked Questions
          </h2>

          <div className="space-y-6">
            <FaqItem
              question="What counts as a sermon?"
              answer="Each sermon you upload (text, PDF, audio, or video) counts as one sermon toward your monthly limit. The generated content (devotionals, discussion guides, etc.) doesn't count separately."
            />
            <FaqItem
              question="Can I upgrade or downgrade anytime?"
              answer="Yes! You can change your plan at any time. When upgrading, you'll get immediate access to new features. When downgrading, changes take effect at the end of your billing period."
            />
            <FaqItem
              question="What happens if I reach my sermon limit?"
              answer="You'll receive a notification when approaching your limit. You can upgrade your plan anytime to get more sermons, or wait until your next billing period when your limit resets."
            />
            <FaqItem
              question="Do you offer refunds?"
              answer="Yes, we offer a 14-day money-back guarantee. If you're not satisfied, contact us within 14 days of your purchase for a full refund."
            />
            <FaqItem
              question="Can I try before I buy?"
              answer="Absolutely! Sign up for free and upload your first sermon. You'll see exactly what content we generate before committing to a paid plan."
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to transform your sermons?
          </h2>
          <p className="text-blue-100 text-lg mb-8">
            Join hundreds of churches using SermonForge to engage their congregations.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-blue-50 transition-colors"
          >
            Start Free Trial
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-slate-500">
            &copy; {new Date().getFullYear()} SermonForge. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}

function FeatureValue({ value }: { value: boolean | string }) {
  if (typeof value === "boolean") {
    return value ? (
      <svg className="w-5 h-5 text-green-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ) : (
      <svg className="w-5 h-5 text-slate-300 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    )
  }
  return <span className="text-sm text-slate-700">{value}</span>
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <h3 className="font-semibold text-slate-900 mb-2">{question}</h3>
      <p className="text-slate-600">{answer}</p>
    </div>
  )
}
