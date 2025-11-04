# TODO:
Logging
Validation - Folder unique / File repeated _(x)
Type enforcing
comments
caching?
Limit 10 files per upload? & duplicate check for db + array needed, or db only?
transaction locking for duplicates
error message between frontend and backend
optimising fileservice, are logic where it is suppose to be?
testscript high traffic insert to test duplication

removed unique for folder and file => keep it simple first and submit
no unique constraints for name and TODO remove basename
file(x) all in bu

dont need user table, just a static string first as not requested in assignment

# Actual TODO
Caching?
Unique contraints explaination (transactions, results(x).csv, retry)
Comments
Typescript enforcing
Testscripts
Is logic where it is suppose to be?

# Test:
npm i
ensure all data in mysql is dropped



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

Everything is not multi-tenant or partitioned by user/company. All implementation is based on single assumption that all users are attached to same instance of database.

unique constraint {Name} on document db when type == folder
for file, can have duplicate, but file will add (1) ... (x)