"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoansService = void 0;
const common_1 = require("@nestjs/common");
const rxjs_1 = require("rxjs");
const prisma_service_1 = require("../prisma/prisma.service");
const app_config_service_1 = require("../config/app-config.service");
const axios_1 = require("@nestjs/axios");
const client_1 = require("@prisma/client");
let LoansService = class LoansService {
    prisma;
    cfg;
    http;
    constructor(prisma, cfg, http) {
        this.prisma = prisma;
        this.cfg = cfg;
        this.http = http;
    }
    async listAllLoans() {
        return this.prisma.loan.findMany({ orderBy: { createdAt: "desc" } });
    }
    async listLoansByUser(userId) {
        if (!userId)
            throw new common_1.BadRequestException("Missing user id (sub).");
        return this.prisma.loan.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
        });
    }
    async getLoanById(id) {
        const loan = await this.prisma.loan.findUnique({ where: { id } });
        if (!loan)
            throw new common_1.NotFoundException("Loan not found.");
        return loan;
    }
    async createLoan(user, dto, authHeader) {
        const effectiveUserId = dto.userId ?? user?.sub;
        if (!effectiveUserId)
            throw new common_1.BadRequestException("Missing user id.");
        const authorization = this.forwardAuth(authHeader);
        await this.assertUserExists(effectiveUserId, authorization);
        const equipment = await this.getEquipment(dto.equipmentId, authorization);
        if (!equipment)
            throw new common_1.NotFoundException("Equipment not found.");
        if (equipment.status !== "AVAILABLE") {
            throw new common_1.BadRequestException(`Equipment is not available (status=${equipment.status}).`);
        }
        const startDate = dto.startDate ? new Date(dto.startDate) : new Date();
        const dueDate = dto.dueDate ? new Date(dto.dueDate) : null;
        const created = await this.prisma.loan.create({
            data: {
                userId: effectiveUserId,
                equipmentId: dto.equipmentId,
                status: client_1.LoanStatus.ACTIVE,
                startDate,
                dueDate,
                notes: dto.notes ?? null,
            },
        });
        try {
            await this.updateEquipmentStatus(dto.equipmentId, "LOANED", authorization);
        }
        catch (err) {
            await this.prisma.loan.delete({ where: { id: created.id } }).catch(() => undefined);
            throw new common_1.HttpException({
                message: "Failed to lock equipment in inventory-service. Loan was rolled back.",
                details: this.safeErr(err),
            }, 502);
        }
        return created;
    }
    async returnLoan(_user, loanId, dto, authHeader) {
        const authorization = this.forwardAuth(authHeader);
        const loan = await this.prisma.loan.findUnique({ where: { id: loanId } });
        if (!loan)
            throw new common_1.NotFoundException("Loan not found.");
        if (loan.status !== client_1.LoanStatus.ACTIVE)
            throw new common_1.BadRequestException("Loan is not active.");
        try {
            await this.updateEquipmentStatus(loan.equipmentId, "AVAILABLE", authorization);
        }
        catch (err) {
            throw new common_1.HttpException({
                message: "Failed to update equipment status in inventory-service. Loan not closed.",
                details: this.safeErr(err),
            }, 502);
        }
        return this.prisma.loan.update({
            where: { id: loanId },
            data: {
                status: client_1.LoanStatus.RETURNED,
                returnedAt: new Date(),
                notes: dto.notes ?? loan.notes,
            },
        });
    }
    forwardAuth(authHeader) {
        if (!this.cfg.authRequired())
            return undefined;
        if (!authHeader)
            throw new common_1.BadRequestException("Missing Authorization header.");
        return authHeader;
    }
    async assertUserExists(userId, authorization) {
        const url = `${this.cfg.usersServiceUrl()}/users/${userId}`;
        try {
            await (0, rxjs_1.firstValueFrom)(this.http.get(url, {
                headers: authorization ? { Authorization: authorization } : undefined,
            }));
        }
        catch (err) {
            throw new common_1.HttpException({ message: "User validation failed (users-service).", details: this.safeErr(err) }, 502);
        }
    }
    async getEquipment(equipmentId, authorization) {
        const url = `${this.cfg.inventoryServiceUrl()}/equipment/${equipmentId}`;
        try {
            const res = await (0, rxjs_1.firstValueFrom)(this.http.get(url, {
                headers: authorization ? { Authorization: authorization } : undefined,
            }));
            return res.data;
        }
        catch (err) {
            const status = err?.response?.status;
            if (status === 404)
                throw new common_1.NotFoundException("Equipment not found.");
            throw new common_1.HttpException({ message: "Failed to fetch equipment (inventory-service).", details: this.safeErr(err) }, 502);
        }
    }
    async updateEquipmentStatus(equipmentId, status, authorization) {
        const url = `${this.cfg.inventoryServiceUrl()}/equipment/${equipmentId}/status`;
        await (0, rxjs_1.firstValueFrom)(this.http.patch(url, { status }, {
            headers: authorization ? { Authorization: authorization } : undefined,
        }));
    }
    safeErr(err) {
        return {
            message: err?.message,
            status: err?.response?.status,
            data: err?.response?.data,
        };
    }
};
exports.LoansService = LoansService;
exports.LoansService = LoansService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        app_config_service_1.AppConfigService,
        axios_1.HttpService])
], LoansService);
//# sourceMappingURL=loans.service.js.map