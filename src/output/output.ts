/* eslint-disable no-case-declarations */
import config from "@mongez/config";
import {
  get,
  only,
  set,
  unset,
  type GenericObject,
} from "@mongez/reinforcements";
import { isEmpty, isObject, isPlainObject } from "@mongez/supportive-is";
import { Model } from "@warlock.js/cascade";
import dayjs from "dayjs";
import { getAWSConfig } from "../aws/get-aws-configurations";
import { currentRequest, type Request } from "../http";
import { useRequestStore } from "../http/middleware/inject-request-context";
import { dateOutput, type DateOutputOptions } from "../utils/date-output";
import { assetsUrl, uploadsUrl, url } from "../utils/urls";
import type {
  FinalOutput,
  OutputCastType,
  OutputFormatter,
  OutputResource,
  OutputValue,
} from "./types";

export type OutputConfigurations = {
  dateOptions?(options: {
    output: Output;
    value: any;
    options: DateOutputOptions;
  }): DateOutputOptions;
};

export class Output {
  /**
   * Final data output
   */
  protected data: GenericObject = {};

  /**
   * Disabled keys from being returned in the final output
   */
  protected static disabledKeys: string[] = [];

  /**
   * The only allowed keys
   */
  protected static allowedKeys: string[] = [];

  /**
   * Output shape
   */
  protected output: FinalOutput = {};

  /**
   * Defaults when key is missing from the given data
   */
  protected defaults = {};

  /**
   * Default date format
   */
  protected dateFormat = "DD-MM-YYYY hh:mm:ss A";

  /**
   * Date format options
   */
  protected dateOptions: DateOutputOptions = {
    format: this.dateFormat,
  };

  /**
   * Original resource data
   */
  public originalResource!: OutputResource;

  /**
   * Request object
   * Injected when output is sent to response
   * If you're going to use toJSON before sending it to response
   * Make sure to attach the request object to the output
   */
  public request!: Request;

  // public resource: GenericObject = {};

  /**
   * Constructor
   */
  public constructor(public resource: OutputResource = {}) {
    if (resource instanceof Model) {
      this.resource = (this.resource as any).data;
    } else if (resource instanceof Output) {
      this.resource = resource.resource;
    } else {
      this.resource = resource;
    }

    this.originalResource = resource;
  }

  /**
   * return list of resources for the given array ouf data
   */
  public static collect(data: OutputResource[]) {
    return data.map(item => {
      return new this(item);
    });
  }

  /**
   * Set value to the final output
   */
  public set(key: string, value: any) {
    set(this.data, key, value);

    return this;
  }

  /**
   * Get value from output resource
   */
  public get(key: string, defaultValue?: any) {
    return get(this.resource, key, defaultValue);
  }

  /**
   * Update value in output resource
   */
  public update(key: string, value: any) {
    set(this.resource, key, value);

    return this;
  }

  /**
   * Remove a key from the final output
   */
  public remove(...keys: string[]) {
    unset(this.data, keys);
  }

  /**
   * Disable the given keys
   */
  public static disable(...keys: string[]) {
    // make sure that they are not in the allowed keys
    for (const key of keys) {
      const keyIndex = this.allowedKeys.indexOf(key);

      if (keyIndex > -1) {
        this.allowedKeys.splice(keyIndex, 1);
      }
    }
    this.disabledKeys.push(...keys);

    return this;
  }

  /**
   * Remove the given keys from the disabled keys
   */
  public static enable(...keys: string[]) {
    for (const key of keys) {
      const keyIndex = this.disabledKeys.indexOf(key);

      if (keyIndex > -1) {
        this.disabledKeys.splice(keyIndex, 1);
      }
    }

    return this;
  }

  /**
   * Allow only the given keys
   */
  public static allow(...keys: string[]) {
    // make sure that they are not in the disabled keys
    for (const key of keys) {
      const keyIndex = this.disabledKeys.indexOf(key);

      if (keyIndex > -1) {
        this.disabledKeys.splice(keyIndex, 1);
      }
    }

    this.allowedKeys.push(...keys);

    return this;
  }

  /**
   * Reset allowed and disabled keys
   */
  public static resetKeys() {
    this.allowedKeys = [];
    this.disabledKeys = [];

    return this;
  }

  /**
   * Remove the given keys from the allowed keys
   */
  public static disallow(...keys: string[]) {
    for (const key of keys) {
      const keyIndex = this.allowedKeys.indexOf(key);

      if (keyIndex > -1) {
        this.allowedKeys.splice(keyIndex, 1);
      }
    }

    return this;
  }

