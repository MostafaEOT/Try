import Link from "next/link";

const team = [
  { name: "Sarah Mitchell", role: "CEO & Co-Founder", avatar: "SM", bio: "Former Uber executive with 10+ years in marketplace platforms." },
  { name: "James Okafor", role: "CTO & Co-Founder", avatar: "JO", bio: "Ex-Google engineer. Built scalable systems serving millions of users." },
  { name: "Priya Nair", role: "Head of Operations", avatar: "PN", bio: "Passionate about connecting communities with quality service professionals." },
  { name: "Carlos Ruiz", role: "Head of Trust & Safety", avatar: "CR", bio: "Ensures every professional on Servy is vetted, verified, and insured." },
];

const values = [
  { icon: "🤝", title: "Trust First", desc: "Every professional is background-checked, licensed, and insured before joining our platform." },
  { icon: "⚡", title: "Speed & Reliability", desc: "We connect you with available pros in minutes — not days. Urgent? We've got you covered 24/7." },
  { icon: "💎", title: "Quality Work", desc: "We only keep top-rated professionals. Our satisfaction guarantee means you're protected every time." },
  { icon: "🌍", title: "Community", desc: "We support local service professionals, helping them grow their business and earn a fair income." },
];

const milestones = [
  { year: "2021", event: "Servy founded in New York City with 50 local service providers." },
  { year: "2022", event: "Expanded to 10 cities. Reached 100,000 bookings." },
  { year: "2023", event: "Launched real-time dispatch system. 500,000+ jobs completed." },
  { year: "2024", event: "Crossed 50,000 verified professionals across 50+ cities." },
  { year: "2025", event: "2 million+ satisfied customers. Expanding internationally." },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-700 to-blue-900 text-white py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            We connect people with <span className="text-yellow-300">trusted professionals</span>
          </h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed">
            Servy is on a mission to make home and personal services as easy as ordering a ride — fast, reliable, and always a tap away.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Mission</h2>
            <p className="text-gray-600 leading-relaxed text-lg mb-4">
              We started Servy because finding a reliable plumber, electrician, or cleaner shouldn&apos;t feel like a gamble. Too many people have been overcharged, stood up, or left with poor-quality work.
            </p>
            <p className="text-gray-600 leading-relaxed text-lg mb-6">
              We built a platform where every professional is vetted, every job is tracked, and every customer is protected — so you can book with complete confidence.
            </p>
            <Link href="/request" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-7 rounded-xl transition-colors inline-block">
              Book a Service
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { value: "2M+", label: "Jobs Completed" },
              { value: "50K+", label: "Verified Pros" },
              { value: "50+", label: "Cities Served" },
              { value: "4.8★", label: "Average Rating" },
            ].map((stat) => (
              <div key={stat.label} className="bg-blue-50 rounded-2xl p-6 text-center">
                <p className="text-3xl font-bold text-blue-600">{stat.value}</p>
                <p className="text-gray-600 text-sm mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it's different */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Why Servy is Different</h2>
            <p className="text-gray-500 mt-2">Built around trust, speed, and fairness</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v) => (
              <div key={v.title} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="text-4xl mb-4">{v.icon}</div>
                <h3 className="font-bold text-gray-900 mb-2">{v.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">How Servy Works</h2>
          <p className="text-gray-500 mt-2">Like Uber, but for any service you need</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: "📋", step: "1", title: "Describe your need", desc: "Tell us what service you need, your location, and whether you want someone now or at a scheduled time." },
            { icon: "📡", step: "2", title: "We find nearby pros", desc: "Our platform instantly notifies available verified professionals near you. They can accept your job in real time." },
            { icon: "✅", step: "3", title: "Job done, pay safely", desc: "Track your pro as they arrive. Payment is only released after the job is complete and you're satisfied." },
          ].map((s) => (
            <div key={s.step} className="text-center">
              <div className="relative inline-block mb-4">
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-3xl mx-auto">
                  {s.icon}
                </div>
                <span className="absolute -top-2 -right-2 w-6 h-6 bg-blue-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {s.step}
                </span>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">{s.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Timeline */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Our Journey</h2>
          </div>
          <div className="relative">
            <div className="absolute left-16 top-0 bottom-0 w-0.5 bg-blue-100" />
            <div className="space-y-8">
              {milestones.map((m) => (
                <div key={m.year} className="flex gap-6 items-start">
                  <div className="w-12 h-12 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center flex-shrink-0 relative z-10">
                    {m.year}
                  </div>
                  <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex-1 mt-1">
                    <p className="text-gray-700">{m.event}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">Meet the Team</h2>
          <p className="text-gray-500 mt-2">The people building the future of services</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {team.map((member) => (
            <div key={member.name} className="text-center">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
                {member.avatar}
              </div>
              <h3 className="font-bold text-gray-900">{member.name}</h3>
              <p className="text-blue-600 text-sm font-medium">{member.role}</p>
              <p className="text-gray-500 text-xs mt-2 leading-relaxed">{member.bio}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-blue-600 py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to experience Servy?</h2>
          <p className="text-blue-100 mb-8">Join 2 million+ people who trust Servy for every service need.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/request" className="bg-white hover:bg-gray-50 text-blue-600 font-bold py-4 px-8 rounded-xl transition-colors">
              Book a Service Now
            </Link>
            <Link href="/register" className="border-2 border-white text-white hover:bg-blue-700 font-bold py-4 px-8 rounded-xl transition-colors">
              Join as a Pro
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
