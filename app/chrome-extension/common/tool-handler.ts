import type { CallToolResult, TextContent, ImageContent } from '@modelcontextprotocol/sdk/types.js';
import { serialize, type SerializationFormat } from 'chrome-mcp-shared';
import { RESPONSE_FORMAT } from './constants';

export interface ToolResult extends CallToolResult {
  content: (TextContent | ImageContent)[];
  isError: boolean;
}

export interface ToolExecutor {
  execute(args: any): Promise<ToolResult>;
}

export const createErrorResponse = (
  message: string = 'Unknown error, please try again',
): ToolResult => {
  return {
    content: [
      {
        type: 'text',
        text: message,
      },
    ],
    isError: true,
  };
};

/**
 * Create a successful tool response with serialized data.
 * By default, uses YAML format for better token efficiency (15-25% reduction vs JSON).
 *
 * @param data - The data to serialize and return
 * @param format - The serialization format (defaults to YAML)
 * @returns A ToolResult with the serialized data
 */
export const createSuccessResponse = (
  data: any,
  format: SerializationFormat = RESPONSE_FORMAT.DEFAULT,
): ToolResult => {
  return {
    content: [
      {
        type: 'text',
        text: serialize(data, { format }),
      },
    ],
    isError: false,
  };
};
