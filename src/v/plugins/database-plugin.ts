/**
 * Database Validation Plugin
 *
 * Adds database validation methods to Seal validators:
 * - unique() - Check uniqueness in database
 * - exists() - Verify record exists
 * - And variants (exceptCurrentUser, exceptCurrentId)
 */

import type { Model } from "@warlock.js/cascade";
import type { SealPlugin } from "@warlock.js/seal";
import {
  NumberValidator,
  ScalarValidator,
  StringValidator,
} from "@warlock.js/seal";
import type {
  ExistsExceptCurrentIdRuleOptions,
  ExistsExceptCurrentUserRuleOptions,
  ExistsRuleOptions,
  UniqueExceptCurrentIdRuleOptions,
  UniqueExceptCurrentUserRuleOptions,
  UniqueRuleOptions,
} from "../database";
import {
  existsExceptCurrentIdRule,
  existsExceptCurrentUserRule,
  existsRule,
  uniqueExceptCurrentIdRule,
  uniqueExceptCurrentUserRule,
  uniqueRule,
} from "../database";

/**
 * Database validation plugin for Seal
 */
export const databasePlugin: SealPlugin = {
  name: "database",
  version: "1.0.0",
  description:
    "Adds database validation methods (unique, exists) to validators",

  install() {
    // Inject database methods into ScalarValidator
    Object.assign(ScalarValidator.prototype, {
      /** Value must be unique in database */
      unique(
        this: ScalarValidator,
        model: typeof Model | string,
        optionsList?: Partial<UniqueRuleOptions> & {
          errorMessage?: string;
        },
      ) {
        const { errorMessage, ...options } = optionsList || {};
        const rule = this.addRule(uniqueRule, errorMessage);
        rule.context.options = {
          ...options,
          Model: model,
        };
        return this;
      },

      /** Value must be unique in database except current user */
      uniqueExceptCurrentUser(
        this: ScalarValidator,
        model: typeof Model | string,
        optionsList?: Partial<UniqueExceptCurrentUserRuleOptions> & {
          errorMessage?: string;
        },
      ) {
        const { errorMessage, ...options } = optionsList || {};
        const rule = this.addRule(uniqueExceptCurrentUserRule, errorMessage);
        rule.context.options = {
          ...options,
          Model: model,
        };
        return this;
      },

      /** Value must be unique in database except current id */
      uniqueExceptCurrentId(
        this: ScalarValidator,
        model: typeof Model | string,
        optionsList?: Partial<UniqueExceptCurrentIdRuleOptions> & {
          errorMessage?: string;
        },
      ) {
        const { errorMessage, ...options } = optionsList || {};
        const rule = this.addRule(uniqueExceptCurrentIdRule, errorMessage);
        rule.context.options = {
          ...options,
          Model: model,
        };
        return this;
      },

      /** Value must exist in database */
      exists(
        this: ScalarValidator,
        model: typeof Model | string,
        optionsList?: Partial<ExistsRuleOptions> & {
          errorMessage?: string;
        },
      ) {
        const { errorMessage, ...options } = optionsList || {};
        const rule = this.addRule(existsRule, errorMessage);
        rule.context.options = {
          ...options,
          Model: model,
        };
        return this;
      },

      /** Value must exist in database except current user */
      existsExceptCurrentUser(
        this: ScalarValidator,
        model: typeof Model | string,
        optionsList?: Partial<ExistsExceptCurrentUserRuleOptions> & {
          errorMessage?: string;
        },
      ) {
        const { errorMessage, ...options } = optionsList || {};
        const rule = this.addRule(existsExceptCurrentUserRule, errorMessage);
        rule.context.options = {
          ...options,
          Model: model,
        };
        return this;
      },

      /** Value must exists in database except current id */
      existsExceptCurrentId(
        this: ScalarValidator,
        model: typeof Model | string,
        optionsList?: Partial<ExistsExceptCurrentIdRuleOptions> & {
          errorMessage?: string;
        },
      ) {
        const { errorMessage, ...options } = optionsList || {};
        const rule = this.addRule(existsExceptCurrentIdRule, errorMessage);
        rule.context.options = {
          ...options,
          Model: model,
        };
        return this;
      },
    });

    // Inject database methods into StringValidator
    Object.assign(StringValidator.prototype, {
      unique: ScalarValidator.prototype.unique,
      uniqueExceptCurrentUser:
        ScalarValidator.prototype.uniqueExceptCurrentUser,
      uniqueExceptCurrentId: ScalarValidator.prototype.uniqueExceptCurrentId,
      exists: ScalarValidator.prototype.exists,
      existsExceptCurrentUser:
        ScalarValidator.prototype.existsExceptCurrentUser,
      existsExceptCurrentId: ScalarValidator.prototype.existsExceptCurrentId,
    });

    // Inject database methods into NumberValidator
    Object.assign(NumberValidator.prototype, {
      unique: ScalarValidator.prototype.unique,
      exists: ScalarValidator.prototype.exists,
    });
  },
};
