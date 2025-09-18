import { Container, Toolbar } from "@mui/material";
import { Outlet, Route, BrowserRouter as Router, Routes } from "react-router-dom";
import AddCustomDeployment from "./components/AddCustomDeployment.tsx";
import Home from "./components/Home";
import ImportSafe from "./components/ImportSafe.tsx";
import SafeTransactionHistory from "./components/SafeTransactionHistory.tsx";
import Settings from "./components/Settings";
import SignMessage from "./components/SignMessage.tsx";
import Welcome from "./components/Welcome.tsx";
import BottomBar from "./components/app/BottomBar.tsx";
import NavigationBar from "./components/app/NavigationBar.tsx";
import CreateSafe from "./components/createSafe/CreateSafe.tsx";
import SafeInfo from "./components/safeInfo/SafeInfo.tsx";
import AggregateSignaturesAndExecute from "./components/transaction/AggregateSignaturesAndExecute.tsx";
import ApproveSafeTransactionForm from "./components/transaction/ApproveSafeTransaction.tsx";
import ApproveTransactionHash from "./components/transaction/ApproveTransctionHash.tsx";
import CreateTransaction from "./components/transaction/CreateTransaction.tsx";
import { AddressBookProvider } from "./context/AddressBookContext";
import { WalletProvider } from "./context/WalletContext";
import AppThemeProvider from "./theme/AppThemeProvider.tsx";

function NavbarLayout() {
  return (
    <div>
      <NavigationBar />
      <Toolbar />
      <Container sx={{ minHeight: "100vh" }} maxWidth={false}>
        <Outlet />
      </Container>
    </div>
  );
}

function App() {
  return (
    <>
      <AppThemeProvider>
        <WalletProvider>
          <AddressBookProvider>
            <Router>
              <Routes>
                <Route path="/" element={<Welcome />} />
                <Route path="/welcome" element={<Welcome />} />
                <Route element={<NavbarLayout />}>
                  <Route path="/create-transaction/*" element={<CreateTransaction />} />
                  <Route path="/home" element={<Home />} />
                  <Route path="/history" element={<SafeTransactionHistory />} />
                  <Route path="/import" element={<ImportSafe />} />
                  <Route path="/add-custom-deployment" element={<AddCustomDeployment />} />
                  <Route path="/create" element={<CreateSafe />} />
                  <Route path="/approve-transaction-hash" element={<ApproveTransactionHash />} />
                  <Route path="/approve-transaction" element={<ApproveSafeTransactionForm />} />
                  <Route path="/aggregate-signatures" element={<AggregateSignaturesAndExecute />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/sign-message" element={<SignMessage />} />
                  <Route path="/safe-info" element={<SafeInfo />} />
                </Route>
              </Routes>
              <BottomBar />
            </Router>
          </AddressBookProvider>
        </WalletProvider>
      </AppThemeProvider>
    </>
  );
}
export default App;
