import { useEffect, useState } from "react";

export default function TypingTitle() {
  const text =
    "Protect Music Copyright with Blockchain";

  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    let index = 0;

    const interval = setInterval(() => {
      setDisplayed(text.slice(0, index));
      index++;

      if (index > text.length) {
        clearInterval(interval);
      }
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return (
    <h2 className="typing-title">
      {displayed}
      <span className="cursor">|</span>
    </h2>
  );
}