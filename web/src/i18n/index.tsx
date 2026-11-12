"use client";

import { createContext, useCallback, useContext, type ReactNode } from "react";
import en from "./messages/en.json";

/**
 * Tiny i18n layer. All UI text lives in messages/<locale>.json.
 * To add a language: create messages/bn.json with the same keys, add it to CATALOGS and LOCALES,
 * and allow it in api/config/yumetuli.php `locales`.
 */
export const LOCALES = [{ code: "en", label: "English" }] as const;
const CATALOGS: Record<string, Messages> = { en };

type Messages = typeof en;
type Leaves<T, P extends string = ""> = {
  [K in keyof T & string]: T[K] extends string ? `${P}${K}` : Leaves<T[K], `${P}${K}.`>;
}[keyof T & string];
export type MessageKey = Leaves<Messages>;
export type Translate = (key: MessageKey, vars?: Record<string, string | number>) => string;

const I18nContext = createContext<{ locale: string; t: Translate }>({ locale: "en", t: (k) => k });

function lookup(messages: Messages, key: string): string | undefined {
  return key.split(".").reduce<unknown>((node, part) => (node as Record<string, unknown> | undefined)?.[part], messages) as
    | string
    | undefined;
}

export function I18nProvider({ locale, children }: { locale: string; children: ReactNode }) {
  const messages = CATALOGS[locale] ?? en;
  const t = useCallback<Translate>(
    (key, vars) => {
      const text = lookup(messages, key) ?? lookup(en, key) ?? key;
      return vars ? text.replace(/\{(\w+)\}/g, (_, name) => String(vars[name] ?? `{${name}}`)) : text;
    },
    [messages],
  );
  return <I18nContext.Provider value={{ locale, t }}>{children}</I18nContext.Provider>;
}

export const useI18n = () => useContext(I18nContext);
export const useT = () => useContext(I18nContext).t;
