"use client";
import { Suspense } from "react";
import AnalysisContent from "./AnalysisContent";

export default function Analysis() {
  return (
    <Suspense fallback={<div className="text-center p-10">Loading...</div>}>
      <AnalysisContent />
    </Suspense>
  );
}