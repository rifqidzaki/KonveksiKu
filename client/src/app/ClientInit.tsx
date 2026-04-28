"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";

export default function ClientInit() {
  const loadUser = useAuthStore((state) => state.loadUser);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  return null;
}
