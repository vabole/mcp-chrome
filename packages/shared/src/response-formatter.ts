import yaml from 'js-yaml';

/**
 * Response format options for tool responses
 */
export enum ResponseFormat {
  JSON = 'json',
  YAML = 'yaml',
}

/**
 * Configuration for response formatting
 */
export interface ResponseFormatterConfig {
  format: ResponseFormat;
  prettyJson?: boolean;
}

/**
 * Default configuration - using YAML for better token efficiency
 */
const defaultConfig: ResponseFormatterConfig = {
  format: ResponseFormat.YAML,
  prettyJson: false,
};

let currentConfig: ResponseFormatterConfig = { ...defaultConfig };

/**
 * Set the response format configuration
 */
export function setResponseFormat(config: Partial<ResponseFormatterConfig>): void {
  currentConfig = { ...currentConfig, ...config };
}

/**
 * Get the current response format configuration
 */
export function getResponseFormat(): ResponseFormatterConfig {
  return { ...currentConfig };
}

/**
 * Reset to default configuration
 */
export function resetResponseFormat(): void {
  currentConfig = { ...defaultConfig };
}

/**
 * Format a response object according to the configured format
 *
 * @param data - The data to format
 * @param overrideFormat - Optional format override for this specific call
 * @returns Formatted string representation of the data
 */
export function formatResponse(data: any, overrideFormat?: ResponseFormat): string {
  const format = overrideFormat ?? currentConfig.format;

  if (format === ResponseFormat.YAML) {
    return formatAsYaml(data);
  } else {
    return formatAsJson(data);
  }
}

/**
 * Format data as YAML
 */
function formatAsYaml(data: any): string {
  try {
    return yaml.dump(data, {
      indent: 2,
      lineWidth: -1, // Don't wrap lines
      noRefs: true, // Don't use anchors/references
      sortKeys: false, // Preserve key order
    });
  } catch (error) {
    console.error('Failed to format as YAML, falling back to JSON:', error);
    return formatAsJson(data);
  }
}

/**
 * Format data as JSON
 */
function formatAsJson(data: any): string {
  if (currentConfig.prettyJson) {
    return JSON.stringify(data, null, 2);
  }
  return JSON.stringify(data);
}

/**
 * Backwards compatibility: Drop-in replacement for JSON.stringify
 * Uses the configured format instead of always using JSON
 */
export function stringify(data: any): string {
  return formatResponse(data);
}
