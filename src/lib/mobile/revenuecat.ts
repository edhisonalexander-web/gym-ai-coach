import { Capacitor } from "@capacitor/core";
import {
  LOG_LEVEL,
  Purchases,
  type CustomerInfo,
  type PurchasesPackage,
} from "@revenuecat/purchases-capacitor";

export const PREMIUM_ENTITLEMENT = "premium";
export const PREMIUM_PRODUCT_ID = "premium_monthly";
export const PREMIUM_PRICE = "$9.99 / mes";

let configuredForUser: string | null = null;

export type PremiumOffer = {
  package: PurchasesPackage;
  priceLabel: string;
  periodLabel: string;
};

export type PremiumCustomerState = {
  isPremium: boolean;
  expirationDate: string | null;
};

export function isNativeMobile(): boolean {
  return Capacitor.isNativePlatform();
}

function apiKeyForPlatform(): string | null {
  if (!isNativeMobile()) return null;
  const platform = Capacitor.getPlatform();
  const key = platform === "ios"
    ? import.meta.env.VITE_REVENUECAT_IOS_API_KEY
    : import.meta.env.VITE_REVENUECAT_ANDROID_API_KEY;
  return typeof key === "string" && key.trim() ? key.trim() : null;
}

/**
 * Configure RevenueCat once per authenticated app user.
 * The public SDK key is safe for the mobile bundle; secret webhook keys never
 * belong here. Test Store uses the same public project key during development.
 */
export async function configureRevenueCat(appUserId: string): Promise<void> {
  const apiKey = apiKeyForPlatform();
  if (!apiKey) throw new Error("Falta la clave pública de RevenueCat para esta plataforma");
  if (configuredForUser === appUserId) return;

  await Purchases.configure({ apiKey, appUserID: appUserId });
  await Purchases.setLogLevel({ level: LOG_LEVEL.INFO });
  configuredForUser = appUserId;
}

function customerState(customerInfo: CustomerInfo): PremiumCustomerState {
  const entitlement = customerInfo.entitlements.active[PREMIUM_ENTITLEMENT];
  return {
    isPremium: Boolean(entitlement?.isActive),
    expirationDate: entitlement?.expirationDate ?? customerInfo.latestExpirationDate ?? null,
  };
}

export async function getPremiumState(appUserId: string): Promise<PremiumCustomerState> {
  await configureRevenueCat(appUserId);
  const { customerInfo } = await Purchases.getCustomerInfo();
  return customerState(customerInfo);
}

export async function getPremiumOffer(appUserId: string): Promise<PremiumOffer | null> {
  await configureRevenueCat(appUserId);
  const { current } = await Purchases.getOfferings();
  const pkg = current?.availablePackages.find(
    (candidate) => candidate.product.identifier === PREMIUM_PRODUCT_ID,
  ) ?? null;
  if (!pkg) return null;
  return {
    package: pkg,
    priceLabel: pkg.product.priceString || PREMIUM_PRICE,
    periodLabel: pkg.product.subscriptionPeriod || "Mensual",
  };
}

export async function purchasePremium(appUserId: string, premiumPackage: PurchasesPackage): Promise<PremiumCustomerState> {
  await configureRevenueCat(appUserId);
  const { customerInfo } = await Purchases.purchasePackage({ aPackage: premiumPackage });
  return customerState(customerInfo);
}

export async function restorePremium(appUserId: string): Promise<PremiumCustomerState> {
  await configureRevenueCat(appUserId);
  const { customerInfo } = await Purchases.restorePurchases();
  return customerState(customerInfo);
}

export function formatSubscriptionDate(value: string | null): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("es", { dateStyle: "medium" }).format(date);
}
