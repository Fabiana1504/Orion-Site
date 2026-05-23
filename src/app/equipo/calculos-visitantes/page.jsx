import ProtectedLabRoute from "../../../components/auth/ProtectedLabRoute";
import LabGuestCalcAnalyticsPage from "../../../views/LabGuestCalcAnalyticsPage";

export default function CalculosVisitantes() {
  return (
    <ProtectedLabRoute>
      <LabGuestCalcAnalyticsPage />
    </ProtectedLabRoute>
  );
}
