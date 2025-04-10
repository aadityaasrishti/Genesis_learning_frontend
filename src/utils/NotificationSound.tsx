import { useEffect, useRef } from "react";

export const useNotificationSound = () => {
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    // Initialize AudioContext on first user interaction
    const initAudioContext = () => {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext ||
          (window as any).webkitAudioContext)();
      }
      document.removeEventListener("click", initAudioContext);
    };

    document.addEventListener("click", initAudioContext);
    return () => document.removeEventListener("click", initAudioContext);
  }, []);

  const playNotificationSound = () => {
    if (!audioContextRef.current) return;

    const oscillator = audioContextRef.current.createOscillator();
    const gainNode = audioContextRef.current.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContextRef.current.destination);

    // Configure sound
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(
      587.33,
      audioContextRef.current.currentTime
    ); // D5
    gainNode.gain.setValueAtTime(0.1, audioContextRef.current.currentTime);

    // Duration and fade out
    oscillator.start(audioContextRef.current.currentTime);
    oscillator.stop(audioContextRef.current.currentTime + 0.1);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      audioContextRef.current.currentTime + 0.1
    );
  };

  return playNotificationSound;
};

export const compareNotifications = (
  newNotifications: any[],
  oldNotifications: any[]
): boolean => {
  if (newNotifications.length !== oldNotifications.length) {
    return true;
  }

  const newIds = new Set(newNotifications.map((n) => n.id));
  return oldNotifications.some((n) => !newIds.has(n.id));
};
