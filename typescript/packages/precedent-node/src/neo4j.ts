import { auth, Driver, driver } from "neo4j-driver";

export interface SessionArguments {
  uri: string;
  username: string;
  password: string;
  database: string;
}

export function getDriver({
  uri,
  username,
  password,
}: SessionArguments): Driver {
  return driver(uri, auth.basic(username, password));
}
