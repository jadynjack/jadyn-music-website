import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, Music, Play, Heart, ChevronRight, Send, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import portraitImage from "@assets/PXL_20230416_074727800~4_(1)_1768734324398.jpg";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import logoImage from "@assets/logo-white_1768735494982.png";
import appleMusicLogo from "@assets/Apple_Music_icon.svg_1768739002544.png";
import Footer from "@/components/Footer";

interface CharityData {
  id: string;
  name: string;
  voteCount: number;
  percentage: number;
}

interface SiteSettings {
  spotifyLink: string;
  appleMusicLink: string;
  youtubeMusicLink: string;
}

export default function Vote() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [selectedCharity, setSelectedCharity] = React.useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [marketingOptIn, setMarketingOptIn] = React.useState(false);
  const [hasVoted, setHasVoted] = React.useState(false);
  const [showThankYou, setShowThankYou] = React.useState(false);
  const [voteError, setVoteError] = React.useState<string | null>(null);
  const [resultsCharities, setResultsCharities] = React.useState<CharityData[]>([]);

  const { data: charities, isLoading } = useQuery<CharityData[]>({
    queryKey: ["/api/charities"],
  });

  const { data: siteSettings } = useQuery<SiteSettings>({
    queryKey: ["/api/site-settings"],
  });

  const voteMutation = useMutation({
    mutationFn: async ({ charityId, email, marketingOptIn }: { charityId: string; email: string; marketingOptIn: boolean }) => {
      const res = await apiRequest("POST", "/api/votes", { charityId, email, marketingOptIn });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to vote");
      }
      return res.json();
    },
    onSuccess: (data) => {
      setResultsCharities(data.charities);
      setIsModalOpen(false);
      setHasVoted(true);
      setMarketingOptIn(false);
      queryClient.invalidateQueries({ queryKey: ["/api/charities"] });
      setTimeout(() => {
        setShowThankYou(true);
      }, 4000);
    },
    onError: (error: Error) => {
      setVoteError(error.message);
    },
  });

  const handleVoteClick = (id: string) => {
    if (hasVoted) return;
    setSelectedCharity(id);
    setVoteError(null);
    setIsModalOpen(true);
  };

  const handleVoteSubmit = () => {
    if (!email || !selectedCharity) return;
    voteMutation.mutate({ charityId: selectedCharity, email, marketingOptIn });
  };

  const shareLink = `${window.location.origin}/vote`;
  const [copied, setCopied] = React.useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const displayCharities = hasVoted ? resultsCharities : charities;

  return (
    <div className="min-h-screen flex items-start sm:items-center justify-center p-0 sm:p-4 bg-[#050608] relative overflow-hidden">
      {/* Background Ambient Effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-[120px] pointer-events-none" />
      
      {/* Main Card Container */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-full sm:max-w-[380px] min-h-screen sm:min-h-0 bg-[#12141c] rounded-none sm:rounded-[32px] border-0 sm:border border-white/5 shadow-2xl overflow-hidden relative mx-auto flex flex-col"
      >
        <AnimatePresence mode="wait">
          {!showThankYou ? (
            <motion.div key="vote-content" className="flex-1 flex flex-col">
              {/* Profile / Hero Section */}
              <div className="relative h-[400px] w-full">
                <div className="absolute inset-0">
                  <img 
                    src={portraitImage} 
                    className="w-full h-full object-cover opacity-80 object-[20%_center]"
                    alt="Vanya"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#12141c] via-[#12141c]/40 to-transparent" />
                </div>

                <div className="absolute top-8 left-0 right-0 flex justify-center z-10">
                  <img 
                    src={logoImage} 
                    alt="Logo" 
                    className="h-36 w-auto object-contain drop-shadow-lg"
                  />
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-8 pt-20 flex flex-col items-center text-center z-10">
                  <h2 className="font-display text-4xl font-black italic tracking-tighter text-white mb-2 uppercase">Vote For Charity</h2>
                  <p className="text-white/60 text-xs font-medium tracking-wide max-w-[240px]">Every 100 streams of my music triggers a $5 donation. Pick where the money goes:</p>
                </div>
              </div>

              {/* Content Section */}
              <div className="px-5 pb-8 space-y-4">
                <AnimatePresence mode="wait">
                  {!hasVoted ? (
                    <motion.div 
                      key="voting"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-3"
                    >
                      {isLoading ? (
                        <div className="text-white/40 text-center py-8">Loading charities...</div>
                      ) : (
                        charities?.map((charity, index) => (
                          <motion.button
                            key={charity.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            onClick={() => handleVoteClick(charity.id)}
                            className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all active:scale-[0.98] ${
                              selectedCharity === charity.id 
                                ? "bg-primary/10 border-primary/50 text-primary" 
                                : "bg-[#1a1d26] border-white/5 text-white/90 hover:border-white/10"
                            }`}
                            data-testid={`button-charity-${charity.id}`}
                          >
                            <span className="text-sm font-bold uppercase tracking-wider">{charity.name}</span>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedCharity === charity.id ? "border-primary bg-primary" : "border-white/10"}`}>
                              {selectedCharity === charity.id && <div className="w-2 h-2 bg-black rounded-full" />}
                            </div>
                          </motion.button>
                        ))
                      )}
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="results"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-[#1a1d26] rounded-2xl p-6 border border-white/5 space-y-6"
                    >
                      <div className="text-center space-y-1">
                        <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary/20 mb-2">
                          <CheckCircle2 className="w-5 h-5 text-primary" />
                        </div>
                        <h3 className="text-lg font-bold text-white uppercase tracking-tighter">Vote Recorded</h3>
                        <p className="text-[10px] text-white/40 uppercase tracking-widest">Current Standing</p>
                      </div>

                      <div className="space-y-5">
                        {displayCharities?.map((charity) => {
                          const isSelected = charity.id === selectedCharity;
                          return (
                            <div key={charity.id} className="space-y-2">
                              <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                                <span className={isSelected ? "text-primary" : "text-white/60"}>
                                  {charity.name} {isSelected && "(Your Vote)"}
                                </span>
                                <span className="text-white">{charity.percentage}%</span>
                              </div>
                              <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden border border-white/5">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${charity.percentage}%` }}
                                  transition={{ duration: 1, ease: "easeOut" }}
                                  className={`h-full rounded-full ${isSelected ? "bg-primary shadow-[0_0_10px_rgba(45,212,191,0.5)]" : "bg-white/20"}`}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      
                      <Button 
                        onClick={() => setShowThankYou(true)}
                        className="w-full bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 font-bold uppercase tracking-widest text-[10px] h-10"
                        data-testid="button-continue"
                      >
                        Continue
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="thank-you"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 px-8 py-12 flex flex-col items-center text-center space-y-8"
            >
              <div className="space-y-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <Heart className="w-8 h-8 text-primary fill-primary/20" />
                </div>
                <h2 className="font-display text-4xl font-black italic uppercase tracking-tighter text-white">Thank You!</h2>
                <p className="text-white/60 text-sm leading-relaxed max-w-[240px] mx-auto">
                  Your voice matters. Now, let's keep the music playing.
                </p>
              </div>

              <div className="w-full space-y-3">
                <StreamLink
                  icon={<SpotifyIcon className="w-5 h-5 text-[#1DB954]" />}
                  label="Listen on Spotify"
                  href={siteSettings?.spotifyLink}
                />
                <StreamLink
                  icon={<img src={appleMusicLogo} alt="Apple Music" className="w-6 h-6 object-contain rounded-[4px]" />}
                  label="Listen on Apple Music"
                  href={siteSettings?.appleMusicLink}
                />
                <StreamLink
                  icon={<YoutubeIcon className="w-5 h-5 text-[#FF0000]" />}
                  label="Listen on YouTube Music"
                  href={siteSettings?.youtubeMusicLink}
                />

                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-3 mt-4">
                  <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Share & Support</p>
                  <div className="flex gap-2">
                    <div className="flex-1 bg-black/40 border border-white/5 rounded-xl h-10 px-3 flex items-center overflow-hidden">
                      <span className="text-[10px] text-white/20 truncate">{shareLink}</span>
                    </div>
                    <Button 
                      onClick={copyToClipboard}
                      className="h-10 px-4 bg-white/10 hover:bg-white/20 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all"
                      data-testid="button-copy-link"
                    >
                      {copied ? "Copied" : "Copy"}
                    </Button>
                  </div>
                </div>
              </div>

              <Button 
                onClick={() => setLocation("/")}
                variant="ghost" 
                className="text-[10px] font-bold uppercase tracking-widest text-white/20 hover:text-white"
                data-testid="button-return"
              >
                Return to Profile
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
        
        <div className="mt-auto">
          <Footer />
        </div>
      </motion.div>

      {/* Vote Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-[#12141c] border-white/10 text-white rounded-[2rem] max-w-[340px]">
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-xl font-display font-bold italic uppercase">Confirm Your Vote</DialogTitle>
            <DialogDescription className="text-white/40 text-xs">
              Please enter your email to finalize your vote for {charities?.find(c => c.id === selectedCharity)?.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            {voteError && (
              <div className="text-red-400 text-xs bg-red-400/10 border border-red-400/20 rounded-lg p-3">
                {voteError}
              </div>
            )}
            <Input 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email" 
              className="bg-black/20 border-white/5 h-12 text-sm text-white placeholder:text-white/20 rounded-xl"
              data-testid="input-vote-email"
            />
            <div className="flex items-start gap-2">
              <Checkbox 
                id="vote-marketing-optin"
                checked={marketingOptIn}
                onCheckedChange={(checked) => setMarketingOptIn(checked === true)}
                className="mt-0.5 border-white/20 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                data-testid="checkbox-vote-marketing"
              />
              <label 
                htmlFor="vote-marketing-optin" 
                className="text-[10px] text-white/50 leading-relaxed cursor-pointer"
              >
                I agree to receive news, music releases, and marketing updates from JADYN.
              </label>
            </div>
            <Button 
              onClick={handleVoteSubmit}
              disabled={!email || voteMutation.isPending}
              className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-bold uppercase tracking-widest rounded-xl shadow-[0_0_20px_rgba(45,212,191,0.3)] transition-all active:scale-95"
              data-testid="button-submit-vote"
            >
              {voteMutation.isPending ? "Voting..." : "Vote Now"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StreamLink({ icon, label, href }: { icon: React.ReactNode, label: string, href?: string }) {
  return (
    <a
      href={href || "#"}
      target={href ? "_blank" : undefined}
      rel={href ? "noopener noreferrer" : undefined}
      className="flex items-center justify-between p-4 bg-[#1a1d26] hover:bg-[#20242e] border border-white/5 rounded-2xl transition-all group cursor-pointer active:scale-[0.98] hover:border-white/10"
      data-testid={`link-${label.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-black/20 flex items-center justify-center group-hover:bg-white/5 transition-colors border border-white/5">
          {icon}
        </div>
        <span className="text-sm font-bold text-white/90 group-hover:text-white transition-colors">{label}</span>
      </div>
      <ExternalLink className="w-4 h-4 text-white/20 group-hover:text-white/60 transition-colors" />
    </a>
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
