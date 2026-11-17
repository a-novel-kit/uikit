// uikit's translator for its built-in text. Most of this module is private, but `useMessages`, `Messages` and
// `MessageKey` are public: the package root exports them so an app reads uikit's copy, such as its access states' titles.
import en from "../i18n/locales/en/uikit.json";
import fr from "../i18n/locales/fr/uikit.json";

import { createStaticI18n } from "@a-novel-kit/nodelib-i18n";
import { getI18nContext, hasI18nContext } from "@a-novel-kit/nodelib-i18n/svelte";

import type { i18n } from "i18next";

/** The namespace holding uikit's messages in an app's i18next instance. */
const namespace = "uikit";

/** A message key of uikit's catalogs, such as `pagination.next`. A plural message is one key, such as
 * `tagInput.count`, whose catalog holds its `_zero`, `_one` and `_other` forms. */
export type MessageKey = Leaves<typeof en>;

type Leaves<T, Prefix extends string = ""> = {
  [Key in keyof T & string]: T[Key] extends string ? `${Prefix}${Singular<Key>}` : Leaves<T[Key], `${Prefix}${Key}.`>;
}[keyof T & string];

type Singular<Key extends string> = Key extends `${infer Base}_${"zero" | "one" | "other"}` ? Base : Key;

/** Translates uikit's built-in text, and names the language that dates should follow. */
export interface Messages {
  /** Returns the message for `key`, filling `{{name}}` placeholders from `values`; a numeric `count` picks the
   * plural form. */
  t: (key: MessageKey, values?: Record<string, string | number>) => string;
  /** The language of the messages. */
  language: string;
}

// Outside any provider, uikit speaks English. This instance never changes language.
const english = createStaticI18n({
  locale: "en",
  defaultLocale: "en",
  defaultNamespace: namespace,
  namespaces: [namespace],
  resources: { en: { [namespace]: en } },
});

// App instances already holding uikit's messages.
const blended = new WeakSet<i18n>();

function blend(instance: i18n): i18n {
  if (!blended.has(instance)) {
    // Merges deeply without overwriting, so an app's own uikit messages win.
    for (const [language, messages] of Object.entries({ en, fr })) {
      instance.addResourceBundle(language, namespace, messages, true, false);
    }
    blended.add(instance);
  }

  return instance;
}

/**
 * Returns the translator for uikit's built-in text. Inside an app's i18n provider, uikit's messages
 * join the app's instance and follow its language; outside one, they are English. Call it during
 * component initialization.
 */
export function useMessages(): Messages {
  const instance = hasI18nContext() ? blend(getI18nContext()) : english;

  return {
    // Svelte escapes what it renders, so i18next must not escape the values first.
    t: (key, values) => instance.t(key, { ns: namespace, interpolation: { escapeValue: false }, ...values }),
    language: instance.language,
  };
}
