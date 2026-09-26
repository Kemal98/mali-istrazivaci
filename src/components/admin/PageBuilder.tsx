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
import BlockFields, { blockPreview } from "./BlockFields";
import ConfirmModal from "./ConfirmModal";
import {
  BLOCK_LABELS,
  defaultBlockData,
  type Block,
  type BlockData,
  type BlockType,
} from "@/lib/cms/types";

// Redoslijed u nizu JE redoslijed na stranici — drag & drop samo
// premješta element u nizu (arrayMove), nema zasebnog sortOrder polja.

const ADD_ORDER: BlockType[] = [
  "naslov",
  "tekst",
  "naslov_tekst",
  "slika",
  "gif",
  "video",
  "slika_tekst",
  "social_proof",
  "koristi",
  "benefiti",
  "koraci",
  "u_kutiji",
  "faq",
  "trust",
  "cta",
  "galerija",
  "recenzije",
  "spacer",
  "divider",
];

function newBlockId() {
  return `blk_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
}

function SortableBlock({
  block,
  index,
  total,
  open,
  onToggleOpen,
  onChange,
  onDuplicate,
  onHide,
  onDelete,
  onMove,
  canMergeNext,
  onMergeNext,
}: {
  block: Block;
  index: number;
  total: number;
  open: boolean;
  onToggleOpen: () => void;
  onChange: (data: BlockData) => void;
  onDuplicate: () => void;
  onHide: () => void;
  onDelete: () => void;
  onMove: (dir: -1 | 1) => void;
  canMergeNext: boolean;
  onMergeNext: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  return (
    <div
      ref={setNodeRef}
      className="adm-block"
      data-hidden={block.hidden ? "true" : "false"}
      data-dragging={isDragging ? "true" : "false"}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 5 : undefined,
        position: "relative",
      }}
    >
      <div className="adm-block-head">
        <button
          type="button"
          ref={setActivatorNodeRef}
          className="adm-drag"
          aria-label={`Premjesti blok ${BLOCK_LABELS[block.type]}`}
          {...attributes}
          {...listeners}
        >
          ⠿
        </button>

        <span className="adm-block-type">{BLOCK_LABELS[block.type]}</span>
        {block.hidden ? (
          <span className="adm-badge adm-badge-hidden">skriveno</span>
        ) : null}
        <span className="adm-block-preview" onClick={onToggleOpen}>
          {blockPreview(block)}
        </span>

        <div className="adm-block-tools">
          <button
            type="button"
            className="adm-btn adm-btn-icon"
            title="Pomjeri gore"
            onClick={() => onMove(-1)}
            disabled={index === 0}
          >
            ↑
          </button>
          <button
            type="button"
            className="adm-btn adm-btn-icon"
            title="Pomjeri dolje"
            onClick={() => onMove(1)}
            disabled={index === total - 1}
          >
            ↓
          </button>
          <button
            type="button"
            className="adm-btn adm-btn-sm"
            onClick={onToggleOpen}
          >
            {open ? "ZATVORI" : "UREDI"}
          </button>
          <button
            type="button"
            className="adm-btn adm-btn-sm"
            title="Dupliciraj blok"
            onClick={onDuplicate}
          >
            DUPLICIRAJ
          </button>
          {canMergeNext ? (
            <button
              type="button"
              className="adm-btn adm-btn-sm"
              title="Spoji tekst ovog i narednog bloka u jedan (manje razmaka na stranici)"
              onClick={onMergeNext}
            >
              ↓ SPOJI SA SLJEDEĆIM
            </button>
          ) : null}
          <button
            type="button"
            className="adm-btn adm-btn-sm"
            title={block.hidden ? "Prikaži blok" : "Sakrij blok"}
            onClick={onHide}
          >
            {block.hidden ? "PRIKAŽI" : "SAKRIJ"}
          </button>
          <button
            type="button"
            className="adm-btn adm-btn-sm adm-btn-danger"
            title="Obriši blok"
            onClick={onDelete}
          >
            OBRIŠI
          </button>
        </div>
      </div>

      {open ? (
        <div className="adm-block-body">
          {block.uputa ? <div className="adm-block-uputa">💡 {block.uputa}</div> : null}
          <BlockFields block={block} onChange={onChange} />
        </div>
      ) : null}
    </div>
  );
}

export default function PageBuilder({
  sections,
  onChange,
}: {
  sections: Block[];
  onChange: (sections: Block[]) => void;
}) {
  const [openIds, setOpenIds] = useState<string[]>([]);
  const [toDelete, setToDelete] = useState<Block | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const from = sections.findIndex((s) => s.id === active.id);
    const to = sections.findIndex((s) => s.id === over.id);
    if (from < 0 || to < 0) return;
    onChange(arrayMove(sections, from, to));
  }

  function add(type: BlockType) {
    const block: Block = {
      id: newBlockId(),
      type,
      data: defaultBlockData(type),
    };
    onChange([...sections, block]);
    setOpenIds((ids) => [...ids, block.id]);
  }

  function update(id: string, data: BlockData) {
    onChange(sections.map((s) => (s.id === id ? { ...s, data } : s)));
  }

  function duplicate(id: string) {
    const i = sections.findIndex((s) => s.id === id);
    if (i < 0) return;
    const copy: Block = {
      ...sections[i],
      id: newBlockId(),
      data: JSON.parse(JSON.stringify(sections[i].data)),
    };
    const next = [...sections];
    next.splice(i + 1, 0, copy);
    onChange(next);
  }

  function move(id: string, dir: -1 | 1) {
    const i = sections.findIndex((s) => s.id === id);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= sections.length) return;
    onChange(arrayMove(sections, i, j));
  }

  /**
   * Spoji tekst ovog bloka sa sljedećim (samo "tekst"-"tekst" parovi) —
   * riješava previše razmaka na stranici kad "Uvezi sa linka" napravi
   * blok po pasusu, a admin poslije htio da neke spoji ručno.
   */
  function mergeNext(id: string) {
    const i = sections.findIndex((s) => s.id === id);
    if (i < 0 || i + 1 >= sections.length) return;
    const a = sections[i];
    const bBlock = sections[i + 1];
    if (a.type !== "tekst" || bBlock.type !== "tekst") return;
    const merged: Block = {
      ...a,
      data: { ...a.data, tekst: `${a.data.tekst ?? ""}\n${bBlock.data.tekst ?? ""}` },
    };
    const next = [...sections];
    next.splice(i, 2, merged);
    onChange(next);
    setOpenIds((ids) => [...ids.filter((x) => x !== bBlock.id), merged.id]);
  }

  return (
    <>
      <div className="adm-builder">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={onDragEnd}
        >
          <SortableContext
            items={sections.map((s) => s.id)}
            strategy={verticalListSortingStrategy}
          >
            {sections.map((s, i) => (
              <SortableBlock
                key={s.id}
                block={s}
                index={i}
                total={sections.length}
                open={openIds.includes(s.id)}
                onToggleOpen={() =>
                  setOpenIds((ids) =>
                    ids.includes(s.id)
                      ? ids.filter((x) => x !== s.id)
                      : [...ids, s.id]
                  )
                }
                onChange={(data) => update(s.id, data)}
                onDuplicate={() => duplicate(s.id)}
                onHide={() =>
                  onChange(
                    sections.map((x) =>
                      x.id === s.id ? { ...x, hidden: !x.hidden } : x
                    )
                  )
                }
                onDelete={() => setToDelete(s)}
                onMove={(dir) => move(s.id, dir)}
                canMergeNext={
                  s.type === "tekst" &&
                  i + 1 < sections.length &&
                  sections[i + 1].type === "tekst"
                }
                onMergeNext={() => mergeNext(s.id)}
              />
            ))}
          </SortableContext>
        </DndContext>

        {sections.length === 0 ? (
          <div className="adm-empty" style={{ background: "#fff", borderRadius: 10 }}>
            Stranica je prazna. Dodajte prvi blok ispod.
          </div>
        ) : null}

        <div className="adm-add-block">
          <b style={{ fontSize: "0.8rem" }}>DODAJ BLOK</b>
          <div className="adm-add-grid">
            {ADD_ORDER.map((t) => (
              <button key={t} type="button" onClick={() => add(t)}>
                + {BLOCK_LABELS[t]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {toDelete ? (
        <ConfirmModal
          title={`Obrisati blok „${BLOCK_LABELS[toDelete.type]}"?`}
          text="Blok se briše iz nacrta. Objavljena stranica se ne mijenja dok ne kliknete OBJAVI."
          confirmLabel="OBRIŠI BLOK"
          danger
          onConfirm={() => {
            onChange(sections.filter((s) => s.id !== toDelete.id));
            setToDelete(null);
          }}
          onCancel={() => setToDelete(null)}
        />
      ) : null}
    </>
  );
}
