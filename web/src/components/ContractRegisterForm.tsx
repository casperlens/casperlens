"use client";

import type { ContractRegister, ContractRegisterRes } from "@/types";
import { Button } from "@base-ui/react";
import { Dialog } from "@base-ui/react/dialog";
import { Field } from "@base-ui/react/field";
import { Form } from "@base-ui/react/form";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function ContractRegisterForm() {
  const router = useRouter();
  const [formData, setFormData] = useState<ContractRegister>({
    package_hash: "",
    package_name: "",
    network: "testnet",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [open, setOpen] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear field error when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");
    setError("");
    setErrors({});

    try {
      const userId = localStorage.getItem("user_id");
      if (!userId) {
        throw new Error("User ID not found. Please refresh the page.");
      }

      // Clean package hash - remove "hash-" prefix if present and validate format
      let packageHash = formData.package_hash.trim();
      if (packageHash.startsWith("hash-")) {
        packageHash = packageHash.substring(5);
      }

      // Validate hash format (should be hex only)
      if (!/^[a-fA-F0-9]+$/.test(packageHash)) {
        setErrors({
          package_hash:
            "Invalid package hash format. Should only contain hexadecimal characters (0-9, a-f, A-F).",
        });
        setIsLoading(false);
        return;
      }

      // Additional check for any dots or special characters
      if (packageHash.includes(".") || packageHash.includes("-")) {
        setErrors({
          package_hash:
            "Package hash should not contain dots or dashes. Remove any special characters.",
        });
        setIsLoading(false);
        return;
      }

      const payload = {
        package_hash: packageHash,
        package_name: formData.package_name,
        network: "testnet",
      };

      const response = await fetch(`/api/v1/u/${userId}/contract/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const result: ContractRegisterRes = await response.json();

      if (result.success) {
        setMessage(result.message);
        setFormData({
          package_hash: "",
          package_name: "",
          network: "testnet",
        });
        // Close dialog after 2 seconds
        setTimeout(() => {
          setMessage("");
        }, 2000);
        setOpen(false);
        router.push(`/contracts/${formData.package_hash}`);
      } else {
        // Provide more user-friendly error messages
        let errorMessage = result.error || "Registration failed";

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

        setError(errorMessage);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger
        type="button"
        className="border-primary border px-2 py-1 rounded-xl text-white hover:bg-primary hover:text-primary-darker transition-colors"
      >
        Register Contract
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 bg-black/80 transition-opacity duration-200 data-starting-style:opacity-0 data-ending-style:opacity-0" />
        <Dialog.Popup className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg mx-4 p-6 rounded-xl border bg-card border-primary transition-all duration-200 data-starting-style:scale-95 data-starting-style:opacity-0 data-ending-style:scale-95 data-ending-style:opacity-0">
          <div className="flex justify-between items-center mb-6">
            <Dialog.Title className="text-xl font-bold text-primary">
              Register Contract Package
            </Dialog.Title>
            <Dialog.Close className="text-muted hover:text-primary transition-colors p-1 rounded hover:bg-tertiary">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </Dialog.Close>
          </div>

          <Form onSubmit={handleSubmit} errors={errors} className="space-y-4">
            <Field.Root name="package_hash">
              <Field.Label className="block text-sm font-medium text-secondary mb-2">
                Contract Package Hash
              </Field.Label>
              <Field.Control
                render={(props) => (
                  <input
                    {...props}
                    type="text"
                    value={formData.package_hash}
                    onChange={handleInputChange}
                    placeholder="Enter package hash"
                    required
                    className="w-full px-3 py-2 bg-tertiary border border-primary rounded-lg text-primary placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-transparent transition-all"
                  />
                )}
              />
              <Field.Description className="text-xs text-muted mt-1 px-1">
                E.g.: hash-abcdef123... or just abcdef123... (hexadecimal only)
              </Field.Description>
              <Field.Error
                match="valueMissing"
                className="text-xs text-error mt-1"
              >
                Package hash is required
              </Field.Error>
              <Field.Error match={true} className="text-xs text-error mt-1" />
            </Field.Root>

            <Field.Root name="package_name">
              <Field.Label className="block text-sm font-medium text-secondary mb-2">
                Contract Package Name
              </Field.Label>
              <Field.Control
                render={(props) => (
                  <input
                    {...props}
                    type="text"
                    value={formData.package_name}
                    onChange={handleInputChange}
                    placeholder="Enter package name"
                    required
                    className="w-full px-3 py-2 bg-tertiary border border-primary rounded-lg text-primary placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-transparent transition-all"
                  />
                )}
              />
              <Field.Error
                match="valueMissing"
                className="text-xs text-error mt-1"
              >
                Package name is required
              </Field.Error>
            </Field.Root>

            <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <p className="text-sm text-blue-400">
                <strong>Note:</strong> By default, testnet is used. Please ensure you enter the correct contract package hash for the testnet network.
              </p>
            </div>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 px-4 bg-primary text-gray-900 rounded-lg hover:bg-primary-light disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
            >
              {isLoading ? "Registering..." : "Register Contract"}
            </Button>
          </Form>

          {message && (
            <div className="mt-4 p-3 badge-success border border-success rounded-lg">
              <p className="text-sm">{message}</p>
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 badge-error border border-error rounded-lg">
              <p className="text-sm">{error}</p>
            </div>
          )}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
