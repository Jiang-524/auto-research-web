#!/usr/bin/env node
// Smoke test for Auto Research Web
// Starts server on random port, checks endpoints, verifies private files are blocked.

const { spawn } = require("child_process");
const http = require("http");
const path = require("path");

const TEST_PORT = 3099 + Math.floor(Math.random() * 1000);

function fetchJSON(port, route) {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:${port}${route}`, { timeout: 5000 }, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, body: data.slice(0, 200) });
        }
      });
    }).on("error", reject);
  });
}

function fetchText(port, route) {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:${port}${route}`, { timeout: 5000 }, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => resolve({ status: res.statusCode, body: data.slice(0, 100) }));
    }).on("error", reject);
  });
}

async function runTests() {
  console.log("=== Auto Research Web Smoke Tests ===\n");

  // Start server
  const server = spawn("node", ["server.js"], {
    cwd: __dirname,
    env: { ...process.env, PORT: String(TEST_PORT) },
    stdio: "pipe"
  });

  let serverOutput = "";
  server.stdout.on("data", (d) => (serverOutput += d.toString()));
  server.stderr.on("data", (d) => (serverOutput += d.toString()));

  // Wait for server to start
  await new Promise((resolve) => setTimeout(resolve, 2000));

  let passed = 0;
  let failed = 0;

  async function check(name, fn) {
    try {
      await fn();
      console.log(`  PASS: ${name}`);
      passed++;
    } catch (err) {
      console.log(`  FAIL: ${name} — ${err.message}`);
      failed++;
    }
  }

  // 1. Status endpoint
  await check("GET /api/status returns OK", async () => {
    const r = await fetchJSON(TEST_PORT, "/api/status");
    if (r.status !== 200) throw new Error(`status ${r.status}`);
    if (r.body.status !== "ok") throw new Error(`unexpected body: ${JSON.stringify(r.body)}`);
  });

  // 2. Modes endpoints
  for (const mod of ["research", "writer", "reviewer"]) {
    await check(`GET /api/modes/${mod} returns modes`, async () => {
      const r = await fetchJSON(TEST_PORT, `/api/modes/${mod}`);
      if (r.status !== 200) throw new Error(`status ${r.status}`);
      if (!r.body.modes || !r.body.modes.length) throw new Error("no modes returned");
    });
  }

  // 3. Export endpoint
  await check("POST /api/export returns file", async () => {
    const body = JSON.stringify({ content: "# Test", format: "markdown", filename: "test" });
    const r = await new Promise((resolve, reject) => {
      const req = http.request(`http://localhost:${TEST_PORT}/api/export`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      }, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => resolve({ status: res.statusCode, body: data }));
      });
      req.on("error", reject);
      req.write(body);
      req.end();
    });
    if (r.status !== 200) throw new Error(`status ${r.status}`);
    if (!r.body.includes("# Test")) throw new Error("content mismatch");
  });

  // 4. LLM endpoint without key
  await check("POST /api/research without key returns 500", async () => {
    const body = JSON.stringify({ topic: "test", mode: "quick" });
    const r = await new Promise((resolve, reject) => {
      const req = http.request(`http://localhost:${TEST_PORT}/api/research`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      }, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
          catch { resolve({ status: res.statusCode, body: data }); }
        });
      });
      req.on("error", reject);
      req.write(body);
      req.end();
    });
    if (r.status !== 500) throw new Error(`expected 500, got ${r.status}`);
    if (!r.body.error) throw new Error("no error message");
  });

  // 5. Malformed JSON
  await check("Malformed JSON returns 400 with sanitized error", async () => {
    const r = await new Promise((resolve, reject) => {
      const req = http.request(`http://localhost:${TEST_PORT}/api/research`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      }, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
          catch { resolve({ status: res.statusCode, body: data }); }
        });
      });
      req.on("error", reject);
      req.write("{broken json");
      req.end();
    });
    if (r.status !== 400) throw new Error(`expected 400, got ${r.status}`);
    if (!r.body.error) throw new Error("no error message");
  });

  // 6. Private files blocked
  const privateFiles = [
    "/server.js", "/prompts/index.js", "/office.md",
    "/CLAUDE.md", "/AGENTS.md", "/todo.md", "/.env.example", "/package.json"
  ];
  for (const pf of privateFiles) {
    await check(`Private file ${pf} is NOT served`, async () => {
      const r = await fetchText(TEST_PORT, pf);
      if (r.status === 200 && (r.body.includes("express") || r.body.includes("Phase") || r.body.includes("AGENTS") || r.body.includes("LLM_PROVIDER") || r.body.includes("dependencies"))) {
        throw new Error(`served private content (status ${r.status})`);
      }
      // Should return HTML (SPA fallback) or 404 - not raw source code
      if (r.status === 200 && r.body.includes("<!doctype html>")) {
        // OK - SPA fallthrough returns index.html
      } else if (r.status === 404 || r.status === 200) {
        // Acceptable
      } else {
        throw new Error(`unexpected status ${r.status}`);
      }
    });
  }

  // 7. Frontend is served
  await check("GET / returns HTML", async () => {
    const r = await fetchText(TEST_PORT, "/");
    if (r.status !== 200) throw new Error(`status ${r.status}`);
    if (!r.body.includes("<!doctype html>")) throw new Error("not HTML");
  });

  // 8. Data files are served
  await check("GET /data/papers.json returns papers", async () => {
    const r = await fetchJSON(TEST_PORT, "/data/papers.json");
    if (r.status !== 200) throw new Error(`status ${r.status}`);
    if (!r.body.papers) throw new Error("no papers array");
  });

  // Summary
  console.log(`\n=== Results: ${passed} passed, ${failed} failed ===`);

  server.kill();
  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch((err) => {
  console.error("Smoke test error:", err.message);
  process.exit(1);
});
