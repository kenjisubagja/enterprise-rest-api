"use client";

import Script from "next/script";

declare global {
  interface Window {
    SwaggerUIBundle?: (options: Record<string, unknown>) => unknown;
    swaggerUi?: unknown;
  }
}

export function SwaggerUi() {
  function mountSwaggerUi() {
    if (!window.SwaggerUIBundle) return;

    window.swaggerUi = window.SwaggerUIBundle({
      url: "/api/openapi",
      dom_id: "#swagger-ui",
      deepLinking: true,
      persistAuthorization: true,
      displayRequestDuration: true
    });
  }

  return (
    <>
      <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
      <div id="swagger-ui" />
      <Script
        src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"
        strategy="afterInteractive"
        onLoad={mountSwaggerUi}
      />
    </>
  );
}
