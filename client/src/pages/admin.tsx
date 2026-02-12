import * as React from "react";
import { motion } from "framer-motion";
import { Save, ArrowLeft, DollarSign, Music, Link, Users, Plus, Trash2, LogOut, Disc } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import logoImage from "@assets/logo-white_1768735494982.png";
import Footer from "@/components/Footer";

interface StreamStatsData {
  id: string;
  spotifyStreams: number;
  appleMusicStreams: number;
  youtubeMusicStreams: number;
  totalStreams: number;
  dollarsRaised: number;
  updatedAt: string;
}

interface SiteSettingsData {
  id: string;
  songTitle: string;
  songSubtitle: string;
  spotifyLink: string;
  appleMusicLink: string;
  youtubeMusicLink: string;
  presaveEnabled: boolean;
  presaveTitle: string;
  presaveLink: string;
}

interface CharityData {
  id: string;
  name: string;
  voteCount: number;
  percentage: number;
}

export default function Admin() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user, isLoading: authLoading, isAuthenticated, isAdmin, logout } = useAuth();
  
  const [spotify, setSpotify] = React.useState("");
  const [appleMusic, setAppleMusic] = React.useState("");
  const [youtubeMusic, setYoutubeMusic] = React.useState("");
  const [streamsSaved, setStreamsSaved] = React.useState(false);
  
  const [songTitle, setSongTitle] = React.useState("");
  const [songSubtitle, setSongSubtitle] = React.useState("");
  const [spotifyLink, setSpotifyLink] = React.useState("");
  const [appleMusicLink, setAppleMusicLink] = React.useState("");
  const [youtubeMusicLink, setYoutubeMusicLink] = React.useState("");
  const [settingsSaved, setSettingsSaved] = React.useState(false);
  
  const [editCharities, setEditCharities] = React.useState<{id: string; name: string}[]>([]);
  const [charitiesSaved, setCharitiesSaved] = React.useState(false);
  
  const [presaveEnabled, setPresaveEnabled] = React.useState(false);
  const [presaveTitle, setPresaveTitle] = React.useState("");
  const [presaveLink, setPresaveLink] = React.useState("");
  const [presaveSaved, setPresaveSaved] = React.useState(false);

  const { data: stats } = useQuery<StreamStatsData>({
    queryKey: ["/api/stream-stats"],
    enabled: isAuthenticated,
  });

  const { data: settings } = useQuery<SiteSettingsData>({
    queryKey: ["/api/site-settings"],
    enabled: isAuthenticated,
  });

  const { data: charities } = useQuery<CharityData[]>({
    queryKey: ["/api/charities"],
    enabled: isAuthenticated,
  });

  React.useEffect(() => {
    if (stats) {
      setSpotify(stats.spotifyStreams.toString());
      setAppleMusic(stats.appleMusicStreams.toString());
      setYoutubeMusic(stats.youtubeMusicStreams.toString());
    }
  }, [stats]);

  React.useEffect(() => {
    if (settings) {
      setSongTitle(settings.songTitle || "");
      setSongSubtitle(settings.songSubtitle || "");
      setSpotifyLink(settings.spotifyLink || "");
      setAppleMusicLink(settings.appleMusicLink || "");
      setYoutubeMusicLink(settings.youtubeMusicLink || "");
      setPresaveEnabled(settings.presaveEnabled || false);
      setPresaveTitle(settings.presaveTitle || "");
      setPresaveLink(settings.presaveLink || "");
    }
  }, [settings]);

  React.useEffect(() => {
    if (charities) {
      setEditCharities(charities.map(c => ({ id: c.id, name: c.name })));
    }
  }, [charities]);

  const updateStreamsMutation = useMutation({
    mutationFn: async (data: { spotifyStreams: number; appleMusicStreams: number; youtubeMusicStreams: number }) => {
      const res = await apiRequest("POST", "/api/stream-stats", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/stream-stats"] });
      setStreamsSaved(true);
      setTimeout(() => setStreamsSaved(false), 2000);
    },
    onError: () => {
      toast({ title: "Error", description: "Please log in to save changes", variant: "destructive" });
    },
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/site-settings", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/site-settings"] });
      setSettingsSaved(true);
      setTimeout(() => setSettingsSaved(false), 2000);
    },
    onError: () => {
      toast({ title: "Error", description: "Please log in to save changes", variant: "destructive" });
    },
  });

  const updateCharitiesMutation = useMutation({
    mutationFn: async (data: { charities: { id: string; name: string }[] }) => {
      const res = await apiRequest("POST", "/api/charities/update", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/charities"] });
      setCharitiesSaved(true);
      setTimeout(() => setCharitiesSaved(false), 2000);
      toast({ title: "Charities Updated", description: "All votes have been reset" });
    },
    onError: () => {
      toast({ title: "Error", description: "Please log in to save changes", variant: "destructive" });
    },
  });

  const updatePresaveMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/site-settings", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/site-settings"] });
      setPresaveSaved(true);
      setTimeout(() => setPresaveSaved(false), 2000);
    },
    onError: () => {
      toast({ title: "Error", description: "Please log in to save changes", variant: "destructive" });
    },
  });

  const handleSaveStreams = () => {
    updateStreamsMutation.mutate({
      spotifyStreams: parseInt(spotify) || 0,
      appleMusicStreams: parseInt(appleMusic) || 0,
      youtubeMusicStreams: parseInt(youtubeMusic) || 0,
    });
  };

  const handleSaveSettings = () => {
    updateSettingsMutation.mutate({
      songTitle: songTitle || "RAINBOW",
      songSubtitle,
      spotifyLink,
      appleMusicLink,
      youtubeMusicLink,
    });
  };

  const handleSaveCharities = () => {
    const validCharities = editCharities.filter(c => c.id && c.name);
    if (validCharities.length === 0) {
      toast({ title: "Error", description: "Add at least one charity", variant: "destructive" });
      return;
    }
    updateCharitiesMutation.mutate({ charities: validCharities });
  };

  const handleSavePresave = () => {
    updatePresaveMutation.mutate({
      songTitle: songTitle || "RAINBOW",
      songSubtitle,
      spotifyLink,
      appleMusicLink,
      youtubeMusicLink,
      presaveEnabled,
      presaveTitle,
      presaveLink,
    });
  };

  const addCharity = () => {
    setEditCharities([...editCharities, { id: "", name: "" }]);
  };

  const removeCharity = (index: number) => {
    setEditCharities(editCharities.filter((_, i) => i !== index));
  };

  const updateCharity = (index: number, field: "id" | "name", value: string) => {
    const updated = [...editCharities];
    updated[index] = { ...updated[index], [field]: field === "id" ? value.toLowerCase().replace(/\s+/g, "-") : value };
    setEditCharities(updated);
  };

  const totalStreams = (parseInt(spotify) || 0) + (parseInt(appleMusic) || 0) + (parseInt(youtubeMusic) || 0);
  const dollarsRaised = Math.floor(totalStreams / 100) * 5;

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050608]">
        <div className="text-white/60">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#050608]">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-[380px] bg-[#12141c] rounded-[32px] border border-white/5 shadow-2xl p-8 text-center"
        >
          <img src={logoImage} alt="Logo" className="h-12 w-auto mx-auto mb-6" />
          <h1 className="font-display text-2xl font-black italic uppercase tracking-tighter text-white mb-2">Admin Access</h1>
          <p className="text-white/40 text-sm mb-8">Sign in to manage your site</p>
          <a href="/api/login">
            <Button className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-bold uppercase tracking-widest rounded-xl" data-testid="button-login">
              Sign In
            </Button>
          </a>
          <Button 
            onClick={() => setLocation("/")}
            variant="ghost" 
            className="mt-4 text-white/40 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Site
          </Button>
        </motion.div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#050608]">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-[380px] bg-[#12141c] rounded-[32px] border border-white/5 shadow-2xl p-8 text-center"
        >
          <img src={logoImage} alt="Logo" className="h-12 w-auto mx-auto mb-6" />
          <h1 className="font-display text-2xl font-black italic uppercase tracking-tighter text-white mb-2">Access Denied</h1>
          <p className="text-white/40 text-sm mb-8">You don't have permission to access this page.</p>
          <Button 
            onClick={() => setLocation("/")}
            className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-bold uppercase tracking-widest rounded-xl"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Site
          </Button>
          <Button 
            onClick={() => logout()}
            variant="ghost" 
            className="mt-4 text-white/40 hover:text-white"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050608] relative overflow-hidden">
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="max-w-2xl mx-auto p-4 sm:p-6 space-y-6">
        <div className="flex items-center justify-between">
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
          <a href="/api/logout">
            <Button variant="ghost" size="sm" className="text-white/40 hover:text-white">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </a>
        </div>

        <div className="text-center">
          <h1 className="font-display text-3xl font-black italic uppercase tracking-tighter text-white">Admin Dashboard</h1>
          <p className="text-white/40 text-sm mt-1">Welcome, {user?.firstName || user?.email || "Admin"}</p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#12141c] rounded-2xl border border-white/5 p-6"
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-white font-bold">Stream Counts</h2>
              <p className="text-white/40 text-xs">Enter your current streaming numbers</p>
            </div>
          </div>

          <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 mb-5 flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-primary">${dollarsRaised.toLocaleString()}</div>
              <div className="text-[10px] text-primary/60 uppercase tracking-widest font-bold">Total Raised</div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-white">{totalStreams.toLocaleString()}</div>
              <div className="text-[10px] text-white/40 uppercase tracking-widest">Total Listens</div>
            </div>
          </div>

          <div className="grid gap-4 mb-5">
            <div className="space-y-2">
              <label className="text-xs font-bold text-white/60 uppercase tracking-wider flex items-center gap-2">
                <SpotifyIcon className="w-4 h-4 text-[#1DB954]" />
                Spotify
              </label>
              <Input 
                type="number"
                value={spotify}
                onChange={(e) => setSpotify(e.target.value)}
                placeholder="0"
                className="bg-black/20 border-white/10 h-11 text-white placeholder:text-white/20 rounded-xl"
                data-testid="input-spotify"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-white/60 uppercase tracking-wider flex items-center gap-2">
                <AppleMusicIcon className="w-4 h-4 text-[#FA243C]" />
                Apple Music
              </label>
              <Input 
                type="number"
                value={appleMusic}
                onChange={(e) => setAppleMusic(e.target.value)}
                placeholder="0"
                className="bg-black/20 border-white/10 h-11 text-white placeholder:text-white/20 rounded-xl"
                data-testid="input-apple-music"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-white/60 uppercase tracking-wider flex items-center gap-2">
                <YoutubeIcon className="w-4 h-4 text-[#FF0000]" />
                YouTube Music
              </label>
              <Input 
                type="number"
                value={youtubeMusic}
                onChange={(e) => setYoutubeMusic(e.target.value)}
                placeholder="0"
                className="bg-black/20 border-white/10 h-11 text-white placeholder:text-white/20 rounded-xl"
                data-testid="input-youtube-music"
              />
            </div>
          </div>

          <Button 
            onClick={handleSaveStreams}
            disabled={updateStreamsMutation.isPending}
            className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-bold uppercase tracking-widest rounded-xl"
            data-testid="button-save-streams"
          >
            {streamsSaved ? "Saved!" : updateStreamsMutation.isPending ? "Saving..." : <><Save className="w-4 h-4 mr-2" />Save Streams</>}
          </Button>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#12141c] rounded-2xl border border-white/5 p-6"
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <Music className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-white font-bold">Song Settings</h2>
              <p className="text-white/40 text-xs">Update the featured song info</p>
            </div>
          </div>

          <div className="grid gap-4 mb-5">
            <div className="space-y-2">
              <label className="text-xs font-bold text-white/60 uppercase tracking-wider">Song Title</label>
              <Input 
                value={songTitle}
                onChange={(e) => setSongTitle(e.target.value)}
                placeholder="RAINBOW"
                className="bg-black/20 border-white/10 h-11 text-white placeholder:text-white/20 rounded-xl"
                data-testid="input-song-title"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-white/60 uppercase tracking-wider">Subtitle</label>
              <Input 
                value={songSubtitle}
                onChange={(e) => setSongSubtitle(e.target.value)}
                placeholder="New single out now on all platforms"
                className="bg-black/20 border-white/10 h-11 text-white placeholder:text-white/20 rounded-xl"
                data-testid="input-song-subtitle"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
              <Link className="w-4 h-4 text-white/40" />
            </div>
            <span className="text-sm text-white/60">Streaming Links</span>
          </div>

          <div className="grid gap-4 mb-5">
            <div className="space-y-2">
              <label className="text-xs font-bold text-white/60 uppercase tracking-wider flex items-center gap-2">
                <SpotifyIcon className="w-3 h-3 text-[#1DB954]" />
                Spotify URL
              </label>
              <Input 
                value={spotifyLink}
                onChange={(e) => setSpotifyLink(e.target.value)}
                placeholder="https://open.spotify.com/..."
                className="bg-black/20 border-white/10 h-11 text-white placeholder:text-white/20 rounded-xl text-sm"
                data-testid="input-spotify-link"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-white/60 uppercase tracking-wider flex items-center gap-2">
                <AppleMusicIcon className="w-3 h-3 text-[#FA243C]" />
                Apple Music URL
              </label>
              <Input 
                value={appleMusicLink}
                onChange={(e) => setAppleMusicLink(e.target.value)}
                placeholder="https://music.apple.com/..."
                className="bg-black/20 border-white/10 h-11 text-white placeholder:text-white/20 rounded-xl text-sm"
                data-testid="input-apple-music-link"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-white/60 uppercase tracking-wider flex items-center gap-2">
                <YoutubeIcon className="w-3 h-3 text-[#FF0000]" />
                YouTube Music URL
              </label>
              <Input 
                value={youtubeMusicLink}
                onChange={(e) => setYoutubeMusicLink(e.target.value)}
                placeholder="https://music.youtube.com/..."
                className="bg-black/20 border-white/10 h-11 text-white placeholder:text-white/20 rounded-xl text-sm"
                data-testid="input-youtube-music-link"
              />
            </div>
          </div>

          <Button 
            onClick={handleSaveSettings}
            disabled={updateSettingsMutation.isPending}
            className="w-full h-11 bg-blue-500 hover:bg-blue-500/90 text-white font-bold uppercase tracking-widest rounded-xl"
            data-testid="button-save-settings"
          >
            {settingsSaved ? "Saved!" : updateSettingsMutation.isPending ? "Saving..." : <><Save className="w-4 h-4 mr-2" />Save Settings</>}
          </Button>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[#12141c] rounded-2xl border border-white/5 p-6"
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-pink-500/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-pink-400" />
            </div>
            <div>
              <h2 className="text-white font-bold">Charity Voting</h2>
              <p className="text-white/40 text-xs">Updating charities will reset all votes</p>
            </div>
          </div>

          <div className="space-y-3 mb-5">
            {editCharities.map((charity, index) => (
              <div key={index} className="flex gap-2">
                <Input 
                  value={charity.name}
                  onChange={(e) => {
                    updateCharity(index, "name", e.target.value);
                    if (!charity.id || charity.id === editCharities[index].name.toLowerCase().replace(/\s+/g, "-")) {
                      updateCharity(index, "id", e.target.value);
                    }
                  }}
                  placeholder="Charity Name"
                  className="flex-1 bg-black/20 border-white/10 h-11 text-white placeholder:text-white/20 rounded-xl"
                  data-testid={`input-charity-name-${index}`}
                />
                <Button 
                  onClick={() => removeCharity(index)}
                  variant="ghost" 
                  size="icon"
                  className="h-11 w-11 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  disabled={editCharities.length <= 1}
                  data-testid={`button-remove-charity-${index}`}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>

          <Button 
            onClick={addCharity}
            variant="outline"
            className="w-full h-11 mb-4 border-white/10 text-white/60 hover:text-white hover:bg-white/5 rounded-xl"
            disabled={editCharities.length >= 5}
            data-testid="button-add-charity"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Charity
          </Button>

          <Button 
            onClick={handleSaveCharities}
            disabled={updateCharitiesMutation.isPending}
            className="w-full h-11 bg-pink-500 hover:bg-pink-500/90 text-white font-bold uppercase tracking-widest rounded-xl"
            data-testid="button-save-charities"
          >
            {charitiesSaved ? "Saved!" : updateCharitiesMutation.isPending ? "Saving..." : <><Save className="w-4 h-4 mr-2" />Save Charities</>}
          </Button>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-[#12141c] rounded-2xl border border-white/5 p-6"
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <Disc className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h2 className="text-white font-bold">Pre-Save Section</h2>
              <p className="text-white/40 text-xs">Promote upcoming music releases</p>
            </div>
          </div>

          <div className="flex items-center justify-between mb-5 p-4 bg-black/20 rounded-xl border border-white/5">
            <div>
              <div className="text-sm font-bold text-white">Enable Pre-Save</div>
              <div className="text-[10px] text-white/40">Show section on home page</div>
            </div>
            <Switch 
              checked={presaveEnabled}
              onCheckedChange={setPresaveEnabled}
              data-testid="switch-presave-enabled"
            />
          </div>

          <div className="grid gap-4 mb-5">
            <div className="space-y-2">
              <label className="text-xs font-bold text-white/60 uppercase tracking-wider">Pre-Save Title</label>
              <Input 
                value={presaveTitle}
                onChange={(e) => setPresaveTitle(e.target.value)}
                placeholder="e.g. New Album Coming Soon"
                className="bg-black/20 border-white/10 h-11 text-white placeholder:text-white/20 rounded-xl"
                data-testid="input-presave-title"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-white/60 uppercase tracking-wider">Pre-Save Link</label>
              <Input 
                value={presaveLink}
                onChange={(e) => setPresaveLink(e.target.value)}
                placeholder="https://..."
                className="bg-black/20 border-white/10 h-11 text-white placeholder:text-white/20 rounded-xl text-sm"
                data-testid="input-presave-link"
              />
            </div>
          </div>

          <Button 
            onClick={handleSavePresave}
            disabled={updatePresaveMutation.isPending}
            className="w-full h-11 bg-purple-500 hover:bg-purple-500/90 text-white font-bold uppercase tracking-widest rounded-xl"
            data-testid="button-save-presave"
          >
            {presaveSaved ? "Saved!" : updatePresaveMutation.isPending ? "Saving..." : <><Save className="w-4 h-4 mr-2" />Save Pre-Save</>}
          </Button>
        </motion.div>
        
        <Footer />
      </div>
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
