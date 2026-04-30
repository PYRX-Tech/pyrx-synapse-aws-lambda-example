import type { APIGatewayProxyHandler } from 'aws-lambda';
import { Synapse } from '@pyrx/synapse';
const synapse = new Synapse({ baseUrl: process.env.SYNAPSE_API_URL || "https://synapse-api.pyrx.tech", apiKey: process.env.SYNAPSE_API_KEY!, workspaceId: process.env.SYNAPSE_WORKSPACE_ID! });

export const handler: APIGatewayProxyHandler = async (event) => {
  const b = JSON.parse(event.body || '{}');
  const r = await synapse.send({ templateSlug: b.templateSlug, to: b.to, attributes: b.attributes });
  return { statusCode: 200, body: JSON.stringify(r) };
};
