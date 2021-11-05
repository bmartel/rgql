import dgraph from "dgraph-js";

export const client = new dgraph.DgraphClient(
  new dgraph.DgraphClientStub(
    // addr: optional, default: "localhost:9080"
    process.env.DGRAPH_HOST || "localhost:9080",
  )
);

client.setDebugMode(process.env.NODE_ENV !== "production");
