import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { LoansService } from "./loans.service";
import { CreateLoanDto } from "./dto/create-loan.dto";
import { ReturnLoanDto } from "./dto/return-loan.dto";
import { Roles } from "../authz/roles.decorator";

@Controller("loans")
export class LoansController {
  constructor(private readonly service: LoansService) {}

  @Post()
  @UseGuards(AuthGuard("jwt"))
  async create(@Req() req: any, @Body() dto: CreateLoanDto) {
    return this.service.createLoan(req.user, dto, req.headers.authorization);
  }

  @Get()
  @UseGuards(AuthGuard("jwt"))
  @Roles("ADMIN", "TECH")
  async listAll() {
    return this.service.listAllLoans();
  }

  @Get("my")
  @UseGuards(AuthGuard("jwt"))
  async listMine(@Req() req: any) {
    return this.service.listLoansByUser(req.user.sub);
  }

  @Get(":id")
  @UseGuards(AuthGuard("jwt"))
  @Roles("ADMIN", "TECH")
  async getById(@Param("id") id: string) {
    return this.service.getLoanById(id);
  }

  @Patch(":id/return")
  @UseGuards(AuthGuard("jwt"))
  @Roles("ADMIN", "TECH")
  async returnLoan(@Req() req: any, @Param("id") id: string, @Body() dto: ReturnLoanDto) {
    return this.service.returnLoan(req.user, id, dto, req.headers.authorization);
  }
}
