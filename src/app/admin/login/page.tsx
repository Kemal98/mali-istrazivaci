import { Suspense } from "react";
import LoginForm from "@/components/admin/LoginForm";

// Lozinka NIJE u frontend kodu — forma samo POST-uje na /api/admin/login,
// gdje se poredi sa ADMIN_PASSWORD iz env-a (PBKDF2 + timing-safe compare).
// Suspense: LoginForm čita ?next= preko useSearchParams().
export default function LoginPage() {
  return (
    <div className="adm">
      <div className="adm-login">
        <Suspense fallback={<div className="adm-login-box">Učitavam…</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