  /**
   * Get final output data
   */
  public response() {
    return this.toJSON();
  }

  /**
   * Boot method
   * Called before transforming the resource
   */
  protected async boot() {
    //
  }

  /**
   * Extend the resource output
   * Called after transforming the resource
   */
  protected async extend() {
    //
  }

  /**
   * Manage the output as localized value and parse the value by using the given output
   */
  protected localized(output: typeof Output) {
    return {
      format: async value => {
        if (Array.isArray(value)) {
          const request = currentRequest();

          if (!request) return value;

          const localeCode = request?.localized;

          if (!localeCode) {
            return await Promise.all(
              value.map(async item => {
                if (item?.value) {
                  item.value = await new output(item.value).toJSON();
                }

                return item;
              }),
            );
          }

          const singleOutput = value.find(
            item => item?.localeCode === localeCode,
          )?.value;

          if (!singleOutput) return value;

          return await new output(singleOutput).toJSON();
        }

        return await new output(value).toJSON();
      },
    } as OutputFormatter;
  }

  /**
   * Transform resource to object, that's going to be used as the final output
   */
  public async toJSON() {
    await this.boot();

    await this.transformOutput();

    await this.extend();

    return this.data;
  }

  /**
   * Transform final output
   */
  protected async transformOutput() {
    for (const key in this.output) {
      // first check if key is disabled
      if (this.isDisabledKey(key) || !this.isAllowedKey(key)) {
        continue;
      }

      // get value type
      let valueType = this.output[key];

      let resourceInput = key;

      if (Array.isArray(valueType)) {
        resourceInput = valueType[0];
        valueType = valueType[1];
      }

      // now get the value from the given resource data
      const value = get(
        this.resource,
        resourceInput,
        get(this.defaults, key, undefined),
      );

      if (
        (value === undefined || value === null) &&
        typeof valueType !== "object"
      ) {
        continue;
      }

      if (isObject(value) && !Array.isArray(value)) {
        if (!isPlainObject(value) && !isEmpty(value)) {
          continue;
        }
      } else if (isEmpty(value) && typeof valueType !== "object") continue;

      const customTransformer = async (
        value: any,
        valueType: OutputFormatter,
      ) => {
        if (valueType.type && valueType.format) {
          throw new Error(
            "You can't use both type and format in the same output formatter",
          );
        }

        if (valueType.input) {
          value = get(this.resource, valueType.input, value);
        }

        const outputOptions: OutputFormatter = {
          ...valueType,
          input: valueType.input || key,
        };

        if (outputOptions.format) {
          return await outputOptions.format(value, valueType, this);
        }

        return this.cast(
          value,
          outputOptions.type || "any",
          outputOptions.options,
        );
      };

      if (typeof valueType === "object") {
        const output = await customTransformer(
          value,
          valueType as OutputFormatter,
        );

        if (output !== undefined) {
          set(this.data, key, output);
        }
      } else if (Array.isArray(value) && valueType !== "localized") {
        set(
          this.data,
          key,
          await Promise.all(
            value.map(
              async item =>
                await this.transformValue(item, valueType as OutputCastType),
            ),
          ),
        );
      } else {
        set(this.data, key, await this.transformValue(value, valueType));
      }
    }
  }

  /**
   * Check if the given value is valid resource value
   */
  protected isValidResourceValue(value: any) {
    return (
      (isPlainObject(value) && !isEmpty(value)) ||
      value instanceof Output ||
      value instanceof Model
    );
  }

  /**
   * Check if the given key is disabled
   */
  protected isDisabledKey(key: string) {
    return (this.constructor as typeof Output).disabledKeys.includes(key);
  }

  /**
   * Check if the given key is allowed
   */
  protected isAllowedKey(key: string) {
    const allowedKeys = (this.constructor as typeof Output).allowedKeys;
    return allowedKeys.length === 0 || allowedKeys.includes(key);
  }

  /**
   * Transform value
   */
  protected async transformValue(
    value: any,
    valueType: OutputValue | [string, OutputValue],
  ) {
    if (typeof valueType === "string") {
      value = this.cast(value, valueType);
    } else if ((valueType as any).prototype instanceof Output) {
      // if value is not a valid resource value then return null

      if (!this.isValidResourceValue(value)) return null;

      value = await new (valueType as any)(value).toJSON();
    } else if (typeof valueType === "function") {
      value = await (valueType as any).call(this, value);
    }

    return value;
  }

  /**
   * Transform the value of the given key
   */
  public transform(key: string, type: OutputValue) {
    const value = this.get(key);

    if (!value) return;

    return this.transformValue(value, type);
  }

