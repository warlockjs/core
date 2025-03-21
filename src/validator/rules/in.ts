import { Rule } from "./rule";

export class InRule extends Rule {
  /**
   * Rule name
   */
  public static ruleName = "in";

  /**
   * Validate the rule
   */
  public async validate() {
    this.isValid = this.options.includes(this.value);
  }

  /**
   * Get error message
   */
  public error() {
    return this.trans("in", {
      options: this.options.join("|"),
    });
  }

  /**
   * {@inheritDoc}
   */
  public toJson() {
    return `One Of: ${this.options.join(", ")}`;
  }

  /**
   * {@inheritDoc}
   */
  public expectedType() {
    return "string";
  }
}
