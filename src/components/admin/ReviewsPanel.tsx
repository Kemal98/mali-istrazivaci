"use client";

import { useState } from "react";
import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import ConfirmModal from "./ConfirmModal";
import ImportReviewsModal from "./ImportReviewsModal";
import MediaField from "./MediaField";
import { SelectField, TextArea, TextField, Toggle } from "./fields";
import type { Review } from "@/lib/cms/types";

type ProductRef = { id: string; naziv: string };

function emptyReview(productId: string | null): Review {
  return {
    id: "",
    productId,
    ime: "",
    inicijal: "",
    rating: 5,
    tekst: "",
    verified: true,
    slika: "",
    datum: "",
    status: "published",
    sortOrder: 0,
  };
}

function Row({
  r,
  products,
  onEdit,
  onDelete,
  onToggleStatus,
}: {
  r: Review;
  products: ProductRef[];
  onEdit: () => void;
  onDelete: () => void;
  onToggleStatus: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: r.id });
  const prod = products.find((p) => p.id === r.productId);

  return (
    <div
      ref={setNodeRef}
      className="adm-block"
      data-dragging={isDragging ? "true" : "false"}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        position: "relative",
        zIndex: isDragging ? 5 : undefined,
      }}
    >
      <div className="adm-block-head">
        <button
          type="button"
          ref={setActivatorNodeRef}
          className="adm-drag"
          aria-label={`Premjesti recenziju ${r.ime}`}
          {...attributes}
          {...listeners}
        >
          ⠿
        </button>
        {r.slika ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={r.slika}
            alt=""
            style={{
              width: 34,
              height: 34,
              borderRadius: 6,
              objectFit: "cover",
              flex: "0 0 auto",
            }}
          />
        ) : null}
        <span className="adm-block-type">{"★".repeat(r.rating)}</span>
        <span className="adm-block-preview">
          <b>{r.ime || "(bez imena)"}</b> — {r.tekst.slice(0, 90)}
          {prod ? ` · ${prod.naziv}` : " · (bez proizvoda)"}
        </span>
        <div className="adm-block-tools">
          <span
            className={`adm-badge ${
              r.status === "published" ? "adm-badge-pub" : "adm-badge-hidden"
            }`}
          >
            {r.status === "published" ? "Objavljena" : "Skrivena"}
          </span>
          <button type="button" className="adm-btn adm-btn-sm" onClick={onEdit}>
            UREDI
          </button>
          <button
            type="button"
            className="adm-btn adm-btn-sm"
            onClick={onToggleStatus}
          >
            {r.status === "published" ? "SAKRIJ" : "OBJAVI"}
          </button>
          <button
            type="button"
            className="adm-btn adm-btn-sm adm-btn-danger"
            onClick={onDelete}
          >
            OBRIŠI
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Recenzije. Isti komponent radi i kao tab u editoru proizvoda
 * (productId zadan) i kao samostalna stranica /admin/reviews.
 */