  /**
   * Transform and store the transformed value in the final output of the given key
   */
  public async opt(key: string, type: OutputValue, setAs = key) {
    const value = this.get(key);
    if (Array.isArray(value) && type !== "localized") {
      return this.set(
        setAs,
        await Promise.all(
          value.map(
            async item =>
              await this.transformValue(item, type as OutputCastType),
          ),
        ),
      );
    }

    const transformedValue = await this.transformValue(value, type);

    if (transformedValue === undefined) return;

    return this.set(setAs, transformedValue);
  }

  /**
   * Get resource id
   */
  public get id() {
    return this.get("id");
  }

  /**
   * Builtin casts
   */
  protected cast(value: any, type: OutputValue, options?: any) {
    switch (type) {
      case "number":
        return Number(value);
      case "float":
      case "double":
        return parseFloat(value);
      case "int":
      case "integer":
        return parseInt(value);
      case "string":
        return String(value);
      case "boolean":
        return Boolean(value);
      case "date":
        return this.parseDate(value, options);
      case "dateFormat":
        return dayjs(value).format(this.dateFormat);
      case "dateIso":
        return dayjs(value).toISOString();
      case "birthDate": {
        const dateData: any = this.parseDate(value);
        dateData.age = dayjs().diff(value, "years");

        return dateData;
      }
      case "url":
        return url(value);
      case "uploadsUrl":
        return uploadsUrl(value);
      case "assetsUrl":
        return assetsUrl(value);
      case "localized":
        // check if the request has
        // eslint-disable-next-line no-case-declarations
        const { request } = useRequestStore();

        // eslint-disable-next-line no-case-declarations
        const localeCode = request?.localized;

        if (!localeCode) return value;

        if (!Array.isArray(value)) return value;

        const localizedValue = value.find(
          item => item.localeCode === localeCode,
        )?.value;

        if (localizedValue || localizedValue === "") return localizedValue;

        return value;
      case "location":
        if (!value) return null;

        return {
          lat: value.coordinates?.[0],
          lng: value.coordinates?.[1],
          address: value.address,
        };
      case "any":
      case "mixed":
      default:
        return value;
    }
  }

  /**
   * Parse the given value
   */
  protected parseDate(
    value: any,
    options: DateOutputOptions = this.dateOptions,
  ) {
    options.locale ??= useRequestStore()?.request?.locale;

    const dateOptions = config.get(
      "output.dateOptions",
    ) as OutputConfigurations["dateOptions"];

    if (dateOptions) {
      options = dateOptions({
        output: this,
        value,
        options,
      });
    }

    const date = dateOutput(value, {
      ...options,
    });

    return date;
  }

  /**
   * Return an array of the given object for response output
   */
  public arrayOf(options: FinalOutput): typeof Output {
    return class AnonymousOutput extends Output {
      protected output: FinalOutput = options;
    };
  }

  /**
   * Cast all keys in object
   */
  public castArrayObjectWithRandomKeys(
    object: GenericObject,
    options: FinalOutput,
  ) {
    for (const key in object) {
      object[key] = this.arrayOf(options);
    }
  }

  /**
   * Return only the values of the given keys
   */
  public outputOnly(...keys: string[]) {
    return {
      format: value => {
        if (!value) return undefined;
        return only(value, keys);
      },
    } as OutputFormatter;
  }

  /**
   * Return output that contains only an id if exists
   */
  public onlyId() {
    return {
      format: value => {
        if (!value?.id) return undefined;

        return {
          id: value.id,
        };
      },
    } as OutputFormatter;
  }
}

type OutputHelpers = {
  transform: (value: any, rule: OutputValue, options?: any) => Promise<any>;
  opt: (key: string, type: OutputValue, setAs?: string) => any;
};

export type OutputOptions = {
  transform?: Record<string, any>;
  before?: (
    resource: any,
    output: Record<string, any>,
    helpers: OutputHelpers,
  ) => Promise<void>;
  after?: (
    resource: any,
    output: Record<string, any>,
    helpers: OutputHelpers,
  ) => Promise<void>;
  settings?: {
    dateFormat?: string;
    [key: string]: any;
  };
};

export function output(options: OutputOptions) {
  return {
    async toJSON(resource: any) {
      if (resource instanceof Model) {
        resource = resource.data;
      }

      const output = {};

      const helpers: OutputHelpers = {
        transform: async (value, rule, options) => {
          return await directTransform({ value, rule, options });
        },
        opt: (key, type, setAs) => {
          const finalValue = directTransform({
            rule: type,
            value: get(resource, key),
            options,
          });

          set(output, setAs ?? key, finalValue);
        },
      };

      if (options.before) {
        await options.before(resource, output, helpers);
      }

      if (options.transform) {
        await transform(resource, options, output);
      }

      if (options.after) {
        await options.after(resource, output, helpers);
      }

      return output;
    },
  };
}

