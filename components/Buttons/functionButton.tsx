"use client";
import { Button } from "@mui/material";
import { useRouter } from "next/navigation";
import React from "react";

function NavigateButton({
  buttonText,
  variant,
  navigateTo,
}: {
  buttonText: string;
  variant: "text" | "outlined" | "contained";
  navigateTo: string;
}) {
  const router = useRouter();
  return (
    <Button
      onClick={() => {
        router.push(navigateTo);
      }}
      variant={variant}
    >
      {buttonText}
    </Button>
  );
}

export default NavigateButton;
