export default function AudioWaveform() {
  const bars = [
    20, 35, 50, 70, 40, 80, 30,
    65, 90, 40, 25, 75, 55,
    85, 35, 60, 25, 50
  ];

  return (
    <div className="waveform">
      {bars.map((height, index) => (
        <div
          key={index}
          className="wave-bar"
          style={{
            height: `${height}px`,
            animationDelay: `${index * 0.05}s`,
          }}
        />
      ))}
    </div>
  );
}