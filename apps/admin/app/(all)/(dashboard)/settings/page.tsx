/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { useState } from "react";
import { observer } from "mobx-react";
import useSWR from "swr";
import { Shield, AlertTriangle, Save, Users, Database } from "lucide-react";
import { TOAST_TYPE, setToast } from "@keel/propel/toast";
import { ToggleSwitch } from "@keel/ui";
import { PageWrapper } from "@/components/common/page-wrapper";
import { useAdmin } from "@/hooks/store";

const PlatformSettingsPage = observer(function PlatformSettingsPage() {
  const adminStore = useAdmin();
  const { appSettings } = adminStore;

  const [signupMode, setSignupMode] = useState<string>("open");
  const [maintenanceMode, setMaintenanceMode] = useState<boolean>(false);
  const [maxUploadMb, setMaxUploadMb] = useState<string>("50");
  const [isSaving, setIsSaving] = useState<boolean>(false);

  useSWR("ADMIN_APP_SETTINGS", async () => {
    const settings = await adminStore.fetchAppSettings();
    if (settings?.SIGNUP_MODE) setSignupMode(settings.SIGNUP_MODE);
    if (settings?.MAINTENANCE_MODE) setMaintenanceMode(settings.MAINTENANCE_MODE === "1");
    if (settings?.MAX_UPLOAD_MB) setMaxUploadMb(settings.MAX_UPLOAD_MB);
    return settings;
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await adminStore.updateAppSetting("SIGNUP_MODE", signupMode);
      await adminStore.updateAppSetting("MAINTENANCE_MODE", maintenanceMode ? "1" : "0");
      await adminStore.updateAppSetting("MAX_UPLOAD_MB", maxUploadMb);

      setToast({
        type: TOAST_TYPE.SUCCESS,
        title: "Settings Saved",
        message: "Platform governance policies updated successfully.",
      });
    } catch (err: any) {
      setToast({
        type: TOAST_TYPE.ERROR,
        title: "Save Failed",
        message: err?.message || "Could not save platform settings.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <PageWrapper
      header={{
        title: "Platform Settings & Governance",
        description: "Configure system-wide sign-up policies, maintenance mode, and global infrastructure thresholds.",
      }}
    >
      <form onSubmit={handleSave} className="max-w-3xl space-y-6 pb-10">
        {/* User Registration Policy */}
        <div className="shadow-soft hover:shadow-card space-y-5 rounded-3xl border border-subtle bg-surface-1 p-6 transition-all sm:p-7">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 shadow-soft flex h-10 w-10 items-center justify-center rounded-2xl border">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-15 font-bold tracking-tight text-primary">Public Registration Gate</h3>
              <p className="text-12 text-secondary">Control whether new users can register on this platform.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3.5 pt-1 sm:grid-cols-3">
            <label
              className={`flex cursor-pointer flex-col rounded-2xl border p-4 transition-all ${
                signupMode === "open"
                  ? "border-blue-500 bg-blue-500/10 shadow-glow-sm"
                  : "hover:border-blue-400/50 shadow-soft border-subtle bg-layer-1/60"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <input
                  type="radio"
                  name="signupMode"
                  value="open"
                  checked={signupMode === "open"}
                  onChange={(e) => setSignupMode(e.target.value)}
                  className="text-blue-600 focus:ring-blue-500 h-4 w-4"
                />
                <span className="text-13 font-semibold text-primary">Open Registration</span>
              </div>
              <span className="mt-2 text-11 text-secondary">Anyone can sign up and create workspaces freely.</span>
            </label>

            <label
              className={`flex cursor-pointer flex-col rounded-2xl border p-4 transition-all ${
                signupMode === "invite_only"
                  ? "border-blue-500 bg-blue-500/10 shadow-glow-sm"
                  : "hover:border-blue-400/50 shadow-soft border-subtle bg-layer-1/60"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <input
                  type="radio"
                  name="signupMode"
                  value="invite_only"
                  checked={signupMode === "invite_only"}
                  onChange={(e) => setSignupMode(e.target.value)}
                  className="text-blue-600 focus:ring-blue-500 h-4 w-4"
                />
                <span className="text-13 font-semibold text-primary">Invite Only</span>
              </div>
              <span className="mt-2 text-11 text-secondary">Users can only register if invited to a workspace.</span>
            </label>

            <label
              className={`flex cursor-pointer flex-col rounded-2xl border p-4 transition-all ${
                signupMode === "closed"
                  ? "border-blue-500 bg-blue-500/10 shadow-glow-sm"
                  : "hover:border-blue-400/50 shadow-soft border-subtle bg-layer-1/60"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <input
                  type="radio"
                  name="signupMode"
                  value="closed"
                  checked={signupMode === "closed"}
                  onChange={(e) => setSignupMode(e.target.value)}
                  className="text-blue-600 focus:ring-blue-500 h-4 w-4"
                />
                <span className="text-13 font-semibold text-primary">Closed / Admin Provisioned</span>
              </div>
              <span className="mt-2 text-11 text-secondary">Only Superadmins can provision user accounts.</span>
            </label>
          </div>
        </div>

        {/* Maintenance Mode */}
        <div className="shadow-soft hover:shadow-card flex items-center justify-between gap-4 rounded-3xl border border-subtle bg-surface-1 p-6 transition-all sm:p-7">
          <div className="flex items-start gap-3.5">
            <div className="bg-amber-500/10 text-amber-500 border-amber-500/20 shadow-soft mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-15 font-bold tracking-tight text-primary">System Maintenance Mode</h3>
              <p className="mt-1 text-12 text-secondary">
                When active, non-admin users will see a maintenance notice and cannot modify database state.
              </p>
            </div>
          </div>

          <ToggleSwitch value={maintenanceMode} onChange={() => setMaintenanceMode((prev) => !prev)} size="sm" />
        </div>

        {/* Storage Quota */}
        <div className="shadow-soft hover:shadow-card space-y-4 rounded-3xl border border-subtle bg-surface-1 p-6 transition-all sm:p-7">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 shadow-soft flex h-10 w-10 items-center justify-center rounded-2xl border">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-15 font-bold tracking-tight text-primary">Max File Attachment Size</h3>
              <p className="text-12 text-secondary">Maximum upload size allowed per file attachment.</p>
            </div>
          </div>

          <div className="flex max-w-xs items-center gap-3 pt-1">
            <input
              type="number"
              min="5"
              max="500"
              value={maxUploadMb}
              onChange={(e) => setMaxUploadMb(e.target.value)}
              className="font-mono focus:border-blue-500 shadow-soft w-28 rounded-full border border-subtle bg-layer-1 px-4 py-2 text-13 font-semibold text-primary transition-all focus:outline-none"
            />
            <span className="text-13 font-medium text-secondary">Megabytes (MB)</span>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="bg-blue-600 shadow-glow hover:bg-blue-700 inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-13 font-semibold text-white transition-all hover:-translate-y-0.5 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {isSaving ? "Saving..." : "Save Platform Settings"}
          </button>
        </div>
      </form>
    </PageWrapper>
  );
});

export const meta = () => [
  { title: "Platform Settings – Keel Admin" },
  { name: "description", content: "Configure platform settings and registration gates." },
];

export default PlatformSettingsPage;
