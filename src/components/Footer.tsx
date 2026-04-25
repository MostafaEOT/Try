import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-2 md:col-span-1">
            <span className="text-2xl font-bold text-white">Servy</span>
            <p className="mt-3 text-sm text-gray-400 leading-relaxed">
              The easiest way to find and book trusted local service professionals for any job.
            </p>
            <div className="flex gap-3 mt-4">
              {["Twitter", "Facebook", "Instagram"].map((s) => (
                <span key={s} className="w-9 h-9 bg-gray-800 hover:bg-blue-600 rounded-full flex items-center justify-center cursor-pointer transition-colors text-sm font-bold">
                  {s[0]}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Services</h4>
            <ul className="space-y-2 text-sm">
              {["Plumbing", "Electrical", "HVAC", "Cleaning", "Landscaping", "Painting"].map((s) => (
                <li key={s}><Link href={`/services/${s.toLowerCase()}`} className="hover:text-white transition-colors">{s}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              {["About Us", "Careers", "Press", "Blog", "Contact", "Help Center"].map((item) => (
                <li key={item}><a href="#" className="hover:text-white transition-colors">{item}</a></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">For Pros</h4>
            <ul className="space-y-2 text-sm">
              {["Join as a Pro", "Pro Dashboard", "Insurance", "Pro Blog", "Success Stories"].map((item) => (
                <li key={item}><Link href={item === "Join as a Pro" ? "/register" : "#"} className="hover:text-white transition-colors">{item}</Link></li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <p>© 2025 Servy Inc. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Cookie Settings</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
