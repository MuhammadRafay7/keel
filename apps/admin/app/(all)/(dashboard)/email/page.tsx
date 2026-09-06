/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { useEffect, useState } from "react";
import { observer } from "mobx-react";
import useSWR from "swr";
import { Mail, ShieldCheck, Zap, AlertTriangle, CheckCircle2, Server } from "lucide-react";
import { TOAST_TYPE, setToast } from "@keel/propel/toast";
import { Loader, ToggleSwitch } from "@keel/ui";
import { PageWrapper } from "@/components/common/page-wrapper";
import { useInstance } from "@/hooks/store";
import type { Route } from "./+types/page";
import { InstanceEmailForm } from "./email-config-form";

const InstanceEmailPage = observer(function InstanceEmailPage(_props: Route.ComponentProps) {
  const { fetchInstanceConfigurations, formattedConfig, disableEmail } = useInstance();
  const { isLoading } = useSWR("INSTANCE_CONFIGURATIONS", () => fetchInstanceConfigurations());

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSMTPEnabled, setIsSMTPEnabled] = useState(false);

  const handleToggle = async (targetValue?: boolean) => {
    const nextValue = targetValue !== undefined ? targetValue : !isSMTPEnabled;
    if (!nextValue) {
      setIsSubmitting(true);
      try {
        await disableEmail();
        setIsSMTPEnabled(false);
        setToast({
          title: "Email feature disabled",
          message: "SMTP email delivery has been disabled",
          type: TOAST_TYPE.SUCCESS,
        });
      } catch (_error) {
        setToast({
          title: "Error disabling email",
          message: "Failed to disable email feature. Please try again.",
          type: TOAST_TYPE.ERROR,
        });
      } finally {
        setIsSubmitting(false);
      }
      return;
    }
    setIsSMTPEnabled(true);
  };

  useEffect(() => {
    if (formattedConfig) {
      setIsSMTPEnabled(formattedConfig.ENABLE_SMTP === "1");
    }
  }, [formattedConfig]);

  return (
    <PageWrapper
      header={{
        title: "Email & SMTP Configuration",
        description:
          "Configure transactional email delivery for invites, notifications, and magic-link authentication.",
        actions: isLoading ? (
          <Loader>
            <Loader.Item width="24px" height="16px" className="rounded-full" />
          </Loader>
        ) : (
          <div className="flex items-center gap-3">
            <span className="text-12 font-medium text-secondary">
              {isSMTPEnabled ? "SMTP Enabled" : "SMTP Disabled"}
            </span>
            <ToggleSwitch value={isSMTPEnabled} onChange={() => handleToggle()} size="sm" disabled={isSubmitting} />
          </div>
        ),
      }}
    >
      <div className="space-y-8 pb-10">
        {isSMTPEnabled ? (
          <div className="shadow-card space-y-6 rounded-3xl border border-subtle bg-surface-1 p-7 sm:p-8">
            <div className="flex items-center justify-between border-b border-subtle pb-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 shadow-soft flex size-10 items-center justify-center rounded-2xl border">
                  <Server className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-16 font-bold text-primary">SMTP Server Settings</h3>
                  <p className="text-12 text-secondary">Connect your custom outbound email relay.</p>
                </div>
              </div>
              <span className="bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-11 font-semibold">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Active Relay
              </span>
            </div>

            {formattedConfig ? (
              <InstanceEmailForm config={formattedConfig} />
            ) : (
              <Loader className="space-y-8">
                <Loader.Item height="50px" width="75%" />
                <Loader.Item height="50px" width="75%" />
                <Loader.Item height="50px" width="40%" />
              </Loader>
            )}
          </div>
        ) : (
          /* Disabled State Setup Hero Card */
          <div className="shadow-card mx-auto max-w-2xl space-y-6 rounded-3xl border border-subtle bg-surface-1 p-8 text-center sm:p-10">
            <div className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 shadow-soft mx-auto flex size-14 items-center justify-center rounded-3xl border">
              <Mail className="h-7 w-7" />
            </div>

            <div className="space-y-2">
              <h3 className="text-20 font-bold tracking-tight text-primary">SMTP Email Delivery is Inactive</h3>
              <p className="mx-auto max-w-md text-13 leading-relaxed text-secondary">
                When disabled, user invitations, verification codes, and activity alerts cannot be dispatched
                automatically.
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => handleToggle(true)}
                className="bg-blue-600 shadow-glow hover:bg-blue-700 inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-13 font-semibold text-white transition-all hover:-translate-y-0.5"
              >
                <Server className="h-4 w-4" />
                <span>Enable & Configure SMTP</span>
              </button>
            </div>
          </div>
        )}

        {/* Email Delivery Features Grid */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          <div className="shadow-soft space-y-3 rounded-3xl border border-subtle bg-surface-1 p-6">
            <div className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 flex size-10 items-center justify-center rounded-2xl border">
              <Zap className="h-5 w-5" />
            </div>
            <h4 className="text-14 font-bold text-primary">Zero Internet Leaks</h4>
            <p className="text-12 leading-relaxed text-secondary">
              Keel dispatches transactional emails directly through your configured relay without sharing metadata with
              third parties.
            </p>
          </div>

          <div className="shadow-soft space-y-3 rounded-3xl border border-subtle bg-surface-1 p-6">
            <div className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20 flex size-10 items-center justify-center rounded-2xl border">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h4 className="text-14 font-bold text-primary">TLS / SSL Encryption</h4>
            <p className="text-12 leading-relaxed text-secondary">
              Full support for standard STARTTLS and direct SSL socket tunnels over ports 587 and 465.
            </p>
          </div>

          <div className="shadow-soft space-y-3 rounded-3xl border border-subtle bg-surface-1 p-6">
            <div className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 flex size-10 items-center justify-center rounded-2xl border">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <h4 className="text-14 font-bold text-primary">Universal Compatibility</h4>
            <p className="text-12 leading-relaxed text-secondary">
              Tested with Amazon SES, SendGrid, Resend, Mailgun, Postmark, and self-hosted Postfix servers.
            </p>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
});

export const meta: Route.MetaFunction = () => [{ title: "Email & SMTP Settings – Keel Admin" }];

export default InstanceEmailPage;
