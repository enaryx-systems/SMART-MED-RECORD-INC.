import { Dropzone } from "@/components/portal/dropzone";

export function StepUploadRecords({
  files,
  onAdd,
  onRemove,
}: {
  files: File[];
  onAdd: (files: File[]) => void;
  onRemove: (index: number) => void;
}) {
  return (
    <div>
      <p className="mb-4 text-sm text-ink/60">
        Upload supporting records for this case. You can also add these later.
      </p>
      <Dropzone files={files} onAdd={onAdd} onRemove={onRemove} />
    </div>
  );
}
