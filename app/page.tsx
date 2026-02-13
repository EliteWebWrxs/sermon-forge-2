import Link from "next/link"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-slate-100 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <svg
              className="w-4 h-4 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>
          <span className="font-semibold text-slate-900">SermonForge</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-8 py-24 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-xs font-medium px-3 py-1.5 rounded-full mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block" />
          Powered by Claude AI
        </div>
        <h1 className="text-5xl font-bold text-slate-900 leading-tight mb-6">
          Turn sermons into
          <br />
          <span className="text-blue-600">powerful content</span>
        </h1>
        <p className="text-lg text-slate-500 max-w-2xl mx-auto mb-10">
          Upload any sermon — audio, video, PDF, or YouTube link — and get
          sermon notes, devotionals, discussion guides, and social media content
          generated in seconds.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            href="/signup"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Start for free
          </Link>
          <Link
            href="/login"
            className="text-slate-600 px-6 py-3 rounded-lg hover:bg-slate-100 transition-colors font-medium"
          >
            Sign in
          </Link>
        </div>
      </section>

      {/* Feature grid */}
      <section className="max-w-5xl mx-auto px-8 pb-24">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Sermon Notes", desc: "Fill-in-the-blank style for your congregation" },
            { label: "Devotional", desc: "800-1200 word SEO-optimised blog post" },
            { label: "Discussion Guide", desc: "Small group questions & talking points" },
            { label: "Social Media Pack", desc: "5-7 quotes and captions, ready to post" },
          ].map((f) => (
            <div
              key={f.label}
              className="bg-slate-50 rounded-xl p-6 border border-slate-100"
            >
              <p className="font-semibold text-slate-900 text-sm mb-1">{f.label}</p>
              <p className="text-xs text-slate-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
