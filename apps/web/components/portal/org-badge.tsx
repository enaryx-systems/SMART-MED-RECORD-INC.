import { Building2 } from "lucide-react";
import { ColorPill } from "@/components/portal/color-pill";

export function OrgBadge({ id, name }: { id: string; name: string }) {
  return <ColorPill colorKey={id} label={name} icon={Building2} />;
}
