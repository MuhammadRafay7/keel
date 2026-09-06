/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { Building2, Globe, Users, ArrowLeft, Plus } from "lucide-react";
// keel imports
import { WEB_BASE_URL, ORGANIZATION_SIZE, RESTRICTED_URLS } from "@keel/constants";
import { Button, getButtonStyling } from "@keel/propel/button";
import { TOAST_TYPE, setToast } from "@keel/propel/toast";
import { InstanceWorkspaceService } from "@keel/services";
import type { IWorkspace } from "@keel/types";
import { validateSlug, validateWorkspaceName } from "@keel/utils";
// components
import { CustomSelect, Input } from "@keel/ui";
// hooks
import { useWorkspace } from "@/hooks/store";

const instanceWorkspaceService = new InstanceWorkspaceService();

export function WorkspaceCreateForm() {
  const router = useRouter();
  const [slugError, setSlugError] = useState(false);
  const [invalidSlug, setInvalidSlug] = useState(false);
  const [defaultValues, setDefaultValues] = useState<Partial<IWorkspace>>({
    name: "",
    slug: "",
    organization_size: "1-10",
  });
  const { createWorkspace } = useWorkspace();

  const {
    handleSubmit,
    control,
    setValue,
    getValues,
    watch,
    formState: { errors, isSubmitting, isValid },
  } = useForm<IWorkspace>({
    defaultValues,
    mode: "onChange",
  });

  const workspaceName = watch("name");
  const workspaceSlug = watch("slug");
  const [workspaceBaseURL, setWorkspaceBaseURL] = useState(() => encodeURI(WEB_BASE_URL || ""));

  useEffect(() => {
    if (!WEB_BASE_URL) {
      setWorkspaceBaseURL(encodeURI(window.location.origin + "/"));
    }
  }, []);

  const handleCreateWorkspace = async (formData: IWorkspace) => {
    try {
      const res = await instanceWorkspaceService.slugCheck(formData.slug);
      if (res.status === true && !RESTRICTED_URLS.includes(formData.slug)) {
        setSlugError(false);
        await createWorkspace(formData);
        setToast({
          type: TOAST_TYPE.SUCCESS,
          title: "Success!",
          message: `Workspace "${formData.name}" created successfully.`,
        });
        router.push(`/workspace`);
      } else {
        setSlugError(true);
      }
    } catch (_err) {
      setToast({
        type: TOAST_TYPE.ERROR,
        title: "Error!",
        message: "Failed to create workspace. Please check your network and try again.",
      });
    }
  };

  useEffect(
    () => () => {
      setDefaultValues(getValues());
    },
    [getValues, setDefaultValues]
  );

  return (
    <div className="space-y-8 pb-10">
      <div className="shadow-card max-w-3xl space-y-8 rounded-3xl border border-subtle bg-surface-1 p-7 sm:p-9">
        <div className="flex items-center gap-3.5 border-b border-subtle pb-5">
          <div className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 shadow-soft flex size-11 items-center justify-center rounded-2xl border">
            <Building2 className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-17 font-bold text-primary">Workspace Tenant Setup</h3>
            <p className="text-12 text-secondary">Provision a new isolated organization on this Keel instance.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(handleCreateWorkspace)} className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {/* Workspace Name */}
            <div className="space-y-1.5">
              <label className="text-13 font-semibold text-primary" htmlFor="workspaceName">
                Workspace Name <span className="text-rose-500">*</span>
              </label>
              <Controller
                control={control}
                name="name"
                rules={{
                  validate: (value) => validateWorkspaceName(value, true),
                }}
                render={({ field: { value, ref, onChange } }) => (
                  <Input
                    id="workspaceName"
                    type="text"
                    value={value}
                    onChange={(e) => {
                      onChange(e.target.value);
                      setValue("name", e.target.value);
                      setValue(
                        "slug",
                        e.target.value
                          .toLowerCase()
                          .trim()
                          .replace(/[^a-z0-9_-]/g, "-"),
                        {
                          shouldValidate: true,
                        }
                      );
                    }}
                    ref={ref}
                    hasError={Boolean(errors.name)}
                    placeholder="e.g. Acme Corporation or Core Engineering"
                    className="w-full text-13"
                  />
                )}
              />
              {errors?.name?.message && <span className="text-11 text-danger-primary">{errors.name.message}</span>}
            </div>

            {/* Workspace URL Slug */}
            <div className="space-y-1.5">
              <label className="text-13 font-semibold text-primary" htmlFor="workspaceUrl">
                Workspace Identifier URL <span className="text-rose-500">*</span>
              </label>
              <div className="focus-within:border-blue-500 shadow-soft flex w-full items-center rounded-2xl border border-subtle bg-layer-1 px-3.5 py-1 transition-all">
                <span className="font-mono pr-1 text-12 text-secondary select-none">{workspaceBaseURL}</span>
                <Controller
                  control={control}
                  name="slug"
                  rules={{
                    validate: (value) => validateSlug(value),
                  }}
                  render={({ field: { onChange, value, ref } }) => (
                    <Input
                      id="workspaceUrl"
                      type="text"
                      value={
                        value
                          ? value
                              .toLowerCase()
                              .trim()
                              .replace(/[^a-z0-9_-]/g, "-")
                          : ""
                      }
                      onChange={(e) => {
                        const cleanVal = e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, "-");
                        if (/^[a-zA-Z0-9_-]+$/.test(cleanVal)) setInvalidSlug(false);
                        else setInvalidSlug(true);
                        onChange(cleanVal);
                      }}
                      ref={ref}
                      hasError={Boolean(errors.slug)}
                      placeholder="acme"
                      className="font-mono block w-full border-none !bg-transparent !px-0 py-1.5 text-13 font-semibold text-primary shadow-none focus:ring-0"
                    />
                  )}
                />
              </div>
              {slugError && (
                <p className="text-12 text-danger-primary">This URL slug is already taken. Try something else.</p>
              )}
              {invalidSlug && (
                <p className="text-12 text-danger-primary">
                  URLs can contain only letters, numbers, hyphens, and underscores.
                </p>
              )}
              {errors.slug && <span className="text-11 text-danger-primary">{errors.slug.message}</span>}
            </div>

            {/* Organization Size */}
            <div className="space-y-1.5">
              <label className="text-13 font-semibold text-primary">
                Expected Team Size <span className="text-rose-500">*</span>
              </label>
              <Controller
                name="organization_size"
                control={control}
                rules={{ required: "This is a required field." }}
                render={({ field: { value, onChange } }) => (
                  <CustomSelect
                    value={value}
                    onChange={onChange}
                    label={
                      ORGANIZATION_SIZE.find((c) => c === value) ?? (
                        <span className="text-secondary">Select a range</span>
                      )
                    }
                    buttonClassName="!border !border-subtle !bg-layer-1 !rounded-2xl !py-2.5 !shadow-soft text-13"
                    input
                  >
                    {ORGANIZATION_SIZE.map((item) => (
                      <CustomSelect.Option key={item} value={item}>
                        {item} members
                      </CustomSelect.Option>
                    ))}
                  </CustomSelect>
                )}
              />
              {errors.organization_size && (
                <span className="text-11 text-danger-primary">{errors.organization_size.message}</span>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-4">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={!isValid || !workspaceName || !workspaceSlug}
              loading={isSubmitting}
            >
              {isSubmitting ? "Provisioning..." : "Create workspace"}
            </Button>
            <Link className={getButtonStyling("secondary", "lg")} href="/workspace">
              <ArrowLeft className="mr-1 h-4 w-4" />
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
