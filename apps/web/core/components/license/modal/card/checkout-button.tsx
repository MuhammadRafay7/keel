/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { observer } from "mobx-react";
// keel imports
import { Button } from "@keel/propel/button";
import type { EProductSubscriptionEnum, IPaymentProduct, TSubscriptionPrice } from "@keel/types";
import { Loader } from "@keel/ui";
// local imports
import { DiscountInfo } from "./discount-info";

export type TCheckoutParams = {
  planVariant: EProductSubscriptionEnum;
  productId: string;
  priceId: string;
};

type Props = {
  keelName: string;
  planVariant: EProductSubscriptionEnum;
  isLoading?: boolean;
  product: IPaymentProduct | undefined;
  price: TSubscriptionPrice;
  upgradeCTA?: string;
  upgradeLoaderType: Omit<EProductSubscriptionEnum, "FREE"> | undefined;
  renderTrialButton?: (props: { productId: string | undefined; priceId: string | undefined }) => React.ReactNode;
  handleCheckout: (params: TCheckoutParams) => void;
  isSelfHosted: boolean;
  isTrialAllowed: boolean;
};

export const PlanCheckoutButton = observer(function PlanCheckoutButton(props: Props) {
  const {
    keelName,
    planVariant,
    isLoading,
    product,
    price,
    upgradeCTA,
    upgradeLoaderType,
    renderTrialButton,
    handleCheckout,
    isSelfHosted,
    isTrialAllowed,
  } = props;

  return (
    <>
      <div className="pb-4 text-center">
        {/*
          No figure is shown. Keel quotes per workspace rather than publishing a
          per-seat price, so the card states that and points at sales instead of
          rendering a number the buyer would have to un-learn on the call.
        */}
        <div className="h-9 text-20 font-semibold">
          {isLoading ? (
            <Loader className="flex flex-col items-center justify-center">
              <Loader.Item height="36px" width="4rem" />
            </Loader>
          ) : (
            <>Quote on request</>
          )}
        </div>
        <div className="text-caption-md-medium text-tertiary">Pricing is quoted per workspace</div>
      </div>
      {isLoading ? (
        <Loader className="flex flex-col items-center justify-center">
          <Loader.Item height="38px" width="14rem" />
        </Loader>
      ) : (
        <div className="flex w-full flex-col items-center justify-center space-y-4">
          <Button
            variant="primary"
            size="lg"
            className="w-56"
            onClick={() => {
              if (product && price.id) {
                handleCheckout({
                  planVariant,
                  productId: product.id,
                  priceId: price.id,
                });
              }
            }}
            disabled={!!upgradeLoaderType}
          >
            {upgradeLoaderType === planVariant ? "Redirecting to Stripe" : (upgradeCTA ?? `Upgrade to ${keelName}`)}
          </Button>
          {isTrialAllowed && !isSelfHosted && (
            <div className="mt-1 h-3">
              {renderTrialButton &&
                renderTrialButton({
                  productId: product?.id,
                  priceId: price.id,
                })}
            </div>
          )}
        </div>
      )}
    </>
  );
});
