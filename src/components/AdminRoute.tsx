import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";

const adminUID = import.meta.env.VITE_ADMIN_UID || "nPIAdCYivzflUvIZO1PST0UJPIx1";

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute = ({ children }: AdminRouteProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [authChecked, setAuthChecked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    console.log('🔐 [AdminRoute] Mounting, path:', location.pathname);

    // Wait for Firebase to restore auth state
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('🔐 [AdminRoute] onAuthStateChanged fired');
      console.log('🔐 [AdminRoute] User:', user?.uid);
      console.log('🔐 [AdminRoute] Admin UID:', adminUID);

      if (!user) {
        console.log('🔐 [AdminRoute] ❌ No user, redirecting to login');
        setIsAdmin(false);
        setAuthChecked(true);
        navigate("/admin/login", { replace: true, state: { from: location } });
        return;
      }

      if (user.uid !== adminUID) {
        console.log('🔐 [AdminRoute] ❌ User is not admin:', user.uid, '!==', adminUID);
        setIsAdmin(false);
        setAuthChecked(true);
        navigate("/admin/login", { replace: true, state: { from: location } });
        return;
      }

      console.log('🔐 [AdminRoute] ✅ User is admin! Granting access');
      setIsAdmin(true);
      setAuthChecked(true);
    });

    return () => {
      console.log('🔐 [AdminRoute] Cleanup');
      unsubscribe();
    };
  }, [navigate, location]);

  // Show loading while checking auth
  if (!authChecked) {
    console.log('🔐 [AdminRoute] Auth not checked yet, showing loading...');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  // If not admin after check, return null (already navigated)
  if (!isAdmin) {
    console.log('🔐 [AdminRoute] Not admin after check, returning null');
    return null;
  }

  console.log('🔐 [AdminRoute] ✅ Rendering admin content');
  return <>{children}</>;
};

export default AdminRoute;