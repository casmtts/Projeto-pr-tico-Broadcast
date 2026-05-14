import { useEffect, useState } from 'react';
import { markDueScheduledMessagesAsSent } from '@/services/firestore';

export const useScheduledMessagesSync = (userId: string, connectionId: string) => {
  const [, setTick] = useState(0);

  useEffect(() => {
    if (!userId || !connectionId) {
      return undefined;
    }

    const tick = () => {
      void markDueScheduledMessagesAsSent(userId, connectionId);
      setTick((n) => n + 1);
    };

    void tick();
    const intervalId = window.setInterval(tick, 2_000);

    return () => window.clearInterval(intervalId);
  }, [userId, connectionId]);
};
