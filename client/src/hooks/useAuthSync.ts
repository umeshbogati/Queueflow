import { useEffect } from "react";
import { useAppDispatch } from "../store/hooks";
import { restoreAuth } from "../store/slices/authSlice";

const TOKEN_KEY = "token";
const USER_KEY = "user";
// Hook that listens for localStorage changes in other tabs and restores the auth state in this tab.
const useAuthSync = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      // key === null means localStorage.clear()
      if (
        event.key === null ||
        event.key === TOKEN_KEY ||
        event.key === USER_KEY
      ) {
        dispatch(restoreAuth());
      }
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [dispatch]);
};

export default useAuthSync;
