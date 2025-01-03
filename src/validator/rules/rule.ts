import { capitalize, merge } from "@mongez/reinforcements";
import type { Request } from "../../http";

export abstract class Rule {
  /**
   * Rule name
   */
  public static ruleName = "";

  /**
   * Rule Description
   */
  public description = "";

  /**
   * Determine if the rule requires a value to be present
   */
  public requiresValue = true;

  /**
   * Determine if rule is valid
   */
  protected isValid = true;

  /**
   * Input name
   */
  protected input = "";

  /**
   * Input value
   */
  public value: any = "";

  /**
   * Current request
   */
  protected request!: Request;

  /**
   * Rule options
   * This can be passed using the following syntax:
   * rule:option1,option2,option3
   */
  protected options: any[] = [];

  /**
   * Error message
   */
  protected errorMessage = "";

  /**
   * Set rule options
   */
  public setOptions(options: any[]) {
    this.options = options;

    return this;
  }

  /**
   * Set request
   */
  public setRequest(request: Request) {
    this.request = request;

    return this;
  }

  /**
   * Validate the rule
   */
  public abstract validate(): Promise<void>;

  /**
   * Set input name
   */
  public setInput(input: string) {
    this.input = input;

    return this;
  }

  /**
   * Set input value
   */
  public setValue(value: any) {
    this.value = value;

    return this;
  }

  /**
   * Determine if rule validation passes
   */
  public passes() {
    return this.isValid === true;
  }

  /**
   * Determine if rule validation fails
   */
  public fails() {
    return this.isValid === false;
  }

  /**
   * Error message
   * This will override the default error message
   */
  public setErrorMessage(message: string) {
    this.errorMessage = message;

    return this;
  }

  /**
   * Translate the given key and its attributes
   */
  public trans(key: string, attributes: any = {}) {
    const inputName = this.request.trans("inputs." + this.input);

    attributes = merge(
      {
        input: inputName === `inputs.${this.input}` ? this.input : inputName,
        value:
          this.value?.file?.constructor?.name === "FileStream"
            ? this.value.filename
            : this.value,
      },
      attributes,
    );

    return (
      this.errorMessage || this.request.trans(`validation.${key}`, attributes)
    );
  }

  public error() {
    return `${this.input} is not valid`;
  }

  /**
   * Render the rule to json
   */
  public toJson() {
    if (this.description) return this.description;

    return capitalize(this.getName());
  }

  /**
   * Get the rule expected type for the given input
   * It should be overridden by the child class
   */
  public expectedType() {
    return "";
  }

  /**
   * Get rule name
   */
  public getName() {
    // we need to get it from the child class as it is a static property
    return (this.constructor as any).ruleName as string;
  }
}
