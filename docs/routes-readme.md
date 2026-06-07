# Routes

TanStack Start uses file-based routing. Every `.tsx` file in `src/routes` is a route. Do not
create Next.js or Remix route conventions in this project.

| File              | URL                                                  |
| ----------------- | ---------------------------------------------------- |
| `index.tsx`       | `/`                                                  |
| `users/index.tsx` | `/users`                                             |
| `users/$id.tsx`   | `/users/:id`                                         |
| `_layout.tsx`     | Layout route that renders children with `<Outlet />` |
| `__root.tsx`      | App shell that wraps every page                      |

`src/routeTree.gen.ts` is generated. Do not edit it by hand.
