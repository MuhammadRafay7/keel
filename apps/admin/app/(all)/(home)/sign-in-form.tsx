/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
// keel internal packages
import type { EAdminAuthErrorCodes, TAdminAuthErrorInfo } from "@keel/constants";
import { API_BASE_URL } from "@keel/constants";
import { Button } from "@keel/propel/button";
import { AuthService, isSupabaseConfigured, supabaseAuthService } from "@keel/services";
import { Input, Spinner } from "@keel/ui";
// components
import { Banner } from "@/components/common/banner";
// hooks
import { useUser } from "@/hooks/store";
// local components
import { FormHeader } from "@/components/instance/form-header";
import { AuthBanner } from "./auth-banner";
import { AuthHeader } from "./auth-header";
import { authErrorHandler } from "./auth-helpers";

// service initialization
const authService = new AuthService();

// error codes
enum EErrorCodes {
  INSTANCE_NOT_CONFIGURED = "INSTANCE_NOT_CONFIGURED",
  REQUIRED_EMAIL_PASSWORD = "REQUIRED_EMAIL_PASSWORD",
  INVALID_EMAIL = "INVALID_EMAIL",
  USER_DOES_NOT_EXIST = "USER_DOES_NOT_EXIST",
  AUTHENTICATION_FAILED = "AUTHENTICATION_FAILED",
}

type TError = {
  type: EErrorCodes | undefined;
  message: string | undefined;
};

// form data
type TFormData = {
  email: string;
  password: string;
};

const defaultFromData: TFormData = {
  email: "",
  password: "",
};

export function InstanceSignInForm() {
  const router = useRouter();
  const { fetchCurrentUser } = useUser();
  // search params
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email") || undefined;
  const errorCode = searchParams.get("error_code") || undefined;
  const errorMessage = searchParams.get("error_message") || undefined;
  // state
  const [showPassword, setShowPassword] = useState(false);
  const [csrfToken, setCsrfToken] = useState<string | undefined>(undefined);
  const [formData, setFormData] = useState<TFormData>(defaultFromData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorInfo, setErrorInfo] = useState<TAdminAuthErrorInfo | undefined>(undefined);
  const [supabaseError, setSupabaseError] = useState<string | undefined>(undefined);

  const handleFormChange = (key: keyof TFormData, value: string | boolean) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

  useEffect(() => {
    if (!isSupabaseConfigured && csrfToken === undefined)
      authService.requestCSRFToken().then((data) => data?.csrf_token && setCsrfToken(data.csrf_token));
  }, [csrfToken]);

  useEffect(() => {
    if (emailParam) setFormData((prev) => ({ ...prev, email: emailParam }));
  }, [emailParam]);

  const handleSubmit = async (e: React.FormEvent) => {
    if (isSupabaseConfigured) {
      e.preventDefault();
      setIsSubmitting(true);
      setSupabaseError(undefined);
      try {
        const result = await supabaseAuthService.signIn(formData.email, formData.password);
        if (result.success) {
          await fetchCurrentUser();
          router.replace("/general");
        } else {
          setSupabaseError(result.error ?? "Failed to sign in");
        }
      } catch (err: any) {
        setSupabaseError(err?.message ?? "An unexpected error occurred");
      } finally {
        setIsSubmitting(false);
      }
      return;
    }
    setIsSubmitting(true);
  };

  // derived values
  const errorData: TError = useMemo(() => {
    if (errorCode && errorMessage) {
      switch (errorCode) {
        case EErrorCodes.INSTANCE_NOT_CONFIGURED:
          return { type: EErrorCodes.INSTANCE_NOT_CONFIGURED, message: errorMessage };
        case EErrorCodes.REQUIRED_EMAIL_PASSWORD:
          return { type: EErrorCodes.REQUIRED_EMAIL_PASSWORD, message: errorMessage };
        case EErrorCodes.INVALID_EMAIL:
          return { type: EErrorCodes.INVALID_EMAIL, message: errorMessage };
        case EErrorCodes.USER_DOES_NOT_EXIST:
          return { type: EErrorCodes.USER_DOES_NOT_EXIST, message: errorMessage };
        case EErrorCodes.AUTHENTICATION_FAILED:
          return { type: EErrorCodes.AUTHENTICATION_FAILED, message: errorMessage };
        default:
          return { type: undefined, message: undefined };
      }
    } else return { type: undefined, message: undefined };
  }, [errorCode, errorMessage]);

  const isButtonDisabled = useMemo(
    () => isSubmitting || !formData.email || !formData.password,
    [formData.email, formData.password, isSubmitting]
  );

  useEffect(() => {
    if (errorCode) {
      const errorDetail = authErrorHandler(errorCode?.toString() as EAdminAuthErrorCodes);
      if (errorDetail) {
        setErrorInfo(errorDetail);
      }
    }
  }, [errorCode]);

  return (
    <>
      <AuthHeader />
      <div className="mt-10 flex w-full flex-grow flex-col items-center justify-center py-6">
        <div className="relative flex w-full max-w-[22.5rem] flex-col gap-6">
          <FormHeader
            heading="Manage your Keel instance"
            subHeading="Configure instance-wide settings to secure your instance"
          />
          <form
            className="space-y-4"
            method="POST"
            action={`${API_BASE_URL}/api/instances/admins/sign-in/`}
            onSubmit={handleSubmit}
            onError={() => setIsSubmitting(false)}
          >
            {supabaseError ? (
              <Banner type="error" message={supabaseError} />
            ) : errorData.type && errorData?.message ? (
              <Banner type="error" message={errorData?.message} />
            ) : (
              <>{errorInfo && <AuthBanner bannerData={errorInfo} handleBannerData={setErrorInfo} />}</>
            )}
            <input type="hidden" name="csrfmiddlewaretoken" value={csrfToken} />

            <div className="w-full space-y-1">
              <label className="text-13 font-medium text-tertiary" htmlFor="email">
                Email <span className="text-danger-primary">*</span>
              </label>
              <Input
                className="w-full border border-subtle !bg-surface-1 placeholder:text-placeholder"
                id="email"
                name="email"
                type="email"
                inputSize="md"
                placeholder="name@company.com"
                value={formData.email}
                onChange={(e) => handleFormChange("email", e.target.value)}
                autoComplete="off"
                autoFocus
              />
            </div>

            <div className="w-full space-y-1">
              <label className="text-13 font-medium text-tertiary" htmlFor="password">
                Password <span className="text-danger-primary">*</span>
              </label>
              <div className="relative">
                <Input
                  className="w-full border border-subtle !bg-surface-1 placeholder:text-placeholder"
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  inputSize="md"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => handleFormChange("password", e.target.value)}
                  autoComplete="off"
                />
                {showPassword ? (
                  <button
                    type="button"
                    aria-label="Hide password"
                    className="absolute top-3.5 right-3 flex items-center justify-center text-placeholder"
                    onClick={() => setShowPassword(false)}
                  >
                    <EyeOff className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    aria-label="Show password"
                    className="absolute top-3.5 right-3 flex items-center justify-center text-placeholder"
                    onClick={() => setShowPassword(true)}
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
            <div className="py-2">
              <Button type="submit" size="xl" className="w-full" disabled={isButtonDisabled}>
                {isSubmitting ? <Spinner height="20px" width="20px" /> : "Sign in"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
