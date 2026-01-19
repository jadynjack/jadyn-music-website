import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import logoImage from "@assets/logo-white_1768735494982.png";
import Footer from "@/components/Footer";

export default function Privacy() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-[#050608] relative overflow-hidden">
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="max-w-2xl mx-auto p-4 sm:p-8">
        <div className="flex items-center justify-between mb-8">
          <Button 
            onClick={() => setLocation("/")}
            variant="ghost" 
            size="sm"
            className="text-white/40 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <img src={logoImage} alt="Logo" className="h-8 w-auto" />
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#12141c] rounded-2xl border border-white/5 p-6 sm:p-8"
        >
          <h1 className="font-display text-3xl font-black italic uppercase tracking-tighter text-white mb-2">Privacy Policy: JADYN</h1>
          <p className="text-white/40 text-sm mb-8">Last Updated: January 19, 2026</p>

          <div className="prose prose-invert prose-sm max-w-none space-y-6 text-white/70">
            <section>
              <h2 className="text-lg font-bold text-white mb-3">1. Introduction</h2>
              <p>This Privacy Policy describes how JADYN ("we," "us," or "our") collects, uses, and shares your personal information when you visit jadynmusic.com (the "Site"). We value transparency and are committed to protecting the privacy of our listeners.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-3">2. Information We Collect</h2>
              <p><strong className="text-white/90">Voluntary Information:</strong> We collect information you provide directly to us, such as your name and email address when you sign up for the JADYN mailing list, enter a contest, or contact us.</p>
              <p><strong className="text-white/90">Automated Information:</strong> When you visit the Site, we automatically collect certain information about your device, including your IP address, browser type, and how you interact with the Site via cookies and tracking pixels (such as the Meta Pixel).</p>
              <p><strong className="text-white/90">Third-Party Data:</strong> If you connect with JADYN via platforms like Spotify, Apple Music, or YouTube, we may receive basic profile information as authorized by those services' privacy settings.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-3">3. How We Use Your Data</h2>
              <p>We use the information collected for the following purposes:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong className="text-white/90">Marketing & Communication:</strong> To send you updates about new music releases, upcoming shows, and merchandise.</li>
                <li><strong className="text-white/90">Targeted Advertising:</strong> To create "Custom Audiences" and "Lookalike Audiences" on platforms like Meta (Facebook/Instagram) and Google to ensure our ads reach people with similar musical tastes.</li>
                <li><strong className="text-white/90">Analytics:</strong> To analyze website traffic and improve the user experience on jadynmusic.com.</li>
                <li><strong className="text-white/90">Legal Compliance:</strong> To comply with applicable laws, including the Australian Privacy Act and international data regulations.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-3">4. Consent and Opt-In</h2>
              <p><strong className="text-white/90">Mailing List:</strong> By providing your email and ticking the opt-in box, you consent to receive marketing communications. We utilize a Double Opt-In process where possible to ensure your consent is verified via a confirmation email.</p>
              <p><strong className="text-white/90">Cookies:</strong> Upon your first visit to jadynmusic.com, you will be asked to consent to non-essential cookies. You can manage your preferences at any time through your browser settings.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-3">5. Sharing Your Information</h2>
              <p>We do not sell your personal data. We only share information with:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong className="text-white/90">Service Providers:</strong> Secure platforms used for email marketing (e.g., Mailchimp), website hosting, and data analytics.</li>
                <li><strong className="text-white/90">Advertising Partners:</strong> Social media and search platforms for the purpose of serving relevant advertisements.</li>
                <li><strong className="text-white/90">Legal Requirements:</strong> If required by law or to protect our legal rights.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-3">6. International Data Transfers</h2>
              <p>As JADYN's music is available globally, your data may be processed in countries outside of your own. We take all reasonable steps to ensure your data is treated securely and in accordance with this policy.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-3">7. Your Rights</h2>
              <p>You have the right to:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Access the personal information we hold about you.</li>
                <li>Request the correction or deletion of your data.</li>
                <li>Opt-out of marketing at any time by clicking the "Unsubscribe" link at the bottom of our emails.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-3">8. Contact</h2>
              <p>For any questions regarding your privacy, please contact: [Insert Your Professional Email Here].</p>
            </section>
          </div>
        </motion.div>
        
        <Footer />
      </div>
    </div>
  );
}
