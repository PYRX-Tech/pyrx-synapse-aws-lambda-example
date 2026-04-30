import type { APIGatewayProxyHandler } from 'aws-lambda';
import { Synapse } from '@pyrx/synapse';
const synapse = new Synapse({ apiKey: process.env.SYNAPSE_API_KEY!, workspaceId: process.env.SYNAPSE_WORKSPACE_ID! });

export const list: APIGatewayProxyHandler = async () => {
  return { statusCode: 200, body: JSON.stringify(await synapse.templates.list()) };
};

export const create: APIGatewayProxyHandler = async (event) => {
  return { statusCode: 200, body: JSON.stringify(await synapse.templates.create(JSON.parse(event.body || '{}'))) };
};

export const get: APIGatewayProxyHandler = async (event) => {
  return { statusCode: 200, body: JSON.stringify(await synapse.templates.get(event.pathParameters!.slug!)) };
};

export const update: APIGatewayProxyHandler = async (event) => {
  return { statusCode: 200, body: JSON.stringify(await synapse.templates.update(event.pathParameters!.slug!, JSON.parse(event.body || '{}'))) };
};

export const remove: APIGatewayProxyHandler = async (event) => {
  await synapse.templates.delete(event.pathParameters!.slug!);
  return { statusCode: 200, body: JSON.stringify({ success: true }) };
};

export const preview: APIGatewayProxyHandler = async (event) => {
  const { attributes } = JSON.parse(event.body || '{}');
  return { statusCode: 200, body: JSON.stringify(await synapse.templates.preview(event.pathParameters!.slug!, { attributes })) };
};
