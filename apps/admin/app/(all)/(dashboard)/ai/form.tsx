/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Sparkles, KeyRound, Bot, CheckCircle2, ShieldCheck, Zap, ExternalLink, Eye, EyeOff } from "lucide-react";
import { Button } from "@keel/propel/button";
import { TOAST_TYPE, setToast } from "@keel/propel/toast";
import type { IFormattedInstanceConfiguration, TInstanceAIConfigurationKeys } from "@keel/types";
import { Input } from "@keel/ui";
import { useInstance } from "@/hooks/store";

type IInstanceAIForm = {
  config: IFormattedInstanceConfiguration;
};

type AIFormValues = Record<TInstanceAIConfigurationKeys, string>;

const MODEL_PRESETS = [
  { id: "gpt-4o-mini", label: "GPT-4o Mini (Fast & Cost Effective)" },
  { id: "gpt-4o", label: "GPT-4o (High Performance)" },
  { id: "o1-mini", label: "o1 Mini (Advanced Reasoning)" },
  { id: "gpt-3.5-turbo", label: "GPT-3.5 Turbo" },
];

export function InstanceAIForm(props: IInstanceAIForm) {
  const { config } = props;
  const { updateInstanceConfigurations } = useInstance();
  const [showApiKey, setShowApiKey] = useState(false);

  const {
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<AIFormValues>({
    defaultValues: {
      LLM_API_KEY: config["LLM_API_KEY"] || "",
      LLM_MODEL: config["LLM_MODEL"] || "gpt-4o-mini",
    },
  });

  const currentModel = watch("LLM_MODEL");
  const currentKey = watch("LLM_API_KEY");
  const isKeyConfigured = Boolean(currentKey && currentKey.length > 5);

  const onSubmit = async (formData: AIFormValues) => {
    const payload: Partial<AIFormValues> = { ...formData };

    await updateInstanceConfigurations(payload)
      .then(() =>
        setToast({
          type: TOAST_TYPE.SUCCESS,
          title: "Success",
          message: "AI Settings updated successfully",
        })
      )
      .catch((err) => {
        console.error(err);
        setToast({
          type: TOAST_TYPE.ERROR,
          title: "Error",
          message: "Failed to update AI settings",
        });
      });
  };

  return (
    <div className="space-y-8">
      {/* OpenAI Engine Configuration Card */}
      <div className="shadow-card space-y-6 rounded-3xl border border-subtle bg-surface-1 p-7 sm:p-8">
        <div className="flex flex-col justify-between gap-4 border-b border-subtle pb-5 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3.5">
            <div className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 shadow-soft flex size-11 items-center justify-center rounded-2xl border">
              <Bot className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-16 font-bold text-primary">OpenAI Engine Credentials</h3>
              <p className="text-12 text-secondary">
                Configure API keys and select the Large Language Model powering Keel AI.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isKeyConfigured ? (
              <span className="bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-11 font-semibold">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Configured
              </span>
            ) : (
              <span className="bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-11 font-semibold">
                <KeyRound className="h-3.5 w-3.5" />
                API Key Required
              </span>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* LLM Model Input & Presets */}
            <div className="space-y-2">
              <label className="text-13 font-semibold text-primary" htmlFor="LLM_MODEL">
                LLM Model Identifier
              </label>
              <Controller
                control={control}
                name="LLM_MODEL"
                render={({ field: { value, onChange } }) => (
                  <Input
                    id="LLM_MODEL"
                    type="text"
                    value={value}
                    onChange={onChange}
                    placeholder="gpt-4o-mini"
                    className="w-full"
                  />
                )}
              />
              <p className="text-11 text-secondary">
                Popular models:{" "}
                <span className="mt-1 inline-flex flex-wrap gap-1.5">
                  {MODEL_PRESETS.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setValue("LLM_MODEL", m.id, { shouldDirty: true })}
                      className={`font-mono rounded-full px-2.5 py-0.5 text-10 font-medium transition-all ${
                        currentModel === m.id
                          ? "bg-blue-600 shadow-soft text-white"
                          : "hover:border-blue-400 border border-subtle bg-layer-1 text-secondary hover:text-primary"
                      }`}
                    >
                      {m.id}
                    </button>
                  ))}
                </span>
              </p>
            </div>

            {/* API Key */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-13 font-semibold text-primary" htmlFor="LLM_API_KEY">
                  OpenAI API Key
                </label>
                <a
                  href="https://platform.openai.com/api-keys"
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 dark:text-blue-400 inline-flex items-center gap-1 text-11 font-medium hover:underline"
                >
                  <span>Get API Key</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              <div className="relative">
                <Controller
                  control={control}
                  name="LLM_API_KEY"
                  render={({ field: { value, onChange } }) => (
                    <Input
                      id="LLM_API_KEY"
                      type={showApiKey ? "text" : "password"}
                      value={value}
                      onChange={onChange}
                      placeholder="sk-proj-..."
                      className="font-mono w-full pr-10 text-12"
                    />
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-secondary transition-colors hover:text-primary"
                  title={showApiKey ? "Hide key" : "Show key"}
                >
                  {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-11 text-secondary">
                Your key is stored securely and encrypted in your deployment instance.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <Button type="submit" variant="primary" size="lg" loading={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </form>
      </div>

      {/* AI Features Capabilities Grid */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <div className="shadow-soft space-y-3 rounded-3xl border border-subtle bg-surface-1 p-6">
          <div className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 flex size-10 items-center justify-center rounded-2xl border">
            <Sparkles className="h-5 w-5" />
          </div>
          <h4 className="text-14 font-bold text-primary">Smart Issue Summarization</h4>
          <p className="text-12 leading-relaxed text-secondary">
            Automatically compresses long issue discussions, comment threads, and activity into concise executive
            summaries.
          </p>
        </div>

        <div className="shadow-soft space-y-3 rounded-3xl border border-subtle bg-surface-1 p-6">
          <div className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20 flex size-10 items-center justify-center rounded-2xl border">
            <Zap className="h-5 w-5" />
          </div>
          <h4 className="text-14 font-bold text-primary">Sub-issue Generation</h4>
          <p className="text-12 leading-relaxed text-secondary">
            Decomposes complex requirements and project milestones into structured, actionable engineering tasks.
          </p>
        </div>

        <div className="shadow-soft space-y-3 rounded-3xl border border-subtle bg-surface-1 p-6">
          <div className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20 flex size-10 items-center justify-center rounded-2xl border">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <h4 className="text-14 font-bold text-primary">Zero-Data Retention</h4>
          <p className="text-12 leading-relaxed text-secondary">
            Your workspace data is transmitted directly to the configured model provider without 3rd-party caching or
            training.
          </p>
        </div>
      </div>
    </div>
  );
}
