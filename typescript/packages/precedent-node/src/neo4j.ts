import { driver, auth } from "neo4j-driver";

export interface SessionArguments {
  uri: string;
  username: string;
  password: string;
  database: string;
}

export async function createSession({
  uri,
  username,
  password,
  database,
}: SessionArguments) {
  const d = driver(uri, auth.basic(username, password));

  const session = d.session({
    database,
  });
  await session.executeWrite((trx) => {
    trx.run("RETURN 1");
  });
  return session;
}
