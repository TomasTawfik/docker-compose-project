const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { spawn } = require('node:child_process');
const { setTimeout: delay } = require('node:timers/promises');

const backendDir = path.resolve(__dirname, '..');
const apiUrl = 'http://localhost:3000';

async function waitForHealthyServer(timeoutMs = 20000) {
  const start = Date.now();

  while (Date.now() - start < timeoutMs) {
    try {
      const response = await fetch(`${apiUrl}/api/health`);
      if (response.ok) {
        return;
      }
    } catch {
      // Server still starting.
    }

    await delay(250);
  }

  throw new Error('The backend did not become healthy in time.');
}

async function withServer(fn) {
  const env = { ...process.env };

  const server = spawn(process.execPath, ['src/server.js'], {
    cwd: backendDir,
    env,
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  let output = '';
  server.stdout.on('data', (chunk) => {
    output += chunk.toString();
  });
  server.stderr.on('data', (chunk) => {
    output += chunk.toString();
  });

  try {
    await waitForHealthyServer();
    await fn();
  } finally {
    server.kill('SIGTERM');
    await delay(500);
    if (!server.killed) {
      server.kill('SIGKILL');
    }
  }
}

test('backend .env includes JWT_SECRET for the API to authenticate', () => {
  const env = require('dotenv').config({ path: path.join(backendDir, '.env') }).parsed || {};
  assert.ok(env.JWT_SECRET && env.JWT_SECRET.trim().length > 0, 'JWT_SECRET is missing from backend/.env');
});

test('login rejects wrong password but succeeds and returns a JWT for valid credentials', async () => {
  await withServer(async () => {
    const uniqueEmail = `user.${Date.now()}@example.com`;
    const password = 'Password123!';

    const registerResponse = await fetch(`${apiUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Auth Test User',
        email: uniqueEmail,
        password,
      }),
    });

    assert.equal(registerResponse.status, 201, 'Expected registration to succeed');

    const badLoginResponse = await fetch(`${apiUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: uniqueEmail,
        password: 'WrongPassword123!',
      }),
    });

    assert.equal(badLoginResponse.status, 401, 'Expected a wrong password to be rejected');

    const goodLoginResponse = await fetch(`${apiUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: uniqueEmail,
        password,
      }),
    });

    assert.equal(goodLoginResponse.status, 200, 'Expected a valid login to succeed');

    const goodLoginBody = await goodLoginResponse.json();
    assert.ok(goodLoginBody.accessToken, 'The login response should include a JWT token');
    assert.ok(goodLoginBody.user && goodLoginBody.user.email === uniqueEmail, 'The login response should include the authenticated user');

    const meResponse = await fetch(`${apiUrl}/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${goodLoginBody.accessToken}`,
      },
    });

    assert.equal(meResponse.status, 200, 'Authenticated users should be recognized via /api/auth/me');

    const meBody = await meResponse.json();
    assert.equal(meBody.user.email, uniqueEmail, 'The backend should resolve the user from the JWT');

    const orderResponse = await fetch(`${apiUrl}/api/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${goodLoginBody.accessToken}`,
      },
      body: JSON.stringify({
        customerName: 'Auth Test User',
      }),
    });

    // A user without cart items will be rejected with a 400, which still proves the authenticated path is active.
    assert.notEqual(orderResponse.status, 401, 'Authenticated users should not be redirected to login when placing an order');
  });
});
