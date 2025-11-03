# TODO:
Logging
Validation - Folder unique / File repeated _(x)
Type enforcing
comments
caching?

# CONSIDERATIONS:
## DB
Single document table for easy query for document retrieval unified view
If scaling needed, add on to document table with relationship
    eg. if permission table needed, add on and map to document
Add on columns for self-referencing, if folders have sub folder and files belong to folder, we can add:
```javascript
/*
self-referencing where a document may belong to one parent folder
onDelete cascade so that if one document deleted, all child deleted
if soft-delete, do not require ondelete cascade

*/
@ManyToOne(() => Document, (document) => document.children, { nullable: true, onDelete: "CASCADE" })
parent?: Document;

@OneToMany(() => Document, (document) => document.parent)
children!: Document[];

// for files, where if saved to AWS S3, this is the file url to retrieve file
@Column({ type: "varchar", length: 500, nullable: true })
url?: string;
```