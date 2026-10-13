import * as React from "react";
import { motion } from "framer-motion";
import { ExternalLink, Send, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import portraitImage from "@assets/PXL_20230416_074727800~4_(1)_1768734324398.jpg";
import appleMusicLogo from "@assets/Apple_Music_icon.svg_1768739002544.png";
import logoImage from "@assets/logo-white_1768735494982.png";
import Footer from "@/components/Footer";
import { ttqViewContent, ttqLead, generateEventId } from "@/lib/tiktokPixel";
import { openSmartLink } from "@/lib/smartLinks";

// ─── SITE CONFIG ──────────────────────────────────────────────────────────────
const SONG_TITLE = "YOU MAKE ME FEEL";
const SONG_SUBTITLE = "New single out now on all platforms";
const SPOTIFY_LINK = "https://open.spotify.com/album/5rCz29MTo6iwhDVPHwpQgi?si=xFuLkJgYSGe6KmwlmyXG6Q";
const APPLE_MUSIC_LINK = "https://music.apple.com/au/album/you-make-me-feel-single/1868491302";
const YOUTUBE_MUSIC_LINK = "https://music.youtube.com/playlist?list=OLAK5uy_n60c8SbLkz7EuNDGONVws5musGETuwrHc";

// Live shows. `start` is the local Sydney start time with its UTC offset
// (+11:00 during daylight saving, +10:00 otherwise). Each gig hides itself
// automatically once its night is over (GIG_EXPIRY_HOURS after start); when no
// gigs remain, the whole Live Shows section disappears.
type Gig = {
  name: string;
  venue: string;
  city: string;
  start: string;
  href: string;
  status?: "few" | "sold";
};

const GIGS: Gig[] = [
  {
    name: "Mixed Bag #19",
    venue: "Bootleggers",
    city: "Newtown",
    start: "2026-10-28T19:00:00+11:00",
    href: "https://moshtix.com.au/v2/event/mixed-bag-19-%E2%80%93-jadyn-new-traumas-carnage-flower-mark-poynton/201406",
  },
];
const GIG_EXPIRY_HOURS = 6;
// ─────────────────────────────────────────────────────────────────────────────

export default function Home() {
  const [email, setEmail] = React.useState("");
  const [marketingOptIn, setMarketingOptIn] = React.useState(false);
  const [subscribed, setSubscribed] = React.useState(false);

  const subscribeMutation = useMutation({
    mutationFn: async (data: { email: string; marketingOptIn: boolean; eventId?: string }) => {
      const res = await apiRequest("POST", "/api/subscribers", data);
      return res.json();
    },
    onSuccess: () => {
      setSubscribed(true);
      setEmail("");
      setMarketingOptIn(false);
    },
  });

  React.useEffect(() => {
    ttqViewContent("home", "JADYN Home Page");
  }, []);

  const handleSubscribe = () => {
    if (email && email.includes("@")) {
      const eventId = generateEventId();
      ttqLead(email, "subscribe", "Email Signup", eventId);
      subscribeMutation.mutate({ email, marketingOptIn, eventId });
    }
  };

  return (
    <main className="min-h-screen flex items-start sm:items-center justify-center p-0 sm:p-6 lg:p-10 bg-[#050608] relative overflow-hidden" role="main">
      {/* Background Ambient Effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-[120px] pointer-events-none" />
      
      {/* Main Card Container */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-full sm:max-w-[560px] lg:max-w-[1080px] bg-[#12141c] rounded-none sm:rounded-[32px] border-0 sm:border border-white/5 shadow-2xl overflow-hidden relative mx-auto"
      >
        <div className="lg:grid lg:grid-cols-2 lg:gap-8">
        {/* Profile / Hero Section */}
        <div className="relative h-[480px] sm:h-[560px] lg:h-auto lg:min-h-[720px] w-full">
          <div className="absolute inset-0">
            <img 
              src={portraitImage} 
              alt="JADYN – indie pop artist from Sydney" 
              width={560}
              height={720}
              className="w-full h-full object-cover opacity-90 object-[20%_center]"
              loading="eager"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#12141c] via-[#12141c]/20 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-b from-[#12141c]/80 via-transparent to-transparent" />
          </div>

          {/* Artist Logo */}
          <div className="absolute top-8 left-0 right-0 flex justify-center z-10">
            <img 
              src={logoImage} 
              alt="JADYN" 
              width={200}
              height={128}
              className="h-32 w-auto object-contain drop-shadow-lg"
            />
          </div>

          {/* Song Info */}
          <div className="absolute bottom-0 left-0 right-0 p-8 pt-20 lg:pt-8 lg:bottom-auto lg:top-1/2 lg:-translate-y-[35%] flex flex-col items-center text-center z-10">
            <motion.span 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-bold tracking-widest text-white/90 border border-white/10 mb-4 uppercase"
            >
              New Release
            </motion.span>
            
            <motion.h1 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="font-display text-5xl lg:text-[64px] lg:leading-none font-black italic tracking-tighter text-white mb-2 drop-shadow-xl uppercase"
            >
              {SONG_TITLE}
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-white/60 text-sm font-medium tracking-wide"
            >
              {SONG_SUBTITLE}
            </motion.p>
          </div>
        </div>

        {/* Content Section */}
        <div className="px-5 pb-8 sm:px-8 sm:pb-10 lg:py-10 lg:pl-2 lg:pr-10 flex flex-col justify-center gap-5">
          
          {/* Streaming Links */}
          <nav aria-label="Streaming platforms" className="space-y-3">
            <LinkItem 
              delay={0.5}
              icon={<SpotifyIcon className="w-5 h-5 text-[#1DB954]" />}
              label="Listen on Spotify"
              href={SPOTIFY_LINK}
            />
            <LinkItem 
              delay={0.6}
              icon={<img src={appleMusicLogo} alt="Apple Music" className="w-6 h-6 object-contain rounded-[4px]" />}
              label="Listen on Apple Music"
              href={APPLE_MUSIC_LINK}
            />
            <LinkItem 
              delay={0.7}
              icon={<YoutubeIcon className="w-5 h-5 text-[#FF0000]" />}
              label="Listen on YouTube Music"
              href={YOUTUBE_MUSIC_LINK}
            />
          </nav>

          <LiveShows />

          {/* Email Sign Up */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="bg-[#1a1d26] rounded-2xl p-5 border border-white/5 space-y-4"
          >
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Join the Inner Circle</h3>
              <p className="text-[10px] text-white/40 leading-relaxed font-medium">Get exclusive updates on tour dates and new music.</p>
            </div>
            
            {subscribed ? (
              <div className="flex items-center gap-2 text-primary py-2">
                <Check className="w-4 h-4" />
                <span className="text-sm font-bold">
                  {subscribeMutation.variables?.marketingOptIn
                    ? "Nearly there! Check your inbox to confirm."
                    : "Thanks for signing up!"}
                </span>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com" 
                    className="bg-black/20 border-white/5 h-10 text-xs text-white placeholder:text-white/20 rounded-xl focus:ring-primary focus:border-primary"
                    data-testid="input-email"
                  />
                  <Button 
                    onClick={handleSubscribe}
                    disabled={subscribeMutation.isPending}
                    size="icon" 
                    className="h-10 w-10 shrink-0 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-[0_0_15px_rgba(45,212,191,0.3)] transition-all active:scale-95"
                    data-testid="button-subscribe"
                    aria-label="Subscribe to email updates"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex items-start gap-2">
                  <Checkbox 
                    id="marketing-optin"
                    checked={marketingOptIn}
                    onCheckedChange={(checked) => setMarketingOptIn(checked === true)}
                    className="mt-0.5 border-white/20 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    data-testid="checkbox-marketing"
                  />
                  <label 
                    htmlFor="marketing-optin" 
                    className="text-[10px] text-white/50 leading-relaxed cursor-pointer"
                  >
                    I agree to receive news, music releases, and marketing updates from JADYN.
                  </label>
                </div>
                {subscribeMutation.isError && (
                  <p className="text-[10px] text-red-400 leading-relaxed" role="alert" data-testid="text-subscribe-error">
                    Something went wrong signing you up. Please try again.
                  </p>
                )}
              </div>
            )}
          </motion.div>

        </div>
        </div>

        <Footer />
      </motion.div>
    </main>
  );
}

const gigMonth = new Intl.DateTimeFormat("en-AU", { month: "short", timeZone: "Australia/Sydney" });
const gigDay = new Intl.DateTimeFormat("en-AU", { day: "2-digit", timeZone: "Australia/Sydney" });
const gigWhen = new Intl.DateTimeFormat("en-AU", { weekday: "short", hour: "numeric", minute: "2-digit", timeZone: "Australia/Sydney" });

function LiveShows() {
  const now = Date.now();
  const upcoming = GIGS
    .filter((g) => Date.parse(g.start) + GIG_EXPIRY_HOURS * 3_600_000 > now)
    .sort((a, b) => Date.parse(a.start) - Date.parse(b.start));

  if (upcoming.length === 0) return null;

  return (
    <motion.section
      aria-labelledby="gigs-title"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8 }}
      className="bg-[#1a1d26] rounded-2xl p-5 border border-white/5 space-y-4"
    >
      <div className="space-y-1">
        <h3 id="gigs-title" className="text-sm font-bold text-white uppercase tracking-wider">Live Shows</h3>
        <p className="text-[10px] text-white/40 leading-relaxed font-medium">Catch JADYN live.</p>
      </div>

      <ul className="space-y-2">
        {upcoming.map((g) => {
          const date = new Date(g.start);
          const sold = g.status === "sold";
          const trackingId = `tickets-${g.name}`.toLowerCase().replace(/[^a-z0-9]+/g, "-");
          return (
            <li
              key={g.start + g.venue}
              className={`flex items-center gap-3 p-3 rounded-xl bg-black/20 border border-white/5 transition-colors hover:bg-[#20242e] hover:border-white/10 ${sold ? "opacity-60" : ""}`}
              data-testid={`gig-${trackingId}`}
            >
              <div className="w-11 shrink-0 flex flex-col items-center leading-none">
                <span className={`text-[10px] font-bold tracking-widest uppercase ${sold ? "text-white/50" : "text-primary"}`}>
                  {gigMonth.format(date).replace(".", "")}
                </span>
                <span className="font-display text-[22px] font-black italic tracking-tighter text-white mt-1">
                  {gigDay.format(date)}
                </span>
              </div>
              <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                <span className="text-sm font-semibold text-white/90 truncate">{g.name}</span>
                <span className="text-xs text-white/50 leading-snug">
                  {g.venue}, {g.city} · {gigWhen.format(date).replace(/:00/, "").replace(/\s?([ap]m)/i, "$1")}
                  {g.status === "few" && <span className="text-primary"> · Few left</span>}
                </span>
              </div>
              {sold ? (
                <span className="text-[10px] font-bold tracking-widest uppercase text-white/40 px-2">Sold out</span>
              ) : (
                <Button
                  size="sm"
                  onClick={() => openSmartLink(g.href, `Tickets ${g.name}`, trackingId)}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold active:scale-95"
                  aria-label={`Tickets for ${g.name} at ${g.venue}, ${g.city}`}
                  data-testid={`button-${trackingId}`}
                >
                  Tickets
                </Button>
              )}
            </li>
          );
        })}
      </ul>
    </motion.section>
  );
}

function LinkItem({ icon, label, delay, href }: { icon: React.ReactNode, label: string, delay: number, href?: string }) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!href) return;
    const trackingId = label.toLowerCase().replace(/\s+/g, "-");
    openSmartLink(href, label, trackingId);
  };

  return (
    <motion.div
      onClick={handleClick}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      className="flex items-center justify-between p-4 bg-[#1a1d26] hover:bg-[#20242e] border border-white/5 rounded-2xl transition-all group cursor-pointer active:scale-[0.98] hover:border-white/10"
      data-testid={`link-${label.toLowerCase().replace(/\s+/g, "-")}`}
    >
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-black/20 flex items-center justify-center group-hover:bg-white/5 transition-colors border border-white/5">
          {icon}
        </div>
        <span className="text-sm font-bold text-white/90 group-hover:text-white transition-colors">{label}</span>
      </div>
      <ExternalLink className="w-4 h-4 text-white/20 group-hover:text-white/60 transition-colors" />
    </motion.div>
  );
}

function SpotifyIcon(props: any) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
    </svg>
  );
}

function YoutubeIcon(props: any) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  );
}
