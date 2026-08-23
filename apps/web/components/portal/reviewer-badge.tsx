import { ClipboardList, UserX } from "lucide-react";
import { ColorPill } from "@/components/portal/color-pill";

export function ReviewerBadge({ id, name }: { id: string | null; name: string }) {
  if (!id) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-ink/5 px-2.5 py-1 text-xs font-bold text-ink/50">
        <UserX size={12} />
        {name}
      </span>
    );
  }
  return <ColorPill colorKey={id} label={name} icon={ClipboardList} />;
}
