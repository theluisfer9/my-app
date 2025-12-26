import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/signup")({
  component: SignUpComponent,
});

function SignUpComponent() {
  // Con autenticación solo por OAuth, no hay diferencia entre signup y signin
  // Redirigimos a la página de inicio de sesión
  return <Navigate to="/signin" />;
}