// Helper function to perform transformation
async function transform(
  resource: any,
  options: OutputOptions,
  results: Record<string, any>,
) {
  for (const key in options.transform) {
    const rule = options.transform[key];
    if (typeof rule === "function") {
      set(results, key, await rule(resource, results, options));
    } else if (rule.toJSON) {
      const value = get(resource, key);
      if (Array.isArray(value)) {
        set(
          results,
          key,
          await Promise.all(value.map(async item => await rule.toJSON(item))),
        );
      } else {
        set(results, key, await rule.toJSON(value));
      }
    } else if (isPlainObject(rule)) {
      // If it is a plain object, then it means it is a nested results
      const value = get(resource, key);

      if (!value) continue;

      // if value is array, then it will be treated as a collection of objects
      if (Array.isArray(value)) {
        set(
          results,
          key,
          await Promise.all(
            value.map(async item => await output(rule).toJSON(item)),
          ),
        );
      } else {
        set(results, key, await output(rule).toJSON(value));
      }
    } else {
      const value = get(resource, key);
      if (Array.isArray(rule)) {
        const [key, value] = rule;
        set(
          results,
          key,
          await directTransform({ rule: value, value, options }),
        );
      } else {
        set(
          results,
          key,
          await directTransform({
            rule,
            value,
            options,
          }),
        );
      }
    }
  }
}

function parseDate(value: any, options?: OutputOptions) {
  return dateOutput(value, {
    ...options?.settings,
    locale: currentRequest()?.locale,
  });
}

function directTransform({
  rule,
  value,
  options,
}: {
  rule: OutputValue;
  value: any;
  options: OutputOptions;
}) {
  switch (rule) {
    case "number":
      return Number(value);
    case "float":
    case "double":
      return parseFloat(value);
    case "int":
    case "integer":
      return parseInt(value);
    case "string":
      return String(value);
    case "boolean":
      return Boolean(value);
    case "date":
      return parseDate(value);
    case "dateFormat":
      return dayjs(value).format(
        options.settings?.dateFormat ?? "DD-MM-YYYY hh:mm:ss A",
      );
    case "dateIso":
      return dayjs(value).toISOString();
    case "birthDate": {
      const dateData: any = parseDate(value);
      dateData.age = dayjs().diff(value, "years");

      return dateData;
    }
    case "url":
      return url(value);
    case "uploadsUrl":
      return uploadsUrl(value);
    case "assetsUrl":
      return assetsUrl(value);
    case "localized":
      // check if the request has
      // eslint-disable-next-line no-case-declarations
      const localeCode = currentRequest()?.localized;

      if (!localeCode) return value;

      if (!Array.isArray(value)) return value;

      const localizedValue = value.find(
        item => item.localeCode === localeCode,
      )?.value;

      if (localizedValue || localizedValue === "") return localizedValue;

      return value;
    case "location":
      if (!value) return null;

      return {
        lat: value.coordinates?.[0],
        lng: value.coordinates?.[1],
        address: value.address,
      };
    case "any":
    case "mixed":
    default:
      return value;
  }
}

const _uploadOutput = output({
  transform: {
    name: "string",
    hash: "string",
    mimeType: "string",
    extension: "string",
    size: "number",
    url: ["path", "uploadsUrl"],
    id: ["hash", "string"],
    width: "number",
    height: "number",
    path: "string",
  },
  after: async (resource: any, output: Record<string, any>) => {
    if (resource?.provider?.url) {
      const cloudfront = await getAWSConfig("cloudfront");
      if (cloudfront) {
        set(output, "url", cloudfront + "/" + resource?.provider?.fileName);
      } else {
        set(output, "url", resource?.provider?.url);
      }
    }
  },
});

const _postOutput = output({
  transform: {
    id: "number",
    title: "string",
    content: "string",
    images: _uploadOutput,
    user: {
      image: _uploadOutput,
      name: "string",
    },
    fullName: (resource: any, output: Record<string, any>) => {
      return `${resource.firstName} ${resource.lastName}`;
    },
  },
  before: async (
    resource: any,
    output: Record<string, any>,
    helpers: OutputHelpers,
  ) => {
    output.title = "Hello World";

    helpers.opt("title", "string");
  },
  after: async (
    resource: any,
    output: Record<string, any>,
    helpers: OutputHelpers,
  ) => {
    output.title = "Hello World";
  },
});
