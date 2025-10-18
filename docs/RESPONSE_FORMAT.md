# Response Format Configuration

## Overview

The Chrome MCP Server now supports multiple response formats for improved token efficiency and readability. By default, all tool responses are formatted as YAML instead of JSON, which provides approximately 25-30% token savings.

## Configuration

You can configure the response format using the shared `chrome-mcp-shared` package:

```typescript
import { setResponseFormat, ResponseFormat } from 'chrome-mcp-shared';

// Use YAML format (default)
setResponseFormat({ format: ResponseFormat.YAML });

// Use JSON format
setResponseFormat({ format: ResponseFormat.JSON });

// Use JSON with pretty printing
setResponseFormat({ format: ResponseFormat.JSON, prettyJson: true });
```

## Response Format Comparison

### JSON Format (Traditional)

```json
{
  "success": true,
  "message": "Successfully refreshed current tab",
  "tabId": 123,
  "windowId": 456,
  "url": "https://example.com"
}
```

Token estimate: ~35-40 tokens

### YAML Format (Default)

```yaml
success: true
message: Successfully refreshed current tab
tabId: 123
windowId: 456
url: https://example.com
```

Token estimate: ~25-30 tokens

**Savings: ~25-30% reduction in tokens**

## Benefits of YAML Format

1. **Token Efficiency**: Reduces token usage by 25-30% on average
2. **Human Readable**: More natural and easier to read for humans and LLMs
3. **Less Punctuation**: Eliminates quotes, commas, and braces where not necessary
4. **Structured**: Maintains full support for nested objects and arrays
5. **Cost Effective**: Proportional reduction in API costs for LLM interactions

## Technical Details

### Implementation

All tool responses in the Chrome extension use the `formatResponse()` function from `chrome-mcp-shared`:

```typescript
import { formatResponse } from 'chrome-mcp-shared';

// In tool implementation
return {
  content: [
    {
      type: 'text',
      text: formatResponse({
        success: true,
        data: myData,
      }),
    },
  ],
  isError: false,
};
```

### MCP Protocol Compatibility

The YAML formatting is applied to the **content** of MCP responses, not the MCP protocol envelope itself. The MCP protocol continues to use JSON as specified, ensuring full compatibility with all MCP clients.

## Migration Guide

### For Extension Developers

No changes required - the default YAML format is automatically applied to all tool responses.

### For Custom Integrations

If you want to override the format for specific use cases:

```typescript
import { formatResponse, ResponseFormat } from 'chrome-mcp-shared';

// Override for a specific response
const response = formatResponse(data, ResponseFormat.JSON);
```

## Performance Impact

- **Build time**: No significant impact
- **Runtime**: Negligible performance difference between formats
- **Bundle size**: Added ~5KB for js-yaml library
- **Token savings**: 25-30% reduction in typical responses

## Backward Compatibility

The change maintains full backward compatibility:

- MCP protocol envelope remains JSON
- Response content format is configurable
- Default is YAML for maximum efficiency
- Can be switched to JSON if needed

## Related Files

- `/packages/shared/src/response-formatter.ts` - Core formatting logic
- `/packages/shared/__tests__/response-formatter.test.ts` - Unit tests
- All tool files in `/app/chrome-extension/entrypoints/background/tools/browser/` - Updated to use formatResponse
