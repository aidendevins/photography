import './index.css';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-black text-white">
      <header className="border-b border-white/10">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <a href="/" className="text-sm text-white/60 hover:text-white transition">
            &larr; Back to Portfolio
          </a>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-light tracking-tight mb-8">Privacy Policy</h1>
        
        <div className="prose prose-invert prose-lg max-w-none space-y-8 text-white/80">
          <p className="text-white/60 text-sm">Last updated: March 2026</p>

          <section>
            <h2 className="text-xl font-medium text-white mb-4">Information We Collect</h2>
            <p>
              When you visit this website, we automatically collect certain information about your device, 
              including your IP address, browser type, referring/exit pages, and operating system. 
              We also collect information about how you interact with the site.
            </p>
            <p>
              If you contact us through our contact form, we collect your email address and any other 
              information you choose to provide in your message.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium text-white mb-4">How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul className="list-disc pl-6 space-y-2 text-white/70">
              <li>Understand how visitors use our website</li>
              <li>Improve our website and user experience</li>
              <li>Respond to inquiries about prints and licensing</li>
              <li>Send occasional updates about new work (only if you opt in)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-medium text-white mb-4">Analytics</h2>
            <p>
              We use a self-hosted analytics solution to track page views and general usage patterns. 
              This data is stored securely and is not shared with third parties. We do not use 
              cookies for tracking purposes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium text-white mb-4">Data Retention</h2>
            <p>
              We retain analytics data for up to 12 months. Contact form submissions are retained 
              until you request deletion or the inquiry is resolved.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium text-white mb-4">Your Rights</h2>
            <p>
              You have the right to request access to, correction of, or deletion of your personal 
              information. To exercise these rights, please contact us using the information below.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium text-white mb-4">Contact</h2>
            <p>
              For any privacy-related questions or requests, please email:{' '}
              <a href="mailto:hello@aidendevins.com" className="text-amber-400 hover:text-amber-300 transition">
                hello@aidendevins.com
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium text-white mb-4">Changes to This Policy</h2>
            <p>
              We may update this privacy policy from time to time. Any changes will be posted on 
              this page with an updated revision date.
            </p>
          </section>
        </div>
      </main>

      <footer className="border-t border-white/10 mt-16">
        <div className="max-w-4xl mx-auto px-6 py-8 text-center text-white/40 text-sm">
          &copy; {new Date().getFullYear()} Aiden Devins Photography. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
