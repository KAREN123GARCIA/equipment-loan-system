import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { TemplatesRepository } from './templates.repository';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';

@Injectable()
export class TemplatesService {
  constructor(private readonly repo: TemplatesRepository) {}

  async create(dto: CreateTemplateDto) {
    try {
      return await this.repo.create({ ...dto, enabled: dto.enabled ?? true });
    } catch (e: any) {
      if (String(e?.code) === '11000') throw new BadRequestException('Template key already exists.');
      throw e;
    }
  }

  list() { return this.repo.findAll(); }

  async get(id: string) {
    const t = await this.repo.findById(id);
    if (!t) throw new NotFoundException('Template not found.');
    return t;
  }

  async update(id: string, dto: UpdateTemplateDto) {
    const t = await this.repo.update(id, dto as any);
    if (!t) throw new NotFoundException('Template not found.');
    return t;
  }

  async remove(id: string) {
    const t = await this.repo.delete(id);
    if (!t) throw new NotFoundException('Template not found.');
    return t;
  }
}
