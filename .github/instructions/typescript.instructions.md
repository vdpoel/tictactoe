# TypeScript Guidelines

These are the general guidelines for writing JavaScript and TypeScript code.

## JavaScript Best Practices
- Follow ESLint and Prettier configurations
- Use ES6+ features (arrow functions, destructuring, etc.)
- Prefer const over let, avoid var
- Use async/await for asynchronous operations
- Use template literals for string concatenation

## Directory Structure
- Follow the feature-based structure: `src/app/features/` per feature, `src/app/shared/` for cross-cutting utilities
- Place static files in the `public` directory
- Store stylesheets, fonts, and images in the `assets` directory

## Pages and Routing
- Use the Angular Router for all navigation
- Define routes with `loadComponent` or `loadChildren` for lazy loading
- Use route parameters and `ActivatedRoute` for dynamic content
- Implement route guards (`CanActivate`, `CanDeactivate`) where appropriate
- Use `RouterLink` and `RouterLinkActive` directives in templates

## Components
- Create reusable components in the appropriate feature or shared directory
- Use standalone components (`standalone: true`) by default
- Use `input()` and `output()` signals instead of `@Input()` and `@Output()` decorators, **except** for components exercised by Cucumber step definitions: use `@Input({ required: true })` with a setter there instead
- Use `model()` for two-way bindable inputs instead of a manual `@Input`/`@Output` pair
- Implement proper component naming (PascalCase class, kebab-case selector)
- Use `OnPush` change detection strategy for performance
- Use content projection (`ng-content`) for flexible component composition
- Organize components in subdirectories by feature

## Services
- Place reusable logic in services decorated with `@Injectable({ providedIn: 'root' })`
- Use `inject()` instead of constructor injection
- Keep services focused on a single responsibility
- Properly type all service methods and return values with TypeScript
- Use Angular built-in services (e.g. `HttpClient`, `Router`) via `inject()`

## State Management
- Prefer Angular signals (`signal()`, `computed()`, `effect()`) for component and local state, except in components covered by the Cucumber behaviour tests (see the JIT exception in the Components section above)
- Use a signal-based service for shared state across components
- Avoid global mutable state; prefer co-locating state with the component or feature that owns it
- Do not use `BehaviorSubject` for simple state that signals can handle
- Use NgRx only for complex application-wide state with side effects
- Implement proper typing for all state

## API Calls
- Use `HttpClient` (via `inject(HttpClient)`) for all HTTP communication
- Use `toSignal()` to bridge Observables to signals in components
- Implement proper error handling with `catchError` or `takeUntilDestroyed`
- Encapsulate HTTP calls in dedicated services, not in components
- Use `HttpInterceptor` for cross-cutting concerns (auth headers, error handling)
- Keep sensitive operations behind server-side routes or a secure backend

## TypeScript
- Use TypeScript for better type safety
- Define interfaces and types for data structures
- Use generics when appropriate
- Avoid using the `any` type
- Write `erasableSyntaxOnly`-compliant code only (no enums, namespaces, or class parameter properties)

## Performance
- Use `OnPush` change detection to minimize unnecessary re-renders
- Lazy-load feature routes with `loadComponent` / `loadChildren`
- Use `@defer` blocks for deferring non-critical component rendering
- Prefer signals over Observables where reactivity is local to a component
- Use `trackBy` (or the `track` expression in `@for`) to optimize list rendering

## SEO
- Manage page titles with Angular's `Title` service
- Manage meta tags with Angular's `Meta` service
- Use semantic HTML elements
- Ensure accessibility compliance (ARIA attributes, keyboard navigation)
