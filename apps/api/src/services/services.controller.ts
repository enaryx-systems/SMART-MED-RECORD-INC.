import { Controller, Get } from '@nestjs/common';

@Controller('services')
export class ServicesController {
  @Get() list() { return [
    { key: 'chronology', name: 'Medical Chronology', description: 'Searchable, source-cited timeline of medical events.' },
    { key: 'narrative', name: 'Narrative Summary', description: 'Clear case summaries reviewed by medical professionals.' },
    { key: 'demand', name: 'Demand Letter Drafting', description: 'Structured, evidence-grounded demand packages.' },
    { key: 'deposition', name: 'Deposition Summary', description: 'Key testimony, contradictions, and page references.' },
    { key: 'billing', name: 'Medical Billing Analysis', description: 'Duplicate, overcharge, and coding discrepancy review.' },
    { key: 'life-care', name: 'Life Care Plan Support', description: 'Future care needs and cost assessment support.' },
    { key: 'expert', name: 'Expert Medical Opinion', description: 'Specialist-reviewed opinions and causation support.' },
    { key: 'retrieval', name: 'Record Retrieval', description: 'Provider outreach, authorization, and gap tracking.' },
  ]; }
}
