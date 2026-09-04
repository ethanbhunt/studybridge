import { JsonFileRepository } from "./repositories/jsonFileRepository.js";
import { AccountService } from "./services/accountService.js";
import { QueryService } from "./services/queryService.js";
import { RequestService } from "./services/requestService.js";
import { SystemClock } from "./utils/clock.js";
import { RandomIdSource } from "./utils/id.js";

export interface Application {
  accounts: AccountService;
  queries: QueryService;
  requests: RequestService;
}

export async function createApplication(
  dataFilename: string,
  seedFilename: string,
): Promise<Application> {
  const repository = await JsonFileRepository.open(dataFilename, seedFilename);
  const clock = new SystemClock();
  const ids = new RandomIdSource();

  return {
    accounts: new AccountService(repository, clock, ids),
    queries: new QueryService(repository),
    requests: new RequestService(repository, clock, ids),
  };
}
