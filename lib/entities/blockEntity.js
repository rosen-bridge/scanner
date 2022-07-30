var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Column, Entity, PrimaryColumn } from "typeorm";
const PROCESSING = "PROCESSING";
const PROCEED = "PROCEED";
let BlockEntity = class BlockEntity {
    height;
    hash;
    parentHash;
    status;
    scanner;
};
__decorate([
    PrimaryColumn({
        unique: true,
    }),
    __metadata("design:type", Number)
], BlockEntity.prototype, "height", void 0);
__decorate([
    Column({
        length: 64,
        unique: true
    }),
    __metadata("design:type", String)
], BlockEntity.prototype, "hash", void 0);
__decorate([
    Column({
        length: 64,
        unique: true
    }),
    __metadata("design:type", String)
], BlockEntity.prototype, "parentHash", void 0);
__decorate([
    Column(),
    __metadata("design:type", String)
], BlockEntity.prototype, "status", void 0);
__decorate([
    Column(),
    __metadata("design:type", String)
], BlockEntity.prototype, "scanner", void 0);
BlockEntity = __decorate([
    Entity()
], BlockEntity);
export { BlockEntity };
export { PROCEED, PROCESSING };
