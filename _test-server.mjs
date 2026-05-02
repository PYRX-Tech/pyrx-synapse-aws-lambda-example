/**
 * Local test server that adapts AWS Lambda handler functions
 * to a plain Node.js HTTP server. No SAM CLI required.
 */
import { createServer } from 'node:http';
import { URL } from 'node:url';

const PORT = parseInt(process.env.PORT || '3002', 10);

// Dynamic imports of handler modules (tsx handles TS transpilation)
const track = await import('./src/track.ts');
const trackBatch = await import('./src/track-batch.ts');
const identify = await import('./src/identify.ts');
const identifyBatch = await import('./src/identify-batch.ts');
const send = await import('./src/send.ts');
const contacts = await import('./src/contacts.ts');
const templates = await import('./src/templates.ts');

function parseBody(req) {
  return new Promise((resolve) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks).toString() || '{}'));
  });
}

function makeLambdaEvent(method, path, body, url) {
  return {
    httpMethod: method,
    path,
    body,
    pathParameters: {},
    queryStringParameters: Object.fromEntries(url.searchParams),
    headers: {},
    requestContext: {},
    isBase64Encoded: false,
    stageVariables: null,
    resource: '',
    multiValueHeaders: {},
    multiValueQueryStringParameters: {},
  };
}

async function callHandler(handler, event) {
  const result = await handler(event, {}, () => {});
  return result;
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const path = url.pathname;
  const method = req.method;
  const body = await parseBody(req);
  const event = makeLambdaEvent(method, path, body, url);

  try {
    let result;

    // Core
    if (path === '/api/track' && method === 'POST') result = await callHandler(track.handler, event);
    else if (path === '/api/track/batch' && method === 'POST') result = await callHandler(trackBatch.handler, event);
    else if (path === '/api/identify' && method === 'POST') result = await callHandler(identify.handler, event);
    else if (path === '/api/identify/batch' && method === 'POST') result = await callHandler(identifyBatch.handler, event);
    else if (path === '/api/send' && method === 'POST') result = await callHandler(send.handler, event);

    // Contacts
    else if (path === '/api/contacts' && method === 'GET') result = await callHandler(contacts.list, event);
    else if (path.match(/^\/api\/contacts\/([^/]+)$/) && method === 'GET') {
      event.pathParameters = { id: path.match(/^\/api\/contacts\/([^/]+)$/)[1] };
      result = await callHandler(contacts.get, event);
    }
    else if (path.match(/^\/api\/contacts\/([^/]+)$/) && method === 'PUT') {
      event.pathParameters = { id: path.match(/^\/api\/contacts\/([^/]+)$/)[1] };
      result = await callHandler(contacts.update, event);
    }
    else if (path.match(/^\/api\/contacts\/([^/]+)$/) && method === 'DELETE') {
      event.pathParameters = { id: path.match(/^\/api\/contacts\/([^/]+)$/)[1] };
      result = await callHandler(contacts.remove, event);
    }

    // Templates
    else if (path === '/api/templates' && method === 'GET') result = await callHandler(templates.list, event);
    else if (path === '/api/templates' && method === 'POST') result = await callHandler(templates.create, event);
    else if (path.match(/^\/api\/templates\/([^/]+)\/preview$/) && method === 'POST') {
      event.pathParameters = { slug: path.match(/^\/api\/templates\/([^/]+)\/preview$/)[1] };
      result = await callHandler(templates.preview, event);
    }
    else if (path.match(/^\/api\/templates\/([^/]+)$/) && method === 'GET') {
      event.pathParameters = { slug: path.match(/^\/api\/templates\/([^/]+)$/)[1] };
      result = await callHandler(templates.get, event);
    }
    else if (path.match(/^\/api\/templates\/([^/]+)$/) && method === 'PUT') {
      event.pathParameters = { slug: path.match(/^\/api\/templates\/([^/]+)$/)[1] };
      result = await callHandler(templates.update, event);
    }
    else if (path.match(/^\/api\/templates\/([^/]+)$/) && method === 'DELETE') {
      event.pathParameters = { slug: path.match(/^\/api\/templates\/([^/]+)$/)[1] };
      result = await callHandler(templates.remove, event);
    }
    else {
      res.writeHead(404);
      res.end('Not found');
      return;
    }

    res.writeHead(result.statusCode, { 'Content-Type': 'application/json' });
    res.end(result.body);
  } catch (e) {
    const status = e.status || 500;
    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: e.message, status }));
  }
});

server.listen(PORT, () => {
  console.log(`Lambda test server listening on http://localhost:${PORT}`);
});
