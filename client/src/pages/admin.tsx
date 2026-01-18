import * as React from "react";
import { motion } from "framer-motion";
import { Music, Save, ArrowLeft, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import logoImage from "@assets/logo-white_1768735494982.png";

interface StreamStatsData {
  id: string;
  spotifyStreams: number;
  appleMusicStreams: number;
  youtubeMusicStreams: number;
  totalStreams: number;
  dollarsRaised: number;
  updatedAt: string;
}

export default function Admin() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [spotify, setSpotify] = React.useState("");
  const [appleMusic, setAppleMusic] = React.useState("");
  const [youtubeMusic, setYoutubeMusic] = React.useState("");
  const [saved, setSaved] = React.useState(false);

  const { data: stats, isLoading } = useQuery<StreamStatsData>({
    queryKey: ["/api/stream-stats"],
  });

  React.useEffect(() => {
    if (stats) {
      setSpotify(stats.spotifyStreams.toString());
      setAppleMusic(stats.appleMusicStreams.toString());
      setYoutubeMusic(stats.youtubeMusicStreams.toString());
    }
  }, [stats]);

  const updateMutation = useMutation({
    mutationFn: async (data: { spotifyStreams: number; appleMusicStreams: number; youtubeMusicStreams: number }) => {
      const res = await apiRequest("POST", "/api/stream-stats", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/stream-stats"] });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    },
  });

  const handleSave = () => {
    const spotifyNum = parseInt(spotify) || 0;
    const appleMusicNum = parseInt(appleMusic) || 0;
    const youtubeMusicNum = parseInt(youtubeMusic) || 0;
    
    updateMutation.mutate({
      spotifyStreams: spotifyNum,
      appleMusicStreams: appleMusicNum,
      youtubeMusicStreams: youtubeMusicNum,
    });
  };

  const totalStreams = (parseInt(spotify) || 0) + (parseInt(appleMusic) || 0) + (parseInt(youtubeMusic) || 0);
  const dollarsRaised = Math.floor(totalStreams / 100) * 5;

  return (
    <div className="min-h-screen flex items-center justify-center p-0 sm:p-4 bg-[#050608] relative overflow-hidden">
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-[120px] pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-full sm:max-w-[420px] bg-[#12141c] rounded-none sm:rounded-[32px] border-0 sm:border border-white/5 shadow-2xl overflow-hidden relative mx-auto"
      >
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center justify-between mb-4">
            <Button 
              onClick={() => setLocation("/")}
              variant="ghost" 
              size="sm"
              className="text-white/40 hover:text-white -ml-2"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <img src={logoImage} alt="Logo" className="h-8 w-auto" />
          </div>
          <h1 className="font-display text-2xl font-black italic uppercase tracking-tighter text-white">Admin Panel</h1>
          <p className="text-white/40 text-xs mt-1">Update your streaming numbers</p>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-primary/10 border border-primary/20 rounded-2xl p-5 flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-primary">${dollarsRaised.toLocaleString()}</div>
              <div className="text-[10px] text-primary/60 uppercase tracking-widest font-bold mt-1">Raised for Charity</div>
            </div>
            <DollarSign className="w-10 h-10 text-primary/30" />
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-white/60 uppercase tracking-wider flex items-center gap-2">
                <SpotifyIcon className="w-4 h-4 text-[#1DB954]" />
                Spotify Listens
              </label>
              <Input 
                type="number"
                value={spotify}
                onChange={(e) => setSpotify(e.target.value)}
                placeholder="0"
                className="bg-black/20 border-white/10 h-12 text-lg text-white placeholder:text-white/20 rounded-xl"
                data-testid="input-spotify"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-white/60 uppercase tracking-wider flex items-center gap-2">
                <AppleMusicIcon className="w-4 h-4 text-[#FA243C]" />
                Apple Music Listens
              </label>
              <Input 
                type="number"
                value={appleMusic}
                onChange={(e) => setAppleMusic(e.target.value)}
                placeholder="0"
                className="bg-black/20 border-white/10 h-12 text-lg text-white placeholder:text-white/20 rounded-xl"
                data-testid="input-apple-music"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-white/60 uppercase tracking-wider flex items-center gap-2">
                <YoutubeIcon className="w-4 h-4 text-[#FF0000]" />
                YouTube Music Listens
              </label>
              <Input 
                type="number"
                value={youtubeMusic}
                onChange={(e) => setYoutubeMusic(e.target.value)}
                placeholder="0"
                className="bg-black/20 border-white/10 h-12 text-lg text-white placeholder:text-white/20 rounded-xl"
                data-testid="input-youtube-music"
              />
            </div>
          </div>

          <div className="pt-2 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-white/40">Total Listens</span>
              <span className="text-white font-bold">{totalStreams.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/40">Formula</span>
              <span className="text-white/60">100 listens = $5</span>
            </div>
          </div>

          <Button 
            onClick={handleSave}
            disabled={updateMutation.isPending}
            className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-bold uppercase tracking-widest rounded-xl shadow-[0_0_20px_rgba(45,212,191,0.3)] transition-all"
            data-testid="button-save"
          >
            {saved ? (
              <>Saved!</>
            ) : updateMutation.isPending ? (
              <>Saving...</>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

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
      <path d="M23.994 6.124a9.23 9.23 0 00-.24-2.19c-.317-1.31-1.062-2.31-2.18-3.043a5.022 5.022 0 00-1.877-.726 10.496 10.496 0 00-1.564-.15c-.04-.003-.083-.01-.124-.013H5.986c-.152.01-.303.017-.455.026-.747.043-1.49.123-2.193.4-1.336.53-2.3 1.452-2.865 2.78-.192.448-.292.925-.363 1.408-.056.392-.088.785-.1 1.18 0 .032-.007.062-.01.093v12.223c.01.14.017.283.027.424.05.815.154 1.624.497 2.373.65 1.42 1.738 2.353 3.234 2.8.42.127.856.187 1.293.228.555.053 1.11.06 1.667.06h11.03c.525 0 1.048-.034 1.57-.1.823-.106 1.597-.35 2.296-.81a5.046 5.046 0 001.88-2.207c.186-.42.293-.87.37-1.324.113-.675.138-1.358.137-2.04-.002-3.8 0-7.595-.003-11.393zm-6.423 3.99v5.712c0 .417-.058.827-.244 1.206-.29.59-.76.962-1.388 1.14-.35.1-.706.157-1.07.173-.95.042-1.8-.6-1.93-1.465-.12-.807.36-1.556 1.157-1.857.433-.163.883-.26 1.338-.317.245-.03.49-.063.733-.106.13-.024.252-.067.342-.175.064-.076.092-.165.092-.26V9.625c0-.225-.017-.232-.226-.18-.467.115-.933.232-1.4.35-1.214.303-2.428.607-3.643.908-.064.017-.132.03-.178.093-.038.06-.043.135-.043.207-.003 2.253 0 4.505-.003 6.758 0 .376-.04.746-.172 1.1-.252.677-.7 1.143-1.39 1.385-.357.124-.725.19-1.105.22-.913.074-1.76-.47-1.97-1.257-.237-.887.2-1.707 1.082-2.03.428-.156.873-.245 1.322-.304.317-.04.633-.09.946-.15.06-.01.12-.025.174-.05.135-.067.18-.19.18-.34V8.1c0-.25.073-.44.286-.576.18-.112.384-.167.585-.21L17.06 6.03c.21-.054.432-.097.652-.1.23 0 .346.1.372.328.012.105.013.212.012.318v3.538h-.525z"/>
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
