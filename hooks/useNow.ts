import { useEffect, useState } from 'react';
import { AppState } from 'react-native';

export function useNow(): Date {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    const subscription = AppState.addEventListener('change', () => setNow(new Date()));
    return () => { clearInterval(interval); subscription.remove(); };
  }, []);
  return now;
}
