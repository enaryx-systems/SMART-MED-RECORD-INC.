import { Controller, Get, Query } from "@nestjs/common";
import { CasesService } from "../cases/cases.service";

@Controller("dashboard")
export class DashboardController {
  constructor(private readonly cases: CasesService) {}
  @Get("summary") summary(@Query("role") role = "attorney") {
    const cases = this.cases.findAll();
    return {
      role,
      stats: {
        totalCases: 128,
        inProgress: 45,
        completed: 83,
        turnaround: "31 hrs",
      },
      cases,
      activity: [
        {
          id: 1,
          title: "Physician review completed",
          detail: "SMR-2026-1269 · Dr. N. Shah",
          time: "18 min ago",
        },
        {
          id: 2,
          title: "New records processed",
          detail: "SMR-2026-1274 · 312 pages indexed",
          time: "1 hr ago",
        },
        {
          id: 3,
          title: "Attorney comment added",
          detail: "SMR-2026-1273 · @case-team",
          time: "2 hrs ago",
        },
      ],
    };
  }
}
