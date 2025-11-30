import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";

const adminUID = import.meta.env.VITE_ADMIN_UID || "nPIAdCYivzflUvIZO1PST0UJPIx1";

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute = ({ children }: AdminRouteProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const { firebaseUser, loading: authLoading } = useAuth();

  // Debug logs
  console.log('🔐 [AdminRoute] =========================');
  console.log('🔐 [AdminRoute] Path:', location.pathname);
  console.log('🔐 [AdminRoute] firebaseUser:', firebaseUser);
  console.log('🔐 [AdminRoute] firebaseUser UID:', firebaseUser?.uid);
  console.log('🔐 [AdminRoute] authLoading:', authLoading);
  console.log('🔐 [AdminRoute] loading:', loading);
  console.log('🔐 [AdminRoute] Admin UID from env:', adminUID);
  console.log('🔐 [AdminRoute] Is Admin:', firebaseUser?.uid === adminUID);
  console.log('🔐 [AdminRoute] =========================');

  useEffect(() => {
    console.log('🔐 [AdminRoute] useEffect triggered');

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('🔐 [AdminRoute] onAuthStateChanged - user:', user?.uid);

      if (!user) {
        console.log('🔐 [AdminRoute] No user found, redirecting to login');
        setIsAdmin(false);
        setLoading(false);
        navigate("/admin/login", { replace: true });
        return;
      }

      if (user.uid !== adminUID) {
        console.log('🔐 [AdminRoute] User is not admin:', user.uid, '!==', adminUID);
        setIsAdmin(false);
        setLoading(false);
        navigate("/admin/login", { replace: true });
        return;
      }

      console.log('🔐 [AdminRoute] ✅ User is admin! Granting access');
      setIsAdmin(true);
      setLoading(false);
    });

    return () => {
      console.log('🔐 [AdminRoute] Cleanup - unsubscribing');
      unsubscribe();
    };
  }, [navigate]);

  if (loading || authLoading) {
    console.log('🔐 [AdminRoute] Showing loading state');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    console.log('🔐 [AdminRoute] Not admin, returning null (should redirect)');
    return null;
  }

  console.log('🔐 [AdminRoute] ✅ Rendering admin content');
  return <>{children}</>;
};

export default AdminRoute;
