# CoffeesService tests design

## Goal

Add isolated Jest unit tests for every public method of `CoffeesService` and expose a root `package.json` test script that delegates execution to Nx.

## Design

The suite instantiates `CoffeesService` with typed Jest mocks for the Coffee repository, Flavor repository, and TypeORM `DataSource`. No database or Nest testing module is needed: dependency injection behavior is outside the service's unit-test boundary.

The tests cover pagination and relations in `findAll`; success and `NotFoundException` paths in `findOne`; existing/new flavor handling and transactions in `create`; successful and missing-record paths in `update`; lookup plus removal in `remove`; recommendation increments and event persistence in `recommendCoffee`; and commit, rollback, and release behavior through public methods that use the private transaction helper.

The root script is `"test": "nx test fundamentals"`. The suite is verified with Nx, both as a focused test file and as the complete project test target.

## Success criteria

- `apps/fundamentals/src/app/coffees/coffees.service.spec.ts` passes under Jest.
- Tests do not connect to a real database.
- Transaction success commits and releases; failure rolls back and releases.
- `npm test` invokes the Nx test target for `fundamentals`.

