import ProtectedLabRoute from "../../../components/auth/ProtectedLabRoute";
import TeamLabEssentialsPage from "../../../views/TeamLabEssentialsPage";

export default function Laboratorio() {
  return (
    <ProtectedLabRoute>
      <TeamLabEssentialsPage />
    </ProtectedLabRoute>
  );
}
