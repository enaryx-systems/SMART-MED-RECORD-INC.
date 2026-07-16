import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CasesService } from './cases.service';

@ApiTags('cases')
@Controller('cases')
export class CasesController {
  constructor(private readonly cases: CasesService) {}
  @Get() list(@Query('q') q?: string) { return this.cases.findAll(q); }
  @Get(':id') detail(@Param('id') id: string) { return this.cases.findOne(id); }
  @Post() create(@Body() body: Record<string, unknown>) { return this.cases.create(body); }
  @Patch(':id') update(@Param('id') id: string, @Body() body: Record<string, unknown>) { return this.cases.update(id, body); }
  @Post(':id/documents') upload(@Param('id') id: string, @Body() body: { name?: string; size?: number }) { this.cases.findOne(id); return { id: `doc_${Date.now()}`, caseId: id, name: body.name ?? 'records.pdf', size: body.size ?? 0, ocrStatus: 'QUEUED', secure: true }; }
}
