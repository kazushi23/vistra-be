import request from "supertest";
import { createApp } from "../src/app.js"; // use the app factory
import { AppDataSource } from "../src/data-source.js";
import { App } from "supertest/types.js";

let app: App;

beforeAll(async () => {
  // Initialize TypeORM
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }

  app = createApp(); // no listen needed
});

afterAll(async () => {
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy(); // close connection
  }
});


describe("Documents API", () => {
    // Get documents (empty list initially)
    it("should return empty document list initially", async () => {
        const res = await request(app)
            .get("/api/v1/document")
            .query({
            page: 1,
            pagesize: 10,
            descending: "true",
            sortColumn: "updatedAt",
            search: ""
            });

        expect(res.status).toBe(200); // controller uses sendSuccess with default 200
        expect(res.body).toHaveProperty("message", "Data has been retrieved");
        expect(Array.isArray(res.body.data)).toBe(true);
    });

    // Create folder
    it("should create a folder successfully", async () => {
        const res = await request(app)
            .post("/api/v1/folder/create")
            .send({ name: "Project Docs" })
            .set("Content-Type", "application/json");

        expect(res.status).toBe(200); // controller uses sendSuccess with default 200
        expect(res.body).toHaveProperty("message", "Folder created successfully");
        expect(res.body.data).toBeDefined();
    });

    // Upload file (multipart/form-data)
    it("should create a file successfully", async () => {
        const res = await request(app)
            .post("/api/v1/file/create")
            .attach("files", Buffer.from("dummy content"), "Report.pdf");

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("message");
        expect(res.body.message.toLowerCase()).toContain("created");
        expect(res.body.data).toBeDefined();
    });

    // Negative test — Invalid file name
    it("should fail for invalid file name", async () => {
        const res = await request(app)
            .post("/api/v1/file/create")
            .attach("files", Buffer.from("dummy content"), "report@.pdf"); // '@' not allowed

        expect(res.status).toBe(400); // should hit 400
        expect(res.body).toHaveProperty("message");
        expect(res.body.message).toMatch(/invalid characters/i);
    });

    // Negative test — Invalid file type
    it("should fail for invalid file type (.json)", async () => {
        const res = await request(app)
            .post("/api/v1/file/create")
            .attach("files", Buffer.from('{"data": "fake"}'), {
            filename: "data.json",
            contentType: "application/json"
            });

        expect(res.status).toBe(400); // should hit 400
        expect(res.body).toHaveProperty("message");
        expect(res.body.message).toMatch(/invalid file type/i);
    });
    // Negative test - No file
    it("should fail when no file is provided", async () => {
        const res = await request(app)
            .post("/api/v1/file/create");

        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty("message");
        expect(res.body.message).toMatch(/files array is required/i);
    });

    // Negative test - Empty File
    it("should fail when file is empty", async () => {
        const res = await request(app)
            .post("/api/v1/file/create")
            .attach("files", Buffer.from(""), "EmptyFile.pdf"); // empty content

        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty("message");
        expect(res.body.message).toMatch(/is empty/i);
    });

    // Negative test - More than 10 files
    it("should fail when more than 10 files are uploaded", async () => {
        const req = request(app)
            .post("/api/v1/file/create");

        // attach 11 files
        for (let i = 1; i <= 11; i++) {
            req.attach("files", Buffer.from(`File content ${i}`), `file${i}.pdf`);
        }

        const res = await req;

        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty("message");
        expect(res.body.message).toMatch(/maximum of 10 files allowed/i);
    });

    // Retrieve all documents again
    it("should return a list with folders and files", async () => {
        const res = await request(app)
            .get("/api/v1/document")
            .query({
            page: 1,
            pagesize: 10,
            descending: "true",
            sortColumn: "updatedAt"
            });

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("message", "Data has been retrieved");
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body.data.length).toBeGreaterThan(0);
    });

    // Negative test — invalid page param
    it("should return error for invalid page", async () => {
        const res = await request(app)
            .get("/api/v1/document")
            .query({ page: "abc", pagesize: 10 });

        expect(res.status).toBe(400); // should hit 400
        expect(res.body).toHaveProperty("message", "Invalid page number");
    });

    // Negative test — empty folder body
    it("should fail when folder body is missing", async () => {
        const res = await request(app)
            .post("/api/v1/folder/create")
            .send({})
            .set("Content-Type", "application/json");

        expect(res.status).toBe(400); // should hit 400
        expect(res.body).toHaveProperty("message", "Folder name is required");
    });

    // Negative test — empty folder name
    it("should fail when folder name is missing", async () => {
        const res = await request(app)
            .post("/api/v1/folder/create")
            .send({name: ""})
            .set("Content-Type", "application/json");

        expect(res.status).toBe(400); // should hit 400
        expect(res.body).toHaveProperty("message", "Folder name is required");
    });
});
