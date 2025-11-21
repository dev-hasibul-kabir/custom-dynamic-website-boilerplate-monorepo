<!-- 3c5e34ea-ea30-4072-b163-d33774f33a65 2a8c6c89-f763-42d9-a6dc-9e8eaa0044e6 -->

# RBAC Overhaul Plan

## Overview

Rework the current module/action guard into a modern RBAC layer inspired by CASL-style abilities: normalize Prisma models, dynamically build abilities per request, expose management APIs, and deliver an admin-friendly permission matrix UI.

## Implementation Steps

1. **Model & Schema Redesign**

- Update `apps/api/prisma/schema.prisma` to introduce normalized tables: `Permission` (subject/action), `RolePermission` (join), optional `UserRole` for multi-role support, and `UserPermission` for overrides.
- Ensure referential integrity, timestamps, and unique constraints (e.g., `(roleId, permissionId)`).
- Generate a new Prisma migration and update the client.

2. **Seed & Constant Cleanup**

- Replace `ConstantService` static lists with seed scripts + query endpoints reading from the DB.
- Provide initial roles (Super Admin, Admin, Viewer) and a canonical permission catalog so environments bootstrap consistently.

3. **Ability Factory & Guard Layer**

- Create an ability builder service (e.g., `apps/api/src/common/authorization/ability.factory.ts`) that loads a user’s roles/permissions via Prisma and returns a CASL `AppAbility`.
- Rewrite `apps/api/src/common/guards/permission.guard.ts` to extend `JwtGuard`, inject the ability factory, and evaluate a new `@CheckAbility` decorator through `ability.can(action, subject)`.
- Cache abilities per request to avoid duplicate DB hits and surface Forbidden errors with consistent messaging.

4. **Decorator & Controller Updates**

- Replace `ModulePermission` with the new decorator supporting `{ action, subject }` metadata, plus optional logical combinations.
- Update controllers under `apps/api/src/modules` (user, role, permission, folder, file, etc.) to declare the specific subject/action each endpoint needs.
- Ensure Swagger (if present) or inline docs reflect the new semantics.

5. **Role & Permission Management APIs**

- Extend `/api/v1/roles` endpoints to manage assigned permissions (attach/detach) and expose summaries (role metadata, granted actions, derived users).
- Expand `/api/v1/permissions` to cover CRUD on the permission catalog plus lookup/grouping endpoints modules/subjects need.
- Add endpoints to grant or revoke roles/permissions per user with validation (e.g., safeguard the last Super Admin).

6. **Admin Permission UI Revamp**

- Replace `GenericViewGenerator` usage in `apps/admin/src/app/(authenticated)/roles/[id]/permissions/page.tsx` with a bespoke Permission Matrix component.
- Fetch modules/actions via the new APIs, render grouped checkboxes with bulk toggles, search/filter, and optimistic updates for better UX.
- Ensure accessibility (focus states, ARIA labels) and responsive layout for large permission sets.

7. **Documentation**

- Write comprehensive docs covering the RBAC model, seeding strategy, API surface, admin UI workflow, and migration steps (mapping old module strings to the new subject/action records).
- Highlight how to introduce new subjects/actions and update permissions without code changes.

### To-dos

- [ ] Redesign Prisma models for roles/permissions
- [ ] Implement ability factory + guard rewrite
- [ ] Create new ability decorator + update controllers
- [ ] Expand role/permission management endpoints
- [ ] Add tests and documentation for RBAC
