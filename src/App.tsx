import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { AppLayout, SafeLayout } from "./components/app/Layouts.tsx";
import CreateSafe from "./components/create-account/CreateSafe.tsx";
import SafeInfo from "./components/dashboard/index.tsx";
import Home from "./components/Home";
import ImportSafe from "./components/ImportSafe.tsx";
import SafeTransactionHistory from "./components/SafeTransactionHistory.tsx";
import Settings from "./components/Settings";
import SignMessage from "./components/SignMessage.tsx";
import RpcSetupDialog from "./components/settings/RpcSetupDialog.tsx";
import AggregateSignaturesAndExecute from "./components/transaction/AggregateSignaturesAndExecute.tsx";
import ApproveSafeTransactionForm from "./components/transaction/ApproveSafeTransaction.tsx";
import ApproveTransactionHash from "./components/transaction/ApproveTransctionHash.tsx";
import CreateTransaction from "./components/transaction/create/CreateTransaction.tsx";
import Welcome from "./components/Welcome.tsx";
import { AddressBookProvider } from "./context/AddressBookContext";
import { CreateTransactionProvider } from "./context/CreateTransactionContext";
import { WalletProvider } from "./context/WalletContext";
import AppThemeProvider from "./theme/AppThemeProvider.tsx";

function App() {
  return (
    <>
      <AppThemeProvider>
        <RpcSetupDialog />
        <WalletProvider>
          <AddressBookProvider>
            <Router>
              <Routes>
                <Route path="/" element={<Welcome />} />
                <Route path="/welcome" element={<Welcome />} />
                <Route element={<AppLayout />}>
                  <Route path="/home" element={<Home />} />
                  <Route path="/import" element={<ImportSafe />} />
                  <Route path="/create" element={<CreateSafe />} />
                </Route>
                <Route element={<SafeLayout />}>
                  <Route path="/safe-info" element={<SafeInfo />} />
                  <Route
                    path="/create-transaction/*"
                    element={
                      <CreateTransactionProvider>
                        <CreateTransaction />
                      </CreateTransactionProvider>
                    }
                  />
                  <Route path="/aggregate-signatures" element={<AggregateSignaturesAndExecute />} />
                  <Route path="/approve-transaction" element={<ApproveSafeTransactionForm />} />
                  <Route path="/approve-transaction-hash" element={<ApproveTransactionHash />} />
                  <Route path="/sign-message" element={<SignMessage />} />
                  <Route path="/history" element={<SafeTransactionHistory />} />
                  <Route path="/settings" element={<Settings />} />
                </Route>
              </Routes>
            </Router>
          </AddressBookProvider>
        </WalletProvider>
      </AppThemeProvider>
    </>
  );
}
export default App;
