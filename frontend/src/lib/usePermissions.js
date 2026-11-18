import { useCallback, useEffect, useState } from "react";
import { base44 } from "@/base44";
import { hasPermission } from "@/lib/permissions";

export function usePermissions() {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    base44.auth.getSession().then(session => {
      if (!mounted) return;
      setUser(session);
      setReady(true);
    });
    return () => { mounted = false; };
  }, []);

  const can = useCallback((permissionKey) => hasPermission(user, permissionKey), [user]);

  return {
    user,
    ready,
    can
  };
}
