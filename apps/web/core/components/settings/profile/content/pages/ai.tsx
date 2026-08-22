/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { useEffect, useMemo, useState } from "react";
import { observer } from "mobx-react";
import useSWR from "swr";
import { Check, Eye, EyeOff, ExternalLink, Trash2 } from "@keel/propel/icons";
// keel imports
import { useTranslation } from "@keel/i18n";
import { Button } from "@keel/propel/button";
import { TOAST_TYPE, setToast } from "@keel/propel/toast";
import { AI_PROVIDERS, isSupabaseConfigured, supabaseAIService, type UserApiKeyStatus } from "@keel/services";
import { CustomSelect, Input } from "@keel/ui";
import { cn } from "@keel/utils";
// components
import { ProfileSettingsHeading } from "@/components/settings/profile/heading";

const USER_AI_KEYS = "USER_AI_KEYS";

type ProviderMeta = { name: string; placeholder: string; docs: string; models: string[] };

/**
 * Provider display copy and the models each one offers.
 *
 * Not translated: these are product names and model identifiers, which stay in
 * Latin in every locale. The first model listed is the one preselected when a
 * provider is chosen, so each list leads with that provider's current default
 * general-purpose model rather than its cheapest or largest.
 */
const PROVIDERS: Record<string, ProviderMeta> = {
  anthropic: {
    name: "Anthropic",
    placeholder: "sk-ant-...",
    docs: "https://console.anthropic.com/settings/keys",
    models: ["claude-sonnet-5", "claude-opus-5", "claude-haiku-4-5-20251001", "claude-fable-5"],
  },
  openai: {
    name: "OpenAI",
    placeholder: "sk-...",
    docs: "https://platform.openai.com/api-keys",
    models: ["gpt-4.1", "gpt-4.1-mini", "o4-mini"],
  },
  google: {
    name: "Google AI",
    placeholder: "AIza...",
    docs: "https://aistudio.google.com/app/apikey",
    models: ["gemini-2.5-pro", "gemini-2.5-flash"],
  },
  xai: {
    name: "xAI",
    placeholder: "xai-...",
    docs: "https://console.x.ai",
    models: ["grok-4", "grok-3-mini"],
  },
  mistral: {
    name: "Mistral",
    placeholder: "...",
    docs: "https://console.mistral.ai/api-keys",
    models: ["mistral-large-latest", "mistral-small-latest"],
  },
  deepseek: {
    name: "DeepSeek",
    placeholder: "sk-...",
    docs: "https://platform.deepseek.com/api_keys",
    models: ["deepseek-chat", "deepseek-reasoner"],
  },
  groq: {
    name: "Groq",
    placeholder: "gsk_...",
    docs: "https://console.groq.com/keys",
    models: ["llama-3.3-70b-versatile", "llama-3.1-8b-instant"],
  },
};

const getMeta = (provider: string): ProviderMeta =>
  PROVIDERS[provider] ?? { name: provider, placeholder: "", docs: "", models: [] };

