"use client";

import { useState, useRef, useEffect } from "react";
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  RotateCcw, 
  Loader2, 
  AlertCircle,
  Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface VideoPlayerProps {
  src?: string;
  poster?: string;
  status?: "Ready" | "Processing" | "Failed";
  className?: string;
}

export function VideoPlayer({ src, poster, status = "Ready", className }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);

  const togglePlay = () => {
    if (status !== "Ready" || !src) return;
    if (videoRef.current?.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current?.pause();
      setIsPlaying(false);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (value: number[]) => {
    if (videoRef.current) {
      videoRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        videoRef.current.parentElement?.requestFullscreen();
      }
    }
  };

  return (
    <div 
      className={cn(
        "relative group bg-black rounded-xl overflow-hidden aspect-video flex items-center justify-center",
        className
      )}
      onMouseMove={() => setShowControls(true)}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      {status === "Ready" && src ? (
        <>
          <video
            ref={videoRef}
            src={src}
            poster={poster}
            className="w-full h-full object-contain"
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onClick={togglePlay}
          />
          
          {/* Overlays */}
          {!isPlaying && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
              <Button 
                size="icon" 
                variant="ghost" 
                className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/30 text-white border border-white/30"
                onClick={togglePlay}
              >
                <Play size={40} fill="currentColor" />
              </Button>
            </div>
          )}

          {/* Controls */}
          <div className={cn(
            "absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent transition-opacity duration-300 z-20 space-y-3",
            showControls ? "opacity-100" : "opacity-0"
          )}>
            <div className="space-y-1">
              <Slider
                value={[currentTime]}
                max={duration}
                step={0.1}
                onValueChange={handleSeek}
                className="cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-white/70 font-mono">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button size="icon" variant="ghost" className="text-white hover:bg-white/20 h-8 w-8" onClick={togglePlay}>
                  {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
                </Button>
                
                <div className="flex items-center gap-2 group/volume">
                  <Button size="icon" variant="ghost" className="text-white hover:bg-white/20 h-8 w-8" onClick={toggleMute}>
                    {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
                  </Button>
                  <Slider
                    value={[isMuted ? 0 : volume]}
                    max={1}
                    step={0.01}
                    onValueChange={(v) => {
                      setVolume(v[0]);
                      if (videoRef.current) videoRef.current.volume = v[0];
                      setIsMuted(v[0] === 0);
                    }}
                    className="w-20 cursor-pointer hidden group-hover/volume:block"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-white text-xs h-8 hover:bg-white/20">
                      {playbackRate}x
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-24">
                    {[0.5, 1, 1.25, 1.5, 2].map((rate) => (
                      <DropdownMenuItem 
                        key={rate} 
                        onClick={() => {
                          setPlaybackRate(rate);
                          if (videoRef.current) videoRef.current.playbackRate = rate;
                        }}
                        className={cn(playbackRate === rate && "bg-primary/10 text-primary")}
                      >
                        {rate}x
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                
                <Button size="icon" variant="ghost" className="text-white hover:bg-white/20 h-8 w-8" onClick={toggleFullscreen}>
                  <Maximize size={18} />
                </Button>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center gap-4 text-muted-foreground p-8">
          {status === "Processing" ? (
            <>
              <div className="relative">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
                <Video className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 opacity-50" />
              </div>
              <div className="text-center space-y-1">
                <p className="font-bold text-foreground">视频正在处理中...</p>
                <p className="text-xs">预计还需 2 分钟，处理完成后将通过通知告知您。</p>
              </div>
            </>
          ) : (
            <>
              <AlertCircle className="w-12 h-12 text-destructive opacity-50" />
              <div className="text-center space-y-1">
                <p className="font-bold text-foreground">视频处理失败</p>
                <p className="text-xs">素材格式不受支持或渲染引擎超时。</p>
                <Button variant="outline" size="sm" className="mt-4">重试</Button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
