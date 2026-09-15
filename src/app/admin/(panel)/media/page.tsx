import { listMedia } from "@/lib/cms/repo";
import MediaBrowser from "@/components/admin/MediaBrowser";

export const dynamic = "force-dynamic";

export default async function MediaPage() {
  return (
    <>
      <div className="adm-head">
        <div>
          <h1>Media library</h1>
          <p>
            Sve slike, GIF-ovi i videi. Odavde se biraju u editoru proizvoda.
          </p>
        </div>
      </div>

      <MediaBrowser initial={await listMedia()} />
    </>
  );
}
