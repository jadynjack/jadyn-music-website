import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, Music, Play, Heart, ChevronRight, Send, Info, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import portraitImage from "@assets/PXL_20230416_074727800~4_(1)_1768734324398.jpg";
import appleMusicLogo from "@assets/Apple_Music_icon.svg_1768739002544.png";
import logoImage from "@assets/logo-white_1768735494982.png";
import Footer from "@/components/Footer";

interface CharityData {
  id: string;
  name: string;
  voteCount: number;
  percentage: number;
}

interface StreamStatsData {
  spotifyStreams: number;
  appleMusicStreams: number;
  youtubeMusicStreams: number;
  totalStreams: number;
  dollarsRaised: number;
}

interface SiteSettingsData {
  songTitle: string;
  songSubtitle: string;
  spotifyLink: string;
  appleMusicLink: string;
  youtubeMusicLink: string;
}

export default function Home() {
  const [, setLocation] = useLocation();
  const [showInfo, setShowInfo] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [marketingOptIn, setMarketingOptIn] = React.useState(false);
  const [subscribed, setSubscribed] = React.useState(false);

  const { data: charities } = useQuery<CharityData[]>({
    queryKey: ["/api/charities"],
  });

  const { data: streamStats } = useQuery<StreamStatsData>({
    queryKey: ["/api/stream-stats"],
  });

  const { data: siteSettings } = useQuery<SiteSettingsData>({
    queryKey: ["/api/site-settings"],
  });

  const subscribeMutation = useMutation({
    mutationFn: async (data: { email: string; marketingOptIn: boolean }) => {
      const res = await apiRequest("POST", "/api/subscribers", data);
      return res.json();
    },
    onSuccess: () => {
      setSubscribed(true);
      setEmail("");
      setMarketingOptIn(false);
    },
  });

  const leadingCharity = charities?.reduce((prev, current) => 
    (prev.percentage > current.percentage) ? prev : current
  , charities[0]);

  const raised = streamStats?.dollarsRaised || 0;
  const totalStreams = streamStats?.totalStreams || 0;
  const progressPercent = Math.min((totalStreams / 100000) * 100, 100);

  const handleSubscribe = () => {
    if (email && email.includes("@")) {
      subscribeMutation.mutate({ email, marketingOptIn });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-0 sm:p-4 bg-[#050608] relative overflow-hidden">
      {/* Background Ambient Effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-[120px] pointer-events-none" />
      
      {/* Main Card Container */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-full sm:max-w-[380px] bg-[#12141c] rounded-none sm:rounded-[32px] border-0 sm:border border-white/5 shadow-2xl overflow-hidden relative mx-auto"
      >
        {/* Info Box Overlay */}
        <AnimatePresence>
          {showInfo && (
            <motion.div 
              initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
              animate={{ opacity: 1, backdropFilter: "blur(24px)" }}
              exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
              className="absolute inset-0 z-50 bg-[#12141c]/95 p-8 flex flex-col justify-center"
            >
              <button 
                onClick={() => setShowInfo(false)}
                className="absolute top-6 right-6 p-2 text-white/40 hover:text-white transition-colors"
                data-testid="button-close-info"
              >
                <X className="w-6 h-6" />
              </button>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="font-display text-2xl font-black italic uppercase tracking-tighter text-primary">The Glimmer Fund</h3>
                  <div className="h-px w-12 bg-primary/50" />
                </div>
                
                <div className="space-y-4 text-white/80 text-sm leading-relaxed">
                  <p>
                    The math is simple: for every 100 times you listen to my music, I'm putting $5 toward a cause that matters. I don't choose the charity, you do. Cast your vote below, and we'll turn those listens into something real.
                  </p>
                  <blockquote className="border-l-2 border-primary/30 pl-4 py-1 text-xs text-white/60 italic leading-loose">
                    "Each time a man stands up for an ideal... he sends forth a tiny ripple of hope." <br/>
                    <span className="text-primary/60 not-italic font-bold">— Robert F. Kennedy</span>
                  </blockquote>
                </div>

                <Button 
                  onClick={() => setShowInfo(false)}
                  className="w-full bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 font-bold uppercase tracking-widest text-xs h-12 rounded-xl mt-4"
                  data-testid="button-dismiss-info"
                >
                  Got it
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Profile / Hero Section */}
        <div className="relative h-[480px] w-full">
          {/* Image */}
          <div className="absolute inset-0">
            <img 
              src={portraitImage} 
              alt="Vanya - Midnight" 
              className="w-full h-full object-cover opacity-90 object-[20%_center]"
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#12141c] via-[#12141c]/20 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-b from-[#12141c]/80 via-transparent to-transparent" />
          </div>

          {/* Top Artist Name */}
          <div className="absolute top-8 left-0 right-0 flex justify-center z-10">
            <img 
              src={logoImage} 
              alt="Logo" 
              className="h-32 w-auto object-contain drop-shadow-lg"
            />
          </div>

          {/* Song Info (Bottom of Image) */}
          <div className="absolute bottom-0 left-0 right-0 p-8 pt-20 flex flex-col items-center text-center z-10">
            <motion.span 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-bold tracking-widest text-white/90 border border-white/10 mb-4 uppercase"
            >
              New Release
            </motion.span>
            
            <motion.h2 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="font-display text-5xl font-black italic tracking-tighter text-white mb-2 drop-shadow-xl uppercase"
            >
              {siteSettings?.songTitle || "RAINBOW"}
            </motion.h2>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-white/60 text-sm font-medium tracking-wide"
            >
              {siteSettings?.songSubtitle || "New single out now on all platforms"}
            </motion.p>
          </div>
        </div>

        {/* Content Section */}
        <div className="px-5 pb-8 space-y-5">
          
          {/* Charity Goal */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-[#1a1d26] rounded-2xl p-5 border border-white/5 shadow-inner"
          >
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2 text-white/90">
                <Heart className="w-4 h-4 fill-primary text-primary" />
                <span className="font-bold tracking-wider uppercase text-[13px]">100 Listens = $5 to charity</span>
              </div>
              <button 
                onClick={() => setShowInfo(true)}
                className="p-1 text-white/40 hover:text-primary transition-colors active:scale-90"
                data-testid="button-info-campaign"
              >
                <Info className="w-4 h-4" />
              </button>
            </div>
            
            <div className="relative h-3 w-full bg-black/40 rounded-full mb-3 border border-white/5 shadow-inner">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ delay: 0.8, duration: 1, ease: "easeOut" }}
                className="absolute top-0 left-0 h-full bg-primary rounded-full"
                style={{
                  backgroundImage: `
                    radial-gradient(circle at 30% 30%, rgba(255,255,255,0.4) 0%, transparent 40%),
                    radial-gradient(circle at 70% 60%, rgba(255,255,255,0.3) 0%, transparent 30%),
                    linear-gradient(to bottom, rgba(255,255,255,0.2), transparent 40%, rgba(0,0,0,0.2) 80%)
                  `,
                  boxShadow: `
                    0 0 20px rgba(45,212,191,0.4),
                    inset 0 2px 4px rgba(255,255,255,0.5),
                    inset 0 -2px 4px rgba(0,0,0,0.3)
                  `,
                  filter: 'contrast(1.2) brightness(1.1)'
                }}
              />
            </div>
            
            <div className="flex justify-between items-end">
              <div>
                <div className="text-xl font-bold text-white mb-0.5">${raised.toLocaleString()}</div>
                <div className="text-[10px] text-white/40 uppercase tracking-wide font-medium">
                  Raised for a charity of your choice
                </div>
              </div>
              <Button 
                onClick={() => setLocation("/vote")}
                variant="ghost" 
                size="sm" 
                className="h-7 text-[10px] font-bold text-primary hover:text-primary hover:bg-primary/10 px-3 uppercase tracking-wider -mr-2"
              >
                Vote For Charity
              </Button>
            </div>
          </motion.div>

          {/* Links */}
          <div className="space-y-3">
            <LinkItem 
              delay={0.6}
              icon={<SpotifyIcon className="w-5 h-5 text-[#1DB954]" />}
              label="Listen on Spotify"
              href={siteSettings?.spotifyLink}
            />
            <LinkItem 
              delay={0.7}
              icon={<img src={appleMusicLogo} alt="Apple Music" className="w-6 h-6 object-contain rounded-[4px]" />}
              label="Listen on Apple Music"
              href={siteSettings?.appleMusicLink}
            />
            <LinkItem 
              delay={0.8}
              icon={<YoutubeIcon className="w-5 h-5 text-[#FF0000]" />}
              label="Listen on YouTube Music"
              href={siteSettings?.youtubeMusicLink}
            />
          </div>

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
                <span className="text-sm font-bold">You're in! Check your inbox.</span>
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
              </div>
            )}
          </motion.div>

        </div>
        
        <Footer />
      </motion.div>
    </div>
  );
}

function LinkItem({ icon, label, delay, href }: { icon: React.ReactNode, label: string, delay: number, href?: string }) {
  return (
    <motion.a
      href={href || "#"}
      target={href ? "_blank" : undefined}
      rel={href ? "noopener noreferrer" : undefined}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      className="flex items-center justify-between p-4 bg-[#1a1d26] hover:bg-[#20242e] border border-white/5 rounded-2xl transition-all group cursor-pointer active:scale-[0.98] hover:border-white/10"
    >
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-black/20 flex items-center justify-center group-hover:bg-white/5 transition-colors border border-white/5">
          {icon}
        </div>
        <span className="text-sm font-bold text-white/90 group-hover:text-white transition-colors">{label}</span>
      </div>
      <ExternalLink className="w-4 h-4 text-white/20 group-hover:text-white/60 transition-colors" />
    </motion.a>
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
