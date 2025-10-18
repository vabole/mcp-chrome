import { describe, it, expect, beforeEach } from '@jest/globals';
import {
  formatResponse,
  ResponseFormat,
  setResponseFormat,
  getResponseFormat,
  resetResponseFormat,
  stringify,
} from '../src/response-formatter';

describe('ResponseFormatter', () => {
  beforeEach(() => {
    resetResponseFormat();
  });

  describe('formatResponse', () => {
    it('should format simple objects as YAML by default', () => {
      const data = {
        success: true,
        message: 'Test message',
        value: 123,
      };

      const result = formatResponse(data);

      expect(result).toContain('success: true');
      expect(result).toContain('message: Test message');
      expect(result).toContain('value: 123');
      expect(result).not.toContain('{'); // Should not have JSON braces
      expect(result).not.toContain('}');
    });

    it('should format as JSON when overridden', () => {
      const data = { test: 'value' };
      const result = formatResponse(data, ResponseFormat.JSON);

      expect(result).toBe('{"test":"value"}');
    });

    it('should handle nested objects in YAML', () => {
      const data = {
        outer: {
          inner: {
            value: 'nested',
          },
        },
      };

      const result = formatResponse(data);

      expect(result).toContain('outer:');
      expect(result).toContain('inner:');
      expect(result).toContain('value: nested');
    });

    it('should handle arrays in YAML', () => {
      const data = {
        items: [1, 2, 3],
        tags: ['a', 'b', 'c'],
      };

      const result = formatResponse(data);

      expect(result).toContain('items:');
      expect(result).toContain('- 1');
      expect(result).toContain('- 2');
      expect(result).toContain('- 3');
    });

    it('should handle null and undefined values', () => {
      const data = {
        nullValue: null,
        undefinedValue: undefined,
      };

      const result = formatResponse(data);

      expect(result).toContain('nullValue: null');
    });
  });

  describe('configuration', () => {
    it('should allow setting format to JSON', () => {
      setResponseFormat({ format: ResponseFormat.JSON });

      const data = { test: 'value' };
      const result = formatResponse(data);

      expect(result).toBe('{"test":"value"}');
    });

    it('should allow pretty JSON formatting', () => {
      setResponseFormat({ format: ResponseFormat.JSON, prettyJson: true });

      const data = { test: 'value' };
      const result = formatResponse(data);

      expect(result).toContain('{\n');
      expect(result).toContain('  "test": "value"');
      expect(result).toContain('\n}');
    });

    it('should return current configuration', () => {
      setResponseFormat({ format: ResponseFormat.JSON, prettyJson: true });

      const config = getResponseFormat();

      expect(config.format).toBe(ResponseFormat.JSON);
      expect(config.prettyJson).toBe(true);
    });

    it('should reset to default configuration', () => {
      setResponseFormat({ format: ResponseFormat.JSON });
      resetResponseFormat();

      const config = getResponseFormat();
      expect(config.format).toBe(ResponseFormat.YAML);
    });
  });

  describe('stringify', () => {
    it('should use configured format', () => {
      const data = { test: 'value' };

      // Default is YAML
      let result = stringify(data);
      expect(result).toContain('test: value');

      // Change to JSON
      setResponseFormat({ format: ResponseFormat.JSON });
      result = stringify(data);
      expect(result).toBe('{"test":"value"}');
    });
  });

  describe('token efficiency comparison', () => {
    it('should demonstrate YAML uses fewer tokens', () => {
      const data = {
        success: true,
        message: 'Successfully refreshed current tab',
        tabId: 123,
        windowId: 456,
        url: 'https://example.com',
      };

      const jsonResult = formatResponse(data, ResponseFormat.JSON);
      const yamlResult = formatResponse(data, ResponseFormat.YAML);

      // YAML should be shorter
      expect(yamlResult.length).toBeLessThan(jsonResult.length);

      // Rough approximation: YAML should save at least 20% in character count
      const savings = (jsonResult.length - yamlResult.length) / jsonResult.length;
      expect(savings).toBeGreaterThan(0.15); // At least 15% savings
    });
  });
});
