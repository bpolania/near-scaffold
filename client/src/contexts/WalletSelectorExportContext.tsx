import type { ReactNode } from "react";
import React, {
  useCallback,
  useContext,
  useEffect,
  useState,
  useMemo,
} from "react";
import { map, distinctUntilChanged } from "rxjs";
import { setupWalletSelector } from "@near-wallet-selector/core";
import type { WalletSelector, AccountState } from "@near-wallet-selector/core";
import { setupExportSelectorModal } from "@near-wallet-selector/account-export";
import type { WalletSelectorModal } from "@near-wallet-selector/account-export";
import { setupHereWallet } from "@near-wallet-selector/here-wallet";
import { setupNightly } from "@near-wallet-selector/nightly";
import { setupMeteorWallet } from "@near-wallet-selector/meteor-wallet";
import { Loading } from "../components/Loading";
import { setupMyNearWallet } from "@near-wallet-selector/my-near-wallet";
import { setupNearMobileWallet } from "@near-wallet-selector/near-mobile-wallet";
import { setupMintbaseWallet } from "@near-wallet-selector/mintbase-wallet";

declare global {
  interface Window {
    importSelector: WalletSelector;
    exportModal: WalletSelectorModal;
  }
}

interface ExportAccountSelectorContextValue {
  importSelector: WalletSelector;
  exportModal: WalletSelectorModal;
  accounts: Array<AccountState>;
  accountId: string | null;
}

const ExportAccountSelectorContext =
  React.createContext<ExportAccountSelectorContextValue | null>(null);

export const ExportAccountSelectorContextProvider: React.FC<{
  children: ReactNode;
}> = ({ children }) => {
  const [importSelector, setSelector] = useState<WalletSelector | null>(null);
  const [modal, setModal] = useState<WalletSelectorModal | null>(null);
  const [accounts, setAccounts] = useState<Array<AccountState>>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const init = useCallback(async () => {
    const _selector = await setupWalletSelector({
      network: "testnet",
      debug: true,
      modules: [
        setupMyNearWallet(),
        setupNightly(),
        setupMeteorWallet(),
        setupHereWallet(),
        setupMintbaseWallet({ contractId: "guest-book.testnet" }),
        setupNearMobileWallet(),
      ],
    });
    /**
     * Insert list of accounts to be imported here
     * accounts: [{ accountId: "test.testnet", privateKey: "ed25519:..."}, ...]
     */
    const _modal = setupExportSelectorModal(_selector, {
      accounts: [],
      onComplete: (completeProps) => {
        console.log(
          `${completeProps.accounts} exported to ${completeProps.walletName}`
        );
      },
    });
    const state = _selector.store.getState();
    setAccounts(state.accounts);

    // this is added for debugging purpose only
    // for more information (https://github.com/near/wallet-selector/pull/764#issuecomment-1498073367)
    window.importSelector = _selector;
    window.exportModal = _modal;

    setSelector(_selector);
    setModal(_modal);
    setLoading(false);
  }, []);

  useEffect(() => {
    init().catch((err) => {
      console.error(err);
      alert("Failed to initialise wallet selector");
    });
  }, [init]);

  useEffect(() => {
    if (!importSelector) {
      return;
    }

    const subscription = importSelector.store.observable
      .pipe(
        map((state) => state.accounts),
        distinctUntilChanged()
      )
      .subscribe((nextAccounts) => {
        setAccounts(nextAccounts);
      });

    return () => subscription.unsubscribe();
  }, [importSelector]);

  const exportWalletSelectorContextValue =
    useMemo<ExportAccountSelectorContextValue>(
      () => ({
        importSelector: importSelector!,
        exportModal: modal!,
        accounts,
        accountId:
          accounts.find((account) => account.active)?.accountId || null,
      }),
      [importSelector, modal, accounts]
    );

  if (loading) {
    return <Loading />;
  }

  return (
    <ExportAccountSelectorContext.Provider
      value={exportWalletSelectorContextValue}
    >
      {children}
    </ExportAccountSelectorContext.Provider>
  );
};

export function useExportAccountSelector() {
  const context = useContext(ExportAccountSelectorContext);

  if (!context) {
    throw new Error(
      "useExportAccountSelector must be used within a ExportAccountSelectorContextProvider"
    );
  }

  return context;
}