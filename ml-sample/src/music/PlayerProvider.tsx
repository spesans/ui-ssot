"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { Track } from "@/music/types";

export type PlayerContextValue = {
  currentTrackId: string | null;
  isPlaying: boolean;
  progress: number;
  duration: number;
  play: (track: Track) => void;
  pause: () => void;
  toggle: (track: Track) => void;
  seekToRatio: (track: Track, ratio: number) => void;
};

const PlayerContext = createContext<PlayerContextValue | null>(null);

export function usePlayer(): PlayerContextValue {
  const value = useContext(PlayerContext);
  if (!value) {
    throw new Error("usePlayer must be used within PlayerProvider");
  }
  return value;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export default function PlayerProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const loadedTrackIdRef = useRef<string | null>(null);
  const pendingSeekRef = useRef<{ trackId: string; ratio: number } | null>(null);
  const [currentTrackId, setCurrentTrackId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onLoadedMetadata = () => {
      setDuration(Number.isFinite(audio.duration) ? audio.duration : 0);

      const pending = pendingSeekRef.current;
      if (loadedTrackIdRef.current !== pending?.trackId) return;
      if (!Number.isFinite(audio.duration) || audio.duration <= 0) return;

      const seconds = clamp(pending.ratio * audio.duration, 0, audio.duration);
      pendingSeekRef.current = null;
      audio.currentTime = seconds;
      setProgress(seconds);
    };
    const onTimeUpdate = () => {
      setProgress(audio.currentTime);
    };
    const onPlay = () => {
      setIsPlaying(true);
    };
    const onPause = () => {
      setIsPlaying(false);
    };
    const onEnded = () => {
      setIsPlaying(false);
    };

    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnded);
    };
  }, []);

  const play = useCallback(
    (track: Track) => {
      const audio = audioRef.current;
      if (!audio) return;

      const isSameTrack = currentTrackId === track.id;

      if (!isSameTrack) {
        loadedTrackIdRef.current = track.id;
        pendingSeekRef.current = null;
        setCurrentTrackId(track.id);
        setProgress(0);
        setDuration(0);
        audio.src = track.audioSrc;
      } else if (audio.ended || (audio.duration > 0 && audio.currentTime >= audio.duration)) {
        audio.currentTime = 0;
      }

      void audio.play().catch(() => undefined);
    },
    [currentTrackId],
  );

  const pause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
  }, []);

  const toggle = useCallback(
    (track: Track) => {
      if (currentTrackId === track.id) {
        if (isPlaying) pause();
        else play(track);
        return;
      }
      play(track);
    },
    [currentTrackId, isPlaying, pause, play],
  );

  const seekToRatio = useCallback((track: Track, ratio: number) => {
    const audio = audioRef.current;
    if (!audio) return;

    const nextRatio = clamp(ratio, 0, 1);
    const isSameTrack = loadedTrackIdRef.current === track.id;

    if (!isSameTrack) {
      audio.pause();
      setIsPlaying(false);
      loadedTrackIdRef.current = track.id;
      pendingSeekRef.current = null;
      setCurrentTrackId(track.id);
      setProgress(0);
      setDuration(0);
      audio.src = track.audioSrc;
      audio.load();
    }

    pendingSeekRef.current = { trackId: track.id, ratio: nextRatio };

    if (isSameTrack && Number.isFinite(audio.duration) && audio.duration > 0) {
      const seconds = clamp(nextRatio * audio.duration, 0, audio.duration);
      pendingSeekRef.current = null;
      audio.currentTime = seconds;
      setProgress(seconds);
    }
  }, []);

  const value = useMemo<PlayerContextValue>(
    () => ({
      currentTrackId,
      isPlaying,
      progress,
      duration,
      play,
      pause,
      toggle,
      seekToRatio,
    }),
    [currentTrackId, duration, isPlaying, pause, play, progress, seekToRatio, toggle],
  );

  return (
    <PlayerContext.Provider value={value}>
      {children}
      <audio ref={audioRef} preload="metadata" hidden />
    </PlayerContext.Provider>
  );
}
