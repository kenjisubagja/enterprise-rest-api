export default function Home() {
  return (
    <main style={{ fontFamily: "system-ui", padding: 32 }}>
      <h1>Enterprise REST API</h1>
      <p>Next.js App Router + PostgreSQL + Prisma.</p>
      <ul>
        <li>
          <a href="/api/health">/api/health</a>
        </li>
        <li>
          <a href="/api/openapi">/api/openapi</a>
        </li>
      </ul>
    </main>
  );
}
