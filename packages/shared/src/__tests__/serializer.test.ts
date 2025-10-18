import { describe, test, expect } from '@jest/globals';
import { serialize, deserialize } from '../serializer';

describe('Serializer', () => {
  const testData = {
    windowCount: 2,
    tabCount: 5,
    windows: [
      {
        windowId: 1,
        tabs: [
          {
            tabId: 101,
            url: 'https://example.com',
            title: 'Example Domain',
            active: true,
          },
        ],
      },
    ],
  };

  describe('serialize', () => {
    test('should serialize to YAML by default', () => {
      const result = serialize(testData);
      expect(result).toContain('windowCount: 2');
      expect(result).toContain('tabCount: 5');
      expect(result).toContain('windowId: 1');
      expect(result).not.toContain('{');
      expect(result).not.toContain('}');
    });

    test('should serialize to JSON when specified', () => {
      const result = serialize(testData, { format: 'json' });
      expect(result).toContain('"windowCount"');
      expect(result).toContain('"tabCount"');
      expect(result).toContain('{');
      expect(result).toContain('}');
    });

    test('should pretty print JSON when specified', () => {
      const result = serialize(testData, { format: 'json', pretty: true });
      expect(result).toContain('\n');
      expect(result).toContain('  ');
    });

    test('YAML should be more compact than JSON', () => {
      const yamlResult = serialize(testData, { format: 'yaml' });
      const jsonResult = serialize(testData, { format: 'json' });

      // YAML should be shorter (more token-efficient)
      expect(yamlResult.length).toBeLessThan(jsonResult.length);

      // Rough token efficiency check: YAML should save at least 10%
      const savings = (jsonResult.length - yamlResult.length) / jsonResult.length;
      expect(savings).toBeGreaterThan(0.1);
    });

    test('should handle complex nested data', () => {
      const complexData = {
        success: true,
        message: 'Operation completed',
        data: {
          items: [1, 2, 3],
          metadata: { count: 3, total: 10 },
        },
      };

      const yamlResult = serialize(complexData, { format: 'yaml' });
      const jsonResult = serialize(complexData, { format: 'json' });

      expect(yamlResult).toBeTruthy();
      expect(jsonResult).toBeTruthy();
      expect(yamlResult.length).toBeLessThan(jsonResult.length);
    });
  });

  describe('deserialize', () => {
    test('should deserialize YAML', () => {
      const yamlString = serialize(testData, { format: 'yaml' });
      const result = deserialize(yamlString, 'yaml');
      expect(result).toEqual(testData);
    });

    test('should deserialize JSON', () => {
      const jsonString = serialize(testData, { format: 'json' });
      const result = deserialize(jsonString, 'json');
      expect(result).toEqual(testData);
    });
  });

  describe('roundtrip', () => {
    test('should serialize and deserialize YAML correctly', () => {
      const yamlString = serialize(testData, { format: 'yaml' });
      const deserialized = deserialize(yamlString, 'yaml');
      expect(deserialized).toEqual(testData);
    });

    test('should serialize and deserialize JSON correctly', () => {
      const jsonString = serialize(testData, { format: 'json' });
      const deserialized = deserialize(jsonString, 'json');
      expect(deserialized).toEqual(testData);
    });
  });
});
