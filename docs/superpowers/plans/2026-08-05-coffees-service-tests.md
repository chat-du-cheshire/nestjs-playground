# CoffeesService Tests Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add comprehensive isolated Jest tests for `CoffeesService` and a root Nx-backed test script.

**Architecture:** Instantiate the service directly with Jest mocks for TypeORM repositories and `DataSource`. Exercise transactions through public service methods, asserting observable repository, manager, and query-runner interactions without a database.

**Tech Stack:** TypeScript, Jest 30, NestJS 11, TypeORM 0.3, Nx 23.

---

### Task 1: Add the service unit-test suite

**Files:**
- Create: `apps/fundamentals/src/app/coffees/coffees.service.spec.ts`

- [ ] Define reusable typed mocks for Coffee and Flavor repositories, the entity manager, query runner, and data source.
- [ ] Add focused tests for `findAll`, both `findOne` paths, `create` with existing and new flavors, both `update` paths, `remove`, and `recommendCoffee`.
- [ ] Add a transaction failure test proving rollback and release while preserving the original error.
- [ ] Run `nx test fundamentals --testFile=coffees.service.spec.ts --runInBand` and confirm the new suite passes.

### Task 2: Add the root test script

**Files:**
- Modify: `package.json`

- [ ] Add `"test": "nx test fundamentals"` under `scripts`.
- [ ] Run `npm test -- --runInBand` and confirm all Fundamentals Jest suites pass through Nx.

### Task 3: Verify project quality

**Files:**
- Verify: `apps/fundamentals/src/app/coffees/coffees.service.spec.ts`
- Verify: `package.json`

- [ ] Run `nx lint fundamentals` and resolve only issues introduced by this change.
- [ ] Run `nx test fundamentals --runInBand` once more and confirm a clean result.
