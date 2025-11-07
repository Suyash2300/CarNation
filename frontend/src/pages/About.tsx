import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import {
  Car,
  ShieldCheck,
  Headphones,
  Sparkles,
  Users,
  Trophy,
} from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen bg-light-subtle">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
        {/* Hero */}
        <section className="text-center space-y-4 mb-10">
          <h1 className="text-4xl md:text-5xl font-black text-dark-900">
            We make getting the right car ridiculously simple
          </h1>
          <p className="text-lg text-dark-600 max-w-3xl mx-auto">
            CarNation helps you rent and buy cars with clarity, transparent
            pricing, and delightful support.
          </p>
        </section>

        {/* Highlights */}
        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-10">
          {[
            {
              icon: ShieldCheck,
              title: "Trusted",
              desc: "Verified owners, secure payments, safe experience.",
            },
            {
              icon: Sparkles,
              title: "Quality",
              desc: "Curated listings, transparent details, no surprises.",
            },
            {
              icon: Headphones,
              title: "Support",
              desc: "Fast assistance from booking to handover.",
            },
            {
              icon: Trophy,
              title: "Value",
              desc: "Fair pricing, seasonal offers, and rewards.",
            },
          ].map((h, i) => (
            <div key={i} className="glass rounded-2xl p-6 flex gap-3">
              <h.icon className="w-6 h-6 text-primary-600 mt-1" />
              <div>
                <p className="font-bold text-dark-900">{h.title}</p>
                <p className="text-dark-600 text-sm">{h.desc}</p>
              </div>
            </div>
          ))}
        </section>

        {/* Stats */}
        <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: "Total Rentals", value: "12,500+" },
            { label: "Cities", value: "30+" },
            { label: "Cars Listed", value: "4,800+" },
            { label: "Avg. Rating", value: "4.8/5" },
          ].map((s, i) => (
            <div key={i} className="glass rounded-2xl p-6 text-center">
              <p className="text-2xl font-black text-primary-600">{s.value}</p>
              <p className="text-dark-600 text-sm">{s.label}</p>
            </div>
          ))}
        </section>

        {/* Timeline */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-dark-900 mb-4">Our Journey</h2>
          <div className="space-y-4">
            {[
              {
                year: "2023",
                title: "Founded CarNation",
                desc: "Started with a simple mission: make car access effortless.",
              },
              {
                year: "2024",
                title: "Launched Rentals",
                desc: "Expanded across major metro cities with curated inventory.",
              },
              {
                year: "2025",
                title: "Buy & Sell",
                desc: "Verified used cars with transparent history and support.",
              },
            ].map((t, i) => (
              <div
                key={i}
                className="glass rounded-xl p-4 flex items-start gap-3"
              >
                <div className="w-16 font-bold text-primary-600">{t.year}</div>
                <div>
                  <p className="font-semibold text-dark-900">{t.title}</p>
                  <p className="text-dark-600 text-sm">{t.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Team */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-dark-900 mb-4">
            Meet the Team
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="glass rounded-2xl p-6 text-center">
                <div className="w-20 h-20 rounded-full bg-primary-100 mx-auto mb-3 flex items-center justify-center">
                  <Users className="w-8 h-8 text-primary-600" />
                </div>
                <p className="font-bold text-dark-900">Member {i + 1}</p>
                <p className="text-sm text-dark-600">Role</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="text-center">
          <a
            href="/rent"
            className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-primary text-white font-bold shadow-md hover:shadow-lg"
          >
            <Car className="w-5 h-5" /> Explore Rentals
          </a>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;
