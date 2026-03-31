"use client";

import { Component, ReactNode } from "react";
import { Gallery } from "@/components/gallery";
import { GallerySlideshow } from "@/components/gallery-slideshow";
import { GalleryDisplayMode, GalleryImage } from "@/lib/types";

interface GalleryModeRendererProps {
  mode: GalleryDisplayMode;
  images: GalleryImage[];
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class GalleryModeErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  public state: ErrorBoundaryState = {
    hasError: false
  };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

export function GalleryModeRenderer({ mode, images }: GalleryModeRendererProps) {
  const fallback = <Gallery initialImages={images} />;

  if (mode !== "slideshow" || images.length < 2) {
    return fallback;
  }

  return (
    <GalleryModeErrorBoundary fallback={fallback}>
      <GallerySlideshow initialImages={images} />
    </GalleryModeErrorBoundary>
  );
}
