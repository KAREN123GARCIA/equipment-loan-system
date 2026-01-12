import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { TemplatesService } from './templates.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
import { JwtOptionalGuard } from '../security/jwt-optional.guard';
import { Roles } from '../security/roles.decorator';
import { RolesGuard } from '../security/roles.guard';

@ApiTags('templates')
@ApiBearerAuth()
@Controller('templates')
@UseGuards(JwtOptionalGuard, RolesGuard)
export class TemplatesController {
  constructor(private readonly svc: TemplatesService) {}
  
  @Post()
  @Roles('ADMIN', 'TECHNICIAN')
  create(@Body() dto: CreateTemplateDto) { return this.svc.create(dto); }
  
  @Get() list() { return this.svc.list(); }
  @Get(':id') get(@Param('id') id: string) { return this.svc.get(id); }
  @Patch(':id') update(@Param('id') id: string, @Body() dto: UpdateTemplateDto) { return this.svc.update(id, dto); }
  @Delete(':id') remove(@Param('id') id: string) { return this.svc.remove(id); }
}
