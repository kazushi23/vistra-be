import {Entity, Index, PrimaryGeneratedColumn, Column, BeforeInsert, BeforeUpdate, ManyToOne, JoinColumn } from "typeorm";
import { User } from "./User.js";

// @Index("unique_name", ["name"], { unique: true })
@Entity()
export class Document {
    @PrimaryGeneratedColumn()
    id!: number; // 1,2,3,....

    @Column({ type: "varchar", length: 255 })
    name!: string; // name of file/folder

    @Column({ type: "enum", enum: ["file", "folder"] })
    type!: "file" | "folder"; // type of document {file | folder}

    @Column({ type: "bigint", nullable: true })
    size?: number; // only for files (bytes)

    @Column({ type: "varchar", length: 100 })
    createdBy!: string; // name of creator (static string for now)

    @Column({ type: "bigint" })
    createdAt!: number; // unixmilli utc of creation time

    @Column({ type: "bigint" })
    updatedAt!: number; // unixmilli utc of updated time

    @BeforeInsert()
    setCreatedAt() { // before creation of data, note the time
    const now = Date.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @BeforeUpdate() // before update of data, note the time
    setUpdatedAt() {
        this.updatedAt = Date.now();
    }

    @ManyToOne(() => User, user => user.document)
    @JoinColumn({name: "userId"})
    user!: User

    @Column()
    userId!: number;
}