/** A provider that already has a key, shown as one compact row. */
const ConnectedRow = observer(function ConnectedRow({
  entry,
  isDefault,
  onRemoved,
}: {
  entry: UserApiKeyStatus;
  isDefault: boolean;
  onRemoved: () => Promise<unknown>;
}) {
  const { t } = useTranslation();
  const [isRemoving, setIsRemoving] = useState(false);
  const meta = getMeta(entry.provider);

  const handleRemove = async () => {
    setIsRemoving(true);
    try {
      await supabaseAIService.deleteUserApiKey(entry.provider);
      await onRemoved();
      setToast({
        type: TOAST_TYPE.SUCCESS,
        title: t("account_settings.ai.toast.removed.title"),
        message: t("account_settings.ai.toast.removed.message", { provider: meta.name }),
      });
    } catch (error) {
      setToast({
        type: TOAST_TYPE.ERROR,
        title: t("common.error.label"),
        message: error instanceof Error ? error.message : t("account_settings.ai.toast.error.message"),
      });
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-subtle bg-surface-1 px-3.5 py-2.5 shadow-raised-100 transition-smooth hover:border-strong">
      <div className="flex min-w-0 items-center gap-2.5">
        <span className="grid size-6 flex-shrink-0 place-items-center rounded-full bg-success-subtle text-success-primary">
          <Check className="size-3.5" strokeWidth={2.5} />
        </span>
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-body-sm-medium text-primary">
            {meta.name}
            {isDefault && (
              <span className="ml-2 rounded-full bg-accent-subtle px-1.5 py-0.5 text-11 font-medium text-accent-primary">
                {t("account_settings.ai.default_badge")}
              </span>
            )}
          </span>
          <span className="font-mono truncate text-caption-md-regular text-tertiary">
            {entry.key_hint}
            {entry.model && <span className="ml-2">· {entry.model}</span>}
          </span>
        </div>
      </div>
      <Button
        variant="link"
        size="sm"
        prependIcon={<Trash2 className="size-3.5" />}
        onClick={handleRemove}
        loading={isRemoving}
      >
        {t("account_settings.ai.remove")}
      </Button>
    </div>
  );
});

export const AIProfileSettings = observer(function AIProfileSettings() {
  const { t } = useTranslation();

  const { data: keys, mutate } = useSWR(
    isSupabaseConfigured ? USER_AI_KEYS : null,
    () => supabaseAIService.listUserApiKeys(),
    { revalidateOnFocus: false }
  );

  const [provider, setProvider] = useState<string>(AI_PROVIDERS[0]);
  const [model, setModel] = useState<string>(getMeta(AI_PROVIDERS[0]).models[0] ?? "");
  const [apiKey, setApiKey] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /*
   * Adopt the first connected provider and the model stored on its row. The
   * model used to live in localStorage, which made it per-browser; it is now a
   * column on `user_ai_keys` so it follows the user to any machine.
   */
  useEffect(() => {
    const first = (keys ?? [])[0];
    if (!first) return;
    setProvider(first.provider);
    setModel(first.model ?? getMeta(first.provider).models[0] ?? "");
  }, [keys]);

  const meta = getMeta(provider);
  const connected = useMemo(() => keys ?? [], [keys]);
  const storedForProvider = connected.find((entry) => entry.provider === provider);

  const handleProviderChange = (next: string) => {
    setProvider(next);
    // The previously chosen model belongs to the previous provider.
    setModel(getMeta(next).models[0] ?? "");
    setApiKey("");
  };

  const handleSave = async () => {
    if (!apiKey.trim()) return;
    setIsSubmitting(true);
    try {
      await supabaseAIService.saveUserApiKey(provider, apiKey.trim(), model || null);
      // Drop the raw key from component state the moment it is stored.
      setApiKey("");
      setIsVisible(false);
      await mutate();
      setToast({
        type: TOAST_TYPE.SUCCESS,
        title: t("account_settings.ai.toast.saved.title"),
        message: t("account_settings.ai.toast.saved.message", { provider: meta.name }),
      });
    } catch (error) {
      setToast({
        type: TOAST_TYPE.ERROR,
        title: t("common.error.label"),
        message: error instanceof Error ? error.message : t("account_settings.ai.toast.error.message"),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="size-full">
      <ProfileSettingsHeading
        title={t("account_settings.ai.title")}
        description={t("account_settings.ai.description")}
      />

      {isSupabaseConfigured ? (
        <div className="mt-7 flex max-w-2xl flex-col gap-8">
          {connected.length > 0 && (
            <section className="flex flex-col gap-2">
              <h3 className="text-caption-md-medium tracking-wide text-tertiary uppercase">
                {t("account_settings.ai.connected")}
              </h3>
              <div className="flex flex-col gap-2">
                {connected.map((entry) => (
                  <ConnectedRow
                    key={entry.provider}
                    entry={entry}
                    isDefault={entry.provider === provider}
                    onRemoved={mutate}
                  />
                ))}
              </div>
            </section>
          )}

          {/*
            One form, not seven. The page used to stack a labelled key field for
            every provider whether or not you used it, so the thing you actually
            came to do was buried in six copies of itself.
          */}
          <section className="flex flex-col gap-4 rounded-2xl border border-subtle bg-surface-1 p-5 shadow-raised-100">
            <h3 className="text-body-sm-medium text-primary">
              {storedForProvider ? t("account_settings.ai.replace_title") : t("account_settings.ai.add_title")}
            </h3>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-1.5">
                <span className="text-caption-md-medium text-secondary">{t("account_settings.ai.provider_label")}</span>
                <CustomSelect value={provider} label={meta.name} onChange={handleProviderChange} input>
                  {AI_PROVIDERS.map((key) => (
                    <CustomSelect.Option key={key} value={key}>
                      {getMeta(key).name}
                    </CustomSelect.Option>
                  ))}
                </CustomSelect>
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-caption-md-medium text-secondary">{t("account_settings.ai.model_label")}</span>
                <CustomSelect
                  value={model}
                  label={model || t("account_settings.ai.model_placeholder")}
                  onChange={(next: string) => {
                    setModel(next);
                    // Persist immediately when a key already exists, so changing
                    // model does not require re-entering the key to take effect.
                    if (storedForProvider) {
                      void supabaseAIService.setUserApiModel(provider, next).then(() => mutate());
                    }
                  }}
                  input
                >
                  {meta.models.map((option) => (
                    <CustomSelect.Option key={option} value={option}>
                      <span className="font-mono text-11">{option}</span>
                    </CustomSelect.Option>
                  ))}
                </CustomSelect>
              </label>
            </div>

            <label className="flex flex-col gap-1.5">
              <span className="text-caption-md-medium text-secondary">{t("account_settings.ai.key_label")}</span>
              <div className="flex items-start gap-2">
                <div className="relative flex-1">
                  <Input
                    type={isVisible ? "text" : "password"}
                    value={apiKey}
                    onChange={(event) => setApiKey(event.target.value)}
                    placeholder={storedForProvider ? t("account_settings.ai.replace_placeholder") : meta.placeholder}
                    className="w-full pr-10"
                    autoComplete="off"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    aria-label={isVisible ? t("account_settings.ai.hide_key") : t("account_settings.ai.show_key")}
                    className="absolute top-1/2 right-3 -translate-y-1/2 focus-ring rounded text-tertiary transition-smooth hover:text-primary"
                    onClick={() => setIsVisible((previous) => !previous)}
                  >
                    {isVisible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
                <Button
                  variant="primary"
                  size="xl"
                  onClick={handleSave}
                  loading={isSubmitting}
                  disabled={!apiKey.trim()}
                >
                  {storedForProvider ? t("account_settings.ai.update") : t("account_settings.ai.save")}
                </Button>
              </div>
            </label>

            {meta.docs && (
              <a
                href={meta.docs}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "inline-flex w-fit items-center gap-1 focus-ring rounded text-caption-md-regular",
                  "text-tertiary underline underline-offset-2 transition-smooth hover:text-primary"
                )}
              >
                {t("account_settings.ai.get_key", { provider: meta.name })}
                <ExternalLink className="size-3" />
              </a>
            )}
          </section>

          <p className="text-caption-md-regular text-tertiary">{t("account_settings.ai.privacy_note")}</p>
        </div>
      ) : (
        <p className="mt-7 text-body-sm-regular text-tertiary">{t("account_settings.ai.unavailable")}</p>
      )}
    </div>
  );
});
