import { auth, Driver, driver } from "neo4j-driver";
import { z } from "zod";

export const ZNeoArguments = z.object({
  uri: z.string().min(1),
  username: z.string().min(1),
  password: z.string().min(1),
  database: z.string().min(1),
});

export type NeoArguments = z.infer<typeof ZNeoArguments>;

export function getDriver({ uri, username, password }: NeoArguments): Driver {
  return driver(uri, auth.basic(username, password));
}
