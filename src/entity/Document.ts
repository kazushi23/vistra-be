import {Entity, Index, PrimaryGeneratedColumn, Column, BeforeInsert, BeforeUpdate } from "typeorm";

// @Index("unique_name", ["name"], { unique: true })
@Entity()
export class Document {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: "varchar", length: 255 })
    name!: string;

    @Column({ type: "varchar", length: 255, nullable: true  })
    baseName?: string;

    @Column({ type: "enum", enum: ["file", "folder"] })
    type!: "file" | "folder";

    @Column({ type: "bigint", nullable: true })
    size?: number; // only for files (bytes)

    @Column({ type: "varchar", length: 100 })
    createdBy!: string;

    @Column({ type: "bigint" })
    createdAt!: number;

    @Column({ type: "bigint" })
    updatedAt!: number;

    @BeforeInsert()
    setCreatedAt() {
    const now = Date.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @BeforeUpdate()
    setUpdatedAt() {
        this.updatedAt = Date.now();
    }
//   /*
//     self-referencing where a document may belong to one parent folder
//     onDelete cascade so that if one document deleted, all child deleted
//     if soft-delete, do not require ondelete cascade

//   */
//   @ManyToOne(() => Document, (document) => document.children, { nullable: true, onDelete: "CASCADE" })
//   parent?: Document;

//   @OneToMany(() => Document, (document) => document.parent)
//   children!: Document[];

//   // for files, where if saved to AWS S3, this is the file url to retrieve file
//   @Column({ type: "varchar", length: 500, nullable: true })
//   url?: string;
}