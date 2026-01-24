"use client";

import { useActionState, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import type { ContractRegister } from "@/lib/types";

//
// Server-action-style handler compatible with useActionState (React v19).
// Accepts (prevData, formData) so it can be used directly as a form action.
//
async function registerContractPackage(
  prevData: ContractRegister | null,
  formData: FormData,
) {
  try {
    const package_hash_raw = (formData.get("package_hash") || "")
      .toString()
      .trim();
    const package_name = (formData.get("package_name") || "").toString().trim();
    const network = (formData.get("network") || "testnet").toString();

    if (!package_hash_raw) {
      return { success: false, error: "Package hash is required" };
    }

    // Clean package hash - remove "hash-" prefix if present
    let package_hash = package_hash_raw;
    if (package_hash.startsWith("hash-")) {
      package_hash = package_hash.substring(5);
    }

    // Validate hex-only
    if (!/^[a-fA-F0-9]+$/.test(package_hash)) {
      return {
        success: false,
        error:
          "Invalid package hash format. Only hexadecimal characters allowed.",
      };
    }

    if (package_hash.includes(".") || package_hash.includes("-")) {
      return {
        success: false,
        error: "Package hash should not contain dots or dashes.",
      };
    }

    const userId =
      typeof window !== "undefined" ? localStorage.getItem("user_id") : null;
    if (!userId) {
      return {
        success: false,
        error: "User ID not found. Please refresh the page.",
      };
    }

    const payload: ContractRegister = {
      package_hash,
      package_name,
      network: (network as ContractRegister["network"]) || "testnet",
    };

    const res = await fetch(`/api/v1/u/${userId}/contract/register`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const json = await res.json().catch(() => null);

    if (!res.ok) {
      const message =
        json?.error ||
        json?.message ||
        `Registration failed (${res?.status || res.status})`;
      return { success: false, error: message };
    }

    if (!json?.success) {
      let errorMessage = json?.error || "Registration failed";
      if (
        errorMessage.includes("Base16DecodeError") ||
        errorMessage.includes("InvalidByte")
      ) {
        errorMessage =
          "Invalid contract package hash. This hash may not exist on the selected network or may not be a valid contract package hash.";
      } else if (
        errorMessage.includes("does not correspond to contract package")
      ) {
        errorMessage =
          "This hash is not a valid contract package on the selected network.";
      }
      return { success: false, error: errorMessage };
    }

    // Return cleaned hash so client can navigate
    return {
      success: true,
      message: json.message || "Registered successfully",
      cleaned_hash: package_hash,
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

type RegisterFormProps = {
  formAction: any;
  isPending: boolean;
  response?: any;
};

const RegisterForm: React.FC<RegisterFormProps> = ({
  formAction,
  isPending,
  response,
}) => {
  // Form uses declarative action provided by `useActionState` (formAction)
  // Inputs use uncontrolled/defaultValue so that the formAction FormData picks up values naturally.
  return (
    <form id="register-form" action={formAction} className="space-y-4">
      <div>
        <label
          htmlFor="package_hash"
          className="block text-sm font-medium text-muted-foreground mb-1"
        >
          Contract Package Hash
        </label>
        <Input
          id="package_hash"
          name="package_hash"
          defaultValue=""
          placeholder="e.g. hash-abcdef1234 or abcdef1234"
          required
        />
        <p className="text-xs text-muted-foreground mt-1">
          E.g.: hash-abcdef123... or just abcdef123... (hexadecimal only)
        </p>
      </div>

      <div>
        <label
          htmlFor="package_name"
          className="block text-sm font-medium text-muted-foreground mb-1"
        >
          Contract Package Name
        </label>
        <Input
          id="package_name"
          name="package_name"
          defaultValue=""
          placeholder="Enter package display name"
          required
        />
      </div>

      {/* Hidden network field - default to testnet */}
      <input type="hidden" name="network" value="testnet" />

      <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg text-sm text-blue-400">
        Note: By default, testnet is used. Please ensure you enter the correct
        contract package hash for the testnet network.
      </div>

      {/* Response feedback rendered inside the form so user sees it before redirect */}
      {response?.message && (
        <div className="mt-2 rounded-md border border-green-300 bg-green-50 p-2 text-sm text-green-700">
          {response.message}
        </div>
      )}

      {response?.error && (
        <div className="mt-2 rounded-md border border-destructive bg-destructive/10 p-2 text-sm text-destructive">
          {response.error}
        </div>
      )}
    </form>
  );
};

export const Register: React.FC = () => {
  // useActionState in parent: provide the action and get response, formAction, isPending
  const [response, formAction, isPending] = useActionState(
    registerContractPackage,
    null as any,
  );

  // Redirect on success (use cleaned_hash returned by the action)
  useEffect(() => {
    if (response?.success && response.cleaned_hash) {
      // small delay so the success UI is visible briefly
      setTimeout(() => {
        window.location.href = `/contract/${response.cleaned_hash}`;
      }, 300);
    }
  }, [response]);

  // Make drawer direction responsive: bottom on small screens, right on lg+ (1024px)
  const [direction, setDirection] = useState<"bottom" | "right">("bottom");
  useEffect(() => {
    const updateDirection = () => {
      setDirection(window.innerWidth >= 1024 ? "right" : "bottom");
    };
    updateDirection();
    window.addEventListener("resize", updateDirection);
    return () => window.removeEventListener("resize", updateDirection);
  }, []);

  return (
    <Drawer direction={direction}>
      <DrawerTrigger asChild>
        <Button variant="outline">Register</Button>
      </DrawerTrigger>

      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle className="text-lg font-medium">Register</DrawerTitle>
          <DrawerDescription>
            Create a new contract package by filling out the form below.
          </DrawerDescription>
        </DrawerHeader>

        <div className="p-4">
          {/* pass form action and pending state down to the form */}
          <RegisterForm
            formAction={formAction}
            isPending={isPending}
            response={response}
          />
        </div>

        <DrawerFooter className="sticky bottom-0 w-full bg-background/50 backdrop-blur-sm border-t">
          {/* Submit button sits in the footer and targets the form by id */}
          <Button
            type="submit"
            form="register-form"
            className="w-full"
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Spinner /> <span className="ml-2">Registering...</span>
              </>
            ) : (
              "Register Contract"
            )}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};
