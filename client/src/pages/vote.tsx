import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, Music, Play, Heart, ChevronRight, Send, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocation } from "wouter";
import portraitImage from "@assets/PXL_20230416_074727800~4_(1)_1768734324398.jpg";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

import logoImage from "@assets/logo-white_1768735494982.png";

const CHARITIES = [
  { id: "music-cares", name: "Music Cares", initialVotes: 45 },
  { id: "save-the-music", name: "Save The Music", initialVotes: 30 },
  { id: "girls-rock", name: "Girls Rock Camp", initialVotes: 25 },
];

export default function Vote() {
  const [, setLocation] = useLocation();
  const [selectedCharity, setSelectedCharity] = React.useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [hasVoted, setHasVoted] = React.useState(false);
  const [showThankYou, setShowThankYou] = React.useState(false);

  const handleVoteClick = (id: string) => {
    if (hasVoted) return;
    setSelectedCharity(id);
    setIsModalOpen(true);
  };

  const handleVoteSubmit = () => {
    if (!email) return;
    setIsModalOpen(false);
    setHasVoted(true);
    // Automatically transition to thank you after 3 seconds of showing results
    setTimeout(() => {
      setShowThankYou(true);
    }, 4000);
  };

  const shareLink = `${window.location.origin}/vote`;
  const [copied, setCopied] = React.useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#050608] relative overflow-hidden">
      {/* Background Ambient Effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Card Container */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-[380px] bg-[#12141c] rounded-[32px] border border-white/5 shadow-2xl overflow-hidden relative mx-auto"
      >
        <AnimatePresence mode="wait">
          {!showThankYou ? (
            <motion.div key="vote-content">
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
                    className="h-24 w-auto object-contain drop-shadow-lg"
                  />
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-8 pt-20 flex flex-col items-center text-center z-10">
                  <h2 className="font-display text-4xl font-black italic tracking-tighter text-white mb-2 uppercase">Vote For Charity</h2>
                  <p className="text-white/60 text-xs font-medium tracking-wide max-w-[200px]">Which charity should receive the tour proceeds?</p>
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
                      {CHARITIES.map((charity, index) => (
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
                        >
                          <span className="text-sm font-bold uppercase tracking-wider">{charity.name}</span>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedCharity === charity.id ? "border-primary bg-primary" : "border-white/10"}`}>
                            {selectedCharity === charity.id && <div className="w-2 h-2 bg-black rounded-full" />}
                          </div>
                        </motion.button>
                      ))}
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
                        {CHARITIES.map((charity) => {
                          const isSelected = charity.id === selectedCharity;
                          const percentage = isSelected ? charity.initialVotes + 1 : charity.initialVotes;
                          return (
                            <div key={charity.id} className="space-y-2">
                              <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                                <span className={isSelected ? "text-primary" : "text-white/60"}>
                                  {charity.name} {isSelected && "(Your Vote)"}
                                </span>
                                <span className="text-white">{percentage}%</span>
                              </div>
                              <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden border border-white/5">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${percentage}%` }}
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
              className="px-8 py-12 flex flex-col items-center text-center space-y-8"
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

              <div className="w-full space-y-4">
                <Button 
                  onClick={() => window.open('https://spotify.com', '_blank')}
                  className="w-full h-14 bg-[#1DB954] hover:bg-[#1DB954]/90 text-white rounded-2xl flex items-center justify-center gap-3 font-bold uppercase tracking-widest shadow-lg active:scale-[0.98] transition-all"
                >
                  <Music className="w-5 h-5" />
                  Stream Midnight
                </Button>

                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-3">
                  <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Share & Support</p>
                  <div className="flex gap-2">
                    <div className="flex-1 bg-black/40 border border-white/5 rounded-xl h-10 px-3 flex items-center overflow-hidden">
                      <span className="text-[10px] text-white/20 truncate">{shareLink}</span>
                    </div>
                    <Button 
                      onClick={copyToClipboard}
                      className="h-10 px-4 bg-white/10 hover:bg-white/20 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all"
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
              >
                Return to Profile
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Vote Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-[#12141c] border-white/10 text-white rounded-[2rem] max-w-[340px]">
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-xl font-display font-bold italic uppercase italic">Confirm Your Vote</DialogTitle>
            <DialogDescription className="text-white/40 text-xs">
              Please enter your email to finalize your vote for {CHARITIES.find(c => c.id === selectedCharity)?.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <Input 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email" 
              className="bg-black/20 border-white/5 h-12 text-sm text-white placeholder:text-white/20 rounded-xl"
            />
            <Button 
              onClick={handleVoteSubmit}
              disabled={!email}
              className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-bold uppercase tracking-widest rounded-xl shadow-[0_0_20px_rgba(45,212,191,0.3)] transition-all active:scale-95"
            >
              Vote Now
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}