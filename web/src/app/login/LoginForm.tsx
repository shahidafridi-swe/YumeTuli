"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { Button, Field, Input } from "@/components/ui";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useT, type MessageKey } from "@/i18n";
import { login, type LoginState } from "./actions";

export function LoginForm() {
  const t = useT();
  const next = useSearchParams().get("next") ?? "/";
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {});

  return (
    <div className="w-full max-w-sm space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-semibold tracking-tight">YumeTuli</h1>
        <p className="text-muted">{t("login.subtitle")}</p>
      </div>
      <form action={action} className="space-y-4">
        <input type="hidden" name="next" value={next} />
        <Field label={t("login.email")} htmlFor="email">
          <Input id="email" name="email" type="email" autoComplete="username" required defaultValue={state.email} autoFocus />
        </Field>
        <Field label={t("login.password")} htmlFor="password">
          <Input id="password" name="password" type="password" autoComplete="current-password" required />
        </Field>
        {state.error ? (
          <p role="alert" className="text-sm font-medium">
            ✕ {t(`login.errors.${state.error}` as MessageKey)}
          </p>
        ) : null}
        <Button type="submit" variant="primary" loading={pending} className="w-full">
          {t("login.submit")}
        </Button>
      </form>
      <div className="flex justify-center">
        <ThemeToggle persist={false} />
      </div>
    </div>
  );
}
