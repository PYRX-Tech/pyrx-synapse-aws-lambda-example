import type { APIGatewayProxyHandler } from 'aws-lambda';
import { Synapse } from '@pyrx/synapse';
const synapse = new Synapse({ baseUrl: process.env.SYNAPSE_API_URL || "https://synapse-api.pyrx.tech", apiKey: process.env.SYNAPSE_API_KEY!, workspaceId: process.env.SYNAPSE_WORKSPACE_ID! });

export const list: APIGatewayProxyHandler = async (event) => {
  const q = event.queryStringParameters || {};
  const r = await synapse.contacts.list({ page: Number(q.page) || 1, limit: Number(q.limit) || 20 });
  return { statusCode: 200, body: JSON.stringify(r) };
};

export const get: APIGatewayProxyHandler = async (event) => {
  return { statusCode: 200, body: JSON.stringify(await synapse.contacts.get(event.pathParameters!.id!)) };
};

export const update: APIGatewayProxyHandler = async (event) => {
  return { statusCode: 200, body: JSON.stringify(await synapse.contacts.update(event.pathParameters!.id!, JSON.parse(event.body || '{}'))) };
};

export const remove: APIGatewayProxyHandler = async (event) => {
  await synapse.contacts.delete(event.pathParameters!.id!);
  return { statusCode: 200, body: JSON.stringify({ success: true }) };
};
