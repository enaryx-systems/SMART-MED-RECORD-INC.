import { ADDITIONAL_SERVICES, DELIVERY_SPEEDS, SERVICES_DESIRED } from "@/lib/data/case-options";
import type { WizardState } from "./wizard-types";

function toggle(list: string[], value: string) {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

export function StepServiceDetails({
  state,
  onChange,
}: {
  state: WizardState;
  onChange: (patch: Partial<WizardState>) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <p className="mb-2 text-sm font-semibold text-ink">
          Services Desired <span className="text-red-500">*</span>
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          {SERVICES_DESIRED.map((service) => (
            <label
              key={service}
              className="flex items-center gap-2.5 rounded-xl border bg-white px-4 py-2.5 text-sm text-ink"
            >
              <input
                type="checkbox"
                checked={state.servicesDesired.includes(service)}
                onChange={() =>
                  onChange({ servicesDesired: toggle(state.servicesDesired, service) })
                }
                className="h-4 w-4 accent-emerald"
              />
              {service}
            </label>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold text-ink">Special Reports & Additional Services</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {ADDITIONAL_SERVICES.map((service) => (
            <label
              key={service}
              className="flex items-center gap-2.5 rounded-xl border bg-white px-4 py-2.5 text-sm text-ink"
            >
              <input
                type="checkbox"
                checked={state.additionalServices.includes(service)}
                onChange={() =>
                  onChange({ additionalServices: toggle(state.additionalServices, service) })
                }
                className="h-4 w-4 accent-emerald"
              />
              {service}
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-ink" htmlFor="otherServicesNote">
          Other Services
        </label>
        <textarea
          id="otherServicesNote"
          rows={2}
          value={state.otherServicesNote}
          onChange={(e) => onChange({ otherServicesNote: e.target.value })}
          className="w-full rounded-xl border-2 border-pine/25 bg-white px-4 py-3 outline-none focus:border-emerald focus:shadow-[0_0_0_3px_rgba(0,133,111,0.09)]"
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <p className="mb-2 text-sm font-semibold text-ink">Delivery Speed</p>
          <div className="flex gap-4">
            {DELIVERY_SPEEDS.map((speed) => (
              <label key={speed.value} className="flex items-center gap-2 text-sm text-ink">
                <input
                  type="radio"
                  name="deliverySpeed"
                  checked={state.deliverySpeed === speed.value}
                  onChange={() => onChange({ deliverySpeed: speed.value })}
                  className="h-4 w-4 accent-emerald"
                />
                {speed.label}
              </label>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-semibold text-ink">Reference</p>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm text-ink">
              <input
                type="checkbox"
                checked={state.pdfReference}
                onChange={(e) => onChange({ pdfReference: e.target.checked })}
                className="h-4 w-4 accent-emerald"
              />
              PDF Reference
            </label>
            <label className="flex items-center gap-2 text-sm text-ink">
              <input
                type="checkbox"
                checked={state.batesReference}
                onChange={(e) => onChange({ batesReference: e.target.checked })}
                className="h-4 w-4 accent-emerald"
              />
              Bates Reference
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
