import { createRouter } from "@tanstack/react-router";
import { AppErrorComponent } from "@/lib/error-component";
import { routeTree } from "./routeTree.gen";

function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center bg-background px-6 text-center text-foreground">
      <div>
        <p className="font-display text-2xl font-semibold">No está aquí</p>
        <p className="mt-2 text-sm text-muted-foreground">Esa pantalla no existe.</p>
        <a href="/" className="mt-4 inline-block text-sm text-primary">
          Volver al inicio
        </a>
      </div>
    </main>
  );
}

export function getRouter() {
  return createRouter({
    routeTree,
    defaultErrorComponent: AppErrorComponent,
    defaultNotFoundComponent: NotFound,
  });
}
