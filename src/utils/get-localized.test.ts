import { expect, test } from "vitest";
import type { LocalizedObject } from "./get-localized";
import { getLocalized } from "./get-localized";

test("get-localized-value", () => {
  const name: LocalizedObject[] = [
    {
      localeCode: "en",
      value: "Name",
    },
    {
      localeCode: "ar",
      value: "الاسم",
    },
  ];

  const localized = getLocalized(name, "en");

  expect(localized).toBe("Name");

  const arLocalized = getLocalized(name, "ar");

  expect(arLocalized).toBe("الاسم");
});
