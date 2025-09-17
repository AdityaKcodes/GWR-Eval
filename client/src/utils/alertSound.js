// client/src/utils/alertSound.js
class AlertSound {
  constructor() {
    this.audioContext = null;
    this.isPlaying = false;
  }

  init() {
    if (this.audioContext) return;
    
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (error) {
      console.warn('Web Audio API not supported:', error);
    }
  }

  playAlert(isCritical = false) {
    if (!this.audioContext) this.init();
    if (!this.audioContext || this.isPlaying) return;

    this.isPlaying = true;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(isCritical ? 880 : 440, this.audioContext.currentTime);
    
    gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.start();
    oscillator.stop(this.audioContext.currentTime + 0.5);

    oscillator.onended = () => {
      this.isPlaying = false;
    };
  }
}

export const alertSound = new AlertSound();