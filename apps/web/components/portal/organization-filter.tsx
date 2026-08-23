"use client";

import { Building2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchOrganizationOptions } from "@/lib/api/client";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { setOrganizationFilter } from "@/redux/orgFilterSlice";
import { Dropdown } from "@/components/portal/dropdown";

export function OrganizationFilter() {
  const dispatch = useAppDispatch();
  const organizationId = useAppSelector((state) => state.orgFilter.organizationId);
  const { data } = useQuery({
    queryKey: ["organization-options"],
    queryFn: fetchOrganizationOptions,
  });

  return (
    <div className="flex w-40 items-center gap-1.5">
      <Building2 size={14} className="shrink-0 text-pine/60" />
      <Dropdown
        value={organizationId ?? ""}
        onChange={(v) => dispatch(setOrganizationFilter(v || null))}
        options={[
          { value: "", label: "All organizations" },
          ...(data ?? []).map((o) => ({ value: o.id, label: o.name })),
        ]}
        placeholder="All organizations"
      />
    </div>
  );
}
