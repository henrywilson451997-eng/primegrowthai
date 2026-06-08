import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { useEffect, useRef } from "react";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import HomeFR from "./pages/HomeFR";
import ConstructionResource from "./pages/ConstructionResource";
import ConstructionResourceFR from "./pages/ConstructionResourceFR";
import JobCostingCalculator from "./pages/JobCostingCalculator";
import JobCostingCalculatorFR from "./pages/JobCostingCalculatorFR";
import Apply from "./pages/Apply";
import ApplyFR from "./pages/ApplyFR";
import AiGrowthScore from "./pages/AiGrowthScore";
import ChangeOrderBuilder from "./pages/ChangeOrderBuilder";
import RealEstateResource from "./pages/RealEstateResource";
import ResourceThankYou from "./pages/ResourceThankYou";
import ResourceThankYouFR from "./pages/ResourceThankYouFR";
import LeadMachineOnboardingFR, { LeadMachineChecklistFR } from "./pages/LeadMachineOnboardingFR";
import { trackMetaPageView } from "@/lib/metaPixel";

function MetaPixelPageViewTracker() {
  const [location] = useLocation();
  const hasSeenInitialPageView = useRef(false);

  useEffect(() => {
    if (!hasSeenInitialPageView.current) {
      hasSeenInitialPageView.current = true;
      return;
    }

    trackMetaPageView(location);
  }, [location]);

  return null;
}

function AiGrowthScoreENRoute() {
  return <AiGrowthScore />;
}

function AiGrowthScoreFRRoute() {
  return <AiGrowthScore lang="fr" />;
}

function ChangeOrderBuilderENRoute() {
  return <ChangeOrderBuilder />;
}

function ChangeOrderBuilderFRRoute() {
  return <ChangeOrderBuilder lang="fr" />;
}

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/fr"} component={HomeFR} />
      <Route path={"/resources/construction-systems"} component={ConstructionResource} />
      <Route path={"/fr/ressources/systemes-construction"} component={ConstructionResourceFR} />
      <Route path={"/resources/real-estate-systems"} component={RealEstateResource} />
      {/* Redirect short URL to full URL */}
      <Route path={"/tools/job-costing"} component={JobCostingCalculator} />
      <Route path={"/tools/job-costing-calculator"} component={JobCostingCalculator} />
      <Route path={"/fr/outils/calculateur-couts-chantier"} component={JobCostingCalculatorFR} />
      <Route path={"/tools/ai-growth-score"} component={AiGrowthScoreENRoute} />
      <Route path={"/fr/outils/calculateur-croissance-ia"} component={AiGrowthScoreFRRoute} />
      <Route path={"/tools/change-order-builder"} component={ChangeOrderBuilderENRoute} />
      <Route path={"/fr/outils/generateur-extra"} component={ChangeOrderBuilderFRRoute} />
      <Route path={"/resources/construction-systems/thank-you"} component={ResourceThankYou} />
      <Route path={"/fr/ressources/systemes-construction/merci"} component={ResourceThankYouFR} />
      <Route path={"/fr/clients/lead-machine/bienvenue"} component={LeadMachineOnboardingFR} />
      <Route path={"/fr/clients/lead-machine/checklist"} component={LeadMachineChecklistFR} />
      <Route path={"/apply"} component={Apply} />
      <Route path={"/fr/postuler"} component={ApplyFR} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <MetaPixelPageViewTracker />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
