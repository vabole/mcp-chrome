import yaml from 'js-yaml';

export type SerializationFormat = 'json' | 'yaml';

export interface SerializerOptions {
  format?: SerializationFormat;
  pretty?: boolean;
}

/**
 * Serialize data to the specified format.
 * YAML is the default format as it provides better token efficiency for LLMs.
 *
 * Token efficiency comparison:
 * - JSON: Uses quotes for all keys and string values, brackets, and commas
 * - YAML: More concise, no quotes needed for most strings, uses indentation
 * - YAML typically saves 15-25% tokens compared to JSON
 *
 * @param data - The data to serialize
 * @param options - Serialization options
 * @returns The serialized string
 */
export function serialize(data: any, options: SerializerOptions = {}): string {
  const { format = 'yaml', pretty = false } = options;

  try {
    if (format === 'json') {
      return pretty ? JSON.stringify(data, null, 2) : JSON.stringify(data);
    } else if (format === 'yaml') {
      return yaml.dump(data, {
        indent: 2,
        lineWidth: -1, // Don't wrap lines
        noRefs: true, // Don't use references
        sortKeys: false, // Keep original key order
      });
    } else {
      throw new Error(`Unsupported format: ${format}`);
    }
  } catch (error) {
    // Fallback to JSON if YAML serialization fails
    console.error(`Serialization error with format ${format}:`, error);
    return JSON.stringify(data, null, pretty ? 2 : 0);
  }
}

/**
 * Deserialize data from the specified format.
 *
 * @param data - The serialized string
 * @param format - The format to deserialize from
 * @returns The deserialized data
 */
export function deserialize(data: string, format: SerializationFormat = 'yaml'): any {
  try {
    if (format === 'json') {
      return JSON.parse(data);
    } else if (format === 'yaml') {
      return yaml.load(data);
    } else {
      throw new Error(`Unsupported format: ${format}`);
    }
  } catch (error) {
    console.error(`Deserialization error with format ${format}:`, error);
    throw error;
  }
}
