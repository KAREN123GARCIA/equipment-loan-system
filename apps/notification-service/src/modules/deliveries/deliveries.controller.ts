import { Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { DeliveriesService } from './deliveries.service';
import { JwtOptionalGuard } from '../security/jwt-optional.guard';
import { Roles } from '../security/roles.decorator';
import { RolesGuard } from '../security/roles.guard';

@ApiTags('deliveries')
@ApiBearerAuth()
@Controller('deliveries')
@UseGuards(JwtOptionalGuard, RolesGuard)
export class DeliveriesController {
  constructor(private readonly svc: DeliveriesService) {}

  @Get()
  list(@Req() req: any, @Query('userId') userId?: string) {
    return this.svc.listForUser(req.user ?? null, userId);
  }

  @Get(':id')
  get(@Param('id') id: string) { return this.svc.get(id); }

  @Post(':id/resend')
  @Roles('ADMIN', 'TECHNICIAN')
  resend(@Req() req: any, @Param('id') id: string) {
    return this.svc.resend(id, req.user);
  }
}
