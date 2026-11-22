import { useRef, useState } from 'react';
import { cn } from '../utils/cn';

/**
 * Six separate digit boxes. Typing moves to the next box, Backspace moves back,
 * and pasting "123456" (or SMS autofill) fills every box at once.
 * Calls onChange with the joined code, e.g. "1234" while typing, "123456" when complete.
 */
export default function OtpInput({ length = 6, onChange, disabled }) {
  const [digits, setDigits] = useState(Array(length).fill(''));
  const inputsRef = useRef([]);

  const focusBox = (index) => inputsRef.current[Math.max(0, Math.min(length - 1, index))]?.focus();

  const updateDigits = (next) => {
    setDigits(next);
    onChange(next.join(''));
  };

  // Put a string of digits into the boxes starting at `start`
  const fillFrom = (start, value) => {
    const next = [...digits];
    value.split('').forEach((digit, offset) => {
      if (start + offset < length) next[start + offset] = digit;
    });
    updateDigits(next);
    focusBox(start + value.length);
  };

  const handleChange = (e, index) => {
    const value = e.target.value.replace(/\D/g, '');
    if (!value) {
      const next = [...digits];
      next[index] = '';
      updateDigits(next);
      return;
    }
    // A whole code arrived at once (autofill) → spread it; otherwise keep the newest digit
    if (value.length >= length) fillFrom(0, value.slice(0, length));
    else fillFrom(index, value.slice(-1));
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      e.preventDefault();
      const next = [...digits];
      next[index - 1] = '';
      updateDigits(next);
      focusBox(index - 1);
    }
    if (e.key === 'ArrowLeft') focusBox(index - 1);
    if (e.key === 'ArrowRight') focusBox(index + 1);
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (pasted) fillFrom(0, pasted);
  };

  return (
    <div className="grid grid-cols-6 gap-2 sm:gap-3" onPaste={handlePaste}>
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => (inputsRef.current[index] = el)}
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? 'one-time-code' : 'off'}
          value={digit}
          disabled={disabled}
          autoFocus={index === 0}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onFocus={(e) => e.target.select()}
          aria-label={`Digit ${index + 1}`}
          className={cn(
            'h-12 w-full rounded-lg border bg-white text-center text-xl font-semibold text-slate-900 shadow-sm transition sm:h-14 sm:text-2xl',
            'focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30',
            digit ? 'border-indigo-300' : 'border-slate-200'
          )}
        />
      ))}
    </div>
  );
}
