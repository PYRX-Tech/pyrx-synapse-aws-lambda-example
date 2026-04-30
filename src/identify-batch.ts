import type { APIGatewayProxyHandler } from 'aws-lambda';
import { Synapse } from '@pyrx/synapse';
const synapse = new Synapse({ apiKey: process.env.SYNAPSE_API_KEY!, workspaceId: process.env.SYNAPSE_WORKSPACE_ID! });

export const handler: APIGatewayProxyHandler = async (event) => {
  const { contacts } = JSON.parse(event.body || '{}');
  return { statusCode: 200, body: JSON.stringify(await synapse.identifyBatch({ contacts })) };
};
