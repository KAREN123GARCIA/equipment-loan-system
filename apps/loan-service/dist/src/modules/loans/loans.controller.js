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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoansController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const loans_service_1 = require("./loans.service");
const create_loan_dto_1 = require("./dto/create-loan.dto");
const return_loan_dto_1 = require("./dto/return-loan.dto");
const roles_decorator_1 = require("../authz/roles.decorator");
let LoansController = class LoansController {
    service;
    constructor(service) {
        this.service = service;
    }
    async create(req, dto) {
        return this.service.createLoan(req.user, dto, req.headers.authorization);
    }
    async listAll() {
        return this.service.listAllLoans();
    }
    async listMine(req) {
        return this.service.listLoansByUser(req.user.sub);
    }
    async getById(id) {
        return this.service.getLoanById(id);
    }
    async returnLoan(req, id, dto) {
        return this.service.returnLoan(req.user, id, dto, req.headers.authorization);
    }
};
exports.LoansController = LoansController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)("jwt")),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_loan_dto_1.CreateLoanDto]),
    __metadata("design:returntype", Promise)
], LoansController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)("jwt")),
    (0, roles_decorator_1.Roles)("ADMIN", "TECH"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LoansController.prototype, "listAll", null);
__decorate([
    (0, common_1.Get)("my"),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)("jwt")),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], LoansController.prototype, "listMine", null);
__decorate([
    (0, common_1.Get)(":id"),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)("jwt")),
    (0, roles_decorator_1.Roles)("ADMIN", "TECH"),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LoansController.prototype, "getById", null);
__decorate([
    (0, common_1.Patch)(":id/return"),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)("jwt")),
    (0, roles_decorator_1.Roles)("ADMIN", "TECH"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)("id")),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, return_loan_dto_1.ReturnLoanDto]),
    __metadata("design:returntype", Promise)
], LoansController.prototype, "returnLoan", null);
exports.LoansController = LoansController = __decorate([
    (0, common_1.Controller)("loans"),
    __metadata("design:paramtypes", [loans_service_1.LoansService])
], LoansController);
//# sourceMappingURL=loans.controller.js.map