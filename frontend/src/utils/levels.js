export const levelConfig = {
  normal: { color: '#2FE6C7', dim: 'rgba(47,230,199,0.14)', text: 'Sea state nominal' },
  watch: { color: '#FFB020', dim: 'rgba(255,176,32,0.14)', text: 'Tsunami Watch — monitor sensors' },
  warning: { color: '#FF4B3E', dim: 'rgba(255,75,62,0.16)', text: 'Tsunami Warning — evacuate coastal zones' },
};

export function applyLevelVisuals(level) {
  const L = levelConfig[level] || levelConfig.normal;
  document.documentElement.style.setProperty('--state-color', L.color);
  document.documentElement.style.setProperty('--state-dim', L.dim);
}