export default function ReviewsPanel({
  productId = null,
  products,
  initial,
  compact = false,
}: {
  productId?: string | null;
  products: ProductRef[];
  initial: Review[];
  compact?: boolean;
}) {
  const [list, setList] = useState<Review[]>(initial);
  const [draft, setDraft] = useState<Review | null>(null);
  const [toDelete, setToDelete] = useState<Review | null>(null);
  const [busy, setBusy] = useState(false);
  const [filter, setFilter] = useState<string>(productId ?? "all");
  const [importing, setImporting] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const shown = compact
    ? list
    : list.filter((r) =>
        filter === "all"
          ? true
          : filter === "none"
            ? !r.productId
            : r.productId === filter
      );

  async function reload() {
    const url = productId
      ? `/api/admin/reviews?productId=${encodeURIComponent(productId)}`
      : "/api/admin/reviews";
    const res = await fetch(url);
    const data = await res.json().catch(() => ({}));
    if (data?.reviews) setList(data.reviews);
  }

  async function save() {
    if (!draft) return;
    if (!draft.ime.trim() || !draft.tekst.trim()) return;
    setBusy(true);
    if (draft.id) {
      await fetch(`/api/admin/reviews/${draft.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
    } else {
      await fetch("/api/admin/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
    }
    setBusy(false);
    setDraft(null);
    await reload();
  }

  async function toggleStatus(r: Review) {
    const status = r.status === "published" ? "hidden" : "published";
    setList((l) => l.map((x) => (x.id === r.id ? { ...x, status } : x)));
    await fetch(`/api/admin/reviews/${r.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
  }

  async function doDelete(r: Review) {
    setBusy(true);
    await fetch(`/api/admin/reviews/${r.id}`, { method: "DELETE" });
    setBusy(false);
    setToDelete(null);
    setList((l) => l.filter((x) => x.id !== r.id));
  }

  async function onDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const from = list.findIndex((r) => r.id === active.id);
    const to = list.findIndex((r) => r.id === over.id);
    if (from < 0 || to < 0) return;
    const next = arrayMove(list, from, to);
    setList(next);
    await fetch("/api/admin/reviews", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: next.map((r) => r.id) }),
    });
  }

  return (
    <>
      <div
        style={{
          display: "flex",
          gap: 8,
          alignItems: "center",
          marginBottom: 12,
          flexWrap: "wrap",
        }}
      >
        <button
          type="button"
          className="adm-btn adm-btn-primary"
          onClick={() => setDraft(emptyReview(productId))}
        >
          + DODAJ RECENZIJU
        </button>
        <button type="button" className="adm-btn" onClick={() => setImporting(true)}>
          📋 UVEZI RECENZIJE
        </button>
        {!compact ? (
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{
              font: "inherit",
              padding: "8px 10px",
              border: "1px solid #e3e5e9",
              borderRadius: 8,
            }}
            aria-label="Filtriraj po proizvodu"
          >
            <option value="all">Svi proizvodi</option>
            <option value="none">Bez proizvoda</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.naziv}
              </option>
            ))}
          </select>
        ) : null}
        <span className="adm-hint">
          Redoslijed se mijenja prevlačenjem — tako se prikazuju i na stranici.
        </span>
      </div>

      {shown.length === 0 ? (
        <div className="adm-empty" style={{ background: "#fff", borderRadius: 10 }}>
          Nema recenzija. Dodajte samo <b>stvarne</b> recenzije kupaca.
        </div>
      ) : (
        <div className="adm-builder">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={onDragEnd}
          >
            <SortableContext
              items={shown.map((r) => r.id)}
              strategy={verticalListSortingStrategy}
            >
              {shown.map((r) => (
                <Row
                  key={r.id}
                  r={r}
                  products={products}
                  onEdit={() => setDraft(r)}
                  onDelete={() => setToDelete(r)}
                  onToggleStatus={() => toggleStatus(r)}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>
      )}

      {draft ? (
        <div
          className="adm-modal-bg"
          onClick={(e) => e.target === e.currentTarget && setDraft(null)}
        >
          <div className="adm-modal" role="dialog" aria-modal="true">
            <h2>{draft.id ? "Uredi recenziju" : "Nova recenzija"}</h2>
            <p className="adm-hint" style={{ marginBottom: 14 }}>
              Unosite samo recenzije koje su stvarno dobijene od kupaca.
            </p>

            <div className="adm-row">
              <TextField
                label="Ime"
                value={draft.ime}
                onChange={(v) =>
                  setDraft({
                    ...draft,
                    ime: v,
                    inicijal:
                      draft.inicijal || v.trim().charAt(0).toUpperCase(),
                  })
                }
                placeholder="npr. Ivana L."
              />
              <TextField
                label="Inicijal u krugu"
                value={draft.inicijal}
                onChange={(v) => setDraft({ ...draft, inicijal: v.slice(0, 2) })}
              />
            </div>

            <TextArea
              label="Tekst recenzije"
              value={draft.tekst}
              onChange={(v) => setDraft({ ...draft, tekst: v })}
              rows={5}
            />

            <div className="adm-row">
              <SelectField
                label="Ocjena"
                value={String(draft.rating)}
                onChange={(v) => setDraft({ ...draft, rating: Number(v) })}
                options={[5, 4, 3, 2, 1].map((n) => ({
                  value: String(n),
                  label: `${"★".repeat(n)} (${n})`,
                }))}
              />
              <SelectField
                label="Status"
                value={draft.status}
                onChange={(v) =>
                  setDraft({
                    ...draft,
                    status: v === "hidden" ? "hidden" : "published",
                  })
                }
                options={[
                  { value: "published", label: "Objavljena" },
                  { value: "hidden", label: "Skrivena" },
                ]}
              />
            </div>

            <SelectField
              label="Proizvod"
              value={draft.productId ?? ""}
              onChange={(v) => setDraft({ ...draft, productId: v || null })}
              options={[
                { value: "", label: "— bez proizvoda —" },
                ...products.map((p) => ({ value: p.id, label: p.naziv })),
              ]}
            />

            <MediaField
              label="Slika uz recenziju (opcionalno)"
              value={draft.slika}
              accept="image"
              onChange={(url) => setDraft({ ...draft, slika: url })}
            />

            <Toggle
              label="Prikaži oznaku „Verifikovano”"
              value={draft.verified}
              onChange={(v) => setDraft({ ...draft, verified: v })}
            />

            <div className="adm-modal-foot">
              <button
                type="button"
                className="adm-btn"
                onClick={() => setDraft(null)}
              >
                OTKAŽI
              </button>
              <button
                type="button"
                className="adm-btn adm-btn-primary"
                onClick={save}
                disabled={busy || !draft.ime.trim() || !draft.tekst.trim()}
              >
                {busy ? "Snimam…" : "SNIMI RECENZIJU"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {toDelete ? (
        <ConfirmModal
          title={`Obrisati recenziju od „${toDelete.ime}"?`}
          text="Recenzija se arhivira i prestaje se prikazivati na stranici."
          confirmLabel="OBRIŠI"
          danger
          busy={busy}
          onConfirm={() => doDelete(toDelete)}
          onCancel={() => setToDelete(null)}
        />
      ) : null}

      {importing ? (
        <ImportReviewsModal
          productId={productId}
          onClose={() => setImporting(false)}
          onImported={reload}
        />
      ) : null}
    </>
  );
}
