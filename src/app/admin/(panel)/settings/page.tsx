import { getSettings } from "@/lib/cms/repo";
import SettingsForm from "@/components/admin/SettingsForm";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  return (
    <>
      <div className="adm-head">
        <div>
          <h1>Globalne postavke</h1>
          <p>Zajednički tekstovi za sve proizvode, sa mogućnošću pregaženja.</p>
        </div>
      </div>

      <SettingsForm initial={await getSettings()} />
    </>
  );
}
