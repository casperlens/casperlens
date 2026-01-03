"use client";

import { Button } from "@base-ui/react";
import { useState } from "react";
import type { ContractRegister, ContractRegisterRes } from "@/types";

interface ContractRegisterFormProps {
  onClose: () => void;
}

export function ContractRegisterForm({ onClose }: ContractRegisterFormProps) {
  const [formData, setFormData] = useState<ContractRegister>({
    package_hash: "",
    package_name: "",
    network: "mainnet",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<string>("");

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");
    setError("");

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
        throw new Error(
          "Invalid package hash format. Should only contain hexadecimal characters (0-9, a-f, A-F).",
        );
      }

      // Additional check for any dots or special characters
      if (packageHash.includes(".") || packageHash.includes("-")) {
        throw new Error(
          "Package hash should not contain dots or dashes. Remove any special characters.",
        );
      }

      const payload = {
        package_hash: packageHash,
        package_name: formData.package_name,
        network: formData.network,
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
          network: "mainnet",
        });
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="max-w-md w-full mx-4 p-6 rounded-xl border bg-[#0e0e0e] border-gray-800">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-300">
            Register Contract Package
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-300 transition-colors"
            aria-label="Close modal"
          >
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
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="package_hash"
              className="block text-sm font-medium text-gray-400 mb-2"
            >
              Contract Package Hash
            </label>
            <input
              type="text"
              id="package_hash"
              name="package_hash"
              value={formData.package_hash}
              onChange={handleInputChange}
              placeholder="Enter package hash (hex format or hash-<hash>)"
              required
              className="w-full px-3 py-2 bg-black border border-gray-700 rounded-lg text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter either: hash-abcdef123... or just abcdef123... (hexadecimal
              only)
            </p>
          </div>

          <div>
            <label
              htmlFor="package_name"
              className="block text-sm font-medium text-gray-400 mb-2"
            >
              Contract Package Name
            </label>
            <input
              type="text"
              id="package_name"
              name="package_name"
              value={formData.package_name}
              onChange={handleInputChange}
              placeholder="Enter package name"
              required
              className="w-full px-3 py-2 bg-black border border-gray-700 rounded-lg text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label
              htmlFor="network"
              className="block text-sm font-medium text-gray-400 mb-2"
            >
              Network
            </label>
            <select
              id="network"
              name="network"
              value={formData.network}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-black border border-gray-700 rounded-lg text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="mainnet">Mainnet</option>
              <option value="testnet">Testnet</option>
            </select>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? "Registering..." : "Register Contract"}
          </Button>
        </form>

        {message && (
          <div className="mt-4 p-3 bg-green-900 border border-green-700 rounded-lg">
            <p className="text-green-400 text-sm">{message}</p>
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 bg-red-900 border border-red-700 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
