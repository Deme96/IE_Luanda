import { useEffect, useState } from "react";
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

  return {
    user,
    ready,
    can: (permissionKey) => hasPermission(user, permissionKey)
  };
}
