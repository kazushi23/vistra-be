var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert, BeforeUpdate } from "typeorm";
// @Index("unique_name", ["name"], { unique: true })
let Document = class Document {
    id; // 1,2,3,....
    name; // name of file/folder
    type; // type of document {file | folder}
    size; // only for files (bytes)
    createdBy; // name of creator (static string for now)
    createdAt; // unixmilli utc of creation time
    updatedAt; // unixmilli utc of updated time
    setCreatedAt() {
        const now = Date.now();
        this.createdAt = now;
        this.updatedAt = now;
    }
    setUpdatedAt() {
        this.updatedAt = Date.now();
    }
};
__decorate([
    PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], Document.prototype, "id", void 0);
__decorate([
    Column({ type: "varchar", length: 255 }),
    __metadata("design:type", String)
], Document.prototype, "name", void 0);
__decorate([
    Column({ type: "enum", enum: ["file", "folder"] }),
    __metadata("design:type", String)
], Document.prototype, "type", void 0);
__decorate([
    Column({ type: "bigint", nullable: true }),
    __metadata("design:type", Number)
], Document.prototype, "size", void 0);
__decorate([
    Column({ type: "varchar", length: 100 }),
    __metadata("design:type", String)
], Document.prototype, "createdBy", void 0);
__decorate([
    Column({ type: "bigint" }),
    __metadata("design:type", Number)
], Document.prototype, "createdAt", void 0);
__decorate([
    Column({ type: "bigint" }),
    __metadata("design:type", Number)
], Document.prototype, "updatedAt", void 0);
__decorate([
    BeforeInsert(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], Document.prototype, "setCreatedAt", null);
__decorate([
    BeforeUpdate() // before update of data, note the time
    ,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], Document.prototype, "setUpdatedAt", null);
Document = __decorate([
    Entity()
], Document);
export { Document };
//# sourceMappingURL=Document.js.map