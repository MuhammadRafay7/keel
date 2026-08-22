/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { useState } from "react";
import { observer } from "mobx-react";
import useSWR from "swr";
import { Eye, EyeOff, Trash2 } from "lucide-react";
// keel imports
import { useTranslation } from "@keel/i18n";
import { Button } from "@keel/propel/button";
import { TOAST_TYPE, setToast } from "@keel/propel/toast";
import { AI_PROVIDERS, isSupabaseConfigured, supabaseAIService, type UserApiKeyStatus } from "@keel/services";
import { Input } from "@keel/ui";
// components
import { ProfileSettingsHeading } from "@/components/settings/profile/heading";

const USER_AI_KEYS = "USER_AI_KEYS";

/** Copy that is not worth a translation key per provider. */
const PROVIDER_LABELS: Record<string, { name: string; placeholder: string; docs: string }> = {
  anthropic: {
    name: "Anthropic",
    placeholder: "sk-ant-...",
    docs: "https://console.anthropic.com/settings/keys",
  },
  openai: {
    name: "OpenAI",
    placeholder: "sk-...",
    docs: "https://platform.openai.com/api-keys",
  },
  google: {
    name: "Google AI",
    placeholder: "AIza...",
    docs: "https://aistudio.google.com/app/apikey",
  },
  xai: {
    name: "xAI",
    placeholder: "xai-...",
    docs: "https://console.x.ai",
  },
  mistral: {
    name: "Mistral",
    placeholder: "...",
    docs: "https://console.mistral.ai/api-keys",
  },
  deepseek: {
    name: "DeepSeek",
    placeholder: "sk-...",
    docs: "https://platform.deepseek.com/api_keys",
  },
  groq: {
    name: "Groq",
    placeholder: "gsk_...",
    docs: "https://console.groq.com/keys",
  },
};

type ProviderRowProps = {
  provider: string;
  stored: UserApiKeyStatus | undefined;
  onChanged: () => Promise<unknown>;
};

const ProviderRow = observer(function ProviderRow({ provider, stored, onChanged }: ProviderRowProps) {
  const [value, setValue] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const { t } = useTranslation();

  const meta = PROVIDER_LABELS[provider] ?? { name: provider, placeholder: "", docs: "" };

  const handleSave = async () => {
    if (!value.trim()) return;
    setIsSubmitting(true);
    try {
      await supabaseAIService.saveUserApiKey(provider, value.trim());
      // Drop the raw key from component state the moment it is stored.
      setValue("");
      setIsVisible(false);
      await onChanged();
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

  const handleRemove = async () => {
    setIsRemoving(true);
    try {
      await supabaseAIService.deleteUserApiKey(provider);
      await onChanged();
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
    <div className="flex flex-col gap-3 border-b border-subtle py-5 last:border-b-0">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-0.5">
          <span className="text-body-sm-medium text-primary">{meta.name}</span>
          {stored ? (
            <span className="text-caption-md-regular text-tertiary">
              {t("account_settings.ai.key_stored", { hint: stored.key_hint })}
            </span>
          ) : (
            <span className="text-caption-md-regular text-tertiary">{t("account_settings.ai.key_absent")}</span>
          )}
        </div>
        {stored && (
          <Button
            variant="link"
            size="sm"
            prependIcon={<Trash2 className="size-3.5" />}
            onClick={handleRemove}
            loading={isRemoving}
          >
            {t("account_settings.ai.remove")}
          </Button>
        )}
      </div>

      <div className="flex items-start gap-2">
        <div className="relative flex-1">
          <Input
            type={isVisible ? "text" : "password"}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder={stored ? t("account_settings.ai.replace_placeholder") : meta.placeholder}
            className="w-full pr-10"
            autoComplete="off"
          />
          <button
            type="button"
            tabIndex={-1}
            aria-label={isVisible ? t("account_settings.ai.hide_key") : t("account_settings.ai.show_key")}
            className="absolute top-1/2 right-3 -translate-y-1/2 text-tertiary hover:text-primary"
            onClick={() => setIsVisible((previous) => !previous)}
          >
            {isVisible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
        <Button variant="primary" size="base" onClick={handleSave} loading={isSubmitting} disabled={!value.trim()}>
          {stored ? t("account_settings.ai.update") : t("account_settings.ai.save")}
        </Button>
      </div>

      {meta.docs && (
        <a
          href={meta.docs}
          target="_blank"
          rel="noopener noreferrer"
          className="text-caption-md-regular text-tertiary underline underline-offset-2 hover:text-primary"
        >
          {t("account_settings.ai.get_key", { provider: meta.name })}
        </a>
      )}
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

  const storedByProvider = new Map((keys ?? []).map((key) => [key.provider, key]));

  return (
    <div className="size-full">
      <ProfileSettingsHeading
        title={t("account_settings.ai.title")}
        description={t("account_settings.ai.description")}
      />

      {isSupabaseConfigured ? (
        <div className="mt-7 max-w-2xl">
          {AI_PROVIDERS.map((provider) => (
            <ProviderRow
              key={provider}
              provider={provider}
              stored={storedByProvider.get(provider)}
              onChanged={mutate}
            />
          ))}
          <p className="mt-6 text-caption-md-regular text-tertiary">{t("account_settings.ai.privacy_note")}</p>
        </div>
      ) : (
        <p className="mt-7 text-body-sm-regular text-tertiary">{t("account_settings.ai.unavailable")}</p>
      )}
    </div>
  );
});
