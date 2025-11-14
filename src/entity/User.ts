import { Column, Entity, PrimaryGeneratedColumn, BeforeInsert, BeforeUpdate, OneToMany } from "typeorm";
import { Document } from "./Document.js";


@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({type: "varchar", length: 255})
    name!: string;

    @Column({type: "varchar", length: 255})
    email!: string;

    @Column({type: "varchar", length: 255})
    password!: string

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

    @OneToMany(() => Document, document => document.user)
    document!: Document[]
}