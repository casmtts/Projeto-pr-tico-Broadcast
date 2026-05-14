import { useEffect, useState } from 'react';

type Listener<T> = (onChange: (items: T[]) => void) => () => void;

export const useRealtimeCollection = <T>(listener: Listener<T> | null) => {
  const [items, setItems] = useState<T[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!listener) {
      return undefined;
    }

    let active = true;
    const unsubscribe = listener((nextItems) => {
      if (active) {
        setItems(nextItems);
        setLoaded(true);
      }
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [listener]);

  return { items: listener ? items : [], loading: listener ? !loaded : false };
};
