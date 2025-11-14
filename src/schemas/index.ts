import fs from "fs";
import path from "path";
import { gql } from "graphql-tag";
import { mergeTypeDefs } from "@graphql-tools/merge";

const schemas = ["user.schema.graphql"].map(file =>
  gql(fs.readFileSync(path.join(process.cwd(), "src/schemas", file), "utf8"))
);

export default mergeTypeDefs(schemas);
