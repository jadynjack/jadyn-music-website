import { motion } from "framer-motion";
import { ExternalLink, Music, Play, Heart, ChevronRight, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import portraitImage from "@assets/generated_images/portrait_of_a_female_musician_for_album_cover.png";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#050608] relative overflow-hidden">
      {/* Background Ambient Effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Card Container */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-[380px] bg-[#12141c] rounded-[32px] border border-white/5 shadow-2xl overflow-hidden relative mx-auto"
      >
        {/* Profile / Hero Section */}
        <div className="relative h-[480px] w-full">
          {/* Image */}
          <div className="absolute inset-0">
            <img 
              src={portraitImage} 
              alt="Vanya - Midnight" 
              className="w-full h-full object-cover opacity-90"
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#12141c] via-[#12141c]/20 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-b from-[#12141c]/80 via-transparent to-transparent" />
          </div>

          {/* Top Artist Name */}
          <div className="absolute top-8 left-0 right-0 text-center z-10">
            <h1 className="font-display text-2xl font-bold tracking-[0.2em] text-white drop-shadow-lg uppercase">
              Vanya
            </h1>
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
              Midnight
            </motion.h2>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-white/60 text-sm font-medium tracking-wide"
            >
              Out now on all platforms
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
                <span className="text-[10px] font-bold tracking-wider uppercase">Tour Charity Goal</span>
              </div>
              <span className="text-[10px] font-bold text-white/60">75%</span>
            </div>
            
            <div className="relative h-2 w-full bg-black/40 rounded-full overflow-hidden mb-3 border border-white/5">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: "75%" }}
                transition={{ delay: 0.8, duration: 1, ease: "easeOut" }}
                className="absolute top-0 left-0 h-full bg-primary rounded-full shadow-[0_0_15px_rgba(45,212,191,0.6)]"
              />
            </div>
            
            <div className="flex justify-between items-end">
              <div>
                <div className="text-xl font-bold text-white mb-0.5">$12,450</div>
                <div className="text-[10px] text-white/40 uppercase tracking-wide font-medium">Raised for Music Cares</div>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 text-[10px] font-bold text-primary hover:text-primary hover:bg-primary/10 px-3 uppercase tracking-wider -mr-2"
              >
                Donate
              </Button>
            </div>
          </motion.div>

          {/* Links */}
          <div className="space-y-3">
            <LinkItem 
              delay={0.6}
              icon={<SpotifyIcon className="w-5 h-5 text-[#1DB954]" />}
              label="Stream on Spotify"
            />
            <LinkItem 
              delay={0.7}
              icon={<AppleMusicIcon className="w-5 h-5 text-[#FA243C]" />}
              label="Apple Music"
            />
            <LinkItem 
              delay={0.8}
              icon={<YoutubeIcon className="w-5 h-5 text-[#FF0000]" />}
              label="Watch Music Video"
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
            
            <div className="flex gap-2">
              <Input 
                placeholder="email@example.com" 
                className="bg-black/20 border-white/5 h-10 text-xs text-white placeholder:text-white/20 rounded-xl focus:ring-primary focus:border-primary"
              />
              <Button 
                size="icon" 
                className="h-10 w-10 shrink-0 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-[0_0_15px_rgba(45,212,191,0.3)] transition-all active:scale-95"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>

        </div>
      </motion.div>
    </div>
  );
}

function LinkItem({ icon, label, delay }: { icon: React.ReactNode, label: string, delay: number }) {
  return (
    <motion.a
      href="#"
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

// Simple Icon Components for brands
function SpotifyIcon(props: any) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
    </svg>
  );
}

function AppleMusicIcon(props: any) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M15.281 12.551c0-2.479 2.019-3.718 2.108-3.769-.009-.04-.428-1.469-1.398-1.89-1.17-.509-2.28-.109-2.28-.109s-1.11-.6-3.08-.6c-2.459 0-4.708 2.189-4.708 5.618 0 3.739 3.198 8.129 6.278 8.129 1.139 0 1.659-.619 3.178-.619 1.519 0 1.94.619 3.169.609 2.059-.08 3.329-2.709 3.329-2.709s-1.599-.959-1.599-4.659zm-3.048-8.558c.959-1.169 1.609-2.779 1.429-4.399-1.389.05-3.069.919-4.069 2.119-.899 1.039-1.689 2.699-1.479 4.289 1.549.12 3.129-.81 4.119-2.009z"/>
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