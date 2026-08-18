import { useEffect, useState } from 'react';

import { getToken } from '@/lib/api';

export function useToken() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void getToken().then((t) => {
      if (active) setToken(t);
    });
    return () => {
      active = false;
    };
  }, []);

  return token;
}