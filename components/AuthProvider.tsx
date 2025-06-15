'use client';

import { AuthContext, AuthProvider as AuthProviderImpl } from "@/lib/auth";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <AuthProviderImpl>
      {children}
    </AuthProviderImpl>
  );
}